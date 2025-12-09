import React, { useState } from 'react';
import AlertsTab from './tabs/AlertsTab';
import TransportTab from './tabs/TransportTab';
import WasteTab from './tabs/WasteTab';
import EnergyTab from './tabs/EnergyTab';
import GasTab from './tabs/GasTab';

const IoT = () => {
  const [activeSensorTab, setActiveSensorTab] = useState('alerts');

  const sensorTabs = [
    { id: 'alerts', icon: 'fa-exclamation-triangle', label: 'Alertes' },
    { id: 'transport', icon: 'fa-map-marked-alt', label: 'Transport' },
    { id: 'waste', icon: 'fa-trash-alt', label: 'Déchets' },
    { id: 'energy', icon: 'fa-bolt', label: 'Énergie' },
    { id: 'gas', icon: 'fa-fire', label: 'Gaz' }
  ];

  return (
    <section id="iot">
      <div className="section-header">
        <h2>
          <i className="fas fa-microchip" /> IoT &amp; Capteurs
        </h2>
        <p>Gestion et surveillance de vos capteurs environnementaux</p>
      </div>

      {/* Sensors Sub-tabs */}
      <div className="sensors-subtabs">
        {sensorTabs.map(tab => (
          <button
            key={tab.id}
            className={`sensors-subtab-btn ${activeSensorTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveSensorTab(tab.id)}
          >
            <i className={`fas ${tab.icon}`} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeSensorTab === 'alerts' && <AlertsTab />}
      {activeSensorTab === 'transport' && <TransportTab />}
      {activeSensorTab === 'waste' && <WasteTab />}
      {activeSensorTab === 'energy' && <EnergyTab />}
      {activeSensorTab === 'gas' && <GasTab />}
    </section>
  );
};

export default IoT;
