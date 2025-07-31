import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { companyAPI } from '../lib/api';

const AddCompany = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'csv'
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    registration_number: '',
    tax_office: '',
    address: '',
    postcode: '',
    phone: '',
    email: '',
    website: '',
    industry: '',
    employee_count: '',
    annual_revenue: '',
    status: 'active'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
      await companyAPI.uploadCompanyCSV(csvFile);
      alert('Companies uploaded successfully!');
      navigate('/company');
    } catch (error) {
      console.error('Error uploading companies:', error);
      alert('Error uploading companies. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.registration_number) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      await companyAPI.createCompany(formData);
      alert('Company created successfully!');
      navigate('/company');
    } catch (error) {
      console.error('Error creating company:', error);
      alert('Error creating company. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add-company-page">
      <div className="add-company-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-title">
              <div className="title-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </div>
              <div className="title-text">
                <h1>Add Company</h1>
                <p>Create a new company or upload multiple companies via CSV</p>
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

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Manual Entry
          </button>
          <button 
            className={`tab-btn ${activeTab === 'csv' ? 'active' : ''}`}
            onClick={() => setActiveTab('csv')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            CSV Upload
          </button>
        </div>

        {/* Content */}
        <div className="content-area">
          {activeTab === 'manual' ? (
            /* Manual Entry Form */
            <div className="manual-form-section">
              <div className="form-card">
                <div className="form-header">
                  <h2>Company Information</h2>
                  <p>Fill in the details to create a new company</p>
                </div>
                
                <form onSubmit={handleManualSubmit} className="company-form">
                  <div className="form-grid">
                    {/* Basic Information */}
                    <div className="form-section">
                      <h3>Basic Information</h3>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Company Name *</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            required
                            placeholder="Enter company name"
                          />
                        </div>
                        <div className="form-group">
                          <label>Registration Number *</label>
                          <input
                            type="text"
                            value={formData.registration_number}
                            onChange={(e) => handleInputChange('registration_number', e.target.value)}
                            required
                            placeholder="Enter registration number"
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Tax Office</label>
                          <input
                            type="text"
                            value={formData.tax_office}
                            onChange={(e) => handleInputChange('tax_office', e.target.value)}
                            placeholder="Enter tax office"
                          />
                        </div>
                        <div className="form-group">
                          <label>Industry</label>
                          <input
                            type="text"
                            value={formData.industry}
                            onChange={(e) => handleInputChange('industry', e.target.value)}
                            placeholder="Enter industry"
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Employee Count</label>
                          <input
                            type="number"
                            value={formData.employee_count}
                            onChange={(e) => handleInputChange('employee_count', e.target.value)}
                            placeholder="Enter employee count"
                          />
                        </div>
                        <div className="form-group">
                          <label>Annual Revenue (£)</label>
                          <input
                            type="number"
                            value={formData.annual_revenue}
                            onChange={(e) => handleInputChange('annual_revenue', e.target.value)}
                            placeholder="Enter annual revenue"
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Status</label>
                          <select
                            value={formData.status}
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

                    {/* Contact Information */}
                    <div className="form-section">
                      <h3>Contact Information</h3>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Email</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="Enter email address"
                          />
                        </div>
                        <div className="form-group">
                          <label>Phone</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Website</label>
                          <input
                            type="url"
                            value={formData.website}
                            onChange={(e) => handleInputChange('website', e.target.value)}
                            placeholder="Enter website URL"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="form-section">
                      <h3>Address Information</h3>
                      <div className="form-row">
                        <div className="form-group full-width">
                          <label>Address</label>
                          <textarea
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            rows="3"
                            placeholder="Enter company address"
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Postcode</label>
                          <input
                            type="text"
                            value={formData.postcode}
                            onChange={(e) => handleInputChange('postcode', e.target.value)}
                            placeholder="Enter postcode"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button 
                      type="submit" 
                      className="submit-btn"
                      disabled={saving}
                    >
                      {saving ? 'Creating Company...' : 'Create Company'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* CSV Upload Section */
            <div className="csv-upload-section">
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
                    id="company-csv"
                  />
                  <label htmlFor="company-csv" className="file-label">
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

                <div className="csv-info">
                  <h3>CSV Format Requirements</h3>
                  <div className="csv-format">
                    <p>Your CSV file should include the following columns:</p>
                    <ul>
                      <li><strong>name</strong> - Company name (required)</li>
                      <li><strong>registration_number</strong> - Registration number (required)</li>
                      <li><strong>tax_office</strong> - Tax office</li>
                      <li><strong>address</strong> - Company address</li>
                      <li><strong>postcode</strong> - Postal code</li>
                      <li><strong>phone</strong> - Phone number</li>
                      <li><strong>email</strong> - Email address</li>
                      <li><strong>website</strong> - Website URL</li>
                      <li><strong>industry</strong> - Industry type</li>
                      <li><strong>employee_count</strong> - Number of employees</li>
                      <li><strong>annual_revenue</strong> - Annual revenue</li>
                      <li><strong>status</strong> - Company status</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .add-company-page {
          min-height: 100vh;
          background: var(--background-color);
          padding: var(--spacing-8) 0;
        }

        .add-company-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--spacing-4);
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-8);
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: var(--spacing-4);
        }

        .title-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
          border-radius: var(--radius-xl);
          color: white;
        }

        .title-text h1 {
          font-size: var(--font-size-3xl);
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--spacing-1);
        }

        .title-text p {
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

        .tab-navigation {
          display: flex;
          gap: var(--spacing-2);
          margin-bottom: var(--spacing-6);
          background: white;
          padding: var(--spacing-2);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
          padding: var(--spacing-3) var(--spacing-4);
          background: none;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          font-weight: 500;
          transition: all var(--transition-fast);
          color: var(--text-secondary);
        }

        .tab-btn:hover {
          background: var(--surface-color);
        }

        .tab-btn.active {
          background: var(--primary-color);
          color: white;
        }

        .content-area {
          background: white;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
        }

        .form-card {
          padding: var(--spacing-6);
        }

        .form-header {
          margin-bottom: var(--spacing-6);
        }

        .form-header h2 {
          font-size: var(--font-size-xl);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-2);
        }

        .form-header p {
          color: var(--text-secondary);
        }

        .company-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-8);
        }

        .form-grid {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-6);
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

        .submit-btn {
          padding: var(--spacing-3) var(--spacing-6);
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: var(--radius-lg);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .submit-btn:hover:not(:disabled) {
          background: var(--primary-dark);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .upload-card {
          padding: var(--spacing-6);
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
          margin-bottom: var(--spacing-6);
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

        .csv-info {
          border-top: 1px solid var(--border-color);
          padding-top: var(--spacing-6);
        }

        .csv-info h3 {
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-3);
        }

        .csv-format p {
          color: var(--text-secondary);
          margin-bottom: var(--spacing-3);
        }

        .csv-format ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .csv-format li {
          padding: var(--spacing-1) 0;
          color: var(--text-secondary);
          font-size: var(--font-size-sm);
        }

        .csv-format strong {
          color: var(--text-primary);
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            gap: var(--spacing-4);
            align-items: flex-start;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .tab-navigation {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default AddCompany; 