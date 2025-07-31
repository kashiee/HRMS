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

# Comprehensive Employee Data Models for CSV Import
class EmployeeData(BaseModel):
    """Comprehensive employee data model for CSV import with all 139 fields"""
    
    # Basic Information
    reference: Optional[str] = None
    gender: Optional[str] = None
    title: Optional[str] = None
    forename: Optional[str] = None
    surname: Optional[str] = None
    
    # Address Information
    address_1: Optional[str] = None
    address_2: Optional[str] = None
    address_3: Optional[str] = None
    address_4: Optional[str] = None
    postcode: Optional[str] = None
    country: Optional[str] = None
    
    # Personal Information
    marital_status: Optional[str] = None
    birth_date: Optional[str] = None
    
    # Employment Information
    employment_status: Optional[str] = None
    start_date: Optional[str] = None
    leaving_date: Optional[str] = None
    leaver: Optional[str] = None
    p45_1_if_required: Optional[str] = None
    
    # Directorship Information
    director: Optional[str] = None
    director_start_date: Optional[str] = None
    director_leave_date: Optional[str] = None
    
    # Organizational Information
    branch: Optional[str] = None
    cost_centre: Optional[str] = None
    department: Optional[str] = None
    run_group: Optional[str] = None
    default_cost_split: Optional[str] = None
    
    # National Insurance
    ni_number: Optional[str] = None
    ni_letter: Optional[str] = None
    ni_category: Optional[str] = None
    
    # Tax Information
    tax_code: Optional[str] = None
    week1_month1: Optional[str] = None
    tax_code_change_type: Optional[str] = None
    
    # Payment Information
    frequency: Optional[str] = None
    payment_method: Optional[str] = None
    
    # Banking Information
    bank_account_no: Optional[str] = None
    bank_account_name: Optional[str] = None
    sort_code: Optional[str] = None
    bank_name: Optional[str] = None
    bank_branch: Optional[str] = None
    building_society_ref: Optional[str] = None
    autopay_ref: Optional[str] = None
    
    # Payroll Information
    taxable_pay_previous_employment: Optional[str] = None
    taxable_pay_this_employment: Optional[str] = None
    tax_previous_employment: Optional[str] = None
    tax_this_employment: Optional[str] = None
    net_pay_to_date: Optional[str] = None
    directors_earnings_to_date: Optional[str] = None
    
    # National Insurance Breakdown
    bf_ni_letter: Optional[str] = None
    bf_ni_calculation_basis: Optional[str] = None
    bf_total_earnings: Optional[str] = None
    bf_earnings_to_set: Optional[str] = None
    bf_earnings_to_lel: Optional[str] = None
    bf_earnings_to_pet: Optional[str] = None
    bf_earnings_to_fust: Optional[str] = None
    bf_earnings_to_ust: Optional[str] = None
    bf_earnings_above_uel: Optional[str] = None
    bf_ee_contributions_pt1: Optional[str] = None
    bf_ee_contributions_pt2: Optional[str] = None
    bf_er_contributions: Optional[str] = None
    
    # Student Loan Information
    student_loan_repayment_plan: Optional[str] = None
    student_loan_from_date: Optional[str] = None
    student_loan_to_date: Optional[str] = None
    student_loan_deducted: Optional[str] = None
    
    # Contact Information
    email: Optional[str] = None
    
    # Additional Employment Information
    ee_ni_pd_by_er_td: Optional[str] = None
    expat_exempt: Optional[str] = None
    date_of_arrival: Optional[str] = None
    tax_exempt_pcnt: Optional[str] = None
    tax_exempt_income_td: Optional[str] = None
    tax_exempt_gu_income_td: Optional[str] = None
    ee_gu_override: Optional[str] = None
    calc_ee_gross_to_net_first: Optional[str] = None
    no_ni_gu: Optional[str] = None
    gross_up_pension_contribs: Optional[str] = None
    gu_student_loan: Optional[str] = None
    double_tax_agreement: Optional[str] = None
    foreign_tax_credit: Optional[str] = None
    uk_tax_ytd: Optional[str] = None
    foreign_tax_ytd: Optional[str] = None
    foreign_tax_offset_ytd: Optional[str] = None
    epm6_override: Optional[str] = None
    gu_postgraduate_loan: Optional[str] = None
    transfer_date: Optional[str] = None
    standard_hours: Optional[str] = None
    
    # Worker Information
    worker_subject_to_postponement_period: Optional[str] = None
    postponement_end_date: Optional[str] = None
    postponement_period_part_periods_allowed: Optional[str] = None
    jobholder_opt_in_notice_received: Optional[str] = None
    entitled_worker_active_membership_start: Optional[str] = None
    
    # Identity Information
    passport_number: Optional[str] = None
    starting_declaration: Optional[str] = None
    irregular_employment: Optional[str] = None
    omit_from_rti: Optional[str] = None
    payment_to_a_non_individual: Optional[str] = None
    old_rti_ee_reference: Optional[str] = None
    off_payroll_worker: Optional[str] = None
    
    # P45 Information
    p45_3_tax_office_number: Optional[str] = None
    p45_3_tax_office_reference: Optional[str] = None
    p45_3_leave_date: Optional[str] = None
    p45_3_tax_code: Optional[str] = None
    p45_3_week1_month1: Optional[str] = None
    p45_3_tax_period_monthly_weekly: Optional[str] = None
    p45_3_tax_period_period_number: Optional[str] = None
    p45_3_previous_tax_year: Optional[str] = None
    p45_3_previous_pay: Optional[str] = None
    p45_3_previous_tax: Optional[str] = None
    p45_3_student_loan: Optional[str] = None
    p45_3_student_loan_repayment_plan: Optional[str] = None
    p45_3_postgraduate_loan_indicator: Optional[str] = None
    
    # P46 Information
    p46_statement_a_b_or_c: Optional[str] = None
    p46_student_loans_indicator: Optional[str] = None
    p46_student_loan_repayment_plan: Optional[str] = None
    p46_postgraduate_loan_indicator: Optional[str] = None
    
    # P46 Pension Information
    p46_pen_tax_office_number: Optional[str] = None
    p46_pen_tax_office_reference: Optional[str] = None
    p46_pen_leave_date: Optional[str] = None
    p46_pen_tax_code: Optional[str] = None
    p46_pen_week1_month1: Optional[str] = None
    p46_pen_tax_period_monthly_weekly: Optional[str] = None
    p46_pen_tax_period_period_number: Optional[str] = None
    p46_pen_previous_tax_year: Optional[str] = None
    p46_pen_previous_pay: Optional[str] = None
    p46_pen_previous_tax: Optional[str] = None
    p46_pen_annual_pension: Optional[str] = None
    p46_pen_is_recently_bereaved: Optional[str] = None
    
    # P46 Expat Information
    p46_expat_statement_a_b_or_c: Optional[str] = None
    p46_expat_student_loan_indicator: Optional[str] = None
    p46_expat_student_loan_repayment_plan: Optional[str] = None
    p46_expat_eea_or_commonwealth_citizen: Optional[str] = None
    p46_expat_epm6_scheme: Optional[str] = None
    p46_expat_postgrad_loan_indicator: Optional[str] = None
    
    # Termination Information
    termination_class_1a_earnings: Optional[str] = None
    termination_class_1a_nics: Optional[str] = None
    sporting_class_1a_earnings: Optional[str] = None
    sporting_class_1a_nics: Optional[str] = None
    
    # Postgraduate Loan Information
    postgraduate_loan_start_date: Optional[str] = None
    postgraduate_loan_stop_date: Optional[str] = None
    postgraduate_loan_deducted_ytd: Optional[str] = None
    
    # Additional Fields
    working_in_a_freeport: Optional[str] = None
    working_in_an_investment_zone: Optional[str] = None
    workplace_postcode: Optional[str] = None
    veterans_first_civilian_employment: Optional[str] = None

