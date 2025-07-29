"""
BACS (Bankers' Automated Clearing Services) mock service
"""

import csv
import json
from datetime import datetime, date
from typing import Dict, Any, List
from pathlib import Path
import uuid

# BACS file format constants
BACS_HEADER_RECORD = {
    'record_type': '01',
    'priority': 'A',
    'destination_sort_code': '999999',
    'destination_account': '99999999',
    'sequence_number': '000001',
    'file_name': 'PAYROLL',
    'processing_date': None,  # Will be set
    'user_number': '000000',
    'user_name': 'HRMS_POC'
}

BACS_TRAILER_RECORD = {
    'record_type': '99',
    'total_records': '000000',
    'total_amount': '000000000000',
    'processing_date': None,  # Will be set
    'user_number': '000000',
    'user_name': 'HRMS_POC'
}

async def generate_bacs_file(payslips: List[Any], company_id: int) -> str:
    """
    Generate BACS-compatible file for salary payments
    
    Args:
        payslips: List of payslip objects
        company_id: Company ID for reference
    
    Returns:
        Path to generated BACS file
    """
    try:
        # Create output directory
        output_dir = Path("exports/bacs")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"BACS_PAYROLL_{company_id}_{timestamp}.txt"
        file_path = output_dir / filename
        
        # Prepare BACS data
        bacs_data = prepare_bacs_data(payslips, company_id)
        
        # Write BACS file
        with open(file_path, 'w', newline='') as file:
            # Write header record
            header = format_bacs_header(bacs_data['header'])
            file.write(header + '\n')
            
            # Write detail records
            for detail in bacs_data['details']:
                detail_line = format_bacs_detail(detail)
                file.write(detail_line + '\n')
            
            # Write trailer record
            trailer = format_bacs_trailer(bacs_data['trailer'])
            file.write(trailer + '\n')
        
        # Generate summary report
        summary = generate_bacs_summary(bacs_data)
        summary_path = file_path.with_suffix('.json')
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=2)
        
        return str(file_path)
        
    except Exception as e:
        print(f"BACS file generation failed: {e}")
        raise

def prepare_bacs_data(payslips: List[Any], company_id: int) -> Dict[str, Any]:
    """
    Prepare BACS data from payslips
    """
    # Get company details (mock for PoC)
    company_details = {
        'sort_code': '12-34-56',
        'account_number': '12345678',
        'account_name': 'HRMS Demo Company Ltd'
    }
    
    # Calculate totals
    total_amount = sum(payslip.net_pay for payslip in payslips)
    total_records = len(payslips)
    
    # Set processing date (next working day)
    processing_date = get_next_working_day()
    
    # Prepare header
    header = BACS_HEADER_RECORD.copy()
    header['processing_date'] = processing_date.strftime('%d%m%y')
    header['destination_sort_code'] = company_details['sort_code'].replace('-', '')
    header['destination_account'] = company_details['account_number']
    
    # Prepare detail records
    details = []
    for i, payslip in enumerate(payslips, 1):
        # Get employee details (mock for PoC)
        employee_details = {
            'sort_code': '98-76-54',
            'account_number': f'8765432{i:02d}',
            'account_name': f'Employee {payslip.employee_id}'
        }
        
        detail = {
            'record_type': '08',
            'destination_sort_code': employee_details['sort_code'].replace('-', ''),
            'destination_account': employee_details['account_number'],
            'destination_account_name': employee_details['account_name'][:18],  # Max 18 chars
            'amount': int(payslip.net_pay * 100),  # Convert to pence
            'reference': f'PAY{payslip.id:06d}',
            'processing_date': processing_date.strftime('%d%m%y'),
            'sequence_number': f'{i:06d}'
        }
        details.append(detail)
    
    # Prepare trailer
    trailer = BACS_TRAILER_RECORD.copy()
    trailer['total_records'] = f'{total_records:06d}'
    trailer['total_amount'] = f'{int(total_amount * 100):012d}'  # Convert to pence
    trailer['processing_date'] = processing_date.strftime('%d%m%y')
    
    return {
        'header': header,
        'details': details,
        'trailer': trailer,
        'summary': {
            'company_id': company_id,
            'total_payslips': total_records,
            'total_amount': total_amount,
            'processing_date': processing_date.isoformat(),
            'file_generated': datetime.now().isoformat()
        }
    }

def format_bacs_header(header: Dict[str, Any]) -> str:
    """
    Format BACS header record
    """
    return (
        f"{header['record_type']}"
        f"{header['priority']}"
        f"{header['destination_sort_code']}"
        f"{header['destination_account']}"
        f"{header['sequence_number']}"
        f"{header['file_name']:<20}"
        f"{header['processing_date']}"
        f"{header['user_number']}"
        f"{header['user_name']:<20}"
    )

