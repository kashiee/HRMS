# HRMS UK Payroll PoC Backend

A complete AI-integrated UK Payroll & HR Management System built with FastAPI, featuring real-time payroll calculations, document processing, and natural language command processing.

##  Features

### Core Functionality
- **Company & Employee Management**: Complete CRUD operations for companies, departments, and employees
- **UK Payroll Calculations**: Accurate PAYE, National Insurance, and pension calculations
- **Document Processing**: AI-powered OCR and document classification with GDPR compliance
- **Natural Language Interface**: Process payroll commands using natural language
- **RTI Integration**: Mock HMRC Real Time Information submissions
- **BACS Integration**: Generate bank transfer files for salary payments

### AI Integration
- **Employee Classification**: AI-powered tax code and pension scheme suggestions
- **Document Verification**: OCR processing with AI classification
- **NLP Commands**: Natural language payroll processing
- **GDPR Compliance**: Automatic data redaction before AI processing

### Compliance & Security
- **GDPR Middleware**: Automatic sensitive data masking
- **UK Tax Compliance**: HMRC RTI and BACS standards
- **Data Validation**: Comprehensive input validation and error handling

##  Architecture

```
HRMS Backend/
├── main.py                 # FastAPI application entrypoint
├── database.py             # Database configuration
├── models.py               # SQLAlchemy models
├── routers/                # API route handlers
│   ├── company.py         # Company & department management
│   ├── employee.py        # Employee CRUD + document upload
│   ├── payroll.py         # Payroll calculations & RTI
│   └── nlp.py            # Natural language processing
├── services/              # Business logic services
│   ├── calc.py           # UK payroll calculations
│   ├── doc_ai.py         # Document OCR & classification
│   ├── nlp_ai.py         # NLP command processing
│   └── gdpr.py           # GDPR compliance middleware
└── mocks/                 # External service mocks
    ├── hmrc.py           # HMRC RTI mock
    └── bacs.py           # BACS file generation
```

##  Quick Start

### Prerequisites
- Python 3.8+
- pip

### Installation

1. **Clone and setup**
```bash
git clone <repository-url>
cd HRMS
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Run the application**
```bash
cd backend
python main.py
```

4. **Seed demo data**
```bash
python scripts/seed_demo.py
```

The API will be available at `http://localhost:8000`

## 📚 API Documentation

### Core Endpoints

#### Company Management
```http
POST   /api/v1/company/                    # Create company
GET    /api/v1/company/                    # List companies
GET    /api/v1/company/{id}               # Get company
PUT    /api/v1/company/{id}               # Update company
DELETE /api/v1/company/{id}               # Delete company
```

#### Employee Management
```http
POST   /api/v1/employee/                   # Create employee
GET    /api/v1/employee/                   # List employees
GET    /api/v1/employee/{id}              # Get employee
PUT    /api/v1/employee/{id}              # Update employee
DELETE /api/v1/employee/{id}              # Delete employee
POST   /api/v1/employee/{id}/documents    # Upload document
```

#### Payroll Operations
```http
POST   /api/v1/payroll/calculate          # Calculate payslip
POST   /api/v1/payroll/batch              # Run batch payroll
GET    /api/v1/payroll/payslips          # List payslips
POST   /api/v1/payroll/payslips/{id}/rti # Submit RTI
GET    /api/v1/payroll/summary/{company} # Payroll summary
```

#### Natural Language Processing
```http
POST   /api/v1/nlp/process                # Process NLP command
POST   /api/v1/nlp/run-payroll           # Run payroll via NLP
POST   /api/v1/nlp/verify-documents      # Verify documents via NLP
GET    /api/v1/nlp/available-commands    # List available commands
```

### Example API Calls

#### Create a Company
```bash
curl -X POST "http://localhost:8000/api/v1/company/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TechCorp Solutions Ltd",
    "registration_number": "12345678",
    "tax_office": "123",
    "address": "123 Innovation Street, London",
    "postcode": "SW1A 1AA"
  }'
```

