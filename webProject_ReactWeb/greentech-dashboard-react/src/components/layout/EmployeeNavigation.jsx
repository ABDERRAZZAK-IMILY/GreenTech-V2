import React from 'react';
import './EmployeeNavigation.css';

const EmployeeNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Mon Tableau de Bord', icon: 'chart-line' },
    { id: 'actions', label: 'Mes Actions & Suivi', icon: 'tasks' },
    { id: 'rewards', label: 'Mes Récompenses', icon: 'gift' }
  ];

  return (
    <nav className="employee-navigation">
      <div className="container">
        <div className="employee-nav-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`employee-nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={`fas fa-${tab.icon}`}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default EmployeeNavigation;
