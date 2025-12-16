import React, { useState } from 'react';
import AIChatbot from '../../components/Ai/AIChatbot';
import AIPredictions from '../../components/Ai/AIPredictions';
import AIRecommendations from '../../components/Ai/AIRecommendations';

const AI = () => {
  const [activeSubTab, setActiveSubTab] = useState('chatbot');

  return (
    <section id="ai" className="tab-content active">
      <div className="section-header">
        <h2><i className="fas fa-brain" /> IA &amp; Prédictions</h2>
        <p>Assistant intelligent pour optimiser votre performance environnementale</p>
      </div>

      {/* Onglets de Navigation */}
      <div className="ai-subtabs">
        <button
          className={`ai-subtab-btn ${activeSubTab === 'chatbot' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('chatbot')}
        >
          <i className="fas fa-comments" /> Chatbot IA
        </button>
        <button
          className={`ai-subtab-btn ${activeSubTab === 'predictions' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('predictions')}
        >
          <i className="fas fa-chart-line" /> Prédictions
        </button>
        <button
          className={`ai-subtab-btn ${activeSubTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('recommendations')}
        >
          <i className="fas fa-lightbulb" /> Recommandations
        </button>
      </div>

      {/* Contenu conditionnel */}
      <div className="ai-tab-content active">
        {activeSubTab === 'chatbot' && <AIChatbot />}
        {activeSubTab === 'predictions' && <AIPredictions />}
        {activeSubTab === 'recommendations' && <AIRecommendations />}
      </div>
    </section>
  );
};

export default AI;