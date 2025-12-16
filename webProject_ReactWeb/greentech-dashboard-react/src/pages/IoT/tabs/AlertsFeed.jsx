import React from 'react';

// Composant s4ir pour 1 alerte
const AlertItem = ({ alert, onAck, onDetails }) => (
  <div className={`alert-item alert-${alert.type}`}>
    <div className="alert-icon">
      <i className={`fas ${alert.icon}`} />
    </div>
    <div className="alert-content">
      <div className="alert-title">{alert.title}</div>
      <div className="alert-location">{alert.location}</div>
    </div>
    <div className="alert-actions">
      <button className="btn-alert-ack" onClick={() => onAck(alert.id)}>
        <i className="fas fa-check" /> Acquitter
      </button>
      <button className="btn-alert-details" onClick={() => onDetails(alert.id)}>
        <i className="fas fa-info-circle" /> Détails
      </button>
    </div>
    <div className="alert-time">{alert.time}</div>
  </div>
);

// Composant Principal de la Liste
const AlertsFeed = ({ alerts, loading, error, onAck, onDetails }) => {
  return (
    <div className="iot-alerts">
      <h3><i className="fas fa-robot" /> Analyses IA en Temps Réel</h3>

      {loading && alerts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <i className="fas fa-spinner fa-spin fa-2x"></i>
          <p>L'IA analyse vos données...</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '20px', color: 'red', background: '#ffe6e6', borderRadius: '8px' }}>
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      ) : alerts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#28a745' }}>
          <i className="fas fa-check-circle fa-3x" style={{ marginBottom: '15px' }}></i>
          <h4>Tout est normal !</h4>
          <p>Aucune anomalie détectée par l'IA.</p>
        </div>
      ) : (
        <div className="alerts-container">
          {alerts.map(alert => (
            <AlertItem 
              key={alert.id} 
              alert={alert} 
              onAck={onAck} 
              onDetails={onDetails} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsFeed;