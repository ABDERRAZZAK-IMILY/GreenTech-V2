import React, { useState } from 'react';
import { useTransportMap } from '../../../hooks/useTransportMap';
import { showNotification } from '../../../utils/notifications';
import { vehicleDataService } from '../../../services/smartDataService';
import DriverList from '../../../components/Transport/DriverList';

const TransportTab = () => {
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentDriverId, setCurrentDriverId] = useState(null);
  const [deleteDriverName, setDeleteDriverName] = useState('');
  const [editDriverData, setEditDriverData] = useState({
    id: '',
    name: '',
    vehicleType: '',
    plate: ''
  });

  const { mapRef, markersRef, vehicleCounterRef, addDriverMarker } = useTransportMap();

  const toggleTransportOverview = () => {
    setIsOverviewOpen(!isOverviewOpen);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
  };

  const updateDriver = (event) => {
    event.preventDefault();

    const driverId = editDriverData.id;
    const name = editDriverData.name;
    const vehicleType = editDriverData.vehicleType;
    const plate = editDriverData.plate;

    // Vehicle icon mapping
    const vehicleIcons = {
      'Camionnette': '🚐',
      'Voiture': '🚗',
      'Camion': '🚚',
      'Utilitaire': '🚙',
      'Moto': '🏍️'
    };
    const newIcon = vehicleIcons[vehicleType] || '🚗';

    // Update driver card
    const driverCard = document.querySelector(`[data-driver-id="${driverId}"]`);
    if (driverCard) {
      driverCard.querySelector('.driver-info h5').textContent = name;
      driverCard.querySelector('.vehicle-name').textContent = `${vehicleType} - ${plate}`;
    }

    // Update marker on map
    if (markersRef.current[driverId] && mapRef.current) {
      const marker = markersRef.current[driverId];
      const latLng = marker.getLatLng();
      const status = driverCard?.querySelector('.driver-status')?.classList.contains('status-moving') ? 'moving' : 'parked';

      // Remove old marker
      mapRef.current.removeLayer(marker);

      // Create new icon with updated vehicle type
      const iconHtml = `
        <div style="
          background: ${status === 'moving' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)'};
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          position: relative;
        ">
          <span style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 20px;
            line-height: 1;
          ">${newIcon}</span>
        </div>
      `;

      const customIcon = window.L.divIcon({
        html: iconHtml,
        className: 'custom-marker-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      // Get driver stats from card
      const distance = driverCard?.querySelector('.driver-stat .stat-value')?.textContent || '0 km';
      const fuel = driverCard?.querySelectorAll('.driver-stat .stat-value')[1]?.textContent || '0 L';
      const co2 = driverCard?.querySelectorAll('.driver-stat .stat-value')[2]?.textContent || '0 kg';
      const destination = driverCard?.querySelectorAll('.driver-stat .stat-value')[4]?.textContent || 'Position inconnue';

      const popupContent = `
        <div style="min-width: 200px;">
          <h4 style="margin: 0 0 10px 0; color: #667eea;"><i class="fas fa-user"></i> ${name}</h4>
          <p style="margin: 5px 0; font-size: 13px;"><i class="fas fa-car" style="margin-right: 6px; color: #667eea;"></i><strong>Véhicule:</strong> ${vehicleType} - ${plate}</p>
          <p style="margin: 5px 0; font-size: 13px;"><i class="fas fa-circle" style="margin-right: 6px; color: ${status === 'moving' ? '#43e97b' : '#95a5a6'};"></i><strong>Statut:</strong> ${status === 'moving' ? 'En route' : 'Stationné'}</p>
          <p style="margin: 5px 0; font-size: 13px;"><i class="fas fa-road" style="margin-right: 6px; color: #667eea;"></i><strong>Distance:</strong> ${distance}</p>
          <p style="margin: 5px 0; font-size: 13px;"><i class="fas fa-gas-pump" style="margin-right: 6px; color: #f59e0b;"></i><strong>Carburant:</strong> ${fuel}</p>
          <p style="margin: 5px 0; font-size: 13px;"><i class="fas fa-leaf" style="margin-right: 6px; color: #43e97b;"></i><strong>CO2:</strong> ${co2}</p>
          <p style="margin: 5px 0; font-size: 13px;"><i class="fas fa-map-marker-alt" style="margin-right: 6px; color: #f5576c;"></i><strong>Destination:</strong> ${destination}</p>
        </div>
      `;

      // Create new marker with updated icon
      const newMarker = window.L.marker([latLng.lat, latLng.lng], { icon: customIcon })
        .addTo(mapRef.current)
        .bindPopup(popupContent, {
          maxWidth: 300,
          className: 'custom-popup'
        });

      // Update marker reference
      markersRef.current[driverId] = newMarker;
    }

    closeEditModal();
    showNotification(`Chauffeur ${name} modifié avec succès !`, 'success');
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setCurrentDriverId(null);
  };

  const confirmDeleteDriver = () => {
    const driverCard = document.querySelector(`[data-driver-id="${currentDriverId}"]`);
    const driverName = driverCard ? driverCard.querySelector('.driver-info h5').textContent : '';

    if (driverCard) {
      driverCard.style.opacity = '0';
      driverCard.style.transform = 'scale(0.8)';
      driverCard.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        driverCard.remove();
      }, 300);
    }

    // Remove marker from map
    if (markersRef.current[currentDriverId]) {
      mapRef.current.removeLayer(markersRef.current[currentDriverId]);
      delete markersRef.current[currentDriverId];
      console.log(`Marker ${currentDriverId} removed from map`);
    }

    closeDeleteModal();
    showNotification(`Chauffeur ${driverName} supprimé avec succès`, 'success');
  };

  const handleSubmitTransportData = async (event) => {
    event.preventDefault();

    const driver = document.getElementById('transportDriver').value;
    const vehicleType = document.getElementById('transportVehicleType').value;
    const plate = document.getElementById('transportPlate').value;
    const fuel = document.getElementById('transportFuel').value;
    const destination = document.getElementById('transportDestination').value;
    const status = document.getElementById('transportStatus').value;
    const latitude = document.getElementById('transportLatitude').value;
    const longitude = document.getElementById('transportLongitude').value;

    // Validate latitude and longitude
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      showNotification('Latitude doit être entre -90 et 90', 'error');
      return;
    }

    if (isNaN(lon) || lon < -180 || lon > 180) {
      showNotification('Longitude doit être entre -180 et 180', 'error');
      return;
    }

    try {
      // Submit to backend
      const payload = {
        vehicleId: plate,
        latitude: lat,
        longitude: lon
      };

      await vehicleDataService.submitManualData(payload);

      // Add row to history table
      const tableBody = document.getElementById('transportHistoryTableBody');
      const now = new Date();
      const dateTime = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR');

      const newRow = document.createElement('tr');
      newRow.innerHTML = `
        <td>${dateTime}</td>
        <td>${driver}</td>
        <td>${vehicleType}</td>
        <td>${plate}</td>
        <td>${fuel}</td>
        <td>${destination}</td>
        <td><span class="status-badge status-${status}">${status === 'moving' ? 'En route' : 'Stationné'}</span></td>
      `;

      tableBody.insertBefore(newRow, tableBody.firstChild);

      // Reset form
      event.target.reset();

      showNotification('Données de transport enregistrées avec succès !', 'success');
    } catch (error) {
      console.error('Error submitting transport data:', error);
      showNotification('Erreur lors de l\'enregistrement des données', 'error');
    }
  };

  return (
    <div id="sensor-transport-content">
      <h3>
        <i className="fas fa-map-marked-alt" /> Suivi en Temps Réel des Véhicules
      </h3>

      {/* Transport Overview by Vehicle Type (Collapsible) */}
      <div className="gas-overview-collapsible">
        <div className={`collapsible-header ${isOverviewOpen ? 'active' : ''}`} onClick={toggleTransportOverview}>
          <h4>
            <i className="fas fa-chart-pie" /> Vue d'ensemble par type de véhicule
          </h4>
          <i className={`fas fa-chevron-${isOverviewOpen ? 'up' : 'down'}`} id="transportOverviewChevron" />
        </div>
        <div className={`collapsible-content ${isOverviewOpen ? 'active' : ''}`} id="transportOverviewContent">
          <div className="gas-overview-table-container">
            <table className="gas-overview-table">
              <thead>
                <tr>
                  <th style={{
                    background: 'rgba(30, 58, 138, 0.6)',
                    color: 'white',
                    padding: '16px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    letterSpacing: '1px'
                  }}>
                    <i className="fas fa-car" style={{ marginRight: '8px' }} />
                    Type de véhicule
                  </th>
                  <th style={{
                    background: 'rgba(30, 58, 138, 0.6)',
                    color: 'white',
                    padding: '16px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    letterSpacing: '1px'
                  }}>
                    <i className="fas fa-users" style={{ marginRight: '8px' }} />
                    Nombre actifs
                  </th>
                  <th style={{
                    background: 'rgba(30, 58, 138, 0.6)',
                    color: 'white',
                    padding: '16px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    letterSpacing: '1px'
                  }}>
                    <i className="fas fa-road" style={{ marginRight: '8px' }} />
                    Distance totale
                  </th>
                  <th style={{
                    background: 'rgba(30, 58, 138, 0.6)',
                    color: 'white',
                    padding: '16px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    letterSpacing: '1px'
                  }}>
                    <i className="fas fa-gas-pump" style={{ marginRight: '8px' }} />
                    Carburant total
                  </th>
                  <th style={{
                    background: 'rgba(30, 58, 138, 0.6)',
                    color: 'white',
                    padding: '16px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    letterSpacing: '1px'
                  }}>
                    <i className="fas fa-leaf" style={{ marginRight: '8px' }} />
                    Émissions CO2 totales
                  </th>
                  <th style={{
                    background: 'rgba(30, 58, 138, 0.6)',
                    color: 'white',
                    padding: '16px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    letterSpacing: '1px'
                  }}>
                    <i className="fas fa-clock" style={{ marginRight: '8px' }} />
                    Temps total
                  </th>
                </tr>
              </thead>
              <tbody id="transportOverviewTableBody">
                <tr>
                  <td>
                    <span style={{ marginRight: '8px', fontSize: '18px', filter: 'hue-rotate(200deg)' }}>🚐</span>
                    <strong>Camionnette</strong>
                  </td>
                  <td>0 véhicules</td>
                  <td>0.0 km</td>
                  <td>0.0 L</td>
                  <td>
                    <span style={{
                      background: 'rgba(202, 138, 4, 0.2)',
                      color: '#ca8a04',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      0.0 kg CO2
                    </span>
                  </td>
                  <td>0min</td>
                </tr>
                <tr>
                  <td>
                    <span style={{ marginRight: '8px', fontSize: '18px', filter: 'hue-rotate(80deg)' }}>🚗</span>
                    <strong>Voiture</strong>
                  </td>
                  <td>2 véhicules</td>
                  <td>68.0 km</td>
                  <td>6.8 L</td>
                  <td>
                    <span style={{
                      background: 'rgba(202, 138, 4, 0.2)',
                      color: '#ca8a04',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      16.0 kg CO2
                    </span>
                  </td>
                  <td>3h 00min</td>
                </tr>
                <tr>
                  <td>
                    <span style={{ marginRight: '8px', fontSize: '18px' }}>🚚</span>
                    <strong>Camion</strong>
                  </td>
                  <td>1 véhicules</td>
                  <td>89.0 km</td>
                  <td>8.9 L</td>
                  <td>
                    <span style={{
                      background: 'rgba(202, 138, 4, 0.2)',
                      color: '#ca8a04',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      21.0 kg CO2
                    </span>
                  </td>
                  <td>4h 20min</td>
                </tr>
                <tr>
                  <td>
                    <span style={{ marginRight: '8px', fontSize: '18px', filter: 'hue-rotate(260deg)' }}>🚙</span>
                    <strong>Utilitaire</strong>
                  </td>
                  <td>1 véhicules</td>
                  <td>23.0 km</td>
                  <td>2.3 L</td>
                  <td>
                    <span style={{
                      background: 'rgba(202, 138, 4, 0.2)',
                      color: '#ca8a04',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      5.4 kg CO2
                    </span>
                  </td>
                  <td>1h 10min</td>
                </tr>
                <tr>
                  <td>
                    <span style={{ marginRight: '8px', fontSize: '18px', filter: 'hue-rotate(320deg)' }}>🏍️</span>
                    <strong>Moto</strong>
                  </td>
                  <td>0 véhicules</td>
                  <td>0.0 km</td>
                  <td>0.0 L</td>
                  <td>
                    <span style={{
                      background: 'rgba(202, 138, 4, 0.2)',
                      color: '#ca8a04',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      0.0 kg CO2
                    </span>
                  </td>
                  <td>0min</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transport Stats */}
      <div className="transport-stats-grid">
        <div className="transport-stat-card">
          <div
            className="stat-icon"
            style={{
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
            }}
          >
            <i className="fas fa-car" />
          </div>
          <div className="stat-content">
            <h4>Véhicules Actifs</h4>
            <div className="stat-value">3/5</div>
            <div className="stat-label">En déplacement</div>
          </div>
        </div>
        <div className="transport-stat-card">
          <div
            className="stat-icon"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            }}
          >
            <i className="fas fa-road" />
          </div>
          <div className="stat-content">
            <h4>Distance total Aujourd'hui</h4>
            <div className="stat-value">247 km</div>
            <div className="stat-label">Tous véhicules</div>
          </div>
        </div>
        <div className="transport-stat-card">
          <div
            className="stat-icon"
            style={{
              background: "linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)"
            }}
          >
            <i className="fas fa-gas-pump" />
          </div>
          <div className="stat-content">
            <h4>Carburant total</h4>
            <div className="stat-value">24.7 L</div>
            <div className="stat-label">Consommé aujourd'hui</div>
          </div>
        </div>
        <div className="transport-stat-card">
          <div
            className="stat-icon"
            style={{
              background: "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)"
            }}
          >
            <i className="fas fa-leaf" />
          </div>
          <div className="stat-content">
            <h4>Émissions totales CO2</h4>
            <div className="stat-value">58.2 kg</div>
            <div className="stat-label">Aujourd'hui</div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="transport-map-container">
        <div
          id="transportMap"
          style={{
            height: 500,
            width: "100%",
            borderRadius: 15
          }}
        />
      </div>

      {/* Drivers List */}
      <DriverList/>

      {/* Manual Entry for Transport */}
      <div className="manual-entry-section">
        <h4>
          <i className="fas fa-keyboard" /> Saisie Manuelle - Transport
        </h4>
        <form
          className="manual-transport-form"
          onSubmit={handleSubmitTransportData}
        >
          <div className="form-row">
            <div className="form-group">
              <label>Nom du chauffeur</label>
              <input
                type="text"
                id="transportDriver"
                placeholder="Ex: Ahmed Benali"
                required
              />
            </div>
            <div className="form-group">
              <label>Type de véhicule</label>
              <select id="transportVehicleType" required>
                <option value="">Sélectionner le type</option>
                <option value="Camionnette">Camionnette</option>
                <option value="Voiture">Voiture</option>
                <option value="Camion">Camion</option>
                <option value="Utilitaire">Utilitaire</option>
                <option value="Moto">Moto</option>
              </select>
            </div>
            <div className="form-group">
              <label>Immatriculation</label>
              <input
                type="text"
                id="transportPlate"
                placeholder="Ex: MAR-1234"
                required
              />
            </div>
            <div className="form-group">
              <label>Carburant consommé (L)</label>
              <input
                type="number"
                id="transportFuel"
                placeholder="Ex: 5.2"
                min={0}
                step="0.1"
                required
              />
            </div>
            <div className="form-group">
              <label>Position actuelle</label>
              <input
                type="text"
                id="transportDestination"
                placeholder="Ex: Zone Industrielle"
                required
              />
            </div>
            <div className="form-group">
              <label>Latitude</label>
              <input
                type="number"
                id="transportLatitude"
                placeholder="Ex: 33.5731"
                step="any"
                required
              />
            </div>
            <div className="form-group">
              <label>Longitude</label>
              <input
                type="number"
                id="transportLongitude"
                placeholder="Ex: -7.5898"
                step="any"
                required
              />
            </div>
            <div className="form-group">
              <label>Statut</label>
              <select id="transportStatus" required>
                <option value="moving">En route</option>
                <option value="parked">Stationné</option>
              </select>
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button type="submit" className="btn-submit-manual">
              <i className="fas fa-check" /> Enregistrer
            </button>
          </div>
        </form>
      </div>

      {/* Transport Manual Entry History Table */}
      <div className="transport-history-section">
        <h4>
          <i className="fas fa-history" /> Historique des Trajets
        </h4>
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Date &amp; Heure</th>
                <th>Chauffeur</th>
                <th>Véhicule</th>
                <th>Immatriculation</th>
                <th>Carburant (L)</th>
                <th>Position actuelle</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody id="transportHistoryTableBody">
              {/* Rows will be added dynamically */}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Driver Modal */}
      {showDeleteModal && (
        <div className="modal" style={{display: 'block'}} onClick={closeDeleteModal}>
          <div className="modal-content" style={{maxWidth: '500px'}} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fas fa-exclamation-triangle" style={{color: '#ef4444'}}></i> Confirmer la suppression</h3>
              <button className="modal-close" onClick={closeDeleteModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body" style={{padding: '20px 30px'}}>
              <p style={{color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '25px'}}>
                Êtes-vous sûr de vouloir supprimer le chauffeur <strong style={{color: 'var(--accent-color)'}}>{deleteDriverName}</strong> ?
              </p>
              <p style={{color: '#ef4444', fontSize: '0.9rem', marginBottom: '25px'}}>
                <i className="fas fa-exclamation-circle"></i> Cette action est irréversible.
              </p>
              <div style={{display: 'flex', gap: '15px', justifyContent: 'center'}}>
                <button className="btn-cancel-modal" onClick={closeDeleteModal}>
                  <i className="fas fa-times"></i> Annuler
                </button>
                <button className="btn-delete" onClick={confirmDeleteDriver}>
                  <i className="fas fa-trash"></i> Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TransportTab;
