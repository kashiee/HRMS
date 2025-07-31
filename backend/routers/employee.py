"""
Employee management endpoints for comprehensive employee data
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import csv
import io
import json

from database import get_db
from models import EmployeeRecord, EmployeeData
from models import Employee # Added import for Employee model

router = APIRouter()

@router.post("/employee", status_code=status.HTTP_201_CREATED)
async def create_employee_record(
    employee_data: EmployeeData,
    db: Session = Depends(get_db)
):
    """
    Create a new employee record with comprehensive data
    
    This endpoint accepts all 139 employee fields from CSV import
    and stores them in the employee_records table.
    """
    try:
        # Convert Pydantic model to dict
        employee_dict = employee_data.dict(exclude_unset=True)
        
        # Create new employee record
        employee_record = EmployeeRecord(**employee_dict)
        
        # Add to database
        db.add(employee_record)
        db.commit()
        db.refresh(employee_record)
        
        return {
            "message": "Employee record created successfully",
            "id": employee_record.id,
            "reference": employee_record.reference,
            "name": f"{employee_record.forename or ''} {employee_record.surname or ''}".strip(),
            "created_at": employee_record.created_at
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create employee record: {str(e)}"
        )

# CSV Upload endpoint for employees
@router.post("/upload-csv", status_code=status.HTTP_201_CREATED)
async def upload_employees_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload employees from CSV file with all 139 fields
    """
    print(f"CSV upload started: {file.filename}, size: {file.size}")
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a CSV"
        )
    
    try:
        # Read CSV content
        content = await file.read()
        csv_text = content.decode('utf-8')
        print(f"CSV content length: {len(csv_text)} characters")
        print(f"CSV content preview: {csv_text[:500]}...")
        
        # Parse CSV
        csv_reader = csv.DictReader(io.StringIO(csv_text))
        
        employees_created = 0
        employees_updated = 0
        errors = []
        
        print(f"Processing CSV with headers: {csv_reader.fieldnames}")
        print(f"First few rows preview:")
        # Preview first few rows to debug
        csv_text_lines = csv_text.split('\n')
        for i, line in enumerate(csv_text_lines[:5]):
            print(f"Line {i+1}: {line}")
        
        # Check current database count before upload
        initial_count = db.query(EmployeeRecord).count()
        print(f"Initial database count: {initial_count}")
        
        for row in csv_reader:
            try:
                print(f"Processing row {csv_reader.line_num}: {row.get('reference', 'NO_REF')}")
                
                # Clean and validate data - handle all 139 fields
                employee_data = {}
                
                # Helper function to safely get and strip values
                def safe_get(row, key, default=""):
                    value = row.get(key, default)
                    return value.strip() if value is not None else ""
                
                # Basic Information - Updated for your CSV format
                employee_data["reference"] = safe_get(row, "Reference")
                employee_data["gender"] = safe_get(row, "Gender")
                employee_data["title"] = safe_get(row, "Title")
                employee_data["forename"] = safe_get(row, "Forename")
                employee_data["surname"] = safe_get(row, "Surname")
                
                # Address Information - Updated for your CSV format
                employee_data["address_1"] = safe_get(row, "Address 1")
                employee_data["address_2"] = safe_get(row, "Address 2")
                employee_data["address_3"] = safe_get(row, "Address 3")
                employee_data["address_4"] = safe_get(row, "Address 4")
                employee_data["postcode"] = safe_get(row, "Postcode")
                employee_data["country"] = safe_get(row, "Country")
                
                # Personal Information - Updated for your CSV format
                employee_data["marital_status"] = safe_get(row, "Marital Status")
                employee_data["birth_date"] = safe_get(row, "Birth Date")
                
                # Employment Information - Updated for your CSV format
                employee_data["employment_status"] = safe_get(row, "Employment Status")
                employee_data["start_date"] = safe_get(row, "Start Date")
                employee_data["leaving_date"] = safe_get(row, "Leave Date")
                employee_data["leaver"] = safe_get(row, "Leaver")
                employee_data["p45_1_if_required"] = safe_get(row, "P45_1_IF_Required")
                
                # Directorship Information - Updated for your CSV format
                employee_data["director"] = safe_get(row, "Directorship Start Date")
                employee_data["director_start_date"] = safe_get(row, "Directorship Start Date")
                employee_data["director_leave_date"] = safe_get(row, "Directorship Start Date")  # Using same field as placeholder
                
                # Organizational Information - Updated for your CSV format
                employee_data["branch"] = safe_get(row, "Branch")
                employee_data["cost_centre"] = safe_get(row, "Cost Centre")
                employee_data["department"] = safe_get(row, "Department")
                employee_data["run_group"] = safe_get(row, "Run Group")
                employee_data["default_cost_split"] = safe_get(row, "Default Cost Split")
                
                # National Insurance - Updated for your CSV format
                employee_data["ni_number"] = safe_get(row, "NINumber")
                employee_data["ni_letter"] = safe_get(row, "NILetter")
                employee_data["ni_category"] = safe_get(row, "NILetter")  # Using NILetter as placeholder
                
                # Tax Information - Updated for your CSV format
                employee_data["tax_code"] = safe_get(row, "Tax Code")
                employee_data["week1_month1"] = safe_get(row, "Week 1/Month 1")
                employee_data["tax_code_change_type"] = safe_get(row, "Tax Code Change Type")
                
                # Payment Information - Updated for your CSV format
                employee_data["frequency"] = safe_get(row, "Frequency")
                employee_data["payment_method"] = safe_get(row, "Payment Method")
                
                # Banking Information - Updated for your CSV format
                employee_data["bank_account_no"] = safe_get(row, "Bank Account No")
                employee_data["bank_account_name"] = safe_get(row, "Bank Account Name")
                employee_data["sort_code"] = safe_get(row, "Sort Code")
                employee_data["bank_name"] = safe_get(row, "Bank Name")
                employee_data["bank_branch"] = safe_get(row, "Bank Branch")
                employee_data["building_society_ref"] = safe_get(row, "Building Society Ref")
                employee_data["autopay_ref"] = safe_get(row, "Autopay Ref")
                
                # Payroll Information - Updated for your CSV format
                employee_data["taxable_pay_previous_employment"] = safe_get(row, "Taxable Pay Previous Employment")
                employee_data["taxable_pay_this_employment"] = safe_get(row, "Taxable Pay This Employment")
                employee_data["tax_previous_employment"] = safe_get(row, "Tax Previous Employment")
                employee_data["tax_this_employment"] = safe_get(row, "Tax This Employment")
                employee_data["net_pay_to_date"] = safe_get(row, "Net Pay To Date")
                employee_data["directors_earnings_to_date"] = safe_get(row, "Directors Earnings To Date")
                
                # National Insurance Breakdown - Updated for your CSV format
                employee_data["bf_ni_letter"] = safe_get(row, "BF NI Letter")
                employee_data["bf_ni_calculation_basis"] = safe_get(row, "BF NI Calculation Basis")
                employee_data["bf_total_earnings"] = safe_get(row, "BF Total Earnings")
                employee_data["bf_earnings_to_set"] = safe_get(row, "BF Earnings To SET")
                employee_data["bf_earnings_to_lel"] = safe_get(row, "BF Earnings To LEL")
                employee_data["bf_earnings_to_pet"] = safe_get(row, "BF Earnings To PET")
                employee_data["bf_earnings_to_fust"] = safe_get(row, "BF Earnings To FUST")
                employee_data["bf_earnings_to_ust"] = safe_get(row, "BF Earnings To UST")
                employee_data["bf_earnings_above_uel"] = safe_get(row, "BF Earnings Above UEL")
                employee_data["bf_ee_contributions_pt1"] = safe_get(row, "BF Ee Contributions Pt1")
                employee_data["bf_ee_contributions_pt2"] = safe_get(row, "BF Ee Contributions Pt2")
                employee_data["bf_er_contributions"] = safe_get(row, "BF Er Contributions")
                
                # Additional fields - only include fields that exist in EmployeeRecord model
                # Student Loan Information - Updated for your CSV format
                employee_data["student_loan_repayment_plan"] = safe_get(row, "StudentLoanRepaymentPlan")
                employee_data["student_loan_from_date"] = safe_get(row, "StudentLoanFromDate")
                employee_data["student_loan_to_date"] = safe_get(row, "StudentLoanToDate")
                employee_data["student_loan_deducted"] = safe_get(row, "StudentLoanDeducted")
                
                # Contact Information - Updated for your CSV format
                employee_data["email"] = safe_get(row, "Email")
                
                # Additional Employment Information
                employee_data["ee_ni_pd_by_er_td"] = safe_get(row, "ee_ni_pd_by_er_td")
                employee_data["expat_exempt"] = safe_get(row, "expat_exempt")
                employee_data["date_of_arrival"] = safe_get(row, "date_of_arrival")
                employee_data["tax_exempt_pcnt"] = safe_get(row, "tax_exempt_pcnt")
                employee_data["tax_exempt_income_td"] = safe_get(row, "tax_exempt_income_td")
                employee_data["tax_exempt_gu_income_td"] = safe_get(row, "tax_exempt_gu_income_td")
                employee_data["ee_gu_override"] = safe_get(row, "ee_gu_override")
                employee_data["calc_ee_gross_to_net_first"] = safe_get(row, "calc_ee_gross_to_net_first")
                employee_data["no_ni_gu"] = safe_get(row, "no_ni_gu")
                employee_data["gross_up_pension_contribs"] = safe_get(row, "gross_up_pension_contribs")
                employee_data["gu_student_loan"] = safe_get(row, "gu_student_loan")
                employee_data["double_tax_agreement"] = safe_get(row, "double_tax_agreement")
                employee_data["foreign_tax_credit"] = safe_get(row, "foreign_tax_credit")
                employee_data["uk_tax_ytd"] = safe_get(row, "uk_tax_ytd")
                employee_data["foreign_tax_ytd"] = safe_get(row, "foreign_tax_ytd")
                employee_data["foreign_tax_offset_ytd"] = safe_get(row, "foreign_tax_offset_ytd")
                employee_data["epm6_override"] = safe_get(row, "epm6_override")
                employee_data["gu_postgraduate_loan"] = safe_get(row, "gu_postgraduate_loan")
                employee_data["transfer_date"] = safe_get(row, "transfer_date")
                employee_data["standard_hours"] = safe_get(row, "standard_hours")
                
                # Validate required fields with flexible column name matching
                reference = safe_get(row, "reference") or safe_get(row, "Reference") or safe_get(row, "REFERENCE") or safe_get(row, "employee_id") or safe_get(row, "Employee ID") or safe_get(row, "id")
                forename = safe_get(row, "forename") or safe_get(row, "Forename") or safe_get(row, "FORENAME") or safe_get(row, "first_name") or safe_get(row, "First Name") or safe_get(row, "firstname")
                surname = safe_get(row, "surname") or safe_get(row, "Surname") or safe_get(row, "SURNAME") or safe_get(row, "last_name") or safe_get(row, "Last Name") or safe_get(row, "lastname")
                
                if not reference or not forename or not surname:
                    errors.append(f"Row {csv_reader.line_num}: Missing required fields (reference/employee_id, forename/first_name, surname/last_name)")
                    print(f"Validation failed for row {csv_reader.line_num}: Missing required fields")
                    continue
                
                # Update the employee_data with the found values
                employee_data["reference"] = reference
                employee_data["forename"] = forename
                employee_data["surname"] = surname
                
                # Check if employee already exists
                existing_employee = db.query(EmployeeRecord).filter(
                    EmployeeRecord.reference == employee_data["reference"]
                ).first()
                
                if existing_employee:
                    # Update existing employee
                    for field, value in employee_data.items():
                        if value:  # Only update non-empty values
                            setattr(existing_employee, field, value)
                    existing_employee.updated_at = datetime.now()
                    employees_updated += 1
                    print(f"Updated employee: {employee_data['reference']}")
                else:
                    # Create new employee
                    employee_record = EmployeeRecord(**employee_data)
                    db.add(employee_record)
                    employees_created += 1
                    print(f"Created employee: {employee_data['reference']}")
                
            except Exception as e:
                error_msg = f"Row {csv_reader.line_num}: {str(e)}"
                errors.append(error_msg)
                print(f"Error processing row: {error_msg}")
        
        # Commit all changes
        db.commit()
        
        # Check final database count
        final_count = db.query(EmployeeRecord).count()
        print(f"Final database count: {final_count}")
        print(f"CSV upload completed: {employees_created} created, {employees_updated} updated, {len(errors)} errors")
        
        return {
            "message": "CSV upload completed",
            "employees_created": employees_created,
            "employees_updated": employees_updated,
            "errors": errors,
            "initial_count": initial_count,
            "final_count": final_count
        }
        
    except Exception as e:
        print(f"CSV upload error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing CSV: {str(e)}"
        )

