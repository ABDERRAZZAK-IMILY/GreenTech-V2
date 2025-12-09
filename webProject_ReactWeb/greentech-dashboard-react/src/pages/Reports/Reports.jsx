import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { showNotification } from '../../utils/notifications';
import { useLoading } from '../../contexts/LoadingContext';

const Reports = () => {
  const carbonDoughnutRef = useRef(null);
  const carbonDoughnutChartRef = useRef(null);

  // Use loading context
  const {
    setIsGeneratingCarbon,
    setCarbonProgress,
    setCarbonStep,
    isCarbonGenerated,
    setIsCarbonGenerated,
    setIsGeneratingExport,
    setExportProgress,
    setExportStep,
    isExportGenerated,
    setIsExportGenerated,
    setIsGeneratingComparison,
    setComparisonProgress,
    setComparisonStep,
    isComparisonGenerated,
    setIsComparisonGenerated
  } = useLoading();

  // Generate Carbon Report
  const generateCarbonReport = () => {
    setIsGeneratingCarbon(true);
    setCarbonProgress(0);

    const steps = [
      { progress: 0, message: 'Initialisation...', duration: 400 },
      { progress: 25, message: 'Calcul des émissions CO2...', duration: 800 },
      { progress: 50, message: 'Analyse par catégorie...', duration: 900 },
      { progress: 75, message: 'Génération du graphique...', duration: 700 },
      { progress: 100, message: 'Finalisation...', duration: 300 }
    ];

    let currentStep = 0;

    const executeStep = () => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        setCarbonProgress(step.progress);
        setCarbonStep(step.message);

        setTimeout(() => {
          currentStep++;
          executeStep();
        }, step.duration);
      } else {
        setTimeout(() => {
          setIsGeneratingCarbon(false);
          setIsCarbonGenerated(true);
          showNotification('Empreinte Carbone générée avec succès!', 'success');
        }, 200);
      }
    };

    executeStep();
  };

  // Generate Export/History Report
  const generateExportReport = () => {
    setIsGeneratingExport(true);
    setExportProgress(0);

    const steps = [
      { progress: 0, message: 'Initialisation...', duration: 400 },
      { progress: 25, message: 'Préparation des données...', duration: 700 },
      { progress: 50, message: 'Génération historique...', duration: 900 },
      { progress: 75, message: 'Création des exports...', duration: 800 },
      { progress: 100, message: 'Finalisation...', duration: 300 }
    ];

    let currentStep = 0;

    const executeStep = () => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        setExportProgress(step.progress);
        setExportStep(step.message);

        setTimeout(() => {
          currentStep++;
          executeStep();
        }, step.duration);
      } else {
        setTimeout(() => {
          setIsGeneratingExport(false);
          setIsExportGenerated(true);
          showNotification('Export & Historique générés avec succès!', 'success');
        }, 200);
      }
    };

    executeStep();
  };

  // Generate Comparison Report
  const generateComparisonReport = () => {
    setIsGeneratingComparison(true);
    setComparisonProgress(0);

    const steps = [
      { progress: 0, message: 'Initialisation...', duration: 400 },
      { progress: 25, message: 'Récupération données mensuelles...', duration: 800 },
      { progress: 50, message: 'Calcul des différences...', duration: 700 },
      { progress: 75, message: 'Analyse comparative...', duration: 900 },
      { progress: 100, message: 'Finalisation...', duration: 300 }
    ];

    let currentStep = 0;

    const executeStep = () => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        setComparisonProgress(step.progress);
        setComparisonStep(step.message);

        setTimeout(() => {
          currentStep++;
          executeStep();
        }, step.duration);
      } else {
        setTimeout(() => {
          setIsGeneratingComparison(false);
          setIsComparisonGenerated(true);
          showNotification('Comparaison Mensuelle générée avec succès!', 'success');
        }, 200);
      }
    };

    executeStep();
  };

  useEffect(() => {
    // Initialize Carbon Doughnut Chart only when data is generated
    if (carbonDoughnutRef.current && isCarbonGenerated) {
      // Destroy existing chart if it exists
      if (carbonDoughnutChartRef.current) {
        carbonDoughnutChartRef.current.destroy();
      }

      const ctx = carbonDoughnutRef.current.getContext('2d');
      carbonDoughnutChartRef.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Électricité', 'Transport', 'Déchets', 'Gaz'],
          datasets: [{
            data: [45, 30, 15, 10],
            backgroundColor: ['#ffa502', '#f093fb', '#5f27cd', '#43e97b'],
            borderColor: '#ffffff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'right',
              align: 'center',
              labels: {
                color: '#ffffff',
                padding: 15,
                font: { size: 12 },
                boxWidth: 20,
                boxHeight: 20
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  return `${context.label}: ${context.parsed}%`;
                }
              }
            },
            datalabels: {
              display: true,
              color: '#ffffff',
              font: {
                size: 16,
                weight: 'bold'
              },
              formatter: (value, context) => {
                return value + '%';
              }
            }
          },
          layout: {
            padding: 10
          }
        },
        plugins: [{
          id: 'percentageLabels',
          afterDatasetsDraw: (chart) => {
            const ctx = chart.ctx;
            chart.data.datasets.forEach((dataset, i) => {
              const meta = chart.getDatasetMeta(i);
              meta.data.forEach((arc, index) => {
                const data = dataset.data[index];
                const centerX = arc.x;
                const centerY = arc.y;
                const radius = (arc.innerRadius + arc.outerRadius) / 2;
                const startAngle = arc.startAngle;
                const endAngle = arc.endAngle;
                const angle = (startAngle + endAngle) / 2;

                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(data + '%', x, y);
              });
            });
          }
        }]
      });
    }

    return () => {
      if (carbonDoughnutChartRef.current) {
        carbonDoughnutChartRef.current.destroy();
      }
    };
  }, [isCarbonGenerated]);

  const exportReport = (reportType) => {
    const reports = {
      'monthly-pdf': 'Rapport Mensuel PDF',
      'carbon-excel': 'Bilan Carbone Excel',
      'analytics-csv': 'Données Brutes CSV'
    };

    const reportName = reports[reportType] || reportType;
    showNotification(`Téléchargement de "${reportName}" en cours...`, 'success');
    console.log(`Exporting report: ${reportType}`);
  };

  const downloadHistoricalReport = (period) => {
    showNotification(`Téléchargement du rapport ${period}...`, 'success');
    console.log(`Downloading historical report for: ${period}`);
  };

  return (
    <section id="reports" style={{ width: '105%', maxWidth: '105%', marginLeft: '-2.5%' }}>
      <div className="section-header">
        <h2><i className="fas fa-file-alt"></i> Rapports & Analytics</h2>
        <p>Génération et export de rapports détaillés</p>
      </div>

      {/* Reports Grid (2 rows layout) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '25px',
        width: '100%',
        maxWidth: '100%'
      }}>

        {/* First Row: Carbon + Export side by side */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '25px',
          width: '100%'
        }}>

        {/* Left Column: Empreinte Carbone */}
        <div className="reports-card carbon-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}><i className="fas fa-smog"></i> Empreinte Carbone</h3>
            <button onClick={generateCarbonReport} className="btn-primary">
              <i className={isCarbonGenerated ? "fas fa-sync-alt" : "fas fa-play"}></i>
              {isCarbonGenerated ? 'Régénérer' : 'Générer'}
            </button>
          </div>

          {!isCarbonGenerated ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--text-secondary)'
            }}>
              <i className="fas fa-smog" style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.3 }}></i>
              <p style={{ fontSize: '16px', margin: 0 }}>
                Aucune donnée d'empreinte carbone générée.
              </p>
              <p style={{ fontSize: '14px', marginTop: '10px', opacity: 0.7 }}>
                Cliquez sur "Générer" pour calculer votre empreinte carbone.
              </p>
            </div>
          ) : (
            <>
              {/* Répartition du Mois - 2x2 Grid */}
              <div style={{ marginBottom: '20px' }}>
                <h4>Répartition du Mois</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginTop: '15px'
            }}>
              <div className="carbon-item" style={{ background: 'rgba(255, 165, 2, 0.15)', borderLeft: '4px solid #ffa502' }}>
                <div className="carbon-item-header">
                  <span className="carbon-icon">🔌</span>
                  <span className="carbon-name">Électricité</span>
                  <span className="carbon-percentage">45%</span>
                </div>
                <div className="carbon-value">5.6 tonnes CO2</div>
                <div style={{ fontSize: '0.85em', color: '#7f8c8d', marginTop: '5px' }}>
                  🏭 Production (45%) • 🏢 Bureaux (25%) • 📦 Entrepôt (20%) • ☕ Cafétéria (10%)
                </div>
              </div>
              <div className="carbon-item" style={{ background: 'rgba(240, 147, 251, 0.15)', borderLeft: '4px solid #f093fb' }}>
                <div className="carbon-item-header">
                  <span className="carbon-icon">🚗</span>
                  <span className="carbon-name">Transport</span>
                  <span className="carbon-percentage">30%</span>
                </div>
                <div className="carbon-value">3.8 tonnes CO2</div>
                <div style={{ fontSize: '0.85em', color: '#7f8c8d', marginTop: '5px' }}>
                  🚚 Camion (35%) • 🚐 Camionnette (25%) • 🚗 Voitures (20%) • 🚙 Utilitaire (15%) • 🏍️ Moto (5%)
                </div>
              </div>
              <div className="carbon-item" style={{ background: 'rgba(95, 39, 205, 0.15)', borderLeft: '4px solid #5f27cd' }}>
                <div className="carbon-item-header">
                  <span className="carbon-icon">🗑️</span>
                  <span className="carbon-name">Déchets</span>
                  <span className="carbon-percentage">15%</span>
                </div>
                <div className="carbon-value">1.9 tonnes CO2</div>
                <div style={{ fontSize: '0.85em', color: '#7f8c8d', marginTop: '5px' }}>
                  ♻️ Recyclable (42%) • 🍃 Organique (35%) • 🗑️ Non-recyclable (23%)
                </div>
              </div>
              <div className="carbon-item" style={{ background: 'rgba(67, 233, 123, 0.15)', borderLeft: '4px solid #43e97b' }}>
                <div className="carbon-item-header">
                  <span className="carbon-icon">🔥</span>
                  <span className="carbon-name">Gaz</span>
                  <span className="carbon-percentage">10%</span>
                </div>
                <div className="carbon-value">1.2 tonnes CO2</div>
                <div style={{ fontSize: '0.85em', color: '#7f8c8d', marginTop: '5px' }}>
                  🍳 Cuisine (30%) • 🌡️ Chauffage (25%) • ❄️ Climatisation (20%) • 💧 Eau Chaude (15%) • 🏭 Production (10%)
                </div>
              </div>
            </div>
          </div>

          {/* Doughnut Chart */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '20px',
            maxWidth: '350px',
            margin: '0 auto 20px'
          }}>
            <canvas ref={carbonDoughnutRef} id="carbonDoughnutChart"></canvas>
          </div>

          {/* Total + Comparison */}
          <div style={{ marginBottom: '15px' }}>
            <div className="carbon-total">
              <span>Total:</span>
              <span className="total-value">12.5 tonnes CO2</span>
            </div>
            <div className="carbon-comparison">
              <i className="fas fa-arrow-down"></i>
              <span>-8% vs mois dernier</span>
            </div>
          </div>

          <div className="carbon-offset">
            <h4>Compensation Carbone</h4>
            <div className="offset-option">
              <i className="fas fa-tree"></i>
              <span>Pour compenser: plantez 625 arbres 🌳</span>
            </div>
            <div className="offset-option">
              <i className="fas fa-bolt"></i>
              <span>Ou: Économisez 5,000 kWh d'électricité</span>
            </div>
          </div>
            </>
          )}
        </div>

        {/* Right side of first row: Export & Historique */}
        <div className="reports-card export-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}><i className="fas fa-download"></i> Export & Historique</h3>
            <button onClick={generateExportReport} className="btn-primary">
              <i className={isExportGenerated ? "fas fa-sync-alt" : "fas fa-play"}></i>
              {isExportGenerated ? 'Régénérer' : 'Générer'}
            </button>
          </div>

          {!isExportGenerated ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--text-secondary)'
            }}>
              <i className="fas fa-download" style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.3 }}></i>
              <p style={{ fontSize: '16px', margin: 0 }}>
                Aucun export ou historique généré.
              </p>
              <p style={{ fontSize: '14px', marginTop: '10px', opacity: 0.7 }}>
                Cliquez sur "Générer" pour créer les données d'export et l'historique.
              </p>
            </div>
          ) : (
            <>

          <div className="export-buttons">
            <h4>📄 Télécharger les Rapports</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '15px' }}>
              Exportez vos données au format PDF, Excel ou CSV
            </p>
            <button className="btn-export" onClick={() => exportReport('monthly-pdf')}>
              <i className="fas fa-file-pdf"></i>
              <span>Rapport Mensuel PDF</span>
              <i className="fas fa-download"></i>
            </button>
            <button className="btn-export" onClick={() => exportReport('carbon-excel')}>
              <i className="fas fa-file-excel"></i>
              <span>Bilan Carbone Excel</span>
              <i className="fas fa-download"></i>
            </button>
            <button className="btn-export" onClick={() => exportReport('analytics-csv')}>
              <i className="fas fa-file-csv"></i>
              <span>Données Brutes CSV</span>
              <i className="fas fa-download"></i>
            </button>
          </div>

          <div className="historical-data">
            <h4>📊 Historique des Rapports Mensuels</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '15px' }}>
              Consultez vos performances passées. Chaque ligne = un mois de données (émissions CO2, coûts, nombre d'actions réalisées)
            </p>
            <div className="historical-table-container">
              <table className="historical-table" style={{ tableLayout: 'auto' }}>
                <thead>
                  <tr>
                    <th style={{ paddingRight: '20px' }}>Date</th>
                    <th style={{ paddingLeft: '20px' }}>Type</th>
                    <th>CO2</th>
                    <th>Coût</th>
                    <th>Actions</th>
                    <th>Download</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ paddingRight: '20px' }}>Décembre 2025</td>
                    <td style={{ paddingLeft: '20px' }}>Mensuel</td>
                    <td>12.5 t</td>
                    <td>8,450MAD</td>
                    <td>8</td>
                    <td><button className="btn-download-row" onClick={() => downloadHistoricalReport('2025-12')}><i className="fas fa-download"></i></button></td>
                  </tr>
                  <tr>
                    <td style={{ paddingRight: '20px' }}>Novembre 2025</td>
                    <td style={{ paddingLeft: '20px' }}>Mensuel</td>
                    <td>13.6 t</td>
                    <td>9,200MAD</td>
                    <td>5</td>
                    <td><button className="btn-download-row" onClick={() => downloadHistoricalReport('2025-11')}><i className="fas fa-download"></i></button></td>
                  </tr>
                  <tr>
                    <td style={{ paddingRight: '20px' }}>Octobre 2025</td>
                    <td style={{ paddingLeft: '20px' }}>Mensuel</td>
                    <td>14.2 t</td>
                    <td>9,800MAD</td>
                    <td>3</td>
                    <td><button className="btn-download-row" onClick={() => downloadHistoricalReport('2025-10')}><i className="fas fa-download"></i></button></td>
                  </tr>
                  <tr>
                    <td style={{ paddingRight: '20px' }}>Septembre 2025</td>
                    <td style={{ paddingLeft: '20px' }}>Mensuel</td>
                    <td>15.1 t</td>
                    <td>10,200MAD</td>
                    <td>2</td>
                    <td><button className="btn-download-row" onClick={() => downloadHistoricalReport('2025-09')}><i className="fas fa-download"></i></button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
            </>
          )}
        </div>

        </div> {/* End of first row */}

        {/* Second Row: Comparaison Mensuelle (full width) */}
        <div className="reports-card comparison-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}><i className="fas fa-exchange-alt"></i> Comparaison Mensuelle</h3>
            <button onClick={generateComparisonReport} className="btn-primary">
              <i className={isComparisonGenerated ? "fas fa-sync-alt" : "fas fa-play"}></i>
              {isComparisonGenerated ? 'Régénérer' : 'Générer'}
            </button>
          </div>

          {!isComparisonGenerated ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--text-secondary)'
            }}>
              <i className="fas fa-exchange-alt" style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.3 }}></i>
              <p style={{ fontSize: '16px', margin: 0 }}>
                Aucune comparaison mensuelle générée.
              </p>
              <p style={{ fontSize: '14px', marginTop: '10px', opacity: 0.7 }}>
                Cliquez sur "Générer" pour comparer les données mensuelles.
              </p>
            </div>
          ) : (
            <>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Comparez vos performances actuelles avec le mois précédent
          </p>

          {/* Comparisons avec format largeurs fixes comme les prédictions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Électricité */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid rgba(254, 202, 87, 0.2)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '70px 155px 135px 200px 160px 160px 150px 150px',
                gap: '12px',
                alignItems: 'center'
              }}>
                {/* Icône */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px'
                }}>
                  🔌
                </div>

                {/* Titre */}
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: '700' }}>
                    Électricité
                  </h4>
                  <p style={{ margin: '0', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Comparaison mensuelle
                  </p>
                </div>

                {/* Valeurs */}
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Nov: 4,200 kWh
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#feca57' }}>
                    Déc: 3,850 kWh
                  </div>
                </div>

                {/* Résultat */}
                <div style={{
                  background: 'rgba(67, 233, 123, 0.15)',
                  borderLeft: '4px solid #43e97b',
                  borderRadius: '8px',
                  padding: '10px 14px'
                }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#43e97b', marginBottom: '4px' }}>
                    <i className="fas fa-arrow-down"></i> -350 kWh (-8.3%)
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                    🏭 Production: -150 • 🏢 -120
                  </div>
                </div>

                {/* Économies financières */}
                <div style={{
                  background: 'rgba(72, 219, 251, 0.1)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    💰 Économie
                  </div>
                  <div style={{ fontSize: '17px', fontWeight: '700', color: '#48dbfb' }}>
                    -245 MAD
                  </div>
                </div>

                {/* Tendance */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '10px 14px'
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    📊 Tendance 3 mois
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#43e97b' }}>
                    Oct: 4,350<br/>Nov: 4,200<br/>Déc: 3,850
                  </div>
                </div>

                {/* Pic de consommation */}
                <div style={{
                  background: 'rgba(255, 165, 2, 0.1)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    ⚡ Pic heure
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#feca57' }}>
                    18h-20h
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    650 kWh/h
                  </div>
                </div>

                {/* Efficacité énergétique */}
                <div style={{
                  background: 'rgba(67, 233, 123, 0.1)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    📈 Efficacité
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#43e97b' }}>
                    +5.2%
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    vs objectif
                  </div>
                </div>
              </div>
            </div>

            {/* Transport */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid rgba(72, 219, 251, 0.2)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '70px 155px 135px 200px 160px 160px 150px 150px',
                gap: '12px',
                alignItems: 'center'
              }}>
                {/* Icône */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #48dbfb 0%, #0abde3 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px'
                }}>
                  🚗
                </div>

                {/* Titre */}
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: '700' }}>
                    Transport
                  </h4>
                  <p style={{ margin: '0', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Comparaison mensuelle
                  </p>
                </div>

                {/* Valeurs */}
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Nov: 8,650 km
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#48dbfb' }}>
                    Déc: 8,370 km
                  </div>
                </div>

                {/* Résultat */}
                <div style={{
                  background: 'rgba(67, 233, 123, 0.15)',
                  borderLeft: '4px solid #43e97b',
                  borderRadius: '8px',
                  padding: '10px 14px'
                }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#43e97b', marginBottom: '4px' }}>
                    <i className="fas fa-arrow-down"></i> -280 km (-3.2%)
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                    Meilleure planif. • 🏍️ +15%
                  </div>
                </div>

                {/* Émissions CO2 */}
                <div style={{
                  background: 'rgba(67, 233, 123, 0.1)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    🌱 CO2 économisé
                  </div>
                  <div style={{ fontSize: '17px', fontWeight: '700', color: '#43e97b' }}>
                    -68 kg
                  </div>
                </div>

                {/* Carburant */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '10px 14px'
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    ⛽ Carburant
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#48dbfb' }}>
                    22 litres<br/>(-185 MAD)
                  </div>
                </div>

                {/* Distance moyenne */}
                <div style={{
                  background: 'rgba(72, 219, 251, 0.1)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    📏 Moyenne/jour
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#48dbfb' }}>
                    279 km
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    -9 km vs Nov
                  </div>
                </div>

                {/* Véhicules actifs */}
                <div style={{
                  background: 'rgba(72, 219, 251, 0.1)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    🚙 Véhicules
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#48dbfb' }}>
                    8 actifs
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    85% taux usage
                  </div>
                </div>
              </div>
            </div>

            {/* Déchets */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid rgba(95, 39, 205, 0.2)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '70px 155px 135px 200px 160px 160px 150px 150px',
                gap: '12px',
                alignItems: 'center'
              }}>
                {/* Icône */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #5f27cd 0%, #341f97 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px'
                }}>
                  🗑️
                </div>

                {/* Titre */}
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: '700' }}>
                    Déchets
                  </h4>
                  <p style={{ margin: '0', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Comparaison mensuelle
                  </p>
                </div>

                {/* Valeurs */}
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Nov: 518 kg
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#a29bfe' }}>
                    Déc: 498 kg
                  </div>
                </div>

                {/* Résultat */}
                <div style={{
                  background: 'rgba(67, 233, 123, 0.15)',
                  borderLeft: '4px solid #43e97b',
                  borderRadius: '8px',
                  padding: '10px 14px'
                }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#43e97b', marginBottom: '4px' }}>
                    <i className="fas fa-arrow-down"></i> -20 kg (-3.9%)
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                    ♻️ Recyclage: 40% → 42%
                  </div>
                </div>

                {/* Taux de recyclage */}
                <div style={{
                  background: 'rgba(67, 233, 123, 0.1)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    ♻️ Taux recyclage
                  </div>
                  <div style={{ fontSize: '17px', fontWeight: '700', color: '#43e97b' }}>
                    42%
                  </div>
                </div>

                {/* Coût traitement */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '10px 14px'
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    💸 Coût
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#a29bfe' }}>
                    Nov: 2,590<br/>Déc: 2,490
                  </div>
                </div>

                {/* Collecte */}
                <div style={{
                  background: 'rgba(95, 39, 205, 0.1)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    🚛 Collectes
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#a29bfe' }}>
                    12 fois
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    41.5 kg/collecte
                  </div>
                </div>

                {/* Compostage */}
                <div style={{
                  background: 'rgba(67, 233, 123, 0.1)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    🍃 Compostage
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#43e97b' }}>
                    174 kg
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    35% organique
                  </div>
                </div>
              </div>
            </div>

            {/* Gaz */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid rgba(255, 99, 72, 0.2)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '70px 155px 135px 200px 160px 160px 150px 150px',
                gap: '12px',
                alignItems: 'center'
              }}>
                {/* Icône */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ff6348 0%, #ff4757 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px'
                }}>
                  🔥
                </div>

                {/* Titre */}
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: '700' }}>
                    Gaz
                  </h4>
                  <p style={{ margin: '0', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Comparaison mensuelle
                  </p>
                </div>

                {/* Valeurs */}
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Nov: 13 b. + 28 kg
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#ff6348' }}>
                    Déc: 12 b. + 25 kg
                  </div>
                </div>

                {/* Résultat */}
                <div style={{
                  background: 'rgba(67, 233, 123, 0.15)',
                  borderLeft: '4px solid #43e97b',
                  borderRadius: '8px',
                  padding: '10px 14px'
                }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#43e97b', marginBottom: '4px' }}>
                    <i className="fas fa-arrow-down"></i> -1 b., -3 kg
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                    ❄️ Climatisation optimisée
                  </div>
                </div>

                {/* Économie coût */}
                <div style={{
                  background: 'rgba(72, 219, 251, 0.1)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    💰 Économie
                  </div>
                  <div style={{ fontSize: '17px', fontWeight: '700', color: '#48dbfb' }}>
                    -135 MAD
                  </div>
                </div>

                {/* Optimisation */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '10px 14px'
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    🌡️ Température
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#ff6348' }}>
                    Cuisine: 22°C<br/>Climat.: 24°C
                  </div>
                </div>

                {/* Usage */}
                <div style={{
                  background: 'rgba(255, 99, 72, 0.1)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    🍳 Usage/jour
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#ff6348' }}>
                    2.9h
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    -0.3h vs Nov
                  </div>
                </div>

                {/* Fournisseur */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    🏭 Fournisseur
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#ff6348' }}>
                    Butane
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    0.65 MAD/kg
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Économies totales */}
          <div style={{
            marginTop: '25px',
            background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.15) 0%, rgba(72, 219, 251, 0.15) 100%)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(67, 233, 123, 0.3)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
          }}>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
              💰 Économies Totales ce Mois
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '15px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Coût</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#43e97b' }}>-750 MAD</div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '15px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>CO2</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#43e97b' }}>-1.1 tonnes</div>
              </div>
            </div>
          </div>
</>
          )}
        </div>

      </div> {/* End of reports-grid */}
    </section>
  );
};

export default Reports;
