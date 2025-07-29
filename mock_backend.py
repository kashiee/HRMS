from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
import uvicorn
from datetime import datetime
import json
import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
import tempfile

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store payslip data in memory (in production, this would be in a database)
payslip_data_store = {}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Mock Backend Running"}

@app.post("/payroll/batch")
async def process_payroll(request_data: dict):
    """Mock payroll processing"""
    employees = request_data.get("employees", [])
    
    # Generate mock payslips
    payslips = []
    for i, employee in enumerate(employees):
        salary = float(employee.get("salary", 0))
        net_pay = salary * 0.8  # Mock 20% deductions
        
        payslip_id = f"payslip_{i+1}"
        
        # Store the employee data for PDF generation
        payslip_data_store[payslip_id] = {
            "employee_name": employee.get("name", "Unknown"),
            "employee_id": f"emp_{i+1}",
            "salary": salary,
            "gross_pay": salary,
            "net_pay": net_pay,
            "tax_deductions": salary * 0.15,
            "ni_deductions": salary * 0.05,
            "pension_contributions": salary * 0.05,
            "department": employee.get("department", "General"),
            "tax_code": employee.get("tax_code", "BR"),
            "ni_number": employee.get("national_insurance_number", "AB123456C"),
            "email": employee.get("email", "employee@company.com"),
            "address": employee.get("address", "123 Employee Street"),
            "postcode": employee.get("postcode", "SW1A 1AA"),
            "employment_type": employee.get("employment_type", "Full Time"),
            "start_date": employee.get("start_date", "2024-01-01"),
            "pension_scheme": employee.get("pension_scheme", "Auto Enrolment"),
            "pension_contribution": employee.get("pension_contribution", "0.05")
        }
        
        payslip = {
            "id": payslip_id,
            "employee_name": employee.get("name", "Unknown"),
            "employee_id": f"emp_{i+1}",
            "pay_period": {
                "start_date": "2024-01-01",
                "end_date": "2024-01-31"
            },
            "gross_pay": salary,
            "net_pay": net_pay,
            "tax_deductions": salary * 0.15,
            "ni_deductions": salary * 0.05,
            "pension_contributions": salary * 0.05,
            "generated_at": datetime.now().isoformat()
        }
        payslips.append(payslip)
    
    return {
        "message": f"Processed {len(employees)} employees",
        "payslips": payslips,
        "total_processed": len(employees)
    }

@app.get("/payroll/payslip/{payslip_id}")
async def download_payslip(payslip_id: str):
    """Generate and serve PDF payslip"""
    try:
        # Get the stored payslip data
        payslip_data = payslip_data_store.get(payslip_id)
        if not payslip_data:
            raise HTTPException(status_code=404, detail="Payslip not found")
        
        # Create a temporary PDF file
        pdf_path = generate_payslip_pdf(payslip_id, payslip_data)
        
        # Return the PDF file
        return FileResponse(
            path=pdf_path,
            media_type='application/pdf',
            filename=f"{payslip_id}.pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")

def generate_payslip_pdf(payslip_id: str, payslip_data: dict):
    """Generate a PDF payslip using ReportLab with actual employee data"""
    # Create temporary file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
    pdf_path = temp_file.name
    temp_file.close()
    
    # Create PDF document
    doc = SimpleDocTemplate(pdf_path, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        spaceAfter=30,
        alignment=1  # Center alignment
    )
    story.append(Paragraph("PAYSLIP", title_style))
    story.append(Spacer(1, 20))
    
    # Company header
    company_data = [
        ['Company:', 'Demo Company Ltd'],
        ['Address:', '123 Business Street, London, SW1A 1AA'],
        ['PAYE Reference:', '123/AB12345'],
        ['Pay Period:', 'January 2024']
    ]
    
    company_table = Table(company_data, colWidths=[1.5*inch, 4*inch])
    company_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(company_table)
    story.append(Spacer(1, 20))
    
    # Employee details - using actual data
    employee_data = [
        ['Employee Name:', payslip_data['employee_name']],
        ['Employee ID:', payslip_data['employee_id']],
        ['Department:', payslip_data['department']],
        ['Tax Code:', payslip_data['tax_code']],
        ['NI Number:', payslip_data['ni_number']],
        ['Email:', payslip_data['email']],
        ['Address:', payslip_data['address']],
        ['Postcode:', payslip_data['postcode']],
        ['Employment Type:', payslip_data['employment_type']],
        ['Start Date:', payslip_data['start_date']]
    ]
    
    employee_table = Table(employee_data, colWidths=[1.5*inch, 4*inch])
    employee_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(employee_table)
    story.append(Spacer(1, 20))
    
    # Pay details - using actual calculated values
    gross_pay = payslip_data['gross_pay']
    tax_deductions = payslip_data['tax_deductions']
    ni_deductions = payslip_data['ni_deductions']
    pension_contributions = payslip_data['pension_contributions']
    net_pay = payslip_data['net_pay']
    
    pay_data = [
        ['Description', 'Amount'],
        ['Basic Pay', f'£{gross_pay:,.2f}'],
        ['Overtime', '£0.00'],
        ['Bonus', '£0.00'],
        ['', ''],
        ['Gross Pay', f'£{gross_pay:,.2f}'],
        ['', ''],
        ['PAYE Tax', f'£{tax_deductions:,.2f}'],
        ['National Insurance', f'£{ni_deductions:,.2f}'],
        ['Pension', f'£{pension_contributions:,.2f}'],
        ['', ''],
        ['Net Pay', f'£{net_pay:,.2f}']
    ]
    
    pay_table = Table(pay_data, colWidths=[3*inch, 2.5*inch])
    pay_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 5), (0, 5), 'Helvetica-Bold'),
        ('FONTNAME', (0, 10), (0, 10), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, 0), 1, colors.black),
        ('GRID', (0, 5), (-1, 5), 1, colors.black),
        ('GRID', (0, 10), (-1, 10), 1, colors.black),
        ('LINEBELOW', (0, 4), (-1, 4), 0.5, colors.grey),
        ('LINEBELOW', (0, 9), (-1, 9), 0.5, colors.grey),
    ]))
    story.append(pay_table)
    story.append(Spacer(1, 30))
    
    # Footer
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        alignment=1,
        textColor=colors.grey
    )
    story.append(Paragraph("This is a computer generated payslip. Please retain for your records.", footer_style))
    story.append(Paragraph(f"Generated on: {datetime.now().strftime('%d/%m/%Y %H:%M')}", footer_style))
    
    # Build PDF
    doc.build(story)
    
    return pdf_path

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000) 