#### Create an Employee
```bash
curl -X POST "http://localhost:8000/api/v1/employee/" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_number": "EMP001",
    "first_name": "Alice",
    "last_name": "Johnson",
    "date_of_birth": "1990-05-15",
    "national_insurance_number": "AB123456C",
    "email": "alice@techcorp.com",
    "address": "456 Tech Avenue, London",
    "postcode": "W1A 1AA",
    "employment_type": "full_time",
    "start_date": "2022-01-15",
    "salary": 65000.0,
    "company_id": 1
  }'
```

#### Calculate Payroll
```bash
curl -X POST "http://localhost:8000/api/v1/payroll/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": 1,
    "pay_period_start": "2024-01-01",
    "pay_period_end": "2024-01-31",
    "pay_date": "2024-01-31",
    "basic_pay": 5416.67,
    "overtime_pay": 0.0,
    "bonus_pay": 0.0,
    "other_pay": 0.0
  }'
```

#### Natural Language Command
```bash
curl -X POST "http://localhost:8000/api/v1/nlp/process" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Run payroll for TechCorp for January 2024"
  }'
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=sqlite:///./hrms_poc.db

# AI Services (for production)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Security
SECRET_KEY=your_secret_key
ALGORITHM=HS256

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_DIR=uploads/
```

### Database Setup
The application uses SQLite for the PoC. For production, update `database.py`:

```python
# For PostgreSQL
SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost/hrms"

# For MySQL
SQLALCHEMY_DATABASE_URL = "mysql://user:password@localhost/hrms"
```

##  Testing

### Run Tests
```bash
pytest tests/
```

### API Testing
```bash
# Health check
curl http://localhost:8000/health

# Interactive API docs
open http://localhost:8000/docs
```

##  Demo Data

The seed script creates:
- **1 Company**: TechCorp Solutions Ltd
- **5 Departments**: Engineering, Sales, Marketing, Finance, HR
- **10 Employees**: Mix of full-time, part-time, contractor, and temporary
- **5 Sample Payslips**: For demonstration

### Employee Types Included
- Full-time employees with auto-enrolment pensions
- Part-time employees with hourly rates
- Contractors with no pension scheme
- Temporary employees with end dates

## Security & Compliance

### GDPR Compliance
- Automatic redaction of sensitive data before AI processing
- Middleware for response data masking
- Configurable data retention policies

### Data Validation
- Comprehensive input validation using Pydantic
- UK-specific validation (NI numbers, tax codes, postcodes)
- Error handling with detailed feedback

### Mock vs Production
The PoC uses mock services for:
- **HMRC RTI**: Simulates Real Time Information submissions
- **BACS**: Generates bank transfer files
- **AI Services**: Mock classification and NLP processing

For production, replace with:
- Real HMRC RTI API integration
- Actual bank BACS submission
- OpenAI GPT-4 or Claude API for AI services

##  Production Deployment

### Docker Setup
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Considerations
- Use PostgreSQL or MySQL for production database
- Implement proper authentication and authorization
- Set up monitoring and logging
- Configure SSL/TLS certificates
- Implement rate limiting and API key management

##  Performance

### Optimizations
- Async/await for I/O operations
- Database connection pooling
- Caching for frequently accessed data
- Background task processing for batch operations

### Monitoring
- Health check endpoint: `/health`
- Detailed logging throughout the application
- Error tracking and alerting

##  Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

##  License

This project is for demonstration purposes. For production use, ensure compliance with:
- UK Data Protection Act 2018
- HMRC RTI requirements
- Banking regulations for BACS processing

## Support

For issues and questions:
- Check the API documentation at `/docs`
- Review the logs for error details
- Ensure all dependencies are installed correctly

---

**Note**: This is a Proof of Concept (PoC) system. For production deployment, implement proper security, authentication, and replace mock services with real integrations. 