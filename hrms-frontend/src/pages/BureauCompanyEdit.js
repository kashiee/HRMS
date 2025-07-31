import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { companyAPI } from '../lib/api';

const BureauCompanyEdit = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCompanyDetails();
  }, [companyId]);

  const loadCompanyDetails = async () => {
    try {
      setLoading(true);
      const data = await companyAPI.getCompany(companyId);
      setCompany(data);
    } catch (err) {
      console.error('Error loading company details:', err);
      setError('Failed to load company details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setCompany(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await companyAPI.updateCompany(companyId, company);
      alert('Company updated successfully!');
      navigate(`/bureau/company/${companyId}`);
    } catch (err) {
      console.error('Error updating company:', err);
      alert('Error updating company. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      try {
        setSaving(true);
        await companyAPI.deleteCompany(companyId);
        alert('Company deleted successfully!');
        navigate('/bureau');
      } catch (err) {
        console.error('Error deleting company:', err);
        alert('Error deleting company. Please try again.');
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="company-edit-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading company details...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="company-edit-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'Company not found'}</p>
          <Link to="/bureau" className="back-link">Back to Bureau</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="company-edit-page">
      <div className="edit-container">
        {/* Header */}
        <div className="edit-header">
          <div className="header-content">
            <div className="company-title">
              <div className="company-icon-large">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21h18M3 7h18M3 3h18M9 21v-4m0-4V9"/>
                </svg>
              </div>
              <div className="title-info">
                <h1>Edit Company</h1>
                <p className="company-subtitle">{company.name}</p>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <Link to={`/bureau/company/${companyId}`} className="cancel-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
              Cancel
            </Link>
            <button 
              onClick={handleDelete}
              className="delete-btn"
              disabled={saving}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
              </svg>
              Delete Company
            </button>
          </div>
        </div>

        {/* Edit Form */}
        <div className="edit-content">
          <form onSubmit={handleSubmit} className="edit-form">
            <div className="form-grid">
              <div className="form-section">
                <h3>Basic Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Company Name *</label>
                    <input
                      type="text"
                      value={company.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Registration Number *</label>
                    <input
                      type="text"
                      value={company.registration_number || ''}
                      onChange={(e) => handleInputChange('registration_number', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Tax Office</label>
                    <input
                      type="text"
                      value={company.tax_office || ''}
                      onChange={(e) => handleInputChange('tax_office', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Industry</label>
                    <input
                      type="text"
                      value={company.industry || ''}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Employee Count</label>
                    <input
                      type="number"
                      value={company.employee_count || ''}
                      onChange={(e) => handleInputChange('employee_count', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Annual Revenue (£)</label>
                    <input
                      type="number"
                      value={company.annual_revenue || ''}
                      onChange={(e) => handleInputChange('annual_revenue', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={company.status || 'active'}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Contact Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={company.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={company.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Website</label>
                    <input
                      type="url"
                      value={company.website || ''}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Address Information</h3>
                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Address</label>
                    <textarea
                      value={company.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows="3"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Postcode</label>
                    <input
                      type="text"
                      value={company.postcode || ''}
                      onChange={(e) => handleInputChange('postcode', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="save-btn"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .company-edit-page {
          min-height: 100vh;
          background: var(--background-color);
          padding: var(--spacing-8) 0;
        }

        .edit-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--spacing-4);
        }

        .edit-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-8);
          background: white;
          padding: var(--spacing-6);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
        }

        .company-title {
          display: flex;
          align-items: center;
          gap: var(--spacing-4);
        }

        .company-icon-large {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
          border-radius: var(--radius-xl);
          color: white;
        }

        .title-info h1 {
          font-size: var(--font-size-3xl);
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--spacing-1);
        }

        .company-subtitle {
          color: var(--text-secondary);
          font-size: var(--font-size-lg);
        }

        .header-actions {
          display: flex;
          gap: var(--spacing-3);
        }

        .cancel-btn, .delete-btn {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
          padding: var(--spacing-3) var(--spacing-4);
          text-decoration: none;
          border-radius: var(--radius-lg);
          font-weight: 500;
          transition: all var(--transition-fast);
          border: none;
          cursor: pointer;
        }

        .cancel-btn {
          background: var(--surface-color);
          color: var(--text-primary);
        }

        .cancel-btn:hover {
          background: var(--border-color);
        }

        .delete-btn {
          background: #dc2626;
          color: white;
        }

        .delete-btn:hover:not(:disabled) {
          background: #b91c1c;
        }

        .delete-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .edit-content {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: var(--spacing-6);
          box-shadow: var(--shadow-sm);
        }

        .edit-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-8);
        }

        .form-grid {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-8);
        }

        .form-section {
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-6);
        }

        .form-section h3 {
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-4);
          padding-bottom: var(--spacing-2);
          border-bottom: 1px solid var(--border-color);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-4);
          margin-bottom: var(--spacing-4);
        }

        .form-row:last-child {
          margin-bottom: 0;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-2);
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-size: var(--font-size-sm);
          font-weight: 600;
          color: var(--text-primary);
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: var(--spacing-3);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: var(--font-size-base);
          transition: all var(--transition-fast);
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--spacing-4);
          padding-top: var(--spacing-6);
          border-top: 1px solid var(--border-color);
        }

        .save-btn {
          padding: var(--spacing-3) var(--spacing-6);
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: var(--radius-lg);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .save-btn:hover:not(:disabled) {
          background: var(--primary-dark);
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .loading-container, .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: var(--spacing-4);
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid var(--border-color);
          border-top: 4px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-container h2 {
          color: var(--text-primary);
          margin-bottom: var(--spacing-2);
        }

        .error-container p {
          color: var(--text-secondary);
          margin-bottom: var(--spacing-4);
        }

        .back-link {
          padding: var(--spacing-3) var(--spacing-6);
          background: var(--primary-color);
          color: white;
          text-decoration: none;
          border-radius: var(--radius-lg);
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .edit-header {
            flex-direction: column;
            gap: var(--spacing-4);
            align-items: flex-start;
          }

          .header-actions {
            width: 100%;
            justify-content: space-between;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default BureauCompanyEdit; 