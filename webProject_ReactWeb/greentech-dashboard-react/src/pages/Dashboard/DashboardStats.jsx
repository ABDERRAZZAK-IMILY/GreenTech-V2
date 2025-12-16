import React from 'react';

// Chof hna: zedt "stats = {}" bach ila jat undefined, yعتbrha objet vide
const DashboardStats = ({ lastUpdated, loading, onRefresh, stats = {} }) => {

  // Hna kanjib les valeurs b sécurité (Optional Chaining)
  // ? kaygol: ila kan stats kayn, jib critical. Ila makanx, dir 0.
  const critical = stats?.critical || 0;
  const total = stats?.total || 0;
  const offline = stats?.offline || 0;

  // Composant sghir KpiCard
  const KpiCard = ({ title, value, unit, icon, gradient, trendText, trendIcon, trendType }) => (
    <div className="kpi-card">
      <div className="kpi-icon" style={{ background: gradient }}>
        <i className={icon} />
      </div>
      <div className="kpi-content">
        <h3>{title}</h3>
        <div className="kpi-value">{value} <span>{unit}</span></div>
        <div className={`kpi-trend ${trendType}`}>
          <i className={trendIcon} /> {trendText}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Tableau de Bord IA</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {lastUpdated && <span style={{ fontSize: '0.8rem', color: '#666' }}>Mis à jour: {lastUpdated}</span>}
          <button 
            onClick={onRefresh} 
            className="btn-refresh" 
            style={{ padding: '8px 15px', cursor: 'pointer', background: '#059669', border: '1px solid #ddd', borderRadius: '5px' }}
          >
            <i className={`fas fa-sync ${loading ? 'fa-spin' : ''}`} /> Actualiser
          </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="kpi-grid">
        <KpiCard 
          title="Alertes Critiques" 
          value={critical} 
          unit="alertes"
          icon="fas fa-exclamation-triangle" gradient="linear-gradient(135deg, #f5576c 0%, #f093fb 100%)"
          trendIcon="fas fa-exclamation-circle" trendText="Action requise" trendType="negative"
        />
        <KpiCard 
          title="Alertes Totales" 
          value={total} 
          unit="alertes"
          icon="fas fa-bell" gradient="linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)"
          trendIcon="fas fa-exclamation-circle" trendText="En temps réel" trendType="negative"
        />
        <KpiCard 
          title="Capteurs Hors Ligne" 
          value={offline} 
          unit="capteurs"
          icon="fas fa-power-off" gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          trendIcon="fas fa-times-circle" trendText="Intervention requise" trendType="negative"
        />
        <KpiCard 
          title="Résolues Auj." 
          value={5} 
          unit="alertes"
          icon="fas fa-check-circle" gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
          trendIcon="fas fa-arrow-up" trendText="+2 vs hier" trendType="positive"
        />
      </div>
    </div>
  );
};

export default DashboardStats;