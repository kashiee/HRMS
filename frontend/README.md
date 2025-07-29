# HRMS Frontend

A simple HTML/CSS/JavaScript frontend for the HRMS Payroll System.

## Features

- **CSV Upload**: Drag and drop or click to upload employee data
- **Data Preview**: See a preview of uploaded employee data
- **Payroll Processing**: Send data to backend for payroll processing
- **Payslip Downloads**: Download generated PDF payslips
- **Real-time Feedback**: Success/error alerts and loading states
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start

1. **Start the Backend**: Make sure the FastAPI backend is running on `http://localhost:8000`

2. **Open the Frontend**: Open `index.html` in your web browser
   - You can use a simple HTTP server: `python -m http.server 3000`
   - Then visit `http://localhost:3000`

3. **Upload Employee Data**: 
   - Use the sample CSV file: `sample-employees.csv`
   - Or create your own CSV with the required columns

4. **Process Payroll**: Click "Process Payroll" to generate payslips

## CSV Format

The frontend expects a CSV file with these columns:

```csv
name,role,salary,tax_code,national_insurance_number,email,address,postcode,employment_type,start_date,pension_scheme,pension_contribution
John Smith,Software Engineer,45000,BR,AB123456C,john.smith@company.com,123 Main Street London,SW1A 1AA,full_time,2023-01-01,auto_enrolment,0.05
```

## API Endpoints

The frontend communicates with these backend endpoints:

- `GET /health` - Backend health check
- `POST /payroll/batch` - Process payroll for multiple employees
- `GET /payroll/payslip/{id}` - Download payslip PDF

## Browser Compatibility

- Modern browsers with ES6+ support
- File API for CSV upload
- Fetch API for HTTP requests
- Blob API for PDF downloads

## Development

This is a simple HTML/CSS/JS application with no build process required. Just edit the files and refresh the browser to see changes.

## Troubleshooting

- **Backend Connection Error**: Make sure the FastAPI server is running on port 8000
- **CORS Issues**: The backend should have CORS configured to allow requests from the frontend
- **File Upload Issues**: Ensure the CSV file has the correct format and required columns 