# National Insurance Details Models
class EmployeeNIDetails(BaseModel):
    """Comprehensive National Insurance details model for NI earnings and calculations"""
    
    # Basic Employee Information
    reference: Optional[str] = None
    gender: Optional[str] = None
    title: Optional[str] = None
    forename: Optional[str] = None
    surname: Optional[str] = None
    
    # National Insurance Information
    ni_letter: Optional[str] = None
    ni_calculation_basis: Optional[str] = None
    total_earnings: Optional[str] = None
    earnings_to_set: Optional[str] = None
    earnings_to_lel: Optional[str] = None
    earnings_to_pet: Optional[str] = None
    earnings_to_fust: Optional[str] = None
    earnings_to_ust: Optional[str] = None
    earnings_above_uel: Optional[str] = None
    ee_contributions_pt1: Optional[str] = None
    ee_contributions_pt2: Optional[str] = None
    er_contributions: Optional[str] = None
    
    # NI Breakdown by Period
    ni_letter_bf: Optional[str] = None
    ni_calculation_basis_bf: Optional[str] = None
    total_earnings_bf: Optional[str] = None
    earnings_to_set_bf: Optional[str] = None
    earnings_to_lel_bf: Optional[str] = None
    earnings_to_pet_bf: Optional[str] = None
    earnings_to_fust_bf: Optional[str] = None
    earnings_to_ust_bf: Optional[str] = None
    earnings_above_uel_bf: Optional[str] = None
    ee_contributions_pt1_bf: Optional[str] = None
    ee_contributions_pt2_bf: Optional[str] = None
    er_contributions_bf: Optional[str] = None
    
    # Current Period NI
    ni_letter_current: Optional[str] = None
    ni_calculation_basis_current: Optional[str] = None
    total_earnings_current: Optional[str] = None
    earnings_to_set_current: Optional[str] = None
    earnings_to_lel_current: Optional[str] = None
    earnings_to_pet_current: Optional[str] = None
    earnings_to_fust_current: Optional[str] = None
    earnings_to_ust_current: Optional[str] = None
    earnings_above_uel_current: Optional[str] = None
    ee_contributions_pt1_current: Optional[str] = None
    ee_contributions_pt2_current: Optional[str] = None
    er_contributions_current: Optional[str] = None
    
    # NI Year to Date
    ni_letter_ytd: Optional[str] = None
    ni_calculation_basis_ytd: Optional[str] = None
    total_earnings_ytd: Optional[str] = None
    earnings_to_set_ytd: Optional[str] = None
    earnings_to_lel_ytd: Optional[str] = None
    earnings_to_pet_ytd: Optional[str] = None
    earnings_to_fust_ytd: Optional[str] = None
    earnings_to_ust_ytd: Optional[str] = None
    earnings_above_uel_ytd: Optional[str] = None
    ee_contributions_pt1_ytd: Optional[str] = None
    ee_contributions_pt2_ytd: Optional[str] = None
    er_contributions_ytd: Optional[str] = None
    
    # NI Thresholds and Limits
    lel_threshold: Optional[str] = None
    pet_threshold: Optional[str] = None
    fust_threshold: Optional[str] = None
    uel_threshold: Optional[str] = None
    ust_threshold: Optional[str] = None
    
    # NI Rates
    ee_rate_pt1: Optional[str] = None
    ee_rate_pt2: Optional[str] = None
    er_rate: Optional[str] = None
    
    # Additional NI Information
    ni_category: Optional[str] = None
    ni_exemption: Optional[str] = None
    ni_deferment: Optional[str] = None
    ni_deferment_certificate: Optional[str] = None
    ni_contracted_out: Optional[str] = None
    ni_contracted_out_rate: Optional[str] = None
    
    # Employment Status for NI
    employment_status: Optional[str] = None
    start_date: Optional[str] = None
    leaving_date: Optional[str] = None
    leaver: Optional[str] = None
    
    # Department and Organizational Info
    department: Optional[str] = None
    cost_centre: Optional[str] = None
    branch: Optional[str] = None
    
    # Contact Information
    email: Optional[str] = None
    address_1: Optional[str] = None
    address_2: Optional[str] = None
    address_3: Optional[str] = None
    address_4: Optional[str] = None
    postcode: Optional[str] = None
    country: Optional[str] = None

