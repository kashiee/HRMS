"""
NLP router for handling natural language prompts and AI commands
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
from pydantic import BaseModel

from database import get_db
from models import Employee, Company, Payslip, Department
from services.nlp_ai import process_nlp_command

router = APIRouter()

class NLPRequest(BaseModel):
    prompt: str
    context: Dict[str, Any] = {}

class NLPResponse(BaseModel):
    command: str
    action: str
    parameters: Dict[str, Any]
    confidence: float
    response: str

@router.post("/process", response_model=NLPResponse)
async def process_nlp_prompt(
    request: NLPRequest,
    db: Session = Depends(get_db)
):
    """
    Process natural language prompts and convert to system commands
    """
    try:
        result = await process_nlp_command(request.prompt, request.context, db)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process NLP command: {str(e)}"
        )

@router.post("/run-payroll")
async def run_payroll_command(
    company_name: str = None,
    month: str = None,
    year: str = None,
    db: Session = Depends(get_db)
):
    """
    Run payroll based on natural language parameters
    """
    # Find company by name if provided
    company = None
    if company_name:
        company = db.query(Company).filter(
            Company.name.ilike(f"%{company_name}%")
        ).first()
    
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Get all active employees
    employees = db.query(Employee).filter(
        Employee.company_id == company.id,
        Employee.is_active == True
    ).all()
    
    if not employees:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active employees found"
        )
    
    # Calculate pay period (default to current month)
    from datetime import datetime, date
    now = datetime.now()
    if month and year:
        try:
            start_date = date(int(year), int(month), 1)
            if int(month) == 12:
                end_date = date(int(year) + 1, 1, 1) - date.timedelta(days=1)
            else:
                end_date = date(int(year), int(month) + 1, 1) - date.timedelta(days=1)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid month/year format"
            )
    else:
        start_date = date(now.year, now.month, 1)
        if now.month == 12:
            end_date = date(now.year + 1, 1, 1) - date.timedelta(days=1)
        else:
            end_date = date(now.year, now.month + 1, 1) - date.timedelta(days=1)
    
    pay_date = end_date
    
    # Process payroll for each employee
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
            
            # Import and use calculation service
            from services.calc import calculate_payroll
            calculation_result = await calculate_payroll(employee, payslip_data)
            payslip_data.update(calculation_result)
            
            # Create payslip
            from models import Payslip
            payslip = Payslip(**payslip_data)
            db.add(payslip)
            payslips_created.append(payslip)
            
        except Exception as e:
            print(f"Failed to process payroll for employee {employee.id}: {e}")
            continue
    
    db.commit()
    
    return {
        "message": f"Payroll processed for {company.name}",
        "company": company.name,
        "pay_period": f"{start_date} to {end_date}",
        "employees_processed": len(payslips_created),
        "total_employees": len(employees),
        "payslips_created": len(payslips_created)
    }

@router.post("/verify-documents")
async def verify_documents_command(
    employee_name: str = None,
    document_type: str = None,
    db: Session = Depends(get_db)
):
    """
    Verify documents for an employee based on natural language parameters
    """
    # Find employee by name
    employee = None
    if employee_name:
        employee = db.query(Employee).filter(
            Employee.first_name.ilike(f"%{employee_name}%") |
            Employee.last_name.ilike(f"%{employee_name}%")
        ).first()
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    # Get documents for employee
    from models import Document
    query = db.query(Document).filter(Document.employee_id == employee.id)
    
    if document_type:
        query = query.filter(Document.document_type == document_type)
    
    documents = query.all()
    
    if not documents:
        return {
            "message": f"No documents found for {employee.first_name} {employee.last_name}",
            "employee": f"{employee.first_name} {employee.last_name}",
            "documents_found": 0
        }
    
    # Check verification status
    verified_docs = [d for d in documents if d.is_verified]
    unverified_docs = [d for d in documents if not d.is_verified]
    
    return {
        "message": f"Document verification status for {employee.first_name} {employee.last_name}",
        "employee": f"{employee.first_name} {employee.last_name}",
        "total_documents": len(documents),
        "verified_documents": len(verified_docs),
        "unverified_documents": len(unverified_docs),
        "documents": [
            {
                "id": doc.id,
                "type": doc.document_type,
                "filename": doc.filename,
                "verified": doc.is_verified,
                "ai_classification": doc.ai_classification,
                "ai_confidence": doc.ai_confidence
            }
            for doc in documents
        ]
    }

@router.post("/show-tax-breakdown")
async def show_tax_breakdown_command(
    employee_name: str = None,
    payslip_id: int = None,
    db: Session = Depends(get_db)
):
    """
    Show tax breakdown for an employee or specific payslip
    """
    if payslip_id:
        # Get specific payslip
        payslip = db.query(Payslip).filter(Payslip.id == payslip_id).first()
        if not payslip:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payslip not found"
            )
        
        employee = db.query(Employee).filter(Employee.id == payslip.employee_id).first()
        
        return {
            "message": f"Tax breakdown for {employee.first_name} {employee.last_name}",
            "employee": f"{employee.first_name} {employee.last_name}",
            "payslip_id": payslip.id,
            "pay_period": f"{payslip.pay_period_start} to {payslip.pay_period_end}",
            "tax_breakdown": {
                "gross_pay": payslip.gross_pay,
                "paye_tax": payslip.paye_tax,
                "national_insurance": payslip.national_insurance,
                "pension_contribution": payslip.pension_contribution,
                "student_loan": payslip.student_loan,
                "other_deductions": payslip.other_deductions,
                "net_pay": payslip.net_pay
            },
            "tax_code": employee.tax_code,
            "pension_scheme": employee.pension_scheme
        }
    
    elif employee_name:
        # Find employee and get latest payslip
        employee = db.query(Employee).filter(
            Employee.first_name.ilike(f"%{employee_name}%") |
            Employee.last_name.ilike(f"%{employee_name}%")
        ).first()
        
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee not found"
            )
        
        # Get latest payslip
        latest_payslip = db.query(Payslip).filter(
            Payslip.employee_id == employee.id
        ).order_by(Payslip.pay_period_end.desc()).first()
        
        if not latest_payslip:
            return {
                "message": f"No payslips found for {employee.first_name} {employee.last_name}",
                "employee": f"{employee.first_name} {employee.last_name}",
                "tax_code": employee.tax_code,
                "pension_scheme": employee.pension_scheme
            }
        
        return {
            "message": f"Latest tax breakdown for {employee.first_name} {employee.last_name}",
            "employee": f"{employee.first_name} {employee.last_name}",
            "payslip_id": latest_payslip.id,
            "pay_period": f"{latest_payslip.pay_period_start} to {latest_payslip.pay_period_end}",
            "tax_breakdown": {
                "gross_pay": latest_payslip.gross_pay,
                "paye_tax": latest_payslip.paye_tax,
                "national_insurance": latest_payslip.national_insurance,
                "pension_contribution": latest_payslip.pension_contribution,
                "student_loan": latest_payslip.student_loan,
                "other_deductions": latest_payslip.other_deductions,
                "net_pay": latest_payslip.net_pay
            },
            "tax_code": employee.tax_code,
            "pension_scheme": employee.pension_scheme
        }
    
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide either employee_name or payslip_id"
        )

@router.get("/available-commands")
async def get_available_commands():
    """
    Get list of available NLP commands
    """
    return {
        "available_commands": [
            {
                "command": "run payroll",
                "description": "Run payroll for a company",
                "examples": [
                    "Run payroll for July",
                    "Process payroll for TechCorp",
                    "Run payroll for March 2024"
                ],
                "parameters": ["company_name", "month", "year"]
            },
            {
                "command": "verify documents",
                "description": "Verify documents for an employee",
                "examples": [
                    "Verify documents for Bob",
                    "Check Alice's P45",
                    "Verify passport for John"
                ],
                "parameters": ["employee_name", "document_type"]
            },
            {
                "command": "show tax breakdown",
                "description": "Show tax breakdown for an employee",
                "examples": [
                    "Show Alice's tax breakdown",
                    "Show tax breakdown for payslip 123",
                    "Show Bob's latest tax details"
                ],
                "parameters": ["employee_name", "payslip_id"]
            }
        ],
        "usage": "Send a POST request to /api/v1/nlp/process with a prompt and optional context"
    } 