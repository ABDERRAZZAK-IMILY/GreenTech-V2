import React, { useEffect, useState } from 'react';
import DriverList from '../../../components/Transport/DriverList';
import ManualEntrySection from '../../../components/Transport/ManualEntrySection';
import DriverMap from '../../../components/map/DriverMap';
import useDriverStore from '../../../State/useDriverStore';

const TransportTab = () => {
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const {drivers,fetchDrivers} = useDriverStore();
  useEffect(() => {
    fetchDrivers();
  }, []);

  const toggleTransportOverview = () => {
    setIsOverviewOpen(!isOverviewOpen);
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
        <DriverMap drivers={drivers} />
      </div>

      {/* Drivers List */}
      <DriverList/>

      {/* Manual Entry for Transport */}
      <ManualEntrySection />

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


    </div>
  );
};

export default TransportTab;
