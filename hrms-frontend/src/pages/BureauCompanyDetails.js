import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { companyAPI } from '../lib/api';

const BureauCompanyDetails = () => {
  const { companyId } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <div className="company-details-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading company details...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="company-details-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'Company not found'}</p>
          <Link to="/bureau" className="back-link">Back to Bureau</Link>
        </div>
      </div>
    );
  }

  const companyInfo = [
    { label: 'Company Name', value: company.name, type: 'text' },
    { label: 'Registration Number', value: company.registration_number, type: 'text' },
    { label: 'Tax Office', value: company.tax_office, type: 'text' },
    { label: 'Address', value: company.address, type: 'text' },
    { label: 'Postcode', value: company.postcode, type: 'text' },
    { label: 'Phone', value: company.phone, type: 'phone' },
    { label: 'Email', value: company.email, type: 'email' },
    { label: 'Website', value: company.website, type: 'url' },
    { label: 'Industry', value: company.industry, type: 'text' },
    { label: 'Employee Count', value: company.employee_count, type: 'number' },
    { label: 'Annual Revenue', value: company.annual_revenue ? `£${company.annual_revenue.toLocaleString()}` : null, type: 'text' },
    { label: 'Status', value: company.status, type: 'text' },
    { label: 'Created At', value: company.created_at ? new Date(company.created_at).toLocaleDateString() : null, type: 'text' },
    { label: 'Updated At', value: company.updated_at ? new Date(company.updated_at).toLocaleDateString() : null, type: 'text' }
  ];

  const getValueDisplay = (info) => {
    if (!info.value) return '-';
    
    switch (info.type) {
      case 'email':
        return (
          <a href={`mailto:${info.value}`} className="link-email">
            {info.value}
          </a>
        );
      case 'phone':
        return (
          <a href={`tel:${info.value}`} className="link-phone">
            {info.value}
          </a>
        );
      case 'url':
        return (
          <a href={info.value} target="_blank" rel="noopener noreferrer" className="link-website">
            {info.value}
          </a>
        );
      default:
        return info.value;
    }
  };

  return (
    <div className="company-details-page">
      <div className="details-container">
        {/* Header */}
        <div className="details-header">
          <div className="header-content">
            <div className="company-title">
              <div className="company-icon-large">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21h18M3 7h18M3 3h18M9 21v-4m0-4V9"/>
                </svg>
              </div>
              <div className="title-info">
                <h1>{company.name}</h1>
                <p className="company-subtitle">Company Details</p>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <Link to="/bureau" className="back-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Bureau
            </Link>
            <Link to={`/bureau/company/${companyId}/edit`} className="edit-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Company
            </Link>
          </div>
        </div>

        {/* Company Information Table */}
        <div className="details-content">
          <div className="table-section">
            <h2>Company Information</h2>
            <div className="table-container">
              <table className="details-table">
                <tbody>
                  {companyInfo.map((info, index) => (
                    info.value && (
                      <tr key={index}>
                        <td className="field-label">{info.label}</td>
                        <td className="field-value">
                          {getValueDisplay(info)}
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="stats-section">
            <h2>Quick Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-number">{company.employee_count || 0}</div>
                  <div className="stat-label">Employees</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-number">
                    {company.annual_revenue ? `£${(company.annual_revenue / 1000000).toFixed(1)}M` : 'N/A'}
                  </div>
                  <div className="stat-label">Annual Revenue</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-number">{company.status || 'Active'}</div>
                  <div className="stat-label">Status</div>
                </div>
              </div>
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

        .back-btn, .edit-btn {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
          padding: var(--spacing-3) var(--spacing-4);
          text-decoration: none;
          border-radius: var(--radius-lg);
          font-weight: 500;
          transition: all var(--transition-fast);
        }

        .back-btn {
          background: var(--surface-color);
          color: var(--text-primary);
        }

        .back-btn:hover {
          background: var(--border-color);
        }

        .edit-btn {
          background: var(--primary-color);
          color: white;
        }

        .edit-btn:hover {
          background: var(--primary-dark);
        }

        .details-content {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-8);
        }

        .table-section {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: var(--spacing-6);
          box-shadow: var(--shadow-sm);
        }

        .table-section h2 {
          font-size: var(--font-size-xl);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-6);
        }

        .table-container {
          overflow-x: auto;
        }

        .details-table {
          width: 100%;
          border-collapse: collapse;
        }

        .details-table tr {
          border-bottom: 1px solid var(--border-color);
        }

        .details-table tr:last-child {
          border-bottom: none;
        }

        .field-label {
          padding: var(--spacing-4);
          font-weight: 600;
          color: var(--text-primary);
          background: var(--surface-color);
          width: 30%;
          vertical-align: top;
        }

        .field-value {
          padding: var(--spacing-4);
          color: var(--text-primary);
          vertical-align: top;
        }

        .link-email, .link-phone, .link-website {
          color: var(--primary-color);
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .link-email:hover, .link-phone:hover, .link-website:hover {
          color: var(--primary-dark);
          text-decoration: underline;
        }

        .stats-section {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: var(--spacing-6);
          box-shadow: var(--shadow-sm);
        }

        .stats-section h2 {
          font-size: var(--font-size-xl);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-6);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-6);
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: var(--spacing-4);
          padding: var(--spacing-4);
          background: var(--surface-color);
          border-radius: var(--radius-lg);
        }

        .stat-icon {
          color: var(--primary-color);
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-number {
          font-size: var(--font-size-xl);
          font-weight: 700;
          color: var(--text-primary);
        }

        .stat-label {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
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
          .details-header {
            flex-direction: column;
            gap: var(--spacing-4);
            align-items: flex-start;
          }

          .header-actions {
            width: 100%;
            justify-content: space-between;
          }

          .field-label {
            width: 40%;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default BureauCompanyDetails; 