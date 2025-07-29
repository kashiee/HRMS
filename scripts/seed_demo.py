"""
Seed script to populate database with demo data
"""

import sys
import os
from datetime import datetime, date
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent.parent / "backend"))

from database import SessionLocal, engine
from models import (
    Company, Department, Employee, Payslip,
    EmploymentType, TaxCode, PensionScheme
)

def seed_demo_data():
    """
    Seed database with demo company, departments, and employees
    """
    db = SessionLocal()
    
    try:
        print("Seeding demo data...")
        
        # Create demo company
        company = Company(
            name="TechCorp Solutions Ltd",
            registration_number="12345678",
            tax_office="123",
            address="123 Innovation Street, London, SW1A 1AA",
            postcode="SW1A 1AA",
            phone="020 7123 4567",
            email="hr@techcorp.com"
        )
        db.add(company)
        db.commit()
        db.refresh(company)
        print(f"Created company: {company.name}")
        
        # Create departments
        departments = [
            Department(
                name="Engineering",
                code="ENG",
                company_id=company.id
            ),
            Department(
                name="Sales",
                code="SALES",
                company_id=company.id
            ),
            Department(
                name="Marketing",
                code="MKTG",
                company_id=company.id
            ),
            Department(
                name="Finance",
                code="FIN",
                company_id=company.id
            ),
            Department(
                name="Human Resources",
                code="HR",
                company_id=company.id
            )
        ]
        
        for dept in departments:
            db.add(dept)
        db.commit()
        
        # Get department IDs
        eng_dept = db.query(Department).filter(Department.code == "ENG").first()
        sales_dept = db.query(Department).filter(Department.code == "SALES").first()
        mktg_dept = db.query(Department).filter(Department.code == "MKTG").first()
        fin_dept = db.query(Department).filter(Department.code == "FIN").first()
        hr_dept = db.query(Department).filter(Department.code == "HR").first()
        
        print("Created departments")
        
        # Create employees
        employees = [
            # Engineering Department
            Employee(
                employee_number="EMP001",
                first_name="Alice",
                last_name="Johnson",
                date_of_birth=date(1990, 5, 15),
                national_insurance_number="AB123456C",
                email="alice.johnson@techcorp.com",
                phone="07700 900123",
                address="456 Tech Avenue, London, W1A 1AA",
                postcode="W1A 1AA",
                employment_type=EmploymentType.FULL_TIME,
                start_date=date(2022, 1, 15),
                salary=65000.0,
                tax_code=TaxCode.BR,
                pension_scheme=PensionScheme.AUTO_ENROLMENT,
                pension_contribution=0.05,
                company_id=company.id,
                department_id=eng_dept.id
            ),
            Employee(
                employee_number="EMP002",
                first_name="Bob",
                last_name="Smith",
                date_of_birth=date(1988, 8, 22),
                national_insurance_number="CD234567D",
                email="bob.smith@techcorp.com",
                phone="07700 900124",
                address="789 Code Street, London, E1A 1AA",
                postcode="E1A 1AA",
                employment_type=EmploymentType.FULL_TIME,
                start_date=date(2022, 3, 1),
                salary=75000.0,
                tax_code=TaxCode.BR,
                pension_scheme=PensionScheme.AUTO_ENROLMENT,
                pension_contribution=0.05,
                company_id=company.id,
                department_id=eng_dept.id
            ),
            Employee(
                employee_number="EMP003",
                first_name="Charlie",
                last_name="Brown",
                date_of_birth=date(1995, 12, 10),
                national_insurance_number="EF345678E",
                email="charlie.brown@techcorp.com",
                phone="07700 900125",
                address="321 Developer Road, London, N1A 1AA",
                postcode="N1A 1AA",
                employment_type=EmploymentType.PART_TIME,
                start_date=date(2022, 6, 15),
                salary=45000.0,
                hourly_rate=25.0,
                tax_code=TaxCode.BR,
                pension_scheme=PensionScheme.AUTO_ENROLMENT,
                pension_contribution=0.05,
                company_id=company.id,
                department_id=eng_dept.id
            ),
            
            # Sales Department
            Employee(
                employee_number="EMP004",
                first_name="Diana",
                last_name="Wilson",
                date_of_birth=date(1985, 3, 8),
                national_insurance_number="GH456789F",
                email="diana.wilson@techcorp.com",
                phone="07700 900126",
                address="654 Sales Lane, London, SE1A 1AA",
                postcode="SE1A 1AA",
                employment_type=EmploymentType.FULL_TIME,
                start_date=date(2021, 11, 1),
                salary=55000.0,
                tax_code=TaxCode.BR,
                pension_scheme=PensionScheme.AUTO_ENROLMENT,
                pension_contribution=0.05,
                company_id=company.id,
                department_id=sales_dept.id
            ),
            Employee(
                employee_number="EMP005",
                first_name="Edward",
                last_name="Davis",
                date_of_birth=date(1992, 7, 20),
                national_insurance_number="IJ567890G",
                email="edward.davis@techcorp.com",
                phone="07700 900127",
                address="987 Revenue Street, London, SW2A 1AA",
                postcode="SW2A 1AA",
                employment_type=EmploymentType.FULL_TIME,
                start_date=date(2022, 2, 10),
                salary=60000.0,
                tax_code=TaxCode.BR,
                pension_scheme=PensionScheme.AUTO_ENROLMENT,
                pension_contribution=0.05,
                company_id=company.id,
                department_id=sales_dept.id
            ),
            
            # Marketing Department
            Employee(
                employee_number="EMP006",
                first_name="Fiona",
                last_name="Taylor",
                date_of_birth=date(1993, 4, 12),
                national_insurance_number="KL678901H",
                email="fiona.taylor@techcorp.com",
                phone="07700 900128",
                address="147 Brand Avenue, London, W2A 1AA",
                postcode="W2A 1AA",
                employment_type=EmploymentType.FULL_TIME,
                start_date=date(2022, 4, 1),
                salary=52000.0,
                tax_code=TaxCode.BR,
                pension_scheme=PensionScheme.AUTO_ENROLMENT,
                pension_contribution=0.05,
                company_id=company.id,
                department_id=mktg_dept.id
            ),
            
            # Finance Department
            Employee(
                employee_number="EMP007",
                first_name="George",
                last_name="Anderson",
                date_of_birth=date(1987, 9, 25),
                national_insurance_number="MN789012I",
                email="george.anderson@techcorp.com",
                phone="07700 900129",
                address="258 Finance Road, London, EC1A 1AA",
                postcode="EC1A 1AA",
                employment_type=EmploymentType.FULL_TIME,
                start_date=date(2021, 8, 15),
                salary=70000.0,
                tax_code=TaxCode.BR,
                pension_scheme=PensionScheme.AUTO_ENROLMENT,
                pension_contribution=0.05,
                company_id=company.id,
                department_id=fin_dept.id
            ),
            
            # HR Department
            Employee(
                employee_number="EMP008",
                first_name="Hannah",
                last_name="Martinez",
                date_of_birth=date(1991, 11, 3),
                national_insurance_number="OP890123J",
                email="hannah.martinez@techcorp.com",
                phone="07700 900130",
                address="369 HR Street, London, WC1A 1AA",
                postcode="WC1A 1AA",
                employment_type=EmploymentType.FULL_TIME,
                start_date=date(2022, 1, 1),
                salary=58000.0,
                tax_code=TaxCode.BR,
                pension_scheme=PensionScheme.AUTO_ENROLMENT,
                pension_contribution=0.05,
                company_id=company.id,
                department_id=hr_dept.id
            ),
            
            # Contractor
            Employee(
                employee_number="EMP009",
                first_name="Ian",
                last_name="Thompson",
                date_of_birth=date(1989, 6, 18),
                national_insurance_number="QR901234K",
                email="ian.thompson@techcorp.com",
                phone="07700 900131",
                address="741 Contract Lane, London, N2A 1AA",
                postcode="N2A 1AA",
                employment_type=EmploymentType.CONTRACTOR,
                start_date=date(2022, 5, 1),
                end_date=date(2024, 5, 1),
                salary=80000.0,
                hourly_rate=45.0,
                tax_code=TaxCode.BR,
                pension_scheme=PensionScheme.NONE,
                pension_contribution=0.0,
                company_id=company.id,
                department_id=eng_dept.id
            ),
            
            # Temporary Employee
            Employee(
                employee_number="EMP010",
                first_name="Julia",
                last_name="Roberts",
                date_of_birth=date(1994, 2, 14),
                national_insurance_number="ST012345L",
                email="julia.roberts@techcorp.com",
                phone="07700 900132",
                address="852 Temp Street, London, SE2A 1AA",
                postcode="SE2A 1AA",
                employment_type=EmploymentType.TEMPORARY,
                start_date=date(2023, 1, 1),
                end_date=date(2023, 12, 31),
                salary=35000.0,
                hourly_rate=20.0,
                tax_code=TaxCode.BR,
                pension_scheme=PensionScheme.AUTO_ENROLMENT,
                pension_contribution=0.05,
                company_id=company.id,
                department_id=mktg_dept.id
            )
        ]
        
        for employee in employees:
            db.add(employee)
        db.commit()
        
        print(f"✅ Created {len(employees)} employees")
        
        # Create some sample payslips for demonstration
        print("📊 Creating sample payslips...")
        
        # Get current month for sample payslips
        current_date = datetime.now()
        pay_period_start = date(current_date.year, current_date.month, 1)
        pay_period_end = date(current_date.year, current_date.month, 28)  # Simplified
        pay_date = pay_period_end
        
        sample_payslips = []
        
        for employee in employees[:5]:  # Create payslips for first 5 employees
            # Calculate basic pay (monthly salary / 12)
            monthly_salary = employee.salary / 12
            basic_pay = monthly_salary
            
            # Mock calculations (in production, use the calc service)
            gross_pay = basic_pay
            paye_tax = gross_pay * 0.20  # Simplified 20% tax
            ni_contribution = gross_pay * 0.12  # Simplified 12% NI
            pension_contribution = gross_pay * employee.pension_contribution
            net_pay = gross_pay - paye_tax - ni_contribution - pension_contribution
            
            payslip = Payslip(
                employee_id=employee.id,
                pay_period_start=pay_period_start,
                pay_period_end=pay_period_end,
                pay_date=pay_date,
                basic_pay=basic_pay,
                overtime_pay=0.0,
                bonus_pay=0.0,
                other_pay=0.0,
                gross_pay=gross_pay,
                paye_tax=paye_tax,
                national_insurance=ni_contribution,
                pension_contribution=pension_contribution,
                student_loan=0.0,
                other_deductions=0.0,
                net_pay=net_pay,
                rti_submitted=False
            )
            
            sample_payslips.append(payslip)
            db.add(payslip)
        
        db.commit()
        print(f" Created {len(sample_payslips)} sample payslips")
        
        print("\n🎉 Demo data seeding completed successfully!")
        print(f"📋 Summary:")
        print(f"   - Company: {company.name}")
        print(f"   - Departments: {len(departments)}")
        print(f"   - Employees: {len(employees)}")
        print(f"   - Sample Payslips: {len(sample_payslips)}")
        print(f"\n🔗 API Endpoints:")
        print(f"   - Health check: http://localhost:8000/health")
        print(f"   - Companies: http://localhost:8000/api/v1/company/")
        print(f"   - Employees: http://localhost:8000/api/v1/employee/")
        print(f"   - Payroll: http://localhost:8000/api/v1/payroll/")
        print(f"   - NLP: http://localhost:8000/api/v1/nlp/")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_data() 