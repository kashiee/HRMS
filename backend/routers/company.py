"""
Company and Department management endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database import get_db
from models import Company, Department, Employee, Payslip, Document, CompanyCreate, CompanyResponse, DepartmentCreate, DepartmentResponse, EmployeeCreate, EmployeeResponse, PayslipCreate, PayslipResponse, DepartmentCreateWithoutCompany

router = APIRouter()

# Company endpoints
@router.post("/", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
async def create_company(
    company_data: CompanyCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new company/organization
    """
    # Check if registration number already exists
    existing_company = db.query(Company).filter(
        Company.registration_number == company_data.registration_number
    ).first()
    
    if existing_company:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company with this registration number already exists"
        )
    
    # Create new company
    company = Company(**company_data.dict())
    db.add(company)
    db.commit()
    db.refresh(company)
    
    return company

@router.get("/", response_model=List[CompanyResponse])
async def get_companies(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all companies with pagination
    """
    companies = db.query(Company).offset(skip).limit(limit).all()
    return companies

@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific company by ID
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    return company

@router.put("/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: int,
    company_data: CompanyCreate,
    db: Session = Depends(get_db)
):
    """
    Update a company
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Check if new registration number conflicts with other companies
    if company_data.registration_number != company.registration_number:
        existing_company = db.query(Company).filter(
            Company.registration_number == company_data.registration_number,
            Company.id != company_id
        ).first()
        
        if existing_company:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration number already exists"
            )
    
    # Update company fields
    for field, value in company_data.dict().items():
        setattr(company, field, value)
    
    company.updated_at = datetime.now()
    db.commit()
    db.refresh(company)
    
    return company

@router.delete("/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_company(
    company_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a company (cascade will handle related records)
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    db.delete(company)
    db.commit()
    return None

# Department endpoints
@router.post("/{company_id}/departments", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
async def create_department(
    company_id: int,
    department_data: DepartmentCreateWithoutCompany,
    db: Session = Depends(get_db)
):
    """
    Create a new department for a company
    """
    # Verify company exists
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Check if department code already exists in this company
    existing_department = db.query(Department).filter(
        Department.company_id == company_id,
        Department.code == department_data.code
    ).first()
    
    if existing_department:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department with this code already exists in this company"
        )
    
    # Create new department with company_id from URL
    department_dict = department_data.dict()
    department_dict['company_id'] = company_id
    department = Department(**department_dict)
    db.add(department)
    db.commit()
    db.refresh(department)
    
    return department

@router.get("/{company_id}/departments", response_model=List[DepartmentResponse])
async def get_departments(
    company_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all departments for a company
    """
    # Verify company exists
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    departments = db.query(Department).filter(
        Department.company_id == company_id
    ).offset(skip).limit(limit).all()
    
    return departments

@router.get("/departments/{department_id}", response_model=DepartmentResponse)
async def get_department(
    department_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific department by ID
    """
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )
    return department

@router.put("/departments/{department_id}", response_model=DepartmentResponse)
async def update_department(
    department_id: int,
    department_data: DepartmentCreate,
    db: Session = Depends(get_db)
):
    """
    Update a department
    """
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )
    
    # Check if new code conflicts with other departments in the same company
    if department_data.code != department.code:
        existing_department = db.query(Department).filter(
            Department.company_id == department.company_id,
            Department.code == department_data.code,
            Department.id != department_id
        ).first()
        
        if existing_department:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Department code already exists in this company"
            )
    
    # Update department fields
    for field, value in department_data.dict().items():
        setattr(department, field, value)
    
    department.updated_at = datetime.now()
    db.commit()
    db.refresh(department)
    
    return department

@router.delete("/departments/{department_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_department(
    department_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a department
    """
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )
    
    db.delete(department)
    db.commit()
    return None 