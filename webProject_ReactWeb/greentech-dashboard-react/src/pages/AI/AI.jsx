import React, { useState, useEffect, useRef } from 'react';
import { showNotification } from '../../utils/notifications';
import Chart from 'chart.js/auto';
import { useLoading } from '../../contexts/LoadingContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useChatbot from '../../hooks/useChatBot';
import remarkBreaks from 'remark-breaks'; 

// npm install react-markdown remark-gfm

const AI = () => {
  const [activeSubTab, setActiveSubTab] = useState('chatbot');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);

 const {
        chatMessages,
        chatInput,
        setChatInput,
        isTyping,
        sendChatMessage,
        handleChatEnter,
        quickAction,
        chatMessagesRef
    } = useChatbot();
    
const formatStreamText = (text) => {
  if (!text) return "";
  
  return text
    .replace(/\\n/g, '\n') 
    .replace(/([^\n])\s*-\s/g, '$1\n- ')
    .replace(/([a-zA-Z])\n([a-zA-Z])/g, '$1 $2')
    .replace(/([^\n])\s*---\s*/g, '$1\n\n---\n\n')
    .replace(/\n{3,}/g, '\n\n').trim();
};
  const chartRef = useRef(null);

  // Use loading context instead of local state
  const {
    setIsGeneratingPredictions,
    setPredictionProgress,
    setPredictionStep,
    isPredictionsGenerated,
    setIsPredictionsGenerated,
    setIsGeneratingRecommendations,
    setRecommendationProgress,
    setRecommendationStep,
    isRecommendationsGenerated,
    setIsRecommendationsGenerated
  } = useLoading();





  const chartsRef = useRef({
    electricity: null,
    gas: null,
    transport: null,
    waste: null
  });
  const hasInitialized = useRef(false);

  

  // Recommendation Details Data
  const recommendationDetails = {
    'shutdown-equipment': {
      title: 'Éteindre équipements le soir',
      icon: 'power-off',
      description: 'Établir une procédure systématique pour éteindre tous les équipements non essentiels en fin de journée. Cette mesure simple peut réduire significativement la consommation électrique hors heures de travail.',
      impact: {
        co2: '-1.2 tonnes CO2/an',
        cost: '-450 MAD/an',
        difficulty: 'Facile',
        time: 'Immédiat'
      },
      steps: [
        'Faire un audit des équipements actuellement laissés allumés',
        'Créer une checklist de fin de journée pour chaque zone',
        'Désigner un responsable par département',
        'Installer des multiprises avec interrupteur pour faciliter l\'extinction',
        'Former le personnel aux bonnes pratiques',
        'Mettre en place des rappels automatiques 30min avant la fermeture'
      ],
      benefits: [
        { icon: 'bolt', label: 'Économie énergie', value: '~15%' },
        { icon: 'shield-alt', label: 'Sécurité', value: 'Risques réduits' },
        { icon: 'clock', label: 'ROI', value: 'Immédiat' }
      ]
    },
    'install-led': {
      title: 'Installer éclairage LED',
      icon: 'lightbulb',
      description: 'Remplacer tous les éclairages traditionnels (halogènes, fluorescents) par des LED. Les LED consomment jusqu\'à 75% moins d\'énergie et durent 25 fois plus longtemps.',
      impact: {
        co2: '-2.8 tonnes CO2/an',
        cost: '-1,800 MAD/an',
        difficulty: 'Moyen',
        time: '2 semaines',
        investissement: '3,500 MAD'
      },
      steps: [
        'Inventorier tous les points lumineux et types d\'ampoules actuels',
        'Calculer les besoins en lumens pour chaque espace',
        'Choisir des LED de qualité (température de couleur adaptée)',
        'Planifier le remplacement par zones pour minimiser les perturbations',
        'Installer les nouvelles LED et recycler les anciennes ampoules',
        'Vérifier les niveaux d\'éclairage et ajuster si nécessaire'
      ],
      benefits: [
        { icon: 'battery-full', label: 'Durée de vie', value: '25,000h' },
        { icon: 'coins', label: 'Économies', value: '-75% énergie' },
        { icon: 'leaf', label: 'Impact CO2', value: '-2.8 t/an' }
      ]
    },
    'optimize-ac': {
      title: 'Optimiser climatisation',
      icon: 'snowflake',
      description: 'Optimiser l\'utilisation de la climatisation par des réglages intelligents et un meilleur entretien. Maintenir la température à 24-26°C au lieu de 20°C peut réduire la consommation de 30%.',
      impact: {
        co2: '-1.5 tonnes CO2/an',
        cost: '-680 MAD/an',
        difficulty: 'Facile',
        time: 'Immédiat'
      },
      steps: [
        'Régler les thermostats à 24-26°C (au lieu de <22°C)',
        'Programmer des plages horaires adaptées (arrêt nocturne et week-end)',
        'Nettoyer les filtres mensuellement',
        'Vérifier l\'isolation des locaux (fenêtres, portes)',
        'Installer des détecteurs de présence dans les salles de réunion',
        'Former les équipes aux bonnes pratiques (fermer portes/fenêtres)'
      ],
      benefits: [
        { icon: 'thermometer-half', label: 'Confort', value: 'Optimal' },
        { icon: 'tools', label: 'Maintenance', value: '-30% pannes' },
        { icon: 'coins', label: 'Économies', value: '-680 MAD/an' }
      ]
    },
    'carpool': {
      title: 'Covoiturage employés',
      icon: 'car',
      description: 'Mettre en place un système de covoiturage pour les trajets domicile-travail. Réduire le nombre de véhicules individuels diminue les émissions et les coûts de transport.',
      impact: {
        co2: '-3.2 tonnes CO2/an',
        cost: '-2,100 MAD/an',
        difficulty: 'Moyen',
        time: '1 mois mise en place'
      },
      steps: [
        'Enquêter sur les trajets domicile-travail des employés',
        'Identifier les zones géographiques communes',
        'Créer une plateforme de mise en relation (application ou tableau partagé)',
        'Proposer des incitations (places de parking réservées, primes)',
        'Organiser une réunion de lancement et former des groupes pilotes',
        'Suivre l\'adoption et ajuster le système selon les retours'
      ],
      benefits: [
        { icon: 'users', label: 'Cohésion', value: 'Équipe renforcée' },
        { icon: 'road', label: 'Trajets', value: '-40% véhicules' },
        { icon: 'leaf', label: 'Impact CO2', value: '-3.2 t/an' }
      ]
    },
    'solar-panels': {
      title: 'Panneaux solaires',
      icon: 'solar-panel',
      description: 'Installation de panneaux photovoltaïques sur le toit pour produire votre propre électricité verte. Réduction drastique de la facture énergétique et indépendance vis-à-vis du réseau.',
      impact: {
        co2: '-8.5 tonnes CO2/an',
        cost: '-5,200 MAD/an',
        difficulty: 'Difficile',
        time: 'ROI 5 ans',
        investissement: '25,000 MAD'
      },
      steps: [
        'Faire réaliser une étude de faisabilité technique (orientation, surface)',
        'Obtenir les autorisations administratives nécessaires',
        'Comparer plusieurs devis d\'installateurs certifiés',
        'Choisir la technologie adaptée (monocristallin, polycristallin)',
        'Planifier l\'installation (2-3 jours d\'intervention)',
        'Configurer le système de monitoring pour suivre la production',
        'Mettre en place un contrat de maintenance annuel'
      ],
      benefits: [
        { icon: 'sun', label: 'Production', value: '~8,000 kWh/an' },
        { icon: 'infinity', label: 'Autonomie', value: '60-70%' },
        { icon: 'chart-line', label: 'ROI', value: '5 ans' }
      ]
    },
    'transport-efficiency': {
      title: 'Optimiser efficacité transport',
      icon: 'truck',
      description: 'Planifier les trajets de manière optimale et utiliser les véhicules appropriés selon la distance. Réduire la consommation de carburant et les émissions de CO2.',
      impact: {
        co2: '-2.5 tonnes CO2/an',
        cost: '-1,500 MAD/an',
        difficulty: 'Moyen',
        time: '2 semaines'
      },
      steps: [
        'Analyser les trajets actuels et identifier les inefficacités',
        'Créer un planning optimisé de livraisons/déplacements',
        'Former les conducteurs à l\'éco-conduite',
        'Utiliser la moto pour les courtes distances (<30km)',
        'Regrouper les livraisons pour minimiser les trajets',
        'Installer un système de tracking GPS pour le suivi'
      ],
      benefits: [
        { icon: 'gas-pump', label: 'Carburant', value: '-25%' },
        { icon: 'route', label: 'Trajets', value: 'Optimisés' },
        { icon: 'leaf', label: 'Impact CO2', value: '-2.5 t/an' }
      ]
    }
  };

  // Generate Predictions
  const generatePredictions = () => {
    setIsGeneratingPredictions(true);
    setPredictionProgress(0);

    const steps = [
      { progress: 0, message: 'Initialisation des modèles IA...', duration: 500 },
      { progress: 20, message: 'Analyse des données historiques...', duration: 700 },
      { progress: 40, message: 'Entraînement des algorithmes prédictifs...', duration: 800 },
      { progress: 60, message: 'Calcul des tendances futures...', duration: 700 },
      { progress: 80, message: 'Génération des graphiques...', duration: 600 },
      { progress: 100, message: 'Finalisation...', duration: 300 }
    ];

    let currentStep = 0;

    const executeStep = () => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        setPredictionProgress(step.progress);
        setPredictionStep(step.message);

        setTimeout(() => {
          currentStep++;
          executeStep();
        }, step.duration);
      } else {
        setTimeout(() => {
          setIsGeneratingPredictions(false);
          setIsPredictionsGenerated(true);
          showNotification('Prédictions générées avec succès!', 'success');
          // Initialize charts immediately after generation
          requestAnimationFrame(() => {
            setTimeout(() => {
              initializePredictionCharts();
            }, 100);
          });
        }, 200);
      }
    };

    executeStep();
  };
  


  // Generate Recommendations
  const generateRecommendations = () => {
    setIsGeneratingRecommendations(true);
    setRecommendationProgress(0);

    const steps = [
      { progress: 0, message: 'Analyse de vos données...', duration: 500 },
      { progress: 25, message: 'Identification des opportunités...', duration: 700 },
      { progress: 50, message: 'Calcul de l\'impact potentiel...', duration: 800 },
      { progress: 75, message: 'Priorisation des recommandations...', duration: 600 },
      { progress: 100, message: 'Finalisation...', duration: 300 }
    ];

    let currentStep = 0;

    const executeStep = () => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        setRecommendationProgress(step.progress);
        setRecommendationStep(step.message);

        setTimeout(() => {
          currentStep++;
          executeStep();
        }, step.duration);
      } else {
        setTimeout(() => {
          setIsGeneratingRecommendations(false);
          setIsRecommendationsGenerated(true);
          showNotification('Recommandations générées avec succès!', 'success');
        }, 200);
      }
    };

    executeStep();
  };



  useEffect(() => {
    if (activeSubTab === 'predictions' && isPredictionsGenerated) {
      // Use requestAnimationFrame to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        setTimeout(() => {
          initializePredictionCharts();
        }, 50);
      });
    }
  }, [activeSubTab, isPredictionsGenerated]);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  // Switch AI sub-tab
  const switchAITab = (tabName) => {
    setActiveSubTab(tabName);
  };

  useEffect(() => {
    if (chatMessagesRef.current) {
        chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);




  // useEffect(() => {
  //   if (!aiStats || loading) return;
  //   const canvasElement = document.getElementById('energyChart');
  //   if (!canvasElement) return;
  //   if (chartRef.current) chartRef.current.destroy();

  //   const ctx = canvasElement.getContext('2d');
  //   chartRef.current = new Chart(ctx, {
  //       type: 'doughnut',
  //       data: {
  //           labels: ['Consommation', 'Reste'],
  //           datasets: [{
  //               data: [aiStats.currentMonthEnergy, aiStats.currentMonthEnergy * 0.2], 
  //               backgroundColor: ['#feca57', '#333'],
  //               borderWidth: 0
  //           }]
  //       },
  //       options: {
  //           responsive: true,
  //           plugins: { legend: { position: 'bottom', labels: { color: 'white' } } }
  //       }
  //   });

  //   return () => { if (chartRef.current) chartRef.current.destroy(); };
  // }, [aiStats, loading]);

  // Handle Enter key in chat input
  

  // Quick action button click


  // Start recommended action
  const startAction = (actionId) => {
    const actionNames = {
      'shutdown-equipment': 'Éteindre équipements le soir',
      'install-led': 'Installer éclairage LED',
      'optimize-ac': 'Optimiser climatisation',
      'carpool': 'Covoiturage employés',
      'solar-panels': 'Panneaux solaires',
      'waste-sorting': 'Améliorer tri déchets'
    };

    const actionName = actionNames[actionId] || actionId;
    showNotification(`Action "${actionName}" ajoutée à votre plan d'action !`, 'success');
  };

  // Open recommendation modal
  const openRecommendationModal = (recommendationId) => {
    setSelectedRecommendation(recommendationDetails[recommendationId]);
    setModalOpen(true);
  };

  // Close recommendation modal
  const closeRecommendationModal = () => {
    setModalOpen(false);
    setSelectedRecommendation(null);
  };

  // Initialize prediction charts
  const initializePredictionCharts = () => {
    // Destroy existing charts
    Object.values(chartsRef.current).forEach(chart => {
      if (chart) chart.destroy();
    });

    // Electricity
    const el1 = document.getElementById('electricityPredictionChart');
    if (el1) {
      chartsRef.current.electricity = new Chart(el1, {
        type: 'line',
        data: {
          labels: ['J1', 'J5', 'J10', 'J15', 'J20', 'J25', 'J30'],
          datasets: [{
            data: [2450, 2500, 2480, 2550, 2600, 2620, 2650],
            borderColor: '#feca57',
            backgroundColor: 'rgba(254, 202, 87, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#feca57'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: false,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: '#b0b0b0'
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#b0b0b0'
              }
            }
          }
        }
      });
    }

    // Gas
    const el2 = document.getElementById('gasPredictionChart');
    if (el2) {
      chartsRef.current.gas = new Chart(el2, {
        type: 'line',
        data: {
          labels: ['J1', 'J5', 'J10', 'J15', 'J20', 'J25', 'J30'],
          datasets: [{
            data: [8, 8.2, 8.5, 9, 9.5, 10, 10.5],
            borderColor: '#ff6348',
            backgroundColor: 'rgba(255, 99, 72, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#ff6348'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: false,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: '#b0b0b0'
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#b0b0b0'
              }
            }
          }
        }
      });
    }

    // Transport
    const el3 = document.getElementById('transportPredictionChart');
    if (el3) {
      chartsRef.current.transport = new Chart(el3, {
        type: 'line',
        data: {
          labels: ['J1', 'J5', 'J10', 'J15', 'J20', 'J25', 'J30'],
          datasets: [{
            data: [8200, 8250, 8280, 8300, 8320, 8350, 8370],
            borderColor: '#48dbfb',
            backgroundColor: 'rgba(72, 219, 251, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#48dbfb'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: false,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: '#b0b0b0'
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#b0b0b0'
              }
            }
          }
        }
      });
    }

    // Waste
    const el4 = document.getElementById('wastePredictionChart');
    if (el4) {
      chartsRef.current.waste = new Chart(el4, {
        type: 'line',
        data: {
          labels: ['J1', 'J5', 'J10', 'J15', 'J20', 'J25', 'J30'],
          datasets: [{
            data: [518, 530, 545, 555, 565, 575, 580],
            borderColor: '#1dd1a1',
            backgroundColor: 'rgba(29, 209, 161, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#1dd1a1'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: false,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: '#b0b0b0'
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#b0b0b0'
              }
            }
          }
        }
      });
    }
  };

  // Cleanup charts on unmount
  useEffect(() => {
    return () => {
      Object.values(chartsRef.current).forEach(chart => {
        if (chart) chart.destroy();
      });
    };
  }, []);

  return (
    <section id="ai" className="tab-content active">
      <div className="section-header">
        <h2><i className="fas fa-brain" /> IA &amp; Prédictions</h2>
        <p>Assistant intelligent pour optimiser votre performance environnementale</p>
      </div>

      {/* AI Sub-Tabs */}
      <div className="ai-subtabs">
        <button
          className={`ai-subtab-btn ${activeSubTab === 'chatbot' ? 'active' : ''}`}
          data-ai-tab="chatbot"
          onClick={() => switchAITab('chatbot')}
        >
          <i className="fas fa-comments" /> Chatbot IA
        </button>
        <button
          className={`ai-subtab-btn ${activeSubTab === 'predictions' ? 'active' : ''}`}
          data-ai-tab="predictions"
          onClick={() => switchAITab('predictions')}
        >
          <i className="fas fa-chart-line" /> Prédictions
        </button>
        <button
          className={`ai-subtab-btn ${activeSubTab === 'recommendations' ? 'active' : ''}`}
          data-ai-tab="recommendations"
          onClick={() => switchAITab('recommendations')}
        >
          <i className="fas fa-lightbulb" /> Recommandations
        </button>
      </div>

      {/* Chatbot Tab */}
      <div className={`ai-tab-content ${activeSubTab === 'chatbot' ? 'active' : ''}`} id="ai-chatbot-content">
        <div className="ai-chatbot-container" style={{ margin: '0' }}>
          <div className="chatbot-card" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}>
            <div className="chatbot-header" style={{
              background: `linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)`,
              padding: '20px 25px',
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              <div className="chatbot-avatar" style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                <i className="fas fa-robot" />
              </div>
              <div className="chatbot-info">
                <h3 style={{
                  margin: '0',
                  fontSize: '18px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  Assistant GreenTech IA
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: '400',
                    opacity: '0.9'
                  }}>
                    <i className="fas fa-circle" style={{ fontSize: '8px', color: '#43e97b' }} /> En ligne
                  </span>
                </h3>
              </div>
            </div>

            <div className="chatbot-messages" ref={chatMessagesRef} style={{
              height: '450px',
              overflowY: 'auto',
              padding: '25px',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              background: 'rgba(0, 0, 0, 0.1)'
            }}>
              
{chatMessages.map((msg, index) => (
  <div key={index} className={`chat-message ${msg.sender}`} style={{
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
    animation: 'fadeInUp 0.3s ease',
    marginBottom: '20px'
  }}>
    {/* Avatar */}
    <div className="message-avatar" style={{
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      background: msg.sender === 'user'
        ? `linear-gradient(135deg, #0984e3 0%, #00cec9 100%)`
        : `#2f3640`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      color: 'white',
      flexShrink: 0,
      boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
    }}>
      <i className={msg.sender === 'user' ? 'fas fa-user' : 'fas fa-robot'} />
    </div>

    {/* Message Body */}
    <div style={{ flex: 1, maxWidth: '85%' }}>
      <div className="message-bubble" style={{
        padding: '15px 20px',
        borderRadius: msg.sender === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
        background: msg.sender === 'user'
          ? `linear-gradient(135deg, #0984e3 0%, #00cec9 100%)`
          : '#353b48', // Professional dark grey for AI
        color: 'white',
        fontSize: '14px',
        lineHeight: '1.6',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        wordWrap: 'break-word'
      }}>
        
{msg.sender === 'user' ? (
  msg.text
) : (
  <div className="markdown-content" style={{ 
      lineHeight: '1.6',
      fontSize: '14px',
      color: '#e0e0e0' // Couleur bach tban mzyan fou9 l-k7el
  }}>
<ReactMarkdown 
  remarkPlugins={[remarkGfm, remarkBreaks]} 
  components={{
    // 1. PARAGRAPHES: Zidna fihom Tisa3 w couleur mri7 l l-3in
    p: ({node, ...props}) => (
        <p style={{ 
            fontSize: '15px',
            lineHeight: '1.8',        // Espacement bin satora
            color: '#e2e8f0',         // Gris fate7 (machi abyad 100% bach maydrch f rras)
            marginBottom: '12px',
            whiteSpace: 'pre-wrap'
        }} {...props} />
    ),

    // 2. LISTES: N9ado les puces (points)
    ul: ({node, ...props}) => (
        <ul style={{ paddingLeft: '25px', marginBottom: '15px' }} {...props} />
    ),
    li: ({node, ...props}) => (
        <li style={{ 
            marginBottom: '8px', 
            color: '#cbd5e1',         // Gris chwiya fonçé 3la paragraph
            whiteSpace: 'pre-wrap',
            paddingLeft: '5px'
        }} {...props} />
    ),

    // 3. TITRES: Nzidou lihom Gradient wla couleur GreenTech
    h1: ({node, ...props}) => (
        <h1 style={{ 
            fontSize: '22px', 
            fontWeight: '700', 
            background: 'linear-gradient(to right, #43e97b, #38f9d7)', 
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '25px 0 15px 0',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            paddingBottom: '10px'
        }} {...props} />
    ),
    h2: ({node, ...props}) => (
        <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#feca57',         // Couleur Jaune dyal GreenTech
            margin: '20px 0 10px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        }} {...props} />
    ),
    h3: ({node, ...props}) => (
        <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#ffffff', 
            margin: '15px 0 8px 0',
            textDecoration: 'underline',
            textDecorationColor: '#43e97b'
        }} {...props} />
    ),

    // 4. GRAS (Strong): N-meyzoh b couleur
    strong: ({node, ...props}) => (
        <span style={{ 
            color: '#feca57', 
            fontWeight: '700',
            backgroundColor: 'rgba(254, 202, 87, 0.1)', // Highlight khfif
            padding: '0 4px',
            borderRadius: '4px'
        }} {...props} />
    ),

    // 5. CITATIONS (Blockquote): Bhal l-Mola7adat l-mohimma
    blockquote: ({node, ...props}) => (
        <blockquote style={{
            borderLeft: '4px solid #43e97b',
            background: 'rgba(67, 233, 123, 0.1)',
            padding: '10px 15px',
            margin: '15px 0',
            borderRadius: '0 8px 8px 0',
            fontStyle: 'italic',
            color: '#a7f3d0'
        }} {...props} />
    ),

    // 6. CODE BLOCKS: Ila l-IA 3tatk chi code awla chiffre technique
    code: ({node, inline, className, children, ...props}) => {
        return inline ? (
            <code style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontFamily: 'monospace',
                color: '#ff9ff3',
                fontSize: '0.9em'
            }} {...props}>{children}</code>
        ) : (
            <div style={{
                background: '#1e1e2e',
                padding: '15px',
                borderRadius: '8px',
                margin: '15px 0',
                border: '1px solid rgba(255,255,255,0.1)',
                overflowX: 'auto'
            }}>
                <code style={{ fontFamily: 'monospace', color: '#a6accd' }} {...props}>
                    {children}
                </code>
            </div>
        )
    },

    // 7. TABLES: Ila l-IA daret tableau
    table: ({node, ...props}) => (
        <div style={{ overflowX: 'auto', margin: '20px 0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }} {...props} />
        </div>
    ),
    thead: ({node, ...props}) => (
        <thead style={{ background: 'rgba(255,255,255,0.1)' }} {...props} />
    ),
    th: ({node, ...props}) => (
        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255,255,255,0.1)', color: '#feca57' }} {...props} />
    ),
    td: ({node, ...props}) => (
        <td style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }} {...props} />
    )
  }}
>
  {formatStreamText(msg.text)}
</ReactMarkdown>
  </div>
)}      </div>
      
      {/* Time Stamp */}
      <div className="message-time" style={{
        fontSize: '11px',
        color: 'rgba(255,255,255,0.4)',
        marginTop: '6px',
        paddingLeft: msg.sender === 'user' ? '0' : '4px',
        textAlign: msg.sender === 'user' ? 'right' : 'left'
      }}>
        {msg.time}
      </div>
    </div>
  </div>
))}
              {isTyping && (
                <div className="chat-message ai" style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start'
                }}>
                  <div className="message-avatar" style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: `var(--accent-color)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    flexShrink: 0
                  }}>
                    <i className="fas fa-robot" />
                  </div>
                  <div className="chatbot-typing" style={{
                    padding: '12px 16px',
                    borderRadius: '18px 18px 18px 4px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div className="typing-indicator" style={{ display: 'flex', gap: '4px' }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        animation: 'typingDot 1.4s infinite',
                        animationDelay: '0s'
                      }} />
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        animation: 'typingDot 1.4s infinite',
                        animationDelay: '0.2s'
                      }} />
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        animation: 'typingDot 1.4s infinite',
                        animationDelay: '0.4s'
                      }} />
                    </div>
                    <span style={{ marginLeft: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      L'IA réfléchit...
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="chatbot-quick-actions" style={{
              padding: '15px 25px',
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(0, 0, 0, 0.1)'
            }}>
              <button onClick={() => quickAction('Quel département consomme le plus ?')} style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <i className="fas fa-chart-pie" /> Quel département consomme le plus ?
              </button>
              <button onClick={() => quickAction('Quelle est mon empreinte carbone ?')} style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <i className="fas fa-leaf" /> Empreinte CO2
              </button>
              <button onClick={() => quickAction('Quelles actions me conseilles-tu ?')} style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <i className="fas fa-lightbulb" /> Suggestions
              </button>
              <button onClick={() => quickAction('Bilan du mois')} style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <i className="fas fa-chart-bar" /> Bilan
              </button>
              <button onClick={() => quickAction('État des capteurs IoT ?')} style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <i className="fas fa-microchip" /> État des capteurs IoT ?
              </button>
            </div>

            <div className="chatbot-input-container" style={{
              padding: '20px 25px',
              background: 'rgba(0, 0, 0, 0.15)',
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              <input
                type="text"
                id="chatInput"
                placeholder="Posez votre question..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleChatEnter}
                style={{
                  flex: 1,
                  padding: '12px 18px',
                  borderRadius: '25px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button className="send-btn" onClick={sendChatMessage} style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)`,
                border: 'none',
                color: 'white',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}>
                <i className="fas fa-paper-plane" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Predictions Tab */}
      <div className={`ai-tab-content ${activeSubTab === 'predictions' ? 'active' : ''}`} id="ai-predictions-content">
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
            <i className="fas fa-magic"></i>
            Générer les Prédictions
          </button>
        </div>

        {!isPredictionsGenerated ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '16px',
            border: '2px dashed rgba(255, 255, 255, 0.1)'
          }}>
            <i className="fas fa-chart-line" style={{
              fontSize: '64px',
              color: 'var(--accent-color)',
              opacity: 0.3,
              marginBottom: '20px'
            }}></i>
            <h4 style={{ fontSize: '20px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
              Aucune prédiction générée
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '500px', margin: '0 auto 25px' }}>
              Cliquez sur le bouton "Générer les Prédictions" pour analyser vos données historiques et obtenir des prévisions de consommation pour les 30 prochains jours.
            </p>
            <button onClick={generatePredictions} className="btn-primary">
              <i className="fas fa-magic"></i>
              Générer les Prédictions
            </button>
          </div>
        ) : (
          <div className="predictions-intro" style={{ marginBottom: '25px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Analyse prédictive de vos consommations basée sur l'historique et les tendances actuelles
            </p>
          </div>
        )}

        {isPredictionsGenerated && (
        <div className="predictions-grid" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          marginTop: '20px'
        }}>
          <div className="prediction-card" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(254, 202, 87, 0.2)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '70px 230px 170px 300px 260px 1fr',
              gap: '15px',
              alignItems: 'center'
            }}>
              {/* Colonne 1: Icône */}
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px'
              }}>
                <i className="fas fa-bolt" />
              </div>

              {/* Colonne 2: Titre + Sous-titre */}
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: '700' }}>
                  Prédiction Électricité
                </h4>
                <p style={{ margin: '0', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                  Consommation prévue sur 30 jours par département
                </p>
              </div>

              {/* Colonne 3: Valeur principale + % */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#feca57', marginBottom: '2px' }}>
                  2,650 kWh
                </div>
                <div style={{ fontSize: '11px', color: '#feca57' }}>
                  <i className="fas fa-arrow-up" /> +5%
                </div>
              </div>

              {/* Colonne 4: Graphique */}
              <div>
                <h5 style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📈 Tendance
                </h5>
                <div style={{ height: '140px', position: 'relative' }}>
                  <canvas id="electricityPredictionChart" />
                </div>
              </div>

              {/* Colonne 5: Répartition */}
              <div>
                <h5 style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📊 Répartition
                </h5>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.15)',
                  borderRadius: '10px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span>🏭 Production</span>
                    <span style={{ fontWeight: '700', color: '#feca57' }}>45%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span>🏢 Bureaux</span>
                    <span style={{ fontWeight: '700', color: '#feca57' }}>25%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span>📦 Entrepôt</span>
                    <span style={{ fontWeight: '700', color: '#feca57' }}>20%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span>☕ Cafétéria</span>
                    <span style={{ fontWeight: '700', color: '#feca57' }}>10%</span>
                  </div>
                </div>
              </div>

              {/* Colonne 6: Impact */}
              <div>
                <h5 style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  💰 Impact
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{
                    padding: '10px',
                    background: 'rgba(254, 202, 87, 0.1)',
                    borderRadius: '10px',
                    border: '1px solid rgba(254, 202, 87, 0.2)'
                  }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                      Coût prévu
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#feca57' }}>
                      2,310 MAD
                    </div>
                  </div>
                  <div style={{
                    padding: '10px',
                    background: 'rgba(67, 233, 123, 0.1)',
                    borderRadius: '10px',
                    border: '1px solid rgba(67, 233, 123, 0.2)'
                  }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                      Émissions CO2
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#43e97b' }}>
                      1.9 t CO2
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gas Prediction */}
          <div className="prediction-card" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(255, 99, 72, 0.2)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
          }}>
            {/* Grid avec largeurs fixes pour alignement parfait */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '70px 230px 170px 300px 260px 1fr',
              gap: '15px',
              alignItems: 'center'
            }}>
              {/* Colonne 1: Icône */}
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ff6348 0%, #ffb142 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px'
              }}>
                <i className="fas fa-fire" />
              </div>

              {/* Colonne 2: Titre + Sous-titre */}
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: '700' }}>
                  Prédiction Gaz
                </h4>
                <p style={{ margin: '0', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                  Consommation prévue sur 30 jours par usage
                </p>
              </div>

              {/* Colonne 3: Valeur principale + % */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#ff6348', marginBottom: '2px' }}>
                  10.5 btl
                </div>
                <div style={{ fontSize: '11px', color: '#ff6348' }}>
                  <i className="fas fa-arrow-up" /> +3%
                </div>
              </div>

              {/* Colonne 4: Graphique */}
              <div>
                <h5 style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📈 Tendance
                </h5>
                <div style={{ height: '140px', position: 'relative' }}>
                  <canvas id="gasPredictionChart" />
                </div>
              </div>

              {/* Colonne 5: Répartition */}
              <div>
                <h5 style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📊 Répartition
                </h5>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.15)',
                  borderRadius: '10px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span>🍳 Cuisine</span>
                    <span style={{ fontWeight: '700', color: '#ff6348' }}>35%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span>🌡️ Chauffage</span>
                    <span style={{ fontWeight: '700', color: '#ff6348' }}>30%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span>❄️ Climatisation</span>
                    <span style={{ fontWeight: '700', color: '#ff6348' }}>25%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span>💧 Eau + Production</span>
                    <span style={{ fontWeight: '700', color: '#ff6348' }}>10%</span>
                  </div>
                </div>
              </div>

              {/* Colonne 6: Impact */}
              <div>
                <h5 style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  💰 Impact
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{
                    padding: '10px',
                    background: 'rgba(255, 99, 72, 0.1)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 99, 72, 0.2)'
                  }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                      Coût prévu
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#ff6348' }}>
                      520 MAD
                    </div>
                  </div>
                  <div style={{
                    padding: '10px',
                    background: 'rgba(67, 233, 123, 0.1)',
                    borderRadius: '10px',
                    border: '1px solid rgba(67, 233, 123, 0.2)'
                  }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                      Émissions CO2
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#43e97b' }}>
                      86 kg CO2
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transport Prediction */}
          <div className="prediction-card" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(72, 219, 251, 0.2)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
          }}>
            {/* Grid avec largeurs fixes pour alignement parfait */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '70px 230px 170px 300px 260px 1fr',
              gap: '15px',
              alignItems: 'center'
            }}>
              {/* Colonne 1: Icône */}
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #48dbfb 0%, #0abde3 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px'
              }}>
                <i className="fas fa-truck" />
              </div>

              {/* Colonne 2: Titre + Sous-titre */}
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: '700' }}>
                  Prédiction Transport
                </h4>
                <p style={{ margin: '0', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                  Distance prévue sur 30 jours par véhicule
                </p>
              </div>

              {/* Colonne 3: Valeur principale + % */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#48dbfb', marginBottom: '2px' }}>
                  8,370 km
                </div>
                <div style={{ fontSize: '11px', color: '#48dbfb' }}>
                  <i className="fas fa-arrow-up" /> +2%
                </div>
              </div>

              {/* Colonne 4: Graphique */}
              <div>
                <h5 style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📈 Tendance
                </h5>
                <div style={{ height: '140px', position: 'relative' }}>
                  <canvas id="transportPredictionChart" />
                </div>
              </div>

              {/* Colonne 5: Répartition */}
              <div>
                <h5 style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📊 Répartition
                </h5>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.15)',
                  borderRadius: '10px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span>🚚 Camion</span>
                    <span style={{ fontWeight: '700', color: '#48dbfb' }}>32%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span>🚐 Camionnette</span>
                    <span style={{ fontWeight: '700', color: '#48dbfb' }}>24%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span>🚗 Voitures</span>
                    <span style={{ fontWeight: '700', color: '#48dbfb' }}>24%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span>🚙 Utilitaire + Moto</span>
                    <span style={{ fontWeight: '700', color: '#48dbfb' }}>20%</span>
                  </div>
                </div>
              </div>

              {/* Colonne 6: Impact */}
              <div>
                <h5 style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  💰 Impact
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{
                    padding: '10px',
                    background: 'rgba(72, 219, 251, 0.1)',
                    borderRadius: '10px',
                    border: '1px solid rgba(72, 219, 251, 0.2)'
                  }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                      Essence consommée
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#48dbfb' }}>
                      789 L
                    </div>
                  </div>
                  <div style={{
                    padding: '10px',
                    background: 'rgba(67, 233, 123, 0.1)',
                    borderRadius: '10px',
                    border: '1px solid rgba(67, 233, 123, 0.2)'
                  }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                      Émissions CO2
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#43e97b' }}>
                      1.86 t CO2
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Waste Prediction */}
          <div className="prediction-card" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(29, 209, 161, 0.2)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
          }}>
            {/* Grid avec largeurs fixes pour alignement parfait */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '70px 230px 170px 300px 260px 1fr',
              gap: '15px',
              alignItems: 'center'
            }}>
              {/* Colonne 1: Icône */}
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #1dd1a1 0%, #10ac84 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px'
              }}>
                <i className="fas fa-trash-alt" />
              </div>

              {/* Colonne 2: Titre + Sous-titre */}
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: '700' }}>
                  Prédiction Déchets
                </h4>
                <p style={{ margin: '0', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                  Production prévue sur 30 jours par type (Taux recyclage: 42%)
                </p>
              </div>

              {/* Colonne 3: Valeur principale + % */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1dd1a1', marginBottom: '2px' }}>
                  580 kg
                </div>
                <div style={{ fontSize: '11px', color: '#f5576c' }}>
                  <i className="fas fa-arrow-up" /> +12%
                </div>
              </div>

              {/* Colonne 4: Graphique */}
              <div>
                <h5 style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📈 Tendance
                </h5>
                <div style={{ height: '140px', position: 'relative' }}>
                  <canvas id="wastePredictionChart" />
                </div>
              </div>

              {/* Colonne 5: Répartition */}
              <div>
                <h5 style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📊 Répartition
                </h5>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.15)',
                  borderRadius: '10px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                      <span>♻️ Recyclable</span>
                      <span style={{ fontWeight: '700', color: '#1dd1a1' }}>42%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '42%', height: '100%', background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)', borderRadius: '3px' }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                      <span>🍃 Organique</span>
                      <span style={{ fontWeight: '700', color: '#1dd1a1' }}>35%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '35%', height: '100%', background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)', borderRadius: '3px' }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                      <span>🗑️ Non-recyclable</span>
                      <span style={{ fontWeight: '700', color: '#1dd1a1' }}>23%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '23%', height: '100%', background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)', borderRadius: '3px' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Colonne 6: Impact */}
              <div>
                <h5 style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  💰 Impact
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{
                    padding: '10px',
                    background: 'rgba(29, 209, 161, 0.1)',
                    borderRadius: '10px',
                    border: '1px solid rgba(29, 209, 161, 0.2)'
                  }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                      Déchets recyclés
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#1dd1a1' }}>
                      244 kg
                    </div>
                  </div>
                  <div style={{
                    padding: '10px',
                    background: 'rgba(67, 233, 123, 0.1)',
                    borderRadius: '10px',
                    border: '1px solid rgba(67, 233, 123, 0.2)'
                  }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                      Émissions CO2
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#43e97b' }}>
                      133 kg CO2
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Recommendations Tab */}
      <div className={`ai-tab-content ${activeSubTab === 'recommendations' ? 'active' : ''}`} id="ai-recommendations-content">
        <div className="recommendations-intro" style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
              <i className="fas fa-magic" /> Recommandations Intelligentes
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Basées sur l'analyse de vos données, voici les actions prioritaires pour optimiser votre
              performance environnementale et réaliser des économies.
            </p>
          </div>
          <button onClick={generateRecommendations} className="btn-primary">
            <i className="fas fa-magic"></i>
            Générer les Recommandations
          </button>
        </div>

        {!isRecommendationsGenerated ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '16px',
            border: '2px dashed rgba(255, 255, 255, 0.1)'
          }}>
            <i className="fas fa-magic" style={{
              fontSize: '64px',
              color: 'var(--accent-color)',
              opacity: 0.3,
              marginBottom: '20px'
            }}></i>
            <h4 style={{ fontSize: '20px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
              Aucune recommandation générée
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '500px', margin: '0 auto 25px' }}>
              Cliquez sur le bouton "Générer les Recommandations" pour analyser vos données et obtenir des actions prioritaires pour optimiser votre performance environnementale.
            </p>
            <button onClick={generateRecommendations} className="btn-primary">
              <i className="fas fa-magic"></i>
              Générer les Recommandations
            </button>
          </div>
        ) : (
          <>

        {/* Facile (Easy) Row */}
        <div className="recommendations-row" style={{ marginBottom: '25px' }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#43e97b'
          }}>
            <i className="fas fa-circle" style={{ fontSize: '10px' }} /> Actions Faciles
          </h4>
          <div className="recommendations-scroll" style={{
            display: 'flex',
            gap: '20px',
            overflowX: 'auto',
            paddingBottom: '15px'
          }}>
            {/* Recommendation 1 - Easy */}
            <div className="recommendation-card" style={{
              minWidth: '340px',
              maxWidth: '340px',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid rgba(67, 233, 123, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}>
              <div className="recommendation-header" style={{ marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: '600' }}>
                  🌙 Éteindre Équipements Production le Soir
                </h4>
                <div className="recommendation-badges">
                  <span className="difficulty-badge easy" style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    background: 'rgba(67, 233, 123, 0.15)',
                    border: '1px solid rgba(67, 233, 123, 0.3)',
                    fontSize: '11px',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#43e97b'
                  }}>
                    <i className="fas fa-circle" /> Facile
                  </span>
                </div>
              </div>
              <div className="recommendation-impact" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '15px',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '10px'
              }}>
                <div className="impact-stars" style={{ display: 'flex', gap: '4px', color: '#feca57' }}>
                  <i className="fas fa-star" />
                  <i className="fas fa-star" />
                  <i className="fas fa-star" />
                </div>
                <span className="impact-label" style={{ fontSize: '12px', fontWeight: '600', color: '#43e97b' }}>
                  Impact Élevé
                </span>
              </div>
              <div className="recommendation-metrics" style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '15px'
              }}>
                <div className="metric" style={{
                  flex: 1,
                  padding: '10px',
                  background: 'rgba(67, 233, 123, 0.1)',
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <i className="fas fa-leaf" style={{ color: '#43e97b', marginBottom: '6px' }} />
                  <div className="metric-value" style={{ fontSize: '13px', fontWeight: '600' }}>-2.1 t CO2/an</div>
                </div>
                <div className="metric" style={{
                  flex: 1,
                  padding: '10px',
                  background: 'rgba(254, 202, 87, 0.1)',
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <i className="fas fa-coins" style={{ color: '#feca57', marginBottom: '6px' }} />
                  <div className="metric-value" style={{ fontSize: '13px', fontWeight: '600' }}>-850 MAD/an</div>
                </div>
              </div>
              <div className="recommendation-implementation" style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '12px'
              }}>
                <span className="impl-cost" style={{
                  flex: 1,
                  padding: '8px',
                  background: 'rgba(67, 233, 123, 0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  textAlign: 'center',
                  fontWeight: '600',
                  color: '#43e97b'
                }}>Gratuit</span>
                <span className="impl-time" style={{
                  flex: 1,
                  padding: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  textAlign: 'center'
                }}>Immédiat</span>
              </div>
              <p style={{ margin: '0 0 15px 0', color: '#b0b0b0', fontSize: '12px', lineHeight: '1.5' }}>
                Machines en 🏭 Production consomment ~12% d'énergie en veille (18h-7h). Éteindre complètement = économie directe.
              </p>
              <button className="btn-start-action" onClick={() => openRecommendationModal('shutdown-equipment')} style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                border: 'none',
                color: 'white',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'transform 0.2s ease'
              }}>
                <i className="fas fa-info-circle" /> Voir détails
              </button>
            </div>

            {/* Recommendation 3 - Easy */}
            <div className="recommendation-card" style={{
              minWidth: '340px',
              maxWidth: '340px',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid rgba(67, 233, 123, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}>
              <div className="recommendation-header" style={{ marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: '600' }}>
                  ❄️ Réduire Gaz Réfrigérant Climatisation
                </h4>
                <div className="recommendation-badges">
                  <span className="difficulty-badge easy" style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    background: 'rgba(67, 233, 123, 0.15)',
                    border: '1px solid rgba(67, 233, 123, 0.3)',
                    fontSize: '11px',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#43e97b'
                  }}>
                    <i className="fas fa-circle" /> Facile
                  </span>
                </div>
              </div>
              <div className="recommendation-impact" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '15px',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '10px'
              }}>
                <div className="impact-stars" style={{ display: 'flex', gap: '4px', color: '#feca57' }}>
                  <i className="fas fa-star" />
                  <i className="fas fa-star" />
                  <i className="far fa-star" />
                </div>
                <span className="impact-label" style={{ fontSize: '12px', fontWeight: '600' }}>Impact Moyen</span>
              </div>
              <div className="recommendation-metrics" style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '15px'
              }}>
                <div className="metric" style={{
                  flex: 1,
                  padding: '10px',
                  background: 'rgba(67, 233, 123, 0.1)',
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <i className="fas fa-leaf" style={{ color: '#43e97b', marginBottom: '6px' }} />
                  <div className="metric-value" style={{ fontSize: '13px', fontWeight: '600' }}>-1.5 t CO2/an</div>
                </div>
                <div className="metric" style={{
                  flex: 1,
                  padding: '10px',
                  background: 'rgba(254, 202, 87, 0.1)',
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <i className="fas fa-coins" style={{ color: '#feca57', marginBottom: '6px' }} />
                  <div className="metric-value" style={{ fontSize: '13px', fontWeight: '600' }}>-680 MAD/an</div>
                </div>
              </div>
              <div className="recommendation-implementation" style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '12px'
              }}>
                <span className="impl-cost" style={{
                  flex: 1,
                  padding: '8px',
                  background: 'rgba(67, 233, 123, 0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  textAlign: 'center',
                  fontWeight: '600',
                  color: '#43e97b'
                }}>Gratuit</span>
                <span className="impl-time" style={{
                  flex: 1,
                  padding: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  textAlign: 'center'
                }}>Immédiat</span>
              </div>
              <p style={{ margin: '0 0 15px 0', color: '#b0b0b0', fontSize: '12px', lineHeight: '1.5' }}>
                Passer température de 22°C → 24°C réduit consommation de 15%. Maintenance filtres = moins fuites réfrigérant.
              </p>
              <button className="btn-start-action" onClick={() => openRecommendationModal('optimize-ac')} style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                border: 'none',
                color: 'white',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'transform 0.2s ease'
              }}>
                <i className="fas fa-info-circle" /> Voir détails
              </button>
            </div>

            {/* Recommendation 6 - Easy */}
            <div className="recommendation-card" style={{
              minWidth: '340px',
              maxWidth: '340px',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid rgba(67, 233, 123, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}>
              <div className="recommendation-header" style={{ marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: '600' }}>
                  ♻️ Améliorer Tri Déchets (5 types)
                </h4>
                <div className="recommendation-badges">
                  <span className="difficulty-badge easy" style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    background: 'rgba(67, 233, 123, 0.15)',
                    border: '1px solid rgba(67, 233, 123, 0.3)',
                    fontSize: '11px',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#43e97b'
                  }}>
                    <i className="fas fa-circle" /> Facile
                  </span>
                </div>
              </div>
              <div className="recommendation-impact" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '15px',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '10px'
              }}>
                <div className="impact-stars" style={{ display: 'flex', gap: '4px', color: '#feca57' }}>
                  <i className="fas fa-star" />
                  <i className="fas fa-star" />
                  <i className="far fa-star" />
                </div>
                <span className="impact-label" style={{ fontSize: '12px', fontWeight: '600' }}>Impact Moyen</span>
              </div>
              <div className="recommendation-metrics" style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '15px'
              }}>
                <div className="metric" style={{
                  flex: 1,
                  padding: '10px',
                  background: 'rgba(67, 233, 123, 0.1)',
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <i className="fas fa-leaf" style={{ color: '#43e97b', marginBottom: '6px' }} />
                  <div className="metric-value" style={{ fontSize: '13px', fontWeight: '600' }}>-0.8 t CO2/an</div>
                </div>
                <div className="metric" style={{
                  flex: 1,
                  padding: '10px',
                  background: 'rgba(254, 202, 87, 0.1)',
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <i className="fas fa-coins" style={{ color: '#feca57', marginBottom: '6px' }} />
                  <div className="metric-value" style={{ fontSize: '13px', fontWeight: '600' }}>-350 MAD/an</div>
                </div>
              </div>
              <div className="recommendation-implementation" style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '12px'
              }}>
                <span className="impl-cost" style={{
                  flex: 1,
                  padding: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  textAlign: 'center'
                }}>800 MAD</span>
                <span className="impl-time" style={{
                  flex: 1,
                  padding: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  textAlign: 'center'
                }}>1 semaine</span>
              </div>
              <p style={{ margin: '0 0 15px 0', color: '#b0b0b0', fontSize: '12px', lineHeight: '1.5' }}>
                Taux recyclage actuel 42%. Objectif 60% en séparant mieux 💻 Électronique et ☢️ Dangereux. Formation équipe + signalétique.
              </p>
              <button className="btn-start-action" onClick={() => openRecommendationModal('carpool')} style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                border: 'none',
                color: 'white',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'transform 0.2s ease'
              }}>
                <i className="fas fa-info-circle" /> Voir détails
              </button>
            </div>
          </div>
        </div>

        {/* Moyen (Medium) Row */}
        <div className="recommendations-row" style={{ marginBottom: '25px' }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#feca57'
          }}>
            <i className="fas fa-circle" style={{ fontSize: '10px' }} /> Actions Moyennes
          </h4>
          <div className="recommendations-scroll" style={{
            display: 'flex',
            gap: '20px',
            overflowX: 'auto',
            paddingBottom: '15px'
          }}>
            {/* Recommendation 2 - Medium */}
            <div className="recommendation-card featured" style={{
              minWidth: '340px',
              maxWidth: '340px',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '20px',
              border: '2px solid rgba(254, 202, 87, 0.4)',
              boxShadow: '0 8px 32px rgba(254, 202, 87, 0.2)'
            }}>
              <div className="recommendation-header" style={{ marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: '600' }}>
                  💡 LED pour Bureaux + Entrepôt
                </h4>
                <div className="recommendation-badges">
                  <span className="difficulty-badge medium" style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    background: 'rgba(254, 202, 87, 0.15)',
                    border: '1px solid rgba(254, 202, 87, 0.3)',
                    fontSize: '11px',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#feca57'
                  }}>
                    <i className="fas fa-circle" /> Moyen
                  </span>
                </div>
              </div>
              <div className="recommendation-impact" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '15px',
                padding: '12px',
                background: 'rgba(254, 202, 87, 0.1)',
                borderRadius: '10px'
              }}>
                <div className="impact-stars" style={{ display: 'flex', gap: '4px', color: '#feca57' }}>
                  <i className="fas fa-star" />
                  <i className="fas fa-star" />
                  <i className="fas fa-star" />
                </div>
                <span className="impact-label" style={{ fontSize: '12px', fontWeight: '600', color: '#feca57' }}>
                  Impact Maximum
                </span>
              </div>
              <div className="recommendation-metrics" style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '15px'
              }}>
                <div className="metric" style={{
                  flex: 1,
                  padding: '10px',
                  background: 'rgba(67, 233, 123, 0.1)',
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <i className="fas fa-leaf" style={{ color: '#43e97b', marginBottom: '6px' }} />
                  <div className="metric-value" style={{ fontSize: '13px', fontWeight: '600' }}>-2.8 t CO2/an</div>
                </div>
                <div className="metric" style={{
                  flex: 1,
                  padding: '10px',
                  background: 'rgba(254, 202, 87, 0.1)',
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <i className="fas fa-coins" style={{ color: '#feca57', marginBottom: '6px' }} />
                  <div className="metric-value" style={{ fontSize: '13px', fontWeight: '600' }}>-1,800 MAD/an</div>
                </div>
              </div>
              <div className="recommendation-implementation" style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '12px'
              }}>
                <span className="impl-cost" style={{
                  flex: 1,
                  padding: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  textAlign: 'center'
                }}>3,500 MAD</span>
                <span className="impl-time" style={{
                  flex: 1,
                  padding: '8px',
                  background: 'rgba(254, 202, 87, 0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  textAlign: 'center',
                  fontWeight: '600',
                  color: '#feca57'
                }}>ROI 2 ans</span>
              </div>
              <p style={{ margin: '0 0 15px 0', color: '#b0b0b0', fontSize: '12px', lineHeight: '1.5' }}>
                🏢 Bureaux (864 kWh) + 📦 Entrepôt (691 kWh) = 1555 kWh/mois. LED réduit éclairage de 60%.
              </p>
              <button className="btn-start-action" onClick={() => openRecommendationModal('install-led')} style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)',
                border: 'none',
                color: 'white',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'transform 0.2s ease'
              }}>
                <i className="fas fa-info-circle" /> Voir détails
              </button>
            </div>

            {/* Recommendation 4 - Medium */}
            <div className="recommendation-card" style={{
              minWidth: '340px',
              maxWidth: '340px',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid rgba(254, 202, 87, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}>
              <div className="recommendation-header" style={{ marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: '600' }}>
                  🚗 Optimiser Trajets Flotte
                </h4>
                <div className="recommendation-badges">
                  <span className="difficulty-badge medium" style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    background: 'rgba(254, 202, 87, 0.15)',
                    border: '1px solid rgba(254, 202, 87, 0.3)',
                    fontSize: '11px',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#feca57'
                  }}>
                    <i className="fas fa-circle" /> Moyen
                  </span>
                </div>
              </div>
              <div className="recommendation-impact" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '15px',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '10px'
              }}>
                <div className="impact-stars" style={{ display: 'flex', gap: '4px', color: '#feca57' }}>
                  <i className="fas fa-star" />
                  <i className="fas fa-star" />
                  <i className="fas fa-star" />
                </div>
                <span className="impact-label" style={{ fontSize: '12px', fontWeight: '600' }}>Impact Élevé</span>
              </div>
              <div className="recommendation-metrics" style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '15px'
              }}>
                <div className="metric" style={{
                  flex: 1,
                  padding: '10px',
                  background: 'rgba(67, 233, 123, 0.1)',
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <i className="fas fa-leaf" style={{ color: '#43e97b', marginBottom: '6px' }} />
                  <div className="metric-value" style={{ fontSize: '13px', fontWeight: '600' }}>-3.2 t CO2/an</div>
                </div>
                <div className="metric" style={{
                  flex: 1,
                  padding: '10px',
                  background: 'rgba(254, 202, 87, 0.1)',
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <i className="fas fa-coins" style={{ color: '#feca57', marginBottom: '6px' }} />
                  <div className="metric-value" style={{ fontSize: '13px', fontWeight: '600' }}>-2,100 MAD/an</div>
                </div>
              </div>
              <div className="recommendation-implementation" style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '12px'
              }}>
                <span className="impl-cost" style={{
                  flex: 1,
                  padding: '8px',
                  background: 'rgba(67, 233, 123, 0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  textAlign: 'center',
                  fontWeight: '600',
                  color: '#43e97b'
                }}>Gratuit</span>
                <span className="impl-time" style={{
                  flex: 1,
                  padding: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  textAlign: 'center'
                }}>1 mois</span>
              </div>
              <p style={{ margin: '0 0 15px 0', color: '#b0b0b0', fontSize: '12px', lineHeight: '1.5' }}>
                🚚 Camion + 🚐 Camionnette = 56% du carburant. Planifier trajets et privilégier 🏍️ Moto pour courtes distances.
              </p>
              <button className="btn-start-action" onClick={() => openRecommendationModal('transport-efficiency')} style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)',
                border: 'none',
                color: 'white',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'transform 0.2s ease'
              }}>
                <i className="fas fa-info-circle" /> Voir détails
              </button>
            </div>
          </div>
        </div>

        {/* Difficile (Hard) Row */}
        <div className="recommendations-row">
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#f5576c'
          }}>
            <i className="fas fa-circle" style={{ fontSize: '10px' }} /> Actions Difficiles
          </h4>
          <div className="recommendations-scroll" style={{
            display: 'flex',
            gap: '20px',
            overflowX: 'auto',
            paddingBottom: '15px'
          }}>
            {/* Recommendation 5 - Hard */}
            <div className="recommendation-card featured" style={{
              minWidth: '340px',
              maxWidth: '340px',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '20px',
              border: '2px solid rgba(245, 87, 108, 0.4)',
              boxShadow: '0 8px 32px rgba(245, 87, 108, 0.2)'
            }}>
              <div className="recommendation-header" style={{ marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: '600' }}>
                  ☀️ Panneaux Solaires pour Production
                </h4>
                <div className="recommendation-badges">
                  <span className="difficulty-badge hard" style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    background: 'rgba(245, 87, 108, 0.15)',
                    border: '1px solid rgba(245, 87, 108, 0.3)',
                    fontSize: '11px',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#f5576c'
                  }}>
                    <i className="fas fa-circle" /> Difficile
                  </span>
                </div>
              </div>
              <div className="recommendation-impact" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '15px',
                padding: '12px',
                background: 'rgba(245, 87, 108, 0.1)',
                borderRadius: '10px'
              }}>
                <div className="impact-stars" style={{ display: 'flex', gap: '4px', color: '#feca57' }}>
                  <i className="fas fa-star" />
                  <i className="fas fa-star" />
                  <i className="fas fa-star" />
                </div>
                <span className="impact-label" style={{ fontSize: '12px', fontWeight: '600', color: '#f5576c' }}>
                  Impact Maximum
                </span>
              </div>
              <div className="recommendation-metrics" style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '15px'
              }}>
                <div className="metric" style={{
                  flex: 1,
                  padding: '10px',
                  background: 'rgba(67, 233, 123, 0.1)',
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <i className="fas fa-leaf" style={{ color: '#43e97b', marginBottom: '6px' }} />
                  <div className="metric-value" style={{ fontSize: '13px', fontWeight: '600' }}>-8.5 t CO2/an</div>
                </div>
                <div className="metric" style={{
                  flex: 1,
                  padding: '10px',
                  background: 'rgba(254, 202, 87, 0.1)',
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <i className="fas fa-coins" style={{ color: '#feca57', marginBottom: '6px' }} />
                  <div className="metric-value" style={{ fontSize: '13px', fontWeight: '600' }}>-5,200 MAD/an</div>
                </div>
              </div>
              <div className="recommendation-implementation" style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '12px'
              }}>
                <span className="impl-cost" style={{
                  flex: 1,
                  padding: '8px',
                  background: 'rgba(245, 87, 108, 0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  textAlign: 'center',
                  fontWeight: '600',
                  color: '#f5576c'
                }}>25,000 MAD</span>
                <span className="impl-time" style={{
                  flex: 1,
                  padding: '8px',
                  background: 'rgba(254, 202, 87, 0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  textAlign: 'center',
                  fontWeight: '600',
                  color: '#feca57'
                }}>ROI 5 ans</span>
              </div>
              <p style={{ margin: '0 0 15px 0', color: '#b0b0b0', fontSize: '12px', lineHeight: '1.5' }}>
                Cibler 🏭 Production (1728 kWh/mois = 45% total). Installation 6kW peut couvrir 30% des besoins.
              </p>
              <button className="btn-start-action" onClick={() => openRecommendationModal('solar-panels')} style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                border: 'none',
                color: 'white',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'transform 0.2s ease'
              }}>
                <i className="fas fa-info-circle" /> Voir détails
              </button>
            </div>
          </div>
        </div>
        </>
        )}
      </div>

      {/* Recommendation Modal */}
      {modalOpen && selectedRecommendation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          animation: 'fadeIn 0.3s ease-out'
        }} onClick={closeRecommendationModal}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(18, 18, 36, 0.98) 100%)',
            borderRadius: '20px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={closeRecommendationModal}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(245, 87, 108, 0.8)';
                e.currentTarget.style.transform = 'rotate(90deg) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
              }}
              style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '20px',
              color: 'white',
              transition: 'all 0.3s ease',
              zIndex: 10001
            }}>
              <i className="fas fa-times" />
            </button>

            {/* Modal Header */}
            <div style={{
              padding: '30px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '28px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  <i className={`fas fa-${selectedRecommendation.icon}`} />
                </div>
                {selectedRecommendation.title}
              </h2>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '30px' }}>
              {/* Description */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-info-circle" /> Description
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {selectedRecommendation.description}
                </p>
              </div>

              {/* Impact & Metrics */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-chart-bar" /> Impact & Métriques
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '15px'
                }}>
                  <div style={{
                    background: 'rgba(67, 233, 123, 0.1)',
                    padding: '15px',
                    borderRadius: '12px',
                    border: '1px solid rgba(67, 233, 123, 0.2)'
                  }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                      <i className="fas fa-leaf" /> Impact CO2
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#43e97b' }}>
                      {selectedRecommendation.impact.co2}
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(254, 202, 87, 0.1)',
                    padding: '15px',
                    borderRadius: '12px',
                    border: '1px solid rgba(254, 202, 87, 0.2)'
                  }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                      <i className="fas fa-coins" /> Économies
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#feca57' }}>
                      {selectedRecommendation.impact.cost}
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(72, 219, 251, 0.1)',
                    padding: '15px',
                    borderRadius: '12px',
                    border: '1px solid rgba(72, 219, 251, 0.2)'
                  }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                      <i className="fas fa-gauge" /> Difficulté
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#48dbfb' }}>
                      {selectedRecommendation.impact.difficulty}
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(245, 87, 108, 0.1)',
                    padding: '15px',
                    borderRadius: '12px',
                    border: '1px solid rgba(245, 87, 108, 0.2)'
                  }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                      <i className="fas fa-clock" /> Délai
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#f5576c' }}>
                      {selectedRecommendation.impact.time}
                    </div>
                  </div>
                  {selectedRecommendation.impact.investissement && (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '15px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                        <i className="fas fa-wallet" /> Investissement
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: '700' }}>
                        {selectedRecommendation.impact.investissement}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Steps */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-list-ol" /> Étapes de mise en œuvre
                </h3>
                <ol style={{ paddingLeft: '20px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  {selectedRecommendation.steps.map((step, index) => (
                    <li key={index} style={{ marginBottom: '8px' }}>{step}</li>
                  ))}
                </ol>
              </div>

              {/* Benefits */}
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-star" /> Bénéfices clés
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '15px'
                }}>
                  {selectedRecommendation.benefits.map((benefit, index) => (
                    <div key={index} style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '15px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      textAlign: 'center'
                    }}>
                      <i className={`fas fa-${benefit.icon}`} style={{ fontSize: '24px', color: 'var(--accent-color)', marginBottom: '8px' }} />
                      <h5 style={{ fontSize: '14px', fontWeight: '600', margin: '8px 0 4px 0' }}>{benefit.label}</h5>
                      <p style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary-color)', margin: 0 }}>{benefit.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AI;
