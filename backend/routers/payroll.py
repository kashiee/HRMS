"""
Payroll management endpoints with calculations and payslip generation
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Response
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from pathlib import Path
import json
# PDF generation imports
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from io import BytesIO

from database import get_db
from models import (
    Employee, Payslip, PayslipCreate, PayslipResponse,
    Company, Department, EmployeeRecord
)
from services.calc import calculate_payroll
from services.gdpr import mask_sensitive_data
from mocks.hmrc import submit_rti_return
from mocks.bacs import generate_bacs_file

router = APIRouter()

@router.post("/calculate", response_model=PayslipResponse, status_code=status.HTTP_201_CREATED)
async def calculate_payslip(
    payslip_data: PayslipCreate,
    db: Session = Depends(get_db)
):
    """
    Calculate payslip for an employee
    """
    # Verify employee exists and is active
    employee = db.query(Employee).filter(
        Employee.id == payslip_data.employee_id,
        Employee.is_active == True
    ).first()
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active employee not found"
        )
    
    # Convert string dates to date objects
    payslip_dict = payslip_data.dict()
    payslip_dict['pay_period_start'] = datetime.strptime(payslip_data.pay_period_start, '%Y-%m-%d').date()
    payslip_dict['pay_period_end'] = datetime.strptime(payslip_data.pay_period_end, '%Y-%m-%d').date()
    payslip_dict['pay_date'] = datetime.strptime(payslip_data.pay_date, '%Y-%m-%d').date()
    
    # Calculate payroll using the service
    try:
        calculation_result = await calculate_payroll(employee, payslip_dict)
        payslip_dict.update(calculation_result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payroll calculation failed: {str(e)}"
        )
    
    # Create payslip record
    payslip = Payslip(**payslip_dict)
    db.add(payslip)
    db.commit()
    db.refresh(payslip)
    
    return payslip

@router.post("/batch", status_code=status.HTTP_202_ACCEPTED)
async def run_batch_payroll(
    company_id: int,
    pay_period_start: str,
    pay_period_end: str,
    pay_date: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Run payroll for all employees from EmployeeRecord data (CSV uploads)
    """
    # Get all employee records from CSV uploads
    employee_records = db.query(EmployeeRecord).all()
    
    if not employee_records:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No employee records found. Please upload employee CSV first."
        )
    
    # Convert dates
    start_date = datetime.strptime(pay_period_start, '%Y-%m-%d').date()
    end_date = datetime.strptime(pay_period_end, '%Y-%m-%d').date()
    pay_date_obj = datetime.strptime(pay_date, '%Y-%m-%d').date()
    
    # Add background task for batch processing
    background_tasks.add_task(
        process_batch_payroll_from_records,
        company_id,
        employee_records,
        start_date,
        end_date,
        pay_date_obj,
        db
    )
    
    return {
        "message": "Batch payroll processing started from employee records",
        "company_id": company_id,
        "employee_count": len(employee_records),
        "pay_period": f"{pay_period_start} to {pay_period_end}",
        "pay_date": pay_date
    }

async def process_batch_payroll_from_records(
    company_id: int,
    employee_records: List[EmployeeRecord],
    start_date: date,
    end_date: date,
    pay_date: date,
    db: Session
):
    """
    Background task to process batch payroll from EmployeeRecord data
    """
    payslips_created = []
    
    for record in employee_records:
        try:
            # Extract salary from taxable pay or use default
            try:
                salary = float(record.taxable_pay_this_employment or 45000)
            except (ValueError, TypeError):
                salary = 45000
            
            # Calculate basic pay (monthly salary / 12)
            monthly_salary = salary / 12
            basic_pay = monthly_salary
            
            # Create a proper employee object for payroll calculation
            class EmployeeRecordEmployee:
                def __init__(self, record, salary):
                    self.id = record.id
                    self.salary = salary
                    self.tax_code = record.tax_code or 'BR'
                    self.national_insurance_number = record.ni_number or 'AB123456C'
                    self.first_name = record.forename or 'Unknown'
                    self.last_name = record.surname or 'Employee'
                    self.pension_scheme = 'auto_enrolment'
                    self.pension_contribution = 0.05
            
            employee_obj = EmployeeRecordEmployee(record, salary)
            
            payslip_data = {
                'employee_id': record.id,  # Use EmployeeRecord ID
                'pay_period_start': start_date,
                'pay_period_end': end_date,
                'pay_date': pay_date,
                'basic_pay': basic_pay,
                'overtime_pay': 0.0,
                'bonus_pay': 0.0,
                'other_pay': 0.0
            }
            
            # Calculate payroll using the employee object
            calculation_result = await calculate_payroll(employee_obj, payslip_data)
            payslip_data.update(calculation_result)
            
            # Create payslip
            payslip = Payslip(**payslip_data)
            db.add(payslip)
            payslips_created.append(payslip)
            
        except Exception as e:
            print(f"Failed to process payroll for employee record {record.reference}: {e}")
            import traceback
            traceback.print_exc()
            continue
    
    db.commit()
    print(f"Created {len(payslips_created)} payslips from employee records")
    
    # Generate BACS file for all payslips
    try:
        bacs_file_path = await generate_bacs_file(payslips_created, company_id)
        print(f"BACS file generated: {bacs_file_path}")
    except Exception as e:
        print(f"Failed to generate BACS file: {e}")

