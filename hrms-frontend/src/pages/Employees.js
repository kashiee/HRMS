import React, { useState, useEffect } from 'react';
import { employeeAPI, apiUtils } from '../lib/api';
import { useNavigate, useParams } from 'react-router-dom';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const itemsPerPage = 50;
  const navigate = useNavigate();
  const { companyId } = useParams();

  useEffect(() => {
    loadEmployees();
  }, [companyId]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      let data;
      if (companyId) {
        data = await employeeAPI.getEmployees({ companyId });
      } else {
        data = await employeeAPI.getEmployees();
      }
      setEmployees(data.employees || data);
    } catch (err) {
      setError(apiUtils.handleError(err).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reference) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeAPI.deleteEmployee(reference);
        loadEmployees();
      } catch (err) {
        setError(apiUtils.handleError(err).message);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setCsvFile(file);
      previewCSV(file);
      setError(null); // Clear any previous errors
    } else {
      setError('Please select a valid CSV file');
      setCsvFile(null);
      setCsvPreview(null);
    }
  };

  const previewCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim()); // Remove empty lines
      const headers = lines[0].split(',');
      const data = lines.slice(1, 20).map(line => { // Show up to 20 rows in preview
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header.trim()] = values[index]?.trim() || '';
          return obj;
        }, {});
      });
      setCsvPreview({ headers, data, totalRows: lines.length - 1 }); // Include total row count
      
      // Debug: Log the headers to console
      console.log('CSV Headers:', headers);
      console.log('First row data:', data[0]);
    };
    reader.readAsText(file);
  };

  const handleCSVUpload = async () => {
    if (!csvFile) {
      setError('Please select a CSV file first');
      return;
    }
    
    try {
      console.log('Starting employee CSV upload...', csvFile.name, csvFile.size);
      setUploading(true);
      setError(null);
      
      const result = await employeeAPI.uploadEmployeeCSV(csvFile);
      console.log('Employee CSV upload result:', result);
      
      setCsvFile(null);
      setCsvPreview(null);
      
      // Show success message with more details
      const message = `CSV uploaded successfully!\nCreated: ${result.employees_created}\nUpdated: ${result.employees_updated}\nInitial DB count: ${result.initial_count}\nFinal DB count: ${result.final_count}`;
      if (result.errors && result.errors.length > 0) {
        alert(`${message}\n\nErrors: ${result.errors.join(', ')}`);
      } else {
        alert(message);
      }
      
      // Reload employees after successful upload
      await loadEmployees();
    } catch (err) {
      console.error('Employee CSV upload error:', err);
      const errorMessage = apiUtils.handleError(err).message;
      setError(`Upload failed: ${errorMessage}`);
      alert(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  // Filter and pagination
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.ni_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || employee.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = showAll ? filteredEmployees : filteredEmployees.slice(startIndex, startIndex + itemsPerPage);

  const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading"></div>
        <p>Loading employee data...</p>
      </div>
    );
  }

  return (
    <div className="employees-page">
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <h1>Employee Management</h1>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error">
            {error}
            <button 
              className="alert-close"
              onClick={() => setError(null)}
            >
              ×
            </button>
          </div>
        )}

        {/* CSV Upload Section */}
        <div className="card mb-6">
          <div className="card-header">
            <h3>📁 Upload Employee Data (CSV)</h3>
          </div>
          <div className="card-body">
            <div className="upload-section">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="file-input"
                id="employee-csv-upload"
              />
              <label htmlFor="employee-csv-upload" className="file-label">
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
                <h4>CSV Preview ({csvPreview.totalRows} total rows)</h4>
                <p className="text-sm text-muted mb-3">Showing first {csvPreview.data.length} rows of {csvPreview.totalRows} total rows</p>
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

        {/* Filters */}
        <div className="filters-section mb-6">
          <div className="filters-grid">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="department-filter">
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="form-select"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Employees Table */}
        <div className="card">
          <div className="card-header">
            <h3>👥 Employees ({filteredEmployees.length})</h3>
          </div>
          <div className="card-body">
            {filteredEmployees.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>No employees found</h3>
                <p>Upload a CSV file to add employees to the system</p>
                <div className="upload-section">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="file-input"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload" className="btn btn-primary">
                    Upload CSV File
                  </label>
                </div>
              </div>
            ) : (
              <>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>Name</th>
                        <th>Department</th>
                        <th>NI Number</th>
                        <th>Tax Code</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedEmployees.map((employee) => (
                        <tr key={employee.reference}>
                          <td>{employee.reference}</td>
                          <td>{employee.name}</td>
                          <td>{employee.department}</td>
                          <td>{employee.ni_number}</td>
                          <td>{employee.tax_code}</td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="btn btn-sm btn-info"
                                onClick={() => navigate(`/employee/${employee.reference}`)}
                              >
                                View Details
                              </button>
                              <button 
                                className="btn btn-sm btn-secondary"
                                onClick={() => navigate(`/employee/${employee.reference}/edit`)}
                              >
                                Edit
                              </button>
                              <button 
                                className="btn btn-sm btn-error"
                                onClick={() => handleDelete(employee.reference)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="pagination">
                  <div className="pagination-controls">
                    <button
                      className={`btn btn-sm ${showAll ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setShowAll(!showAll)}
                    >
                      {showAll ? 'Show Paginated' : 'Show All'}
                    </button>
                  </div>
                  
                  {!showAll && totalPages > 1 && (
                    <>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      <span className="pagination-info">
                        Page {currentPage} of {totalPages} ({filteredEmployees.length} total employees)
                      </span>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </>
                  )}
                  
                  {showAll && (
                    <span className="pagination-info">
                      Showing all {filteredEmployees.length} employees
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .employees-page {
          padding: var(--spacing-8);
        }

        .page-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-8);
        }

        .page-header h1 {
          margin: 0;
          color: var(--text-primary);
        }

        .filters-section {
          background: var(--surface-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-6);
          border: 1px solid var(--border-color);
        }

        .filters-grid {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: var(--spacing-4);
          align-items: end;
        }

        .table-actions {
          display: flex;
          gap: var(--spacing-2);
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: var(--spacing-4);
          margin-top: var(--spacing-6);
          padding-top: var(--spacing-6);
          border-top: 1px solid var(--border-color);
        }

        .pagination-info {
          color: var(--text-secondary);
          font-size: var(--font-size-sm);
        }

        .large-modal {
          max-width: 800px;
        }

        .form-sections {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-8);
        }

        .form-section h4 {
          margin-bottom: var(--spacing-4);
          color: var(--text-primary);
          font-size: var(--font-size-lg);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-4);
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .employees-page {
            padding: var(--spacing-4);
          }

          .page-header {
            flex-direction: column;
            gap: var(--spacing-4);
            align-items: stretch;
          }

          .filters-grid {
            grid-template-columns: 1fr;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .table-actions {
            flex-direction: column;
          }

          .large-modal {
            margin: var(--spacing-4);
          }
        }
      `}</style>
    </div>
  );
};

export default Employees; 