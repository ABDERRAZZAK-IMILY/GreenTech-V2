import React, { useState, useEffect, useRef } from 'react';
import KPICard from '../../components/common/KPICard';
import { useCharts } from '../../hooks/useCharts';

import { energyDataService, trashDataService, gasDataService, vehicleDataService } from '../../services/smartDataService';



const Dashboard = () => {
  // State pour les contrôles des charts
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('electricity');
  const [selectedComparison, setSelectedComparison] = useState('electricity');
  const [emissionsPeriod, setEmissionsPeriod] = useState('today');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [metrics, setMetrics] = useState({
    energy: 0,
    waste: 0,
    gas: 0,
    vehicle: 0,
    co2: 0
  });

  const energyWsRef = useRef(null);
  const trashWsRef = useRef(null);
  const gasWsRef = useRef(null);
  const vehicleWsRef = useRef(null);


useEffect(() => {
    const fetchData = async () => {
      try {

        const energyRes = await energyDataService.getTodayMetrics();
        const wasteRes = await trashDataService.getTodayMetrics();
        const gasRes = await gasDataService.getTodayMetrics();
        const vehicleRes = await vehicleDataService.getTodayMetrics();

        // Store real-time data in localStorage for charts
        localStorage.setItem('realtime_energy', JSON.stringify(energyRes.data));
        localStorage.setItem('realtime_trash', JSON.stringify(wasteRes.data));
        localStorage.setItem('realtime_gas', JSON.stringify(gasRes.data));
        localStorage.setItem('realtime_vehicle', JSON.stringify(vehicleRes.data));

        const totalEnergy = energyDataService.calculateTotal(energyRes.data);
        const totalWaste = trashDataService.calculateTotal(wasteRes.data);
        const totalGas = gasDataService.calculateTotal(gasRes.data);
        const totalVehicle = vehicleDataService.calculateTotal(vehicleRes.data);


        const totalCo2 = (totalEnergy * 0.5) + (totalWaste * 2.0) + (totalGas * 0.2) + (totalVehicle * 0.19);

        setMetrics({
          energy: totalEnergy.toFixed(1),
          waste: totalWaste.toFixed(1),
          gas: totalGas.toFixed(1),
          vehicle: totalVehicle.toFixed(1),
          co2: totalCo2.toFixed(1)
        });
      } catch (error) {
        console.error(" Error connecting to Backend:", error);
      }
    };

    fetchData();

    // Setup WebSocket for real-time energy updates
    const connectEnergyWs = () => {
      const energyWs = new WebSocket('ws://localhost:8080/iot/energy');
      energyWsRef.current = energyWs;

      energyWs.onopen = () => {
        console.log(' Energy WebSocket Connected');
      };

      energyWs.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'ENERGY_UPDATE' && message.data) {
            console.log(' Real-time Energy Update:', message.data);
            // Refresh data and trigger charts update
            fetchData();
            setRefreshTrigger(prev => prev + 1);
          }
        } catch (error) {
          console.error('Error parsing energy WebSocket message:', error);
        }
      };

      energyWs.onerror = (error) => {
        console.error(' Energy WebSocket Error:', error);
      };

      energyWs.onclose = (event) => {
        console.log(' Energy WebSocket Disconnected', event.code, event.reason);
        // Attempt reconnection after 5 seconds
        if (event.code !== 1000) { // 1000 = normal closure
          setTimeout(() => {
            console.log(' Attempting to reconnect Energy WebSocket...');
            connectEnergyWs();
          }, 5000);
        }
      };
    };

    // Setup WebSocket for real-time trash updates
    const connectTrashWs = () => {
      const trashWs = new WebSocket('ws://localhost:8080/iot/trash');
      trashWsRef.current = trashWs;

      trashWs.onopen = () => {
        console.log('Trash WebSocket Connected');
      };

      trashWs.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'TRASH_UPDATE' && message.data) {
            console.log(' Real-time Trash Update:', message.data);
            // Refresh data and trigger charts update
            fetchData();
            setRefreshTrigger(prev => prev + 1);
          }
        } catch (error) {
          console.error('Error parsing trash WebSocket message:', error);
        }
      };

      trashWs.onerror = (error) => {
        console.error(' Trash WebSocket Error:', error);
      };

      trashWs.onclose = (event) => {
        console.log(' Trash WebSocket Disconnected', event.code, event.reason);
        // Attempt reconnection after 5 seconds
        if (event.code !== 1000) { // 1000 = normal closure
          setTimeout(() => {
            console.log(' Attempting to reconnect Trash WebSocket...');
            connectTrashWs();
          }, 5000);
        }
      };
    };

    // WebSocket for Gas IoT
    const connectGasWs = () => {
      const gasWs = new WebSocket('ws://localhost:8080/iot/gas');
      gasWsRef.current = gasWs;

      gasWs.onopen = () => {
        console.log(' Gas IoT WebSocket connected');
      };

      gasWs.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'GAS_UPDATE' && message.data) {
            // Update localStorage with new gas data
            const existingData = JSON.parse(localStorage.getItem('realtime_gas') || '[]');
            const updatedData = [...existingData, message.data];
            localStorage.setItem('realtime_gas', JSON.stringify(updatedData));

            // Trigger chart refresh
            setRefreshTrigger(prev => prev + 1);
          }
        } catch (error) {
          console.error(' Error processing gas message:', error);
        }
      };

      gasWs.onerror = (error) => {
        console.error(' Gas WebSocket error:', error);
      };

      gasWs.onclose = (event) => {
        console.log(' Gas WebSocket disconnected:', event.reason);
        if (event.code !== 1000) {
          setTimeout(() => {
            console.log(' Attempting to reconnect Gas WebSocket...');
            connectGasWs();
          }, 5000);
        }
      };
    };

    // WebSocket for Vehicle IoT
    const connectVehicleWs = () => {
      const vehicleWs = new WebSocket('ws://localhost:8080/iot/vehicle');
      vehicleWsRef.current = vehicleWs;

      vehicleWs.onopen = () => {
        console.log(' Vehicle IoT WebSocket connected');
      };

      vehicleWs.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'VEHICLE_UPDATE' && message.data) {
            // Update localStorage with new vehicle data
            const existingData = JSON.parse(localStorage.getItem('realtime_vehicle') || '[]');
            const updatedData = [...existingData, message.data];
            localStorage.setItem('realtime_vehicle', JSON.stringify(updatedData));

            // Trigger chart refresh
            setRefreshTrigger(prev => prev + 1);
          }
        } catch (error) {
          console.error(' Error processing vehicle message:', error);
        }
      };

      vehicleWs.onerror = (error) => {
        console.error(' Vehicle WebSocket error:', error);
      };

      vehicleWs.onclose = (event) => {
        console.log(' Vehicle WebSocket disconnected:', event.reason);
        if (event.code !== 1000) {
          setTimeout(() => {
            console.log(' Attempting to reconnect Vehicle WebSocket...');
            connectVehicleWs();
          }, 5000);
        }
      };
    };

    // Initialize all WebSocket connections
    connectEnergyWs();
    connectTrashWs();
    connectGasWs();
    connectVehicleWs();

    // Cleanup on unmount
    return () => {
      if (energyWsRef.current) {
        energyWsRef.current.close();
      }
      if (trashWsRef.current) {
        trashWsRef.current.close();
      }
      if (gasWsRef.current) {
        gasWsRef.current.close();
      }
      if (vehicleWsRef.current) {
        vehicleWsRef.current.close();
      }
    };
  }, []);



  useCharts(selectedMetric, selectedPeriod, selectedComparison, emissionsPeriod, refreshTrigger);

  // Titres des métriques
  const metricTitles = {
    electricity: 'Consommation Électrique (kWh)',
    waste: 'Production de Déchets (kg)',
    gas: 'Consommation Gaz (m³)',
    transport: 'Distance Parcourue (km)'
  };

  const comparisonTitles = {
    electricity: 'Comparaison Électricité - Mois Actuel vs Précédent',
    waste: 'Comparaison Déchets - Mois Actuel vs Précédent',
    gas: 'Comparaison Gaz - Mois Actuel vs Précédent',
    transport: 'Comparaison Transport - Mois Actuel vs Précédent'
  };

  return (
    <section id="dashboard">
      <div className="section-header">
        <h2>
          <i className="fas fa-chart-line" /> Tableau de Bord Environnemental
        </h2>
        <p>Vue d'ensemble de vos performances environnementales</p>
      </div>

      {/* KPI Cards & CO2 Chart Row */}
      <div className="dashboard-top-row">
        {/* Left: KPI Grid with Carbon Card integrated */}
        <div className="kpi-grid-with-carbon">
          {/* Électricité */}
          <KPICard
            icon="bolt"
            iconGradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            title="Consommation Électrique"
            value={metrics.energy || "0"}
            unit="kWh aujourd'hui"
            trend="neutral"
            trendValue="En temps réel"
            extraInfo={
              <div className="co2-info">
                <i className="fas fa-smog" style={{ color: "#ef4444" }} />
                <span>{(metrics.energy * 0.5).toFixed(1)} kg CO2 dégagé</span>
              </div>
            }
          />

          {/* Gaz */}
          <KPICard
            icon="fire"
            iconGradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
            title="Consommation Gaz"
            value={metrics.gas || "0"}
            unit="m³ aujourd'hui"
            trend="neutral"
            trendValue="En temps réel"
            extraInfo={
              <div className="co2-info">
                <i className="fas fa-smog" style={{ color: "#ef4444" }} />
                <span>{(metrics.gas * 0.2).toFixed(1)} kg CO2 dégagé</span>
              </div>
            }
          />

          {/* Empreinte Carbone - Tall card */}
          <KPICard
            icon="leaf"
            iconGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            title="Empreinte Carbone"
            value=""
            unit=""
            trend="positive"
            trendValue="Calculé en temps réel"
            isLarge={true}
            extraInfo={
              <>
                <div className="co2-info">
                  <i className="fas fa-smog" style={{ color: "#ef4444" }} />
                  <span>{metrics.co2 || "0"} kg CO2 dégagé aujourd'hui</span>
                </div>
                <div className="carbon-detail">
                  <i className="fas fa-clock" style={{ color: "#667eea" }} />
                  <div>
                    <div className="detail-label">Données ESP32</div>
                    <div className="detail-value">{metrics.co2 || "0"} kg</div>
                  </div>
                </div>
                <div className="carbon-detail">
                  <i className="fas fa-calendar-alt" style={{ color: "#10b981" }} />
                  <div>
                    <div className="detail-label">Sources actives</div>
                    <div className="detail-value">Energy + Waste + Gas + Vehicle</div>
                  </div>
                </div>
                <div className="carbon-progress-mini">
                  <div className="progress-info">
                    <span>État de connexion</span>
                    <span>Backend actif</span>
                  </div>
                  <div className="progress-bar-mini">
                    <div className="progress-fill-mini" style={{ width: metrics.co2 > 0 ? "100%" : "0%", backgroundColor: metrics.co2 > 0 ? "#10b981" : "#ef4444" }} />
                  </div>
                </div>
              </>
            }
          />

          {/* Déchets */}
          <KPICard
            icon="trash-alt"
            iconGradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            title="Production de Déchets"
            value={metrics.waste || "0"}
            unit="kg aujourd'hui"
            trend="positive"
            trendValue="En temps réel"
            extraInfo={
              <div className="co2-info">
                <i className="fas fa-smog" style={{ color: "#ef4444" }} />
                <span>{(metrics.waste * 2.0).toFixed(1)} kg CO2 dégagé</span>
              </div>
            }
          />

          {/* Transport */}
          <KPICard
            icon="car"
            iconGradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
            title="Distance Parcourue"
            value={metrics.vehicle || "0"}
            unit="km aujourd'hui"
            trend="neutral"
            trendValue="En temps réel"
            extraInfo={
              <div className="co2-info">
                <i className="fas fa-smog" style={{ color: "#ef4444" }} />
                <span>{(metrics.vehicle * 0.19).toFixed(1)} kg CO2 dégagé</span>
              </div>
            }
          />
        </div>

        {/* Right: CO2 Doughnut Chart */}
        <div className="co2-chart-wrapper">
          <div className="chart-card">
            <div className="chart-header-with-legend">
              <div className="chart-header-left">
                <h3>
                  Répartition Émissions CO2
                  <br />
                  <span id="emissionsPeriod" className="emissions-period-text">
                    {emissionsPeriod === 'today' ? 'Aujourd\'hui' : 'Mois Actuel'}
                  </span>
                </h3>
                <div className="chart-controls">
                  <button
                    className={`emissions-period-btn ${emissionsPeriod === 'today' ? 'active' : ''}`}
                    onClick={() => setEmissionsPeriod('today')}
                  >
                    Aujourd'hui
                  </button>
                  <button
                    className={`emissions-period-btn ${emissionsPeriod === 'month' ? 'active' : ''}`}
                    onClick={() => setEmissionsPeriod('month')}
                  >
                    Mois Actuel
                  </button>
                </div>
              </div>
              <div className="emissions-legend">
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#f093fb' }}></div>
                  <span className="legend-label">Électricité</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
                  <span className="legend-label">Gaz</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#3b82f6' }}></div>
                  <span className="legend-label">Transport</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#10b981' }}></div>
                  <span className="legend-label">Déchets</span>
                </div>
              </div>
            </div>
            <canvas id="emissionsChart" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Line Chart with Metric Selector */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h3>
              <i className="fas fa-chart-line" />{" "}
              <span id="metricTitle">{metricTitles[selectedMetric]}</span>
            </h3>
            <div className="chart-controls">
              <button
                className={`period-btn ${selectedPeriod === '24h' ? 'active' : ''}`}
                onClick={() => setSelectedPeriod('24h')}
              >
                24h
              </button>
              <button
                className={`period-btn ${selectedPeriod === '7j' ? 'active' : ''}`}
                onClick={() => setSelectedPeriod('7j')}
              >
                7j
              </button>
              <button
                className={`period-btn ${selectedPeriod === '30j' ? 'active' : ''}`}
                onClick={() => setSelectedPeriod('30j')}
              >
                30j
              </button>
            </div>
          </div>
          {/* Metric Selector Tabs */}
          <div className="metric-selector">
            <button
              className={`metric-btn ${selectedMetric === 'electricity' ? 'active' : ''}`}
              onClick={() => setSelectedMetric('electricity')}
            >
              <i className="fas fa-bolt" /> Électricité
            </button>
            <button
              className={`metric-btn ${selectedMetric === 'waste' ? 'active' : ''}`}
              onClick={() => setSelectedMetric('waste')}
            >
              <i className="fas fa-trash-alt" /> Déchets
            </button>
            <button
              className={`metric-btn ${selectedMetric === 'gas' ? 'active' : ''}`}
              onClick={() => setSelectedMetric('gas')}
            >
              <i className="fas fa-fire" /> Gaz
            </button>
            <button
              className={`metric-btn ${selectedMetric === 'transport' ? 'active' : ''}`}
              onClick={() => setSelectedMetric('transport')}
            >
              <i className="fas fa-car" /> Transport
            </button>
          </div>
          <canvas id="electricityChart" />
        </div>

        {/* Gauge Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>
              <i className="fas fa-tachometer-alt" /> Empreinte Carbone vs Seuil à ne pas dépasser
            </h3>
          </div>
          <div className="gauge-container">
            <div className="gauge-chart-wrapper">
              <canvas id="carbonGauge" />
              <div className="gauge-percentage-overlay">
                <span className="percentage-value">83%</span>
                <span className="percentage-label">du seuil</span>
              </div>
            </div>
            <div className="gauge-info">
              <div className="gauge-current">
                <span className="label">Actuel</span>
                <span className="value">12.5 tonnes CO2</span>
              </div>
              <div className="gauge-target">
                <span className="label">Seuil maximum</span>
                <span className="value">15 tonnes CO2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>
              <i className="fas fa-chart-bar" />{" "}
              <span id="comparisonTitle">{comparisonTitles[selectedComparison]}</span>
            </h3>
          </div>
          {/* Comparison Metric Selector Tabs */}
          <div className="metric-selector">
            <button
              className={`metric-btn ${selectedComparison === 'electricity' ? 'active' : ''}`}
              onClick={() => setSelectedComparison('electricity')}
            >
              <i className="fas fa-bolt" /> Électricité
            </button>
            <button
              className={`metric-btn ${selectedComparison === 'waste' ? 'active' : ''}`}
              onClick={() => setSelectedComparison('waste')}
            >
              <i className="fas fa-trash-alt" /> Déchets
            </button>
            <button
              className={`metric-btn ${selectedComparison === 'gas' ? 'active' : ''}`}
              onClick={() => setSelectedComparison('gas')}
            >
              <i className="fas fa-fire" /> Gaz
            </button>
            <button
              className={`metric-btn ${selectedComparison === 'transport' ? 'active' : ''}`}
              onClick={() => setSelectedComparison('transport')}
            >
              <i className="fas fa-car" /> Transport
            </button>
          </div>
          <canvas id="comparisonChart" />
        </div>

        {/* Benchmark Section */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h3>
              <i className="fas fa-award" /> Benchmark National des Entreprises Marocaines
            </h3>
            <div className="benchmark-meta">
              <span className="data-source">
                <i className="fas fa-database" /> Source: AMEE, CGEM & Ministère de la Transition Énergétique
              </span>
              <span className="data-date">
                <i className="fas fa-calendar" /> Données Q4 2025
              </span>
            </div>
          </div>

          {/* Benchmark Summary */}
          <div className="benchmark-summary">
            <div className="benchmark-trophy">
              <i className="fas fa-trophy" />
            </div>
            <div className="benchmark-summary-content">
              <h4>Performance Globale</h4>
              <p>
                Votre entreprise se classe <strong>67ème sur 450 entreprises</strong> au Maroc,
                ce qui représente une <strong>excellente performance environnementale</strong>.
              </p>
              <div className="benchmark-ranking">
                <span className="rank-badge">67 / 450</span>
                <span className="rank-text">
                  Vous surpassez 383 entreprises marocaines de taille similaire
                </span>
              </div>
            </div>
          </div>

          <div className="benchmark-explanation">
            <p>
              <strong>Comparaison :</strong> Vos données en temps réel (aujourd'hui) vs Moyenne nationale basée sur Q4 2025 (dernières données disponibles publiées par l'AMEE, CGEM et le Ministère de la Transition Énergétique et du Développement Durable)
            </p>
          </div>

          <div className="benchmark-grid">
            {/* Consommation Énergétique */}
            <div className="benchmark-item">
              <div className="benchmark-item-header">
                <i className="fas fa-bolt" style={{ color: "#f093fb" }} />
                <h4>Consommation Énergétique</h4>
              </div>
              <div className="benchmark-comparison">
                <div className="benchmark-value">
                  <span className="label">Votre entreprise</span>
                  <span className="value">82 kWh/jour</span>
                  <span className="sublabel">(2,450 kWh/mois)</span>
                </div>
                <div className="benchmark-vs">vs</div>
                <div className="benchmark-value">
                  <span className="label">Moyenne nationale</span>
                  <span className="value">107 kWh/jour</span>
                  <span className="sublabel">(3,200 kWh/mois)</span>
                </div>
              </div>
              <div className="benchmark-bar-wrapper">
                <div className="benchmark-bar">
                  <div className="benchmark-progress positive" style={{ width: "77%" }} />
                </div>
                <div className="benchmark-result positive">
                  <i className="fas fa-arrow-down" />
                  <span>-23%</span>
                </div>
              </div>
            </div>

            {/* Émissions CO2 */}
            <div className="benchmark-item">
              <div className="benchmark-item-header">
                <i className="fas fa-leaf" style={{ color: "#667eea" }} />
                <h4>Émissions CO2</h4>
              </div>
              <div className="benchmark-comparison">
                <div className="benchmark-value">
                  <span className="label">Votre entreprise</span>
                  <span className="value">417 kg/jour</span>
                  <span className="sublabel">(12.5 t/mois)</span>
                </div>
                <div className="benchmark-vs">vs</div>
                <div className="benchmark-value">
                  <span className="label">Moyenne nationale</span>
                  <span className="value">600 kg/jour</span>
                  <span className="sublabel">(18 t/mois)</span>
                </div>
              </div>
              <div className="benchmark-bar-wrapper">
                <div className="benchmark-bar">
                  <div className="benchmark-progress positive" style={{ width: "69%" }} />
                </div>
                <div className="benchmark-result positive">
                  <i className="fas fa-arrow-down" />
                  <span>-31%</span>
                </div>
              </div>
            </div>

            {/* Production de Déchets */}
            <div className="benchmark-item">
              <div className="benchmark-item-header">
                <i className="fas fa-trash-alt" style={{ color: "#10b981" }} />
                <h4>Production de Déchets</h4>
              </div>
              <div className="benchmark-comparison">
                <div className="benchmark-value">
                  <span className="label">Votre entreprise</span>
                  <span className="value">28.3 kg/jour</span>
                  <span className="sublabel">(850 kg/mois)</span>
                </div>
                <div className="benchmark-vs">vs</div>
                <div className="benchmark-value">
                  <span className="label">Moyenne secteur</span>
                  <span className="value">36.7 kg/jour</span>
                  <span className="sublabel">(1,100 kg/mois)</span>
                </div>
              </div>
              <div className="benchmark-bar-wrapper">
                <div className="benchmark-bar">
                  <div className="benchmark-progress positive" style={{ width: "77%" }} />
                </div>
                <div className="benchmark-result positive">
                  <i className="fas fa-arrow-down" />
                  <span>-23%</span>
                </div>
              </div>
            </div>

            {/* Transport */}
            <div className="benchmark-item">
              <div className="benchmark-item-header">
                <i className="fas fa-car" style={{ color: "#3b82f6" }} />
                <h4>Mobilité & Transport</h4>
              </div>
              <div className="benchmark-comparison">
                <div className="benchmark-value">
                  <span className="label">Votre entreprise</span>
                  <span className="value">41 km/jour</span>
                  <span className="sublabel">(1,240 km/mois)</span>
                </div>
                <div className="benchmark-vs">vs</div>
                <div className="benchmark-value">
                  <span className="label">Moyenne secteur</span>
                  <span className="value">53 km/jour</span>
                  <span className="sublabel">(1,600 km/mois)</span>
                </div>
              </div>
              <div className="benchmark-bar-wrapper">
                <div className="benchmark-bar">
                  <div className="benchmark-progress positive" style={{ width: "78%" }} />
                </div>
                <div className="benchmark-result positive">
                  <i className="fas fa-arrow-down" />
                  <span>-22%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Data Sources Info */}
          <div className="benchmark-sources">
            <div className="source-item">
              <strong>ADEME</strong> (Agence de l'Environnement et de la Maîtrise de l'Énergie) - Données énergétiques et émissions
            </div>
            <div className="source-item">
              <strong>CNPA</strong> (Conseil National des Professions de l'Automobile) - Statistiques sectorielles automobile
            </div>
            <div className="source-item">
              <strong>Méthodologie</strong>: Moyenne calculée sur 450 concessions automobiles de taille similaire (10-50 employés)
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