def format_bacs_detail(detail: Dict[str, Any]) -> str:
    """
    Format BACS detail record
    """
    return (
        f"{detail['record_type']}"
        f"{detail['destination_sort_code']}"
        f"{detail['destination_account']}"
        f"{detail['destination_account_name']:<18}"
        f"{detail['amount']:010d}"
        f"{detail['reference']:<18}"
        f"{detail['processing_date']}"
        f"{detail['sequence_number']}"
    )

def format_bacs_trailer(trailer: Dict[str, Any]) -> str:
    """
    Format BACS trailer record
    """
    return (
        f"{trailer['record_type']}"
        f"{trailer['total_records']}"
        f"{trailer['total_amount']}"
        f"{trailer['processing_date']}"
        f"{trailer['user_number']}"
        f"{trailer['user_name']:<20}"
    )

def get_next_working_day() -> date:
    """
    Get next working day (Monday-Friday)
    """
    today = date.today()
    next_day = today
    
    # Skip weekends
    while next_day.weekday() >= 5:  # Saturday = 5, Sunday = 6
        next_day = next_day.replace(day=next_day.day + 1)
    
    return next_day

def generate_bacs_summary(bacs_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate BACS summary report
    """
    summary = bacs_data['summary'].copy()
    summary.update({
        'bacs_format': 'BACS 18/18',
        'file_type': 'salary_payment',
        'validation_status': 'valid',
        'bank_processing': {
            'submission_time': datetime.now().isoformat(),
            'estimated_processing': 'T+3',
            'status': 'pending'
        },
        'payments': [
            {
                'employee_id': detail.get('reference', '').replace('PAY', ''),
                'amount': detail['amount'] / 100,  # Convert from pence
                'account': detail['destination_account'],
                'sort_code': detail['destination_sort_code']
            }
            for detail in bacs_data['details']
        ]
    })
    
    return summary

async def simulate_bank_webhook(bacs_file_path: str) -> Dict[str, Any]:
    """
    Simulate bank webhook response
    """
    # Simulate processing delay
    import asyncio
    await asyncio.sleep(1)
    
    # Generate webhook response
    webhook_data = {
        'webhook_id': str(uuid.uuid4()),
        'timestamp': datetime.now().isoformat(),
        'bacs_file': bacs_file_path,
        'status': 'accepted',
        'processing_reference': f"BANK-{datetime.now().strftime('%Y%m%d-%H%M%S')}-{str(uuid.uuid4())[:8]}",
        'message': 'BACS file received and queued for processing',
        'estimated_processing_date': get_next_working_day().isoformat(),
        'bank_details': {
            'bank_name': 'Mock Bank PLC',
            'sort_code': '12-34-56',
            'account_number': '12345678'
        }
    }
    
    return webhook_data

async def validate_bacs_file(file_path: str) -> Dict[str, Any]:
    """
    Validate BACS file format
    """
    try:
        with open(file_path, 'r') as file:
            lines = file.readlines()
        
        if len(lines) < 3:
            return {
                'valid': False,
                'errors': ['File must contain header, detail, and trailer records']
            }
        
        errors = []
        
        # Validate header record
        header = lines[0].strip()
        if not header.startswith('01'):
            errors.append('Invalid header record type')
        
        # Validate trailer record
        trailer = lines[-1].strip()
        if not trailer.startswith('99'):
            errors.append('Invalid trailer record type')
        
        # Validate detail records
        detail_records = lines[1:-1]
        for i, record in enumerate(detail_records, 1):
            if not record.strip().startswith('08'):
                errors.append(f'Invalid detail record type at line {i+1}')
        
        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'total_records': len(lines),
            'detail_records': len(detail_records)
        }
        
    except Exception as e:
        return {
            'valid': False,
            'errors': [f'File validation failed: {str(e)}']
        }

def generate_bacs_csv(payslips: List[Any], company_id: int) -> str:
    """
    Generate CSV format for BACS data (alternative format)
    """
    output_dir = Path("exports/bacs")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"BACS_PAYROLL_{company_id}_{timestamp}.csv"
    file_path = output_dir / filename
    
    with open(file_path, 'w', newline='') as csvfile:
        fieldnames = [
            'employee_id', 'sort_code', 'account_number', 'account_name',
            'amount', 'reference', 'processing_date'
        ]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        
        processing_date = get_next_working_day()
        
        for payslip in payslips:
            writer.writerow({
                'employee_id': payslip.employee_id,
                'sort_code': '98-76-54',
                'account_number': f'8765432{payslip.employee_id:02d}',
                'account_name': f'Employee {payslip.employee_id}',
                'amount': payslip.net_pay,
                'reference': f'PAY{payslip.id:06d}',
                'processing_date': processing_date.strftime('%Y-%m-%d')
            })
    
    return str(file_path) 