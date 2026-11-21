import React from 'react';
import './StatCard.css';

export default function StatCard({
  title,
  value,
  trend,
  trendLabel = 'vs last month',
  iconType = 'total',
  variant = 'primary',
  active = false,
  onClick
}) {
  const renderIcon = () => {
    switch (iconType) {
      case 'total':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        );
      case 'pending':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        );
      case 'progress':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
          </svg>
        );
      case 'resolved':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`stat-card stat-${variant} ${active ? 'active' : ''} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        <div className={`stat-icon-wrapper icon-${variant}`}>
          {renderIcon()}
        </div>
      </div>
      
      <div className="stat-body">
        <div className="stat-value">{value}</div>
        {trend && (
          <div className="stat-trend-row">
            <span className={`stat-trend ${trend.startsWith('+') ? 'positive' : 'negative'}`}>
              {trend}
            </span>
            <span className="stat-trend-label">{trendLabel}</span>
          </div>
        )}
      </div>

      <div className="stat-glow"></div>
    </div>
  );
}
