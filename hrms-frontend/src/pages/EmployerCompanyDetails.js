import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { companyAPI } from '../lib/api';

const EmployerCompanyDetails = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadCompanyData();
  }, [companyId]);

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      const companyData = await companyAPI.getCompany(companyId);
      setCompany(companyData);
      setFormData(companyData);
    } catch (error) {
      console.error('Error loading company:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await companyAPI.updateCompany(companyId, formData);
      setCompany(formData);
      setEditing(false);
      alert('Company details updated successfully!');
    } catch (error) {
      console.error('Error updating company:', error);
      alert('Error updating company details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(company);
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading company details...</p>
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

  return (
    <div className="company-details-page">
      <div className="details-container">
        {/* Header */}
        <div className="details-header">
          <div className="header-content">
            <div className="company-info">
              <div className="company-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21h18M3 7h18M3 3h18M9 21v-4m0-4V9"/>
                </svg>
              </div>
              <div className="company-details">
                <h1>{company.name}</h1>
                <p>Company Details</p>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <Link to={`/employer/${companyId}`} className="back-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Company Details */}
        <div className="details-content">
          <div className="details-card">
            <div className="details-header-section">
              <h2>Company Information</h2>
              <div className="header-actions">
                {!editing ? (
                  <button 
                    className="action-btn secondary"
                    onClick={() => setEditing(true)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit Company
                  </button>
                ) : (
                  <div className="edit-actions">
                    <button 
                      className="action-btn primary"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      className="action-btn secondary"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="details-table-container">
              <table className="details-table">
                <tbody>
                  <tr>
                    <td className="table-label">Company Name</td>
                    <td className="table-value">
                      {editing ? (
                        <input
                          type="text"
                          value={formData.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="edit-input"
                        />
                      ) : (
                        company.name
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="table-label">Registration Number</td>
                    <td className="table-value">
                      {editing ? (
                        <input
                          type="text"
                          value={formData.registration_number || ''}
                          onChange={(e) => handleInputChange('registration_number', e.target.value)}
                          className="edit-input"
                        />
                      ) : (
                        company.registration_number || 'N/A'
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="table-label">Tax Office</td>
                    <td className="table-value">
                      {editing ? (
                        <input
                          type="text"
                          value={formData.tax_office || ''}
                          onChange={(e) => handleInputChange('tax_office', e.target.value)}
                          className="edit-input"
                        />
                      ) : (
                        company.tax_office || 'N/A'
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="table-label">Email</td>
                    <td className="table-value">
                      {editing ? (
                        <input
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="edit-input"
                        />
                      ) : (
                        company.email || 'N/A'
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="table-label">Phone</td>
                    <td className="table-value">
                      {editing ? (
                        <input
                          type="tel"
                          value={formData.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="edit-input"
                        />
                      ) : (
                        company.phone || 'N/A'
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="table-label">Website</td>
                    <td className="table-value">
                      {editing ? (
                        <input
                          type="url"
                          value={formData.website || ''}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          className="edit-input"
                        />
                      ) : (
                        company.website || 'N/A'
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="table-label">Address</td>
                    <td className="table-value">
                      {editing ? (
                        <textarea
                          value={formData.address || ''}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="edit-textarea"
                          rows="3"
                        />
                      ) : (
                        company.address || 'N/A'
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="table-label">Postcode</td>
                    <td className="table-value">
                      {editing ? (
                        <input
                          type="text"
                          value={formData.postcode || ''}
                          onChange={(e) => handleInputChange('postcode', e.target.value)}
                          className="edit-input"
                        />
                      ) : (
                        company.postcode || 'N/A'
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="table-label">Industry</td>
                    <td className="table-value">
                      {editing ? (
                        <input
                          type="text"
                          value={formData.industry || ''}
                          onChange={(e) => handleInputChange('industry', e.target.value)}
                          className="edit-input"
                        />
                      ) : (
                        company.industry || 'N/A'
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="table-label">Annual Revenue</td>
                    <td className="table-value">
                      {editing ? (
                        <input
                          type="number"
                          value={formData.annual_revenue || ''}
                          onChange={(e) => handleInputChange('annual_revenue', e.target.value)}
                          className="edit-input"
                          placeholder="Enter amount"
                        />
                      ) : (
                        company.annual_revenue ? `£${company.annual_revenue}` : 'N/A'
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="table-label">Status</td>
                    <td className="table-value">
                      {editing ? (
                        <select
                          value={formData.status || 'active'}
                          onChange={(e) => handleInputChange('status', e.target.value)}
                          className="edit-select"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="pending">Pending</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      ) : (
                        company.status || 'Active'
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .company-details-page {
          min-height: 100vh;
          background: var(--background-color);
          padding: var(--spacing-8) 0;
        }

        .details-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--spacing-4);
        }

        .details-header {
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

        .details-content {
          margin-bottom: var(--spacing-6);
        }

        .details-card {
          background: white;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
        }

        .details-header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-6);
          border-bottom: 1px solid var(--border-color);
        }

        .details-header-section h2 {
          font-size: var(--font-size-xl);
          font-weight: 600;
          color: var(--text-primary);
        }

        .header-actions {
          display: flex;
          gap: var(--spacing-3);
        }

        .edit-actions {
          display: flex;
          gap: var(--spacing-3);
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
          padding: var(--spacing-2) var(--spacing-4);
          border: none;
          border-radius: var(--radius-md);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .action-btn.primary {
          background: var(--primary-color);
          color: white;
        }

        .action-btn.primary:hover:not(:disabled) {
          background: var(--primary-dark);
        }

        .action-btn.secondary {
          background: var(--surface-color);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .action-btn.secondary:hover:not(:disabled) {
          background: var(--border-color);
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .details-table-container {
          padding: var(--spacing-6);
        }

        .details-table {
          width: 100%;
          border-collapse: collapse;
        }

        .details-table td {
          padding: var(--spacing-3);
          border-bottom: 1px solid var(--border-color);
        }

        .details-table td:last-child {
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

        .edit-input,
        .edit-textarea,
        .edit-select {
          width: 100%;
          padding: var(--spacing-2);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: var(--font-size-base);
          transition: all var(--transition-fast);
        }

        .edit-input:focus,
        .edit-textarea:focus,
        .edit-select:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .edit-textarea {
          resize: vertical;
          min-height: 80px;
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

        @media (max-width: 768px) {
          .details-header {
            flex-direction: column;
            gap: var(--spacing-4);
            align-items: flex-start;
          }

          .details-header-section {
            flex-direction: column;
            gap: var(--spacing-4);
            align-items: flex-start;
          }

          .table-label {
            width: auto;
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployerCompanyDetails; 