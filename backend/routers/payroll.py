"""
Payroll management endpoints with calculations and payslip generation
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from pathlib import Path
import json

from database import get_db
from models import (
    Employee, Payslip, PayslipCreate, PayslipResponse,
    Company, Department
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
    Run payroll for all active employees in a company
    """
    # Verify company exists
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Get all active employees
    employees = db.query(Employee).filter(
        Employee.company_id == company_id,
        Employee.is_active == True
    ).all()
    
    if not employees:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active employees found for this company"
        )
    
    # Convert dates
    start_date = datetime.strptime(pay_period_start, '%Y-%m-%d').date()
    end_date = datetime.strptime(pay_period_end, '%Y-%m-%d').date()
    pay_date_obj = datetime.strptime(pay_date, '%Y-%m-%d').date()
    
    # Add background task for batch processing
    background_tasks.add_task(
        process_batch_payroll,
        company_id,
        employees,
        start_date,
        end_date,
        pay_date_obj,
        db
    )
    
    return {
        "message": "Batch payroll processing started",
        "company_id": company_id,
        "employee_count": len(employees),
        "pay_period": f"{pay_period_start} to {pay_period_end}",
        "pay_date": pay_date
    }

async def process_batch_payroll(
    company_id: int,
    employees: List[Employee],
    start_date: date,
    end_date: date,
    pay_date: date,
    db: Session
):
    """
    Background task to process batch payroll
    """
    payslips_created = []
    
    for employee in employees:
        try:
            # Calculate basic pay (monthly salary / 12)
            monthly_salary = employee.salary / 12
            basic_pay = monthly_salary
            
            payslip_data = {
                'employee_id': employee.id,
                'pay_period_start': start_date,
                'pay_period_end': end_date,
                'pay_date': pay_date,
                'basic_pay': basic_pay,
                'overtime_pay': 0.0,
                'bonus_pay': 0.0,
                'other_pay': 0.0
            }
            
            # Calculate payroll
            calculation_result = await calculate_payroll(employee, payslip_data)
            payslip_data.update(calculation_result)
            
            # Create payslip
            payslip = Payslip(**payslip_data)
            db.add(payslip)
            payslips_created.append(payslip)
            
        except Exception as e:
            print(f"Failed to process payroll for employee {employee.id}: {e}")
            continue
    
    db.commit()
    
    # Generate BACS file for all payslips
    try:
        bacs_file_path = await generate_bacs_file(payslips_created, company_id)
        print(f"BACS file generated: {bacs_file_path}")
    except Exception as e:
        print(f"Failed to generate BACS file: {e}")

@router.get("/payslips", response_model=List[PayslipResponse])
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
    query = db.query(Payslip)
    
    if company_id:
        query = query.join(Employee).filter(Employee.company_id == company_id)
    
    if employee_id:
        query = query.filter(Payslip.employee_id == employee_id)
    
    payslips = query.offset(skip).limit(limit).all()
    return payslips

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
    Generate and download payslip PDF
    """
    payslip = db.query(Payslip).filter(Payslip.id == payslip_id).first()
    if not payslip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payslip not found"
        )
    
    employee = db.query(Employee).filter(Employee.id == payslip.employee_id).first()
    company = db.query(Company).filter(Company.id == employee.company_id).first()
    
    # Generate payslip PDF (mock for now)
    payslip_data = {
        'payslip_id': payslip.id,
        'employee_name': f"{employee.first_name} {employee.last_name}",
        'employee_number': employee.employee_number,
        'company_name': company.name,
        'pay_period': f"{payslip.pay_period_start} to {payslip.pay_period_end}",
        'pay_date': payslip.pay_date.isoformat(),
        'earnings': {
            'basic_pay': payslip.basic_pay,
            'overtime_pay': payslip.overtime_pay,
            'bonus_pay': payslip.bonus_pay,
            'other_pay': payslip.other_pay,
            'gross_pay': payslip.gross_pay
        },
        'deductions': {
            'paye_tax': payslip.paye_tax,
            'national_insurance': payslip.national_insurance,
            'pension_contribution': payslip.pension_contribution,
            'student_loan': payslip.student_loan,
            'other_deductions': payslip.other_deductions,
            'net_pay': payslip.net_pay
        }
    }
    
    # For PoC, return JSON instead of PDF
    return {
        "message": "Payslip generated successfully",
        "payslip_data": payslip_data,
        "download_url": f"/api/v1/payroll/payslips/{payslip_id}/pdf",
        "note": "PDF generation would be implemented with WeasyPrint or pdfkit"
    }

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