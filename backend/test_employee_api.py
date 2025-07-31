#!/usr/bin/env python3
"""
Test script for the comprehensive employee API endpoints
"""

import requests
import json
from datetime import datetime

# API base URL
BASE_URL = "http://localhost:8001/api/v1/employee"

def test_create_employee():
    """Test creating an employee record with comprehensive data"""
    
    # Sample employee data based on the CSV structure
    employee_data = {
        "reference": "03",
        "gender": "F",
        "title": "Mrs",
        "forename": "Lynne",
        "surname": "Hays",
        "address_1": "1 High Street",
        "address_2": "Milton",
        "address_3": "Cambridge",
        "postcode": "CB22 7NY",
        "country": "United Kingdom",
        "marital_status": "M",
        "birth_date": "7/1/1991",
        "employment_status": "H",
        "start_date": "12/1/2014",
        "leaving_date": None,
        "leaver": "N",
        "p45_1_if_required": "N",
        "director": "N",
        "director_start_date": None,
        "director_leave_date": None,
        "branch": "7000",
        "cost_centre": "AD",
        "department": "FIN",
        "run_group": None,
        "default_cost_split": None,
        "ni_number": "WE336320B",
        "ni_letter": "C",
        "ni_category": None,
        "tax_code": "59L",
        "week1_month1": "Y",
        "tax_code_change_type": "DPSP6",
        "frequency": "12",
        "payment_method": "BACS",
        "bank_account_no": "98765432",
        "bank_account_name": "L HAYS",
        "sort_code": "190126",
        "bank_name": "Santander",
        "bank_branch": "Oxford",
        "building_society_ref": None,
        "autopay_ref": None,
        "taxable_pay_previous_employment": "0",
        "taxable_pay_this_employment": "7424.55",
        "tax_previous_employment": "0",
        "tax_this_employment": "1055.4",
        "net_pay_to_date": "5542.23",
        "directors_earnings_to_date": "0",
        "bf_ni_letter": None,
        "bf_ni_calculation_basis": None,
        "bf_total_earnings": None,
        "bf_earnings_to_set": None,
        "bf_earnings_to_lel": None,
        "bf_earnings_to_pet": None,
        "bf_earnings_to_fust": None,
        "bf_earnings_to_ust": None,
        "bf_earnings_above_uel": None,
        "bf_ee_contributions_pt1": None,
        "bf_ee_contributions_pt2": None,
        "bf_er_contributions": None,
        "student_loan_repayment_plan": None,
        "student_loan_from_date": None,
        "student_loan_to_date": None,
        "student_loan_deducted": None,
        "email": "example@test.com",
        "ee_ni_pd_by_er_td": "0",
        "expat_exempt": "N",
        "date_of_arrival": None,
        "tax_exempt_pcnt": "0",
        "tax_exempt_income_td": "0",
        "tax_exempt_gu_income_td": "0",
        "ee_gu_override": "N",
        "calc_ee_gross_to_net_first": None,
        "no_ni_gu": "N",
        "gross_up_pension_contribs": None,
        "gu_student_loan": None,
        "double_tax_agreement": None,
        "foreign_tax_credit": None,
        "uk_tax_ytd": "1055.4",
        "foreign_tax_ytd": "0",
        "foreign_tax_offset_ytd": "0",
        "epm6_override": "N",
        "gu_postgraduate_loan": None,
        "transfer_date": None,
        "standard_hours": "97.5",
        "worker_subject_to_postponement_period": "N",
        "postponement_end_date": None,
        "postponement_period_part_periods_allowed": None,
        "jobholder_opt_in_notice_received": None,
        "entitled_worker_active_membership_start": None,
        "passport_number": None,
        "starting_declaration": "O",
        "irregular_employment": "N",
        "omit_from_rti": "N",
        "payment_to_a_non_individual": "N",
        "old_rti_ee_reference": None,
        "off_payroll_worker": "N",
        "p45_3_tax_office_number": "951",
        "p45_3_tax_office_reference": "TA43041",
        "p45_3_leave_date": "30/11/2014",
        "p45_3_tax_code": "892L",
        "p45_3_week1_month1": "N",
        "p45_3_tax_period_monthly_weekly": "12",
        "p45_3_tax_period_period_number": "8",
        "p45_3_previous_tax_year": "2014",
        "p45_3_previous_pay": "20790",
        "p45_3_previous_tax": "2967.4",
        "p45_3_student_loan": "N",
        "p45_3_student_loan_repayment_plan": None,
        "p45_3_postgraduate_loan_indicator": None,
        "p46_statement_a_b_or_c": None,
        "p46_student_loans_indicator": "N",
        "p46_student_loan_repayment_plan": None,
        "p46_postgraduate_loan_indicator": None,
        "p46_pen_tax_office_number": None,
        "p46_pen_tax_office_reference": None,
        "p46_pen_leave_date": None,
        "p46_pen_tax_code": None,
        "p46_pen_week1_month1": None,
        "p46_pen_tax_period_monthly_weekly": None,
        "p46_pen_tax_period_period_number": None,
        "p46_pen_previous_tax_year": None,
        "p46_pen_previous_pay": None,
        "p46_pen_previous_tax": None,
        "p46_pen_annual_pension": None,
        "p46_pen_is_recently_bereaved": None,
        "p46_expat_statement_a_b_or_c": None,
        "p46_expat_student_loan_indicator": None,
        "p46_expat_student_loan_repayment_plan": None,
        "p46_expat_eea_or_commonwealth_citizen": None,
        "p46_expat_epm6_scheme": None,
        "p46_expat_postgrad_loan_indicator": None,
        "termination_class_1a_earnings": None,
        "termination_class_1a_nics": None,
        "sporting_class_1a_earnings": None,
        "sporting_class_1a_nics": None,
        "postgraduate_loan_start_date": None,
        "postgraduate_loan_stop_date": None,
        "postgraduate_loan_deducted_ytd": None,
        "working_in_a_freeport": "N",
        "working_in_an_investment_zone": "N",
        "workplace_postcode": None,
        "veterans_first_civilian_employment": None
    }
    
    try:
        response = requests.post(f"{BASE_URL}/employee", json=employee_data)
        print(f"Create Employee Response: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        return response.json()
    except Exception as e:
        print(f"Error creating employee: {e}")
        return None

def test_get_employee(reference):
    """Test retrieving an employee record by reference"""
    
    try:
        response = requests.get(f"{BASE_URL}/employee/{reference}")
        print(f"Get Employee Response: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Employee Name: {data['employee']['forename']} {data['employee']['surname']}")
            print(f"Department: {data['employee']['department']}")
            print(f"Tax Code: {data['employee']['tax_code']}")
            print(f"NI Number: {data['employee']['ni_number']}")
        else:
            print(json.dumps(response.json(), indent=2))
        return response.json()
    except Exception as e:
        print(f"Error getting employee: {e}")
        return None

def test_list_employees():
    """Test listing all employee records"""
    
    try:
        response = requests.get(f"{BASE_URL}/employees")
        print(f"List Employees Response: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Total Employees: {data['total']}")
            for emp in data['employees']:
                print(f"- {emp['name']} ({emp['reference']}) - {emp['department']}")
        else:
            print(json.dumps(response.json(), indent=2))
        return response.json()
    except Exception as e:
        print(f"Error listing employees: {e}")
        return None

def test_delete_employee(reference):
    """Test deleting an employee record"""
    
    try:
        response = requests.delete(f"{BASE_URL}/employee/{reference}")
        print(f"Delete Employee Response: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        return response.json()
    except Exception as e:
        print(f"Error deleting employee: {e}")
        return None

if __name__ == "__main__":
    print("=== Testing Comprehensive Employee API ===")
    print()
    
    # Test 1: Create employee
    print("1. Creating employee record...")
    create_result = test_create_employee()
    print()
    
    if create_result:
        reference = create_result.get('reference', '03')
        
        # Test 2: Get employee
        print("2. Retrieving employee record...")
        test_get_employee(reference)
        print()
        
        # Test 3: List employees
        print("3. Listing all employees...")
        test_list_employees()
        print()
        
        # Test 4: Delete employee (uncomment to test deletion)
        # print("4. Deleting employee record...")
        # test_delete_employee(reference)
        # print()
    
    print("=== Test Complete ===") 