@router.get("/payslips")
async def get_payslips(
    skip: int = 0,
    limit: int = 100,
    company_id: Optional[int] = None,
    employee_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Get payslips with optional filtering
    """
    try:
        query = db.query(Payslip)
        
        if company_id:
            query = query.join(Employee).filter(Employee.company_id == company_id)
        
        if employee_id:
            query = query.filter(Payslip.employee_id == employee_id)
        
        payslips = query.offset(skip).limit(limit).all()
        
        # Convert to dictionary format for frontend
        payslip_list = []
        for payslip in payslips:
            # Get employee name from EmployeeRecord (CSV data)
            employee_record = db.query(EmployeeRecord).filter(EmployeeRecord.id == payslip.employee_id).first()
            if employee_record:
                employee_name = f"{employee_record.forename or ''} {employee_record.surname or ''}".strip()
                if not employee_name:
                    employee_name = f"Employee {employee_record.reference}"
            else:
                # Fallback to Employee table (legacy data)
                employee = db.query(Employee).filter(Employee.id == payslip.employee_id).first()
                employee_name = f"{employee.first_name} {employee.last_name}" if employee else "Unknown Employee"
            
            payslip_list.append({
                "id": payslip.id,
                "employee_id": payslip.employee_id,
                "employee_name": employee_name,
                "pay_period_start": payslip.pay_period_start.isoformat(),
                "pay_period_end": payslip.pay_period_end.isoformat(),
                "pay_date": payslip.pay_date.isoformat(),
                "basic_pay": payslip.basic_pay,
                "overtime_pay": payslip.overtime_pay,
                "bonus_pay": payslip.bonus_pay,
                "other_pay": payslip.other_pay,
                "gross_pay": payslip.gross_pay,
                "paye_tax": payslip.paye_tax,
                "national_insurance": payslip.national_insurance,
                "pension_contribution": payslip.pension_contribution,
                "student_loan": payslip.student_loan,
                "other_deductions": payslip.other_deductions,
                "net_pay": payslip.net_pay,
                "rti_submitted": payslip.rti_submitted,
                "rti_reference": payslip.rti_reference,
                "created_at": payslip.created_at.isoformat(),
                "updated_at": payslip.updated_at.isoformat()
            })
        
        return payslip_list
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve payslips: {str(e)}"
        )

@router.delete("/payslips", status_code=status.HTTP_200_OK)
async def clear_payslips(db: Session = Depends(get_db)):
    """
    Clear all payslips (for testing/reset purposes)
    """
    try:
        db.query(Payslip).delete()
        db.commit()
        return {"message": "All payslips cleared successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear payslips: {str(e)}"
        )

@router.get("/payslips/{payslip_id}", response_model=PayslipResponse)
async def get_payslip(
    payslip_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific payslip by ID
    """
    payslip = db.query(Payslip).filter(Payslip.id == payslip_id).first()
    if not payslip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payslip not found"
        )
    return payslip

