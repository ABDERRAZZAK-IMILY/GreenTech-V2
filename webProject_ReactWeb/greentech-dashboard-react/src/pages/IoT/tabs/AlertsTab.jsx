import React, { useState } from 'react';

const AlertsTab = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'critical',
      icon: 'fa-exclamation-circle',
      title: 'Consommation critique - Atelier',
      location: '+45% vs moyenne - Vérification requise',
      time: 'Il y a 10min'
    },
    {
      id: 2,
      type: 'offline',
      icon: 'fa-power-off',
      title: 'Capteur hors ligne - Entrepôt',
      location: 'ESP32-ELEC-003 - Connexion perdue',
      time: 'Il y a 2h'
    },
    {
      id: 3,
      type: 'critical',
      icon: 'fa-fire',
      title: 'Température anormale détectée',
      location: 'Salle Serveurs - 38°C (Seuil: 28°C)',
      time: 'Il y a 20min'
    },
    {
      id: 4,
      type: 'warning',
      icon: 'fa-weight',
      title: 'Seuil déchets dépassé - Cuisine',
      location: '85.3 kg / 80 kg max - Vidange recommandée',
      time: 'Il y a 45min'
    },
    {
      id: 5,
      type: 'warning',
      icon: 'fa-truck',
      title: 'Kilométrage élevé - Camion Transport',
      location: '8,500 km ce mois (+22% vs moyenne)',
      time: 'Il y a 5h'
    },
    {
      id: 6,
      type: 'info',
      icon: 'fa-battery-half',
      title: 'Batterie faible - Voiture Commerciale',
      location: 'ESP32-GPS-005 - 15% restant',
      time: 'Il y a 3h'
    },
    {
      id: 7,
      type: 'warning',
      icon: 'fa-fire',
      title: 'Stock gaz faible',
      location: '4 bouteilles restantes - Commande suggérée',
      time: 'Il y a 1 jour'
    },
    {
      id: 8,
      type: 'info',
      icon: 'fa-sync',
      title: 'Mise à jour firmware disponible',
      location: '3 capteurs - Version 2.1.4',
      time: 'Il y a 1 jour'
    }
  ]);

  const acknowledgeAlert = (alertId) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
    console.log(`Alerte ${alertId} acquittée`);
  };

  const viewAlertDetails = (alertId) => {
    const alertData = alerts.find(a => a.id === alertId);
    if (alertData) {
      window.alert(`Détails de l'alerte:\n\n${alertData.title}\n${alertData.location}\n${alertData.time}`);
    }
  };

  const criticalCount = alerts.filter(a => a.type === 'critical').length;
  const offlineCount = alerts.filter(a => a.type === 'offline').length;

  return (
    <div>
      {/* KPI Stats */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div
            className="kpi-icon"
            style={{
              background: "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)"
            }}
          >
            <i className="fas fa-exclamation-triangle" />
          </div>
          <div className="kpi-content">
            <h3>Alertes Critiques</h3>
            <div className="kpi-value">
              {criticalCount} <span>alertes</span>
            </div>
            <div className="kpi-trend negative">
              <i className="fas fa-exclamation-circle" /> Action requise
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div
            className="kpi-icon"
            style={{
              background: "linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)"
            }}
          >
            <i className="fas fa-bell" />
          </div>
          <div className="kpi-content">
            <h3>Alertes Totales</h3>
            <div className="kpi-value">
              {alerts.length} <span>alertes</span>
            </div>
            <div className="kpi-trend negative">
              <i className="fas fa-exclamation-circle" /> Attention requise
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div
            className="kpi-icon"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            }}
          >
            <i className="fas fa-power-off" />
          </div>
          <div className="kpi-content">
            <h3>Capteurs Hors Ligne</h3>
            <div className="kpi-value">
              {offlineCount} <span>capteurs</span>
            </div>
            <div className="kpi-trend negative">
              <i className="fas fa-times-circle" /> Intervention requise
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div
            className="kpi-icon"
            style={{
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
            }}
          >
            <i className="fas fa-check-circle" />
          </div>
          <div className="kpi-content">
            <h3>Résolues Aujourd'hui</h3>
            <div className="kpi-value">
              5 <span>alertes</span>
            </div>
            <div className="kpi-trend positive">
              <i className="fas fa-arrow-up" /> +2 vs hier
            </div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="iot-alerts">
        <h3>
          <i className="fas fa-exclamation-triangle" /> Alertes Actives
        </h3>
        <div className="alerts-container">
          {alerts.map(alert => (
            <div key={alert.id} className={`alert-item alert-${alert.type}`}>
              <div className="alert-icon">
                <i className={`fas ${alert.icon}`} />
              </div>
              <div className="alert-content">
                <div className="alert-title">{alert.title}</div>
                <div className="alert-location">{alert.location}</div>
              </div>
              <div className="alert-actions">
                <button
                  className="btn-alert-ack"
                  onClick={() => acknowledgeAlert(alert.id)}
                >
                  <i className="fas fa-check" /> Acquitter
                </button>
                <button
                  className="btn-alert-details"
                  onClick={() => viewAlertDetails(alert.id)}
                >
                  <i className="fas fa-info-circle" /> Détails
                </button>
              </div>
              <div className="alert-time">{alert.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlertsTab;
