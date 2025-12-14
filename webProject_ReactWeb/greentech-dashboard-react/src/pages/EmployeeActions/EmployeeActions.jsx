import React, { useState, useRef, useEffect } from 'react';
import './EmployeeActions.css';
import { useLoading } from '../../contexts/LoadingContext';
import gamificationService from '../../services/gamificationService';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const EmployeeActions = () => {
  // State for challenges from backend
  const [challenges, setChallenges] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedAction, setSelectedAction] = useState(null);
  const [proofImage, setProofImage] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

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

  // Map category to icon
  const getCategoryIcon = (category) => {
    const icons = {
      'Transport': 'bus',
      'transport': 'bus',
      'energy': 'bolt',
      'Énergie': 'bolt',
      'trash': 'trash',
      'Déchet': 'trash',
      'dechets': 'trash',
      'water': 'tint',
      'Eau': 'tint',
      'office': 'building',
      'Bureau': 'building',
      'bureau': 'building',
      'collective': 'users',
      'Collectif': 'users'
    };
    return icons[category] || 'leaf';
  };

  // Check if a challenge is submitted by the user
  const isSubmitted = (challengeId) => {
    return mySubmissions.some(sub => sub.challengeId === challengeId);
  };

  // Get submission status for a challenge
  const getSubmissionStatus = (challengeId) => {
    const submission = mySubmissions.find(sub => sub.challengeId === challengeId);
    return submission ? submission.status : null;
  };

  // Fetch challenges and submissions from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch active challenges and user's submissions in parallel
        const [challengesData, submissionsData] = await Promise.all([
          gamificationService.getActiveChallenges(),
          gamificationService.getMySubmissions()
        ]);

        setChallenges(challengesData || []);
        setMySubmissions(submissionsData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const handleActionClick = (challenge) => {
    const submitted = isSubmitted(challenge.id);
    if (submitted) return; // Already submitted

    // Open upload modal for proof
    setSelectedAction(challenge);
    setShowUploadModal(true);
    setProofImage(null);
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

    try {
      // Simulate upload progress
      for (let i = 0; i <= 50; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setPurchaseProgress(i);
      }

      setPurchaseStep('Création de la demande...');
      
      // Submit to backend
      await gamificationService.submitChallenge(selectedAction.id, proofImage);

      for (let i = 50; i <= 90; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setPurchaseProgress(i);
      }

      // Refresh submissions after successful submit
      const updatedSubmissions = await gamificationService.getMySubmissions();
      setMySubmissions(updatedSubmissions || []);

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
    } catch (err) {
      console.error('Error submitting challenge:', err);
      setPurchaseStep('❌ Erreur lors de l\'envoi');
      setPurchaseProgress(0);
      setTimeout(() => {
        setIsProcessingPurchase(false);
        setPurchaseStep('');
        setPurchaseProductName('');
      }, 2000);
    }
  };

  const submitActionWithoutProof = async (challenge) => {
    // For actions that don't require proof
    setPurchaseProductName(challenge.title);
    setIsProcessingPurchase(true);
    setPurchaseProgress(0);
    setPurchaseStep('Envoi de la demande...');

    try {
      for (let i = 0; i <= 50; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 80));
        setPurchaseProgress(i);
      }

      // Submit to backend
      await gamificationService.submitChallenge(challenge.id, null);

      for (let i = 50; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 80));
        setPurchaseProgress(i);
      }

      // Refresh submissions
      const updatedSubmissions = await gamificationService.getMySubmissions();
      setMySubmissions(updatedSubmissions || []);

      setPurchaseStep('✅ Demande envoyée pour validation!');

      setTimeout(() => {
        setIsProcessingPurchase(false);
        setPurchaseProgress(0);
        setPurchaseStep('');
        setPurchaseProductName('');
      }, 2000);
    } catch (err) {
      console.error('Error submitting challenge:', err);
      setPurchaseStep('❌ Erreur lors de l\'envoi');
      setTimeout(() => {
        setIsProcessingPurchase(false);
        setPurchaseProgress(0);
        setPurchaseStep('');
        setPurchaseProductName('');
      }, 2000);
    }
  };

  // Calculate stats from submissions and challenges
  const submittedChallenges = challenges.filter(c => isSubmitted(c.id));
  const approvedSubmissions = mySubmissions.filter(s => s.status === 'APPROVED');
  const completedActions = submittedChallenges.length;
  const totalPoints = approvedSubmissions.reduce((sum, s) => sum + (s.pointsAwarded || 0), 0);
  const completionPercentage = challenges.length > 0 ? (completedActions / challenges.length) * 100 : 0;

  // Get status badge for submission
  const getStatusBadge = (challengeId) => {
    const status = getSubmissionStatus(challengeId);
    if (!status) return null;

    const statusConfig = {
      'PENDING': { icon: 'clock', text: 'En validation', className: 'pending-validation' },
      'APPROVED': { icon: 'check-circle', text: 'Approuvé', className: 'approved' },
      'REJECTED': { icon: 'times-circle', text: 'Refusé', className: 'rejected' }
    };

    const config = statusConfig[status] || statusConfig['PENDING'];
    return (
      <div className={`completion-badge ${config.className}`}>
        <i className={`fas fa-${config.icon}`}></i>
        <span className="validation-text">{config.text}</span>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <section className="employee-actions">
        <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', color: 'var(--accent-color)' }}></i>
            <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Chargement des défis...</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="employee-actions">
        <div className="error-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <i className="fas fa-exclamation-triangle" style={{ fontSize: '48px', color: '#ef4444' }}></i>
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '16px', padding: '10px 20px', background: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Réessayer
          </button>
        </div>
      </section>
    );
  }

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
            Défis du Jour
          </h2>
          <div className="streak-badge">
            <i className="fas fa-leaf"></i>
            <span>{challenges.length} défis disponibles</span>
          </div>
        </div>
        <div className="actions-grid">
          {challenges.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <i className="fas fa-inbox" style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}></i>
              <p>Aucun défi disponible pour le moment</p>
            </div>
          ) : (
            challenges.map(challenge => {
              const submitted = isSubmitted(challenge.id);
              const status = getSubmissionStatus(challenge.id);
              return (
                <div
                  key={challenge.id}
                  className={`action-item ${submitted ? 'submitted' : ''} ${status === 'APPROVED' ? 'approved' : ''} ${status === 'REJECTED' ? 'rejected' : ''}`}
                  onClick={() => handleActionClick(challenge)}
                  style={{ cursor: submitted ? 'not-allowed' : 'pointer' }}
                >
                  <div className="action-checkbox">
                    <i className={`fas ${submitted ? (status === 'APPROVED' ? 'fa-check-circle' : status === 'REJECTED' ? 'fa-times-circle' : 'fa-clock') : 'fa-circle'}`}></i>
                  </div>
                  <div className="action-content">
                    <div className="action-title">{challenge.title}</div>
                    <div className="action-points">
                      <i className="fas fa-coins"></i>
                      +{challenge.pointsReward} points
                    </div>
                    <div className="action-category" style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      <i className={`fas fa-${getCategoryIcon(challenge.category)}`} style={{ marginRight: '4px' }}></i>
                      {challenge.category}
                    </div>
                  </div>
                  {getStatusBadge(challenge.id)}
                </div>
              );
            })
          )}
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
              <span className="stat-value">{completedActions}/{challenges.length}</span>
              <span className="stat-label">Défis</span>
            </div>
          </div>
          <div className="progress-stat">
            <i className="fas fa-coins"></i>
            <div>
              <span className="stat-value">+{totalPoints}</span>
              <span className="stat-label">Points gagnés</span>
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
                    +{selectedAction?.pointsReward} points
                  </div>
                </div>
              </div>

              <div className="proof-instructions">
                <i className="fas fa-camera"></i>
                <p>{selectedAction?.description || 'Veuillez joindre une photo comme preuve de votre action'}</p>
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
