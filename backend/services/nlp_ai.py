"""
NLP AI service for processing natural language commands and employee classification
"""

import re
from typing import Dict, Any, List
from datetime import datetime
import json

# Mock AI responses for PoC
# In production, this would use OpenAI GPT-4 or similar
NLP_COMMANDS = {
    'run_payroll': {
        'keywords': ['run', 'process', 'calculate', 'payroll', 'salary', 'pay'],
        'confidence': 0.9,
        'required_params': ['company_name'],
        'optional_params': ['month', 'year']
    },
    'verify_documents': {
        'keywords': ['verify', 'check', 'validate', 'document', 'documents'],
        'confidence': 0.85,
        'required_params': ['employee_name'],
        'optional_params': ['document_type']
    },
    'show_tax_breakdown': {
        'keywords': ['show', 'display', 'tax', 'breakdown', 'deductions', 'payslip'],
        'confidence': 0.8,
        'required_params': ['employee_name'],
        'optional_params': ['payslip_id']
    },
    'add_employee': {
        'keywords': ['add', 'create', 'new', 'employee', 'hire'],
        'confidence': 0.75,
        'required_params': ['employee_name', 'salary'],
        'optional_params': ['department', 'start_date']
    },
    'update_employee': {
        'keywords': ['update', 'change', 'modify', 'employee', 'edit'],
        'confidence': 0.7,
        'required_params': ['employee_name'],
        'optional_params': ['salary', 'department', 'tax_code']
    }
}

EMPLOYEE_CLASSIFICATION_RULES = {
    'tax_code': {
        'salary_thresholds': {
            'NT': 12570,  # No tax - personal allowance
            'BR': 50270,  # Basic rate
            'D0': 125140,  # Higher rate
            'D1': float('inf')  # Additional rate
        },
        'employment_type_rules': {
            'contractor': 'BR',  # Contractors typically use BR
            'part_time': 'BR',   # Part-time often BR
            'full_time': 'BR'    # Default for full-time
        }
    },
    'pension_scheme': {
        'salary_thresholds': {
            'auto_enrolment': 10000,  # Auto-enrolment threshold
            'workplace_pension': 10000,
            'nest': 10000,
            'none': 0
        },
        'employment_type_rules': {
            'contractor': 'none',
            'part_time': 'auto_enrolment',
            'full_time': 'auto_enrolment'
        }
    }
}

async def process_nlp_command(
    prompt: str,
    context: Dict[str, Any],
    db_session: Any
) -> Dict[str, Any]:
    """
    Process natural language command and convert to system action
    
    Args:
        prompt: Natural language command
        context: Additional context data
        db_session: Database session
    
    Returns:
        Dictionary with command interpretation and parameters
    """
    # Convert prompt to lowercase for matching
    prompt_lower = prompt.lower()
    
    # Find best matching command
    best_command = None
    best_confidence = 0.0
    best_params = {}
    
    for command_name, command_info in NLP_COMMANDS.items():
        # Count keyword matches
        keyword_matches = sum(
            1 for keyword in command_info['keywords']
            if keyword.lower() in prompt_lower
        )
        
        if keyword_matches > 0:
            # Calculate confidence based on keyword matches
            confidence = min(
                command_info['confidence'],
                keyword_matches / len(command_info['keywords'])
            )
            
            if confidence > best_confidence:
                best_confidence = confidence
                best_command = command_name
                
                # Extract parameters from prompt
                best_params = extract_parameters(prompt_lower, command_info)
    
    if not best_command or best_confidence < 0.5:
        return {
            'command': 'unknown',
            'action': 'none',
            'parameters': {},
            'confidence': 0.0,
            'response': 'I could not understand that command. Please try rephrasing.'
        }
    
    # Generate response based on command
    response = generate_command_response(best_command, best_params, context)
    
    return {
        'command': best_command,
        'action': best_command,
        'parameters': best_params,
        'confidence': best_confidence,
        'response': response
    }

