"""
Company and Department management endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import csv
import io

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
    Get all companies
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
                detail="Company with this registration number already exists"
            )
    
    # Update company fields
    for field, value in company_data.dict().items():
        setattr(company, field, value)
    
    company.updated_at = datetime.now()
    db.commit()
    db.refresh(company)
    
    return company

@router.delete("/{company_id}")
async def delete_company(
    company_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a company
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    db.delete(company)
    db.commit()
    
    return {"message": "Company deleted successfully"}

# CSV Upload endpoint for companies
@router.post("/upload-csv", status_code=status.HTTP_201_CREATED)
async def upload_companies_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload companies from CSV file
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a CSV"
        )
    
    try:
        # Read CSV content
        content = await file.read()
        csv_text = content.decode('utf-8')
        
        # Parse CSV
        csv_reader = csv.DictReader(io.StringIO(csv_text))
        
        companies_created = 0
        companies_updated = 0
        errors = []
        
        for row in csv_reader:
            try:
                # Clean and validate data
                company_data = {
                    "name": row.get("name", "").strip(),
                    "registration_number": row.get("registration_number", "").strip(),
                    "tax_office": row.get("tax_office", "").strip(),
                    "address": row.get("address", "").strip(),
                    "postcode": row.get("postcode", "").strip(),
                    "phone": row.get("phone", "").strip(),
                    "email": row.get("email", "").strip(),
                }
                
                # Validate required fields
                if not company_data["name"] or not company_data["registration_number"]:
                    errors.append(f"Row {csv_reader.line_num}: Missing required fields")
                    continue
                
                # Check if company already exists
                existing_company = db.query(Company).filter(
                    Company.registration_number == company_data["registration_number"]
                ).first()
                
                if existing_company:
                    # Update existing company
                    for field, value in company_data.items():
                        if value:  # Only update non-empty values
                            setattr(existing_company, field, value)
                    existing_company.updated_at = datetime.now()
                    companies_updated += 1
                else:
                    # Create new company
                    company = Company(**company_data)
                    db.add(company)
                    companies_created += 1
                
            except Exception as e:
                errors.append(f"Row {csv_reader.line_num}: {str(e)}")
        
        # Commit all changes
        db.commit()
        
        return {
            "message": "CSV upload completed",
            "companies_created": companies_created,
            "companies_updated": companies_updated,
            "errors": errors
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing CSV: {str(e)}"
        )

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

@router.delete("/departments/{department_id}")
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
    
    return {"message": "Department deleted successfully"}

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

# Initialize sample departments for a company
@router.post("/{company_id}/initialize-departments")
async def initialize_sample_departments(
    company_id: int,
    db: Session = Depends(get_db)
):
    """
    Initialize sample departments for a company
    """
    # Verify company exists
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Sample departments
    sample_departments = [
        {"name": "Human Resources", "code": "HR"},
        {"name": "Finance & Accounting", "code": "FIN"},
        {"name": "Information Technology", "code": "IT"},
        {"name": "Sales & Marketing", "code": "SALES"},
        {"name": "Operations", "code": "OPS"},
        {"name": "Research & Development", "code": "R&D"},
        {"name": "Customer Service", "code": "CS"},
        {"name": "Legal & Compliance", "code": "LEGAL"},
        {"name": "Facilities Management", "code": "FM"},
        {"name": "Quality Assurance", "code": "QA"},
        {"name": "Product Management", "code": "PM"},
        {"name": "Business Development", "code": "BD"},
        {"name": "Engineering", "code": "ENG"},
        {"name": "Design", "code": "DESIGN"},
        {"name": "Data Science", "code": "DS"}
    ]
    
    departments_created = 0
    
    for dept_data in sample_departments:
        # Check if department already exists
        existing_dept = db.query(Department).filter(
            Department.company_id == company_id,
            Department.code == dept_data["code"]
        ).first()
        
        if not existing_dept:
            department = Department(
                name=dept_data["name"],
                code=dept_data["code"],
                company_id=company_id
            )
            db.add(department)
            departments_created += 1
    
    db.commit()
    
    return {
        "message": f"Initialized {departments_created} sample departments",
        "departments_created": departments_created
    } 