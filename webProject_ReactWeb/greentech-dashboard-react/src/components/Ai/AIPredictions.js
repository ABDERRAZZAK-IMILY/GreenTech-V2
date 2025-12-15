import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useLoading } from '../../contexts/LoadingContext';
import useAIPrediction from '../../hooks/useAIPrediction';

const PredictionCard = ({ title, icon, color, gradient, data, chartId, distribution }) => (
  <div className="prediction-card" style={{ 
      background: 'rgba(255, 255, 255, 0.05)', 
      backdropFilter: 'blur(10px)', 
      borderRadius: '16px', 
      padding: '20px', 
      border: `1px solid ${color}33`,
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)' 
  }}>
    <div style={{ display: 'grid', gridTemplateColumns: '70px 230px 170px 300px 260px 1fr', gap: '15px', alignItems: 'center' }}>
      
      {/* Icone */}
      <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
        <i className={`fas fa-${icon}`} />
      </div>

      {/* Titre */}
      <div>
        <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: '700' }}>Prédiction {title}</h4>
        <p style={{ margin: '0', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.3' }}>Consommation prévue sur 30 jours</p>
      </div>

      {/* Valeur Principale */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '24px', fontWeight: '700', color: color, marginBottom: '2px' }}>
          {/* Utilisation de ?. pour éviter le crash si data est undefined */}
          {data?.valeurPrincipale || "0"}
        </div>
        <div style={{ fontSize: '11px', color: color }}>
          <i className="fas fa-arrow-up" /> {data?.pourcentage || "0%"}
        </div>
      </div>

      {/* Graphique */}
      <div>
        <h5 style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📈 Tendance</h5>
        <div style={{ height: '140px', position: 'relative' }}>
          <canvas id={chartId} />
        </div>
      </div>

      {/* Répartition */}
      <div>
          <h5 style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📊 Répartition</h5>
          <div style={{ background: 'rgba(0, 0, 0, 0.15)', borderRadius: '10px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {distribution.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span>{item.label}</span>
                      <span style={{ fontWeight: '700', color: color }}>{item.value}</span>
                  </div>
              ))}
          </div>
      </div>

      {/* Impact */}
      <div>
        <h5 style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💰 Impact</h5>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ padding: '10px', background: `${color}1a`, borderRadius: '10px', border: `1px solid ${color}33` }}>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '2px' }}>Coût prévu</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: color }}>{data?.coutPrevu || "0 MAD"}</div>
          </div>
          <div style={{ padding: '10px', background: 'rgba(67, 233, 123, 0.1)', borderRadius: '10px', border: '1px solid rgba(67, 233, 123, 0.2)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '2px' }}>Émissions CO2</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#43e97b' }}>{data?.emissionCo2 || "0 kg"}</div>
          </div>
        </div>
      </div>

    </div>
  </div>
);

const AIPredictions = () => {
  const { predictionData, isPredictionsGenerated, generatePredictions } = useAIPrediction();
  const chartsRef = useRef({
    electricity: null,
    gas: null,
    transport: null,
    waste: null
  });

  const createChart = (canvasId, historyData, color, bgColor) => {
    const existingChart = Chart.getChart(canvasId);
    if (existingChart) existingChart.destroy();

    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    const realData = (historyData && historyData.length > 0) ? historyData : [0, 0, 0, 0, 0, 0, 0];
    const labels = ['J-6', 'J-5', 'J-4', 'J-3', 'J-2', 'Hier', 'Aujourd\'hui'];

    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          data: realData,
          borderColor: color,
          backgroundColor: bgColor,
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 3,
          pointBackgroundColor: color
        }]
      },
      options: { 
          responsive: true, 
          maintainAspectRatio: false, 
          plugins: { legend: { display: false } }, 
          scales: { x: { display: false }, y: { display: false } } 
      }
    });
  };

  useEffect(() => {
    // 🛑 SECURITÉ : On vérifie si predictionData ET ses propriétés existent
    if (isPredictionsGenerated && predictionData) {
      
      Object.values(chartsRef.current).forEach(chart => { if (chart) chart.destroy(); });

      requestAnimationFrame(() => {
        // Utilisation de ?. pour éviter le crash si une catégorie manque
        if (predictionData?.electricite) {
            chartsRef.current.electricity = createChart('electricityPredictionChart', predictionData.electricite.history, '#feca57', 'rgba(254, 202, 87, 0.1)');
        }
        if (predictionData?.gaz) {
            chartsRef.current.gas = createChart('gasPredictionChart', predictionData.gaz.history, '#ff6348', 'rgba(255, 99, 72, 0.1)');
        }
        if (predictionData?.transport) {
            chartsRef.current.transport = createChart('transportPredictionChart', predictionData.transport.history, '#48dbfb', 'rgba(72, 219, 251, 0.1)');
        }
        if (predictionData?.dechets) {
            chartsRef.current.waste = createChart('wastePredictionChart', predictionData.dechets.history, '#1dd1a1', 'rgba(29, 209, 161, 0.1)');
        }
      });
    }

    return () => {
      Object.values(chartsRef.current).forEach(chart => { if (chart) chart.destroy(); });
    };
  }, [isPredictionsGenerated, predictionData]);

  return (
    <div>
      <div className="predictions-intro" style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
            <i className="fas fa-chart-line" /> Prédictions sur 30 jours
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Analyse prédictive de vos consommations basée sur l'historique et les tendances actuelles
          </p>
        </div>
        <button onClick={generatePredictions} className="btn-primary">
          <i className="fas fa-magic"></i> {isPredictionsGenerated ? 'Actualiser' : 'Générer'} les Prédictions
        </button>
      </div>

      {/* 🛑 SECURITÉ : On vérifie (predictionData === null) ici */}
      {!isPredictionsGenerated || !predictionData ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '16px', border: '2px dashed rgba(255, 255, 255, 0.1)' }}>
          <i className="fas fa-chart-line" style={{ fontSize: '64px', color: 'var(--accent-color)', opacity: 0.3, marginBottom: '20px' }}></i>
          <h4 style={{ fontSize: '20px', marginBottom: '10px', color: 'var(--text-secondary)' }}>Aucune prédiction générée</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '500px', margin: '0 auto 25px' }}>
            Cliquez sur le bouton "Générer les Prédictions" pour analyser vos données historiques.
          </p>
        </div>
      ) : (
        <div className="predictions-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
          
          {/* 🛑 SECURITÉ : On utilise ?. pour l'accès aux propriétés */}
          {predictionData?.electricite && (
              <PredictionCard 
                title="Électricité" 
                icon="bolt" 
                color="#feca57" 
                gradient="linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)"
                data={predictionData.electricite}
                chartId="electricityPredictionChart"
                distribution={[
                    {label: "🏭 Production", value: "45%"},
                    {label: "🏢 Bureaux", value: "25%"}
                ]}
              />
          )}

          {predictionData?.gaz && (
              <PredictionCard 
                title="Gaz" 
                icon="fire" 
                color="#ff6348" 
                gradient="linear-gradient(135deg, #ff6348 0%, #ffb142 100%)"
                data={predictionData.gaz}
                chartId="gasPredictionChart"
                distribution={[
                    {label: "🍳 Cuisine", value: "35%"},
                    {label: "🌡️ Chauffage", value: "30%"}
                ]}
              />
          )}

          {predictionData?.transport && (
              <PredictionCard 
                title="Transport" 
                icon="truck" 
                color="#48dbfb" 
                gradient="linear-gradient(135deg, #48dbfb 0%, #0abde3 100%)"
                data={predictionData.transport}
                chartId="transportPredictionChart"
                distribution={[
                    {label: "🚚 Camion", value: "32%"},
                    {label: "🚗 Voitures", value: "24%"}
                ]}
              />
          )}

          {predictionData?.dechets && (
              <PredictionCard 
                title="Déchets" 
                icon="trash-alt" 
                color="#1dd1a1" 
                gradient="linear-gradient(135deg, #1dd1a1 0%, #10ac84 100%)"
                data={predictionData.dechets}
                chartId="wastePredictionChart"
                distribution={[
                    {label: "♻️ Recyclable", value: "42%"},
                    {label: "🗑️ Non-recyclable", value: "23%"}
                ]}
              />
          )}

        </div>
      )}
    </div>
  );
};

export default AIPredictions;