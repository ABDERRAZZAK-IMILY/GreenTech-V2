import React from 'react';

const LoadingNotification = ({ isVisible, title, progress, step, icon, color, index }) => {
  if (!isVisible) return null;

  const topPosition = 20 + (index * 160); 

  return (
    <div style={{
      position: 'fixed',
      top: `${topPosition}px`,
      right: '20px',
      background: 'linear-gradient(135deg, rgba(30, 39, 46, 0.98) 0%, rgba(45, 52, 54, 0.98) 100%)',
      padding: '20px',
      borderRadius: '16px',
      border: `2px solid ${color}`,
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
      minWidth: '350px',
      maxWidth: '400px',
      zIndex: 10000,
      animation: 'slideInRight 0.3s ease-out'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h4 style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className={`fas ${icon}`} style={{ color: color }} />
          {title}
        </h4>
        <span style={{ fontSize: '18px', fontWeight: '700', color: color }}>
          {progress}%
        </span>
      </div>
      <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px' }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: `linear-gradient(90deg, var(--primary-color), ${color})`,
          borderRadius: '10px',
          transition: 'width 0.3s ease'
        }} />
      </div>
      <p style={{ margin: '0', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <i className="fas fa-spinner fa-spin" style={{ color: color }} />
        {step}
      </p>
    </div>
  );
};

export default LoadingNotification;