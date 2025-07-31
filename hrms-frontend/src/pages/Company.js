import React, { useState, useEffect } from 'react';
import { companyAPI, apiUtils } from '../lib/api';
import { useNavigate } from 'react-router-dom'; // Added for navigation

const Company = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [initializingDepartments, setInitializingDepartments] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  // Removed viewMode state - always use list view

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    registration_number: '',
    tax_office: '',
    address: '',
    postcode: '',
    phone: '',
    email: '',
  });

  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await companyAPI.getCompanies();
      setCompanies(data);
      

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
      setError(null);
      setSuccess(null);
      
      if (editingCompany) {
        await companyAPI.updateCompany(editingCompany.id, formData);
        setSuccess('Company updated successfully!');
      } else {
        await companyAPI.createCompany(formData);
        setSuccess('Company created successfully!');
      }
      
      setShowModal(false);
      setEditingCompany(null);
      setFormData({
        name: '',
        registration_number: '',
        tax_office: '',
        address: '',
        postcode: '',
        phone: '',
        email: '',
      });
      loadCompanies();
    } catch (err) {
      setError(apiUtils.handleError(err).message);
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      registration_number: company.registration_number,
      tax_office: company.tax_office,
      address: company.address,
      postcode: company.postcode,
      phone: company.phone || '',
      email: company.email || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      try {
        setError(null);
        setSuccess(null);
        
        await companyAPI.deleteCompany(id);
        setSuccess('Company deleted successfully!');
        loadCompanies();
      } catch (err) {
        setError(apiUtils.handleError(err).message);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);
      previewCSV(file);
    }
  };

  const previewCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });
      setCsvPreview({ headers, data });
    };
    reader.readAsText(file);
  };

  const handleCSVUpload = async () => {
    if (!csvFile) return;
    
    try {
      setUploading(true);
      setError(null);
      setSuccess(null);
      
      const result = await companyAPI.uploadCompanyCSV(csvFile);
      setSuccess(`CSV uploaded successfully! Created: ${result.created}, Updated: ${result.updated}${result.errors ? ` Errors: ${result.errors}` : ''}`);
      setCsvFile(null);
      setCsvPreview(null);
      loadCompanies();
    } catch (err) {
      setError(apiUtils.handleError(err).message);
    } finally {
      setUploading(false);
    }
  };

  const handleInitializeDepartments = async (companyId) => {
    try {
      setInitializingDepartments(true);
      setError(null);
      setSuccess(null);
      
      await companyAPI.initializeDepartments(companyId);
      setSuccess('Departments added successfully!');
    } catch (err) {
      setError(apiUtils.handleError(err).message);
    } finally {
      setInitializingDepartments(false);
    }
  };



  // Filter and sort companies
  const filteredAndSortedCompanies = companies
    .filter(company => 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.address.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'registration':
          return a.registration_number.localeCompare(b.registration_number);
        case 'tax_office':
          return a.tax_office.localeCompare(b.tax_office);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  if (loading) {
    return (
      <div className="company-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="company-page">
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-info">
              <h1>Company Management</h1>
              <p className="header-subtitle">Manage your companies and departments</p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              Add Company
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

        {/* Success Alert */}
        {success && (
          <div className="alert alert-success">
            <span className="alert-icon">✓</span>
            <span className="alert-message">{success}</span>
            <button 
              className="alert-close"
              onClick={() => setSuccess(null)}
            >
              ×
            </button>
          </div>
        )}

        {/* CSV Upload Section */}
        <div className="card mb-6">
          <div className="card-header">
            <h3>📁 Upload Company Data (CSV)</h3>
            <p className="card-subtitle">Import multiple companies from a CSV file</p>
          </div>
          <div className="card-body">
            <div className="upload-section">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="file-input"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="file-label">
                <span className="file-icon">📁</span>
                <span className="file-text">
                  {csvFile ? csvFile.name : 'Choose CSV file'}
                </span>
              </label>
              
              {csvFile && (
                <button
                  className="btn btn-success mt-4"
                  onClick={handleCSVUpload}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <span className="loading"></span>
                      Uploading...
                    </>
                  ) : (
                    'Upload CSV'
                  )}
                </button>
              )}
            </div>

            {/* CSV Preview */}
            {csvPreview && (
              <div className="csv-preview mt-6">
                <h4>CSV Preview</h4>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        {csvPreview.headers.map((header, index) => (
                          <th key={index}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {csvPreview.headers.map((header, colIndex) => (
                            <td key={colIndex}>{row[header]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Companies List */}
        <div className="card">
          <div className="card-header">
            <div className="card-header-content">
              <div className="card-title-section">
                <h3>Companies ({companies.length})</h3>
                <p className="card-subtitle">Manage your company information and departments</p>
              </div>
              <div className="card-actions">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                <div className="sort-select">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select-input"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="registration">Sort by Registration</option>
                    <option value="tax_office">Sort by Tax Office</option>
                  </select>
                </div>
                {/* Removed view-controls */}
              </div>
            </div>
          </div>
          <div className="card-body">
            {companies.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">Companies</div>
                <h3>No companies found</h3>
                <p>Add your first company to get started</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowModal(true)}
                >
                  Add Company
                </button>
              </div>
            ) : (
              <div className="companies-container">
                {filteredAndSortedCompanies.map((company) => (
                  <div key={company.id} className="company-item">
                    <div className="company-main">
                      <div className="company-info">
                        <div className="company-header">
                          <h4 className="company-name">{company.name}</h4>
                          <div className="company-badge">
                            <span className="badge badge-primary">Active</span>
                          </div>
                        </div>
                        <div className="company-details">
                          <div className="detail-row">
                            <span className="detail-label">Registration:</span>
                            <span className="detail-value">{company.registration_number}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Tax Office:</span>
                            <span className="detail-value">{company.tax_office}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Address:</span>
                            <span className="detail-value">{company.address}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Postcode:</span>
                            <span className="detail-value">{company.postcode}</span>
                          </div>
                          {company.phone && (
                            <div className="detail-row">
                              <span className="detail-label">Phone:</span>
                              <span className="detail-value">{company.phone}</span>
                            </div>
                          )}
                          {company.email && (
                            <div className="detail-row">
                              <span className="detail-label">Email:</span>
                              <span className="detail-value">{company.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="company-actions">
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(company)}
                          title="Edit Company"
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-error"
                          onClick={() => handleDelete(company.id)}
                          title="Delete Company"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="company-footer">
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => navigate(`/company/${company.id}`)}
                      >
                        View Details
                      </button>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleInitializeDepartments(company.id)}
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Company Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCompany ? 'Edit Company' : 'Add Company'}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label className="form-label">Company Name</label>
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
                <label className="form-label">Registration Number</label>
                <input
                  type="text"
                  name="registration_number"
                  value={formData.registration_number}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tax Office</label>
                <input
                  type="text"
                  name="tax_office"
                  value={formData.tax_office}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="form-textarea"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Postcode</label>
                <input
                  type="text"
                  name="postcode"
                  value={formData.postcode}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
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
                  {editingCompany ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .company-page {
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

        .header-content h1 {
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

        .btn-large {
          padding: var(--spacing-3) var(--spacing-6);
          font-size: 1rem;
          font-weight: 600;
        }

        .btn-icon {
          margin-right: var(--spacing-2);
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

        .card-header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          width: 100%;
        }

        .card-title-section h3 {
          margin: 0 0 var(--spacing-2) 0;
          color: var(--text-primary);
        }

        .card-subtitle {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .card-actions {
          display: flex;
          gap: var(--spacing-4);
          align-items: center;
        }

        .search-box {
          position: relative;
          flex: 1;
          max-width: 300px;
        }

        .search-input {
          width: 100%;
          padding: var(--spacing-2) var(--spacing-3);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .sort-select {
          min-width: 150px;
        }

        .sort-select-input {
          width: 100%;
          padding: var(--spacing-2) var(--spacing-3);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .companies-container {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-4);
          margin-top: var(--spacing-6);
        }

        .company-item {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          padding: var(--spacing-4);
          transition: all var(--transition-fast);
          display: flex;
          flex-direction: column;
        }

        .company-item:hover {
          box-shadow: var(--shadow-md);
          border-color: var(--primary-color);
        }

        .company-main {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: var(--spacing-4);
          align-items: start;
        }

        .company-info {
          margin-bottom: 0;
        }

        .company-actions {
          margin-bottom: 0;
          flex-direction: column;
        }

        .company-footer {
          grid-column: 1 / -1;
        }

        .company-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-4);
        }

        .company-name {
          margin: 0;
          color: var(--text-primary);
          font-size: 1.25rem;
          font-weight: 600;
        }

        .company-badge {
          flex-shrink: 0;
        }

        .badge {
          padding: var(--spacing-1) var(--spacing-2);
          border-radius: var(--border-radius);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .badge-primary {
          background: var(--primary-color);
          color: white;
        }

        .company-details {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-2);
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-2) 0;
          border-bottom: 1px solid var(--border-color-light);
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-label {
          font-weight: 600;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .detail-value {
          color: var(--text-primary);
          font-weight: 500;
          text-align: right;
          max-width: 60%;
          word-break: break-word;
        }

        .company-actions {
          display: flex;
          gap: var(--spacing-2);
          margin-bottom: var(--spacing-4);
        }

        .company-footer {
          display: flex;
          gap: var(--spacing-3);
          padding: var(--spacing-4) var(--spacing-6);
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color-light);
        }

        .upload-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-4);
        }

        .file-input {
          display: none;
        }

        .file-label {
          display: flex;
          align-items: center;
          gap: var(--spacing-3);
          padding: var(--spacing-4) var(--spacing-6);
          border: 2px dashed var(--border-color);
          border-radius: var(--border-radius-lg);
          cursor: pointer;
          transition: all 0.2s ease;
          background: var(--bg-primary);
        }

        .file-label:hover {
          border-color: var(--primary-color);
          background: var(--bg-secondary);
        }

        .file-icon {
          font-size: 1.5rem;
        }

        .file-text {
          font-weight: 600;
          color: var(--text-primary);
        }

        .csv-preview {
          margin-top: var(--spacing-6);
        }

        .csv-preview h4 {
          margin-bottom: var(--spacing-4);
          color: var(--text-primary);
        }

        .table-container {
          overflow-x: auto;
          border-radius: var(--border-radius);
          border: 1px solid var(--border-color);
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

        .departments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: var(--spacing-4);
        }

        .department-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          padding: var(--spacing-4);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .department-header h4 {
          margin: 0 0 var(--spacing-1) 0;
          color: var(--text-primary);
        }

        .department-code {
          background: var(--primary-color);
          color: white;
          padding: var(--spacing-1) var(--spacing-2);
          border-radius: var(--border-radius);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .department-actions {
          display: flex;
          gap: var(--spacing-2);
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
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .alert-error .alert-icon {
          background: var(--error-color);
          color: white;
        }

        .alert-success .alert-icon {
          background: var(--success-color);
          color: white;
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

        .form-input,
        .form-textarea {
          width: 100%;
          padding: var(--spacing-3);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 1rem;
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
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

        .company-details-table {
          margin-bottom: var(--spacing-6);
        }

        .details-table {
          width: 100%;
          border-collapse: collapse;
          background: var(--bg-primary);
          border-radius: var(--border-radius);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }

        .details-table .detail-row {
          display: table-row;
        }

        .details-table .detail-row:nth-child(even) {
          background: var(--bg-secondary);
        }

        .details-table .detail-row:hover {
          background: var(--bg-secondary);
        }

        .details-table .detail-label {
          font-weight: 600;
          color: var(--text-secondary);
          font-size: 0.9rem;
          min-width: 200px;
          padding: var(--spacing-4);
          border-right: 1px solid var(--border-color-light);
          background: var(--bg-secondary);
        }

        .details-table .detail-value {
          color: var(--text-primary);
          font-size: 0.9rem;
          padding: var(--spacing-4);
          word-break: break-word;
        }

        .company-actions-section {
          margin-top: var(--spacing-6);
          padding-top: var(--spacing-4);
          border-top: 1px solid var(--border-color-light);
        }

        .company-actions-section h4 {
          margin: 0 0 var(--spacing-4) 0;
          color: var(--text-primary);
          font-size: 1.1rem;
        }

        .action-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-3);
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            gap: var(--spacing-4);
            align-items: stretch;
          }

          .card-header-content {
            flex-direction: column;
            gap: var(--spacing-4);
          }

          .card-controls {
            flex-direction: column;
            gap: var(--spacing-3);
          }

          .search-input {
            min-width: auto;
            width: 100%;
          }

          .companies-grid {
            grid-template-columns: 1fr;
          }

          .company-main {
            flex-direction: column;
            gap: var(--spacing-4);
          }

          .company-actions {
            margin-left: 0;
            flex-direction: row;
          }

          .company-footer {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Company; 