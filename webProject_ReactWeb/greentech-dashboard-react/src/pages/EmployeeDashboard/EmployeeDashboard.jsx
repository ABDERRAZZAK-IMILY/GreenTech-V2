import React, { useState } from 'react';
import './EmployeeDashboard.css';
import { useEmployee } from '../../contexts/EmployeeContext';

const EmployeeDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month'); // week, month, year
  const { ecoCoins } = useEmployee();

  // Données simulées de l'employé
  const employeeData = {
    name: 'Mohammed Alami',
    level: 7,
    currentPoints: ecoCoins,
    nextLevelPoints: 4000,
    rank: 12,
    totalEmployees: 85,
    co2Saved: 245, // kg
    badges: [
      { id: 1, name: 'Éco-Warrior', icon: '🌿', unlocked: true },
      { id: 2, name: 'Transport Vert', icon: '🚴', unlocked: true },
      { id: 3, name: 'Recycleur Pro', icon: '♻️', unlocked: true },
      { id: 4, name: 'Économie d\'Énergie', icon: '💡', unlocked: false },
      { id: 5, name: 'Champion CO2', icon: '🏆', unlocked: false },
      { id: 6, name: 'Mentor Écologique', icon: '🎓', unlocked: false },
    ],
    transport: {
      kmTotal: 342,
      kmEcoDrive: 298,
      fuelConsumed: 28.5, // litres
      co2Transport: 67.5, // kg
      avgCompany: 95 // kg
    },
    stats: {
      week: { points: 450, co2: 32, actions: 18 },
      month: { points: 1850, co2: 142, actions: 76 },
      year: { points: 18500, co2: 1420, actions: 852 }
    }
  };

  const progressPercentage = (employeeData.currentPoints / employeeData.nextLevelPoints) * 100;
  const rankPercentage = ((employeeData.totalEmployees - employeeData.rank) / employeeData.totalEmployees) * 100;

  return (
    <section className="employee-dashboard">
      {/* Header Section */}
      <div className="employee-header">
        <div className="employee-welcome">
          <h1>Bonjour, {employeeData.name} 👋</h1>
          <p>Continuez vos actions écologiques !</p>
        </div>
        <div className="employee-level-card">
          <div className="level-info">
            <div className="level-badge">
              <i className="fas fa-star"></i>
              <span>Niveau {employeeData.level}</span>
            </div>
            <div className="level-points">
              {employeeData.currentPoints} / {employeeData.nextLevelPoints} points
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
            <div className="stat-value">{employeeData.currentPoints.toLocaleString()}</div>
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
            <div className="stat-value">#{employeeData.rank}</div>
            <div className="stat-subtitle">Sur {employeeData.totalEmployees} employés</div>
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
            <div className="stat-value">{employeeData.co2Saved} kg</div>
            <div className="stat-subtitle">CO2 économisé</div>
            <div className="impact-equivalents">
              <div className="equivalent-item">
                <i className="fas fa-tree"></i>
                <span>{Math.round(employeeData.co2Saved / 22)} arbres plantés</span>
              </div>
              <div className="equivalent-item">
                <i className="fas fa-car"></i>
                <span>{Math.round(employeeData.co2Saved / 0.12)} km évités</span>
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
          <span className="badge-count">{employeeData.badges.filter(b => b.unlocked).length} / {employeeData.badges.length}</span>
        </div>
        <div className="badges-grid">
          {employeeData.badges.map(badge => (
            <div key={badge.id} className={`badge-item ${badge.unlocked ? 'unlocked' : 'locked'}`}>
              <div className="badge-icon">{badge.icon}</div>
              <div className="badge-name">{badge.name}</div>
              {!badge.unlocked && <i className="fas fa-lock lock-icon"></i>}
            </div>
          ))}
        </div>
      </div>

      {/* Transport Section */}
      <div className="transport-section">
        <div className="section-header">
          <h2>
            <i className="fas fa-car"></i>
            Statistiques Transport
          </h2>
        </div>
        <div className="transport-grid">
          <div className="transport-card">
            <div className="transport-label">Distance Parcourue</div>
            <div className="transport-value">{employeeData.transport.kmTotal} km</div>
            <div className="transport-detail">
              <i className="fas fa-check-circle" style={{ color: '#2a9d6f' }}></i>
              {employeeData.transport.kmEcoDrive} km en éco-conduite
            </div>
          </div>

          <div className="transport-card">
            <div className="transport-label">Carburant Consommé</div>
            <div className="transport-value">{employeeData.transport.fuelConsumed} L</div>
            <div className="transport-detail">
              <i className="fas fa-gas-pump"></i>
              {(employeeData.transport.fuelConsumed / employeeData.transport.kmTotal * 100).toFixed(1)} L/100km
            </div>
          </div>

          <div className="transport-card highlight">
            <div className="transport-label">CO2 Transport</div>
            <div className="transport-value">{employeeData.transport.co2Transport} kg</div>
            <div className="transport-comparison">
              <div className="comparison-label">Moyenne entreprise</div>
              <div className="comparison-value">{employeeData.transport.avgCompany} kg</div>
              <div className="comparison-badge positive">
                <i className="fas fa-arrow-down"></i>
                {Math.round((1 - employeeData.transport.co2Transport / employeeData.transport.avgCompany) * 100)}% moins
              </div>
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
              <div className="perf-value">{employeeData.stats[selectedPeriod].points}</div>
            </div>
          </div>
          <div className="performance-item">
            <div className="perf-icon" style={{ background: '#2a9d6f' }}>
              <i className="fas fa-leaf"></i>
            </div>
            <div className="perf-data">
              <div className="perf-label">CO2 Économisé</div>
              <div className="perf-value">{employeeData.stats[selectedPeriod].co2} kg</div>
            </div>
          </div>
          <div className="performance-item">
            <div className="perf-icon" style={{ background: '#667eea' }}>
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="perf-data">
              <div className="perf-label">Actions Réalisées</div>
              <div className="perf-value">{employeeData.stats[selectedPeriod].actions}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmployeeDashboard;
