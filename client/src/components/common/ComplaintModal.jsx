import React, { useState, useEffect } from 'react';
import StatusBadge from './StatusBadge';
import { api } from '../../services/api';
import './ComplaintModal.css';

export default function ComplaintModal({
  complaint,
  onClose,
  onUpvote,
  onStatusUpdate
}) {
  const [currentComplaint, setCurrentComplaint] = useState(complaint);
  const [selectedStatus, setSelectedStatus] = useState(complaint?.status || 'Submitted');
  const [resolutionNote, setResolutionNote] = useState(complaint?.resolution_note || '');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);

  // Fetch real-time fresh details for this complaint from backend
  useEffect(() => {
    let isMounted = true;
    const complaintId = complaint?.complaint_id || complaint?.id;

    if (complaintId) {
      api.getComplaintById(complaintId)
        .then((fresh) => {
          if (isMounted && fresh) {
            setCurrentComplaint(fresh);
            setSelectedStatus(fresh.status || 'Submitted');
            setResolutionNote(fresh.resolution_note || '');
          }
        })
        .catch((err) => {
          // Gracefully retain initial complaint if fetch fails
          console.warn('Could not refresh complaint details:', err.message);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [complaint?.complaint_id, complaint?.id]);

  if (!currentComplaint) return null;

  const complaintId = currentComplaint.complaint_id || currentComplaint.id;

  const getPriorityClass = (priority) => {
    switch ((priority || '').toLowerCase()) {
      case 'urgent': return 'priority-urgent';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      default: return 'priority-low';
    }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!onStatusUpdate || !complaintId) return;

    setIsUpdatingStatus(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      const updated = await onStatusUpdate(complaintId, selectedStatus, resolutionNote);
      if (updated) {
        setCurrentComplaint(updated);
        setUpdateSuccess(`Status updated to '${selectedStatus}' successfully!`);
        setTimeout(() => setUpdateSuccess(null), 4000);
      }
    } catch (err) {
      setUpdateError(err.message || 'Failed to update complaint status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-id-tags">
            <span className="complaint-id-badge">{complaintId}</span>
            <span className={`priority-tag ${getPriorityClass(currentComplaint.priority)}`}>
              {currentComplaint.priority || 'Medium'} Priority
            </span>
            <StatusBadge status={currentComplaint.status} size="medium" />
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          <h2 className="modal-title">{currentComplaint.title}</h2>

          <div className="meta-grid">
            <div className="meta-item">
              <span className="meta-label">Category</span>
              <span className="meta-value category-pill">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                {currentComplaint.category}
              </span>
            </div>

            <div className="meta-item">
              <span className="meta-label">Location</span>
              <span className="meta-value location-pill">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {currentComplaint.location}
              </span>
            </div>

            <div className="meta-item">
              <span className="meta-label">Reported By</span>
              <span className="meta-value">{currentComplaint.reportedBy || 'Citizen'}</span>
            </div>

            <div className="meta-item">
              <span className="meta-label">Date Logged</span>
              <span className="meta-value">{currentComplaint.date}</span>
            </div>
          </div>

          <div className="modal-section">
            <h4 className="section-title">Issue Description</h4>
            <p className="description-text">{currentComplaint.description}</p>
          </div>

          {/* Official Resolution Note if present */}
          {currentComplaint.resolution_note && (
            <div className="modal-section">
              <h4 className="section-title">Official Resolution Note</h4>
              <div className="resolution-note-display">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>{currentComplaint.resolution_note}</span>
              </div>
            </div>
          )}

          {/* Status Update Control (PATCH /complaints/<id>/status) */}
          {onStatusUpdate && (
            <div className="modal-section status-update-section">
              <h4 className="section-title">Update Complaint Status</h4>
              <form className="status-update-form" onSubmit={handleStatusSubmit}>
                <div className="status-update-inputs">
                  <div className="status-field">
                    <label className="field-label">Status Stage:</label>
                    <select
                      className="status-select-control"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      disabled={isUpdatingStatus}
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="note-field">
                    <label className="field-label">Resolution / Action Remark:</label>
                    <input
                      type="text"
                      className="note-input-control"
                      placeholder="e.g. Assigned to Ward Engineer; Road repair scheduled..."
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      disabled={isUpdatingStatus}
                    />
                  </div>
                </div>

                <div className="status-submit-row">
                  {updateError && <span className="status-err-msg">{updateError}</span>}
                  {updateSuccess && <span className="status-ok-msg">{updateSuccess}</span>}
                  <button
                    type="submit"
                    className="save-status-btn"
                    disabled={isUpdatingStatus}
                  >
                    {isUpdatingStatus ? 'Saving Status...' : 'Apply Status Update'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Resolution Timeline */}
          <div className="modal-section">
            <h4 className="section-title">Resolution Timeline</h4>
            <div className="timeline-flow">
              {(currentComplaint.timeline || [
                { status: "Submitted", date: currentComplaint.date, note: "Complaint logged into NIVARA system" }
              ]).map((step, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-marker">
                    <div className="marker-dot"></div>
                    {idx < ((currentComplaint.timeline || []).length - 1) && <div className="marker-line"></div>}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-step-header">
                      <span className="step-status">{step.status}</span>
                      <span className="step-time">{step.date}</span>
                    </div>
                    <p className="step-note">{step.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button
            className="upvote-btn"
            onClick={() => onUpvote && onUpvote(complaintId)}
            title="Upvote to raise civic urgency"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
            <span>Endorse ({currentComplaint.votes || 0})</span>
          </button>

          <button className="close-action-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
