import React from 'react';
import './Sidebar.css';

export default function Sidebar({
  activeTab,
  onTabChange,
  pendingCount = 0,
  isMobileOpen,
  onCloseMobile
}) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      )
    },
    {
      id: 'my-complaints',
      label: 'My Complaints',
      badge: pendingCount > 0 ? pendingCount : null,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      )
    },
    {
      id: 'report',
      label: 'Report an Issue',
      highlight: true,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      )
    }
  ];

  return (
    <>
      {isMobileOpen && <div className="sidebar-backdrop" onClick={onCloseMobile} />}
      
      <aside className={`nivara-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Logo & Tagline */}
        <div className="sidebar-brand">
          <div className="brand-logo-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div className="brand-text">
            <div className="brand-title-row">
              <span className="brand-name">NIVARA</span>
              <span className="brand-tag">CIVIC</span>
            </div>
            <p className="brand-tagline">Your City. Your Voice. Our Action.</p>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="sidebar-nav">
          <div className="nav-group-title">MAIN NAVIGATION</div>
          <ul className="nav-list">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <li key={item.id} className="nav-item">
                  <button
                    className={`nav-button ${isActive ? 'active' : ''} ${item.highlight ? 'nav-button-highlight' : ''}`}
                    onClick={() => {
                      onTabChange(item.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                    {item.badge && <span className="nav-badge">{item.badge}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Civic Quick Info Card */}
        <div className="sidebar-civic-box">
          <div className="civic-box-header">
            <div className="civic-dot"></div>
            <span>Zonal Jurisdiction</span>
          </div>
          <p className="civic-box-desc">Metro Civic Corporation</p>
          <div className="civic-status-bar">
            <span>Ward Resolution Rate</span>
            <span className="rate-val">92.4%</span>
          </div>
          <div className="rate-progress">
            <div className="rate-progress-fill" style={{ width: '92.4%' }}></div>
          </div>
        </div>

        {/* Citizen Profile Footer */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              <span>AS</span>
              <div className="online-indicator"></div>
            </div>
            <div className="user-info">
              <span className="user-name">Aditi Sharma</span>
              <span className="user-role">Verified Citizen • Ward 112</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