@router.post("/payslips/{payslip_id}/rti", status_code=status.HTTP_200_OK)
async def submit_rti(
    payslip_id: int,
    db: Session = Depends(get_db)
):
    """
    Submit RTI return for a payslip
    """
    payslip = db.query(Payslip).filter(Payslip.id == payslip_id).first()
    if not payslip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payslip not found"
        )
    
    if payslip.rti_submitted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="RTI already submitted for this payslip"
        )
    
    # Get employee and company data
    employee = db.query(Employee).filter(Employee.id == payslip.employee_id).first()
    company = db.query(Company).filter(Company.id == employee.company_id).first()
    
    # Prepare RTI data (with GDPR masking)
    rti_data = {
        'employee': {
            'ni_number': mask_sensitive_data(employee.national_insurance_number),
            'tax_code': employee.tax_code,
            'gross_pay': payslip.gross_pay,
            'paye_tax': payslip.paye_tax,
            'ni_contribution': payslip.national_insurance
        },
        'company': {
            'registration_number': company.registration_number,
            'tax_office': company.tax_office
        },
        'pay_period': {
            'start_date': payslip.pay_period_start.isoformat(),
            'end_date': payslip.pay_period_end.isoformat(),
            'pay_date': payslip.pay_date.isoformat()
        }
    }
    
    # Submit RTI (mock)
    try:
        rti_response = await submit_rti_return(rti_data)
        
        # Update payslip with RTI reference
        payslip.rti_submitted = True
        payslip.rti_reference = rti_response.get('reference')
        payslip.updated_at = datetime.now()
        db.commit()
        
        return {
            "message": "RTI submitted successfully",
            "rti_reference": rti_response.get('reference'),
            "submission_date": datetime.now().isoformat(),
            "status": "accepted"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"RTI submission failed: {str(e)}"
        )

