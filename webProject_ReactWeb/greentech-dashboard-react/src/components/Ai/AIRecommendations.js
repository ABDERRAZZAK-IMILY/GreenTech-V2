import React, { useState } from 'react';
import useAIRecommendations from '../../hooks/useAIRecommendations'; // <--- IMPORT DU HOOK

const AIRecommendations = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  
  // Le hook utilise maintenant le Contexte Global
  const { 
      recommendations, 
      isRecommendationsGenerated, // <-- Vient du hook (qui le prend du Context)
      generateRecommendations 
  } = useAIRecommendations();
  
  const openRecommendationModal = (action) => {
    setSelectedRecommendation(action);
    setModalOpen(true);
  };

  const closeRecommendationModal = () => {
    setModalOpen(false);
    setSelectedRecommendation(null);
  };

  return (
    <div>
      <div className="recommendations-intro" style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
            <i className="fas fa-magic" /> Recommandations Intelligentes
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Basées sur l'analyse de vos données, voici les actions prioritaires pour optimiser votre performance.
          </p>
        </div>
        <button onClick={generateRecommendations} className="btn-primary">
          <i className="fas fa-magic"></i> Générer les Recommandations
        </button>
      </div>

      {!isRecommendationsGenerated || !recommendations ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '16px', border: '2px dashed rgba(255, 255, 255, 0.1)' }}>
           <i className="fas fa-magic" style={{ fontSize: '64px', color: 'var(--accent-color)', opacity: 0.3, marginBottom: '20px' }}></i>
           <h4 style={{ fontSize: '20px', marginBottom: '10px', color: 'var(--text-secondary)' }}>Aucune recommandation générée</h4>
           <button onClick={generateRecommendations} className="btn-primary" style={{marginTop: '15px'}}>Générer</button>
        </div>
      ) : (
        <>
          {/* On groupe les recommandations par difficulté ou on les affiche toutes */}
          <div className="recommendations-row" style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#43e97b', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fas fa-list-check" style={{ fontSize: '14px' }} /> Plan d'Action Recommandé
            </h4>
            
            <div className="recommendations-scroll" style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '15px' }}>
               
               {/* BOUCLE DYNAMIQUE SUR LES DONNÉES DU BACKEND */}
               {recommendations.map((action, index) => (
                   <div key={index} className="recommendation-card" style={{ 
                       minWidth: '340px', maxWidth: '340px',
                       background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)',
                       borderRadius: '16px', padding: '20px',
                       border: action.impact.difficulty === 'Difficile' ? '1px solid rgba(245, 87, 108, 0.3)' : 
                               action.impact.difficulty === 'Moyen' ? '1px solid rgba(254, 202, 87, 0.3)' : 
                               '1px solid rgba(67, 233, 123, 0.3)',
                       boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                   }}>
                      <div className="recommendation-header" style={{ marginBottom: '15px' }}>
                          <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: '600' }}>
                             {action.icon && <i className={`fas fa-${action.icon}`} style={{marginRight: '8px'}}/>} 
                             {action.title}
                          </h4>
                          <span className={`difficulty-badge ${action.impact.difficulty === 'Difficile' ? 'hard' : action.impact.difficulty === 'Moyen' ? 'medium' : 'easy'}`}
                                style={{
                                    padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '600',
                                    background: action.impact.difficulty === 'Difficile' ? 'rgba(245, 87, 108, 0.15)' : action.impact.difficulty === 'Moyen' ? 'rgba(254, 202, 87, 0.15)' : 'rgba(67, 233, 123, 0.15)',
                                    color: action.impact.difficulty === 'Difficile' ? '#f5576c' : action.impact.difficulty === 'Moyen' ? '#feca57' : '#43e97b',
                                    border: `1px solid ${action.impact.difficulty === 'Difficile' ? '#f5576c' : action.impact.difficulty === 'Moyen' ? '#feca57' : '#43e97b'}4d`
                                }}>
                              {action.impact.difficulty}
                          </span>
                      </div>

                      <div className="recommendation-metrics" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                          <div className="metric" style={{ flex: 1, padding: '10px', background: 'rgba(67, 233, 123, 0.1)', borderRadius: '10px', textAlign: 'center' }}>
                              <i className="fas fa-leaf" style={{ color: '#43e97b', marginBottom: '6px' }} />
                              <div style={{ fontSize: '13px', fontWeight: '600' }}>{action.impact.co2}</div>
                          </div>
                          <div className="metric" style={{ flex: 1, padding: '10px', background: 'rgba(254, 202, 87, 0.1)', borderRadius: '10px', textAlign: 'center' }}>
                              <i className="fas fa-coins" style={{ color: '#feca57', marginBottom: '6px' }} />
                              <div style={{ fontSize: '13px', fontWeight: '600' }}>{action.impact.cost}</div>
                          </div>
                      </div>

                      <p style={{ margin: '0 0 15px 0', color: '#b0b0b0', fontSize: '12px', lineHeight: '1.5', height: '54px', overflow: 'hidden' }}>
                        {action.description}
                      </p>

                      <button className="btn-start-action" onClick={() => openRecommendationModal(action)} style={{ 
                          width: '100%', padding: '10px', borderRadius: '10px', border: 'none', color: 'white', fontWeight: '600', cursor: 'pointer',
                          background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)' 
                      }}>
                        <i className="fas fa-info-circle" /> Voir détails
                      </button>
                   </div>
               ))}
            </div>
          </div>
        </>
      )}

      {/* MODAL DYNAMIQUE */}
     {modalOpen && selectedRecommendation && (
    <div 
        style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            // Hada howa l'background 'k7el' walakin transparent chwiya
            background: 'rgba(0, 0, 0, 0.6)', 
            // ✅ Hna fin kaina 'Dbaba' (Blur) 3la dakchi li lour
            backdropFilter: 'blur(8px)', 
            // ✅ Z-index 3ali bzaf bach tji fou9 kolchi (hatta header)
            zIndex: 9999, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            // Animation bach tban bchwiya (Fade In)
            animation: 'fadeIn 0.3s ease-out'
        }} 
        onClick={closeRecommendationModal}
    >
        {/* Hna l'animation dyal 'slideUp' bach tji tal3a mn ta7t */}
        <div 
            style={{ 
                background: '#1a1a2e', 
                borderRadius: '20px', 
                maxWidth: '800px', 
                width: '90%', 
                maxHeight: '90vh', 
                overflowY: 'auto', 
                padding: '30px', 
                position: 'relative', 
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', // Dyl (Shadow) Mjahd
                animation: 'slideUp 0.4s ease-out' // Animation d tl3a
            }} 
            onClick={(e) => e.stopPropagation()}
        >
            <button 
                onClick={closeRecommendationModal} 
                style={{ 
                    position: 'absolute', 
                    top: '20px', 
                    right: '20px', 
                    background: 'rgba(255,255,255,0.1)', 
                    borderRadius: '50%', 
                    width: '40px', 
                    height: '40px', 
                    border: 'none', 
                    color: 'white', 
                    fontSize: '20px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                }}
                // Zidna hover effect sghir
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
            >
                <i className="fas fa-times" />
            </button>
            
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', fontSize: '24px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`fas fa-${selectedRecommendation.icon}`} />
                </div>
                {selectedRecommendation.title}
            </h2>
            
            <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '10px', color: '#fff' }}>
                    <i className="fas fa-info-circle" style={{marginRight:'8px'}}/> Description
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {selectedRecommendation.description}
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                <div style={{ background: 'rgba(67, 233, 123, 0.1)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(67, 233, 123, 0.2)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}><i className="fas fa-leaf"/> Impact CO2</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#43e97b' }}>{selectedRecommendation.impact.co2}</div>
                </div>
                <div style={{ background: 'rgba(254, 202, 87, 0.1)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(254, 202, 87, 0.2)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}><i className="fas fa-coins"/> Économies</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#feca57' }}>{selectedRecommendation.impact.cost}</div>
                </div>
                {selectedRecommendation.impact.investissement && (
                    <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}><i className="fas fa-wallet"/> Investissement</div>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>{selectedRecommendation.impact.investissement}</div>
                    </div>
                )}
            </div>

            <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#fff' }}>
                <i className="fas fa-list-ol" style={{marginRight:'8px'}}/> Étapes de mise en œuvre
            </h3>
            <ol style={{ paddingLeft: '20px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                {selectedRecommendation.steps && selectedRecommendation.steps.map((step, index) => (
                    <li key={index} style={{marginBottom:'8px'}}>{step}</li>
                ))}
            </ol>
            
            {selectedRecommendation.benefits && (
                <>
                <h3 style={{ fontSize: '18px', margin: '20px 0 15px 0', color: '#fff' }}>
                    <i className="fas fa-star" style={{marginRight:'8px'}}/> Bénéfices
                </h3>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    {selectedRecommendation.benefits.map((b, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <i className={`fas fa-${b.icon}`} style={{color: 'var(--accent-color)'}}/>
                            <span>{b.label}: <strong>{b.value}</strong></span>
                        </div>
                    ))}
                </div>
                </>
            )}
        </div>
    </div>
)}
    </div>
  );
};

export default AIRecommendations;