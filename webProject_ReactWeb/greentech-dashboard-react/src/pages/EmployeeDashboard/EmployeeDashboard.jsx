import React, { useState, useEffect } from 'react';
import './EmployeeDashboard.css';
import gamificationService from '../../services/gamificationService';

const EmployeeDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month'); // week, month, year
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for API data
  const [userStats, setUserStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsData, leaderboardData, submissionsData] = await Promise.all([
          gamificationService.getMyStats(),
          gamificationService.getLeaderboard(),
          gamificationService.getMySubmissions()
        ]);

        setUserStats(statsData);
        setLeaderboard(leaderboardData || []);
        setMySubmissions(submissionsData || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate user rank from leaderboard
  const getUserRank = () => {
    if (!userStats || !leaderboard.length) return { rank: 0, total: 0 };
    const rank = leaderboard.findIndex(u => u.userId === userStats.userId) + 1;
    return { rank: rank || leaderboard.length + 1, total: leaderboard.length };
  };

  // Calculate level progress
  const getLevelProgress = () => {
    if (!userStats) return 0;
    const currentLevelPoints = (userStats.level - 1) * 1000;
    const nextLevelPoints = userStats.level * 1000;
    const progress = ((userStats.currentPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  // Calculate CO2 saved (estimation based on actions)
  const getCO2Saved = () => {
    if (!userStats) return 0;
    // Estimation: each action saves approximately 3.2 kg CO2
    return Math.round((userStats.totalActions || 0) * 3.2);
  };

  // Calculate stats by period (simulated based on total)
  const getStatsByPeriod = () => {
    if (!userStats) return { points: 0, co2: 0, actions: 0 };
    
    const totalPoints = userStats.totalPointsEarned || 0;
    const totalActions = userStats.totalActions || 0;
    const co2Saved = getCO2Saved();
    
    switch (selectedPeriod) {
      case 'week':
        return {
          points: Math.round(totalPoints * 0.1),
          co2: Math.round(co2Saved * 0.1),
          actions: Math.round(totalActions * 0.1)
        };
      case 'month':
        return {
          points: Math.round(totalPoints * 0.3),
          co2: Math.round(co2Saved * 0.3),
          actions: Math.round(totalActions * 0.3)
        };
      case 'year':
      default:
        return { points: totalPoints, co2: co2Saved, actions: totalActions };
    }
  };

  // Get approved/pending/rejected submission counts
  const getSubmissionStats = () => {
    const approved = mySubmissions.filter(s => s.status === 'APPROVED').length;
    const pending = mySubmissions.filter(s => s.status === 'PENDING').length;
    const rejected = mySubmissions.filter(s => s.status === 'REJECTED').length;
    return { approved, pending, rejected, total: mySubmissions.length };
  };

  // Static badges data (can be made dynamic later)
  const badges = [
    { id: 1, name: 'Éco-Warrior', icon: '🌿', unlocked: (userStats?.totalActions || 0) >= 10 },
    { id: 2, name: 'Transport Vert', icon: '🚴', unlocked: (userStats?.totalActions || 0) >= 20 },
    { id: 3, name: 'Recycleur Pro', icon: '♻️', unlocked: (userStats?.totalActions || 0) >= 30 },
    { id: 4, name: 'Économie d\'Énergie', icon: '💡', unlocked: (userStats?.totalActions || 0) >= 50 },
    { id: 5, name: 'Champion CO2', icon: '🏆', unlocked: (userStats?.currentPoints || 0) >= 5000 },
    { id: 6, name: 'Mentor Écologique', icon: '🎓', unlocked: (userStats?.level || 0) >= 10 },
  ];

  // Loading state
  if (loading) {
    return (
      <section className="employee-dashboard">
        <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', color: 'var(--accent-color)' }}></i>
            <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Chargement du tableau de bord...</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="employee-dashboard">
        <div className="error-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <i className="fas fa-exclamation-triangle" style={{ fontSize: '48px', color: '#ef4444' }}></i>
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '16px', padding: '10px 20px', background: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Réessayer
          </button>
        </div>
      </section>
    );
  }

  const { rank, total } = getUserRank();
  const progressPercentage = getLevelProgress();
  const rankPercentage = total > 0 ? ((total - rank) / total) * 100 : 0;
  const co2Saved = getCO2Saved();
  const periodStats = getStatsByPeriod();
  const submissionStats = getSubmissionStats();
  const nextLevelPoints = (userStats?.level || 1) * 1000;

  return (
    <section className="employee-dashboard">
      {/* Header Section */}
      <div className="employee-header">
        <div className="employee-welcome">
          <h1>Bonjour, {userStats?.userName || 'Utilisateur'} 👋</h1>
          <p>Continuez vos actions écologiques !</p>
        </div>
        <div className="employee-level-card">
          <div className="level-info">
            <div className="level-badge">
              <i className="fas fa-star"></i>
              <span>Niveau {userStats?.level || 1}</span>
            </div>
            <div className="level-points">
              {(userStats?.currentPoints || 0).toLocaleString()} / {nextLevelPoints.toLocaleString()} points
            </div>
          </div>
          <div className="level-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {/* Points Card */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #feca57 0%, #ff9f40 100%)' }}>
            <i className="fas fa-coins"></i>
          </div>
          <div className="stat-content">
            <h3>Mes Points</h3>
            <div className="stat-value">{(userStats?.currentPoints || 0).toLocaleString()}</div>
            <div className="stat-subtitle">Points disponibles</div>
          </div>
        </div>

        {/* Rank Card */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <i className="fas fa-trophy"></i>
          </div>
          <div className="stat-content">
            <h3>Classement</h3>
            <div className="stat-value">#{rank || '-'}</div>
            <div className="stat-subtitle">Sur {total} employés</div>
            <div className="rank-progress">
              <div className="rank-bar">
                <div className="rank-fill" style={{ width: `${rankPercentage}%` }}></div>
              </div>
              <span>Top {Math.round(rankPercentage)}%</span>
            </div>
          </div>
        </div>

        {/* CO2 Impact Card */}
        <div className="stat-card large-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #0f4c3a 0%, #2a9d6f 100%)' }}>
            <i className="fas fa-leaf"></i>
          </div>
          <div className="stat-content">
            <h3>Mon Impact CO2</h3>
            <div className="stat-value">{co2Saved} kg</div>
            <div className="stat-subtitle">CO2 économisé</div>
            <div className="impact-equivalents">
              <div className="equivalent-item">
                <i className="fas fa-tree"></i>
                <span>{Math.round(co2Saved / 22)} arbres plantés</span>
              </div>
              <div className="equivalent-item">
                <i className="fas fa-car"></i>
                <span>{Math.round(co2Saved / 0.12)} km évités</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="badges-section">
        <div className="section-header">
          <h2>
            <i className="fas fa-medal"></i>
            Mes Badges
          </h2>
          <span className="badge-count">{badges.filter(b => b.unlocked).length} / {badges.length}</span>
        </div>
        <div className="badges-grid">
          {badges.map(badge => (
            <div key={badge.id} className={`badge-item ${badge.unlocked ? 'unlocked' : 'locked'}`}>
              <div className="badge-icon">{badge.icon}</div>
              <div className="badge-name">{badge.name}</div>
              {!badge.unlocked && <i className="fas fa-lock lock-icon"></i>}
            </div>
          ))}
        </div>
      </div>

      {/* Submissions Status Section */}
      <div className="transport-section">
        <div className="section-header">
          <h2>
            <i className="fas fa-tasks"></i>
            État de mes Soumissions
          </h2>
        </div>
        <div className="transport-grid">
          <div className="transport-card">
            <div className="transport-label">Soumissions Totales</div>
            <div className="transport-value">{submissionStats.total}</div>
            <div className="transport-detail">
              <i className="fas fa-paper-plane" style={{ color: '#667eea' }}></i>
              Actions soumises
            </div>
          </div>

          <div className="transport-card">
            <div className="transport-label">En Attente</div>
            <div className="transport-value" style={{ color: '#f59e0b' }}>{submissionStats.pending}</div>
            <div className="transport-detail">
              <i className="fas fa-clock" style={{ color: '#f59e0b' }}></i>
              En cours de validation
            </div>
          </div>

          <div className="transport-card highlight">
            <div className="transport-label">Approuvées</div>
            <div className="transport-value" style={{ color: '#22c55e' }}>{submissionStats.approved}</div>
            <div className="transport-detail">
              <i className="fas fa-check-circle" style={{ color: '#22c55e' }}></i>
              Validées par l'admin
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="performance-section">
        <div className="section-header">
          <h2>
            <i className="fas fa-chart-line"></i>
            Mon Évolution
          </h2>
          <div className="period-selector">
            <button
              className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('week')}
            >
              Semaine
            </button>
            <button
              className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('month')}
            >
              Mois
            </button>
            <button
              className={`period-btn ${selectedPeriod === 'year' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('year')}
            >
              Année
            </button>
          </div>
        </div>
        <div className="performance-stats">
          <div className="performance-item">
            <div className="perf-icon" style={{ background: '#feca57' }}>
              <i className="fas fa-coins"></i>
            </div>
            <div className="perf-data">
              <div className="perf-label">Points Gagnés</div>
              <div className="perf-value">{periodStats.points}</div>
            </div>
          </div>
          <div className="performance-item">
            <div className="perf-icon" style={{ background: '#2a9d6f' }}>
              <i className="fas fa-leaf"></i>
            </div>
            <div className="perf-data">
              <div className="perf-label">CO2 Économisé</div>
              <div className="perf-value">{periodStats.co2} kg</div>
            </div>
          </div>
          <div className="performance-item">
            <div className="perf-icon" style={{ background: '#667eea' }}>
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="perf-data">
              <div className="perf-label">Actions Réalisées</div>
              <div className="perf-value">{periodStats.actions}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmployeeDashboard;
