"""
Payroll calculation service for UK PAYE, NI, and pension calculations
"""

from typing import Dict, Any
from datetime import date
import math

# UK Tax Rates 2024/25 (simplified for PoC)
TAX_RATES = {
    'basic_rate': 0.20,      # 20% on £12,571 to £50,270
    'higher_rate': 0.40,     # 40% on £50,271 to £125,140
    'additional_rate': 0.45  # 45% on over £125,140
}

TAX_BANDS = {
    'personal_allowance': 12570,
    'basic_rate_limit': 50270,
    'higher_rate_limit': 125140
}

# NI Rates 2024/25
NI_RATES = {
    'employee_rate': 0.12,   # 12% on £12,570 to £50,270
    'employee_higher_rate': 0.02,  # 2% on earnings over £50,270
    'employer_rate': 0.138   # 13.8% on earnings over £9,100
}

NI_THRESHOLDS = {
    'primary_threshold': 12570,
    'upper_earnings_limit': 50270,
    'employer_threshold': 9100
}

# Pension rates
PENSION_RATES = {
    'auto_enrolment': 0.05,  # 5% employee contribution
    'employer_auto_enrolment': 0.03,  # 3% employer contribution
    'workplace_pension': 0.05,  # 5% employee contribution
    'nest': 0.05  # 5% employee contribution
}

