import React, { useState, useEffect } from 'react';
import { showNotification } from '../../../utils/notifications';
import { energyDataService } from '../../../services/smartDataService';


const EnergyTab = () => {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('production');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSensorId, setCurrentSensorId] = useState(null);
  const [currentEquipments, setCurrentEquipments] = useState([]);

  // Form state for adding new sensor
  const [newSensorForm, setNewSensorForm] = useState({
    location: '',
    sensorId: '',
    macAddress: '',
    status: 'ONLINE',
    co2Impact: 0
  });

  // Equipment types configuration for each department
  const equipmentTypesConfig = {
    'production': ['Machine CNC #1', 'Machine CNC #2', 'Compresseur', 'Tour', 'Fraiseuse'],
    'bureaux': ['Climatisation', 'Ordinateurs', 'Éclairage', 'Serveurs', 'Imprimantes'],
    'entrepot': ['Chariots élévateurs', 'Éclairage', 'Ventilation', 'Portes automatiques'],
    'cafeteria': ['Four', 'Réfrigérateur', 'Micro-ondes', 'Cafetière', 'Lave-vaisselle']
  };

  // Fetch energy data from backend
  const fetchEnergyData = async () => {
    try {
      const response = await energyDataService.getMetrics('ENERGY');
      setSensors(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching energy data:", error);
      setLoading(false);
    }
  };

  // Initialize filter and equipments on component mount
  useEffect(() => {
    fetchEnergyData(); // Initial fetch
    const interval = setInterval(fetchEnergyData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Initialize filter and equipments on component mount
  useEffect(() => {
    // Apply initial filter to show only production sensors
    const allSensors = document.querySelectorAll('.energy-sensor');
    allSensors.forEach(sensor => {
      if (sensor.getAttribute('data-dept') === 'production') {
        sensor.style.display = '';
      } else {
        sensor.style.display = 'none';
      }
    });

    // Update the department display for manual entry
    updateDeptDisplay('production');

    // Load initial equipments for production
    setCurrentEquipments(equipmentTypesConfig['production']);
  }, []);

  // Update equipments when activeFilter changes
  useEffect(() => {
    setCurrentEquipments(equipmentTypesConfig[activeFilter] || []);
  }, [activeFilter]);

  const toggleEnergyOverview = () => {
    setIsOverviewOpen(!isOverviewOpen);
  };

  const filterEnergySensors = (dept) => {
    setActiveFilter(dept);
    // Filter sensor cards based on department
    const allSensors = document.querySelectorAll('.energy-sensor');
    allSensors.forEach(sensor => {
      if (sensor.getAttribute('data-dept') === dept) {
        sensor.style.display = '';
      } else {
        sensor.style.display = 'none';
      }
    });

    // Update department name in equipment section
    updateDeptDisplay(dept);
  };

  const updateDeptDisplay = (dept) => {
    const deptNames = {
      production: 'Production',
      bureaux: 'Bureaux',
      entrepot: 'Entrepôt',
      cafeteria: 'Cafétéria'
    };

    // Update the title in equipment management
    const currentDeptName = document.getElementById('currentDeptName');
    if (currentDeptName) {
      currentDeptName.textContent = deptNames[dept] || dept;
    }

    // Update manual entry form fields
    const deptManual = document.getElementById('deptManual');
    const deptDisplay = document.getElementById('deptDisplay');
    if (deptManual && deptDisplay) {
      deptManual.value = dept;
      deptDisplay.value = deptNames[dept] || dept;
    }
  };

  const addEquipment = () => {
    const input = document.getElementById('newEquipmentInput');
    const equipmentText = input.value.trim();

    if (!equipmentText) {
      showNotification('Veuillez entrer un équipement', 'error');
      return;
    }

    // Check if already exists
    if (currentEquipments.includes(equipmentText)) {
      showNotification('Cet équipement existe déjà', 'error');
      return;
    }

    // Add to current equipments
    setCurrentEquipments([...currentEquipments, equipmentText]);

    // Clear input
    input.value = '';
    showNotification(`Équipement "${equipmentText}" ajouté`, 'success');
  };

  const deleteEquipment = (index) => {
    const deletedEquipment = currentEquipments[index];
    const newEquipments = currentEquipments.filter((_, i) => i !== index);
    setCurrentEquipments(newEquipments);
    showNotification(`Équipement "${deletedEquipment}" supprimé`, 'info');
  };

  const submitEnergyManualData = async (event) => {
    event.preventDefault();

    const dept = document.getElementById('deptManual').value;
    const deptDisplay = document.getElementById('deptDisplay').value;
    const consumption = document.getElementById('energyConsumption').value;

    if (!dept) {
      showNotification('Veuillez sélectionner un département via les boutons ci-dessus', 'warning');
      return;
    }

    try {
      // Submit to backend
      const payload = {
        energyConsumed: parseFloat(consumption),
        macAddress: 'MANUAL_ENTRY'
      };

      await energyDataService.submitManualData(payload);

      // Get current date and time
      const now = new Date();
      const dateStr = now.toLocaleDateString('fr-FR');
      const timeStr = now.toLocaleTimeString('fr-FR');

      // Add to history table
      const tableBody = document.getElementById('energyHistoryTableBody');
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
        <td>${dateStr} ${timeStr}</td>
        <td>${deptDisplay}</td>
        <td>${consumption}</td>
      `;

      tableBody.insertBefore(newRow, tableBody.firstChild);

      // Reset form
      event.target.reset();
      // Re-apply the dept after reset
      updateDeptDisplay(activeFilter);

      showNotification('Données d\'énergie enregistrées avec succès !', 'success');
    } catch (error) {
      console.error('Error submitting energy data:', error);
      showNotification('Erreur lors de l\'enregistrement des données', 'error');
    }
  };

  const viewSensorDetails = (sensorId) => {
    setCurrentSensorId(sensorId);
    setShowDetailsModal(true);
  };

  const configureSensor = (sensorId) => {
    setCurrentSensorId(sensorId);
    setShowConfigModal(true);
  };

  const deleteSensor = (sensorId) => {
    setCurrentSensorId(sensorId);
    setShowDeleteModal(true);
  };

  const confirmDeleteSensor = () => {
    const sensorCard = document.querySelector(`[data-sensor-id="${currentSensorId}"]`);
    if (sensorCard) {
      sensorCard.style.opacity = '0';
      sensorCard.style.transform = 'scale(0.8)';
      setTimeout(() => sensorCard.remove(), 300);
    }
    showNotification(`Capteur ${currentSensorId} supprimé avec succès`, 'success');
    setShowDeleteModal(false);
    setCurrentSensorId(null);
  };

  const openAddSensorModal = () => {
    // Generate sensor counter if not exists
    const sensorCounter = sensors.length + 1;
    const newSensorId = `ESP32-ENERGY-${String(sensorCounter).padStart(3, '0')}`;
    
    setNewSensorForm({
      location: '',
      sensorId: newSensorId,
      macAddress: '',
      status: 'ONLINE',
      co2Impact: 0
    });
    setShowAddModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowDetailsModal(false);
    setShowConfigModal(false);
    setShowDeleteModal(false);
    setCurrentSensorId(null);
  };

  const handleAddSensor = async (event) => {
    event.preventDefault();

    try {
      // Prepare data for backend
      const monitorData = {
        location: newSensorForm.location,
        sensorId: newSensorForm.sensorId,
        macAddress: newSensorForm.macAddress,
        status: newSensorForm.status,
        co2Impact: parseFloat(newSensorForm.co2Impact) || 0,
        energyReadings: []
      };

      // Send to backend
      const response = await energyDataService.createMonitor(monitorData);
      
      console.log('Energy Monitor created:', response.data);

      // Refresh sensors list
      fetchEnergyData();

      showNotification('Capteur ajouté avec succès !', 'success');
      closeModals();
    } catch (error) {
      console.error('Error adding energy sensor:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'ajout du capteur';
      showNotification(errorMessage, 'error');
    }
  };

  const handleUpdateSensor = (event) => {
    event.preventDefault();
    // Logic for updating sensor
    showNotification('Capteur mis à jour avec succès !', 'success');
    closeModals();
  };

  return (
    <div id="sensor-energy-content">
      <div className="sensors-section-header">
        <h3>
          <i className="fas fa-bolt" /> Capteurs Électricité (SCT013)
        </h3>
        <button className="btn-add-sensor" onClick={openAddSensorModal}>
          <i className="fas fa-plus" /> Ajouter un capteur
        </button>
      </div>

      {/* Energy Overview by Department (Collapsible) */}
      <div className="gas-overview-collapsible">
        <div className={`collapsible-header ${isOverviewOpen ? 'active' : ''}`} onClick={toggleEnergyOverview}>
          <h4>
            <i className="fas fa-chart-pie" /> Vue d'ensemble par département
          </h4>
          <i className={`fas fa-chevron-${isOverviewOpen ? 'up' : 'down'}`} id="energyOverviewChevron" />
        </div>
        <div className={`collapsible-content ${isOverviewOpen ? 'active' : ''}`} id="energyOverviewContent">
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
                    <i className="fas fa-building" style={{ marginRight: '8px' }} />
                    Département
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
                    <i className="fas fa-broadcast-tower" style={{ marginRight: '8px' }} />
                    Capteurs actifs
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
                    <i className="fas fa-bolt" style={{ marginRight: '8px' }} />
                    Consommation totale
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
                </tr>
              </thead>
              <tbody id="energyOverviewTableBody">
                <tr>
                  <td>
                    <div className="usage-icon">
                      <i className="fas fa-industry" style={{ color: '#3b82f6' }} />
                      Production
                    </div>
                  </td>
                  <td><strong>3/3</strong> capteurs</td>
                  <td><strong>345.6 kWh</strong></td>
                  <td><span className="status-badge status-partial">172.8 kg CO2</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="usage-icon">
                      <i className="fas fa-building" style={{ color: '#22c55e' }} />
                      Bureaux
                    </div>
                  </td>
                  <td><strong>3/3</strong> capteurs</td>
                  <td><strong>156.0 kWh</strong></td>
                  <td><span className="status-badge status-partial">78.0 kg CO2</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="usage-icon">
                      <i className="fas fa-warehouse" style={{ color: '#f59e0b' }} />
                      Entrepôt
                    </div>
                  </td>
                  <td><strong>3/3</strong> capteurs</td>
                  <td><strong>201.6 kWh</strong></td>
                  <td><span className="status-badge status-partial">100.8 kg CO2</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="usage-icon">
                      <i className="fas fa-utensils" style={{ color: '#a855f7' }} />
                      Cafétéria
                    </div>
                  </td>
                  <td><strong>3/3</strong> capteurs</td>
                  <td><strong>124.8 kWh</strong></td>
                  <td><span className="status-badge status-partial">62.4 kg CO2</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Department Filter */}
      <div className="department-filter">
        <button
          className={`filter-btn ${activeFilter === 'production' ? 'active' : ''}`}
          data-dept="production"
          onClick={() => filterEnergySensors('production')}
        >
          <i className="fas fa-industry" /> Production
        </button>
        <button
          className={`filter-btn ${activeFilter === 'bureaux' ? 'active' : ''}`}
          data-dept="bureaux"
          onClick={() => filterEnergySensors('bureaux')}
        >
          <i className="fas fa-building" /> Bureaux
        </button>
        <button
          className={`filter-btn ${activeFilter === 'entrepot' ? 'active' : ''}`}
          data-dept="entrepot"
          onClick={() => filterEnergySensors('entrepot')}
        >
          <i className="fas fa-warehouse" /> Entrepôt
        </button>
        <button
          className={`filter-btn ${activeFilter === 'cafeteria' ? 'active' : ''}`}
          data-dept="cafeteria"
          onClick={() => filterEnergySensors('cafeteria')}
        >
          <i className="fas fa-utensils" /> Cafétéria
        </button>
      </div>

      {/* Energy Stats */}
      <div className="transport-stats-grid">
        <div className="transport-stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <i className="fas fa-plug" />
          </div>
          <div className="stat-content">
            <h4>Capteurs Actifs</h4>
            <div className="stat-value" id="energyActiveSensors">12/12</div>
            <div className="stat-label">En ligne</div>
          </div>
        </div>

        <div className="transport-stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <i className="fas fa-bolt" />
          </div>
          <div className="stat-content">
            <h4>Consommation Totale Aujourd'hui</h4>
            <div className="stat-value" id="energyTotalConsumption">828 kWh</div>
            <div className="stat-label">Tous départements</div>
          </div>
        </div>

        <div className="transport-stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)' }}>
            <i className="fas fa-chart-pie" />
          </div>
          <div className="stat-content">
            <h4>Département le Plus Consommateur</h4>
            <div className="stat-value" id="energyTopDept">Production</div>
            <div className="stat-label" id="energyTopDeptPercent">42%</div>
          </div>
        </div>

        <div className="transport-stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)' }}>
            <i className="fas fa-leaf" />
          </div>
          <div className="stat-content">
            <h4>Émissions Totales CO2</h4>
            <div className="stat-value" id="energyCO2Emissions">414 kg</div>
            <div className="stat-label">Aujourd'hui</div>
          </div>
        </div>
      </div>

      {/* Energy Sensors Grid */}
      <div className="sensors-grid-scroll">
        {loading ? (
          <div style={{ padding: '20px', color: 'white', textAlign: 'center' }}>
            Chargement...
          </div>
        ) : sensors.length === 0 ? (
          <div style={{ padding: '20px', color: 'white', textAlign: 'center' }}>
            Aucun capteur détecté. Vérifiez votre ESP32.
          </div>
        ) : (
          sensors.map((sensor, index) => (
            <div
              key={index}
              className="sensor-card sensor-online energy-sensor"
              data-sensor-id={sensor.sensorId || `SENSOR-${index}`}
              data-dept={sensor.location || 'production'}
            >
              <div className="sensor-header">
                <div className="sensor-name">
                  <i className="fas fa-bolt" />
                  <span>{sensor.sensorId || `ESP32-ELEC-${index + 1}`}</span>
                </div>
                <label className="sensor-toggle">
                  <input
                    type="checkbox"
                    defaultChecked
                    onChange={(e) => console.log('Toggle sensor:', e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
              <div className={`sensor-department ${sensor.location || 'production'}`}>
                <i className="fas fa-industry" />
                <span>{sensor.location || 'Production'}</span>
              </div>
              <div className="sensor-value">
                <span className="value">{sensor.value}</span>
                <span className="unit">{sensor.unit || 'kWh'}</span>
              </div>
              <div className="sensor-daily">
                <i className="fas fa-calendar-day" />
                <span>{(sensor.value * 24).toFixed(1)} {sensor.unit || 'kWh'}/jour</span>
              </div>
              <div className="sensor-status">
                <span className="status-badge online">
                  <i className="fas fa-circle" /> En ligne
                </span>
              </div>
              <div className="sensor-timestamp">
                {sensor.formattedTimestamp || 'Maintenant'}
              </div>
              <div className="sensor-actions">
                <button
                  className="btn-sensor-detail"
                  onClick={() => viewSensorDetails(sensor.sensorId || `SENSOR-${index}`)}
                >
                  <i className="fas fa-eye" /> Détails
                </button>
                <button
                  className="btn-sensor-config"
                  onClick={() => configureSensor(sensor.sensorId || `SENSOR-${index}`)}
                >
                  <i className="fas fa-cog" /> Modifier
                </button>
                <button
                  className="btn-sensor-delete"
                  onClick={() => deleteSensor(sensor.sensorId || `SENSOR-${index}`)}
                >
                  <i className="fas fa-trash" /> Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Equipment Management Card */}
      <div className="subtypes-management-section">
        <h4>
          <i className="fas fa-tools" /> Liste des Équipements Électriques existants -{" "}
          <span id="currentDeptName">Production</span>
        </h4>
        <div className="subtypes-card">
          <div className="subtypes-container" id="equipmentTypesContainer">
            {currentEquipments.map((equipment, index) => (
              <div key={index} className="subtype-tag" data-index={index}>
                <span className="subtype-tag-text">{equipment}</span>
                <span
                  className="subtype-tag-delete"
                  onClick={() => deleteEquipment(index)}
                >
                  ×
                </span>
              </div>
            ))}
          </div>
          <div className="add-subtype-input">
            <input
              type="text"
              id="newEquipmentInput"
              placeholder="Ajouter un équipement (ex: Four industriel)"
              maxLength={50}
            />
            <button
              type="button"
              className="btn-add-subtype"
              onClick={addEquipment}
            >
              <i className="fas fa-plus" />
            </button>
          </div>
        </div>
      </div>

      {/* Manual Entry for Energy */}
      <div className="manual-entry-section">
        <h4>
          <i className="fas fa-keyboard" /> Saisie Manuelle - Énergie
        </h4>
        <form
          className="manual-waste-form"
          onSubmit={submitEnergyManualData}
        >
          <input type="hidden" id="deptManual" required />
          <div className="form-row">
            <div className="form-group">
              <label>Département</label>
              <input
                type="text"
                id="deptDisplay"
                readOnly
                style={{ cursor: 'not-allowed', background: 'rgba(255, 255, 255, 0.03)' }}
                placeholder="Sélectionnez un département via les boutons ci-dessus"
              />
            </div>
            <div className="form-group">
              <label>Consommation (kWh)</label>
              <input
                type="number"
                id="energyConsumption"
                placeholder="Ex: 125.5"
                min="0"
                step="0.1"
                required
              />
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button type="submit" className="btn-submit-manual">
              <i className="fas fa-check" /> Enregistrer
            </button>
          </div>
        </form>
      </div>

      {/* Energy Manual Entry History Table */}
      <div className="waste-history-section">
        <h4>
          <i className="fas fa-history" /> Historique des Saisies
        </h4>
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Date & Heure</th>
                <th>Département</th>
                <th>Consommation (kWh)</th>
              </tr>
            </thead>
            <tbody id="energyHistoryTableBody">
              {/* Rows will be added dynamically */}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Sensor Modal */}
      {showAddModal && (
        <div id="addSensorModal" className="modal" style={{display: 'block'}} onClick={closeModals}>
          <div className="modal-content" style={{maxWidth: '600px'}} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fas fa-plus-circle" /> Ajouter un Nouveau Capteur</h3>
              <button className="modal-close" onClick={closeModals}>
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="modal-body">
              <form id="addSensorForm" onSubmit={handleAddSensor}>
                <div className="form-group">
                  <label htmlFor="sensorId">ID du capteur</label>
                  <input 
                    type="text" 
                    id="sensorId"
                    value={newSensorForm.sensorId}
                    readOnly 
                    style={{cursor: 'not-allowed', background: 'rgba(255, 255, 255, 0.03)'}} 
                    required 
                  />
                  <small style={{color: 'rgba(255,255,255,0.5)', fontSize: '12px'}}>
                    Généré automatiquement
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="macAddress">
                    <i className="fas fa-wifi" /> Adresse MAC du Capteur ESP32
                  </label>
                  <input 
                    type="text" 
                    id="macAddress"
                    placeholder="Ex: AA:BB:CC:DD:EE:FF"
                    value={newSensorForm.macAddress}
                    onChange={(e) => setNewSensorForm({...newSensorForm, macAddress: e.target.value.toUpperCase()})}
                    pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
                    required 
                  />
                  <small style={{color: 'rgba(255,255,255,0.5)', fontSize: '12px'}}>
                    Format: XX:XX:XX:XX:XX:XX - Identifiant unique du capteur
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="location">
                    <i className="fas fa-map-marker-alt" /> Emplacement
                  </label>
                  <input 
                    type="text" 
                    id="location"
                    placeholder="Ex: Zone Production, Salle des Serveurs, etc."
                    value={newSensorForm.location}
                    onChange={(e) => setNewSensorForm({...newSensorForm, location: e.target.value})}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="co2Impact">
                    <i className="fas fa-leaf" /> Impact CO2 par kWh (kg)
                  </label>
                  <input 
                    type="number" 
                    id="co2Impact"
                    placeholder="Ex: 0.233"
                    step="0.001"
                    value={newSensorForm.co2Impact}
                    onChange={(e) => setNewSensorForm({...newSensorForm, co2Impact: e.target.value})}
                    required 
                  />
                  <small style={{color: 'rgba(255,255,255,0.5)', fontSize: '12px'}}>
                    Facteur d'émission CO2 (moyenne France: 0.0571 kg/kWh)
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Statut initial</label>
                  <select
                    id="status"
                    value={newSensorForm.status}
                    onChange={(e) => setNewSensorForm({...newSensorForm, status: e.target.value})}
                    style={{
                      padding: '10px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: 'white',
                      width: '100%'
                    }}
                    required
                  >
                    <option value="ONLINE">✅ Actif</option>
                    <option value="OFFLINE">⏸️ Inactif</option>
                  </select>
                </div>

                <div style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginTop: '15px'
                }}>
                  <div style={{display: 'flex', alignItems: 'flex-start', gap: '10px'}}>
                    <i className="fas fa-info-circle" style={{color: '#3b82f6', marginTop: '2px'}} />
                    <div style={{fontSize: '13px', color: 'rgba(255,255,255,0.8)'}}>
                      <strong>Note:</strong> L'adresse MAC doit correspondre exactement à celle de votre ESP32.
                      Vous pouvez la récupérer via <code>WiFi.macAddress()</code> dans le code Arduino.
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-cancel-modal" onClick={closeModals}>
                    <i className="fas fa-times" /> Annuler
                  </button>
                  <button type="submit" className="btn-submit">
                    <i className="fas fa-check" /> Ajouter le Capteur
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Sensor Details Modal */}
      {showDetailsModal && (
        <div id="sensorDetailsModal" className="modal" style={{display: 'block'}} onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fas fa-eye" /> Détails du Capteur</h3>
              <button className="modal-close" onClick={closeModals}>
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="sensor-details-content">
              <div className="detail-row">
                <span className="detail-label">Nom du capteur:</span>
                <span className="detail-value">{currentSensorId}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Type:</span>
                <span className="detail-value">Capteur Électricité (SCT013)</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Département:</span>
                <span className="detail-value">Production</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Statut:</span>
                <span className="detail-value">En ligne</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Puissance actuelle:</span>
                <span className="detail-value">1.2 kW</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Consommation journalière:</span>
                <span className="detail-value">28.8 kWh</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Dernière mise à jour:</span>
                <span className="detail-value">il y a 5s</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sensor Configuration Modal */}
      {showConfigModal && (
        <div id="sensorConfigModal" className="modal" style={{display: 'block'}} onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fas fa-cog" /> Configuration du Capteur</h3>
              <button className="modal-close" onClick={closeModals}>
                <i className="fas fa-times" />
              </button>
            </div>
            <form id="configSensorForm" onSubmit={handleUpdateSensor}>
              <div className="form-group">
                <label htmlFor="configSensorName">Nom du capteur</label>
                <input type="text" id="configSensorName" defaultValue={currentSensorId} readOnly required />
              </div>
              <div className="form-group">
                <label htmlFor="configSensorType">Type de capteur</label>
                <input type="text" id="configSensorType" defaultValue="Capteur Électricité (SCT013)" readOnly required />
              </div>
              <div className="form-group">
                <label htmlFor="configSensorThreshold">Seuil d'alerte (kW)</label>
                <input type="number" id="configSensorThreshold" placeholder="Ex: 5.0" step="0.1" />
              </div>
              <div className="config-actions">
                <button type="submit" className="btn-submit btn-update">
                  <i className="fas fa-save" /> Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Sensor Confirmation Modal */}
      {showDeleteModal && (
        <div id="deleteSensorModal" className="modal" style={{display: 'block'}} onClick={closeModals}>
          <div className="modal-content" style={{maxWidth: '500px'}} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fas fa-exclamation-triangle" style={{color: '#ef4444'}} /> Confirmer la suppression</h3>
              <button className="modal-close" onClick={closeModals}>
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="modal-body">
              <p style={{color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '20px', textAlign: 'center'}}>
                Êtes-vous sûr de vouloir supprimer le capteur <strong style={{color: 'var(--accent-color)'}}>{currentSensorId}</strong> ?
              </p>
              <p style={{color: '#ef4444', fontSize: '0.9rem', marginBottom: '20px', textAlign: 'center'}}>
                <i className="fas fa-exclamation-circle" /> Cette action est irréversible.
              </p>
              <div className="form-actions">
                <button className="btn-cancel-modal" onClick={closeModals}>
                  <i className="fas fa-times" /> Annuler
                </button>
                <button className="btn-delete" onClick={confirmDeleteSensor}>
                  <i className="fas fa-trash" /> Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnergyTab;
