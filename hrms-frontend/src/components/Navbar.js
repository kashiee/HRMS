import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const location = useLocation();

  // Mock user data - in real app this would come from authentication
  const currentUser = {
    name: 'John Smith',
    email: 'john.smith@company.com',
    avatar: '👤',
    role: 'HR Manager',
    company: 'TechCorp Solutions Ltd',
    department: 'Human Resources'
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleAIAssistant = () => {
    setIsAIAssistantOpen(!isAIAssistantOpen);
  };

  const handleAISubmit = (e) => {
    e.preventDefault();
    const input = e.target.querySelector('input');
    if (input && input.value.trim()) {
      // In a real app, this would send the query to the AI service
      console.log('AI Query:', input.value);
      alert(`AI Assistant: I received your query: "${input.value}". This would be processed by the AI service.`);
      input.value = '';
    }
  };

  const handleUserProfileClick = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const handleLogout = () => {
    alert('Logout successful! Redirecting to login page...');
    setShowUserDropdown(false);
    // In a real app, you would redirect to login page
    // window.location.href = '/login';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left Side - Logo */}
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <span className="navbar-logo-text">HRMS</span>
          </Link>
        </div>

        {/* Center - AI Assistant Search */}
        <div className="navbar-center">
          <form onSubmit={handleAISubmit} className="ai-search-bar">
            <div className="ai-search-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Ask Oceans AI anything..."
              className="ai-search-input"
              onFocus={toggleAIAssistant}
            />
            <button type="submit" className="ai-search-submit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </form>
        </div>

        {/* Right Side - User Profile */}
        <div className="navbar-right">
          <div className="user-profile-container">
            <div className="user-profile" onClick={handleUserProfileClick}>
              <div className="user-info">
                <span className="user-name">{currentUser.name}</span>
                <span className="user-role">{currentUser.role}</span>
              </div>
              <div className="user-avatar">
                {currentUser.avatar}
              </div>
            </div>
            
            {showUserDropdown && (
              <div className="user-dropdown">
                <div className="user-dropdown-header">
                  <div className="user-dropdown-avatar">{currentUser.avatar}</div>
                  <div className="user-dropdown-info">
                    <div className="user-dropdown-name">{currentUser.name}</div>
                    <div className="user-dropdown-email">{currentUser.email}</div>
                  </div>
                </div>
                <div className="user-dropdown-divider"></div>
                <div className="user-dropdown-company">
                  <div className="dropdown-label">Company</div>
                  <div className="dropdown-value">{currentUser.company}</div>
                </div>
                <div className="user-dropdown-department">
                  <div className="dropdown-label">Department</div>
                  <div className="dropdown-value">{currentUser.department}</div>
                </div>
                <div className="user-dropdown-divider"></div>
                <button className="user-dropdown-logout" onClick={handleLogout}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="navbar-mobile-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        {/* Mobile Navigation */}
        <div className={`navbar-mobile ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-user-info">
            <div className="mobile-user-avatar">{currentUser.avatar}</div>
            <div className="mobile-user-details">
              <div className="mobile-user-name">{currentUser.name}</div>
              <div className="mobile-user-email">{currentUser.email}</div>
            </div>
          </div>
          <div className="mobile-ai-assistant">
            <form onSubmit={handleAISubmit} className="mobile-ai-search-bar">
              <div className="mobile-ai-search-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <input 
                type="text" 
                placeholder="Ask Oceans AI anything..."
                className="mobile-ai-search-input"
              />
              <button type="submit" className="mobile-ai-search-submit">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background-color: var(--surface-color);
          border-bottom: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
          z-index: 1000;
          backdrop-filter: blur(10px);
          background-color: rgba(255, 255, 255, 0.95);
        }

        .navbar-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 var(--spacing-6);
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 80px;
        }

        .navbar-left {
          display: flex;
          align-items: center;
        }

        .navbar-center {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
        }

        .navbar-right {
          display: flex;
          align-items: center;
        }

        .navbar-logo {
          display: flex;
          align-items: center;
          gap: var(--spacing-3);
          text-decoration: none;
          color: var(--text-primary);
          font-weight: 700;
          font-size: var(--font-size-xl);
          transition: all var(--transition-fast);
        }

        .navbar-logo:hover {
          color: var(--primary-color);
          transform: translateY(-1px);
        }



        .navbar-logo-text {
          background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* AI Assistant Search Bar */
        .navbar-center {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          max-width: 600px;
          margin: 0 var(--spacing-4);
        }

        .ai-search-bar {
          display: flex;
          align-items: center;
          width: 100%;
          max-width: 500px;
          background: var(--surface-color);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-2xl);
          padding: var(--spacing-3) var(--spacing-4);
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-fast);
          position: relative;
          overflow: hidden;
        }

        .ai-search-bar::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--primary-color), var(--primary-dark));
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .ai-search-bar:focus-within {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgb(37 99 235 / 0.1);
        }

        .ai-search-bar:focus-within::before {
          transform: scaleX(1);
        }

        .ai-search-icon {
          display: flex;
          align-items: center;
          margin-right: var(--spacing-3);
          color: var(--primary-color);
          animation: pulse 2s infinite;
        }

        .ai-search-icon svg {
          width: 18px;
          height: 18px;
          stroke: currentColor;
          stroke-width: 2;
        }

        .ai-search-input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-size: var(--font-size-base);
          color: var(--text-primary);
          font-weight: 500;
          min-width: 0;
        }

        .ai-search-input::placeholder {
          color: var(--text-secondary);
          font-weight: 400;
        }

        .ai-search-submit {
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
          margin-left: var(--spacing-3);
          flex-shrink: 0;
        }

        .ai-search-submit:hover {
          background: var(--primary-dark);
          transform: scale(1.05);
        }

        .ai-search-submit svg {
          width: 16px;
          height: 16px;
          stroke: currentColor;
          stroke-width: 2;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        /* User Profile */
        .user-profile-container {
          position: relative;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: var(--spacing-3);
          padding: var(--spacing-2) var(--spacing-4);
          background: var(--background-color);
          border-radius: var(--radius-xl);
          border: 1px solid var(--border-color);
          transition: all var(--transition-fast);
          cursor: pointer;
        }

        .user-profile:hover {
          background: var(--surface-color);
          box-shadow: var(--shadow-sm);
        }

        .user-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: var(--spacing-2);
          background: var(--surface-color);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          min-width: 280px;
          z-index: 1000;
          overflow: hidden;
        }

        .user-dropdown-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-3);
          padding: var(--spacing-4);
          border-bottom: 1px solid var(--border-color);
        }

        .user-dropdown-avatar {
          font-size: var(--font-size-xl);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--primary-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-dropdown-info {
          flex: 1;
        }

        .user-dropdown-name {
          font-weight: 600;
          color: var(--text-primary);
          font-size: var(--font-size-base);
        }

        .user-dropdown-email {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          margin-top: var(--spacing-1);
        }

        .user-dropdown-divider {
          height: 1px;
          background: var(--border-color);
          margin: var(--spacing-2) 0;
        }

        .user-dropdown-company,
        .user-dropdown-department {
          padding: var(--spacing-3) var(--spacing-4);
        }

        .dropdown-label {
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: var(--spacing-1);
        }

        .dropdown-value {
          font-size: var(--font-size-sm);
          color: var(--text-primary);
          font-weight: 500;
        }

        .user-dropdown-logout {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
          width: 100%;
          padding: var(--spacing-3) var(--spacing-4);
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          transition: all var(--transition-fast);
          font-size: var(--font-size-sm);
        }

        .user-dropdown-logout:hover {
          background: var(--background-color);
          color: #dc2626;
        }

        .user-dropdown-logout svg {
          width: 16px;
          height: 16px;
          stroke: currentColor;
          stroke-width: 2;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .user-name {
          font-weight: 600;
          font-size: var(--font-size-sm);
          color: var(--text-primary);
        }

        .user-role {
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--primary-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--font-size-lg);
          font-weight: 600;
        }

        .navbar-nav {
          display: flex;
          align-items: center;
          gap: var(--spacing-8);
        }

        .navbar-link {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
          padding: var(--spacing-3) var(--spacing-4);
          text-decoration: none;
          color: var(--text-secondary);
          font-weight: 500;
          border-radius: var(--radius-lg);
          transition: all var(--transition-fast);
          position: relative;
        }

        .navbar-link:hover {
          color: var(--text-primary);
          background-color: var(--background-color);
        }

        .navbar-link.active {
          color: var(--primary-color);
          background-color: rgb(37 99 235 / 0.1);
        }

        .navbar-link.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 2px;
          background-color: var(--primary-color);
          border-radius: 1px;
        }

        .navbar-link-icon {
          font-size: var(--font-size-lg);
        }

        .navbar-link-text {
          font-size: var(--font-size-sm);
        }

        .navbar-mobile-toggle {
          display: none;
          flex-direction: column;
          justify-content: space-around;
          width: 30px;
          height: 30px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          z-index: 10;
        }

        .hamburger {
          width: 30px;
          height: 3px;
          background-color: var(--text-primary);
          border-radius: 2px;
          transition: all var(--transition-fast);
          position: relative;
        }

        .hamburger span {
          display: block;
          width: 100%;
          height: 3px;
          background-color: var(--text-primary);
          border-radius: 2px;
          transition: all var(--transition-fast);
          position: absolute;
        }

        .hamburger span:nth-child(1) {
          top: 0;
        }

        .hamburger span:nth-child(2) {
          top: 50%;
          transform: translateY(-50%);
        }

        .hamburger span:nth-child(3) {
          bottom: 0;
        }

        .hamburger.open span:nth-child(1) {
          transform: rotate(45deg);
          top: 50%;
        }

        .hamburger.open span:nth-child(2) {
          opacity: 0;
        }

        .hamburger.open span:nth-child(3) {
          transform: rotate(-45deg);
          bottom: 50%;
        }

        .navbar-mobile {
          display: none;
          position: fixed;
          top: 80px;
          left: 0;
          right: 0;
          background-color: var(--surface-color);
          border-bottom: 1px solid var(--border-color);
          box-shadow: var(--shadow-lg);
          transform: translateY(-100%);
          opacity: 0;
          transition: all var(--transition-normal);
          z-index: 999;
        }

        .navbar-mobile.open {
          transform: translateY(0);
          opacity: 1;
        }

        .navbar-mobile-link {
          display: flex;
          align-items: center;
          gap: var(--spacing-3);
          padding: var(--spacing-4) var(--spacing-6);
          text-decoration: none;
          color: var(--text-secondary);
          font-weight: 500;
          border-bottom: 1px solid var(--border-color);
          transition: all var(--transition-fast);
        }

        .navbar-mobile-link:last-child {
          border-bottom: none;
        }

        .navbar-mobile-link:hover {
          color: var(--text-primary);
          background-color: var(--background-color);
        }

        .navbar-mobile-link.active {
          color: var(--primary-color);
          background-color: rgb(37 99 235 / 0.1);
        }

        .navbar-mobile-link-icon {
          font-size: var(--font-size-lg);
        }

        .navbar-mobile-link-text {
          font-size: var(--font-size-base);
        }

        /* Mobile User Info */
        .mobile-user-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-4);
          padding: var(--spacing-4) var(--spacing-6);
          border-bottom: 1px solid var(--border-color);
        }

        .mobile-user-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: var(--primary-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--font-size-xl);
          font-weight: 600;
        }

        .mobile-user-details {
          flex: 1;
        }

        .mobile-user-name {
          font-weight: 600;
          font-size: var(--font-size-base);
          color: var(--text-primary);
        }

        .mobile-user-email {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }

        .mobile-ai-assistant {
          padding: var(--spacing-4) var(--spacing-6);
        }

        .mobile-ai-search-bar {
          display: flex;
          align-items: center;
          width: 100%;
          background: var(--surface-color);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-3) var(--spacing-4);
          box-shadow: var(--shadow-sm);
        }

        .mobile-ai-search-icon {
          display: flex;
          align-items: center;
          margin-right: var(--spacing-3);
          color: var(--primary-color);
        }

        .mobile-ai-search-icon svg {
          width: 18px;
          height: 18px;
          stroke: currentColor;
          stroke-width: 2;
        }

        .mobile-ai-search-input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-size: var(--font-size-base);
          color: var(--text-primary);
        }

        .mobile-ai-search-submit {
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: var(--spacing-3);
        }

        .mobile-ai-search-submit svg {
          width: 16px;
          height: 16px;
          stroke: currentColor;
          stroke-width: 2;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .navbar-container {
            padding: 0 var(--spacing-4);
          }

          .navbar-center {
            display: none;
          }

          .navbar-mobile-toggle {
            display: flex;
          }

          .navbar-mobile {
            display: block;
          }

          .navbar-logo-text {
            display: none;
          }

          .user-info {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .navbar-container {
            height: 70px;
          }

          .navbar-mobile {
            top: 70px;
          }

          .navbar-logo-icon {
            font-size: var(--font-size-xl);
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar; 