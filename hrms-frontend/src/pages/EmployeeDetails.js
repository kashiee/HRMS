import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { employeeAPI, apiUtils } from '../lib/api';

const EmployeeDetails = () => {
  const { employeeReference } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [employeeRecord, setEmployeeRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    loadEmployeeDetails();
  }, [employeeReference]);

  const loadEmployeeDetails = async () => {
    try {
      setLoading(true);
      // Load basic employee data
      const employeeData = await employeeAPI.getEmployee(employeeReference);
      setEmployee(employeeData);
      
      // Load comprehensive employee record data (200+ fields)
      const recordData = await employeeAPI.getEmployeeRecord(employeeReference);
      setEmployeeRecord(recordData);
    } catch (err) {
      setError(apiUtils.handleError(err).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="employee-details-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading employee details...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="employee-details-page">
        <div className="error-container">
          <h2>Employee not found</h2>
          <button className="btn btn-primary" onClick={() => navigate('/employees')}>
            Back to Employees
          </button>
        </div>
      </div>
    );
  }

  // Helper function to filter out empty values
  const filterEmptyValues = (obj) => {
    const filtered = {};
    Object.entries(obj).forEach(([key, value]) => {
      if (value && value !== '' && value !== 'null' && value !== 'undefined' && value !== 'N/A') {
        filtered[key] = value;
      }
    });
    return filtered;
  };

  // Group employee record data into categories for better organization, filtering out empty values
  const groupedData = employeeRecord ? {
    'Personal Information': filterEmptyValues({
      'Reference': employeeRecord.reference,
      'Forename': employeeRecord.forename,
      'Surname': employeeRecord.surname,
      'Title': employeeRecord.title,
      'Gender': employeeRecord.gender,
      'Date of Birth': employeeRecord.birth_date,
      'Marital Status': employeeRecord.marital_status,
      'National Insurance Number': employeeRecord.ni_number,
    }),
    'Contact Information': filterEmptyValues({
      'Address Line 1': employeeRecord.address_1,
      'Address Line 2': employeeRecord.address_2,
      'Address Line 3': employeeRecord.address_3,
      'Address Line 4': employeeRecord.address_4,
      'Postcode': employeeRecord.postcode,
      'Country': employeeRecord.country,
      'Email': employeeRecord.email,
    }),
    'Employment Details': filterEmptyValues({
      'Start Date': employeeRecord.start_date,
      'Leaving Date': employeeRecord.leaving_date,
      'Department': employeeRecord.department,
      'Branch': employeeRecord.branch,
      'Cost Centre': employeeRecord.cost_centre,
      'Run Group': employeeRecord.run_group,
      'Director': employeeRecord.director,
      'Director Start Date': employeeRecord.director_start_date,
      'Director Leave Date': employeeRecord.director_leave_date,
    }),
    'Payroll Information': filterEmptyValues({
      'Tax Code': employeeRecord.tax_code,
      'NI Letter': employeeRecord.ni_letter,
      'NI Category': employeeRecord.ni_category,
      'Week1 Month1': employeeRecord.week1_month1,
      'Tax Code Change Type': employeeRecord.tax_code_change_type,
      'Frequency': employeeRecord.frequency,
      'Payment Method': employeeRecord.payment_method,
      'Taxable Pay This Employment': employeeRecord.taxable_pay_this_employment,
      'Taxable Pay Previous Employment': employeeRecord.taxable_pay_previous_employment,
    }),
    'Banking Information': filterEmptyValues({
      'Bank Name': employeeRecord.bank_name,
      'Bank Branch': employeeRecord.bank_branch,
      'Account Number': employeeRecord.bank_account_no,
      'Account Name': employeeRecord.bank_account_name,
      'Sort Code': employeeRecord.sort_code,
      'Building Society Ref': employeeRecord.building_society_ref,
      'Autopay Ref': employeeRecord.autopay_ref,
    }),
    'National Insurance Details': filterEmptyValues({
      'NI Calculation Basis': employeeRecord.bf_ni_calculation_basis,
      'NI Letter': employeeRecord.bf_ni_letter,
      'Total Earnings': employeeRecord.bf_total_earnings,
      'Earnings to LEL': employeeRecord.bf_earnings_to_lel,
      'Earnings to PET': employeeRecord.bf_earnings_to_pet,
      'Earnings to FUST': employeeRecord.bf_earnings_to_fust,
      'Earnings to UST': employeeRecord.bf_earnings_to_ust,
      'Earnings Above UEL': employeeRecord.bf_earnings_above_uel,
    }),
    'Student Loan Information': filterEmptyValues({
      'Student Loan Repayment Plan': employeeRecord.student_loan_repayment_plan,
      'Student Loan From Date': employeeRecord.student_loan_from_date,
      'Student Loan To Date': employeeRecord.student_loan_to_date,
      'Student Loan Deducted': employeeRecord.student_loan_deducted,
    }),
    'Tax Information': filterEmptyValues({
      'Tax Previous Employment': employeeRecord.tax_previous_employment,
      'Tax This Employment': employeeRecord.tax_this_employment,
      'Net Pay To Date': employeeRecord.net_pay_to_date,
      'Directors Earnings To Date': employeeRecord.directors_earnings_to_date,
      'UK Tax YTD': employeeRecord.uk_tax_ytd,
      'Foreign Tax YTD': employeeRecord.foreign_tax_ytd,
      'Foreign Tax Offset YTD': employeeRecord.foreign_tax_offset_ytd,
    }),
    'Additional Information': filterEmptyValues({
      'Leaver': employeeRecord.leaver,
      'P45 1 If Required': employeeRecord.p45_1_if_required,
      'Default Cost Split': employeeRecord.default_cost_split,
      'Standard Hours': employeeRecord.standard_hours,
      'Created At': employeeRecord.created_at,
      'Updated At': employeeRecord.updated_at,
    }),
  } : {};

  return (
    <div className="employee-details-page">
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/employees')}
            >
              ← Back to Employees
            </button>
            <div className="header-info">
              <h1>{employee.forename} {employee.surname}</h1>
              <p className="header-subtitle">Employee Reference: {employee.reference}</p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-primary"
              onClick={() => navigate(`/employee/${employee.reference}/edit`)}
            >
              Edit Employee
            </button>
            <button 
              className="btn btn-info"
              onClick={() => navigate('/payroll')}
            >
              View Payslips
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">!</span>
            <span className="alert-message">{error}</span>
            <button 
              className="alert-close"
              onClick={() => setError(null)}
            >
              ×
            </button>
          </div>
        )}

        {/* Basic Employee Info Card */}
        <div className="card mb-6">
          <div className="card-header">
            <h3>Basic Information</h3>
          </div>
          <div className="card-body">
            <div className="basic-info-grid">
              <div className="info-item">
                <span className="info-label">Employee Reference</span>
                <span className="info-value">{employee.reference}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Full Name</span>
                <span className="info-value">{employee.forename} {employee.surname}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Department</span>
                <span className="info-value">{employee.department}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Job Title</span>
                <span className="info-value">{employee.job_title}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Start Date</span>
                <span className="info-value">{employee.start_date}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Basic Salary</span>
                <span className="info-value">£{employee.basic_salary}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comprehensive Employee Data */}
        {employeeRecord && Object.keys(groupedData).map((category) => {
          // Only show categories that have data
          const categoryData = groupedData[category];
          if (Object.keys(categoryData).length === 0) {
            return null;
          }
          
          return (
            <div key={category} className="card mb-6">
              <div className="card-header">
                <h3>{category}</h3>
              </div>
              <div className="card-body">
                <div className="details-table-container">
                  <table className="details-table">
                    <tbody>
                      {Object.entries(categoryData).map(([key, value]) => (
                        <tr key={key} className="detail-row">
                          <td className="detail-label">{key}</td>
                          <td className="detail-value">
                            {value || <span className="empty-value">Not specified</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}

        {!employeeRecord && (
          <div className="card mb-6">
            <div className="card-header">
              <h3>Comprehensive Data</h3>
            </div>
            <div className="card-body">
              <div className="empty-state">
                <div className="empty-icon">Data</div>
                <h3>No comprehensive data available</h3>
                <p>This employee may not have been imported from a comprehensive CSV file</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .employee-details-page {
          padding: var(--spacing-8);
          background: var(--bg-secondary);
          min-height: 100vh;
        }

        .page-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-8);
          background: var(--bg-primary);
          padding: var(--spacing-6);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow-sm);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: var(--spacing-6);
        }

        .header-info h1 {
          margin: 0 0 var(--spacing-2) 0;
          color: var(--text-primary);
          font-size: 2.5rem;
          font-weight: 700;
        }

        .header-subtitle {
          margin: 0;
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        .header-actions {
          display: flex;
          gap: var(--spacing-3);
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: var(--spacing-4);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border-color);
          border-top: 4px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-container {
          text-align: center;
          padding: var(--spacing-12);
        }

        .basic-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-4);
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-3);
          background: var(--bg-secondary);
          border-radius: var(--border-radius);
        }

        .info-label {
          font-weight: 600;
          color: var(--text-secondary);
        }

        .info-value {
          color: var(--text-primary);
          font-weight: 500;
        }

        .details-table-container {
          overflow-x: auto;
        }

        .details-table {
          width: 100%;
          border-collapse: collapse;
          background: var(--bg-primary);
        }

        .details-table th,
        .details-table td {
          padding: var(--spacing-3);
          text-align: left;
          border-bottom: 1px solid var(--border-color-light);
        }

        .details-table th {
          background: var(--bg-secondary);
          font-weight: 600;
          color: var(--text-primary);
        }

        .details-table tbody tr:hover {
          background: var(--bg-secondary);
        }

        .detail-label {
          font-weight: 600;
          color: var(--text-secondary);
          width: 40%;
        }

        .detail-value {
          color: var(--text-primary);
          font-weight: 500;
        }

        .empty-value {
          color: var(--text-secondary);
          font-style: italic;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: var(--spacing-3);
          padding: var(--spacing-4);
          border-radius: var(--border-radius);
          margin-bottom: var(--spacing-6);
        }

        .alert-error {
          background: var(--error-bg);
          color: var(--error-color);
          border: 1px solid var(--error-border);
        }

        .alert-icon {
          font-size: 1.2rem;
          font-weight: bold;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--error-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .alert-message {
          flex: 1;
        }

        .alert-close {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          font-size: 1.2rem;
          padding: 0;
        }

        .empty-state {
          text-align: center;
          padding: var(--spacing-12);
          color: var(--text-secondary);
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: var(--spacing-4);
          color: var(--text-secondary);
        }

        .empty-state h3 {
          margin: 0 0 var(--spacing-2) 0;
          color: var(--text-primary);
        }

        .empty-state p {
          margin: 0;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            gap: var(--spacing-4);
            align-items: stretch;
          }

          .header-content {
            flex-direction: column;
            gap: var(--spacing-4);
          }

          .header-actions {
            flex-direction: column;
          }

          .basic-info-grid {
            grid-template-columns: 1fr;
          }

          .header-info h1 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployeeDetails; 