import React from 'react';

const AlertDetailsModal = ({ alert, isOpen, onClose, onAck }) => {
  if (!isOpen || !alert) return null;

  // Fonction pour déterminer la couleur de fond de l'icône selon le type
  const getIconGradient = (type) => {
    switch (type) {
      case 'critical': return 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)';
      case 'warning': return 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)';
      case 'offline': return 'linear-gradient(135deg, #f5576c 0%, #c92a2a 100%)';
      default: return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'; // info
    }
  };

  return (
    <div className="modal show" onClick={onClose}>
      
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        
        <button className="modal-close-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        {/* HEADER */}
        <div className="modal-header">
          <div 
            className="modal-icon" 
            style={{ background: getIconGradient(alert.type), boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}
          >
            <i className={`fas ${alert.icon}`} style={{ color: 'white' }} />
          </div>
          
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>
              {alert.title}
            </h2>
            <span 
              className={`status-badge ${alert.type === 'critical' || alert.type === 'offline' ? 'status-empty' : 'status-partial'}`}
              style={{ marginTop: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}
            >
              {alert.type}
            </span>
          </div>
        </div>

        {/* BODY */}
        <div className="modal-body">
          
          {/* Section Détails avec le style "detail-row" de ton CSS */}
          <div className="sensor-details-content">
            
            <div className="detail-row">
              <span className="detail-label">
                <i className="fas fa-map-marker-alt" style={{ marginRight: '8px', color: 'var(--accent-color)' }} />
                Localisation
              </span>
              <span className="detail-value">{alert.location}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">
                <i className="fas fa-clock" style={{ marginRight: '8px', color: 'var(--accent-color)' }} />
                Heure de détection
              </span>
              <span className="detail-value">{alert.time}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">
                <i className="fas fa-robot" style={{ marginRight: '8px', color: 'var(--accent-color)' }} />
                Source
              </span>
              <span className="detail-value">Analyse IA (Automatique)</span>
            </div>

          </div>

          {/* Description texte */}
          <div className="benchmark-explanation" style={{ marginTop: '20px' }}>
            <p>
              <strong>Analyse :</strong> Cette alerte a été générée suite à une anomalie détectée par les capteurs IoT. 
              Veuillez vérifier l'équipement concerné ou acquitter l'alerte si la situation est sous contrôle.
            </p>
          </div>

          {/* FOOTER (Actions) */}
          <div className="form-actions" style={{ marginTop: '30px' }}>
            <button 
              className="btn-cancel-modal" 
              onClick={onClose}
            >
              Fermer
            </button>
            
            <button 
              className="btn-submit" 
              onClick={() => { onAck(alert.id); onClose(); }}
              style={{ width: 'auto', padding: '10px 25px' }} // Surcharge légère pour adapter la largeur
            >
              <i className="fas fa-check-circle" /> Acquitter l'alerte
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AlertDetailsModal;