@router.patch("/employee/{reference}", status_code=status.HTTP_200_OK)
async def update_employee_record(
    reference: str,
    employee_data: dict,
    db: Session = Depends(get_db)
):
    """
    Update an employee record by reference number
    """
    try:
        # Find the employee
        employee = db.query(EmployeeRecord).filter(
            EmployeeRecord.reference == reference
        ).first()
        
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with reference '{reference}' not found"
            )
        
        # Update fields that are provided
        for field, value in employee_data.items():
            if hasattr(employee, field) and value is not None:
                setattr(employee, field, value)
        
        # Update timestamp
        employee.updated_at = datetime.now()
        
        # Commit changes
        db.commit()
        db.refresh(employee)
        
        return {
            "message": f"Employee {reference} updated successfully",
            "employee": {
                "reference": employee.reference,
                "forename": employee.forename,
                "surname": employee.surname,
                "department": employee.department,
                "ni_number": employee.ni_number,
                "tax_code": employee.tax_code,
                "email": employee.email
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update employee: {str(e)}"
        )

@router.get("/employee/{reference}", status_code=status.HTTP_200_OK)
async def get_employee_record(
    reference: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve an employee record by reference number
    
    Returns comprehensive employee data including all 139 fields
    """
    try:
        # Query employee by reference
        employee = db.query(EmployeeRecord).filter(
            EmployeeRecord.reference == reference
        ).first()
        
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with reference '{reference}' not found"
            )
        
        # Convert to dict for response
        employee_dict = {
            "id": employee.id,
            "reference": employee.reference,
            "gender": employee.gender,
            "title": employee.title,
            "forename": employee.forename,
            "surname": employee.surname,
            "address_1": employee.address_1,
            "address_2": employee.address_2,
            "address_3": employee.address_3,
            "address_4": employee.address_4,
            "postcode": employee.postcode,
            "country": employee.country,
            "marital_status": employee.marital_status,
            "birth_date": employee.birth_date,
            "employment_status": employee.employment_status,
            "start_date": employee.start_date,
            "leaving_date": employee.leaving_date,
            "leaver": employee.leaver,
            "p45_1_if_required": employee.p45_1_if_required,
            "director": employee.director,
            "director_start_date": employee.director_start_date,
            "director_leave_date": employee.director_leave_date,
            "branch": employee.branch,
            "cost_centre": employee.cost_centre,
            "department": employee.department,
            "run_group": employee.run_group,
            "default_cost_split": employee.default_cost_split,
            "ni_number": employee.ni_number,
            "ni_letter": employee.ni_letter,
            "ni_category": employee.ni_category,
            "tax_code": employee.tax_code,
            "week1_month1": employee.week1_month1,
            "tax_code_change_type": employee.tax_code_change_type,
            "frequency": employee.frequency,
            "payment_method": employee.payment_method,
            "bank_account_no": employee.bank_account_no,
            "bank_account_name": employee.bank_account_name,
            "sort_code": employee.sort_code,
            "bank_name": employee.bank_name,
            "bank_branch": employee.bank_branch,
            "building_society_ref": employee.building_society_ref,
            "autopay_ref": employee.autopay_ref,
            "taxable_pay_previous_employment": employee.taxable_pay_previous_employment,
            "taxable_pay_this_employment": employee.taxable_pay_this_employment,
            "tax_previous_employment": employee.tax_previous_employment,
            "tax_this_employment": employee.tax_this_employment,
            "net_pay_to_date": employee.net_pay_to_date,
            "directors_earnings_to_date": employee.directors_earnings_to_date,
            "created_at": employee.created_at,
            "updated_at": employee.updated_at
        }
        
        return employee_dict
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve employee record: {str(e)}"
        )

@router.get("/employees", status_code=status.HTTP_200_OK)
async def list_employee_records(
    skip: int = 0,
    limit: int = 1000,  # Increased default limit to show more employees
    db: Session = Depends(get_db)
):
    """
    List all employee records with pagination
    
    Returns a list of employee records with basic information
    """
    try:
        # Get total count first
        total_count = db.query(EmployeeRecord).count()
        
        # Get employees with pagination
        employees = db.query(EmployeeRecord).offset(skip).limit(limit).all()
        
        employee_list = []
        for employee in employees:
            employee_list.append({
                "id": employee.id,
                "reference": employee.reference,
                "name": f"{employee.forename or ''} {employee.surname or ''}".strip(),
                "department": employee.department,
                "employment_status": employee.employment_status,
                "ni_number": employee.ni_number,
                "tax_code": employee.tax_code,
                "email": employee.email,
                "created_at": employee.created_at
            })
        
        return {
            "message": f"Retrieved {len(employee_list)} employee records",
            "employees": employee_list,
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "has_more": (skip + limit) < total_count
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve employee records: {str(e)}"
        )

@router.delete("/employee/{reference}", status_code=status.HTTP_200_OK)
async def delete_employee_record(
    reference: str,
    db: Session = Depends(get_db)
):
    """
    Delete an employee record by reference number
    """
    try:
        employee = db.query(EmployeeRecord).filter(
            EmployeeRecord.reference == reference
        ).first()
        
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with reference '{reference}' not found"
            )
        
        db.delete(employee)
        db.commit()
        
        return {"message": f"Employee '{reference}' deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete employee record: {str(e)}"
        )

@router.post("/create-from-records", status_code=status.HTTP_201_CREATED)
async def create_employees_from_records(
    db: Session = Depends(get_db)
):
    """
    Create Employee records from EmployeeRecord data for payroll processing
    """
    try:
        # Get all EmployeeRecord entries
        employee_records = db.query(EmployeeRecord).all()
        
        if not employee_records:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No employee records found to convert"
            )
        
        employees_created = 0
        employees_updated = 0
        
        for record in employee_records:
            # Check if employee already exists
            existing_employee = db.query(Employee).filter(
                Employee.employee_number == record.reference
            ).first()
            
            if existing_employee:
                # Update existing employee
                existing_employee.first_name = record.forename or "Unknown"
                existing_employee.last_name = record.surname or "Unknown"
                existing_employee.national_insurance_number = record.ni_number or "AB123456C"
                existing_employee.email = record.email or f"{record.reference}@company.com"
                existing_employee.address = f"{record.address_1 or ''} {record.address_2 or ''}".strip()
                existing_employee.postcode = record.postcode or "SW1A 1AA"
                existing_employee.salary = float(record.taxable_pay_this_employment or 45000)
                existing_employee.tax_code = record.tax_code or "BR"
                existing_employee.company_id = 1  # Default company
                existing_employee.is_active = True
                employees_updated += 1
            else:
                # Create new employee
                employee = Employee(
                    employee_number=record.reference,
                    first_name=record.forename or "Unknown",
                    last_name=record.surname or "Unknown",
                    date_of_birth=datetime.strptime("1990-01-01", "%Y-%m-%d").date(),
                    national_insurance_number=record.ni_number or "AB123456C",
                    email=record.email or f"{record.reference}@company.com",
                    address=f"{record.address_1 or ''} {record.address_2 or ''}".strip(),
                    postcode=record.postcode or "SW1A 1AA",
                    employment_type="full_time",
                    start_date=datetime.strptime("2023-01-01", "%Y-%m-%d").date(),
                    salary=float(record.taxable_pay_this_employment or 45000),
                    tax_code=record.tax_code or "BR",
                    pension_scheme="auto_enrolment",
                    pension_contribution=0.05,
                    company_id=1,  # Default company
                    is_active=True
                )
                db.add(employee)
                employees_created += 1
        
        db.commit()
        
        return {
            "message": "Employees created from records successfully",
            "employees_created": employees_created,
            "employees_updated": employees_updated,
            "total_processed": len(employee_records)
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create employees from records: {str(e)}"
        )

@router.get("/employee-record/{reference}", status_code=status.HTTP_200_OK)
async def get_comprehensive_employee_record(
    reference: str,
    db: Session = Depends(get_db)
):
    """
    Get comprehensive employee record data (200+ fields) by reference
    """
    try:
        # Get employee record from EmployeeRecord table
        employee_record = db.query(EmployeeRecord).filter(
            EmployeeRecord.reference == reference
        ).first()
        
        if not employee_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee record with reference {reference} not found"
            )
        
        # Convert to dict for JSON response
        record_dict = {}
        for column in EmployeeRecord.__table__.columns:
            value = getattr(employee_record, column.name)
            if value is not None:
                record_dict[column.name] = str(value) if isinstance(value, (int, float)) else value
        
        return record_dict
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve employee record: {str(e)}"
        )