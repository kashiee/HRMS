"""
Employee management endpoints with AI classification
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
import os
import uuid
from pathlib import Path

from database import get_db
from models import (
    Employee, EmployeeCreate, EmployeeResponse, Document,
    EmploymentType, TaxCode, PensionScheme
)
from services.nlp_ai import classify_employee_data
from services.doc_ai import process_document_upload

router = APIRouter()

# Employee endpoints
@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(
    employee_data: EmployeeCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new employee with AI-powered classification
    """
    # Check if employee number already exists
    existing_employee = db.query(Employee).filter(
        Employee.employee_number == employee_data.employee_number
    ).first()
    
    if existing_employee:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee with this number already exists"
        )
    
    # Check if NI number already exists
    existing_ni = db.query(Employee).filter(
        Employee.national_insurance_number == employee_data.national_insurance_number
    ).first()
    
    if existing_ni:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee with this NI number already exists"
        )
    
    # Check if email already exists
    existing_email = db.query(Employee).filter(
        Employee.email == employee_data.email
    ).first()
    
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee with this email already exists"
        )
    
    # Convert string dates to date objects
    employee_dict = employee_data.dict()
    employee_dict['date_of_birth'] = datetime.strptime(employee_data.date_of_birth, '%Y-%m-%d').date()
    employee_dict['start_date'] = datetime.strptime(employee_data.start_date, '%Y-%m-%d').date()
    
    if employee_data.end_date:
        employee_dict['end_date'] = datetime.strptime(employee_data.end_date, '%Y-%m-%d').date()
    
    # AI classification of employee data
    try:
        classification = await classify_employee_data(employee_data)
        if classification.get('suggested_tax_code'):
            employee_dict['tax_code'] = classification['suggested_tax_code']
        if classification.get('suggested_pension_scheme'):
            employee_dict['pension_scheme'] = classification['suggested_pension_scheme']
    except Exception as e:
        # Log error but continue with default values
        print(f"AI classification failed: {e}")
    
    # Create new employee
    employee = Employee(**employee_dict)
    db.add(employee)
    db.commit()
    db.refresh(employee)
    
    return employee

@router.get("/", response_model=List[EmployeeResponse])
async def get_employees(
    skip: int = 0,
    limit: int = 100,
    company_id: Optional[int] = None,
    department_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """
    Get all employees with optional filtering
    """
    query = db.query(Employee)
    
    if company_id:
        query = query.filter(Employee.company_id == company_id)
    
    if department_id:
        query = query.filter(Employee.department_id == department_id)
    
    if is_active is not None:
        query = query.filter(Employee.is_active == is_active)
    
    employees = query.offset(skip).limit(limit).all()
    return employees

@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(
    employee_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific employee by ID
    """
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    return employee

@router.put("/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: int,
    employee_data: EmployeeCreate,
    db: Session = Depends(get_db)
):
    """
    Update an employee
    """
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    # Check for conflicts with other employees
    employee_dict = employee_data.dict()
    
    # Check employee number
    if employee_data.employee_number != employee.employee_number:
        existing_employee = db.query(Employee).filter(
            Employee.employee_number == employee_data.employee_number,
            Employee.id != employee_id
        ).first()
        
        if existing_employee:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Employee number already exists"
            )
    
    # Check NI number
    if employee_data.national_insurance_number != employee.national_insurance_number:
        existing_ni = db.query(Employee).filter(
            Employee.national_insurance_number == employee_data.national_insurance_number,
            Employee.id != employee_id
        ).first()
        
        if existing_ni:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="NI number already exists"
            )
    
    # Check email
    if employee_data.email != employee.email:
        existing_email = db.query(Employee).filter(
            Employee.email == employee_data.email,
            Employee.id != employee_id
        ).first()
        
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )
    
    # Convert string dates to date objects
    employee_dict['date_of_birth'] = datetime.strptime(employee_data.date_of_birth, '%Y-%m-%d').date()
    employee_dict['start_date'] = datetime.strptime(employee_data.start_date, '%Y-%m-%d').date()
    
    if employee_data.end_date:
        employee_dict['end_date'] = datetime.strptime(employee_data.end_date, '%Y-%m-%d').date()
    
    # Update employee fields
    for field, value in employee_dict.items():
        setattr(employee, field, value)
    
    employee.updated_at = datetime.now()
    db.commit()
    db.refresh(employee)
    
    return employee

@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete an employee (soft delete by setting is_active to False)
    """
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    # Soft delete - set is_active to False
    employee.is_active = False
    employee.updated_at = datetime.now()
    db.commit()
    
    return None

@router.post("/{employee_id}/documents", status_code=status.HTTP_201_CREATED)
async def upload_employee_document(
    employee_id: int,
    document_type: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a document for an employee with AI processing
    """
    # Verify employee exists
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    # Create upload directory if it doesn't exist
    upload_dir = Path("uploads/documents")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    file_extension = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = upload_dir / unique_filename
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )
    
    # Create document record
    document = Document(
        employee_id=employee_id,
        document_type=document_type,
        filename=file.filename,
        file_path=str(file_path),
        file_size=len(content),
        mime_type=file.content_type or "application/octet-stream"
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    # Process document with AI (async)
    try:
        await process_document_upload(document.id, str(file_path), document_type, db)
    except Exception as e:
        print(f"AI processing failed for document {document.id}: {e}")
    
    return {
        "id": document.id,
        "filename": document.filename,
        "document_type": document.document_type,
        "status": "uploaded",
        "message": "Document uploaded successfully. AI processing in progress."
    }

@router.get("/{employee_id}/documents")
async def get_employee_documents(
    employee_id: int,
    db: Session = Depends(get_db)
):
    """
    Get all documents for an employee
    """
    # Verify employee exists
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    documents = db.query(Document).filter(Document.employee_id == employee_id).all()
    
    return [
        {
            "id": doc.id,
            "document_type": doc.document_type,
            "filename": doc.filename,
            "file_size": doc.file_size,
            "uploaded_at": doc.uploaded_at,
            "is_verified": doc.is_verified,
            "ai_classification": doc.ai_classification,
            "ai_confidence": doc.ai_confidence
        }
        for doc in documents
    ]

@router.get("/{employee_id}/payslips")
async def get_employee_payslips(
    employee_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Get payslips for an employee
    """
    # Verify employee exists
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    payslips = db.query(Employee.payslips).filter(
        Employee.id == employee_id
    ).offset(skip).limit(limit).all()
    
    return payslips