import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const [demoEmail, setDemoEmail] = useState('');
  const [demoName, setDemoName] = useState('');
  const [showDemoForm, setShowDemoForm] = useState(false);
  const navigate = useNavigate();

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you ${demoName}! We'll contact you at ${demoEmail} to schedule your demo session.`);
    setDemoName('');
    setDemoEmail('');
    setShowDemoForm(false);
  };

  const handleGetStarted = () => {
    navigate('/roles');
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">UK Payroll System</div>
            <h1 className="hero-title">
              The Complete
              <span className="gradient-text"> Payroll Solution</span>
            </h1>
            <p className="hero-subtitle">
              Streamline your payroll operations with AI-powered automation, HMRC compliance, 
              and real-time processing. Built for UK businesses.
            </p>
            <div className="hero-actions">
              <button onClick={handleGetStarted} className="btn-primary">
                Get Started
              </button>
              <button onClick={() => setShowDemoForm(true)} className="btn-secondary">
                Book Free Demo
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">99.9%</div>
                <div className="stat-label">Accuracy</div>
              </div>
              <div className="stat">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Support</div>
              </div>
              <div className="stat">
                <div className="stat-number">HMRC</div>
                <div className="stat-label">Compliant</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="dashboard-preview">
              <div className="preview-header">
                <div className="preview-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className="preview-content">
                <div className="preview-card">
                  <div className="card-icon">📊</div>
                  <div className="card-content">
                    <h4>Payroll Overview</h4>
                    <p>£45,230 processed</p>
                  </div>
                </div>
                <div className="preview-card">
                  <div className="card-icon">👥</div>
                  <div className="card-content">
                    <h4>Employees</h4>
                    <p>127 active</p>
                  </div>
                </div>
                <div className="preview-card">
                  <div className="card-icon">📈</div>
                  <div className="card-content">
                    <h4>Compliance</h4>
                    <p>100% RTI ready</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose HRMS?</h2>
            <p>Built for modern businesses with enterprise-grade features</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <h3>HMRC Compliance</h3>
              <p>Real-time information (RTI) submission and full compliance with UK tax regulations. Automatic tax code updates and pension scheme management.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
                  <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
                </svg>
              </div>
              <h3>AI-Powered Automation</h3>
              <p>Intelligent classification and automation for tax codes, pension eligibility, and document processing. Reduce manual errors by 95%.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              </div>
              <h3>Document Management</h3>
              <p>Upload and verify employee documents with OCR and AI classification. Secure storage with GDPR compliance and automatic data masking.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <h3>Real-time Analytics</h3>
              <p>Live dashboards and reports for payroll insights and compliance monitoring. Custom reports and automated alerts for critical events.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3>Multi-Company Support</h3>
              <p>Manage multiple companies from a single dashboard. Perfect for payroll bureaus and accounting firms with multiple clients.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3>Enterprise Security</h3>
              <p>Bank-level security with end-to-end encryption, role-based access control, and comprehensive audit trails for compliance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="demo-section">
        <div className="container">
          <div className="demo-content">
            <h2>Experience HRMS in Action</h2>
            <p>See how our platform can transform your payroll operations. Book a personalized demo session with our experts.</p>
            <button onClick={() => setShowDemoForm(true)} className="btn-primary">
              Book Free Demo
            </button>
          </div>
        </div>
      </section>

      {/* Demo Modal */}
      {showDemoForm && (
        <div className="modal-overlay" onClick={() => setShowDemoForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Book Your Free Demo</h3>
              <button className="modal-close" onClick={() => setShowDemoForm(false)}>×</button>
            </div>
            <form onSubmit={handleDemoSubmit} className="demo-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={demoName}
                  onChange={(e) => setDemoName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={demoEmail}
                  onChange={(e) => setDemoEmail(e.target.value)}
                  required
                  placeholder="Enter your email address"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowDemoForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Book Demo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .home-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--spacing-6);
        }

        /* Hero Section */
        .hero-section {
          padding: var(--spacing-20) 0 var(--spacing-16);
          overflow: hidden;
        }

        .hero-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--spacing-6);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-12);
          align-items: center;
        }

        .hero-badge {
          display: inline-block;
          background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
          color: white;
          padding: var(--spacing-2) var(--spacing-4);
          border-radius: var(--radius-full);
          font-size: var(--font-size-sm);
          font-weight: 600;
          margin-bottom: var(--spacing-6);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .hero-title {
          font-size: var(--font-size-6xl);
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: var(--spacing-6);
          line-height: 1.1;
        }

        .gradient-text {
          background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: var(--font-size-xl);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-8);
          line-height: 1.6;
        }

        .hero-actions {
          display: flex;
          gap: var(--spacing-4);
          margin-bottom: var(--spacing-8);
        }

        .btn-primary {
          padding: var(--spacing-4) var(--spacing-8);
          background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
          color: white;
          border: none;
          border-radius: var(--radius-lg);
          font-weight: 600;
          font-size: var(--font-size-lg);
          cursor: pointer;
          transition: all var(--transition-fast);
          box-shadow: var(--shadow-md);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .btn-secondary {
          padding: var(--spacing-4) var(--spacing-8);
          background: transparent;
          color: var(--primary-color);
          border: 2px solid var(--primary-color);
          border-radius: var(--radius-lg);
          font-weight: 600;
          font-size: var(--font-size-lg);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-secondary:hover {
          background: var(--primary-color);
          color: white;
          transform: translateY(-2px);
        }

        .hero-stats {
          display: flex;
          gap: var(--spacing-8);
        }

        .stat {
          text-align: center;
        }

        .stat-number {
          font-size: var(--font-size-2xl);
          font-weight: 800;
          color: var(--primary-color);
          margin-bottom: var(--spacing-1);
        }

        .stat-label {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Dashboard Preview */
        .hero-visual {
          display: flex;
          justify-content: center;
        }

        .dashboard-preview {
          background: white;
          border-radius: var(--radius-2xl);
          box-shadow: var(--shadow-xl);
          overflow: hidden;
          width: 100%;
          max-width: 500px;
        }

        .preview-header {
          background: var(--surface-color);
          padding: var(--spacing-4);
          border-bottom: 1px solid var(--border-color);
        }

        .preview-dots {
          display: flex;
          gap: var(--spacing-2);
        }

        .preview-dots span {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--border-color);
        }

        .preview-dots span:first-child {
          background: #ef4444;
        }

        .preview-dots span:nth-child(2) {
          background: #f59e0b;
        }

        .preview-dots span:last-child {
          background: #10b981;
        }

        .preview-content {
          padding: var(--spacing-6);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-4);
        }

        .preview-card {
          display: flex;
          align-items: center;
          gap: var(--spacing-4);
          padding: var(--spacing-4);
          background: var(--background-color);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
        }

        .card-icon {
          font-size: var(--font-size-2xl);
        }

        .card-content h4 {
          font-size: var(--font-size-sm);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-1);
        }

        .card-content p {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }

        /* Features Section */
        .features-section {
          padding: var(--spacing-20) 0;
          background: white;
        }

        .section-header {
          text-align: center;
          margin-bottom: var(--spacing-16);
        }

        .section-header h2 {
          font-size: var(--font-size-4xl);
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--spacing-4);
        }

        .section-header p {
          font-size: var(--font-size-xl);
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: var(--spacing-8);
        }

        .feature-card {
          background: var(--surface-color);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: var(--spacing-8);
          transition: all var(--transition-fast);
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .feature-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
          border-radius: var(--radius-xl);
          color: white;
          margin-bottom: var(--spacing-6);
        }

        .feature-card h3 {
          font-size: var(--font-size-xl);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-4);
        }

        .feature-card p {
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* Demo Section */
        .demo-section {
          padding: var(--spacing-20) 0;
          background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
          color: white;
          text-align: center;
        }

        .demo-content h2 {
          font-size: var(--font-size-3xl);
          font-weight: 700;
          margin-bottom: var(--spacing-4);
        }

        .demo-content p {
          font-size: var(--font-size-lg);
          margin-bottom: var(--spacing-8);
          opacity: 0.9;
        }

        /* Modal */
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
          z-index: 2000;
        }

        .modal-content {
          background: white;
          border-radius: var(--radius-2xl);
          padding: var(--spacing-8);
          max-width: 500px;
          width: 90%;
          box-shadow: var(--shadow-xl);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--spacing-6);
        }

        .modal-header h3 {
          font-size: var(--font-size-xl);
          font-weight: 600;
          color: var(--text-primary);
        }

        .modal-close {
          background: none;
          border: none;
          font-size: var(--font-size-2xl);
          cursor: pointer;
          color: var(--text-secondary);
          padding: var(--spacing-1);
        }

        .demo-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-4);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-2);
        }

        .form-group label {
          font-weight: 600;
          color: var(--text-primary);
        }

        .form-group input {
          padding: var(--spacing-3);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: var(--font-size-base);
          transition: all var(--transition-fast);
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgb(37 99 235 / 0.1);
        }

        .form-actions {
          display: flex;
          gap: var(--spacing-3);
          margin-top: var(--spacing-6);
        }

        .form-actions .btn-primary,
        .form-actions .btn-secondary {
          flex: 1;
          padding: var(--spacing-3) var(--spacing-6);
          font-size: var(--font-size-base);
        }

        @media (max-width: 768px) {
          .hero-container {
            grid-template-columns: 1fr;
            gap: var(--spacing-8);
            text-align: center;
          }

          .hero-title {
            font-size: var(--font-size-4xl);
          }

          .hero-subtitle {
            font-size: var(--font-size-lg);
          }

          .hero-actions {
            justify-content: center;
          }

          .hero-stats {
            justify-content: center;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .section-header h2 {
            font-size: var(--font-size-3xl);
          }
        }
      `}</style>
    </div>
  );
};

export default Home; 