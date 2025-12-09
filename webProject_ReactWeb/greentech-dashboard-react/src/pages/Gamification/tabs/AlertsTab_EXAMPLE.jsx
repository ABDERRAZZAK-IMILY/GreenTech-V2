
import React from 'react';
import { useAlerts } from '../../../contexts/AlertsContext';

const AlertsTab = () => {
  const { alerts, removeAlert, clearAlerts } = useAlerts();

  const handleDismiss = (alertId) => {
    removeAlert(alertId);
  };

  const handleClearAll = () => {
    clearAlerts();
  };

  return (
    <div className="alerts-tab">
      <div className="alerts-header">
        <h3>
          <i className="fas fa-bell"></i> Alertes en Temps Réel
          {alerts.length > 0 && (
            <span className="alerts-badge">{alerts.length}</span>
          )}
        </h3>
        {alerts.length > 0 && (
          <button className="btn-clear-all" onClick={handleClearAll}>
            <i className="fas fa-trash"></i> Tout effacer
          </button>
        )}
      </div>

      <div className="alerts-list">
        {alerts.length === 0 ? (
          <div className="no-alerts">
            <i className="fas fa-check-circle"></i>
            <p>Aucune alerte pour le moment</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className={`alert-card alert-${alert.type}`}>
              <div className="alert-icon">
                <i className={`fas ${alert.icon}`}></i>
              </div>
              <div className="alert-content">
                <div className="alert-header">
                  <h4>{alert.title}</h4>
                  <button 
                    className="btn-dismiss" 
                    onClick={() => handleDismiss(alert.id)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <p className="alert-location">{alert.location}</p>
                <span className="alert-time">
                  <i className="fas fa-clock"></i> {alert.time}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsTab;
