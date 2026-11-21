import React, { useState } from 'react';
import StatusBadge from '../components/common/StatusBadge';
import './MyComplaintsPage.css';

export default function MyComplaintsPage({
  complaints = [],
  isLoading = false,
  fetchError = null,
  onRetry,
  onSelectComplaint,
  onReportClick,
  searchTerm = ''
}) {
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Filter complaints
  const filtered = complaints.filter(item => {
    const itemStatus = (item.status || '').toLowerCase();
    if (filterStatus !== 'ALL') {
      if (filterStatus === 'Pending' && !itemStatus.includes('pending') && !itemStatus.includes('submitted')) return false;
      if (filterStatus === 'In Progress' && !itemStatus.includes('progress') && !itemStatus.includes('assigned')) return false;
      if (filterStatus === 'Resolved' && !itemStatus.includes('resolved')) return false;
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchId = (item.complaint_id || item.id || '').toLowerCase().includes(q);
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchLoc = (item.location || '').toLowerCase().includes(q);
      return matchId || matchTitle || matchLoc;
    }

    return true;
  });

  return (
    <div className="my-complaints-page">
      {/* Backend Alert Banner */}
      {fetchError && (
        <div className="dashboard-alert-banner" style={{ marginBottom: '16px' }}>
          <div className="alert-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <strong>Backend Offline:</strong> {fetchError}. Check if Flask server is running at <code>http://localhost:5000</code>.
            </div>
          </div>
          {onRetry && (
            <button className="alert-retry-btn" onClick={onRetry}>
              Retry Connection
            </button>
          )}
        </div>
      )}

      {/* Header Banner */}
      <div className="my-complaints-header">
        <div>
          <h1 className="page-title">My Tracked Complaints</h1>
          <p className="page-subtitle">
            Monitor real-time progress and official resolution notes for complaints filed in MongoDB Atlas.
          </p>
        </div>
        <button className="new-issue-btn" onClick={onReportClick}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Report New Issue</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="my-complaints-toolbar">
        <div className="status-chips">
          {['ALL', 'Pending', 'In Progress', 'Resolved'].map(tab => (
            <button
              key={tab}
              className={`status-chip ${filterStatus === tab ? 'active' : ''}`}
              onClick={() => setFilterStatus(tab)}
            >
              {tab === 'ALL' ? 'All Complaints' : tab}
              <span className="chip-count">
                {tab === 'ALL'
                  ? complaints.length
                  : complaints.filter(c => {
                      const s = (c.status || '').toLowerCase();
                      if (tab === 'Pending') return s.includes('pending') || s.includes('submitted');
                      if (tab === 'In Progress') return s.includes('progress') || s.includes('assigned');
                      return s.includes('resolved');
                    }).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Complaints */}
      {isLoading ? (
        <div className="empty-complaints-box">
          <div className="loading-spinner"></div>
          <h3 style={{ marginTop: '14px' }}>Loading Your Complaints...</h3>
          <p>Connecting to backend API</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="complaints-cards-grid">
          {filtered.map(complaint => (
            <div
              key={complaint.complaint_id || complaint.id}
              className="complaint-card"
              onClick={() => onSelectComplaint(complaint)}
            >
              <div className="card-top-row">
                <span className="card-id">{complaint.complaint_id || complaint.id}</span>
                <StatusBadge status={complaint.status} size="small" />
              </div>

              <h3 className="card-title">{complaint.title}</h3>

              <p className="card-desc">
                {complaint.description && complaint.description.length > 130
                  ? `${complaint.description.slice(0, 130)}...`
                  : complaint.description}
              </p>

              <div className="card-meta">
                <div className="meta-row">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                  <span>{complaint.category}</span>
                </div>
                <div className="meta-row">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="location-text">{complaint.location}</span>
                </div>
              </div>

              <div className="card-footer">
                <span className="card-date">Logged on {complaint.date}</span>
                <span className="view-link">View Details →</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-complaints-box">
          <div className="empty-icon-circle">📋</div>
          <h3>No complaints match your criteria</h3>
          <p>You haven't filed any complaints matching this filter status.</p>
          <button className="new-issue-btn" onClick={onReportClick}>
            Lodge a Complaint Now
          </button>
        </div>
      )}
    </div>
  );
}
