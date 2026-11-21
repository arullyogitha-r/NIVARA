import React from 'react';
import './StatusBadge.css';

export default function StatusBadge({ status, size = 'medium' }) {
  const normalized = (status || 'Pending').toLowerCase().trim();

  let statusClass = 'pending';
  let label = status || 'Pending';

  if (normalized.includes('progress') || normalized.includes('review')) {
    statusClass = 'in-progress';
    label = 'In Progress';
  } else if (normalized.includes('resolved') || normalized.includes('closed') || normalized.includes('completed')) {
    statusClass = 'resolved';
    label = 'Resolved';
  } else if (normalized.includes('reject') || normalized.includes('cancel')) {
    statusClass = 'rejected';
    label = 'Rejected';
  } else {
    statusClass = 'pending';
    label = 'Pending';
  }

  return (
    <span className={`status-badge status-${statusClass} size-${size}`}>
      <span className="status-dot"></span>
      <span className="status-text">{label}</span>
    </span>
  );
}
