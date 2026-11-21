import React, { useState } from 'react';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import { CATEGORIES } from '../data/mockData';
import './DashboardPage.css';

export default function DashboardPage({
  complaints = [],
  isLoading = false,
  fetchError = null,
  onRetry,
  onSelectComplaint,
  onReportClick,
  searchTerm = ''
}) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Compute live stats from complaints
  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => {
    const s = (c.status || '').toLowerCase();
    return s.includes('pending') || s.includes('submitted');
  }).length;
  const progressCount = complaints.filter(c => {
    const s = (c.status || '').toLowerCase();
    return s.includes('progress') || s.includes('assigned');
  }).length;
  const resolvedCount = complaints.filter(c => (c.status || '').toLowerCase().includes('resolved')).length;

  // Filter complaints
  const filteredComplaints = complaints.filter(item => {
    // Status filter
    if (statusFilter !== 'ALL') {
      const itemStatus = (item.status || '').toLowerCase();
      if (statusFilter === 'Pending' && !itemStatus.includes('pending') && !itemStatus.includes('submitted')) return false;
      if (statusFilter === 'In Progress' && !itemStatus.includes('progress') && !itemStatus.includes('assigned')) return false;
      if (statusFilter === 'Resolved' && !itemStatus.includes('resolved')) return false;
    }

    // Category filter
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchId = (item.complaint_id || item.id || '').toLowerCase().includes(q);
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchLoc = (item.location || '').toLowerCase().includes(q);
      const matchCat = (item.category || '').toLowerCase().includes(q);
      return matchId || matchTitle || matchLoc || matchCat;
    }

    return true;
  });

  return (
    <div className="dashboard-page">
      {/* Backend Error / Connection Warning Banner */}
      {fetchError && (
        <div className="dashboard-alert-banner">
          <div className="alert-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <strong>Backend Offline:</strong> {fetchError}. Ensure Flask backend is running on <code>http://localhost:5000</code>.
            </div>
          </div>
          {onRetry && (
            <button className="alert-retry-btn" onClick={onRetry}>
              Retry Connection
            </button>
          )}
        </div>
      )}

      {/* Welcome Banner */}
      <section className="welcome-banner">
        <div className="banner-content">
          <div className="banner-badge">
            <span className="badge-pulse"></span>
            <span>Civic Redressal Live Portal • MongoDB Atlas Connected</span>
          </div>
          <h1 className="banner-title">Welcome to NIVARA</h1>
          <p className="banner-tagline">"Your City. Your Voice. Our Action."</p>
          <p className="banner-desc">
            Empowering residents to report civic concerns, monitor municipal action, and collaborate directly with local ward authorities in real time.
          </p>
          
          <div className="banner-actions">
            <button className="primary-action-btn" onClick={onReportClick}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <span>Lodge a Complaint</span>
            </button>
            <div className="banner-stats-pill">
              <span className="pill-dot"></span>
              <span>Ward 112 Active Engineers on Duty: <strong>14</strong></span>
            </div>
          </div>
        </div>

        <div className="banner-visual">
          <div className="civic-score-card">
            <span className="score-label">Resolution Efficiency</span>
            <div className="score-val">88.6%</div>
            <span className="score-sub">Avg. turnaround: 28 hrs</span>
            <div className="score-bars">
              <div className="bar" style={{ height: '50%' }}></div>
              <div className="bar" style={{ height: '70%' }}></div>
              <div className="bar" style={{ height: '85%' }}></div>
              <div className="bar active" style={{ height: '95%' }}></div>
              <div className="bar" style={{ height: '65%' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Stat Cards */}
      <section className="stats-section">
        <div className="section-header">
          <h2 className="section-heading">Overview & Metrics</h2>
          <span className="section-sub">
            {isLoading ? "Fetching live records from MongoDB..." : `Live grievance statistics (${totalCount} total records)`}
          </span>
        </div>
        <div className="stat-cards-grid">
          <StatCard
            title="Total Complaints"
            value={isLoading ? "..." : totalCount}
            trend="+12%"
            trendLabel="live database count"
            iconType="total"
            variant="primary"
            onClick={() => setStatusFilter('ALL')}
            active={statusFilter === 'ALL'}
          />
          <StatCard
            title="Pending Review"
            value={isLoading ? "..." : pendingCount}
            trend="-5%"
            trendLabel="submitted / pending"
            iconType="pending"
            variant="yellow"
            onClick={() => setStatusFilter('Pending')}
            active={statusFilter === 'Pending'}
          />
          <StatCard
            title="In Progress"
            value={isLoading ? "..." : progressCount}
            trend="+8%"
            trendLabel="assigned / active"
            iconType="progress"
            variant="primary"
            onClick={() => setStatusFilter('In Progress')}
            active={statusFilter === 'In Progress'}
          />
          <StatCard
            title="Resolved"
            value={isLoading ? "..." : resolvedCount}
            trend="+24%"
            trendLabel="verified closed"
            iconType="resolved"
            variant="teal"
            onClick={() => setStatusFilter('Resolved')}
            active={statusFilter === 'Resolved'}
          />
        </div>
      </section>

      {/* Category Pills Filter */}
      <section className="categories-section">
        <div className="category-scroll-list">
          <button
            className={`category-pill-btn ${selectedCategory === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('ALL')}
          >
            All Categories
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`category-pill-btn ${selectedCategory === cat.name ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.name)}
            >
              <span className="cat-dot" style={{ backgroundColor: cat.color }}></span>
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Recent Complaints Table/List */}
      <section className="complaints-list-section">
        <div className="list-header">
          <div className="list-title-box">
            <h2 className="section-heading">Recent Complaints & Inquiries</h2>
            <span className="results-count">
              {isLoading ? "Refreshing..." : `Showing ${filteredComplaints.length} issues`}
            </span>
          </div>

          {/* Status Tabs Filter */}
          <div className="status-filter-tabs">
            {['ALL', 'Pending', 'In Progress', 'Resolved'].map(tab => (
              <button
                key={tab}
                className={`filter-tab ${statusFilter === tab ? 'active' : ''}`}
                onClick={() => setStatusFilter(tab)}
              >
                {tab === 'ALL' ? 'All Issues' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Complaints Table */}
        <div className="table-container">
          <table className="complaints-table">
            <thead>
              <tr>
                <th>Complaint ID</th>
                <th>Issue Title</th>
                <th>Category</th>
                <th>Location</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="empty-state-cell">
                    <div className="empty-state-box">
                      <div className="loading-spinner"></div>
                      <h4 className="empty-title" style={{ marginTop: '14px' }}>Loading Live Complaints...</h4>
                      <p className="empty-text">Fetching latest data from MongoDB Atlas</p>
                    </div>
                  </td>
                </tr>
              ) : filteredComplaints.length > 0 ? (
                filteredComplaints.map(item => (
                  <tr
                    key={item.complaint_id || item.id}
                    className="table-row"
                    onClick={() => onSelectComplaint(item)}
                  >
                    <td className="cell-id">
                      <span className="id-code">{item.complaint_id || item.id}</span>
                    </td>
                    <td className="cell-title">
                      <div className="title-text">{item.title}</div>
                      <span className="title-date">{item.date}</span>
                    </td>
                    <td className="cell-category">
                      <span className="category-badge">{item.category}</span>
                    </td>
                    <td className="cell-location">
                      <div className="location-cell">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{item.location}</span>
                      </div>
                    </td>
                    <td className="cell-status">
                      <StatusBadge status={item.status} size="small" />
                    </td>
                    <td className="cell-priority">
                      <span className={`priority-indicator priority-${(item.priority || '').toLowerCase()}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="cell-action">
                      <button
                        className="view-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectComplaint(item);
                        }}
                      >
                        Details →
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-state-cell">
                    <div className="empty-state-box">
                      <div className="empty-icon">📋</div>
                      <h4 className="empty-title">No complaints found</h4>
                      <p className="empty-text">No records matched your search or status filter.</p>
                      <button
                        className="empty-reset-btn"
                        onClick={onReportClick}
                      >
                        Lodge a Complaint
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
