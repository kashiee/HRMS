import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { companyAPI, employeeAPI } from '../lib/api';

const EmployerDashboard = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllEmployees, setShowAllEmployees] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);

  useEffect(() => {
    loadCompanyData();
    loadEmployees();
  }, [companyId]);

  const loadCompanyData = async () => {
    try {
      const companyData = await companyAPI.getCompany(companyId);
      setCompany(companyData);
    } catch (error) {
      console.error('Error loading company:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await employeeAPI.getEmployees({ companyId });
      // Handle the response structure: { message, employees, total, ... }
      const employeesData = response.employees || response || [];
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error loading employees:', error);
      setEmployees([]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setCsvFile(file);
    } else {
      alert('Please select a valid CSV file');
      setCsvFile(null);
    }
  };

  const handleCSVUpload = async () => {
    if (!csvFile) {
      alert('Please select a CSV file first');
      return;
    }
    
    try {
      setUploading(true);
      console.log('Starting CSV upload for file:', csvFile.name, 'Size:', csvFile.size);
      
      const result = await employeeAPI.uploadEmployeeCSV(csvFile);
      console.log('CSV upload result:', result);
      
      alert('Employees uploaded successfully!');
      loadEmployees(); // Reload employees after upload
      setCsvFile(null);
    } catch (error) {
      console.error('Error uploading employees:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Error uploading employees. Please try again.';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleViewEmployee = (employeeReference) => {
    navigate(`/employee/${employeeReference}`);
  };

  const handleEditEmployee = (employeeReference) => {
    navigate(`/employee/${employeeReference}/edit`);
  };

  const handleManagePayroll = () => {
    navigate(`/payroll`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading company information...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="error-container">
        <h2>Company not found</h2>
        <p>The requested company could not be found.</p>
        <Link to="/roles" className="back-btn">Back to Roles</Link>
      </div>
    );
  }

  const displayedEmployees = showAllEmployees ? employees : employees.slice(0, 10);

  return (
    <div className="employer-dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="company-info">
              <div className="company-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21h18M3 7h18M3 3h18M9 21v-4m0-4V9"/>
                </svg>
              </div>
              <div className="company-details">
                <h1>{company.name}</h1>
                <p>Employer Dashboard</p>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <Link to="/roles" className="back-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Roles
            </Link>
          </div>
        </div>

        {/* Company Overview */}
        <div className="company-overview">
          <div className="overview-card">
            <div className="overview-header">
              <h2>Company Information</h2>
            </div>
            
            <div className="company-table-container">
              {company && (
                <table className="company-table">
                  <tbody>
                    <tr>
                      <td className="table-label">Company Name</td>
                      <td className="table-value">{company.name}</td>
                    </tr>
                    <tr>
                      <td className="table-label">Registration Number</td>
                      <td className="table-value">{company.registration_number || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="table-label">Tax Office</td>
                      <td className="table-value">{company.tax_office || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="table-label">Email</td>
                      <td className="table-value">{company.email || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="table-label">Phone</td>
                      <td className="table-value">{company.phone || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="table-label">Address</td>
                      <td className="table-value">{company.address || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="table-label">Postcode</td>
                      <td className="table-value">{company.postcode || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="table-label">Actions</td>
                      <td className="table-value">
                        <div className="company-actions">
                          <button 
                            className="action-btn primary"
                            onClick={() => navigate(`/employer/${companyId}/details`)}
                          >
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <div className="action-card">
            <div className="action-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="action-buttons">
              <button className="action-btn primary" onClick={handleManagePayroll}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                Manage Payroll
              </button>
              <button className="action-btn secondary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
                Generate Reports
              </button>
            </div>
          </div>
        </div>

        {/* Employee Management */}
        <div className="employee-management">
          <div className="management-card">
            <div className="management-header">
              <h2>Employee Management</h2>
              <div className="header-actions">
                <div className="csv-upload">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="file-input"
                    id="employee-csv"
                  />
                  <label htmlFor="employee-csv" className="upload-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10,9 9,9 8,9"/>
                    </svg>
                    Upload CSV
                  </label>
                  {csvFile && (
                    <button 
                      className="upload-confirm-btn"
                      onClick={handleCSVUpload}
                      disabled={uploading}
                    >
                      {uploading ? 'Uploading...' : 'Confirm Upload'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="employee-table-container">
              {employees.length > 0 ? (
                <>
                  <table className="employee-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Reference</th>
                        <th>Department</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedEmployees.map((employee) => (
                        <tr key={employee.reference}>
                          <td>
                            <div className="employee-name">
                              <div className="employee-avatar">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                  <circle cx="12" cy="7" r="4"/>
                                </svg>
                              </div>
                              <span>{employee.name || `${employee.forename || ''} ${employee.surname || ''}`.trim()}</span>
                            </div>
                          </td>
                          <td>{employee.reference}</td>
                          <td>{employee.department || 'N/A'}</td>
                          <td>
                            <div className="action-buttons-small">
                              <button 
                                className="action-btn-small view"
                                onClick={() => handleViewEmployee(employee.reference)}
                              >
                                View Details
                              </button>
                              <button 
                                className="action-btn-small edit"
                                onClick={() => handleEditEmployee(employee.reference)}
                              >
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {employees.length > 10 && (
                    <div className="show-all-container">
                      <button 
                        className="show-all-btn"
                        onClick={() => setShowAllEmployees(!showAllEmployees)}
                      >
                        {showAllEmployees ? 'Show Less' : `Show All (${employees.length} employees)`}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <h3>No Employees Yet</h3>
                  <p>Upload a CSV file to add employees to your company</p>
                  <div className="empty-actions">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="file-input"
                      id="employee-csv-empty"
                    />
                    <label htmlFor="employee-csv-empty" className="upload-btn primary">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                      </svg>
                      Upload Employee CSV
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .employer-dashboard {
          min-height: 100vh;
          background: var(--background-color);
          padding: var(--spacing-8) 0;
        }

        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--spacing-4);
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-8);
        }

        .company-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-4);
        }

        .company-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
          border-radius: var(--radius-xl);
          color: white;
        }

        .company-details h1 {
          font-size: var(--font-size-3xl);
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--spacing-1);
        }

        .company-details p {
          color: var(--text-secondary);
          font-size: var(--font-size-lg);
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
          padding: var(--spacing-3) var(--spacing-4);
          background: var(--surface-color);
          color: var(--text-primary);
          text-decoration: none;
          border-radius: var(--radius-lg);
          font-weight: 500;
          transition: all var(--transition-fast);
        }

        .back-btn:hover {
          background: var(--border-color);
        }

        .company-overview {
          margin-bottom: var(--spacing-6);
        }

        .overview-card {
          background: white;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
        }

        .overview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-6);
          border-bottom: 1px solid var(--border-color);
        }

        .overview-header h2 {
          font-size: var(--font-size-xl);
          font-weight: 600;
          color: var(--text-primary);
        }

        .view-details-btn {
          padding: var(--spacing-2) var(--spacing-4);
          background: var(--surface-color);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .view-details-btn:hover {
          background: var(--border-color);
        }

        .overview-content {
          padding: var(--spacing-6);
        }

        .key-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-4);
          margin-bottom: var(--spacing-6);
        }

        .metric {
          display: flex;
          align-items: center;
          gap: var(--spacing-3);
          padding: var(--spacing-4);
          background: var(--surface-color);
          border-radius: var(--radius-lg);
        }

        .metric-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: var(--primary-color);
          border-radius: var(--radius-lg);
          color: white;
        }

        .metric-info {
          display: flex;
          flex-direction: column;
        }

        .metric-value {
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--text-primary);
        }

        .metric-label {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }

        .detailed-info {
          border-top: 1px solid var(--border-color);
          padding-top: var(--spacing-6);
        }

        .info-section {
          margin-bottom: var(--spacing-6);
        }

        .info-section h3 {
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-3);
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-3);
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          padding: var(--spacing-2) 0;
        }

        .info-item.full-width {
          grid-column: 1 / -1;
        }

        .info-label {
          font-weight: 600;
          color: var(--text-secondary);
        }

        .info-value {
          color: var(--text-primary);
        }

        .quick-actions {
          margin-bottom: var(--spacing-6);
        }

        .action-card {
          background: white;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
          padding: var(--spacing-6);
        }

        .action-card .action-header h2 {
          font-size: var(--font-size-xl);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-4);
        }

        .action-buttons {
          display: flex;
          gap: var(--spacing-4);
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
          padding: var(--spacing-3) var(--spacing-6);
          border: none;
          border-radius: var(--radius-lg);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .action-btn.primary {
          background: var(--primary-color);
          color: white;
        }

        .action-btn.primary:hover {
          background: var(--primary-dark);
        }

        .action-btn.secondary {
          background: var(--surface-color);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .action-btn.secondary:hover {
          background: var(--border-color);
        }

        .employee-management {
          margin-bottom: var(--spacing-6);
        }

        .management-card {
          background: white;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
        }

        .management-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-6);
          border-bottom: 1px solid var(--border-color);
        }

        .management-header h2 {
          font-size: var(--font-size-xl);
          font-weight: 600;
          color: var(--text-primary);
        }

        .csv-upload {
          display: flex;
          align-items: center;
          gap: var(--spacing-3);
        }

        .file-input {
          display: none;
        }

        .upload-btn {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
          padding: var(--spacing-2) var(--spacing-4);
          background: var(--surface-color);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          cursor: pointer;
          transition: all var(--transition-fast);
          font-size: var(--font-size-sm);
        }

        .upload-btn:hover {
          background: var(--border-color);
        }

        .upload-btn.primary {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .upload-btn.primary:hover {
          background: var(--primary-dark);
        }

        .upload-confirm-btn {
          padding: var(--spacing-2) var(--spacing-4);
          background: var(--success-color);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          font-size: var(--font-size-sm);
        }

        .upload-confirm-btn:hover:not(:disabled) {
          background: var(--success-dark);
        }

        .upload-confirm-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .employee-table-container {
          padding: var(--spacing-6);
        }

        .employee-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: var(--spacing-4);
        }

        .employee-table th {
          text-align: left;
          padding: var(--spacing-3);
          background: var(--surface-color);
          font-weight: 600;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border-color);
        }

        .employee-table td {
          padding: var(--spacing-3);
          border-bottom: 1px solid var(--border-color);
        }

        .employee-name {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
        }

        .employee-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: var(--surface-color);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
        }

        .action-buttons-small {
          display: flex;
          gap: var(--spacing-2);
        }

        .action-btn-small {
          padding: var(--spacing-1) var(--spacing-2);
          border: none;
          border-radius: var(--radius-sm);
          font-size: var(--font-size-xs);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .action-btn-small.view {
          background: var(--info-color);
          color: white;
        }

        .action-btn-small.view:hover {
          background: var(--info-dark);
        }

        .action-btn-small.edit {
          background: var(--warning-color);
          color: white;
        }

        .action-btn-small.edit:hover {
          background: var(--warning-dark);
        }

        .show-all-container {
          display: flex;
          justify-content: center;
          margin-top: var(--spacing-4);
        }

        .show-all-btn {
          padding: var(--spacing-2) var(--spacing-4);
          background: var(--surface-color);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .show-all-btn:hover {
          background: var(--border-color);
        }

        .empty-state {
          text-align: center;
          padding: var(--spacing-12) var(--spacing-6);
        }

        .empty-icon {
          margin-bottom: var(--spacing-4);
          color: var(--text-secondary);
        }

        .empty-state h3 {
          font-size: var(--font-size-xl);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-2);
        }

        .empty-state p {
          color: var(--text-secondary);
          margin-bottom: var(--spacing-6);
        }

        .empty-actions {
          display: flex;
          justify-content: center;
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
          padding: var(--spacing-12) var(--spacing-6);
        }

        .error-container h2 {
          font-size: var(--font-size-xl);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-2);
        }

        .error-container p {
          color: var(--text-secondary);
          margin-bottom: var(--spacing-6);
        }

        .company-table-container {
          padding: var(--spacing-6);
        }

        .company-table {
          width: 100%;
          border-collapse: collapse;
          background: var(--surface-color);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }

        .company-table td {
          padding: var(--spacing-3);
          border-bottom: 1px solid var(--border-color);
        }

        .company-table td:last-child {
          border-bottom: none;
        }

        .table-label {
          font-weight: 600;
          color: var(--text-secondary);
          text-align: right;
          padding-right: var(--spacing-3);
          width: 200px;
        }

        .table-value {
          color: var(--text-primary);
          text-align: left;
        }

        .company-actions {
          display: flex;
          gap: var(--spacing-2);
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            gap: var(--spacing-4);
            align-items: flex-start;
          }

          .key-metrics {
            grid-template-columns: 1fr;
          }

          .action-buttons {
            flex-direction: column;
          }

          .management-header {
            flex-direction: column;
            gap: var(--spacing-4);
            align-items: flex-start;
          }

          .employee-table {
            font-size: var(--font-size-sm);
          }

          .employee-table th,
          .employee-table td {
            padding: var(--spacing-2);
          }
        }
      `}</style>
    </div>
  );
};

export default EmployerDashboard; 