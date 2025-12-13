import React, { useState, useEffect } from 'react';
import { showNotification } from '../../../utils/notifications';
import { gasDataService } from '../../../services/smartDataService';

const GasTab = () => {
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('cuisine');
  const [currentEquipments, setCurrentEquipments] = useState([]);
  const [gasHistory, setGasHistory] = useState({
    cuisine: [],
    chauffage: [],
    climatisation: [],
    'eau-chaude': [],
    production: []
  });

  // Gas equipment configuration for each usage
  const gasEquipmentsConfig = {
    'cuisine': ['Four industriel', 'Cuisinière', 'Plancha'],
    'chauffage': ['Chaudière principale', 'Radiateurs', 'Chauffage d\'appoint'],
    'climatisation': ['Climatiseur Bureau', 'Climatiseur Production', 'Système central'],
    'eau-chaude': ['Chauffe-eau principal', 'Chauffe-eau sanitaires'],
    'production': ['Brûleur', 'Séchoir']
  };

  // Initialize equipments on component mount
  useEffect(() => {
    setCurrentEquipments(gasEquipmentsConfig['cuisine']);
  }, []);

  // Update equipments when activeFilter changes
  useEffect(() => {
    setCurrentEquipments(gasEquipmentsConfig[activeFilter] || []);
  }, [activeFilter]);

  const toggleGasOverview = () => {
    setIsOverviewOpen(!isOverviewOpen);
  };

  const filterGasByUsage = (usage) => {
    setActiveFilter(usage);
  };

  const addEquipment = () => {
    const input = document.getElementById('newGasEquipmentInput');
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


  const submitGasData = async (event) => {
    event.preventDefault();

    const gasType = gasTypes[activeFilter];
    const quantity = document.getElementById('gasQuantity').value;
    const capacity = document.getElementById('gasCapacity').value;
    const status = document.getElementById('gasStatus').value;

    const usageName = usageNames[activeFilter];

    try {
      // Submit to backend
      const payload = {
        consumedGas: parseFloat(quantity)
      };

      await gasDataService.submitManualData(payload);

      // Get current date and time
      const now = new Date();
      const dateStr = now.toLocaleDateString('fr-FR');
      const timeStr = now.toLocaleTimeString('fr-FR');

      // Add to history
      const newEntry = {
        date: `${dateStr} ${timeStr}`,
        usage: usageName,
        gasType: gasType,
        quantity: quantity,
        capacity: capacity,
        status: status
      };

      setGasHistory(prev => ({
        ...prev,
        [activeFilter]: [newEntry, ...prev[activeFilter]]
      }));

      showNotification(`Gaz enregistré: ${usageName} - ${gasType} (${quantity} ${gasType === 'Butane' ? 'bouteilles' : 'kg'})`, 'success');

      // Reset form
      event.target.reset();
    } catch (error) {
      console.error('Error submitting gas data:', error);
      showNotification('Erreur lors de l\'enregistrement des données', 'error');
    }
  };

  const usageNames = {
    'cuisine': 'Cuisine',
    'chauffage': 'Chauffage',
    'climatisation': 'Climatisation',
    'eau-chaude': 'Eau Chaude',
    'production': 'Production'
  };

  const usageIcons = {
    'cuisine': 'fa-utensils',
    'chauffage': 'fa-temperature-high',
    'climatisation': 'fa-snowflake',
    'eau-chaude': 'fa-water',
    'production': 'fa-industry'
  };

  const gasTypes = {
    'cuisine': 'Butane',
    'chauffage': 'Butane',
    'climatisation': 'Gaz Réfrigérant',
    'eau-chaude': 'Butane',
    'production': 'Butane'
  };

  return (
    <div id="sensor-gas-content">
      <div className="sensors-section-header">
        <h3>
          <i className="fas fa-fire" /> Gestion du Stock de Gaz
        </h3>
      </div>

      {/* Gas Stats */}
      <div className="transport-stats-grid">
        <div className="transport-stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <i className="fas fa-fire" />
          </div>
          <div className="stat-content">
            <h4>Stock Total Actuel</h4>
            <div className="stat-value" id="gasStockTotal">12 bouteilles</div>
            <div className="stat-label">156 kg</div>
          </div>
        </div>

        <div className="transport-stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <i className="fas fa-chart-line" />
          </div>
          <div className="stat-content">
            <h4>Consommation ce Mois</h4>
            <div className="stat-value" id="gasConsumptionMonth">2.3 bouteilles</div>
            <div className="stat-label">Usage actuel</div>
          </div>
        </div>

        <div className="transport-stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)' }}>
            <i className="fas fa-archive" />
          </div>
          <div className="stat-content">
            <h4>Bouteilles Vides</h4>
            <div className="stat-value" id="gasEmptyBottles">1 bouteille</div>
            <div className="stat-label">À échanger</div>
          </div>
        </div>

        <div className="transport-stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)' }}>
            <i className="fas fa-leaf" />
          </div>
          <div className="stat-content">
            <h4>Émissions CO2 Estimées</h4>
            <div className="stat-value" id="gasCO2Emissions">45 kg</div>
            <div className="stat-label">Ce mois</div>
          </div>
        </div>
      </div>

      {/* Gas Overview by Usage (Collapsible) */}
      <div className="gas-overview-collapsible">
        <div className={`collapsible-header ${isOverviewOpen ? 'active' : ''}`} onClick={toggleGasOverview}>
          <h4>
            <i className="fas fa-chart-pie" /> Vue d'ensemble par usage
          </h4>
          <i className={`fas fa-chevron-${isOverviewOpen ? 'up' : 'down'}`} id="gasOverviewChevron" />
        </div>
        <div className={`collapsible-content ${isOverviewOpen ? 'active' : ''}`} id="gasOverviewContent">
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
                    <i className="fas fa-tags" style={{ marginRight: '8px' }} />
                    Usage
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
                    <i className="fas fa-fire" style={{ marginRight: '8px' }} />
                    Type de gaz
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
                    <i className="fas fa-chart-line" style={{ marginRight: '8px' }} />
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
              <tbody id="gasOverviewTableBody">
                {Object.keys(usageNames).map((usageKey) => (
                  <tr key={usageKey}>
                    <td>
                      <div className="usage-icon">
                        <i className={`fas ${usageIcons[usageKey]}`} style={{ color: '#3b82f6' }} />
                        {usageNames[usageKey]}
                      </div>
                    </td>
                    <td><strong>{gasTypes[usageKey]}</strong></td>
                    <td><strong>0 {gasTypes[usageKey] === 'Butane' ? 'bouteilles' : 'kg'}</strong></td>
                    <td><span className="status-badge status-partial">0 kg CO2</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Usage Filter */}
      <div className="gas-usage-filter">
        <button
          className={`filter-btn ${activeFilter === 'cuisine' ? 'active' : ''}`}
          data-usage="cuisine"
          onClick={() => filterGasByUsage('cuisine')}
        >
          <i className="fas fa-utensils" /> Cuisine
        </button>
        <button
          className={`filter-btn ${activeFilter === 'chauffage' ? 'active' : ''}`}
          data-usage="chauffage"
          onClick={() => filterGasByUsage('chauffage')}
        >
          <i className="fas fa-temperature-high" /> Chauffage
        </button>
        <button
          className={`filter-btn ${activeFilter === 'climatisation' ? 'active' : ''}`}
          data-usage="climatisation"
          onClick={() => filterGasByUsage('climatisation')}
        >
          <i className="fas fa-snowflake" /> Climatisation
        </button>
        <button
          className={`filter-btn ${activeFilter === 'eau-chaude' ? 'active' : ''}`}
          data-usage="eau-chaude"
          onClick={() => filterGasByUsage('eau-chaude')}
        >
          <i className="fas fa-water" /> Eau Chaude
        </button>
        <button
          className={`filter-btn ${activeFilter === 'production' ? 'active' : ''}`}
          data-usage="production"
          onClick={() => filterGasByUsage('production')}
        >
          <i className="fas fa-industry" /> Production
        </button>
      </div>

      {/* Equipment Management Card */}
      <div className="subtypes-management-section">
        <h4>
          <i className="fas fa-tools" /> Liste des Équipements à Gaz existants -{" "}
          <span id="currentGasUsageName">{usageNames[activeFilter]}</span>
        </h4>
        <div className="subtypes-card">
          <div className="subtypes-container" id="gasEquipmentContainer">
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
              id="newGasEquipmentInput"
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

      {/* Manual Entry for Gas */}
      <div className="manual-entry-section">
        <h4>
          <i className="fas fa-keyboard" /> Saisie Manuelle - Gaz
        </h4>
        <form
          className="manual-waste-form"
          onSubmit={submitGasData}
        >
          <div className="form-row">
            <div className="form-group">
              <label>{gasTypes[activeFilter] === 'Butane' ? 'Quantité en bouteilles' : 'Quantité en kg'}</label>
              <input
                type="number"
                id="gasQuantity"
                placeholder="Ex: 6"
                min="0.1"
                step="0.1"
                required
              />
            </div>
            <div className="form-group">
              <label>Capacité</label>
              <input
                type="text"
                id="gasCapacity"
                placeholder="Ex: 13 kg"
                required
              />
            </div>
            <div className="form-group">
              <label>Statut</label>
              <select id="gasStatus" required>
                <option value="">Sélectionner</option>
                <option value="pleine">Pleine</option>
                <option value="encours">En cours</option>
                <option value="vide">Vide</option>
              </select>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button type="submit" className="btn-submit-manual">
              <i className="fas fa-check" /> Enregistrer
            </button>
          </div>
        </form>
      </div>

      {/* Gas Manual Entry History Table */}
      <div className="waste-history-section">
        <h4>
          <i className="fas fa-fire" /> Liste des bouteilles de gaz
        </h4>
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Date & Heure</th>
                <th>Usage</th>
                <th>Type de gaz</th>
                <th>Quantité</th>
                <th>Capacité</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody id="gasHistoryTableBody">
              {gasHistory[activeFilter] && gasHistory[activeFilter].map((entry, index) => (
                <tr key={index}>
                  <td>{entry.date}</td>
                  <td>{entry.usage}</td>
                  <td>{entry.gasType}</td>
                  <td>{entry.quantity} {entry.gasType === 'Butane' ? 'bouteilles' : 'kg'}</td>
                  <td>{entry.capacity}</td>
                  <td>
                    <span className={`status-badge ${
                      entry.status === 'pleine' ? 'online' :
                      entry.status === 'encours' ? 'status-partial' :
                      'offline'
                    }`}>
                      {entry.status === 'pleine' ? 'Pleine' :
                       entry.status === 'encours' ? 'En cours' :
                       'Vide'}
                    </span>
                  </td>
                </tr>
              ))}
              {(!gasHistory[activeFilter] || gasHistory[activeFilter].length === 0) && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Aucune bouteille enregistrée pour le moment
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GasTab;
