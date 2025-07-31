#!/usr/bin/env python3
"""
Test script for the National Insurance (NI) API endpoints
"""

import requests
import json
from datetime import datetime

# API base URL
BASE_URL = "http://localhost:8001/api/v1/ni"

def test_create_ni_details():
    """Test creating NI details for an employee"""
    
    # Sample NI data based on UK National Insurance structure
    ni_data = {
        "reference": "NI001",
        "gender": "F",
        "title": "Ms",
        "forename": "Sarah",
        "surname": "Johnson",
        "ni_letter": "A",
        "ni_calculation_basis": "Standard",
        "total_earnings": "45000.00",
        "earnings_to_set": "0.00",
        "earnings_to_lel": "0.00",
        "earnings_to_pet": "12570.00",
        "earnings_to_fust": "50270.00",
        "earnings_to_ust": "0.00",
        "earnings_above_uel": "0.00",
        "ee_contributions_pt1": "3243.00",
        "ee_contributions_pt2": "0.00",
        "er_contributions": "4864.50",
        
        # NI Breakdown by Period (Brought Forward)
        "ni_letter_bf": "A",
        "ni_calculation_basis_bf": "Standard",
        "total_earnings_bf": "40000.00",
        "earnings_to_set_bf": "0.00",
        "earnings_to_lel_bf": "0.00",
        "earnings_to_pet_bf": "12570.00",
        "earnings_to_fust_bf": "40000.00",
        "earnings_to_ust_bf": "0.00",
        "earnings_above_uel_bf": "0.00",
        "ee_contributions_pt1_bf": "2883.00",
        "ee_contributions_pt2_bf": "0.00",
        "er_contributions_bf": "4324.50",
        
        # Current Period NI
        "ni_letter_current": "A",
        "ni_calculation_basis_current": "Standard",
        "total_earnings_current": "5000.00",
        "earnings_to_set_current": "0.00",
        "earnings_to_lel_current": "0.00",
        "earnings_to_pet_current": "0.00",
        "earnings_to_fust_current": "5000.00",
        "earnings_to_ust_current": "0.00",
        "earnings_above_uel_current": "0.00",
        "ee_contributions_pt1_current": "360.00",
        "ee_contributions_pt2_current": "0.00",
        "er_contributions_current": "540.00",
        
        # NI Year to Date
        "ni_letter_ytd": "A",
        "ni_calculation_basis_ytd": "Standard",
        "total_earnings_ytd": "45000.00",
        "earnings_to_set_ytd": "0.00",
        "earnings_to_lel_ytd": "0.00",
        "earnings_to_pet_ytd": "12570.00",
        "earnings_to_fust_ytd": "45000.00",
        "earnings_to_ust_ytd": "0.00",
        "earnings_above_uel_ytd": "0.00",
        "ee_contributions_pt1_ytd": "3243.00",
        "ee_contributions_pt2_ytd": "0.00",
        "er_contributions_ytd": "4864.50",
        
        # NI Thresholds and Limits (2024/25 tax year)
        "lel_threshold": "12300.00",
        "pet_threshold": "12570.00",
        "fust_threshold": "50270.00",
        "uel_threshold": "50270.00",
        "ust_threshold": "50270.00",
        
        # NI Rates (2024/25)
        "ee_rate_pt1": "12.00",
        "ee_rate_pt2": "2.00",
        "er_rate": "13.80",
        
        # Additional NI Information
        "ni_category": "A",
        "ni_exemption": "N",
        "ni_deferment": "N",
        "ni_deferment_certificate": "",
        "ni_contracted_out": "N",
        "ni_contracted_out_rate": "0.00",
        
        # Employment Status for NI
        "employment_status": "Full Time",
        "start_date": "2024-01-01",
        "leaving_date": "",
        "leaver": "N",
        
        # Department and Organizational Info
        "department": "Finance",
        "cost_centre": "FIN001",
        "branch": "London",
        
        # Contact Information
        "email": "sarah.johnson@company.com",
        "address_1": "123 High Street",
        "address_2": "London",
        "address_3": "",
        "address_4": "",
        "postcode": "SW1A 1AA",
        "country": "UK"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/ni-details", json=ni_data)
        print(f"Create NI Details Response: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        return response.json()
    except Exception as e:
        print(f"Error creating NI details: {e}")
        return None

def test_get_ni_details(reference: str):
    """Test retrieving NI details for an employee"""
    try:
        response = requests.get(f"{BASE_URL}/ni-details/{reference}")
        print(f"Get NI Details Response: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        return response.json()
    except Exception as e:
        print(f"Error retrieving NI details: {e}")
        return None

def test_list_ni_details():
    """Test listing all NI details"""
    try:
        response = requests.get(f"{BASE_URL}/ni-details")
        print(f"List NI Details Response: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        return response.json()
    except Exception as e:
        print(f"Error listing NI details: {e}")
        return None

def test_get_ni_summary(reference: str):
    """Test getting NI summary for an employee"""
    try:
        response = requests.get(f"{BASE_URL}/ni-details/{reference}/summary")
        print(f"Get NI Summary Response: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        return response.json()
    except Exception as e:
        print(f"Error retrieving NI summary: {e}")
        return None

def test_update_ni_details():
    """Test updating existing NI details"""
    
    # Updated NI data
    updated_ni_data = {
        "reference": "NI001",
        "total_earnings": "48000.00",
        "earnings_to_pet": "12570.00",
        "earnings_to_fust": "48000.00",
        "ee_contributions_pt1": "3456.00",
        "er_contributions": "5184.00",
        "total_earnings_ytd": "48000.00",
        "ee_contributions_pt1_ytd": "3456.00",
        "er_contributions_ytd": "5184.00"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/ni-details", json=updated_ni_data)
        print(f"Update NI Details Response: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        return response.json()
    except Exception as e:
        print(f"Error updating NI details: {e}")
        return None

def test_delete_ni_details(reference: str):
    """Test deleting NI details for an employee"""
    try:
        response = requests.delete(f"{BASE_URL}/ni-details/{reference}")
        print(f"Delete NI Details Response: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        return response.json()
    except Exception as e:
        print(f"Error deleting NI details: {e}")
        return None

if __name__ == "__main__":
    print("=== Testing National Insurance API ===")
    print()
    
    # Test 1: Create NI details
    print("1. Creating NI details for employee...")
    create_result = test_create_ni_details()
    print()
    
    if create_result:
        reference = create_result.get('reference', 'NI001')
        
        # Test 2: Get NI details
        print("2. Retrieving NI details...")
        test_get_ni_details(reference)
        print()
        
        # Test 3: Get NI summary
        print("3. Retrieving NI summary...")
        test_get_ni_summary(reference)
        print()
        
        # Test 4: List all NI details
        print("4. Listing all NI details...")
        test_list_ni_details()
        print()
        
        # Test 5: Update NI details
        print("5. Updating NI details...")
        test_update_ni_details()
        print()
        
        # Test 6: Get updated NI details
        print("6. Retrieving updated NI details...")
        test_get_ni_details(reference)
        print()
        
        # Test 7: Delete NI details (uncomment to test deletion)
        # print("7. Deleting NI details...")
        # test_delete_ni_details(reference)
        # print()
    
    print("=== NI API Test Complete ===") 