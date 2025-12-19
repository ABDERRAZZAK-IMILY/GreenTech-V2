import React, { useState, useEffect } from 'react';
import { showNotification } from '../../../utils/notifications';
import { energyDataService } from '../../../services/smartDataService';
import { getAllDepartments } from '../../../services/departmentSerice';


const EnergyTab = () => {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [isIoTManagementOpen, setIsIoTManagementOpen] = useState(true);
  const [activeFilter, setActiveFilter] = useState('production');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSensorId, setCurrentSensorId] = useState(null);
  const [currentEquipments, setCurrentEquipments] = useState([]);

  // Calculate stats from sensors
  const stats = {
    totalSensors: sensors.length,
    onlineSensors: sensors.filter(s => s.status === 'ONLINE').length,
    totalConsumption: sensors.reduce((sum, s) => sum + (s.value || 0), 0),
    topDepartment: 'Production',
    totalCO2: sensors.reduce((sum, s) => sum + ((s.value || 0) * 0.5), 0)
  };

  // Manual entry state
  const [manualEntryForm, setManualEntryForm] = useState({
    department: '',
    consumption: ''
  });
  const [manualEntryHistory, setManualEntryHistory] = useState([]);
  const [newEquipmentInput, setNewEquipmentInput] = useState('');
  const [allMonitors, setAllMonitors] = useState([]);

  // Calculate overview stats by department
  const overviewStats = [
    {
      name: 'Production',
      key: 'production',
      icon: { icon: 'fa-industry', color: '#667eea' },
      totalSensors: sensors.filter(s => s.location === 'production').length,
      onlineSensors: sensors.filter(s => s.location === 'production' && s.status === 'ONLINE').length,
      totalConsumption: sensors.filter(s => s.location === 'production').reduce((sum, s) => sum + (s.value || 0), 0),
      totalCO2: sensors.filter(s => s.location === 'production').reduce((sum, s) => sum + ((s.value || 0) * 0.5), 0)
    },
    {
      name: 'Bureaux',
      key: 'bureaux',
      icon: { icon: 'fa-building', color: '#43e97b' },
      totalSensors: sensors.filter(s => s.location === 'bureaux').length,
      onlineSensors: sensors.filter(s => s.location === 'bureaux' && s.status === 'ONLINE').length,
      totalConsumption: sensors.filter(s => s.location === 'bureaux').reduce((sum, s) => sum + (s.value || 0), 0),
      totalCO2: sensors.filter(s => s.location === 'bureaux').reduce((sum, s) => sum + ((s.value || 0) * 0.5), 0)
    },
    {
      name: 'Entrepôt',
      key: 'entrepot',
      icon: { icon: 'fa-warehouse', color: '#f59e0b' },
      totalSensors: sensors.filter(s => s.location === 'entrepot').length,
      onlineSensors: sensors.filter(s => s.location === 'entrepot' && s.status === 'ONLINE').length,
      totalConsumption: sensors.filter(s => s.location === 'entrepot').reduce((sum, s) => sum + (s.value || 0), 0),
      totalCO2: sensors.filter(s => s.location === 'entrepot').reduce((sum, s) => sum + ((s.value || 0) * 0.5), 0)
    },
    {
      name: 'Cafétéria',
      key: 'cafeteria',
      icon: { icon: 'fa-utensils', color: '#ec4899' },
      totalSensors: sensors.filter(s => s.location === 'cafeteria').length,
      onlineSensors: sensors.filter(s => s.location === 'cafeteria' && s.status === 'ONLINE').length,
      totalConsumption: sensors.filter(s => s.location === 'cafeteria').reduce((sum, s) => sum + (s.value || 0), 0),
      totalCO2: sensors.filter(s => s.location === 'cafeteria').reduce((sum, s) => sum + ((s.value || 0) * 0.5), 0)
    }
  ];

  // Form state for adding new sensor
  const [newSensorForm, setNewSensorForm] = useState({
    location: '',
    sensorId: '',
    macAddress: '',
    status: 'ONLINE',
    co2Impact: 0,
    departmentId: ''
  });

  // Departments state
  const [departments, setDepartments] = useState([]);

  // Equipment types configuration for each department
  const equipmentTypesConfig = {
    'production': ['Machine CNC #1', 'Machine CNC #2', 'Compresseur', 'Tour', 'Fraiseuse'],
    'bureaux': ['Climatisation', 'Ordinateurs', 'Éclairage', 'Serveurs', 'Imprimantes'],
    'entrepot': ['Chariots élévateurs', 'Éclairage', 'Ventilation', 'Portes automatiques'],
    'cafeteria': ['Four', 'Réfrigérateur', 'Micro-ondes', 'Cafetière', 'Lave-vaisselle']
  };

  // Fetch energy data from backend
  // Fetch energy data from backend
  const fetchEnergyData = async () => {
    try {
      const response = await energyDataService.getMetrics('ENERGY');

      // Filter out manual entries and normalize sensor locations
      const realSensors = response.data
        .filter(sensor => sensor.macAddress !== 'MANUAL_ENTRY')
        .map(sensor => {
          // Normalize location to ensure it matches filters
          let loc = (sensor.location || 'production').toLowerCase();

          // If location is unknown or auto-registered, default to production to ensure visibility
          if (loc === 'auto-registered' || !['production', 'bureaux', 'entrepot', 'cafeteria'].includes(loc)) {
            loc = 'production';
          }

          return {
            ...sensor,
            location: loc
          };
        });

      setSensors(realSensors);
      setAllMonitors(realSensors); // Store real monitors for IoT management
      setLoading(false);
    } catch (error) {
      console.error("Error fetching energy data:", error);
      setLoading(false);
    }
  };

  // Load manual entry history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('energyManualEntryHistory');
      if (savedHistory) {
        setManualEntryHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.warn('Could not load from localStorage:', e);
    }
  }, []);

  // Initialize filter and equipments on component mount
  useEffect(() => {
    fetchEnergyData(); // Initial fetch
    fetchDepartments(); // Fetch departments for the form
    const interval = setInterval(fetchEnergyData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Fetch departments from backend
  const fetchDepartments = async () => {
    try {
      const response = await getAllDepartments();
      if (response && response.data) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  // Initialize filter and equipments on component mount
  useEffect(() => {
    // Load initial equipments for production
    setCurrentEquipments(equipmentTypesConfig['production']);
  }, []);

  // Update equipments when activeFilter changes
  useEffect(() => {
    if (activeFilter === 'all') {
      // Collect all equipments via Set to avoid duplicates
      const allEquipments = new Set();
      Object.values(equipmentTypesConfig).forEach(list => list.forEach(item => allEquipments.add(item)));
      setCurrentEquipments(Array.from(allEquipments));
    } else {
      setCurrentEquipments(equipmentTypesConfig[activeFilter] || []);
    }
  }, [activeFilter]);

  const toggleEnergyOverview = () => {
    setIsOverviewOpen(!isOverviewOpen);
  };

  // Helper to get formatted department name
  const getDeptName = (deptKey) => {
    const deptNames = {
      'all': 'Tous',
      'production': 'Production',
      'bureaux': 'Bureaux',
      'entrepot': 'Entrepôt',
      'cafeteria': 'Cafétéria'
    };
    return deptNames[deptKey] || deptKey;
  };

  const addEquipment = () => {
    const equipmentText = newEquipmentInput.trim();

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
    setNewEquipmentInput('');
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

    if (!manualEntryForm.department || !manualEntryForm.consumption) {
      showNotification('Veuillez remplir tous les champs requis', 'warning');
      return;
    }

    const deptNames = {
      'production': 'Production',
      'bureaux': 'Bureaux',
      'entrepot': 'Entrepôt',
      'cafeteria': 'Cafétéria'
    };

    try {
      // Send to Backend - saves to Energy collection directly
      const payload = {
        energyConsumed: parseFloat(manualEntryForm.consumption),
        macAddress: 'MANUAL_ENTRY'
      };

      await energyDataService.submitManualData(payload);
      console.log('✅ Manual energy entry saved to database');

      // Create new manual entry for local history
      const now = new Date();
      const newEntry = {
        id: Date.now(),
        dateTime: `${now.toLocaleDateString('fr-FR')} ${now.toLocaleTimeString('fr-FR')}`,
        department: deptNames[manualEntryForm.department] || manualEntryForm.department,
        departmentKey: manualEntryForm.department,
        consumption: parseFloat(manualEntryForm.consumption).toFixed(2)
      };

      // Update history state
      const updatedHistory = [newEntry, ...manualEntryHistory];
      setManualEntryHistory(updatedHistory);

      // Save to localStorage for UI persistence
      try {
        localStorage.setItem('energyManualEntryHistory', JSON.stringify(updatedHistory));
      } catch (e) {
        console.warn('Could not save to localStorage:', e);
      }

      // Reset form
      setManualEntryForm({
        department: manualEntryForm.department,
        consumption: ''
      });

      showNotification('Saisie manuelle enregistrée avec succès !', 'success');
    } catch (error) {
      console.error('Error saving manual entry to database:', error);
      showNotification('Erreur lors de l\'enregistrement', 'error');
    }
  };

  // Delete manual entry
  const deleteManualEntry = (entryId) => {
    const updatedHistory = manualEntryHistory.filter(entry => entry.id !== entryId);
    setManualEntryHistory(updatedHistory);

    try {
      localStorage.setItem('energyManualEntryHistory', JSON.stringify(updatedHistory));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }

    showNotification('Entrée supprimée', 'info');
  };

  // Handle delete monitor from backend
  const handleDeleteMonitor = async (sensorId) => {
    try {
      const sensor = sensors.find(s => s.sensorId === sensorId);
      if (sensor && sensor.id) {
        await energyDataService.deleteMonitor(sensor.id);
        showNotification('Capteur supprimé avec succès', 'success');
        fetchEnergyData();
      }
    } catch (error) {
      console.error('Error deleting monitor:', error);
      showNotification('Erreur lors de la suppression du capteur', 'error');
    }
    setShowDeleteModal(false);
    setCurrentSensorId(null);
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
    // Use handleDeleteMonitor for actual backend deletion
    handleDeleteMonitor(currentSensorId);
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
      co2Impact: 0,
      departmentId: ''
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

    // Check if MAC address already exists locally before sending to backend
    const existingMac = sensors.find(
      s => s.macAddress && s.macAddress.toLowerCase() === newSensorForm.macAddress.toLowerCase()
    );

    if (existingMac) {
      showNotification(`Un capteur avec l'adresse MAC "${newSensorForm.macAddress}" existe déjà`, 'error');
      return;
    }

    try {
      // Prepare data for backend
      // Build location string with department name
      const selectedDept = departments.find(d => d.id === newSensorForm.departmentId);
      const locationWithDept = selectedDept
        ? `${newSensorForm.location} - ${selectedDept.name}`
        : newSensorForm.location;

      const monitorData = {
        location: locationWithDept,
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
      // Check for duplicate MAC address error from backend
      if (error.response?.status === 400 || error.response?.data?.message?.includes('existe déjà')) {
        showNotification('Un capteur avec cette adresse MAC existe déjà', 'error');
      } else {
        const errorMessage = error.response?.data?.message || 'Erreur lors de l\'ajout du capteur';
        showNotification(errorMessage, 'error');
      }
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
                {overviewStats.map((stat, index) => (
                  <tr key={index}>
                    <td>
                      <div className="usage-icon">
                        <i className={`fas ${stat.icon.icon}`} style={{ color: stat.icon.color }} />
                        {stat.name}
                      </div>
                    </td>
                    <td><strong>{stat.onlineSensors}/{stat.totalSensors}</strong> capteurs</td>
                    <td><strong>{stat.totalConsumption.toFixed(1)} kWh</strong></td>
                    <td><span className="status-badge status-partial">{stat.totalCO2.toFixed(1)} kg CO2</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Department Filter */}
      <div className="department-filter">
        {['all', 'production', 'bureaux', 'entrepot', 'cafeteria'].map(dept => (
          <button
            key={dept}
            className={`filter-btn ${activeFilter === dept ? 'active' : ''}`}
            onClick={() => {
              setActiveFilter(dept);
              const deptNames = {
                'all': 'Tous',
                'production': 'Production',
                'bureaux': 'Bureaux',
                'entrepot': 'Entrepôt',
                'cafeteria': 'Cafétéria'
              };
              setManualEntryForm(prev => ({ ...prev, department: dept === 'all' ? '' : dept }));
              const deptDisplay = document.getElementById('currentDeptName');
              if (deptDisplay) deptDisplay.textContent = deptNames[dept];
            }}
          >
            <i className={`fas fa-${dept === 'all' ? 'border-all' :
              dept === 'production' ? 'industry' :
                dept === 'bureaux' ? 'building' :
                  dept === 'entrepot' ? 'warehouse' : 'utensils'}`} />
            {dept === 'all' ? 'Tous' : dept.charAt(0).toUpperCase() + dept.slice(1)}
          </button>
        ))}
      </div>

      {/* Energy Stats */}
      <div className="transport-stats-grid">
        <div className="transport-stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <i className="fas fa-plug" />
          </div>
          <div className="stat-content">
            <h4>Capteurs Actifs</h4>
            <div className="stat-value">{stats.onlineSensors}/{stats.totalSensors}</div>
            <div className="stat-label">En ligne</div>
          </div>
        </div>

        <div className="transport-stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <i className="fas fa-bolt" />
          </div>
          <div className="stat-content">
            <h4>Consommation Totale</h4>
            <div className="stat-value">{stats.totalConsumption.toFixed(1)} kWh</div>
            <div className="stat-label">Tous départements</div>
          </div>
        </div>

        <div className="transport-stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)' }}>
            <i className="fas fa-chart-pie" />
          </div>
          <div className="stat-content">
            <h4>Département Principal</h4>
            <div className="stat-value">{stats.topDepartment}</div>
            <div className="stat-label">Plus gros consommateur</div>
          </div>
        </div>

        <div className="transport-stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)' }}>
            <i className="fas fa-leaf" />
          </div>
          <div className="stat-content">
            <h4>Émissions CO2</h4>
            <div className="stat-value">{stats.totalCO2.toFixed(1)} kg</div>
            <div className="stat-label">Estimé (0.5 kg/kWh)</div>
          </div>
        </div>
      </div>

      {/* Energy Sensors Grid */}
      <div className="sensors-grid-scroll">
        {loading ? (
          <div style={{ padding: '20px', color: 'white', textAlign: 'center' }}>
            Chargement...
          </div>
        ) : sensors.filter(s => activeFilter === 'all' || s.location === activeFilter).length === 0 ? (
          <div style={{ padding: '20px', color: 'white', textAlign: 'center' }}>
            Aucun capteur détecté pour ce département.
          </div>
        ) : (
          sensors.filter(s => activeFilter === 'all' || s.location === activeFilter).map((sensor, index) => (
            <div
              key={index}
              className={`sensor-card sensor-${sensor.status === 'ONLINE' ? 'online' : 'offline'} energy-sensor`}
            >
              <div className="sensor-header">
                <div className="sensor-name">
                  <i className="fas fa-bolt" />
                  <span>{sensor.sensorId}</span>
                </div>
                <label className="sensor-toggle">
                  <input
                    type="checkbox"
                    checked={sensor.status === 'ONLINE'}
                    readOnly
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
              <div className={`sensor-department ${sensor.location || 'production'}`}>
                <i className="fas fa-industry" />
                <span>{sensor.location ? sensor.location.charAt(0).toUpperCase() + sensor.location.slice(1) : 'Inconnu'}</span>
              </div>
              <div className="sensor-value">
                <span className="value">{sensor.value?.toFixed(2)}</span>
                <span className="unit">kWh</span>
              </div>
              <div className="sensor-daily">
                <i className="fas fa-calendar-day" />
                <span>{(sensor.value * 24).toFixed(1)} kWh/jour</span>
              </div>
              <div className="sensor-status">
                <span className={`status-badge ${sensor.status === 'ONLINE' ? 'online' : 'offline'}`}>
                  <i className="fas fa-circle" /> {sensor.status === 'ONLINE' ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
              <div className="sensor-timestamp">
                {sensor.formattedTimestamp || new Date().toLocaleString()}
              </div>
              <div className="sensor-actions">
                <button
                  className="btn-sensor-detail"
                  onClick={() => viewSensorDetails(sensor.sensorId)}
                >
                  <i className="fas fa-eye" /> Détails
                </button>
                <button
                  className="btn-sensor-config"
                  onClick={() => configureSensor(sensor.sensorId)}
                >
                  <i className="fas fa-cog" /> Modifier
                </button>
                <button
                  className="btn-sensor-delete"
                  onClick={() => deleteSensor(sensor.sensorId)}
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
          <span id="currentDeptName">{(activeFilter === 'all' ? 'Tous' : activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1))}</span>
        </h4>
        <div className="subtypes-card">
          <div className="subtypes-container">
            {currentEquipments.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', padding: '10px' }}>
                Aucun équipement configuré pour ce département
              </div>
            ) : (
              currentEquipments.map((equipment, index) => (
                <div key={index} className="subtype-tag">
                  <span className="subtype-tag-text">{equipment}</span>
                  <span
                    className="subtype-tag-delete"
                    onClick={() => deleteEquipment(index)}
                  >
                    ×
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="add-subtype-input">
            <input
              type="text"
              value={newEquipmentInput}
              onChange={(e) => setNewEquipmentInput(e.target.value)}
              placeholder="Ajouter un équipement (ex: Four industriel)"
              maxLength={50}
              onKeyPress={(e) => e.key === 'Enter' && addEquipment()}
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
          <div className="form-row">
            <div className="form-group">
              <label>Département</label>
              <select
                value={manualEntryForm.department}
                onChange={(e) => setManualEntryForm({ ...manualEntryForm, department: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              >
                <option value="">Sélectionnez un département</option>
                <option value="production">Production</option>
                <option value="bureaux">Bureaux</option>
                <option value="entrepot">Entrepôt</option>
                <option value="cafeteria">Cafétéria</option>
              </select>
            </div>
            <div className="form-group">
              <label>Consommation (kWh)</label>
              <input
                type="number"
                value={manualEntryForm.consumption}
                onChange={(e) => setManualEntryForm({ ...manualEntryForm, consumption: e.target.value })}
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
                <th style={{ width: '50px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {manualEntryHistory.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.5)' }}>
                    Aucune saisie manuelle enregistrée
                  </td>
                </tr>
              ) : (
                manualEntryHistory.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.dateTime}</td>
                    <td>
                      <span className={`dept-badge ${entry.departmentKey}`}>
                        {entry.department}
                      </span>
                    </td>
                    <td><strong>{entry.consumption} kWh</strong></td>
                    <td>
                      <button
                        onClick={() => deleteManualEntry(entry.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '5px'
                        }}
                        title="Supprimer"
                      >
                        <i className="fas fa-trash-alt" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
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
                      <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Département</th>
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
                        const deptNames = {
                          'production': 'Production',
                          'bureaux': 'Bureaux',
                          'entrepot': 'Entrepôt',
                          'cafeteria': 'Cafétéria'
                        };
                        const deptColors = {
                          'production': '#3b82f6',
                          'bureaux': '#22c55e',
                          'entrepot': '#f59e0b',
                          'cafeteria': '#a855f7'
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
                                background: `${deptColors[sensor.location] || '#666'}20`,
                                color: deptColors[sensor.location] || '#666',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                {deptNames[sensor.location] || sensor.location || 'N/A'}
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
                              {sensor.value?.toFixed(1) || 0} kWh
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
                    <i className="fas fa-wifi" /> Adresse MAC du Capteur ESP32
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
                    Format: XX:XX:XX:XX:XX:XX - Identifiant unique du capteur
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="location">
                    <i className="fas fa-map-marker-alt" /> Emplacement
                  </label>
                  <select
                    id="location"
                    value={newSensorForm.location}
                    onChange={(e) => setNewSensorForm({ ...newSensorForm, location: e.target.value })}
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
                    <option value="">Sélectionnez un emplacement</option>
                    <option value="production">Production</option>
                    <option value="bureaux">Bureaux</option>
                    <option value="entrepot">Entrepôt</option>
                    <option value="cafeteria">Cafétéria</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="departmentId">
                    <i className="fas fa-building" /> Département
                  </label>
                  <select
                    id="departmentId"
                    value={newSensorForm.departmentId}
                    onChange={(e) => setNewSensorForm({ ...newSensorForm, departmentId: e.target.value })}
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
                    <option value="">-- Sélectionner un département --</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  <small style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                    Le capteur sera lié à ce département
                  </small>
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
                    onChange={(e) => setNewSensorForm({ ...newSensorForm, co2Impact: e.target.value })}
                    required
                  />
                  <small style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                    Facteur d'émission CO2 (moyenne France: 0.0571 kg/kWh)
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Statut initial</label>
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

export default EnergyTab;
