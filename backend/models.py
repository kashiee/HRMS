"""
SQLAlchemy models for HRMS system
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum

# Enums
class EmploymentType(str, Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACTOR = "contractor"
    TEMPORARY = "temporary"

class TaxCode(str, Enum):
    BR = "BR"  # Basic Rate
    D0 = "D0"  # Higher Rate
    D1 = "D1"  # Additional Rate
    NT = "NT"  # No Tax
    SBR = "SBR"  # Scottish Basic Rate
    SD0 = "SD0"  # Scottish Higher Rate
    SD1 = "SD1"  # Scottish Additional Rate

class PensionScheme(str, Enum):
    AUTO_ENROLMENT = "auto_enrolment"
    WORKPLACE_PENSION = "workplace_pension"
    NEST = "nest"
    NONE = "none"

# SQLAlchemy Models
class Company(Base):
    """Company/Organization model"""
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    registration_number = Column(String(50), unique=True, nullable=False)
    tax_office = Column(String(10), nullable=False)  # HMRC office code
    address = Column(Text, nullable=False)
    postcode = Column(String(10), nullable=False)
    phone = Column(String(20))
    email = Column(String(255))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    departments = relationship("Department", back_populates="company", cascade="all, delete-orphan")
    employees = relationship("Employee", back_populates="company", cascade="all, delete-orphan")

class Department(Base):
    """Department model"""
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(10), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    company = relationship("Company", back_populates="departments")
    employees = relationship("Employee", back_populates="department")

class Employee(Base):
    """Employee model"""
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_number = Column(String(20), unique=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    national_insurance_number = Column(String(9), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20))
    address = Column(Text, nullable=False)
    postcode = Column(String(10), nullable=False)
    
    # Employment details
    employment_type = Column(String(20), nullable=False, default=EmploymentType.FULL_TIME)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Payroll details
    salary = Column(Float, nullable=False)  # Annual salary
    hourly_rate = Column(Float, nullable=True)  # For hourly workers
    tax_code = Column(String(10), nullable=False, default=TaxCode.BR)
    pension_scheme = Column(String(20), nullable=False, default=PensionScheme.AUTO_ENROLMENT)
    pension_contribution = Column(Float, default=0.05)  # 5% default
    
    # Company/Department relationships
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    company = relationship("Company", back_populates="employees")
    department = relationship("Department", back_populates="employees")
    payslips = relationship("Payslip", back_populates="employee", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="employee", cascade="all, delete-orphan")

class Payslip(Base):
    """Payslip model"""
    __tablename__ = "payslips"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    pay_period_start = Column(Date, nullable=False)
    pay_period_end = Column(Date, nullable=False)
    pay_date = Column(Date, nullable=False)
    
    # Earnings
    basic_pay = Column(Float, nullable=False)
    overtime_pay = Column(Float, default=0.0)
    bonus_pay = Column(Float, default=0.0)
    other_pay = Column(Float, default=0.0)
    gross_pay = Column(Float, nullable=False)
    
    # Deductions
    paye_tax = Column(Float, nullable=False)
    national_insurance = Column(Float, nullable=False)
    pension_contribution = Column(Float, default=0.0)
    student_loan = Column(Float, default=0.0)
    other_deductions = Column(Float, default=0.0)
    net_pay = Column(Float, nullable=False)
    
    # RTI information
    rti_submitted = Column(Boolean, default=False)
    rti_reference = Column(String(50), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    employee = relationship("Employee", back_populates="payslips")

class Document(Base):
    """Document model for uploaded files"""
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    document_type = Column(String(50), nullable=False)  # P45, P60, passport, etc.
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    
    # AI processing results
    ocr_text = Column(Text, nullable=True)
    ai_classification = Column(String(100), nullable=True)
    ai_confidence = Column(Float, nullable=True)
    is_verified = Column(Boolean, default=False)
    
    # Timestamps
    uploaded_at = Column(DateTime, default=func.now())
    processed_at = Column(DateTime, nullable=True)
    
    # Relationships
    employee = relationship("Employee", back_populates="documents")

# Pydantic Models for API
class CompanyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    registration_number: str = Field(..., min_length=1, max_length=50)
    tax_office: str = Field(..., min_length=1, max_length=10)
    address: str = Field(..., min_length=1)
    postcode: str = Field(..., min_length=1, max_length=10)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=255)

class CompanyResponse(BaseModel):
    id: int
    name: str
    registration_number: str
    tax_office: str
    address: str
    postcode: str
    phone: Optional[str]
    email: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class DepartmentCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    code: str = Field(..., min_length=1, max_length=10)
    company_id: int

class DepartmentCreateWithoutCompany(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    code: str = Field(..., min_length=1, max_length=10)

class DepartmentResponse(BaseModel):
    id: int
    name: str
    code: str
    company_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class EmployeeCreate(BaseModel):
    employee_number: str = Field(..., min_length=1, max_length=20)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    date_of_birth: str  # Will be converted to Date
    national_insurance_number: str = Field(..., min_length=9, max_length=9)
    email: str = Field(..., max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    address: str = Field(..., min_length=1)
    postcode: str = Field(..., min_length=1, max_length=10)
    employment_type: EmploymentType = EmploymentType.FULL_TIME
    start_date: str  # Will be converted to Date
    end_date: Optional[str] = None  # Will be converted to Date
    salary: float = Field(..., gt=0)
    hourly_rate: Optional[float] = Field(None, gt=0)
    tax_code: TaxCode = TaxCode.BR
    pension_scheme: PensionScheme = PensionScheme.AUTO_ENROLMENT
    pension_contribution: float = Field(0.05, ge=0, le=1)
    company_id: int
    department_id: Optional[int] = None

class EmployeeResponse(BaseModel):
    id: int
    employee_number: str
    first_name: str
    last_name: str
    date_of_birth: str
    national_insurance_number: str
    email: str
    phone: Optional[str]
    address: str
    postcode: str
    employment_type: EmploymentType
    start_date: str
    end_date: Optional[str]
    is_active: bool
    salary: float
    hourly_rate: Optional[float]
    tax_code: TaxCode
    pension_scheme: PensionScheme
    pension_contribution: float
    company_id: int
    department_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class PayslipCreate(BaseModel):
    employee_id: int
    pay_period_start: str  # Will be converted to Date
    pay_period_end: str  # Will be converted to Date
    pay_date: str  # Will be converted to Date
    basic_pay: float = Field(..., gt=0)
    overtime_pay: float = Field(0, ge=0)
    bonus_pay: float = Field(0, ge=0)
    other_pay: float = Field(0, ge=0)

class PayslipResponse(BaseModel):
    id: int
    employee_id: int
    pay_period_start: str
    pay_period_end: str
    pay_date: str
    basic_pay: float
    overtime_pay: float
    bonus_pay: float
    other_pay: float
    gross_pay: float
    paye_tax: float
    national_insurance: float
    pension_contribution: float
    student_loan: float
    other_deductions: float
    net_pay: float
    rti_submitted: bool
    rti_reference: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True 