@router.post("/payslips/{payslip_id}/download")
async def download_payslip(
    payslip_id: int,
    db: Session = Depends(get_db)
):
    """
    Generate and download payslip PDF using WeasyPrint
    """
    payslip = db.query(Payslip).filter(Payslip.id == payslip_id).first()
    if not payslip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payslip not found"
        )
    
    employee = db.query(Employee).filter(Employee.id == payslip.employee_id).first()
    company = db.query(Company).filter(Company.id == employee.company_id).first()
    
    # Generate HTML for payslip
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Payslip - {employee.first_name} {employee.last_name}</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                color: #333;
            }}
            .header {{
                text-align: center;
                border-bottom: 2px solid #007bff;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }}
            .company-name {{
                font-size: 24px;
                font-weight: bold;
                color: #007bff;
                margin-bottom: 5px;
            }}
            .payslip-title {{
                font-size: 18px;
                color: #666;
            }}
            .employee-info {{
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
            }}
            .info-section {{
                flex: 1;
            }}
            .info-section h3 {{
                margin: 0 0 10px 0;
                color: #007bff;
                font-size: 16px;
            }}
            .info-row {{
                margin: 5px 0;
                font-size: 14px;
            }}
            .pay-period {{
                background: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 30px;
            }}
            .pay-period h3 {{
                margin: 0 0 10px 0;
                color: #007bff;
            }}
            .earnings-deductions {{
                display: flex;
                gap: 30px;
                margin-bottom: 30px;
            }}
            .section {{
                flex: 1;
                border: 1px solid #ddd;
                border-radius: 5px;
                padding: 20px;
            }}
            .section h3 {{
                margin: 0 0 15px 0;
                color: #007bff;
                border-bottom: 1px solid #ddd;
                padding-bottom: 10px;
            }}
            .amount-row {{
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                font-size: 14px;
            }}
            .total-row {{
                border-top: 2px solid #007bff;
                margin-top: 15px;
                padding-top: 15px;
                font-weight: bold;
                font-size: 16px;
            }}
            .net-pay {{
                background: #28a745;
                color: white;
                padding: 10px;
                border-radius: 5px;
                text-align: center;
                margin-top: 20px;
            }}
            .footer {{
                margin-top: 30px;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-top: 1px solid #ddd;
                padding-top: 20px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-name">{company.name}</div>
            <div class="payslip-title">PAYSLIP</div>
        </div>
        
        <div class="employee-info">
            <div class="info-section">
                <h3>Employee Details</h3>
                <div class="info-row"><strong>Name:</strong> {employee.first_name} {employee.last_name}</div>
                <div class="info-row"><strong>Employee No:</strong> {employee.employee_number}</div>
                <div class="info-row"><strong>NI Number:</strong> {employee.national_insurance_number}</div>
                <div class="info-row"><strong>Tax Code:</strong> {employee.tax_code}</div>
            </div>
            <div class="info-section">
                <h3>Company Details</h3>
                <div class="info-row"><strong>Company:</strong> {company.name}</div>
                <div class="info-row"><strong>PAYE Ref:</strong> {company.registration_number}</div>
                <div class="info-row"><strong>Tax Office:</strong> {company.tax_office}</div>
            </div>
        </div>
        
        <div class="pay-period">
            <h3>Pay Period</h3>
            <div class="info-row"><strong>Period:</strong> {payslip.pay_period_start} to {payslip.pay_period_end}</div>
            <div class="info-row"><strong>Pay Date:</strong> {payslip.pay_date}</div>
        </div>
        
        <div class="earnings-deductions">
            <div class="section">
                <h3>Earnings</h3>
                <div class="amount-row">
                    <span>Basic Pay:</span>
                    <span>£{payslip.basic_pay:,.2f}</span>
                </div>
                <div class="amount-row">
                    <span>Overtime:</span>
                    <span>£{payslip.overtime_pay:,.2f}</span>
                </div>
                <div class="amount-row">
                    <span>Bonus:</span>
                    <span>£{payslip.bonus_pay:,.2f}</span>
                </div>
                <div class="amount-row">
                    <span>Other Pay:</span>
                    <span>£{payslip.other_pay:,.2f}</span>
                </div>
                <div class="amount-row total-row">
                    <span>Gross Pay:</span>
                    <span>£{payslip.gross_pay:,.2f}</span>
                </div>
            </div>
            
            <div class="section">
                <h3>Deductions</h3>
                <div class="amount-row">
                    <span>PAYE Tax:</span>
                    <span>£{payslip.paye_tax:,.2f}</span>
                </div>
                <div class="amount-row">
                    <span>National Insurance:</span>
                    <span>£{payslip.national_insurance:,.2f}</span>
                </div>
                <div class="amount-row">
                    <span>Pension:</span>
                    <span>£{payslip.pension_contribution:,.2f}</span>
                </div>
                <div class="amount-row">
                    <span>Student Loan:</span>
                    <span>£{payslip.student_loan:,.2f}</span>
                </div>
                <div class="amount-row">
                    <span>Other Deductions:</span>
                    <span>£{payslip.other_deductions:,.2f}</span>
                </div>
                <div class="amount-row total-row">
                    <span>Total Deductions:</span>
                    <span>£{payslip.paye_tax + payslip.national_insurance + payslip.pension_contribution + payslip.student_loan + payslip.other_deductions:,.2f}</span>
                </div>
            </div>
        </div>
        
        <div class="net-pay">
            <h3>Net Pay: £{payslip.net_pay:,.2f}</h3>
        </div>
        
        <div class="footer">
            <p>This payslip was generated automatically by the HRMS system.</p>
            <p>Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
        </div>
    </body>
    </html>
    """
    
    try:
        # Generate PDF using ReportLab
        print(f"Generating PDF for payslip {payslip_id}")
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        story = []
        
        # Get styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#007bff')
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            spaceAfter=12,
            textColor=colors.HexColor('#007bff')
        )
        
        normal_style = styles['Normal']
        
        # Company header
        story.append(Paragraph(f"{company.name}", title_style))
        story.append(Paragraph("PAYSLIP", title_style))
        story.append(Spacer(1, 20))
        
        # Employee and Company details
        employee_data = [
            ['Employee Details', 'Company Details'],
            ['Name:', f"{employee.first_name} {employee.last_name}", 'Company:', company.name],
            ['Employee No:', employee.employee_number, 'PAYE Ref:', company.registration_number],
            ['NI Number:', employee.national_insurance_number, 'Tax Office:', company.tax_office],
            ['Tax Code:', employee.tax_code, '', '']
        ]
        
        employee_table = Table(employee_data, colWidths=[1.5*inch, 2*inch, 1.5*inch, 2*inch])
        employee_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f8f9fa')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#007bff')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(employee_table)
        story.append(Spacer(1, 20))
        
        # Pay period
        story.append(Paragraph("Pay Period", heading_style))
        period_data = [
            ['Period:', f"{payslip.pay_period_start} to {payslip.pay_period_end}"],
            ['Pay Date:', f"{payslip.pay_date}"]
        ]
        period_table = Table(period_data, colWidths=[1.5*inch, 4*inch])
        period_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f8f9fa')),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#007bff')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        story.append(period_table)
        story.append(Spacer(1, 20))
        
        # Earnings and Deductions
        earnings_data = [
            ['Earnings', 'Amount'],
            ['Basic Pay:', f"£{payslip.basic_pay:,.2f}"],
            ['Overtime:', f"£{payslip.overtime_pay:,.2f}"],
            ['Bonus:', f"£{payslip.bonus_pay:,.2f}"],
            ['Other Pay:', f"£{payslip.other_pay:,.2f}"],
            ['', ''],
            ['Gross Pay:', f"£{payslip.gross_pay:,.2f}"]
        ]
        
        deductions_data = [
            ['Deductions', 'Amount'],
            ['PAYE Tax:', f"£{payslip.paye_tax:,.2f}"],
            ['National Insurance:', f"£{payslip.national_insurance:,.2f}"],
            ['Pension:', f"£{payslip.pension_contribution:,.2f}"],
            ['Student Loan:', f"£{payslip.student_loan:,.2f}"],
            ['Other Deductions:', f"£{payslip.other_deductions:,.2f}"],
            ['', ''],
            ['Total Deductions:', f"£{payslip.paye_tax + payslip.national_insurance + payslip.pension_contribution + payslip.student_loan + payslip.other_deductions:,.2f}"]
        ]
        
        # Create side-by-side tables
        earnings_table = Table(earnings_data, colWidths=[2.5*inch, 1.5*inch])
        earnings_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#007bff')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (1, 1), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, 6), (-1, 6), colors.HexColor('#28a745')),
            ('TEXTCOLOR', (0, 6), (-1, 6), colors.white),
            ('FONTNAME', (0, 6), (-1, 6), 'Helvetica-Bold'),
        ]))
        
        deductions_table = Table(deductions_data, colWidths=[2.5*inch, 1.5*inch])
        deductions_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#dc3545')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (1, 1), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, 7), (-1, 7), colors.HexColor('#dc3545')),
            ('TEXTCOLOR', (0, 7), (-1, 7), colors.white),
            ('FONTNAME', (0, 7), (-1, 7), 'Helvetica-Bold'),
        ]))
        
        # Add tables side by side
        story.append(Paragraph("Earnings & Deductions", heading_style))
        combined_table = Table([[earnings_table, deductions_table]], colWidths=[4*inch, 4*inch])
        combined_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        story.append(combined_table)
        story.append(Spacer(1, 20))
        
        # Net Pay
        net_pay_style = ParagraphStyle(
            'NetPay',
            parent=styles['Heading1'],
            fontSize=16,
            spaceAfter=20,
            alignment=TA_CENTER,
            textColor=colors.white,
            backColor=colors.HexColor('#28a745')
        )
        story.append(Paragraph(f"Net Pay: £{payslip.net_pay:,.2f}", net_pay_style))
        
        # Footer
        story.append(Spacer(1, 30))
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=8,
            alignment=TA_CENTER,
            textColor=colors.grey
        )
        story.append(Paragraph("This payslip was generated automatically by the HRMS system.", footer_style))
        story.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", footer_style))
        
        # Build PDF
        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        
        print(f"PDF generated successfully, size: {len(pdf_bytes)} bytes")
        
        # Return PDF as response
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=payslip-{employee.employee_number}-{payslip.pay_period_start}.pdf"
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF: {str(e)}"
        )

@router.get("/summary/{company_id}")
async def get_payroll_summary(
    company_id: int,
    pay_period_start: Optional[str] = None,
    pay_period_end: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get payroll summary for a company
    """
    # Verify company exists
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Build query
    query = db.query(Payslip).join(Employee).filter(Employee.company_id == company_id)
    
    if pay_period_start and pay_period_end:
        start_date = datetime.strptime(pay_period_start, '%Y-%m-%d').date()
        end_date = datetime.strptime(pay_period_end, '%Y-%m-%d').date()
        query = query.filter(
            Payslip.pay_period_start >= start_date,
            Payslip.pay_period_end <= end_date
        )
    
    payslips = query.all()
    
    # Calculate summary
    total_gross_pay = sum(p.gross_pay for p in payslips)
    total_paye_tax = sum(p.paye_tax for p in payslips)
    total_ni = sum(p.national_insurance for p in payslips)
    total_pension = sum(p.pension_contribution for p in payslips)
    total_net_pay = sum(p.net_pay for p in payslips)
    
    return {
        "company_id": company_id,
        "company_name": company.name,
        "pay_period": {
            "start": pay_period_start,
            "end": pay_period_end
        },
        "summary": {
            "total_employees": len(payslips),
            "total_gross_pay": total_gross_pay,
            "total_paye_tax": total_paye_tax,
            "total_national_insurance": total_ni,
            "total_pension_contributions": total_pension,
            "total_net_pay": total_net_pay
        },
        "rti_status": {
            "submitted": len([p for p in payslips if p.rti_submitted]),
            "pending": len([p for p in payslips if not p.rti_submitted])
        }
    } 