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

  // État pour les données mensuelles (utilisé pour le graphique CO2 du mois actuel)
  const [monthlyMetrics, setMonthlyMetrics] = useState({
    energy: 0,
    waste: 0,
    gas: 0,
    vehicle: 0,
    co2: 0
  });

  const [historyData, setHistoryData] = useState(null);

  // État pour les données de comparaison mensuelle (Mois Actuel vs Mois Précédent)
  const [comparisonData, setComparisonData] = useState({
    electricity: { labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'], currentMonth: [], previousMonth: [] },
    waste: { labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'], currentMonth: [], previousMonth: [] },
    gas: { labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'], currentMonth: [], previousMonth: [] },
    transport: { labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'], currentMonth: [], previousMonth: [] }
  });

  const energyWsRef = useRef(null);
  const trashWsRef = useRef(null);

  // Fetch history data when period or metric changes (for 7j and 30j)
  useEffect(() => {
    const fetchHistory = async () => {
      // For 24h, let useCharts/dataGenerator handle it (it uses realtime data locally)
      if (selectedPeriod === '24h') {
        setHistoryData(null);
        return;
      }

      const days = selectedPeriod === '7j' ? 7 : 30;
      let service;
      switch (selectedMetric) {
        case 'electricity': service = energyDataService; break;
        case 'waste': service = trashDataService; break;
        case 'gas': service = gasDataService; break;
        case 'transport': service = vehicleDataService; break;
        default: service = energyDataService;
      }

      setHistoryData(null); // Clear previous data while loading (optional)

      if (service && service.getHistoryMetrics) {
        try {
          console.log(`Fetching history for ${selectedMetric} over ${days} days...`);
          const res = await service.getHistoryMetrics(days);
          console.log('History Response:', res.data);

          if (res.data) {
            // Sort data by date
            const sortedData = res.data.sort((a, b) => new Date(a.date) - new Date(b.date));

            // Format for Chart.js
            const formattedData = {
              metric: selectedMetric,
              labels: sortedData.map(d => new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })),
              data: sortedData.map(d => {
                if (d.totalEnergyKwh !== undefined) return d.totalEnergyKwh;
                if (d.totalWeightKg !== undefined) return d.totalWeightKg; // totalWeightKg from Trash DTO
                if (d.totalGasConsumed !== undefined) return d.totalGasConsumed; // totalGasConsumed from Gas DTO
                // Vehicle might default to 0 for now as we didn't implement backend
                return 0;
              })
            };
            setHistoryData(formattedData);
          }
        } catch (e) {
          console.error("Fetch history failed", e);
          setHistoryData(null); // Fallback to static if failed
        }
      }
    };

    fetchHistory();
  }, [selectedPeriod, selectedMetric]);


  useEffect(() => {
    const fetchData = async () => {
      try {

        const energyRes = await energyDataService.getTodayMetrics();
        const wasteRes = await trashDataService.getTodayMetrics();
        const gasRes = await gasDataService.getTodayMetrics();
        const vehicleRes = await vehicleDataService.getTodayMetrics();

        // Store real-time data in localStorage for charts
        localStorage.setItem('realtime_energy', JSON.stringify(energyRes.data || []));
        localStorage.setItem('realtime_trash', JSON.stringify(wasteRes.data || []));
        localStorage.setItem('realtime_gas', JSON.stringify(gasRes.data || []));
        localStorage.setItem('realtime_vehicle', JSON.stringify(vehicleRes.data || []));

        const totalEnergy = energyDataService.calculateTotal(energyRes.data);
        // Manual entries are now saved to database and included in getTodayMetrics() response
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

    // Fetch monthly data from history endpoints (30 days)
    const fetchMonthlyData = async () => {
      try {
        // Fetch 30 days history for each metric
        const [energyHistory, trashHistory, gasHistory] = await Promise.all([
          energyDataService.getHistoryMetrics(30).catch(() => ({ data: [] })),
          trashDataService.getHistoryMetrics(30).catch(() => ({ data: [] })),
          gasDataService.getHistoryMetrics(30).catch(() => ({ data: [] }))
        ]);

        // Calculate monthly totals from history data
        let monthlyEnergy = 0;
        let monthlyWaste = 0;
        let monthlyGas = 0;
        let monthlyVehicle = 0;

        // Parse energy history
        if (energyHistory.data && Array.isArray(energyHistory.data)) {
          monthlyEnergy = energyHistory.data.reduce((sum, d) => sum + (d.totalEnergyKwh || 0), 0);
        }

        // Parse trash history
        if (trashHistory.data && Array.isArray(trashHistory.data)) {
          monthlyWaste = trashHistory.data.reduce((sum, d) => sum + (d.totalWeightKg || 0), 0);
        }

        // Parse gas history
        if (gasHistory.data && Array.isArray(gasHistory.data)) {
          monthlyGas = gasHistory.data.reduce((sum, d) => sum + (d.totalGasConsumed || 0), 0);
        }

        // Vehicle: for now use today's value * 30 as fallback (no history endpoint yet)
        // This can be improved when vehicle history API is available
        const vehicleRes = await vehicleDataService.getTodayMetrics().catch(() => ({ data: [] }));
        const dailyVehicle = vehicleDataService.calculateTotal(vehicleRes.data || []);
        monthlyVehicle = dailyVehicle * 30; // Fallback estimation

        const monthlyCo2 = (monthlyEnergy * 0.5) + (monthlyWaste * 2.0) + (monthlyGas * 0.2) + (monthlyVehicle * 0.19);

        console.log('Monthly metrics fetched:', { monthlyEnergy, monthlyWaste, monthlyGas, monthlyVehicle, monthlyCo2 });

        setMonthlyMetrics({
          energy: monthlyEnergy.toFixed(1),
          waste: monthlyWaste.toFixed(1),
          gas: monthlyGas.toFixed(1),
          vehicle: monthlyVehicle.toFixed(1),
          co2: monthlyCo2.toFixed(1)
        });
      } catch (error) {
        console.error('Error fetching monthly data:', error);
      }
    };

    // Fetch comparison data for current month vs previous month (weekly breakdown)
    const fetchComparisonData = async () => {
      try {
        // Helper function to group daily data into weeks
        const groupByWeeks = (data, valueField) => {
          const weeks = [0, 0, 0, 0];
          if (!data || !Array.isArray(data)) return weeks;

          data.forEach((item, index) => {
            // Divide 30 days into 4 weeks (approximately 7-8 days each)
            const weekIndex = Math.min(Math.floor(index / 7), 3);
            weeks[weekIndex] += (item[valueField] || 0);
          });

          return weeks.map(v => Math.round(v * 10) / 10);
        };

        // Fetch 60 days to cover current month (30 days) + previous month (30 days)
        const [energyHistory, trashHistory, gasHistory] = await Promise.all([
          energyDataService.getHistoryMetrics(60).catch(() => ({ data: [] })),
          trashDataService.getHistoryMetrics(60).catch(() => ({ data: [] })),
          gasDataService.getHistoryMetrics(60).catch(() => ({ data: [] }))
        ]);

        // Split data into current month (last 30 days) and previous month (30 days before that)
        const splitData = (historyData) => {
          if (!historyData || !Array.isArray(historyData)) return { current: [], previous: [] };

          // Sort by date descending to ensure correct split
          const sorted = [...historyData].sort((a, b) => new Date(b.date) - new Date(a.date));

          // First 30 are current month, next 30 are previous month
          return {
            current: sorted.slice(0, 30).reverse(), // Oldest to newest for current month
            previous: sorted.slice(30, 60).reverse() // Oldest to newest for previous month
          };
        };

        const energySplit = splitData(energyHistory.data);
        const trashSplit = splitData(trashHistory.data);
        const gasSplit = splitData(gasHistory.data);

        // Group by weeks
        const newComparisonData = {
          electricity: {
            labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
            currentMonth: groupByWeeks(energySplit.current, 'totalEnergyKwh'),
            previousMonth: groupByWeeks(energySplit.previous, 'totalEnergyKwh')
          },
          waste: {
            labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
            currentMonth: groupByWeeks(trashSplit.current, 'totalWeightKg'),
            previousMonth: groupByWeeks(trashSplit.previous, 'totalWeightKg')
          },
          gas: {
            labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
            currentMonth: groupByWeeks(gasSplit.current, 'totalGasConsumed'),
            previousMonth: groupByWeeks(gasSplit.previous, 'totalGasConsumed')
          },
          transport: {
            // Vehicle doesn't have history endpoint yet, keep empty or use fallback
            labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
            currentMonth: [0, 0, 0, 0],
            previousMonth: [0, 0, 0, 0]
          }
        };

        console.log('Comparison data fetched:', newComparisonData);
        setComparisonData(newComparisonData);
      } catch (error) {
        console.error('Error fetching comparison data:', error);
      }
    };

    fetchData();
    fetchMonthlyData();
    fetchComparisonData();

    // Retry fetching data every 10 seconds to get updates from manual gas input and mobile vehicle data
    const retryInterval = setInterval(() => {
      fetchData();
      fetchMonthlyData();
      fetchComparisonData();
    }, 10000);

    // Setup WebSocket for real-time energy updates
    const connectEnergyWs = () => {
      const energyWs = new WebSocket('ws://' + process.env.REACT_APP_API_URL + '/iot/energy');
      energyWsRef.current = energyWs;

      energyWs.onopen = () => {
        console.log(' Energy WebSocket Connected');
        fetchData();
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
        console.log('🔌 Energy WebSocket Disconnected', event.code, event.reason);
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
      const trashWs = new WebSocket('ws://' + process.env.REACT_APP_API_URL + '/iot/trash');
      trashWsRef.current = trashWs;

      trashWs.onopen = () => {
        console.log(' Trash WebSocket Connected');
        fetchData();
      };

      trashWs.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'TRASH_UPDATE' && message.data) {
            console.log('🗑️ Real-time Trash Update:', message.data);
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
        console.log('🔌 Trash WebSocket Disconnected', event.code, event.reason);
        // Attempt reconnection after 5 seconds
        if (event.code !== 1000) { // 1000 = normal closure
          setTimeout(() => {
            console.log(' Attempting to reconnect Trash WebSocket...');
            connectTrashWs();
          }, 5000);
        }
      };
    };

    // Initialize WebSocket connections (only energy and trash - gas is manual, vehicle is from mobile)
    connectEnergyWs();
    connectTrashWs();

    // Cleanup on unmount
    return () => {
      clearInterval(retryInterval);
      if (energyWsRef.current) {
        energyWsRef.current.close();
      }
      if (trashWsRef.current) {
        trashWsRef.current.close();
      }
    };
  }, []);



  useCharts(selectedMetric, selectedPeriod, selectedComparison, emissionsPeriod, refreshTrigger, metrics, historyData, monthlyMetrics, comparisonData);

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
