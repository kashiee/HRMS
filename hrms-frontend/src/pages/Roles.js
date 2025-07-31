import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { companyAPI } from '../lib/api';

const Roles = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedEmployerCompany, setSelectedEmployerCompany] = useState(null);
  const [selectedEmployeeCompany, setSelectedEmployeeCompany] = useState(null);
  const [showEmployerDropdown, setShowEmployerDropdown] = useState(false);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [employerSearchTerm, setEmployerSearchTerm] = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const response = await companyAPI.getCompanies();
      const companiesList = Array.isArray(response) ? response : (response.companies || []);
      setCompanies(companiesList);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployerCompanySelect = (company) => {
    setSelectedEmployerCompany(company);
    setShowEmployerDropdown(false);
    setEmployerSearchTerm('');
    localStorage.setItem('selectedEmployerCompany', JSON.stringify(company));
  };

  const handleEmployeeCompanySelect = (company) => {
    setSelectedEmployeeCompany(company);
    setShowEmployeeDropdown(false);
    setEmployeeSearchTerm('');
    localStorage.setItem('selectedEmployeeCompany', JSON.stringify(company));
  };

  const handleEmployerAccess = () => {
    if (selectedEmployerCompany) {
      navigate(`/employer/${selectedEmployerCompany.id}`);
    }
  };

  const handleEmployeeAccess = () => {
    if (selectedEmployeeCompany) {
      navigate(`/employee/dashboard/${selectedEmployeeCompany.id}`);
    } else {
      alert('Please select a company first');
    }
  };

  const handleAddCompany = () => {
    navigate('/add-company');
  };

  const filteredEmployerCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(employerSearchTerm.toLowerCase()) ||
    company.registration_number?.toLowerCase().includes(employerSearchTerm.toLowerCase())
  );

  const filteredEmployeeCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    company.registration_number?.toLowerCase().includes(employeeSearchTerm.toLowerCase())
  );

  return (
    <div className="roles-page">
      <div className="roles-container">
        {/* Header */}
        <div className="roles-header">
          <div className="header-content">
            <h1>Select Your Role</h1>
            <p>Choose how you want to use the HRMS system</p>
          </div>
          <div className="header-actions">
            <Link to="/" className="back-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Home
            </Link>
          </div>
        </div>

        {/* Role Cards */}
        <div className="role-cards">
          {/* Bureau Role */}
          <div className="role-card">
            <div className="role-header">
              <div className="role-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21h18M3 7h18M3 3h18M9 21v-4m0-4V9"/>
                </svg>
              </div>
              <h2>Bureau</h2>
            </div>
            <div className="role-info">
              <p>Manage multiple companies and upload bulk data</p>
            </div>
            <div className="role-features">
              <ul>
                <li>Upload company CSV files</li>
                <li>Manage multiple organizations</li>
                <li>Bulk data processing</li>
                <li>Company overview and statistics</li>
              </ul>
            </div>
            <div className="role-actions">
              <Link to="/bureau" className="role-btn primary">
                Get Started
              </Link>
            </div>
          </div>

          {/* Employer Role */}
          <div className="role-card">
            <div className="role-header">
              <div className="role-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h2>Employer</h2>
            </div>
            <div className="role-info">
              <p>Manage your company's employees and payroll</p>
            </div>
            <div className="role-features">
              <ul>
                <li>Employee management</li>
                <li>Payroll processing</li>
                <li>Document management</li>
                <li>HR compliance</li>
              </ul>
            </div>
            <div className="role-actions">
              <div className="company-selector">
                <div className="dropdown-container">
                  <button 
                    className="dropdown-trigger"
                    onClick={() => setShowEmployerDropdown(!showEmployerDropdown)}
                  >
                    <div className="trigger-content">
                      {selectedEmployerCompany ? (
                        <>
                          <div className="selected-company">
                            <div className="company-icon-small">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 21h18M3 7h18M3 3h18M9 21v-4m0-4V9"/>
                              </svg>
                            </div>
                            <span>{selectedEmployerCompany.name}</span>
                          </div>
                          <span className="selected-status">Selected</span>
                        </>
                      ) : (
                        <>
                          <span>Select Your Company</span>
                          <span className="dropdown-arrow">▼</span>
                        </>
                      )}
                    </div>
                  </button>
                  
                  {showEmployerDropdown && (
                    <div className="dropdown-menu">
                      <div className="search-container">
                        <div className="search-input-wrapper">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                          </svg>
                          <input
                            type="text"
                            placeholder="Search companies..."
                            value={employerSearchTerm}
                            onChange={(e) => setEmployerSearchTerm(e.target.value)}
                            className="search-input"
                            autoFocus
                          />
                        </div>
                      </div>
                      
                      <div className="dropdown-options">
                        {loading ? (
                          <div className="loading-option">
                            <div className="loading-spinner-small"></div>
                            <span>Loading companies...</span>
                          </div>
                        ) : filteredEmployerCompanies.length > 0 ? (
                          filteredEmployerCompanies.map((company) => (
                            <button
                              key={company.id}
                              className={`dropdown-option ${selectedEmployerCompany?.id === company.id ? 'selected' : ''}`}
                              onClick={() => handleEmployerCompanySelect(company)}
                            >
                              <div className="option-content">
                                <div className="company-icon-small">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 21h18M3 7h18M3 3h18M9 21v-4m0-4V9"/>
                                  </svg>
                                </div>
                                <div className="company-details">
                                  <div className="company-name">{company.name}</div>
                                  <div className="company-registration">{company.registration_number}</div>
                                </div>
                              </div>
                              {selectedEmployerCompany?.id === company.id && (
                                <div className="selected-check">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20,6 9,17 4,12"/>
                                  </svg>
                                </div>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="no-results">
                            <span>No companies found</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {selectedEmployerCompany && (
                  <button 
                    className="role-btn primary"
                    onClick={handleEmployerAccess}
                  >
                    Access Company
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Employee Role */}
          <div className="role-card">
            <div className="role-header">
              <div className="role-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h2>Employee</h2>
            </div>
            <div className="role-info">
              <p>View your personal information and payslips</p>
            </div>
            <div className="role-features">
              <ul>
                <li>View personal details</li>
                <li>Access payslips</li>
                <li>Update information</li>
                <li>Download documents</li>
              </ul>
            </div>
            <div className="role-actions">
              <div className="company-selector">
                <div className="dropdown-container">
                  <button 
                    className="dropdown-trigger"
                    onClick={() => setShowEmployeeDropdown(!showEmployeeDropdown)}
                  >
                    <div className="trigger-content">
                      {selectedEmployeeCompany ? (
                        <>
                          <div className="selected-company">
                            <div className="company-icon-small">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 21h18M3 7h18M3 3h18M9 21v-4m0-4V9"/>
                              </svg>
                            </div>
                            <span>{selectedEmployeeCompany.name}</span>
                          </div>
                          <span className="selected-status">Selected</span>
                        </>
                      ) : (
                        <>
                          <span>Select Your Company</span>
                          <span className="dropdown-arrow">▼</span>
                        </>
                      )}
                    </div>
                  </button>
                  
                  {showEmployeeDropdown && (
                    <div className="dropdown-menu">
                      <div className="search-container">
                        <div className="search-input-wrapper">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                          </svg>
                          <input
                            type="text"
                            placeholder="Search companies..."
                            value={employeeSearchTerm}
                            onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                            className="search-input"
                            autoFocus
                          />
                        </div>
                      </div>
                      
                      <div className="dropdown-options">
                        {loading ? (
                          <div className="loading-option">
                            <div className="loading-spinner-small"></div>
                            <span>Loading companies...</span>
                          </div>
                        ) : filteredEmployeeCompanies.length > 0 ? (
                          filteredEmployeeCompanies.map((company) => (
                            <button
                              key={company.id}
                              className={`dropdown-option ${selectedEmployeeCompany?.id === company.id ? 'selected' : ''}`}
                              onClick={() => handleEmployeeCompanySelect(company)}
                            >
                              <div className="option-content">
                                <div className="company-icon-small">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 21h18M3 7h18M3 3h18M9 21v-4m0-4V9"/>
                                  </svg>
                                </div>
                                <div className="company-details">
                                  <div className="company-name">{company.name}</div>
                                  <div className="company-registration">{company.registration_number}</div>
                                </div>
                              </div>
                              {selectedEmployeeCompany?.id === company.id && (
                                <div className="selected-check">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20,6 9,17 4,12"/>
                                  </svg>
                                </div>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="no-results">
                            <span>No companies found</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {selectedEmployeeCompany && (
                  <button 
                    className="role-btn primary"
                    onClick={handleEmployeeAccess}
                  >
                    Access Company
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Add Company Dashboard */}
          <div className="role-card dashboard-card">
            <div className="role-header">
              <div className="role-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </div>
              <h2>Company Dashboard</h2>
            </div>
            <div className="role-info">
              <p>Manage individual companies and add new ones</p>
            </div>
            <div className="role-features">
              <ul>
                <li>Add new companies manually</li>
                <li>Upload companies via CSV</li>
                <li>Edit company details</li>
                <li>Manage company settings</li>
              </ul>
            </div>
            <div className="role-actions">
              <button 
                className="role-btn primary"
                onClick={handleAddCompany}
              >
                Add Company
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .roles-page {
          min-height: 100vh;
          background: var(--background-color);
          padding: var(--spacing-8) 0;
        }

        .roles-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--spacing-4);
        }

        .roles-header {
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

        .role-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: var(--spacing-6);
        }

        .role-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: var(--spacing-6);
          transition: all var(--transition-fast);
        }

        .role-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        .dashboard-card {
          border: 2px solid var(--primary-color);
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .role-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-4);
          margin-bottom: var(--spacing-4);
        }

        .role-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
          border-radius: var(--radius-lg);
          color: white;
        }

        .role-header h2 {
          font-size: var(--font-size-xl);
          font-weight: 600;
          color: var(--text-primary);
        }

        .role-info {
          margin-bottom: var(--spacing-4);
        }

        .role-info p {
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .role-features {
          margin-bottom: var(--spacing-6);
        }

        .role-features ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .role-features li {
          padding: var(--spacing-1) 0;
          color: var(--text-secondary);
          position: relative;
          padding-left: var(--spacing-4);
        }

        .role-features li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: var(--primary-color);
          font-weight: bold;
        }

        .role-actions {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-3);
        }

        .company-selector {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-3);
        }

        .dropdown-container {
          position: relative;
        }

        .dropdown-trigger {
          width: 100%;
          padding: var(--spacing-3) var(--spacing-4);
          background: var(--surface-color);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
        }

        .dropdown-trigger:hover {
          background: var(--background-color);
        }

        .trigger-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .selected-company {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
        }

        .company-icon-small {
          color: var(--primary-color);
        }

        .selected-status {
          font-size: var(--font-size-sm);
          color: var(--primary-color);
          font-weight: 500;
        }

        .dropdown-arrow {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          z-index: 1000;
          max-height: 300px;
          overflow: hidden;
        }

        .search-container {
          padding: var(--spacing-3);
          border-bottom: 1px solid var(--border-color);
        }

        .search-input-wrapper {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
          padding: var(--spacing-2) var(--spacing-3);
          background: var(--background-color);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }

        .search-input {
          border: none;
          background: none;
          outline: none;
          font-size: var(--font-size-sm);
          width: 100%;
        }

        .dropdown-options {
          max-height: 200px;
          overflow-y: auto;
        }

        .dropdown-option {
          width: 100%;
          padding: var(--spacing-3) var(--spacing-4);
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: all var(--transition-fast);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .dropdown-option:hover {
          background: var(--surface-color);
        }

        .dropdown-option.selected {
          background: var(--primary-color);
          color: white;
        }

        .option-content {
          display: flex;
          align-items: center;
          gap: var(--spacing-3);
        }

        .company-details {
          display: flex;
          flex-direction: column;
        }

        .company-name {
          font-weight: 500;
          color: inherit;
        }

        .company-registration {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }

        .dropdown-option.selected .company-registration {
          color: rgba(255, 255, 255, 0.8);
        }

        .selected-check {
          color: white;
        }

        .loading-option {
          padding: var(--spacing-3) var(--spacing-4);
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
          color: var(--text-secondary);
        }

        .loading-spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid var(--border-color);
          border-top: 2px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .no-results {
          padding: var(--spacing-3) var(--spacing-4);
          color: var(--text-secondary);
          text-align: center;
        }

        .role-btn {
          padding: var(--spacing-3) var(--spacing-6);
          border-radius: var(--radius-lg);
          text-decoration: none;
          font-weight: 600;
          text-align: center;
          transition: all var(--transition-fast);
          border: none;
          cursor: pointer;
        }

        .role-btn.primary {
          background: var(--primary-color);
          color: white;
        }

        .role-btn.primary:hover {
          background: var(--primary-dark);
        }

        .role-btn.secondary {
          background: var(--surface-color);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .role-btn.secondary:hover {
          background: var(--background-color);
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .roles-header {
            flex-direction: column;
            gap: var(--spacing-4);
            align-items: flex-start;
          }

          .role-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Roles; 