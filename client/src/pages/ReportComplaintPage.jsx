import React, { useState } from 'react';
import { CATEGORIES, WARDS } from '../data/mockData';
import './ReportComplaintPage.css';

export default function ReportComplaintPage({ onSubmitComplaint, onCancel }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [priority, setPriority] = useState('Medium');
  const [ward, setWard] = useState(WARDS[2]); // Default Indiranagar
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSimulateLocation = () => {
    setLocation("Near 12th Main Junction, Indiranagar, Ward 112");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMsg('Please enter a brief complaint title.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please provide a description of the civic issue.');
      return;
    }
    if (!location.trim()) {
      setErrorMsg('Please specify the location or landmark.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const fullLocation = ward && !location.includes(ward.split(' - ')[0])
        ? `${location.trim()}, ${ward.split(' - ')[1] || ''}`.trim()
        : location.trim();

      const complaintPayload = {
        title: title.trim(),
        category,
        priority,
        location: fullLocation,
        description: description.trim()
      };

      await onSubmitComplaint(complaintPayload);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit complaint. Please check your backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="report-page">
      {/* Page Header */}
      <div className="report-header">
        <div>
          <h1 className="report-title">Report a Civic Issue</h1>
          <p className="report-subtitle">
            Provide details below to alert municipal authorities. Your report is saved directly to MongoDB Atlas and dispatched to your local ward office.
          </p>
        </div>
        <div className="sla-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>Average SLA: 24–48 Hours</span>
        </div>
      </div>

      <div className="report-layout">
        {/* Main Form */}
        <form className="report-form" onSubmit={handleSubmit}>
          {errorMsg && (
            <div className="form-error-banner">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="complaint-title">
              Complaint Title <span className="required">*</span>
            </label>
            <input
              id="complaint-title"
              type="text"
              className="form-input"
              placeholder="e.g. Major sewage leakage spilling onto pedestrian path"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              disabled={isSubmitting}
            />
            <span className="form-hint">Be concise and specific (120 characters max)</span>
          </div>

          {/* 2. Category Selection Tiles */}
          <div className="form-group">
            <label className="form-label">
              Category <span className="required">*</span>
            </label>
            <div className="category-grid">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`category-select-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setCategory(cat.name)}
                    disabled={isSubmitting}
                    style={{
                      borderColor: isSelected ? cat.color : 'var(--border-color)',
                      backgroundColor: isSelected ? `${cat.color}10` : 'white'
                    }}
                  >
                    <span className="cat-card-dot" style={{ backgroundColor: cat.color }}></span>
                    <span className="cat-card-name">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Priority Level */}
          <div className="form-group">
            <label className="form-label">Priority Level</label>
            <div className="priority-options">
              {['Low', 'Medium', 'High', 'Urgent'].map((p) => {
                const isSelected = priority === p;
                return (
                  <label key={p} className={`priority-radio-label ${isSelected ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="priority"
                      value={p}
                      checked={isSelected}
                      onChange={() => setPriority(p)}
                      disabled={isSubmitting}
                    />
                    <span>{p}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 4. Ward & Location */}
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="ward-select">Municipal Ward</label>
              <select
                id="ward-select"
                className="form-select"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                disabled={isSubmitting}
              >
                {WARDS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ flex: 2 }}>
              <div className="location-label-row">
                <label className="form-label" htmlFor="location-input">
                  Exact Location / Landmark <span className="required">*</span>
                </label>
                <button
                  type="button"
                  className="detect-location-btn"
                  onClick={handleSimulateLocation}
                  disabled={isSubmitting}
                >
                  📍 Use Current Location
                </button>
              </div>
              <input
                id="location-input"
                type="text"
                className="form-input"
                placeholder="Street name, landmark, nearby house or pole number"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* 5. Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description-input">
              Issue Description <span className="required">*</span>
            </label>
            <textarea
              id="description-input"
              className="form-textarea"
              rows={4}
              placeholder="Describe the problem, when it started, and how it impacts citizens or traffic..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* 6. Media / Photo Upload Simulation */}
          <div className="form-group">
            <label className="form-label">Photo or Evidence (Optional)</label>
            <div
              className={`upload-dropzone ${hasPhoto ? 'has-file' : ''}`}
              onClick={() => setHasPhoto(!hasPhoto)}
            >
              <div className="upload-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              {hasPhoto ? (
                <div className="file-preview-info">
                  <span className="file-name">civic_evidence_site_photo.jpg (1.8 MB)</span>
                  <span className="file-status">✓ Attached • Click to remove</span>
                </div>
              ) : (
                <div className="upload-text-box">
                  <span className="upload-main-text">Click or drag & drop photo here</span>
                  <span className="upload-sub-text">Supports JPG, PNG up to 10MB</span>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions-row">
            <button
              type="button"
              className="cancel-btn"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-complaint-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Saving to MongoDB Atlas...</span>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  <span>Submit Complaint</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Sidebar Info Guidelines */}
        <aside className="report-guidelines">
          <div className="guideline-card">
            <h3 className="guideline-title">Citizen Reporting Guidelines</h3>
            <ul className="guideline-list">
              <li>
                <strong>Clear photos:</strong> Attach clear, well-lit photos showing the full extent of the issue.
              </li>
              <li>
                <strong>Precise location:</strong> Include recognizable landmarks, street numbers, or metro pillar markers.
              </li>
              <li>
                <strong>Emergency contacts:</strong> For active electrical fire or gas leakage hazards, call City Emergency <strong>112</strong> immediately.
              </li>
            </ul>
          </div>

          <div className="trust-card">
            <div className="trust-icon">🛡️</div>
            <h4>Official City Guarantee</h4>
            <p>Every ticket submitted on NIVARA generates an immutable tracking ID and is stored in MongoDB Atlas for municipal audit.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
