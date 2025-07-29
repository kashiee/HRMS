"""
HMRC RTI (Real Time Information) mock service
"""

import uuid
from datetime import datetime, date
from typing import Dict, Any, List
import json

# Mock HMRC RTI response templates
RTI_RESPONSES = {
    'success': {
        'status': 'accepted',
        'reference': None,  # Will be generated
        'timestamp': None,  # Will be generated
        'message': 'RTI submission accepted',
        'warnings': [],
        'errors': []
    },
    'validation_error': {
        'status': 'rejected',
        'reference': None,
        'timestamp': None,
        'message': 'RTI submission failed validation',
        'warnings': [],
        'errors': [
            'Invalid National Insurance number format',
            'Missing required field: tax code',
            'Invalid pay period dates'
        ]
    },
    'system_error': {
        'status': 'error',
        'reference': None,
        'timestamp': None,
        'message': 'HMRC system temporarily unavailable',
        'warnings': [],
        'errors': [
            'Service temporarily unavailable',
            'Please retry submission'
        ]
    }
}

async def submit_rti_return(rti_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Mock RTI submission to HMRC
    
    Args:
        rti_data: RTI submission data including employee and company details
    
    Returns:
        Mock HMRC response
    """
    try:
        # Validate RTI data
        validation_result = validate_rti_data(rti_data)
        
        if not validation_result['valid']:
            response = RTI_RESPONSES['validation_error'].copy()
            response['errors'] = validation_result['errors']
            response['reference'] = generate_rti_reference()
            response['timestamp'] = datetime.now().isoformat()
            return response
        
        # Simulate processing delay
        import asyncio
        await asyncio.sleep(0.5)  # Simulate network delay
        
        # Generate success response
        response = RTI_RESPONSES['success'].copy()
        response['reference'] = generate_rti_reference()
        response['timestamp'] = datetime.now().isoformat()
        
        # Add any warnings
        warnings = check_rti_warnings(rti_data)
        if warnings:
            response['warnings'] = warnings
        
        return response
        
    except Exception as e:
        # Return system error response
        response = RTI_RESPONSES['system_error'].copy()
        response['reference'] = generate_rti_reference()
        response['timestamp'] = datetime.now().isoformat()
        response['errors'] = [f"System error: {str(e)}"]
        return response

def validate_rti_data(rti_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate RTI submission data
    """
    errors = []
    
    # Check required fields
    required_fields = ['employee', 'company', 'pay_period']
    for field in required_fields:
        if field not in rti_data:
            errors.append(f"Missing required field: {field}")
    
    if errors:
        return {'valid': False, 'errors': errors}
    
    # Validate employee data
    employee = rti_data.get('employee', {})
    if 'ni_number' not in employee:
        errors.append("Missing National Insurance number")
    elif not validate_ni_number(employee['ni_number']):
        errors.append("Invalid National Insurance number format")
    
    if 'tax_code' not in employee:
        errors.append("Missing tax code")
    elif not validate_tax_code(employee['tax_code']):
        errors.append("Invalid tax code")
    
    # Validate company data
    company = rti_data.get('company', {})
    if 'registration_number' not in company:
        errors.append("Missing company registration number")
    
    if 'tax_office' not in company:
        errors.append("Missing HMRC tax office code")
    
    # Validate pay period
    pay_period = rti_data.get('pay_period', {})
    if 'start_date' not in pay_period or 'end_date' not in pay_period:
        errors.append("Missing pay period dates")
    else:
        try:
            start_date = datetime.fromisoformat(pay_period['start_date'].replace('Z', '+00:00'))
            end_date = datetime.fromisoformat(pay_period['end_date'].replace('Z', '+00:00'))
            
            if start_date >= end_date:
                errors.append("Pay period start date must be before end date")
            
            # Check pay period is not too long (max 31 days)
            days_diff = (end_date - start_date).days
            if days_diff > 31:
                errors.append("Pay period cannot exceed 31 days")
                
        except ValueError:
            errors.append("Invalid date format in pay period")
    
    # Validate pay amounts
    if 'gross_pay' not in employee:
        errors.append("Missing gross pay amount")
    elif not isinstance(employee['gross_pay'], (int, float)) or employee['gross_pay'] < 0:
        errors.append("Invalid gross pay amount")
    
    if 'paye_tax' not in employee:
        errors.append("Missing PAYE tax amount")
    elif not isinstance(employee['paye_tax'], (int, float)) or employee['paye_tax'] < 0:
        errors.append("Invalid PAYE tax amount")
    
    if 'ni_contribution' not in employee:
        errors.append("Missing National Insurance contribution")
    elif not isinstance(employee['ni_contribution'], (int, float)) or employee['ni_contribution'] < 0:
        errors.append("Invalid National Insurance contribution")
    
    return {
        'valid': len(errors) == 0,
        'errors': errors
    }

def validate_ni_number(ni_number: str) -> bool:
    """
    Validate National Insurance number format
    """
    # Basic validation for PoC
    if not ni_number or len(ni_number) != 9:
        return False
    
    # Check format: 2 letters, 6 digits, 1 letter
    if not (ni_number[0:2].isalpha() and ni_number[2:8].isdigit() and ni_number[8].isalpha()):
        return False
    
    return True

def validate_tax_code(tax_code: str) -> bool:
    """
    Validate UK tax code format
    """
    valid_codes = ['BR', 'D0', 'D1', 'NT', 'SBR', 'SD0', 'SD1']
    return tax_code in valid_codes

def check_rti_warnings(rti_data: Dict[str, Any]) -> List[str]:
    """
    Check for potential RTI warnings
    """
    warnings = []
    
    employee = rti_data.get('employee', {})
    
    # Check for unusual pay amounts
    gross_pay = employee.get('gross_pay', 0)
    if gross_pay > 10000:  # Monthly pay over £10k
        warnings.append("Unusually high gross pay - please verify")
    
    if gross_pay < 100:  # Monthly pay under £100
        warnings.append("Unusually low gross pay - please verify")
    
    # Check for missing NI contributions
    ni_contribution = employee.get('ni_contribution', 0)
    if gross_pay > 1257 and ni_contribution == 0:  # Above NI threshold but no NI
        warnings.append("No National Insurance contribution calculated - please verify")
    
    # Check for high tax amounts
    paye_tax = employee.get('paye_tax', 0)
    if paye_tax > gross_pay * 0.5:  # Tax over 50% of gross
        warnings.append("Unusually high PAYE tax - please verify")
    
    return warnings

def generate_rti_reference() -> str:
    """
    Generate mock RTI reference number
    """
    # Format: RTI-YYYYMMDD-HHMMSS-UUID
    timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
    unique_id = str(uuid.uuid4())[:8].upper()
    return f"RTI-{timestamp}-{unique_id}"

async def get_rti_status(reference: str) -> Dict[str, Any]:
    """
    Mock RTI status check
    """
    # Simulate different statuses based on reference
    if 'RTI-' in reference:
        return {
            'reference': reference,
            'status': 'accepted',
            'submitted_at': datetime.now().isoformat(),
            'processed_at': datetime.now().isoformat(),
            'message': 'RTI submission processed successfully'
        }
    else:
        return {
            'reference': reference,
            'status': 'not_found',
            'message': 'RTI reference not found'
        }

async def submit_fps(company_data: Dict[str, Any], employees_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Mock FPS (Full Payment Submission) to HMRC
    """
    try:
        # Validate company data
        if 'registration_number' not in company_data:
            return {
                'status': 'rejected',
                'reference': generate_rti_reference(),
                'message': 'Missing company registration number',
                'errors': ['Company registration number required']
            }
        
        # Validate employees data
        if not employees_data:
            return {
                'status': 'rejected',
                'reference': generate_rti_reference(),
                'message': 'No employees in FPS submission',
                'errors': ['At least one employee required']
            }
        
        # Generate FPS reference
        fps_reference = generate_fps_reference()
        
        return {
            'status': 'accepted',
            'reference': fps_reference,
            'timestamp': datetime.now().isoformat(),
            'message': f'FPS submitted successfully for {len(employees_data)} employees',
            'company_registration': company_data['registration_number'],
            'employee_count': len(employees_data)
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'reference': generate_rti_reference(),
            'message': f'FPS submission failed: {str(e)}',
            'errors': [str(e)]
        }

def generate_fps_reference() -> str:
    """
    Generate mock FPS reference number
    """
    timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
    unique_id = str(uuid.uuid4())[:8].upper()
    return f"FPS-{timestamp}-{unique_id}"

async def submit_eps(company_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Mock EPS (Employer Payment Summary) to HMRC
    """
    try:
        # Validate company data
        if 'registration_number' not in company_data:
            return {
                'status': 'rejected',
                'reference': generate_rti_reference(),
                'message': 'Missing company registration number',
                'errors': ['Company registration number required']
            }
        
        # Generate EPS reference
        eps_reference = generate_eps_reference()
        
        return {
            'status': 'accepted',
            'reference': eps_reference,
            'timestamp': datetime.now().isoformat(),
            'message': 'EPS submitted successfully',
            'company_registration': company_data['registration_number']
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'reference': generate_rti_reference(),
            'message': f'EPS submission failed: {str(e)}',
            'errors': [str(e)]
        }

def generate_eps_reference() -> str:
    """
    Generate mock EPS reference number
    """
    timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
    unique_id = str(uuid.uuid4())[:8].upper()
    return f"EPS-{timestamp}-{unique_id}" 