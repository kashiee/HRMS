import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { companyAPI, apiUtils } from '../lib/api';

const CompanyDepartments = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [initializingDepartments, setInitializingDepartments] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDepartment) {
        await companyAPI.updateDepartment(editingDepartment.id, formData);
      } else {
        await companyAPI.createDepartment(companyId, formData);
      }
      setShowModal(false);
      setEditingDepartment(null);
      setFormData({
        name: '',
        code: '',
      });
      loadCompanyAndDepartments();
    } catch (err) {
      setError(apiUtils.handleError(err).message);
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      code: department.code,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await companyAPI.deleteDepartment(id);
        loadCompanyAndDepartments();
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
      <div className="company-departments-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading departments...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="company-departments-page">
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
    <div className="company-departments-page">
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
              <h1>👥 {company.name} - Departments</h1>
              <p className="header-subtitle">Manage departments for {company.name}</p>
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
                '➕ Add Sample Departments'
              )}
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              <span className="btn-icon">+</span>
              Add Department
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span className="alert-message">{error}</span>
            <button 
              className="alert-close"
              onClick={() => setError(null)}
            >
              ×
            </button>
          </div>
        )}

        {/* Company Info Card */}
        <div className="card mb-6">
          <div className="card-header">
            <h3>🏢 Company Information</h3>
          </div>
          <div className="card-body">
            <div className="company-info-grid">
              <div className="info-item">
                <span className="info-label">Company Name:</span>
                <span className="info-value">{company.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Registration:</span>
                <span className="info-value">{company.registration_number}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Tax Office:</span>
                <span className="info-value">{company.tax_office}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Address:</span>
                <span className="info-value">{company.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Departments List */}
        <div className="card">
          <div className="card-header">
            <h3>📋 Departments ({departments.length})</h3>
          </div>
          <div className="card-body">
            {departments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>No departments found</h3>
                <p>Add departments to organize your company structure</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowModal(true)}
                >
                  Add Department
                </button>
              </div>
            ) : (
              <div className="departments-table">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Department Name</th>
                      <th>Code</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((dept) => (
                      <tr key={dept.id}>
                        <td>{dept.name}</td>
                        <td>
                          <span className="department-code">{dept.code}</span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn btn-sm btn-secondary"
                              onClick={() => handleEdit(dept)}
                            >
                              ✏️ Edit
                            </button>
                            <button 
                              className="btn btn-sm btn-error"
                              onClick={() => handleDelete(dept.id)}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Department Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingDepartment ? 'Edit Department' : 'Add Department'}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label className="form-label">Department Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Department Code</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingDepartment ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .company-departments-page {
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
          font-size: 2rem;
          font-weight: 700;
        }

        .header-subtitle {
          margin: 0;
          color: var(--text-secondary);
          font-size: 1rem;
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

        .company-info-grid {
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

        .departments-table {
          overflow-x: auto;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
          background: var(--bg-primary);
        }

        .table th,
        .table td {
          padding: var(--spacing-3);
          text-align: left;
          border-bottom: 1px solid var(--border-color-light);
        }

        .table th {
          background: var(--bg-secondary);
          font-weight: 600;
          color: var(--text-primary);
        }

        .table tbody tr:hover {
          background: var(--bg-secondary);
        }

        .department-code {
          background: var(--primary-color);
          color: white;
          padding: var(--spacing-1) var(--spacing-2);
          border-radius: var(--border-radius);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .action-buttons {
          display: flex;
          gap: var(--spacing-2);
        }

        .empty-state {
          text-align: center;
          padding: var(--spacing-12);
          color: var(--text-secondary);
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: var(--spacing-4);
        }

        .empty-state h3 {
          margin: 0 0 var(--spacing-2) 0;
          color: var(--text-primary);
        }

        .empty-state p {
          margin: 0 0 var(--spacing-6) 0;
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
          max-width: 500px;
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

          .company-info-grid {
            grid-template-columns: 1fr;
          }

          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default CompanyDepartments; 