def extract_parameters(prompt: str, command_info: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract parameters from natural language prompt
    """
    params = {}
    
    # Extract company names
    company_patterns = [
        r'for\s+([A-Za-z\s]+?)(?:\s+company)?',
        r'process\s+([A-Za-z\s]+?)(?:\s+payroll)?',
        r'run\s+payroll\s+for\s+([A-Za-z\s]+)'
    ]
    
    for pattern in company_patterns:
        match = re.search(pattern, prompt)
        if match:
            params['company_name'] = match.group(1).strip()
            break
    
    # Extract employee names
    employee_patterns = [
        r'for\s+([A-Za-z\s]+?)(?:\s+employee)?',
        r'([A-Za-z\s]+)\'s',
        r'verify\s+([A-Za-z\s]+)',
        r'show\s+([A-Za-z\s]+)'
    ]
    
    for pattern in employee_patterns:
        match = re.search(pattern, prompt)
        if match:
            params['employee_name'] = match.group(1).strip()
            break
    
    # Extract months
    months = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
    ]
    
    for month in months:
        if month in prompt:
            params['month'] = month
            break
    
    # Extract years
    year_match = re.search(r'20\d{2}', prompt)
    if year_match:
        params['year'] = year_match.group(0)
    
    # Extract document types
    doc_types = ['p45', 'p60', 'passport', 'driving license', 'birth certificate']
    for doc_type in doc_types:
        if doc_type in prompt:
            params['document_type'] = doc_type
            break
    
    return params

def generate_command_response(
    command: str,
    params: Dict[str, Any],
    context: Dict[str, Any]
) -> str:
    """
    Generate human-readable response for command
    """
    if command == 'run_payroll':
        company = params.get('company_name', 'the company')
        month = params.get('month', 'this month')
        year = params.get('year', 'this year')
        
        return f"I'll run payroll for {company} for {month} {year}."
    
    elif command == 'verify_documents':
        employee = params.get('employee_name', 'the employee')
        doc_type = params.get('document_type', 'all documents')
        
        return f"I'll verify {doc_type} for {employee}."
    
    elif command == 'show_tax_breakdown':
        employee = params.get('employee_name', 'the employee')
        
        return f"I'll show the tax breakdown for {employee}."
    
    elif command == 'add_employee':
        employee = params.get('employee_name', 'the new employee')
        
        return f"I'll help you add {employee} to the system."
    
    elif command == 'update_employee':
        employee = params.get('employee_name', 'the employee')
        
        return f"I'll help you update {employee}'s information."
    
    else:
        return "I understand your request and will process it accordingly."

async def classify_employee_data(employee_data: Any) -> Dict[str, Any]:
    """
    Classify employee data using AI to suggest tax codes and pension schemes
    
    Args:
        employee_data: Employee data from API request
    
    Returns:
        Dictionary with AI suggestions
    """
    try:
        salary = employee_data.salary
        employment_type = employee_data.employment_type
        
        # Classify tax code based on salary and employment type
        suggested_tax_code = classify_tax_code(salary, employment_type)
        
        # Classify pension scheme
        suggested_pension_scheme = classify_pension_scheme(salary, employment_type)
        
        # Additional AI insights
        insights = generate_employee_insights(employee_data)
        
        return {
            'suggested_tax_code': suggested_tax_code,
            'suggested_pension_scheme': suggested_pension_scheme,
            'confidence': 0.85,
            'insights': insights,
            'classification_time': datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Employee classification failed: {e}")
        return {
            'suggested_tax_code': 'BR',  # Default fallback
            'suggested_pension_scheme': 'auto_enrolment',
            'confidence': 0.5,
            'error': str(e)
        }

def classify_tax_code(salary: float, employment_type: str) -> str:
    """
    Classify tax code based on salary and employment type
    """
    # Get tax code rules
    tax_rules = EMPLOYEE_CLASSIFICATION_RULES['tax_code']
    
    # Check employment type rules first
    if employment_type in tax_rules['employment_type_rules']:
        return tax_rules['employment_type_rules'][employment_type]
    
    # Fall back to salary-based classification
    for tax_code, threshold in tax_rules['salary_thresholds'].items():
        if salary <= threshold:
            return tax_code
    
    # Default to BR if no match
    return 'BR'

def classify_pension_scheme(salary: float, employment_type: str) -> str:
    """
    Classify pension scheme based on salary and employment type
    """
    # Get pension rules
    pension_rules = EMPLOYEE_CLASSIFICATION_RULES['pension_scheme']
    
    # Check employment type rules first
    if employment_type in pension_rules['employment_type_rules']:
        return pension_rules['employment_type_rules'][employment_type]
    
    # Fall back to salary-based classification
    for scheme, threshold in pension_rules['salary_thresholds'].items():
        if salary >= threshold:
            return scheme
    
    # Default to none if no match
    return 'none'

def generate_employee_insights(employee_data: Any) -> List[str]:
    """
    Generate AI insights about employee data
    """
    insights = []
    
    # Salary insights
    if employee_data.salary < 20000:
        insights.append("Low salary - may qualify for tax credits")
    elif employee_data.salary > 100000:
        insights.append("High earner - consider pension tax relief")
    
    # Employment type insights
    if employee_data.employment_type == 'contractor':
        insights.append("Contractor - ensure IR35 compliance")
    elif employee_data.employment_type == 'part_time':
        insights.append("Part-time - check auto-enrolment eligibility")
    
    # Age-based insights (if date of birth available)
    try:
        from datetime import datetime
        dob = datetime.strptime(employee_data.date_of_birth, '%Y-%m-%d')
        age = (datetime.now() - dob).days / 365.25
        
        if age < 22:
            insights.append("Young employee - check minimum wage compliance")
        elif age > 55:
            insights.append("Older employee - consider pension contribution limits")
    except:
        pass
    
    return insights

async def validate_nlp_input(prompt: str) -> Dict[str, Any]:
    """
    Validate NLP input and provide suggestions
    """
    validation_result = {
        'valid': True,
        'suggestions': [],
        'warnings': []
    }
    
    # Check prompt length
    if len(prompt) < 5:
        validation_result['valid'] = False
        validation_result['warnings'].append("Prompt too short - please provide more details")
    
    # Check for common command keywords
    command_keywords = ['run', 'process', 'verify', 'show', 'add', 'update', 'check']
    if not any(keyword in prompt.lower() for keyword in command_keywords):
        validation_result['suggestions'].append("Try using action words like 'run', 'verify', or 'show'")
    
    # Check for entity names
    if not re.search(r'[A-Za-z]+\s+[A-Za-z]+', prompt):
        validation_result['suggestions'].append("Include specific names (company, employee) for better results")
    
    return validation_result 