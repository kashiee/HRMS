import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { companyAPI, apiUtils } from '../lib/api';

const CompanyDetails = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [initializingDepartments, setInitializingDepartments] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: '',
    registration_number: '',
    tax_office: '',
    address: '',
    postcode: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    loadCompanyAndDepartments();
  }, [companyId]);

  const loadCompanyAndDepartments = async () => {
    try {
      setLoading(true);
      // Load company details
      const companyData = await companyAPI.getCompany(companyId);
      setCompany(companyData);
      
      // Load departments
      const deptData = await companyAPI.getDepartments(companyId);
      setDepartments(deptData);
    } catch (err) {
      setError(apiUtils.handleError(err).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await companyAPI.updateCompany(companyId, editFormData);
      setShowEditModal(false);
      loadCompanyAndDepartments();
      alert('Company updated successfully!');
    } catch (err) {
      setError(apiUtils.handleError(err).message);
    }
  };

  const handleEdit = () => {
    setEditFormData({
      name: company.name,
      registration_number: company.registration_number,
      tax_office: company.tax_office,
      address: company.address,
      postcode: company.postcode,
      phone: company.phone || '',
      email: company.email || '',
    });
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      try {
        await companyAPI.deleteCompany(companyId);
        navigate('/company');
      } catch (err) {
        setError(apiUtils.handleError(err).message);
      }
    }
  };

  const handleInitializeDepartments = async () => {
    try {
      setInitializingDepartments(true);
      await companyAPI.initializeDepartments(companyId);
      loadCompanyAndDepartments();
      alert('Sample departments added successfully!');
    } catch (err) {
      setError(apiUtils.handleError(err).message);
    } finally {
      setInitializingDepartments(false);
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

  if (!company) {
    return (
      <div className="company-details-page">
        <div className="error-container">
          <h2>Company not found</h2>
          <button className="btn btn-primary" onClick={() => navigate('/company')}>
            Back to Companies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="company-details-page">
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/company')}
            >
              ← Back to Companies
            </button>
            <div className="header-info">
              <h1>{company.name}</h1>
              <p className="header-subtitle">Company Details & Management</p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-success"
              onClick={handleInitializeDepartments}
              disabled={initializingDepartments}
            >
              {initializingDepartments ? (
                <>
                  <span className="loading"></span>
                  Initializing...
                </>
              ) : (
                'Add Departments'
              )}
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleEdit}
            >
              Edit Company
            </button>
            <button 
              className="btn btn-error"
              onClick={handleDelete}
            >
              Delete Company
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/company/${companyId}/employees`)}
            >
              Employees
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

        {/* Company Information Cards */}
        <div className="info-cards-grid">
          {/* Basic Info Card */}
          <div className="info-card">
            <div className="card-header">
              <h3>Basic Information</h3>
            </div>
            <div className="card-body">
              <div className="info-item">
                <span className="info-label">Company Name</span>
                <span className="info-value">{company.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Registration Number</span>
                <span className="info-value">{company.registration_number}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Tax Office</span>
                <span className="info-value">{company.tax_office}</span>
              </div>
            </div>
          </div>

          {/* Contact Info Card */}
          <div className="info-card">
            <div className="card-header">
              <h3>Contact Information</h3>
            </div>
            <div className="card-body">
              <div className="info-item">
                <span className="info-label">Address</span>
                <span className="info-value">{company.address}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Postcode</span>
                <span className="info-value">{company.postcode}</span>
              </div>
              {company.phone && (
                <div className="info-item">
                  <span className="info-label">Phone</span>
                  <span className="info-value">{company.phone}</span>
                </div>
              )}
              {company.email && (
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">{company.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="card mt-6">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="actions-grid">
              <button 
                className="action-card"
                onClick={() => navigate(`/company/${companyId}/departments`)}
              >
                <div className="action-icon">Departments</div>
                <h4>Manage Departments</h4>
                <p>Add, edit, and organize company departments</p>
                <span className="action-count">{departments.length} departments</span>
              </button>
              
              <button 
                className="action-card"
                onClick={() => navigate('/employees')}
              >
                <div className="action-icon">Employees</div>
                <h4>Manage Employees</h4>
                <p>Add and manage company employees</p>
                <span className="action-count">View employees</span>
              </button>
              
              <button 
                className="action-card"
                onClick={() => navigate('/payroll')}
              >
                <div className="action-icon">Payroll</div>
                <h4>Run Payroll</h4>
                <p>Process payroll and generate payslips</p>
                <span className="action-count">Process payroll</span>
              </button>
              
              <button 
                className="action-card"
                onClick={handleEdit}
              >
                <div className="action-icon">Edit</div>
                <h4>Edit Company</h4>
                <p>Update company information and details</p>
                <span className="action-count">Modify details</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Departments Preview */}
        {departments.length > 0 && (
          <div className="card mt-6">
            <div className="card-header">
              <h3>Recent Departments</h3>
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => navigate(`/company/${companyId}/departments`)}
              >
                View All
              </button>
            </div>
            <div className="card-body">
              <div className="departments-preview">
                {departments.slice(0, 3).map((dept) => (
                  <div key={dept.id} className="department-preview-item">
                    <div className="dept-info">
                      <h4>{dept.name}</h4>
                      <span className="dept-code">{dept.code}</span>
                    </div>
                  </div>
                ))}
                {departments.length > 3 && (
                  <div className="more-departments">
                    <span>+{departments.length - 3} more departments</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Company Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Company</h3>
              <button 
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Registration Number</label>
                  <input
                    type="text"
                    name="registration_number"
                    value={editFormData.registration_number}
                    onChange={handleEditInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Tax Office</label>
                  <input
                    type="text"
                    name="tax_office"
                    value={editFormData.tax_office}
                    onChange={handleEditInputChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Postcode</label>
                  <input
                    type="text"
                    name="postcode"
                    value={editFormData.postcode}
                    onChange={handleEditInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  name="address"
                  value={editFormData.address}
                  onChange={handleEditInputChange}
                  className="form-input"
                  rows="3"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone (Optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleEditInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email (Optional)</label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .company-details-page {
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

        .info-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: var(--spacing-6);
          margin-bottom: var(--spacing-6);
        }

        .info-card {
          background: var(--bg-primary);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
        }

        .info-card .card-header {
          background: var(--primary-color);
          color: white;
          padding: var(--spacing-4);
        }

        .info-card .card-header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .info-card .card-body {
          padding: var(--spacing-4);
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-3) 0;
          border-bottom: 1px solid var(--border-color-light);
        }

        .info-item:last-child {
          border-bottom: none;
        }

        .info-label {
          font-weight: 600;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .info-value {
          color: var(--text-primary);
          font-weight: 500;
          text-align: right;
          max-width: 60%;
          word-break: break-word;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-4);
        }

        .action-card {
          background: var(--bg-primary);
          border: 2px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-6);
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-3);
        }

        .action-card:hover {
          border-color: var(--primary-color);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .action-icon {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--primary-color);
          margin-bottom: var(--spacing-2);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .action-card h4 {
          margin: 0;
          color: var(--text-primary);
          font-size: 1.1rem;
          font-weight: 600;
        }

        .action-card p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .action-count {
          background: var(--primary-color);
          color: white;
          padding: var(--spacing-1) var(--spacing-2);
          border-radius: var(--border-radius);
          font-size: 0.75rem;
          font-weight: 600;
          margin-top: var(--spacing-2);
        }

        .departments-preview {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-3);
        }

        .department-preview-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-3);
          background: var(--bg-secondary);
          border-radius: var(--border-radius);
        }

        .dept-info h4 {
          margin: 0 0 var(--spacing-1) 0;
          color: var(--text-primary);
          font-size: 1rem;
        }

        .dept-code {
          background: var(--primary-color);
          color: white;
          padding: var(--spacing-1) var(--spacing-2);
          border-radius: var(--border-radius);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .more-departments {
          text-align: center;
          padding: var(--spacing-3);
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

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: var(--bg-primary);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow-xl);
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-6);
          border-bottom: 1px solid var(--border-color);
        }

        .modal-header h3 {
          margin: 0;
          color: var(--text-primary);
        }

        .modal-close {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 1.5rem;
          padding: 0;
        }

        .modal-body {
          padding: var(--spacing-6);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-4);
          margin-bottom: var(--spacing-4);
        }

        .form-group {
          margin-bottom: var(--spacing-4);
        }

        .form-label {
          display: block;
          margin-bottom: var(--spacing-2);
          color: var(--text-primary);
          font-weight: 600;
        }

        .form-input {
          width: 100%;
          padding: var(--spacing-3);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 1rem;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .modal-footer {
          display: flex;
          gap: var(--spacing-3);
          justify-content: flex-end;
          padding-top: var(--spacing-4);
          border-top: 1px solid var(--border-color);
        }

        .loading {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
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

          .info-cards-grid {
            grid-template-columns: 1fr;
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
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

export default CompanyDetails; 