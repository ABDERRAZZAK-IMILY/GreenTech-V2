import React, { useState, useEffect } from 'react';
import { showNotification } from '../../../utils/notifications';

import { trashDataService } from '../../../services/smartDataService';

const WasteTab = () => {
  const [sensors, setSensors] = useState([]);
  const [allMonitors, setAllMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [isIoTManagementOpen, setIsIoTManagementOpen] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSensorId, setCurrentSensorId] = useState(null);
  const [currentSensor, setCurrentSensor] = useState(null);
  const [currentSubtypes, setCurrentSubtypes] = useState([]);
  const [sensorCounter, setSensorCounter] = useState(13);

  // Form state for adding new sensor
  const [newSensorForm, setNewSensorForm] = useState({
    location: '',
    sensorId: '',
    macAddress: '',
    trashType: 'ORGANIC',
    status: 'ONLINE',
    co2Impact: 0
  });

  // Waste subtypes configuration
  const wasteSubtypesConfig = {
    'organic': ['Restes alimentaires', 'Épluchures', 'Marc de café', 'Thé', 'Fruits et légumes'],
    'recyclable': ['Papier', 'Carton', 'Plastique PET', 'Plastique PEHD', 'Verre', 'Métal', 'Aluminium'],
    'non-recyclable': ['Plastique mixte', 'Polystyrène', 'Emballages souillés', 'Mouchoirs', 'Couches'],
    'electronic': ['Ordinateurs', 'Téléphones', 'Écrans', 'Câbles', 'Batteries', 'Composants électroniques'],
    'dangerous': ['Piles', 'Batteries lithium', 'Produits chimiques', 'Peintures', 'Solvants', 'Néons']
  };

  // Calculate dynamic statistics
  const calculateStats = () => {
    const totalSensors = sensors.length;
    const onlineSensors = sensors.filter(s => s.status === 'ONLINE').length;
    const totalWeight = sensors.reduce((sum, s) => sum + (s.value || 0), 0);
    const totalCO2 = sensors.reduce((sum, s) => sum + ((s.value || 0) * (s.co2Impact || 0.5)), 0);

    // Find most produced type
    const typeWeights = {};
    sensors.forEach(s => {
      const type = s.wasteType || 'organic';
      typeWeights[type] = (typeWeights[type] || 0) + (s.value || 0);
    });

    let topType = 'organic';
    let topTypeWeight = 0;
    Object.entries(typeWeights).forEach(([type, weight]) => {
      if (weight > topTypeWeight) {
        topType = type;
        topTypeWeight = weight;
      }
    });

    const topTypePercent = totalWeight > 0 ? Math.round((topTypeWeight / totalWeight) * 100) : 0;

    return { totalSensors, onlineSensors, totalWeight, totalCO2, topType, topTypePercent };
  };

  const stats = calculateStats();

  // Calculate stats by waste type for overview table
  const calculateOverviewStats = () => {
    const types = ['organic', 'recyclable', 'non-recyclable', 'electronic', 'dangerous'];
    const co2Factors = {
      'organic': 0.5,
      'recyclable': 0.2,
      'non-recyclable': 1.5,
      'electronic': 2.0,
      'dangerous': 3.0
    };

    return types.map(type => {
      const typeSensors = sensors.filter(s => s.wasteType === type);
      const totalSensors = typeSensors.length;
      const onlineSensors = typeSensors.filter(s => s.status === 'ONLINE').length;
      const totalWeight = typeSensors.reduce((sum, s) => sum + (s.value || 0), 0);
      const totalCO2 = totalWeight * (co2Factors[type] || 0.5);

      return { type, totalSensors, onlineSensors, totalWeight, totalCO2 };
    });
  };

  const overviewStats = calculateOverviewStats();

  // Fetch waste data from backend
  const fetchWasteData = async () => {
    try {
      const response = await trashDataService.getMetrics('WASTE');
      setSensors(response.data);
      setAllMonitors(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching waste data:", error);
      setLoading(false);
    }
  };

  // Delete monitor from backend
  const handleDeleteMonitor = async (sensorId) => {
    try {
      const sensor = sensors.find(s => s.sensorId === sensorId);
      if (sensor && sensor.macAddress) {
        await trashDataService.deleteMonitor(sensor.macAddress);
        showNotification('Capteur supprimé avec succès', 'success');
        fetchWasteData(); // Refresh data
      }
    } catch (error) {
      console.error('Error deleting monitor:', error);
      showNotification('Erreur lors de la suppression du capteur', 'error');
    }
    setShowDeleteModal(false);
    setCurrentSensorId(null);
  };

  // Initialize filter and subtypes on component mount
  useEffect(() => {
    fetchWasteData(); // Initial fetch
    const interval = setInterval(fetchWasteData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Initialize filter and subtypes on component mount
  useEffect(() => {
    // Show all sensors by default
    const allSensors = document.querySelectorAll('.waste-sensor');
    allSensors.forEach(sensor => {
      sensor.style.display = '';
    });

    // Load initial subtypes for organic
    setCurrentSubtypes(wasteSubtypesConfig['organic']);
  }, []);

  // Update subtypes when activeFilter changes
  useEffect(() => {
    setCurrentSubtypes(wasteSubtypesConfig[activeFilter] || []);
  }, [activeFilter]);

  const toggleWasteOverview = () => {
    setIsOverviewOpen(!isOverviewOpen);
  };

  const filterWasteSensors = (wasteType) => {
    setActiveFilter(wasteType);
    // Filter sensor cards based on waste type
    const allSensors = document.querySelectorAll('.waste-sensor');
    allSensors.forEach(sensor => {
      if (wasteType === 'all' || sensor.getAttribute('data-waste-type') === wasteType) {
        sensor.style.display = '';  // Remove inline style to use default CSS
      } else {
        sensor.style.display = 'none';
      }
    });

    // Update waste type name in sub-types section
    if (wasteType !== 'all') {
      updateWasteTypeDisplay(wasteType);
    }
  };

  const updateWasteTypeDisplay = (wasteType) => {
    const typeNames = {
      organic: 'Organique',
      recyclable: 'Recyclable',
      'non-recyclable': 'Non-Recyclable',
      electronic: 'Électronique',
      dangerous: 'Dangereux'
    };

    // Update the title in sub-types management
    const currentWasteTypeName = document.getElementById('currentWasteTypeName');
    if (currentWasteTypeName) {
      currentWasteTypeName.textContent = typeNames[wasteType] || wasteType;
    }

    // Update manual entry form fields
    const wasteTypeManual = document.getElementById('wasteTypeManual');
    const wasteTypeDisplay = document.getElementById('wasteTypeDisplay');
    if (wasteTypeManual && wasteTypeDisplay) {
      wasteTypeManual.value = wasteType;
      wasteTypeDisplay.value = typeNames[wasteType] || wasteType;
    }
  };

  const addSubtype = () => {
    const input = document.getElementById('newSubtypeInput');
    const subtypeText = input.value.trim();

    if (!subtypeText) {
      showNotification('Veuillez entrer un sous-type', 'error');
      return;
    }

    // Check if already exists
    if (currentSubtypes.includes(subtypeText)) {
      showNotification('Ce sous-type existe déjà', 'error');
      return;
    }

    // Add to current subtypes
    setCurrentSubtypes([...currentSubtypes, subtypeText]);

    // Clear input
    input.value = '';
    showNotification(`Sous-type "${subtypeText}" ajouté`, 'success');
  };

  const deleteSubtype = (index) => {
    const deletedSubtype = currentSubtypes[index];
    const newSubtypes = currentSubtypes.filter((_, i) => i !== index);
    setCurrentSubtypes(newSubtypes);
    showNotification(`Sous-type "${deletedSubtype}" supprimé`, 'info');
  };

  const submitWasteManualData = async (event) => {
    event.preventDefault();

    const wasteType = document.getElementById('wasteTypeManual').value;
    const wasteTypeDisplay = document.getElementById('wasteTypeDisplay').value;
    const weight = document.getElementById('wasteWeight').value;

    if (!wasteType) {
      showNotification('Veuillez sélectionner un type de déchet via les boutons ci-dessus', 'warning');
      return;
    }

    try {
      // Submit to backend
      const payload = {
        weight: parseFloat(weight),
        macAddress: 'MANUAL_ENTRY'
      };

      await trashDataService.submitManualData(payload);

      // Get current date and time
      const now = new Date();
      const dateStr = now.toLocaleDateString('fr-FR');
      const timeStr = now.toLocaleTimeString('fr-FR');

      // Add to history table
      const tableBody = document.getElementById('wasteHistoryTableBody');
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
        <td>${dateStr} ${timeStr}</td>
        <td>${wasteTypeDisplay}</td>
        <td>${weight}</td>
      `;

      tableBody.insertBefore(newRow, tableBody.firstChild);

      // Reset form
      event.target.reset();
      // Re-apply the waste type after reset
      updateWasteTypeDisplay(activeFilter);

      showNotification('Données de déchet enregistrées avec succès !', 'success');
    } catch (error) {
      console.error('Error submitting waste data:', error);
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

  const confirmDeleteSensor = async () => {
    // Use the handleDeleteMonitor to delete from backend
    await handleDeleteMonitor(currentSensorId);
  };

  const openAddSensorModal = () => {
    // Generate new sensor ID
    const newSensorId = `ESP32-WASTE-${String(sensorCounter).padStart(3, '0')}`;

    // Map activeFilter to TrashType enum
    const trashTypeMap = {
      'organic': 'ORGANIC',
      'recyclable': 'RECYCLABLE',
      'non-recyclable': 'NON_RECYCLABLE',
      'electronic': 'ELECTRONIC',
      'dangerous': 'DANGEROUS'
    };

    setNewSensorForm({
      location: '',
      sensorId: newSensorId,
      macAddress: '',
      trashType: trashTypeMap[activeFilter] || 'ORGANIC',
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
        trashType: newSensorForm.trashType,
        status: newSensorForm.status,
        co2Impact: parseFloat(newSensorForm.co2Impact) || 0,
        trashLogs: []
      };

      // Send to backend
      const response = await trashDataService.createMonitor(monitorData);

      console.log('Monitor created:', response.data);

      // Increment counter for next sensor
      setSensorCounter(sensorCounter + 1);

      // Refresh sensors list
      fetchWasteData();

      showNotification('Capteur ajouté avec succès !', 'success');
      closeModals();
    } catch (error) {
      console.error('Error adding sensor:', error);
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
    <div id="sensor-waste-content">
      <div className="sensors-section-header">
        <h3>
          <i className="fas fa-weight" /> Capteurs de Poids Déchets (HX711)
        </h3>
        <button className="btn-add-sensor" onClick={openAddSensorModal}>
          <i className="fas fa-plus" /> Ajouter un capteur
        </button>
      </div>

      {/* Waste Overview by Type (Collapsible) */}
      <div className="gas-overview-collapsible">
        <div className={`collapsible-header ${isOverviewOpen ? 'active' : ''}`} onClick={toggleWasteOverview}>
          <h4>
            <i className="fas fa-chart-pie" /> Vue d'ensemble par type de déchet
          </h4>
          <i className={`fas fa-chevron-${isOverviewOpen ? 'up' : 'down'}`} id="wasteOverviewChevron" />
        </div>
        <div className={`collapsible-content ${isOverviewOpen ? 'active' : ''}`} id="wasteOverviewContent">
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
                    <i className="fas fa-trash-alt" style={{ marginRight: '8px' }} />
                    Type de déchet
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
                    <i className="fas fa-weight" style={{ marginRight: '8px' }} />
                    Poids total collecté
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
              <tbody id="wasteOverviewTableBody">
                {overviewStats.map((stat, index) => {
                  const typeConfig = {
                    'organic': { icon: 'fa-leaf', color: '#22c55e', name: 'Organique' },
                    'recyclable': { icon: 'fa-recycle', color: '#3b82f6', name: 'Recyclable' },
                    'non-recyclable': { icon: 'fa-trash', color: '#f59e0b', name: 'Non-Recyclable' },
                    'electronic': { icon: 'fa-laptop', color: '#a855f7', name: 'Électronique' },
                    'dangerous': { icon: 'fa-radiation-alt', color: '#ef4444', name: 'Dangereux' }
                  };
                  const config = typeConfig[stat.type] || typeConfig['organic'];

                  return (
                    <tr key={index}>
                      <td>
                        <div className="usage-icon">
                          <i className={`fas ${config.icon}`} style={{ color: config.color }} />
                          {config.name}
                        </div>
                      </td>
                      <td><strong>{stat.onlineSensors}/{stat.totalSensors}</strong> capteurs</td>
                      <td><strong>{stat.totalWeight.toFixed(1)} kg</strong></td>
                      <td><span className="status-badge status-partial">{stat.totalCO2.toFixed(1)} kg CO2</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Waste Type Filter */}
      <div className="waste-type-filter">
        <button
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          data-waste-type="all"
          onClick={() => filterWasteSensors('all')}
        >
          <i className="fas fa-th" /> Tous
        </button>
        <button
          className={`filter-btn ${activeFilter === 'organic' ? 'active' : ''}`}
          data-waste-type="organic"
          onClick={() => filterWasteSensors('organic')}
        >
          <i className="fas fa-leaf" /> Organique
        </button>
        <button
          className={`filter-btn ${activeFilter === 'recyclable' ? 'active' : ''}`}
          data-waste-type="recyclable"
          onClick={() => filterWasteSensors('recyclable')}
        >
          <i className="fas fa-recycle" /> Recyclable
        </button>
        <button
          className={`filter-btn ${activeFilter === 'non-recyclable' ? 'active' : ''}`}
          data-waste-type="non-recyclable"
          onClick={() => filterWasteSensors('non-recyclable')}
        >
          <i className="fas fa-trash" /> Non-Recyclable
        </button>
        <button
          className={`filter-btn ${activeFilter === 'electronic' ? 'active' : ''}`}
          data-waste-type="electronic"
          onClick={() => filterWasteSensors('electronic')}
        >
          <i className="fas fa-laptop" /> Électronique
        </button>
        <button
          className={`filter-btn ${activeFilter === 'dangerous' ? 'active' : ''}`}
          data-waste-type="dangerous"
          onClick={() => filterWasteSensors('dangerous')}
        >
          <i className="fas fa-radiation-alt" /> Dangereux
        </button>
      </div>

      {/* Waste Stats */}
      <div className="transport-stats-grid">
        <div className="transport-stat-card">
          <div
            className="stat-icon"
            style={{
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
            }}
          >
            <i className="fas fa-wifi" />
          </div>
          <div className="stat-content">
            <h4>Capteurs Actifs</h4>
            <div className="stat-value" id="wasteActiveSensors">
              {stats.onlineSensors}/{stats.totalSensors}
            </div>
            <div className="stat-label">En ligne</div>
          </div>
        </div>
        <div className="transport-stat-card">
          <div
            className="stat-icon"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            }}
          >
            <i className="fas fa-weight" />
          </div>
          <div className="stat-content">
            <h4>Poids Total Aujourd'hui</h4>
            <div className="stat-value" id="wasteTotalWeight">
              {stats.totalWeight.toFixed(1)} kg
            </div>
            <div className="stat-label">Tous types confondus</div>
          </div>
        </div>
        <div className="transport-stat-card">
          <div
            className="stat-icon"
            style={{
              background: "linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)"
            }}
          >
            <i className="fas fa-chart-bar" />
          </div>
          <div className="stat-content">
            <h4>Type le Plus Produit</h4>
            <div className="stat-value" id="wasteTopType">
              {stats.topType === 'organic' ? 'Organique' :
                stats.topType === 'recyclable' ? 'Recyclable' :
                  stats.topType === 'non-recyclable' ? 'Non-Recyclable' :
                    stats.topType === 'electronic' ? 'Électronique' :
                      stats.topType === 'dangerous' ? 'Dangereux' : stats.topType}
            </div>
            <div className="stat-label" id="wasteTopTypePercent">
              {stats.topTypePercent}%
            </div>
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
            <h4>Émissions Totales CO2</h4>
            <div className="stat-value" id="wasteCO2Emissions">
              {stats.totalCO2.toFixed(1)} kg
            </div>
            <div className="stat-label">Aujourd'hui</div>
          </div>
        </div>
      </div>

      {/* Waste Sensors Grid */}
      <div className="sensors-grid-scroll">
        {loading ? (
          <div style={{ padding: '20px', color: 'white', textAlign: 'center' }}>
            Chargement...
          </div>
        ) : sensors.length === 0 ? (
          <div style={{ padding: '20px', color: 'white', textAlign: 'center' }}>
            En attente de données...
          </div>
        ) : (
          sensors.map((sensor, index) => (
            <div
              key={index}
              className="sensor-card sensor-online waste-sensor"
              data-sensor-id={sensor.sensorId || `SENSOR-${index}`}
              data-waste-type={sensor.wasteType || 'organic'}
            >
              <div className="sensor-header">
                <div className="sensor-name">
                  <i className="fas fa-trash-alt" />
                  <span>{sensor.sensorId || `ESP32-WASTE-${index + 1}`}</span>
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
              <div className={`sensor-waste-type ${sensor.wasteType || 'organic'}`}>
                <i className="fas fa-recycle" />
                <span>{sensor.wasteType || 'Organique'}</span>
              </div>
              <div className="sensor-value">
                <span className="value">{sensor.value}</span>
                <span className="unit">{sensor.unit || 'kg'}</span>
              </div>
              <div className="sensor-capacity">
                <div className="capacity-bar">
                  <div
                    className={`capacity-fill ${sensor.wasteType || 'organic'}`}
                    style={{ width: `${Math.min((sensor.value / 100) * 100, 100)}%` }}
                  />
                </div>
                <span className="capacity-text">
                  {Math.min(Math.round((sensor.value / 100) * 100), 100)}% ({sensor.value}/100 {sensor.unit || 'kg'})
                </span>
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

      {/* Sub-types Management Card */}
      <div className="subtypes-management-section">
        <h4>
          <i className="fas fa-tags" /> Liste des types de Déchets existants -{" "}
          <span id="currentWasteTypeName">Organique</span>
        </h4>
        <div className="subtypes-card">
          <div className="subtypes-container" id="wasteSubtypesContainer">
            {currentSubtypes.map((subtype, index) => (
              <div key={index} className="subtype-tag" data-index={index}>
                <span className="subtype-tag-text">{subtype}</span>
                <span
                  className="subtype-tag-delete"
                  onClick={() => deleteSubtype(index)}
                >
                  ×
                </span>
              </div>
            ))}
          </div>
          <div className="add-subtype-input">
            <input
              type="text"
              id="newSubtypeInput"
              placeholder="Ajouter un sous-type (ex: Épluchures)"
              maxLength={50}
            />
            <button
              type="button"
              className="btn-add-subtype"
              onClick={addSubtype}
            >
              <i className="fas fa-plus" />
            </button>
          </div>
        </div>
      </div>

      {/* Manual Entry for Waste */}
      <div className="manual-entry-section">
        <h4>
          <i className="fas fa-keyboard" /> Saisie Manuelle - Déchets
        </h4>
        <form
          className="manual-waste-form"
          onSubmit={submitWasteManualData}
        >
          <input type="hidden" id="wasteTypeManual" required />
          <div className="form-row">
            <div className="form-group">
              <label>Type de déchet</label>
              <input
                type="text"
                id="wasteTypeDisplay"
                readOnly
                style={{
                  cursor: "not-allowed",
                  background: "rgba(255, 255, 255, 0.03)"
                }}
                placeholder="Sélectionnez un type via les boutons ci-dessus"
              />
            </div>
            <div className="form-group">
              <label>Poids (kg)</label>
              <input
                type="number"
                id="wasteWeight"
                placeholder="Ex: 45.5"
                min={0}
                step="0.1"
                required
              />
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button type="submit" className="btn-submit-manual">
              <i className="fas fa-check" /> Enregistrer
            </button>
          </div>
        </form>
      </div>

      {/* Waste Manual Entry History Table */}
      <div className="waste-history-section">
        <h4>
          <i className="fas fa-history" /> Historique des Saisies
        </h4>
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Date &amp; Heure</th>
                <th>Type de déchet</th>
                <th>Poids (kg)</th>
              </tr>
            </thead>
            <tbody id="wasteHistoryTableBody">
              {/* Rows will be added dynamically */}
            </tbody>
          </table>
        </div>
      </div>

      {/* IoT Management Section */}
      <div className="iot-management-section" style={{
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '25px',
        marginTop: '30px',
        border: '1px solid rgba(102, 126, 234, 0.3)'
      }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            cursor: 'pointer'
          }}
          onClick={() => setIsIoTManagementOpen(!isIoTManagementOpen)}
        >
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fas fa-microchip" style={{ color: '#667eea' }} />
            Gestion des Appareils IoT
            <span style={{
              background: 'rgba(102, 126, 234, 0.3)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {sensors.length} appareils
            </span>
          </h3>
          <i className={`fas fa-chevron-${isIoTManagementOpen ? 'up' : 'down'}`} style={{ color: 'var(--text-secondary)' }} />
        </div>

        {isIoTManagementOpen && (
          <>
            {/* IoT Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginBottom: '25px'
            }}>
              <div style={{
                background: 'rgba(67, 233, 123, 0.15)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                border: '1px solid rgba(67, 233, 123, 0.3)'
              }}>
                <i className="fas fa-check-circle" style={{ fontSize: '24px', color: '#43e97b', marginBottom: '10px', display: 'block' }} />
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#43e97b' }}>{stats.onlineSensors}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Appareils En Ligne</div>
              </div>
              <div style={{
                background: 'rgba(245, 158, 11, 0.15)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                border: '1px solid rgba(245, 158, 11, 0.3)'
              }}>
                <i className="fas fa-exclamation-triangle" style={{ fontSize: '24px', color: '#f59e0b', marginBottom: '10px', display: 'block' }} />
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>{stats.totalSensors - stats.onlineSensors}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Appareils Hors Ligne</div>
              </div>
              <div style={{
                background: 'rgba(102, 126, 234, 0.15)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                border: '1px solid rgba(102, 126, 234, 0.3)'
              }}>
                <i className="fas fa-network-wired" style={{ fontSize: '24px', color: '#667eea', marginBottom: '10px', display: 'block' }} />
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#667eea' }}>{stats.totalSensors}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Appareils</div>
              </div>
              <div style={{
                background: 'rgba(236, 72, 153, 0.15)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                border: '1px solid rgba(236, 72, 153, 0.3)'
              }}>
                <i className="fas fa-signal" style={{ fontSize: '24px', color: '#ec4899', marginBottom: '10px', display: 'block' }} />
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#ec4899' }}>
                  {stats.totalSensors > 0 ? Math.round((stats.onlineSensors / stats.totalSensors) * 100) : 0}%
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Taux de Connexion</div>
              </div>
            </div>

            {/* IoT Devices Table */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{
                padding: '15px 20px',
                background: 'rgba(30, 58, 138, 0.4)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-list" /> Liste des Appareils IoT
                </h4>
                <button
                  onClick={openAddSensorModal}
                  style={{
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px'
                  }}
                >
                  <i className="fas fa-plus" /> Ajouter un Appareil
                </button>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ position: 'sticky', top: 0, background: 'rgba(30, 39, 46, 0.98)', zIndex: 1 }}>
                    <tr>
                      <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>ID Appareil</th>
                      <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>MAC</th>
                      <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Type</th>
                      <th style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Statut</th>
                      <th style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Valeur</th>
                      <th style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sensors.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          <i className="fas fa-inbox" style={{ fontSize: '48px', marginBottom: '15px', display: 'block', opacity: 0.5 }} />
                          Aucun appareil IoT configuré
                        </td>
                      </tr>
                    ) : (
                      sensors.map((sensor, index) => {
                        const typeNames = {
                          'organic': 'Organique',
                          'recyclable': 'Recyclable',
                          'non-recyclable': 'Non-Recyclable',
                          'electronic': 'Électronique',
                          'dangerous': 'Dangereux'
                        };
                        const typeColors = {
                          'organic': '#22c55e',
                          'recyclable': '#3b82f6',
                          'non-recyclable': '#f59e0b',
                          'electronic': '#a855f7',
                          'dangerous': '#ef4444'
                        };
                        return (
                          <tr key={index} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <td style={{ padding: '12px 15px', fontWeight: '600' }}>
                              <i className="fas fa-microchip" style={{ color: '#667eea', marginRight: '8px' }} />
                              {sensor.sensorId}
                            </td>
                            <td style={{ padding: '12px 15px', fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-secondary)' }}>
                              {sensor.macAddress || 'N/A'}
                            </td>
                            <td style={{ padding: '12px 15px' }}>
                              <span style={{
                                background: `${typeColors[sensor.wasteType] || '#666'}20`,
                                color: typeColors[sensor.wasteType] || '#666',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                {typeNames[sensor.wasteType] || sensor.wasteType}
                              </span>
                            </td>
                            <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                background: sensor.status === 'ONLINE' ? 'rgba(67, 233, 123, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                color: sensor.status === 'ONLINE' ? '#43e97b' : '#ef4444',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                <i className="fas fa-circle" style={{ fontSize: '6px' }} />
                                {sensor.status === 'ONLINE' ? 'En ligne' : 'Hors ligne'}
                              </span>
                            </td>
                            <td style={{ padding: '12px 15px', textAlign: 'center', fontWeight: '600' }}>
                              {sensor.value?.toFixed(1) || 0} kg
                            </td>
                            <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                                <button onClick={() => viewSensorDetails(sensor.sensorId)} style={{ background: 'rgba(59, 130, 246, 0.2)', border: 'none', borderRadius: '6px', padding: '6px 10px', color: '#3b82f6', cursor: 'pointer' }} title="Détails">
                                  <i className="fas fa-eye" />
                                </button>
                                <button onClick={() => configureSensor(sensor.sensorId)} style={{ background: 'rgba(245, 158, 11, 0.2)', border: 'none', borderRadius: '6px', padding: '6px 10px', color: '#f59e0b', cursor: 'pointer' }} title="Configurer">
                                  <i className="fas fa-cog" />
                                </button>
                                <button onClick={() => deleteSensor(sensor.sensorId)} style={{ background: 'rgba(239, 68, 68, 0.2)', border: 'none', borderRadius: '6px', padding: '6px 10px', color: '#ef4444', cursor: 'pointer' }} title="Supprimer">
                                  <i className="fas fa-trash" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Sensor Modal */}
      {showAddModal && (
        <div id="addSensorModal" className="modal" style={{ display: 'block' }} onClick={closeModals}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
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
                    style={{ cursor: 'not-allowed', background: 'rgba(255, 255, 255, 0.03)' }}
                    required
                  />
                  <small style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                    Généré automatiquement
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="macAddress">
                    <i className="fas fa-wifi" /> Adresse MAC du Capteur
                  </label>
                  <input
                    type="text"
                    id="macAddress"
                    placeholder="Ex: AA:BB:CC:DD:EE:FF"
                    value={newSensorForm.macAddress}
                    onChange={(e) => setNewSensorForm({ ...newSensorForm, macAddress: e.target.value.toUpperCase() })}
                    pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
                    required
                  />
                  <small style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                    Format: XX:XX:XX:XX:XX:XX (récupérable depuis l'ESP32)
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="location">
                    <i className="fas fa-map-marker-alt" /> Emplacement
                  </label>
                  <input
                    type="text"
                    id="location"
                    placeholder="Ex: Bureau Principal, Zone Production, etc."
                    value={newSensorForm.location}
                    onChange={(e) => setNewSensorForm({ ...newSensorForm, location: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="trashType">Type de déchet</label>
                  <select
                    id="trashType"
                    value={newSensorForm.trashType}
                    onChange={(e) => setNewSensorForm({ ...newSensorForm, trashType: e.target.value })}
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
                    <option value="ORGANIC">🍃 Organique</option>
                    <option value="RECYCLABLE">♻️ Recyclable</option>
                    <option value="NON_RECYCLABLE">🗑️ Non-Recyclable</option>
                    <option value="ELECTRONIC">💻 Électronique</option>
                    <option value="DANGEROUS">☢️ Dangereux</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="co2Impact">
                    <i className="fas fa-leaf" /> Impact CO2 (kg)
                  </label>
                  <input
                    type="number"
                    id="co2Impact"
                    placeholder="Ex: 0.5"
                    step="0.01"
                    value={newSensorForm.co2Impact}
                    onChange={(e) => setNewSensorForm({ ...newSensorForm, co2Impact: e.target.value })}
                    required
                  />
                  <small style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                    Estimation de l'impact carbone par kg de déchets
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Statut</label>
                  <select
                    id="status"
                    value={newSensorForm.status}
                    onChange={(e) => setNewSensorForm({ ...newSensorForm, status: e.target.value })}
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
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <i className="fas fa-info-circle" style={{ color: '#3b82f6', marginTop: '2px' }} />
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                      <strong>Note:</strong> L'adresse MAC doit correspondre exactement à celle de votre ESP32.
                      Vous la trouverez à l'écrande votre ESP32.
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
        <div id="sensorDetailsModal" className="modal" style={{ display: 'block' }} onClick={closeModals}>
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
                <span className="detail-value">Capteur de Poids (HX711)</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Statut:</span>
                <span className="detail-value">En ligne</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Valeur actuelle:</span>
                <span className="detail-value">12.5 kg</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Seuil d'alerte:</span>
                <span className="detail-value">50 kg</span>
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
        <div id="sensorConfigModal" className="modal" style={{ display: 'block' }} onClick={closeModals}>
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
                <input type="text" id="configSensorType" defaultValue="Capteur de Poids (HX711)" readOnly required />
              </div>
              <div className="form-group">
                <label htmlFor="configSensorThreshold">Seuil d'alerte (kg)</label>
                <input type="number" id="configSensorThreshold" placeholder="Ex: 50" step="0.1" />
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
        <div id="deleteSensorModal" className="modal" style={{ display: 'block' }} onClick={closeModals}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fas fa-exclamation-triangle" style={{ color: '#ef4444' }} /> Confirmer la suppression</h3>
              <button className="modal-close" onClick={closeModals}>
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '20px', textAlign: 'center' }}>
                Êtes-vous sûr de vouloir supprimer le capteur <strong style={{ color: 'var(--accent-color)' }}>{currentSensorId}</strong> ?
              </p>
              <p style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '20px', textAlign: 'center' }}>
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

export default WasteTab;