async def calculate_payroll(employee: Any, payslip_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate payroll for an employee including PAYE, NI, and pension
    
    Args:
        employee: Employee model instance
        payslip_data: Dictionary containing basic payslip data
    
    Returns:
        Dictionary with calculated payroll values
    """
    # Extract basic pay components
    basic_pay = payslip_data.get('basic_pay', 0.0)
    overtime_pay = payslip_data.get('overtime_pay', 0.0)
    bonus_pay = payslip_data.get('bonus_pay', 0.0)
    other_pay = payslip_data.get('other_pay', 0.0)
    
    # Calculate gross pay
    gross_pay = basic_pay + overtime_pay + bonus_pay + other_pay
    
    # Calculate PAYE tax
    paye_tax = calculate_paye_tax(employee, gross_pay)
    
    # Calculate National Insurance
    ni_contribution = calculate_ni_contribution(employee, gross_pay)
    
    # Calculate pension contribution
    pension_contribution = calculate_pension_contribution(employee, gross_pay)
    
    # Calculate student loan (simplified)
    student_loan = calculate_student_loan(employee, gross_pay)
    
    # Calculate other deductions
    other_deductions = 0.0  # Placeholder for other deductions
    
    # Calculate net pay
    net_pay = gross_pay - paye_tax - ni_contribution - pension_contribution - student_loan - other_deductions
    
    return {
        'gross_pay': round(gross_pay, 2),
        'paye_tax': round(paye_tax, 2),
        'national_insurance': round(ni_contribution, 2),
        'pension_contribution': round(pension_contribution, 2),
        'student_loan': round(student_loan, 2),
        'other_deductions': round(other_deductions, 2),
        'net_pay': round(net_pay, 2)
    }

def calculate_paye_tax(employee: Any, gross_pay: float) -> float:
    """
    Calculate PAYE tax based on UK tax bands and employee's tax code
    """
    # Get employee's annual salary for tax calculation
    annual_salary = employee.salary
    
    # Apply tax code adjustments (simplified)
    tax_code = employee.tax_code
    personal_allowance = TAX_BANDS['personal_allowance']
    
    # Adjust personal allowance based on tax code
    if tax_code == 'NT':
        personal_allowance = 0
    elif tax_code.startswith('S'):  # Scottish rates (simplified)
        # Use same rates for PoC
        pass
    
    # Calculate taxable income
    taxable_income = max(0, annual_salary - personal_allowance)
    
    # Calculate tax by band
    tax = 0.0
    
    # Basic rate band
    basic_rate_taxable = min(taxable_income, TAX_BANDS['basic_rate_limit'] - personal_allowance)
    if basic_rate_taxable > 0:
        tax += basic_rate_taxable * TAX_RATES['basic_rate']
    
    # Higher rate band
    if taxable_income > (TAX_BANDS['basic_rate_limit'] - personal_allowance):
        higher_rate_taxable = min(
            taxable_income - (TAX_BANDS['basic_rate_limit'] - personal_allowance),
            TAX_BANDS['higher_rate_limit'] - TAX_BANDS['basic_rate_limit']
        )
        if higher_rate_taxable > 0:
            tax += higher_rate_taxable * TAX_RATES['higher_rate']
    
    # Additional rate band
    if taxable_income > (TAX_BANDS['higher_rate_limit'] - personal_allowance):
        additional_rate_taxable = taxable_income - (TAX_BANDS['higher_rate_limit'] - personal_allowance)
        if additional_rate_taxable > 0:
            tax += additional_rate_taxable * TAX_RATES['additional_rate']
    
    # Convert annual tax to monthly
    monthly_tax = tax / 12
    
    return monthly_tax

def calculate_ni_contribution(employee: Any, gross_pay: float) -> float:
    """
    Calculate National Insurance contributions
    """
    # Get employee's annual salary for NI calculation
    annual_salary = employee.salary
    
    # Calculate monthly NI
    monthly_salary = annual_salary / 12
    
    ni_contribution = 0.0
    
    # Employee NI contributions
    if monthly_salary > (NI_THRESHOLDS['primary_threshold'] / 12):
        # Basic rate NI
        basic_ni_taxable = min(
            monthly_salary - (NI_THRESHOLDS['primary_threshold'] / 12),
            (NI_THRESHOLDS['upper_earnings_limit'] - NI_THRESHOLDS['primary_threshold']) / 12
        )
        if basic_ni_taxable > 0:
            ni_contribution += basic_ni_taxable * NI_RATES['employee_rate']
        
        # Higher rate NI (2% on earnings over upper limit)
        if monthly_salary > (NI_THRESHOLDS['upper_earnings_limit'] / 12):
            higher_ni_taxable = monthly_salary - (NI_THRESHOLDS['upper_earnings_limit'] / 12)
            ni_contribution += higher_ni_taxable * NI_RATES['employee_higher_rate']
    
    return ni_contribution

def calculate_pension_contribution(employee: Any, gross_pay: float) -> float:
    """
    Calculate pension contributions based on scheme type
    """
    pension_scheme = employee.pension_scheme
    pension_rate = employee.pension_contribution
    
    if pension_scheme == 'none':
        return 0.0
    
    # Calculate pension contribution
    pension_contribution = gross_pay * pension_rate
    
    return pension_contribution

def calculate_student_loan(employee: Any, gross_pay: float) -> float:
    """
    Calculate student loan repayments (simplified)
    """
    # This is a simplified calculation
    # In reality, student loan calculations are complex and depend on:
    # - Plan type (1, 2, 4, 5)
    # - Repayment threshold
    # - Interest rates
    # - Previous repayments
    
    # For PoC, assume 9% on earnings over £27,295 (Plan 2 threshold)
    student_loan_threshold = 27295 / 12  # Monthly threshold
    
    if gross_pay > student_loan_threshold:
        student_loan = (gross_pay - student_loan_threshold) * 0.09
        return student_loan
    
    return 0.0

def calculate_employer_ni(employee: Any, gross_pay: float) -> float:
    """
    Calculate employer's National Insurance contribution
    """
    # Get employee's annual salary
    annual_salary = employee.salary
    monthly_salary = annual_salary / 12
    
    employer_ni = 0.0
    
    # Employer NI (13.8% on earnings over £9,100 annually)
    if monthly_salary > (NI_THRESHOLDS['employer_threshold'] / 12):
        employer_ni_taxable = monthly_salary - (NI_THRESHOLDS['employer_threshold'] / 12)
        employer_ni = employer_ni_taxable * NI_RATES['employer_rate']
    
    return employer_ni

def calculate_employer_pension(employee: Any, gross_pay: float) -> float:
    """
    Calculate employer's pension contribution
    """
    pension_scheme = employee.pension_scheme
    
    if pension_scheme == 'auto_enrolment':
        return gross_pay * PENSION_RATES['employer_auto_enrolment']
    elif pension_scheme == 'workplace_pension':
        return gross_pay * 0.03  # 3% employer contribution
    elif pension_scheme == 'nest':
        return gross_pay * 0.03  # 3% employer contribution
    else:
        return 0.0

def validate_tax_code(tax_code: str) -> bool:
    """
    Validate UK tax code format
    """
    valid_codes = ['BR', 'D0', 'D1', 'NT', 'SBR', 'SD0', 'SD1']
    return tax_code in valid_codes

def validate_ni_number(ni_number: str) -> bool:
    """
    Validate National Insurance number format
    """
    # Basic validation for PoC
    if len(ni_number) != 9:
        return False
    
    # Check format: 2 letters, 6 digits, 1 letter
    if not (ni_number[0:2].isalpha() and ni_number[2:8].isdigit() and ni_number[8].isalpha()):
        return False
    
    return True 