class EmployeeNIRecord(Base):
    """Comprehensive National Insurance record model for database storage"""
    __tablename__ = "employee_ni_records"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic Employee Information
    reference = Column(String(50), unique=True, nullable=True)
    gender = Column(String(10), nullable=True)
    title = Column(String(20), nullable=True)
    forename = Column(String(100), nullable=True)
    surname = Column(String(100), nullable=True)
    
    # National Insurance Information
    ni_letter = Column(String(10), nullable=True)
    ni_calculation_basis = Column(String(50), nullable=True)
    total_earnings = Column(String(20), nullable=True)
    earnings_to_set = Column(String(20), nullable=True)
    earnings_to_lel = Column(String(20), nullable=True)
    earnings_to_pet = Column(String(20), nullable=True)
    earnings_to_fust = Column(String(20), nullable=True)
    earnings_to_ust = Column(String(20), nullable=True)
    earnings_above_uel = Column(String(20), nullable=True)
    ee_contributions_pt1 = Column(String(20), nullable=True)
    ee_contributions_pt2 = Column(String(20), nullable=True)
    er_contributions = Column(String(20), nullable=True)
    
    # NI Breakdown by Period
    ni_letter_bf = Column(String(10), nullable=True)
    ni_calculation_basis_bf = Column(String(50), nullable=True)
    total_earnings_bf = Column(String(20), nullable=True)
    earnings_to_set_bf = Column(String(20), nullable=True)
    earnings_to_lel_bf = Column(String(20), nullable=True)
    earnings_to_pet_bf = Column(String(20), nullable=True)
    earnings_to_fust_bf = Column(String(20), nullable=True)
    earnings_to_ust_bf = Column(String(20), nullable=True)
    earnings_above_uel_bf = Column(String(20), nullable=True)
    ee_contributions_pt1_bf = Column(String(20), nullable=True)
    ee_contributions_pt2_bf = Column(String(20), nullable=True)
    er_contributions_bf = Column(String(20), nullable=True)
    
    # Current Period NI
    ni_letter_current = Column(String(10), nullable=True)
    ni_calculation_basis_current = Column(String(50), nullable=True)
    total_earnings_current = Column(String(20), nullable=True)
    earnings_to_set_current = Column(String(20), nullable=True)
    earnings_to_lel_current = Column(String(20), nullable=True)
    earnings_to_pet_current = Column(String(20), nullable=True)
    earnings_to_fust_current = Column(String(20), nullable=True)
    earnings_to_ust_current = Column(String(20), nullable=True)
    earnings_above_uel_current = Column(String(20), nullable=True)
    ee_contributions_pt1_current = Column(String(20), nullable=True)
    ee_contributions_pt2_current = Column(String(20), nullable=True)
    er_contributions_current = Column(String(20), nullable=True)
    
    # NI Year to Date
    ni_letter_ytd = Column(String(10), nullable=True)
    ni_calculation_basis_ytd = Column(String(50), nullable=True)
    total_earnings_ytd = Column(String(20), nullable=True)
    earnings_to_set_ytd = Column(String(20), nullable=True)
    earnings_to_lel_ytd = Column(String(20), nullable=True)
    earnings_to_pet_ytd = Column(String(20), nullable=True)
    earnings_to_fust_ytd = Column(String(20), nullable=True)
    earnings_to_ust_ytd = Column(String(20), nullable=True)
    earnings_above_uel_ytd = Column(String(20), nullable=True)
    ee_contributions_pt1_ytd = Column(String(20), nullable=True)
    ee_contributions_pt2_ytd = Column(String(20), nullable=True)
    er_contributions_ytd = Column(String(20), nullable=True)
    
    # NI Thresholds and Limits
    lel_threshold = Column(String(20), nullable=True)
    pet_threshold = Column(String(20), nullable=True)
    fust_threshold = Column(String(20), nullable=True)
    uel_threshold = Column(String(20), nullable=True)
    ust_threshold = Column(String(20), nullable=True)
    
    # NI Rates
    ee_rate_pt1 = Column(String(10), nullable=True)
    ee_rate_pt2 = Column(String(10), nullable=True)
    er_rate = Column(String(10), nullable=True)
    
    # Additional NI Information
    ni_category = Column(String(10), nullable=True)
    ni_exemption = Column(String(5), nullable=True)
    ni_deferment = Column(String(5), nullable=True)
    ni_deferment_certificate = Column(String(50), nullable=True)
    ni_contracted_out = Column(String(5), nullable=True)
    ni_contracted_out_rate = Column(String(10), nullable=True)
    
    # Employment Status for NI
    employment_status = Column(String(20), nullable=True)
    start_date = Column(String(20), nullable=True)
    leaving_date = Column(String(20), nullable=True)
    leaver = Column(String(5), nullable=True)
    
    # Department and Organizational Info
    department = Column(String(100), nullable=True)
    cost_centre = Column(String(50), nullable=True)
    branch = Column(String(50), nullable=True)
    
    # Contact Information
    email = Column(String(255), nullable=True)
    address_1 = Column(Text, nullable=True)
    address_2 = Column(Text, nullable=True)
    address_3 = Column(Text, nullable=True)
    address_4 = Column(Text, nullable=True)
    postcode = Column(String(20), nullable=True)
    country = Column(String(50), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class EmployeeRecord(Base):
    """Comprehensive employee record model for storing all CSV data"""
    __tablename__ = "employee_records"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic Information
    reference = Column(String(50), unique=True, nullable=True)
    gender = Column(String(10), nullable=True)
    title = Column(String(20), nullable=True)
    forename = Column(String(100), nullable=True)
    surname = Column(String(100), nullable=True)
    
    # Address Information
    address_1 = Column(Text, nullable=True)
    address_2 = Column(Text, nullable=True)
    address_3 = Column(Text, nullable=True)
    address_4 = Column(Text, nullable=True)
    postcode = Column(String(20), nullable=True)
    country = Column(String(50), nullable=True)
    
    # Personal Information
    marital_status = Column(String(20), nullable=True)
    birth_date = Column(String(20), nullable=True)
    
    # Employment Information
    employment_status = Column(String(20), nullable=True)
    start_date = Column(String(20), nullable=True)
    leaving_date = Column(String(20), nullable=True)
    leaver = Column(String(5), nullable=True)
    p45_1_if_required = Column(String(5), nullable=True)
    
    # Directorship Information
    director = Column(String(5), nullable=True)
    director_start_date = Column(String(20), nullable=True)
    director_leave_date = Column(String(20), nullable=True)
    
    # Organizational Information
    branch = Column(String(50), nullable=True)
    cost_centre = Column(String(50), nullable=True)
    department = Column(String(100), nullable=True)
    run_group = Column(String(50), nullable=True)
    default_cost_split = Column(String(50), nullable=True)
    
    # National Insurance
    ni_number = Column(String(20), nullable=True)
    ni_letter = Column(String(10), nullable=True)
    ni_category = Column(String(10), nullable=True)
    
    # Tax Information
    tax_code = Column(String(20), nullable=True)
    week1_month1 = Column(String(10), nullable=True)
    tax_code_change_type = Column(String(50), nullable=True)
    
    # Payment Information
    frequency = Column(String(20), nullable=True)
    payment_method = Column(String(50), nullable=True)
    
    # Banking Information
    bank_account_no = Column(String(20), nullable=True)
    bank_account_name = Column(String(100), nullable=True)
    sort_code = Column(String(20), nullable=True)
    bank_name = Column(String(100), nullable=True)
    bank_branch = Column(String(100), nullable=True)
    building_society_ref = Column(String(50), nullable=True)
    autopay_ref = Column(String(50), nullable=True)
    
    # Payroll Information
    taxable_pay_previous_employment = Column(String(20), nullable=True)
    taxable_pay_this_employment = Column(String(20), nullable=True)
    tax_previous_employment = Column(String(20), nullable=True)
    tax_this_employment = Column(String(20), nullable=True)
    net_pay_to_date = Column(String(20), nullable=True)
    directors_earnings_to_date = Column(String(20), nullable=True)
    
    # National Insurance Breakdown
    bf_ni_letter = Column(String(10), nullable=True)
    bf_ni_calculation_basis = Column(String(50), nullable=True)
    bf_total_earnings = Column(String(20), nullable=True)
    bf_earnings_to_set = Column(String(20), nullable=True)
    bf_earnings_to_lel = Column(String(20), nullable=True)
    bf_earnings_to_pet = Column(String(20), nullable=True)
    bf_earnings_to_fust = Column(String(20), nullable=True)
    bf_earnings_to_ust = Column(String(20), nullable=True)
    bf_earnings_above_uel = Column(String(20), nullable=True)
    bf_ee_contributions_pt1 = Column(String(20), nullable=True)
    bf_ee_contributions_pt2 = Column(String(20), nullable=True)
    bf_er_contributions = Column(String(20), nullable=True)
    
    # Student Loan Information
    student_loan_repayment_plan = Column(String(20), nullable=True)
    student_loan_from_date = Column(String(20), nullable=True)
    student_loan_to_date = Column(String(20), nullable=True)
    student_loan_deducted = Column(String(20), nullable=True)
    
    # Contact Information
    email = Column(String(255), nullable=True)
    
    # Additional Employment Information
    ee_ni_pd_by_er_td = Column(String(5), nullable=True)
    expat_exempt = Column(String(5), nullable=True)
    date_of_arrival = Column(String(20), nullable=True)
    tax_exempt_pcnt = Column(String(20), nullable=True)
    tax_exempt_income_td = Column(String(20), nullable=True)
    tax_exempt_gu_income_td = Column(String(20), nullable=True)
    ee_gu_override = Column(String(5), nullable=True)
    calc_ee_gross_to_net_first = Column(String(5), nullable=True)
    no_ni_gu = Column(String(5), nullable=True)
    gross_up_pension_contribs = Column(String(5), nullable=True)
    gu_student_loan = Column(String(5), nullable=True)
    double_tax_agreement = Column(String(5), nullable=True)
    foreign_tax_credit = Column(String(5), nullable=True)
    uk_tax_ytd = Column(String(20), nullable=True)
    foreign_tax_ytd = Column(String(20), nullable=True)
    foreign_tax_offset_ytd = Column(String(20), nullable=True)
    epm6_override = Column(String(5), nullable=True)
    gu_postgraduate_loan = Column(String(5), nullable=True)
    transfer_date = Column(String(20), nullable=True)
    standard_hours = Column(String(20), nullable=True)
    
    # Worker Information
    worker_subject_to_postponement_period = Column(String(5), nullable=True)
    postponement_end_date = Column(String(20), nullable=True)
    postponement_period_part_periods_allowed = Column(String(5), nullable=True)
    jobholder_opt_in_notice_received = Column(String(5), nullable=True)
    entitled_worker_active_membership_start = Column(String(20), nullable=True)
    
    # Identity Information
    passport_number = Column(String(50), nullable=True)
    starting_declaration = Column(String(5), nullable=True)
    irregular_employment = Column(String(5), nullable=True)
    omit_from_rti = Column(String(5), nullable=True)
    payment_to_a_non_individual = Column(String(5), nullable=True)
    old_rti_ee_reference = Column(String(50), nullable=True)
    off_payroll_worker = Column(String(5), nullable=True)
    
    # P45 Information
    p45_3_tax_office_number = Column(String(20), nullable=True)
    p45_3_tax_office_reference = Column(String(50), nullable=True)
    p45_3_leave_date = Column(String(20), nullable=True)
    p45_3_tax_code = Column(String(20), nullable=True)
    p45_3_week1_month1 = Column(String(10), nullable=True)
    p45_3_tax_period_monthly_weekly = Column(String(20), nullable=True)
    p45_3_tax_period_period_number = Column(String(20), nullable=True)
    p45_3_previous_tax_year = Column(String(10), nullable=True)
    p45_3_previous_pay = Column(String(20), nullable=True)
    p45_3_previous_tax = Column(String(20), nullable=True)
    p45_3_student_loan = Column(String(5), nullable=True)
    p45_3_student_loan_repayment_plan = Column(String(20), nullable=True)
    p45_3_postgraduate_loan_indicator = Column(String(5), nullable=True)
    
    # P46 Information
    p46_statement_a_b_or_c = Column(String(10), nullable=True)
    p46_student_loans_indicator = Column(String(5), nullable=True)
    p46_student_loan_repayment_plan = Column(String(20), nullable=True)
    p46_postgraduate_loan_indicator = Column(String(5), nullable=True)
    
    # P46 Pension Information
    p46_pen_tax_office_number = Column(String(20), nullable=True)
    p46_pen_tax_office_reference = Column(String(50), nullable=True)
    p46_pen_leave_date = Column(String(20), nullable=True)
    p46_pen_tax_code = Column(String(20), nullable=True)
    p46_pen_week1_month1 = Column(String(10), nullable=True)
    p46_pen_tax_period_monthly_weekly = Column(String(20), nullable=True)
    p46_pen_tax_period_period_number = Column(String(20), nullable=True)
    p46_pen_previous_tax_year = Column(String(10), nullable=True)
    p46_pen_previous_pay = Column(String(20), nullable=True)
    p46_pen_previous_tax = Column(String(20), nullable=True)
    p46_pen_annual_pension = Column(String(20), nullable=True)
    p46_pen_is_recently_bereaved = Column(String(5), nullable=True)
    
    # P46 Expat Information
    p46_expat_statement_a_b_or_c = Column(String(10), nullable=True)
    p46_expat_student_loan_indicator = Column(String(5), nullable=True)
    p46_expat_student_loan_repayment_plan = Column(String(20), nullable=True)
    p46_expat_eea_or_commonwealth_citizen = Column(String(5), nullable=True)
    p46_expat_epm6_scheme = Column(String(5), nullable=True)
    p46_expat_postgrad_loan_indicator = Column(String(5), nullable=True)
    
    # Termination Information
    termination_class_1a_earnings = Column(String(20), nullable=True)
    termination_class_1a_nics = Column(String(20), nullable=True)
    sporting_class_1a_earnings = Column(String(20), nullable=True)
    sporting_class_1a_nics = Column(String(20), nullable=True)
    
    # Postgraduate Loan Information
    postgraduate_loan_start_date = Column(String(20), nullable=True)
    postgraduate_loan_stop_date = Column(String(20), nullable=True)
    postgraduate_loan_deducted_ytd = Column(String(20), nullable=True)
    
    # Additional Fields
    working_in_a_freeport = Column(String(5), nullable=True)
    working_in_an_investment_zone = Column(String(5), nullable=True)
    workplace_postcode = Column(String(20), nullable=True)
    veterans_first_civilian_employment = Column(String(5), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

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