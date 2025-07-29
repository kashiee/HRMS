"""
GDPR compliance service for data redaction and masking
"""

import re
from typing import Dict, Any, List
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import json

# Sensitive data patterns for UK HR data
SENSITIVE_PATTERNS = {
    'national_insurance': r'[A-Z]{2}\d{6}[A-Z]',
    'passport_number': r'\b\d{9}\b',
    'driving_license': r'[A-Z]{5}\d{6}[A-Z]{2}\d{2}[A-Z]{3}\d{5}',
    'bank_account': r'\b\d{8}\b',
    'sort_code': r'\b\d{2}-\d{2}-\d{2}\b',
    'phone_number': r'\b\d{4}\s\d{3}\s\d{4}\b',
    'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
    'postcode': r'\b[A-Z]{1,2}\d[A-Z\d]?\s\d[A-Z]{2}\b',
    'date_of_birth': r'\b\d{1,2}/\d{1,2}/\d{4}\b',
    'salary': r'£\d{1,3}(?:,\d{3})*(?:\.\d{2})?'
}

class GDPRMiddleware(BaseHTTPMiddleware):
    """
    GDPR compliance middleware for redacting sensitive data
    """
    
    async def dispatch(self, request: Request, call_next):
        # Process request
        response = await call_next(request)
        
        # Only process JSON responses
        if response.headers.get("content-type", "").startswith("application/json"):
            try:
                # Read response body
                body = b""
                async for chunk in response.body_iterator:
                    body += chunk
                
                # Parse and redact JSON
                data = json.loads(body.decode())
                redacted_data = self.redact_sensitive_data(data)
                
                # Create new response with redacted data
                redacted_body = json.dumps(redacted_data)
                return Response(
                    content=redacted_body,
                    status_code=response.status_code,
                    headers={
                        **dict(response.headers),
                        "content-length": str(len(redacted_body.encode()))
                    },
                    media_type="application/json"
                )
                
            except (json.JSONDecodeError, Exception) as e:
                # If there's any error, return original response
                print(f"GDPR middleware error: {e}")
                return Response(
                    content=body,
                    status_code=response.status_code,
                    headers=dict(response.headers),
                    media_type=response.media_type
                )
        
        return response
    
    def redact_sensitive_data(self, data: Any) -> Any:
        """
        Recursively redact sensitive data from response
        """
        if isinstance(data, dict):
            redacted_dict = {}
            for key, value in data.items():
                if isinstance(value, (dict, list)):
                    redacted_dict[key] = self.redact_sensitive_data(value)
                else:
                    redacted_dict[key] = self.redact_field(key, str(value))
            return redacted_dict
        
        elif isinstance(data, list):
            return [self.redact_sensitive_data(item) for item in data]
        
        else:
            return data
    
    def redact_field(self, field_name: str, value: str) -> str:
        """
        Redact sensitive data based on field name and value
        """
        field_lower = field_name.lower()
        
        # Redact based on field name
        if any(sensitive in field_lower for sensitive in [
            'ni_number', 'national_insurance', 'passport', 'driving_license',
            'bank_account', 'sort_code', 'phone', 'email', 'postcode',
            'date_of_birth', 'dob', 'salary'
        ]):
            return mask_sensitive_data(value)
        
        # Redact based on value patterns
        for pattern_name, pattern in SENSITIVE_PATTERNS.items():
            if re.search(pattern, value, re.IGNORECASE):
                return mask_sensitive_data(value)
        
        return value

def mask_sensitive_data(data: str) -> str:
    """
    Mask sensitive data with asterisks
    """
    if not data or len(data) < 3:
        return "***"
    
    # Keep first and last character, mask the rest
    if len(data) <= 4:
        return data[0] + "*" * (len(data) - 2) + data[-1]
    else:
        return data[:2] + "*" * (len(data) - 4) + data[-2:]

def redact_for_ai_processing(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Redact sensitive data before sending to AI services
    """
    def redact_recursive(obj: Any) -> Any:
        if isinstance(obj, dict):
            redacted = {}
            for key, value in obj.items():
                if isinstance(value, (dict, list)):
                    redacted[key] = redact_recursive(value)
                else:
                    # Redact sensitive fields
                    if any(sensitive in key.lower() for sensitive in [
                        'ni_number', 'national_insurance', 'passport', 'driving_license',
                        'bank_account', 'sort_code', 'phone', 'email', 'postcode',
                        'date_of_birth', 'dob', 'salary', 'address'
                    ]):
                        redacted[key] = mask_sensitive_data(str(value))
                    else:
                        redacted[key] = value
            return redacted
        elif isinstance(obj, list):
            return [redact_recursive(item) for item in obj]
        else:
            return obj
    
    return redact_recursive(data)

def validate_gdpr_compliance(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate GDPR compliance of data
    """
    violations = []
    sensitive_fields = []
    
    def check_field(key: str, value: Any):
        field_lower = key.lower()
        if any(sensitive in field_lower for sensitive in [
            'ni_number', 'national_insurance', 'passport', 'driving_license',
            'bank_account', 'sort_code', 'phone', 'email', 'postcode',
            'date_of_birth', 'dob', 'salary'
        ]):
            sensitive_fields.append(key)
            if not is_properly_masked(str(value)):
                violations.append(f"Unmasked sensitive data in field: {key}")
    
    def traverse_data(data: Any):
        if isinstance(data, dict):
            for key, value in data.items():
                check_field(key, value)
                traverse_data(value)
        elif isinstance(data, list):
            for item in data:
                traverse_data(item)
    
    traverse_data(data)
    
    return {
        'compliant': len(violations) == 0,
        'violations': violations,
        'sensitive_fields_found': sensitive_fields,
        'total_fields_checked': len(sensitive_fields)
    }

def is_properly_masked(data: str) -> bool:
    """
    Check if data is properly masked
    """
    if not data:
        return True
    
    # Check if data contains asterisks (indicating masking)
    if '*' in data:
        return True
    
    # Check if data is short enough to be considered safe
    if len(data) <= 2:
        return True
    
    # Check if it's a placeholder
    if data in ['***', 'N/A', 'Not provided']:
        return True
    
    return False

def generate_gdpr_report(data_processed: int, sensitive_fields: List[str]) -> Dict[str, Any]:
    """
    Generate GDPR compliance report
    """
    return {
        'report_type': 'GDPR Compliance Report',
        'timestamp': '2024-01-15T10:30:00Z',
        'data_processed': data_processed,
        'sensitive_fields_found': len(sensitive_fields),
        'fields_list': sensitive_fields,
        'compliance_status': 'Compliant' if len(sensitive_fields) == 0 else 'Review Required',
        'recommendations': [
            'Ensure all sensitive data is masked before AI processing',
            'Implement data retention policies',
            'Regular audit of data access logs',
            'Employee training on GDPR compliance'
        ]
    } 