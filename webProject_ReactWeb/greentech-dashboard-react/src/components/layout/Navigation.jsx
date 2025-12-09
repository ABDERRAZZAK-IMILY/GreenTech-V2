import React from 'react';

const Navigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
    { id: 'iot', icon: 'fa-microchip', label: 'IoT & Capteurs' },
    { id: 'ai', icon: 'fa-brain', label: 'IA & Prédictions' },
    { id: 'reports', icon: 'fa-file-alt', label: 'Rapports & Analytics' },
    { id: 'gamification', icon: 'fa-trophy', label: 'Gamification' }
  ];

  return (
    <nav className="nav-tabs">
      <div className="container">
        <ul className="tab-list">
          {tabs.map(tab => (
            <li
              key={tab.id}
              className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
              data-tab={tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={`fas ${tab.icon}`}></i>
              <span>{tab.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
