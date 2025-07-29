"""
Basic tests for HRMS API endpoints
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "database" in data["services"]
    assert "ai_services" in data["services"]
    assert "gdpr_middleware" in data["services"]

def test_root_endpoint():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "HRMS UK Payroll PoC Backend"
    assert data["version"] == "1.0.0"
    assert data["status"] == "running"

def test_companies_endpoint():
    """Test companies endpoint"""
    response = client.get("/api/v1/company/")
    assert response.status_code == 200
    # Should return a list (empty if no data seeded)
    assert isinstance(response.json(), list)

def test_employees_endpoint():
    """Test employees endpoint"""
    response = client.get("/api/v1/employee/")
    assert response.status_code == 200
    # Should return a list (empty if no data seeded)
    assert isinstance(response.json(), list)

def test_payroll_endpoint():
    """Test payroll endpoint"""
    response = client.get("/api/v1/payroll/payslips")
    assert response.status_code == 200
    # Should return a list (empty if no data seeded)
    assert isinstance(response.json(), list)

def test_nlp_commands_endpoint():
    """Test NLP commands endpoint"""
    response = client.get("/api/v1/nlp/available-commands")
    assert response.status_code == 200
    data = response.json()
    assert "available_commands" in data
    assert isinstance(data["available_commands"], list)

def test_create_company():
    """Test creating a company"""
    company_data = {
        "name": "Test Company Ltd",
        "registration_number": "TEST12345",
        "tax_office": "123",
        "address": "123 Test Street, London",
        "postcode": "SW1A 1AA"
    }
    
    response = client.post("/api/v1/company/", json=company_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == company_data["name"]
    assert data["registration_number"] == company_data["registration_number"]

def test_create_employee():
    """Test creating an employee"""
    employee_data = {
        "employee_number": "TEST001",
        "first_name": "John",
        "last_name": "Doe",
        "date_of_birth": "1990-01-01",
        "national_insurance_number": "AB123456C",
        "email": "john.doe@test.com",
        "address": "456 Test Avenue, London",
        "postcode": "W1A 1AA",
        "employment_type": "full_time",
        "start_date": "2023-01-01",
        "salary": 50000.0,
        "company_id": 1
    }
    
    response = client.post("/api/v1/employee/", json=employee_data)
    assert response.status_code == 201
    data = response.json()
    assert data["first_name"] == employee_data["first_name"]
    assert data["last_name"] == employee_data["last_name"]

def test_nlp_process():
    """Test NLP command processing"""
    nlp_data = {
        "prompt": "Show available commands",
        "context": {}
    }
    
    response = client.post("/api/v1/nlp/process", json=nlp_data)
    assert response.status_code == 200
    data = response.json()
    assert "command" in data
    assert "confidence" in data
    assert "response" in data

if __name__ == "__main__":
    pytest.main([__file__]) 