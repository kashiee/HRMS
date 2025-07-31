import React, { useState, useEffect } from 'react';
import { payrollAPI, nlpAPI, employeeAPI, apiUtils } from '../lib/api';

const Payroll = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [nlpCommand, setNlpCommand] = useState('');
  const [nlpResult, setNlpResult] = useState(null);
  const [downloadingPayslip, setDownloadingPayslip] = useState(null);
  const [showAllPayslips, setShowAllPayslips] = useState(false);
  const [totalPayslips, setTotalPayslips] = useState(0);
  const [availableEmployees, setAvailableEmployees] = useState(0);

  useEffect(() => {
    loadPayslips();
    loadAvailableEmployees();
  }, []);

  const loadPayslips = async () => {
    try {
      setLoading(true);
      const data = await payrollAPI.getPayslips();
      // Handle different response formats
      const payslipsData = Array.isArray(data) ? data : (data.payslips || data.employees || []);
      setPayslips(payslipsData);
      setTotalPayslips(payslipsData.length);
    } catch (err) {
      setError(apiUtils.handleError(err).message);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableEmployees = async () => {
    try {
      const data = await employeeAPI.getEmployees();
      setAvailableEmployees(data.total || 0);
    } catch (err) {
      console.log('Failed to load available employees:', err);
    }
  };

  const handleRunPayroll = async () => {
    if (!selectedMonth || !selectedYear) {
      setError('Please select both month and year');
      return;
    }

    try {
      setProcessing(true);
      
      // Payroll now works directly with EmployeeRecord data (CSV uploads)
      console.log('Processing payroll directly from employee records...');
      
      // Calculate pay period dates
      const year = parseInt(selectedYear);
      const month = parseInt(selectedMonth);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      const payDate = new Date(year, month, 25); // Pay on 25th of month
      
      const payrollData = {
        company_id: 1, // Default company for PoC
        pay_period_start: startDate.toISOString().split('T')[0], // YYYY-MM-DD
        pay_period_end: endDate.toISOString().split('T')[0], // YYYY-MM-DD
        pay_date: payDate.toISOString().split('T')[0], // YYYY-MM-DD
      };

      const result = await payrollAPI.runBatchPayroll(payrollData);
      setError(null);
      loadPayslips();
      
      // Show success message
      const message = result?.message || result?.detail || 'Generated payslips for all employees.';
      alert(`Payroll processed successfully! ${message}`);
    } catch (err) {
      setError(apiUtils.handleError(err).message);
    } finally {
      setProcessing(false);
    }
  };

  const handleNLPCommand = async () => {
    if (!nlpCommand.trim()) return;

    try {
      setProcessing(true);
      const result = await nlpAPI.processCommand(nlpCommand);
      setNlpResult(result);
      setError(null);
    } catch (err) {
      setError(apiUtils.handleError(err).message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadPayslip = async (payslipId, employeeName) => {
    try {
      setDownloadingPayslip(payslipId);
      const response = await payrollAPI.downloadPayslip(payslipId);
      
      // Response is already a blob, use it directly
      const url = window.URL.createObjectURL(response);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip-${employeeName}-${payslipId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Show success message
      setTimeout(() => {
        alert(`Payslip downloaded successfully for ${employeeName}! Check your downloads folder.`);
      }, 100);
    } catch (err) {
      console.error('Download error:', err);
      setError(apiUtils.handleError(err).message);
    } finally {
      setDownloadingPayslip(null);
    }
  };

  const handleSubmitRTI = async (payslipId) => {
    try {
      const result = await payrollAPI.submitRTI(payslipId);
      const reference = result?.rti_reference || result?.reference || 'RTI-REF';
      alert(`RTI submitted successfully! Reference: ${reference}`);
      loadPayslips();
    } catch (err) {
      setError(apiUtils.handleError(err).message);
    }
  };

  const handleClearPayslips = async () => {
    if (window.confirm('Are you sure you want to clear all payslips? This will delete all existing payslip data.')) {
      try {
        await payrollAPI.clearPayslips();
        alert('All payslips cleared successfully!');
        loadPayslips();
      } catch (err) {
        setError(apiUtils.handleError(err).message);
      }
    }
  };



  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Helper function to safely format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '£0.00';
    return apiUtils.formatCurrency(amount);
  };

  // Helper function to safely format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return apiUtils.formatDate(date);
  };

  // Helper function to get employee name safely
  const getEmployeeName = (payslip) => {
    return payslip.employee_name || payslip.name || `Employee ${payslip.employee_id || payslip.id}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading"></div>
        <p>Loading payroll data...</p>
      </div>
    );
  }

  return (
    <div className="payroll-page">
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <h1>Payroll Processing</h1>
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

        {/* NLP Command Section */}
        <div className="card mb-6">
          <div className="card-header">
            <h3>💬 Natural Language Commands</h3>
          </div>
          <div className="card-body">
            <div className="nlp-section">
              <div className="nlp-input-group">
                <input
                  type="text"
                  placeholder="Try: 'Run payroll for July 2024' or 'Show tax breakdown for Alice'"
                  value={nlpCommand}
                  onChange={(e) => setNlpCommand(e.target.value)}
                  className="form-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleNLPCommand()}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleNLPCommand}
                  disabled={processing || !nlpCommand.trim()}
                >
                  {processing ? (
                    <>
                      <span className="loading"></span>
                      Processing...
                    </>
                  ) : (
                    'Execute'
                  )}
                </button>
              </div>
              
              {nlpResult && (
                <div className="nlp-result mt-4">
                  <h4>AI Response:</h4>
                  <div className="nlp-response">
                    <p>{nlpResult.response || nlpResult.message || 'Command processed successfully.'}</p>
                    {nlpResult.action && (
                      <div className="nlp-action">
                        <strong>Action:</strong> {nlpResult.action}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Manual Payroll Processing */}
        <div className="card mb-6">
          <div className="card-header">
            <h3>💰 Manual Payroll Processing</h3>
          </div>
          <div className="card-body">
            <div className="payroll-controls">
              <div className="payroll-filters">
                <div className="form-group">
                  <label className="form-label">Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Select Month</option>
                    {months.map(month => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="form-select"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                className="btn btn-success btn-lg"
                onClick={handleRunPayroll}
                disabled={processing || !selectedMonth || !selectedYear}
              >
                {processing ? (
                  <>
                    <span className="loading"></span>
                    Processing Payroll...
                  </>
                ) : (
                  'Run Payroll'
                )}
              </button>
            </div>
          </div>
        </div>



        {/* Payslips List */}
        <div className="card">
          <div className="card-header">
            <div className="header-content">
              <h3>📊 Payslips Overview ({payslips.length})</h3>
              <div className="header-actions">
                <button
                  className="btn btn-sm btn-warning"
                  onClick={handleClearPayslips}
                  title="Clear all payslips"
                >
                  Clear Payslips
                </button>
              </div>
            </div>
          </div>
          <div className="card-body">
            {payslips.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📄</div>
                <h3>No payslips found</h3>
                <p>Run payroll to generate payslips for your employees</p>
                <div className="empty-state-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => setSelectedMonth('01')}
                  >
                    Run Payroll
                  </button>
                  <p className="text-sm text-muted mt-3">
                    You have {availableEmployees} employees available for payroll processing
                  </p>
                </div>
              </div>
            ) : (
              <>
                {payslips.length < availableEmployees && (
                  <div className="alert alert-info mb-4">
                    <span className="alert-icon">ℹ️</span>
                    <span className="alert-message">
                      Showing {payslips.length} payslips. Run payroll again to generate payslips for all {availableEmployees} employees.
                    </span>
                  </div>
                )}
                <div className="payslips-list">
                  {(showAllPayslips ? payslips : payslips.slice(0, 10)).map((payslip) => (
                  <div key={payslip.id} className="payslip-item">
                    <div className="payslip-header">
                      <div className="payslip-employee">
                        <div className="employee-avatar">
                          {getEmployeeName(payslip).charAt(0).toUpperCase()}
                        </div>
                        <div className="employee-info">
                          <h4>{getEmployeeName(payslip)}</h4>
                          <p className="pay-period">
                            {formatDate(payslip.pay_period_start)} - {formatDate(payslip.pay_period_end)}
                          </p>
                        </div>
                      </div>
                      <div className="payslip-status">
                        {payslip.rti_submitted ? (
                          <span className="badge badge-success">RTI Submitted</span>
                        ) : (
                          <span className="badge badge-warning">RTI Pending</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="payslip-details">
                      <div className="payslip-amounts">
                        <div className="amount-item">
                          <span className="amount-label">Gross Pay</span>
                          <span className="amount-value">{formatCurrency(payslip.gross_pay)}</span>
                        </div>
                        <div className="amount-item">
                          <span className="amount-label">PAYE</span>
                          <span className="amount-value tax">{formatCurrency(payslip.paye_tax)}</span>
                        </div>
                        <div className="amount-item">
                          <span className="amount-label">NI</span>
                          <span className="amount-value tax">{formatCurrency(payslip.national_insurance)}</span>
                        </div>
                        <div className="amount-item total">
                          <span className="amount-label">Net Pay</span>
                          <span className="amount-value net-pay">{formatCurrency(payslip.net_pay)}</span>
                        </div>
                      </div>
                      
                      <div className="payslip-actions">
                        <button
                          className="btn btn-primary"
                          onClick={() => handleDownloadPayslip(payslip.id, getEmployeeName(payslip))}
                          disabled={downloadingPayslip === payslip.id}
                        >
                          {downloadingPayslip === payslip.id ? (
                            <>
                              <span className="loading"></span>
                              Downloading...
                            </>
                          ) : (
                            <>
                              <span className="download-icon">⬇️</span>
                              Download PDF
                            </>
                          )}
                        </button>
                        {!payslip.rti_submitted && (
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleSubmitRTI(payslip.id)}
                          >
                            Submit RTI
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Show All Button at Bottom */}
              {totalPayslips >= 10 && (
                <div className="payslips-pagination mt-4">
                  <button
                    className={`btn btn-lg ${showAllPayslips ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setShowAllPayslips(!showAllPayslips)}
                  >
                    {showAllPayslips ? 'Show First 10' : `Show All ${totalPayslips} Payslips`}
                  </button>
                </div>
              )}
              </>
            )}
          </div>
        </div>

        {/* Payroll Summary */}
        {payslips.length > 0 && (
          <div className="card mt-6">
            <div className="card-header">
              <h3>📊 Payroll Summary</h3>
            </div>
            <div className="card-body">
              <div className="summary-grid">
                <div className="summary-item">
                  <div className="summary-label">Total Gross Pay</div>
                  <div className="summary-value">
                    {formatCurrency(
                      payslips.reduce((sum, p) => sum + (p.gross_pay || 0), 0)
                    )}
                  </div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Total PAYE</div>
                  <div className="summary-value">
                    {formatCurrency(
                      payslips.reduce((sum, p) => sum + (p.paye_tax || 0), 0)
                    )}
                  </div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Total NI</div>
                  <div className="summary-value">
                    {formatCurrency(
                      payslips.reduce((sum, p) => sum + (p.national_insurance || 0), 0)
                    )}
                  </div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Total Net Pay</div>
                  <div className="summary-value total-net">
                    {formatCurrency(
                      payslips.reduce((sum, p) => sum + (p.net_pay || 0), 0)
                    )}
                  </div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">RTI Submitted</div>
                  <div className="summary-value">
                    {payslips.filter(p => p.rti_submitted).length} / {payslips.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .payroll-page {
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

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .pagination-controls {
          display: flex;
          gap: var(--spacing-3);
        }

        .payslips-pagination {
          display: flex;
          justify-content: center;
          padding: var(--spacing-4);
          border-top: 1px solid var(--border-color);
          margin-top: var(--spacing-4);
        }

        .nlp-section {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-4);
        }

        .nlp-input-group {
          display: flex;
          gap: var(--spacing-4);
        }

        .nlp-input-group .form-input {
          flex: 1;
        }

        .nlp-result {
          background: var(--background-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-4);
          border: 1px solid var(--border-color);
        }

        .nlp-result h4 {
          margin-bottom: var(--spacing-2);
          color: var(--text-primary);
        }

        .nlp-response p {
          margin-bottom: var(--spacing-2);
          color: var(--text-secondary);
        }

        .nlp-action {
          background: rgb(37 99 235 / 0.1);
          padding: var(--spacing-3);
          border-radius: var(--radius-sm);
          border-left: 3px solid var(--primary-color);
        }

        .payroll-controls {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: var(--spacing-6);
        }

        .payroll-filters {
          display: flex;
          gap: var(--spacing-4);
          flex: 1;
        }

        .payroll-filters .form-group {
          flex: 1;
        }

        .net-pay {
          font-weight: 600;
          color: var(--success-color);
        }

        .table-actions {
          display: flex;
          gap: var(--spacing-2);
        }

        /* Payslips List Styling */
        .payslips-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-4);
        }

        .payslip-item {
          background: var(--background-color);
          border-radius: var(--radius-xl);
          padding: var(--spacing-6);
          border: 1px solid var(--border-color);
          transition: all var(--transition-normal);
          position: relative;
          overflow: hidden;
        }

        .payslip-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--primary-color), var(--success-color));
        }

        .payslip-item:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .payslip-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-4);
        }

        .payslip-employee {
          display: flex;
          align-items: center;
          gap: var(--spacing-4);
        }

        .employee-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: var(--primary-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--font-size-lg);
          font-weight: 600;
          flex-shrink: 0;
        }

        .employee-info h4 {
          margin: 0 0 var(--spacing-1) 0;
          color: var(--text-primary);
          font-size: var(--font-size-lg);
        }

        .pay-period {
          margin: 0;
          color: var(--text-secondary);
          font-size: var(--font-size-sm);
        }

        .payslip-status {
          flex-shrink: 0;
        }

        .payslip-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--spacing-6);
        }

        .payslip-amounts {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--spacing-4);
          flex: 1;
        }

        .amount-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: var(--spacing-3);
          background: var(--surface-color);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
        }

        .amount-item.total {
          background: var(--success-color);
          color: white;
          border-color: var(--success-color);
        }

        .amount-label {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-1);
          font-weight: 500;
        }

        .amount-item.total .amount-label {
          color: rgba(255, 255, 255, 0.9);
        }

        .amount-value {
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--text-primary);
        }

        .amount-value.tax {
          color: var(--warning-color);
        }

        .amount-value.net-pay {
          color: var(--success-color);
        }

        .amount-item.total .amount-value {
          color: white;
        }

        .payslip-actions {
          display: flex;
          gap: var(--spacing-3);
          flex-shrink: 0;
        }

        .download-icon {
          margin-right: var(--spacing-2);
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-6);
        }

        .summary-item {
          text-align: center;
          padding: var(--spacing-4);
          background: var(--background-color);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
        }

        .summary-label {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-2);
          font-weight: 500;
        }

        .summary-value {
          font-size: var(--font-size-xl);
          font-weight: 600;
          color: var(--text-primary);
        }

        .summary-value.total-net {
          color: var(--success-color);
        }



        /* Responsive Design */
        @media (max-width: 768px) {
          .payroll-page {
            padding: var(--spacing-4);
          }

          .page-header {
            flex-direction: column;
            gap: var(--spacing-4);
            align-items: stretch;
          }

          .nlp-input-group {
            flex-direction: column;
          }

          .payroll-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .payroll-filters {
            flex-direction: column;
          }

          .table-actions {
            flex-direction: column;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .payslip-header {
            flex-direction: column;
            gap: var(--spacing-3);
          }

          .payslip-employee {
            justify-content: center;
          }

          .payslip-details {
            flex-direction: column;
            gap: var(--spacing-4);
          }

          .payslip-amounts {
            grid-template-columns: repeat(2, 1fr);
          }

          .payslip-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Payroll; 