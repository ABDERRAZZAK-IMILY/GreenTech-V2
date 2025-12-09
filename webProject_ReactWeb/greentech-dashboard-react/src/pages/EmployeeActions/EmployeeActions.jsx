import React, { useState, useRef, useEffect } from 'react';
import './EmployeeActions.css';
import { usePendingActions } from '../../contexts/PendingActionsContext';
import { useLoading } from '../../contexts/LoadingContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const EmployeeActions = () => {
  const [dailyActions, setDailyActions] = useState([
    { id: 1, title: 'Éteindre ordinateur en pause', icon: 'desktop', points: 15, completed: false, submitted: false, category: 'energie', requiresProof: true, proofDescription: 'Screenshot de l\'historique d\'extinction de votre ordinateur (Windows/Mac)' },
    { id: 2, title: 'Apporter sa tasse/mug personnel', icon: 'coffee', points: 10, completed: false, submitted: false, category: 'dechets', requiresProof: true, proofDescription: 'Photo de votre tasse/mug personnel sur votre bureau' },
    { id: 3, title: 'Utiliser un pass transport en commun', icon: 'bus', points: 20, completed: false, submitted: false, category: 'transport', requiresProof: true, proofDescription: 'Photo de votre pass de transport en commun mensuel actif' },
    { id: 4, title: 'Marcher pour venir au travail', icon: 'walking', points: 25, completed: false, submitted: false, category: 'transport', requiresProof: true, proofDescription: 'Screenshot de votre application podomètre montrant les pas effectués aujourd\'hui' },
    { id: 5, title: 'Utiliser une trottinette électrique', icon: 'bolt', points: 20, completed: false, submitted: false, category: 'transport', requiresProof: true, proofDescription: 'Photo de votre trottinette électrique au parking de l\'entreprise' },
    { id: 6, title: 'Déjeuner avec lunch box réutilisable', icon: 'utensils', points: 15, completed: false, submitted: false, category: 'dechets', requiresProof: true, proofDescription: 'Photo de votre lunch box réutilisable avec votre repas' },
    { id: 7, title: 'Participer à une action de nettoyage', icon: 'hands-helping', points: 50, completed: false, submitted: false, category: 'collectif', requiresProof: true, proofDescription: 'Photo de vous avec l\'équipe pendant l\'action de nettoyage' },
    { id: 8, title: 'Installer une plante au bureau', icon: 'leaf', points: 30, completed: false, submitted: false, category: 'bureau', requiresProof: true, proofDescription: 'Photo de la plante installée sur votre bureau avec votre espace visible' }
  ]);

  const [selectedAction, setSelectedAction] = useState(null);
  const [proofImage, setProofImage] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const { submitActionForApproval } = usePendingActions();
  const {
    setIsProcessingPurchase,
    setPurchaseProgress,
    setPurchaseStep,
    setPurchaseProductName
  } = useLoading();

  const [currentPosition, setCurrentPosition] = useState({
    lat: 33.5731,
    lng: -7.5898,
    address: 'Avenue Mohammed V, Casablanca',
    speed: 45,
    ecoMode: true,
    fuelConsumption: 6.2
  });

  const [tripData, setTripData] = useState({
    distance: 23.5,
    duration: '34 min',
    avgSpeed: 42,
    ecoScore: 85,
    co2Saved: 1.8,
    fuelSaved: 0.7
  });

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // Initialize the map
      const map = L.map(mapRef.current, {
        center: [currentPosition.lat, currentPosition.lng],
        zoom: 13,
        zoomControl: true,
        attributionControl: false
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      // Custom marker icon
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: '<div class="marker-pin"><i class="fas fa-map-marker-alt"></i></div>',
        iconSize: [30, 42],
        iconAnchor: [15, 42]
      });

      // Add marker for current position
      L.marker([currentPosition.lat, currentPosition.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`<b>${currentPosition.address}</b><br>Vitesse: ${currentPosition.speed} km/h`);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [currentPosition.lat, currentPosition.lng, currentPosition.address, currentPosition.speed]);

  const handleActionClick = (action) => {
    if (action.submitted) return; // Already submitted

    if (action.requiresProof) {
      // Open upload modal for proof
      setSelectedAction(action);
      setShowUploadModal(true);
      setProofImage(null);
    } else {
      // Submit without proof
      submitActionWithoutProof(action);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitActionWithProof = async () => {
    if (!selectedAction || !proofImage) return;

    // Show loading notification
    setPurchaseProductName(selectedAction.title);
    setIsProcessingPurchase(true);
    setPurchaseProgress(0);
    setPurchaseStep('Envoi de la preuve...');

    // Simulate upload progress
    for (let i = 0; i <= 50; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setPurchaseProgress(i);
    }

    setPurchaseStep('Création de la demande...');
    for (let i = 50; i <= 90; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setPurchaseProgress(i);
    }

    // Submit to pending actions
    submitActionForApproval({
      employeeName: "Mohammed Alami",
      actionName: selectedAction.title,
      points: selectedAction.points,
      proofImage: proofImage
    });

    // Mark as submitted
    setDailyActions(dailyActions.map(action =>
      action.id === selectedAction.id
        ? { ...action, submitted: true, completed: true }
        : action
    ));

    setPurchaseStep('✅ Demande envoyée pour validation!');
    setPurchaseProgress(100);

    setTimeout(() => {
      setIsProcessingPurchase(false);
      setPurchaseProgress(0);
      setPurchaseStep('');
      setPurchaseProductName('');
      setShowUploadModal(false);
      setSelectedAction(null);
      setProofImage(null);
    }, 2000);
  };

  const submitActionWithoutProof = async (action) => {
    // For actions that don't require proof (like eco-driving tracked automatically)
    setPurchaseProductName(action.title);
    setIsProcessingPurchase(true);
    setPurchaseProgress(0);
    setPurchaseStep('Validation automatique...');

    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 80));
      setPurchaseProgress(i);
    }

    // Submit to pending actions
    submitActionForApproval({
      employeeName: "Mohammed Alami",
      actionName: action.title,
      points: action.points,
      proofImage: null
    });

    setDailyActions(dailyActions.map(a =>
      a.id === action.id
        ? { ...a, submitted: true, completed: true }
        : a
    ));

    setPurchaseStep('✅ Demande envoyée pour validation!');

    setTimeout(() => {
      setIsProcessingPurchase(false);
      setPurchaseProgress(0);
      setPurchaseStep('');
      setPurchaseProductName('');
    }, 2000);
  };

  const completedActions = dailyActions.filter(a => a.submitted).length;
  const totalPoints = dailyActions.filter(a => a.submitted).reduce((sum, a) => sum + a.points, 0);
  const completionPercentage = (completedActions / dailyActions.length) * 100;

  return (
    <section className="employee-actions">
      {/* Header */}
      <div className="actions-header">
        <div className="actions-welcome">
          <h1>Mes Actions Quotidiennes</h1>
          <p>Suivez vos actions écologiques et votre trajet du jour</p>
        </div>
      </div>

      {/* Daily Actions Checklist with Progress */}
      <div className="checklist-section-wrapper">
        <div className="checklist-section">
        <div className="section-header">
          <h2>
            <i className="fas fa-tasks"></i>
            Checklist du Jour
          </h2>
          <div className="streak-badge">
            <i className="fas fa-fire"></i>
            <span>7 jours consécutifs</span>
          </div>
        </div>
        <div className="actions-grid">
          {dailyActions.map(action => (
            <div
              key={action.id}
              className={`action-item ${action.submitted ? 'submitted' : ''}`}
              onClick={() => handleActionClick(action)}
              style={{ cursor: action.submitted ? 'not-allowed' : 'pointer' }}
            >
              <div className="action-checkbox">
                <i className={`fas ${action.submitted ? 'fa-check-circle' : 'fa-circle'}`}></i>
              </div>
              <div className="action-content">
                <div className="action-title">{action.title}</div>
                <div className="action-points">
                  <i className="fas fa-coins"></i>
                  +{action.points} points
                </div>
              </div>
              {action.submitted && (
                <div className="completion-badge pending-validation">
                  <i className="fas fa-clock"></i>
                  <span className="validation-text">En validation</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progress Card */}
      <div className="daily-progress-card">
        <div className="progress-circle-container">
          <svg className="progress-ring" width="160" height="160">
            <circle
              className="progress-ring-circle-bg"
              cx="80"
              cy="80"
              r="70"
            />
            <circle
              className="progress-ring-circle"
              cx="80"
              cy="80"
              r="70"
              style={{
                strokeDasharray: `${2 * Math.PI * 70}`,
                strokeDashoffset: `${2 * Math.PI * 70 * (1 - completionPercentage / 100)}`
              }}
            />
          </svg>
          <div className="progress-text">
            <span className="progress-percentage">{Math.round(completionPercentage)}%</span>
            <span className="progress-label">Complété</span>
          </div>
        </div>
        <div className="progress-details">
          <div className="progress-stat">
            <i className="fas fa-check-circle"></i>
            <div>
              <span className="stat-value">{completedActions}/{dailyActions.length}</span>
              <span className="stat-label">Actions</span>
            </div>
          </div>
          <div className="progress-stat">
            <i className="fas fa-coins"></i>
            <div>
              <span className="stat-value">+{totalPoints}</span>
              <span className="stat-label">Points</span>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Real-time Transport Tracking */}
      <div className="transport-tracking-section">
        <div className="section-header">
          <h2>
            <i className="fas fa-map-marker-alt"></i>
            Suivi Transport en Temps Réel
          </h2>
          <div className="live-indicator">
            <span className="pulse-dot"></span>
            <span>En direct</span>
          </div>
        </div>

        <div className="tracking-grid">
          {/* Current Position */}
          <div className="tracking-card position-card">
            <div className="card-header">
              <i className="fas fa-location-arrow"></i>
              <h3>Position Actuelle</h3>
            </div>
            <div className="location-info">
              <div className="location-icon">
                <i className="fas fa-map-pin"></i>
              </div>
              <div className="location-details">
                <div className="location-address">{currentPosition.address}</div>
                <div className="location-coords">
                  {currentPosition.lat.toFixed(4)}°N, {Math.abs(currentPosition.lng).toFixed(4)}°W
                </div>
              </div>
            </div>
            <div className="position-stats">
              <div className="position-stat">
                <i className="fas fa-tachometer-alt"></i>
                <div>
                  <div className="stat-value">{currentPosition.speed} km/h</div>
                  <div className="stat-label">Vitesse</div>
                </div>
              </div>
              <div className="position-stat">
                <i className="fas fa-gas-pump"></i>
                <div>
                  <div className="stat-value">{currentPosition.fuelConsumption} L/100km</div>
                  <div className="stat-label">Consommation</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trip Summary */}
          <div className="tracking-card trip-card">
            <div className="card-header">
              <i className="fas fa-route"></i>
              <h3>Trajet d'Aujourd'hui</h3>
            </div>
            <div className="trip-stats-grid">
              <div className="trip-stat">
                <div className="trip-stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                  <i className="fas fa-road"></i>
                </div>
                <div>
                  <div className="trip-stat-value">{tripData.distance} km</div>
                  <div className="trip-stat-label">Distance</div>
                </div>
              </div>
              <div className="trip-stat">
                <div className="trip-stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                  <i className="fas fa-clock"></i>
                </div>
                <div>
                  <div className="trip-stat-value">{tripData.duration}</div>
                  <div className="trip-stat-label">Durée</div>
                </div>
              </div>
              <div className="trip-stat">
                <div className="trip-stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <i className="fas fa-tachometer-alt"></i>
                </div>
                <div>
                  <div className="trip-stat-value">{tripData.avgSpeed} km/h</div>
                  <div className="trip-stat-label">Vitesse Moy.</div>
                </div>
              </div>
              <div className="trip-stat">
                <div className="trip-stat-icon" style={{ background: 'linear-gradient(135deg, #0f4c3a 0%, #2a9d6f 100%)' }}>
                  <i className="fas fa-star"></i>
                </div>
                <div>
                  <div className="trip-stat-value">{tripData.ecoScore}/100</div>
                  <div className="trip-stat-label">Score Éco</div>
                </div>
              </div>
            </div>
            <div className="eco-savings">
              <div className="saving-item">
                <i className="fas fa-leaf"></i>
                <span>{tripData.co2Saved} kg CO2 économisé</span>
              </div>
              <div className="saving-item">
                <i className="fas fa-gas-pump"></i>
                <span>{tripData.fuelSaved} L carburant économisé</span>
              </div>
            </div>
          </div>

          {/* GPS Map */}
          <div className="tracking-card map-card">
            <div className="card-header">
              <i className="fas fa-map"></i>
              <h3>Carte GPS</h3>
            </div>
            <div ref={mapRef} className="map-container"></div>
          </div>
        </div>
      </div>

      {/* Photo Upload Modal */}
      {showUploadModal && (
        <div className="upload-modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-camera"></i>
                Joindre une preuve
              </h3>
              <button className="close-btn" onClick={() => setShowUploadModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="action-info">
                <div>
                  <div className="action-title">{selectedAction?.title}</div>
                  <div className="action-points">
                    <i className="fas fa-coins"></i>
                    +{selectedAction?.points} points
                  </div>
                </div>
              </div>

              <div className="proof-instructions">
                <i className="fas fa-camera"></i>
                <p>{selectedAction?.proofDescription}</p>
              </div>

              <div className="upload-area">
                {proofImage ? (
                  <div className="preview-container">
                    <img src={proofImage} alt="Preuve" className="proof-preview" />
                    <button className="change-photo-btn" onClick={() => fileInputRef.current.click()}>
                      <i className="fas fa-sync-alt"></i>
                      Changer la photo
                    </button>
                  </div>
                ) : (
                  <div className="upload-placeholder" onClick={() => fileInputRef.current.click()}>
                    <i className="fas fa-cloud-upload-alt"></i>
                    <p>Cliquez pour télécharger une photo</p>
                    <span>ou glissez-déposez une image ici</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>

              <div className="modal-info">
                <i className="fas fa-info-circle"></i>
                <span>Votre demande sera vérifiée par un administrateur avant validation</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowUploadModal(false)}>
                Annuler
              </button>
              <button
                className="submit-btn"
                onClick={submitActionWithProof}
                disabled={!proofImage}
              >
                <i className="fas fa-paper-plane"></i>
                Soumettre
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default EmployeeActions;
