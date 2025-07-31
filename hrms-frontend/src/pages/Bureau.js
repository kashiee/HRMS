import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { companyAPI } from '../lib/api';

const Bureau = () => {
  const [companies, setCompanies] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Load companies from backend
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const response = await companyAPI.getCompanies();
      console.log('Companies response:', response);
      // Backend returns array directly, not wrapped in companies object
      const companiesList = Array.isArray(response) ? response : (response.companies || []);
      console.log('Companies list:', companiesList);
      setCompanies(companiesList);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setCsvFile(file);
      setUploadedFileName(null);
      setUploadSuccess(false);
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
      await companyAPI.uploadCompanyCSV(csvFile);
      setUploadedFileName(csvFile.name);
      setUploadSuccess(true);
      alert('Companies uploaded successfully!');
      setCsvFile(null);
      loadCompanies(); // Reload companies
    } catch (error) {
      console.error('Error uploading companies:', error);
      alert('Error uploading companies. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bureau-page">
      <div className="bureau-container">
        {/* Header */}
        <div className="bureau-header">
          <div className="header-content">
            <h1>Bureau Services</h1>
            <p>Manage multiple companies and upload bulk data</p>
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

        {/* CSV Upload Section */}
        <div className="upload-section">
          <div className="upload-card">
            <div className="upload-header">
              <h2>Upload Companies CSV</h2>
              <p>Upload a CSV file to add multiple companies at once</p>
            </div>
            
            <div className="upload-area">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="file-input"
                id="bureau-csv"
              />
              <label htmlFor="bureau-csv" className="file-label">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
                <span>{csvFile ? csvFile.name : 'Choose CSV File'}</span>
              </label>
              
              {csvFile && (
                <button 
                  className="upload-btn"
                  onClick={handleCSVUpload}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload Companies'}
                </button>
              )}
            </div>

            {/* Upload Success Message */}
            {uploadSuccess && uploadedFileName && (
              <div className="upload-success">
                <div className="success-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                </div>
                <div className="success-content">
                  <h3>Upload Successful!</h3>
                  <p>File uploaded: <strong>{uploadedFileName}</strong></p>
                  <p>Companies have been added to the system.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Companies Table */}
        <div className="companies-section">
          <div className="section-header">
            <h2>Companies ({companies.length})</h2>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading companies...</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="companies-table">
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Registration Number</th>
                    <th>Employees</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.length > 0 ? (
                    companies.map((company) => (
                      <tr key={company.id}>
                        <td>
                          <div className="company-name">
                            <div className="company-icon">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 21h18M3 7h18M3 3h18M9 21v-4m0-4V9"/>
                              </svg>
                            </div>
                            <span>{company.name}</span>
                          </div>
                        </td>
                        <td>{company.registration_number || '-'}</td>
                        <td>
                          <div className="employee-count">
                            <span className="count-number">{company.employee_count || 0}</span>
                            <span className="count-label">employees</span>
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Link 
                              to={`/bureau/company/${company.id}`}
                              className="action-btn view-btn"
                            >
                              View Details
                            </Link>
                            <Link 
                              to={`/bureau/company/${company.id}/edit`}
                              className="action-btn edit-btn"
                            >
                              Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="empty-state">
                        <div className="empty-content">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 21h18M3 7h18M3 3h18M9 21v-4m0-4V9"/>
                          </svg>
                          <h3>No companies found</h3>
                          <p>Upload a CSV file to add companies or create one manually</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .bureau-page {
          min-height: 100vh;
          background: var(--background-color);
          padding: var(--spacing-8) 0;
        }

        .bureau-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 var(--spacing-4);
        }

        .bureau-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-8);
        }

        .header-content h1 {
          font-size: var(--font-size-3xl);
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--spacing-2);
        }

        .header-content p {
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

        .upload-section {
          margin-bottom: var(--spacing-8);
        }

        .upload-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: var(--spacing-6);
          box-shadow: var(--shadow-sm);
        }

        .upload-header {
          margin-bottom: var(--spacing-6);
        }

        .upload-header h2 {
          font-size: var(--font-size-xl);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-2);
        }

        .upload-header p {
          color: var(--text-secondary);
        }

        .upload-area {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-4);
        }

        .file-input {
          display: none;
        }

        .file-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-3);
          padding: var(--spacing-6);
          border: 2px dashed var(--border-color);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--transition-fast);
          background: var(--background-color);
          font-weight: 500;
        }

        .file-label:hover {
          border-color: var(--primary-color);
          background: var(--surface-color);
        }

        .upload-btn {
          padding: var(--spacing-3) var(--spacing-6);
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: var(--radius-lg);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .upload-btn:hover:not(:disabled) {
          background: var(--primary-dark);
        }

        .upload-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .upload-success {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-4);
          margin-top: var(--spacing-6);
          padding: var(--spacing-4);
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: var(--radius-lg);
        }

        .success-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: #22c55e;
          color: white;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .success-content h3 {
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: #166534;
          margin-bottom: var(--spacing-1);
        }

        .success-content p {
          color: #166534;
          font-size: var(--font-size-sm);
          margin-bottom: var(--spacing-1);
        }

        .success-content p:last-child {
          margin-bottom: 0;
        }

        .companies-section {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }

        .section-header {
          padding: var(--spacing-6);
          border-bottom: 1px solid var(--border-color);
        }

        .section-header h2 {
          font-size: var(--font-size-xl);
          font-weight: 600;
          color: var(--text-primary);
        }

        .table-container {
          overflow-x: auto;
        }

        .companies-table {
          width: 100%;
          border-collapse: collapse;
        }

        .companies-table th {
          background: var(--surface-color);
          padding: var(--spacing-4);
          text-align: left;
          font-weight: 600;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border-color);
          font-size: var(--font-size-sm);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .companies-table td {
          padding: var(--spacing-4);
          border-bottom: 1px solid var(--border-color);
          color: var(--text-primary);
          vertical-align: middle;
        }

        .company-name {
          display: flex;
          align-items: center;
          gap: var(--spacing-3);
        }

        .company-icon {
          color: var(--primary-color);
        }

        .employee-count {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
        }

        .count-number {
          font-weight: 600;
          color: var(--primary-color);
        }

        .count-label {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }

        .action-buttons {
          display: flex;
          gap: var(--spacing-2);
        }

        .action-btn {
          padding: var(--spacing-2) var(--spacing-3);
          border-radius: var(--radius-sm);
          text-decoration: none;
          font-size: var(--font-size-sm);
          font-weight: 500;
          transition: all var(--transition-fast);
        }

        .view-btn {
          background: var(--primary-color);
          color: white;
        }

        .view-btn:hover {
          background: var(--primary-dark);
        }

        .edit-btn {
          background: var(--surface-color);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .edit-btn:hover {
          background: var(--background-color);
        }

        .empty-state {
          text-align: center;
          padding: var(--spacing-12);
        }

        .empty-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-4);
          color: var(--text-secondary);
        }

        .empty-content h3 {
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--text-primary);
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-4);
          padding: var(--spacing-12);
          color: var(--text-secondary);
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--border-color);
          border-top: 3px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .bureau-header {
            flex-direction: column;
            gap: var(--spacing-4);
            align-items: flex-start;
          }

          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Bureau; 