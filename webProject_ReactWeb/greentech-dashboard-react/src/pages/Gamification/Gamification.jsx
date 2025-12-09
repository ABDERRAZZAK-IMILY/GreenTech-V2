import React, { useState } from 'react';
import ProfileTeamsTab from './tabs/ProfileTeamsTab';
import MarketplaceTab from './tabs/MarketplaceTab';
import ActionValidationTab from './tabs/ActionValidationTab';

const Gamification = () => {
  const [activeSubTab, setActiveSubTab] = useState('profile');

  return (
    <section id="gamification" className="tab-content" style={{display: 'block'}}>
      <div className="section-header">
        <h2><i className="fas fa-trophy"></i> Gamification</h2>
        <p>Système de récompenses et motivation d'équipe</p>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="sub-tabs-navigation" style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '30px',
        borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '0'
      }}>
        <button
          className={`sub-tab-btn ${activeSubTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('profile')}
          style={{
            background: activeSubTab === 'profile' ? 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))' : 'transparent',
            color: 'var(--text-primary)',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            borderBottom: activeSubTab === 'profile' ? '3px solid var(--primary-color)' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <i className="fas fa-users"></i>
          Profil & Équipes
        </button>
        <button
          className={`sub-tab-btn ${activeSubTab === 'marketplace' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('marketplace')}
          style={{
            background: activeSubTab === 'marketplace' ? 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))' : 'transparent',
            color: 'var(--text-primary)',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            borderBottom: activeSubTab === 'marketplace' ? '3px solid var(--primary-color)' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <i className="fas fa-store"></i>
          Marketplace
        </button>
        <button
          className={`sub-tab-btn ${activeSubTab === 'validation' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('validation')}
          style={{
            background: activeSubTab === 'validation' ? 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))' : 'transparent',
            color: 'var(--text-primary)',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            borderBottom: activeSubTab === 'validation' ? '3px solid var(--primary-color)' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <i className="fas fa-clipboard-check"></i>
          Validation des Actions
        </button>
      </div>

      {/* Sub-tabs Content */}
      <div className="sub-tabs-content">
        {activeSubTab === 'profile' && <ProfileTeamsTab />}
        {activeSubTab === 'marketplace' && <MarketplaceTab />}
        {activeSubTab === 'validation' && <ActionValidationTab />}
      </div>
    </section>
  );
};

export default Gamification;
