import React, { useState, useEffect, useRef } from 'react';
import { showNotification } from '../../utils/notifications';
import Chart from 'chart.js/auto';
import { useLoading } from '../../contexts/LoadingContext';

const AI = () => {
  const [activeSubTab, setActiveSubTab] = useState('chatbot');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);

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

  const chatMessagesRef = useRef(null);
  const chartsRef = useRef({
    electricity: null,
    gas: null,
    transport: null,
    waste: null
  });
  const hasInitialized = useRef(false);

  // AI Knowledge Base
  const aiKnowledgeBase = {
    "bonjour": {
      keywords: ["bonjour", "salut", "hello", "hi"],
      response: "Bonjour ! Je suis l'assistant IA GreenTech. Je peux vous aider à optimiser votre consommation énergétique et réduire votre empreinte carbone. Comment puis-je vous aider aujourd'hui ?"
    },
    "économiser": {
      keywords: ["économiser", "économie", "réduire", "baisser", "diminuer"],
      response: "Voici 3 actions immédiates pour réduire votre consommation :\n\n1️⃣ Éteindre les équipements en veille → Économie de ~8%\n2️⃣ Remplacer vos ampoules par des LED → -60% sur l'éclairage\n3️⃣ Régler la climatisation à 24°C au lieu de 22°C → -15%\n\nVoulez-vous plus de détails sur l'une de ces actions ?"
    },
    "empreinte": {
      keywords: ["empreinte", "carbone", "co2", "émissions"],
      response: "Émissions CO2 totales actuelles :\n\n🔌 Électricité (Production) : 864 kg CO2\n🔌 Électricité (Bureaux) : 432 kg CO2\n🔌 Électricité (Entrepôt) : 345 kg CO2\n🚗 Transport : Voir par type de véhicule\n🗑️ Déchets (Organique) : 92.5 kg CO2\n🗑️ Déchets (Recyclable) : 40.6 kg CO2\n🔥 Gaz (Cuisine/Chauffage) : Butane 3kg CO2/bouteille\n\nVotre taux de recyclage de 42% est excellent !"
    },
    "bilan": {
      keywords: ["bilan", "rapport", "stats", "statistiques"],
      response: "📊 Bilan du mois en cours :\n\n✅ Consommation électrique : 2,450 kWh (stable)\n✅ Empreinte carbone : 12.5 tonnes CO2 (-8% vs mois dernier)\n✅ Économies réalisées : 380€\n✅ Eco-Coins collectés : 8,450 points (+250 cette semaine)\n\nTrès bonne performance ! Continuez comme ça !"
    },
    "suggestions": {
      keywords: ["suggestions", "actions", "recommandations", "conseils"],
      response: "Mes meilleures recommandations pour vous :\n\n⭐⭐⭐ Installer éclairage LED → -2.8 tonnes CO2/an, -1,800€/an\n⭐⭐⭐ Panneaux solaires → -8.5 tonnes CO2/an, -5,200€/an\n⭐⭐ Optimiser climatisation → -1.5 tonnes CO2/an, -680€/an\n\nVoulez-vous plus de détails sur l'une de ces actions ?"
    },
    "réglementations": {
      keywords: ["réglementation", "loi", "normes", "conformité", "légal"],
      response: "📋 Principales réglementations environnementales :\n\n• Directive européenne sur l'efficacité énergétique\n• Norme ISO 14001 pour le management environnemental\n• Obligation de reporting carbone (>500 employés)\n• Réglementation RE2020 pour les bâtiments\n\nVotre entreprise est actuellement conforme à 4/4 réglementations ✅"
    },
    "led": {
      keywords: ["led", "éclairage", "ampoules", "lumière"],
      response: "💡 Installation LED - Détails :\n\n📊 Impact : -18% consommation électrique\n💰 ROI : 18 mois (investissement 3,500€)\n🌱 CO2 économisé : 2.8 tonnes/an\n💵 Économies : 1,800€/an\n\nC'est l'une de nos recommandations prioritaires ! Souhaitez-vous lancer cette action ?"
    },
    "solaire": {
      keywords: ["solaire", "panneaux", "photovoltaïque"],
      response: "☀️ Panneaux Solaires - Détails :\n\n📊 Impact maximum : -8.5 tonnes CO2/an\n💰 Investissement : 25,000€\n💵 Économies annuelles : 5,200€/an\n📅 ROI : 5 ans\n🔋 Production estimée : ~15,000 kWh/an\n\nC'est un investissement important mais très rentable à long terme !"
    },
    "climatisation": {
      keywords: ["climatisation", "clim", "chauffage", "température"],
      response: "❄️ Optimisation Climatisation - Conseils :\n\n🌡️ Régler à 24°C (au lieu de 22°C) → -15% consommation\n⏰ Programmer arrêt automatique la nuit\n🚪 Vérifier l'isolation des locaux\n🔧 Maintenance régulière des filtres\n\n💰 Économies potentielles : 680€/an\n🌱 Réduction CO2 : 1.5 tonnes/an"
    },
    "budget": {
      keywords: ["budget", "coût", "prix", "dépense"],
      response: "💰 Budget Énergie - Situation actuelle :\n\n📊 Dépense ce mois : 1,850€ / 2,000€ budget\n⚠️ Risque dépassement : 78%\n📉 Recommandation : Réduire consommation de 10%\n\n💡 Actions rapides :\n• Éteindre équipements la nuit\n• Optimiser climatisation\n• Sensibiliser les employés"
    },
    "capteurs": {
      keywords: ["capteur", "iot", "sensor", "mesure"],
      response: "🔌 État des Capteurs IoT :\n\n⚡ Électricité (SCT013) : 4 départements surveillés\n⚖️ Déchets (HX711) : 5 types de déchets mesurés\n🔥 Gaz : Suivi manuel par usage (Cuisine, Chauffage, Climatisation, Eau, Production)\n🚗 Transport : 6 véhicules tracés en temps réel (GPS)\n\nTypes de déchets :\n♻️ Recyclable : 3 capteurs actifs\n🍃 Organique : 3 capteurs actifs\n🗑️ Non-recyclable : 2 capteurs actifs\n💻 Électronique & ☢️ Dangereux : capteurs dédiés"
    },
    "département": {
      keywords: ["département", "production", "bureaux", "entrepôt", "cafétéria"],
      response: "📍 Consommation par département :\n\n🏭 Production : ~1728 kWh/mois (45%)\n🏢 Bureaux : ~864 kWh/mois (25%)\n📦 Entrepôt : ~691 kWh/mois (20%)\n☕ Cafétéria : ~345 kWh/mois (10%)\n\nLe département Production est le plus énergivore. Recommandation : Optimiser les horaires des machines lourdes."
    },
    "véhicule": {
      keywords: ["véhicule", "transport", "camion", "voiture", "moto"],
      response: "🚗 Flotte de véhicules :\n\n🚐 Camionnette : 1 véhicule (67 km, 6.7L)\n🚗 Voiture : 2 véhicules (68 km total, 6.8L)\n🚚 Camion : 1 véhicule (89 km, 8.9L)\n🚙 Utilitaire : 1 véhicule (23 km, 2.3L)\n🏍️ Moto : 1 véhicule (32 km, 1.6L)\n\nTotal flotte : 279 km, 26.3L carburant, ~62 kg CO2 aujourd'hui"
    },
    "gaz": {
      keywords: ["gaz", "butane", "réfrigérant", "cuisine", "chauffage"],
      response: "🔥 Gestion du gaz par usage :\n\n🍳 Cuisine : Butane (consommation bouteilles)\n🌡️ Chauffage : Butane\n❄️ Climatisation : Gaz Réfrigérant (en kg)\n💧 Eau Chaude : Butane\n🏭 Production : Butane\n\nEmissions : Butane ~3kg CO2/bouteille, Réfrigérant ~2kg CO2/kg"
    },
    "déchet": {
      keywords: ["déchet", "recyclage", "poubelle", "organique"],
      response: "♻️ Types de déchets surveillés :\n\n♻️ Recyclable : 42% (meilleur taux!)\n🍃 Organique : 35%\n🗑️ Non-recyclable : 23%\n💻 Électronique : Capteurs dédiés\n☢️ Dangereux : Traitement spécial\n\nObjectif : Atteindre 60% de recyclage d'ici 3 mois"
    },
    "merci": {
      keywords: ["merci", "thanks", "super", "parfait", "excellent"],
      response: "Avec plaisir ! N'hésitez pas si vous avez d'autres questions. Je suis là pour vous aider à optimiser votre performance environnementale ! 😊"
    },
    "aide": {
      keywords: ["aide", "help", "?", "comment"],
      response: "Je peux vous aider sur les sujets suivants :\n\n💡 Économies d'énergie\n🌍 Empreinte carbone\n📊 Bilans et statistiques\n🎯 Recommandations d'actions\n📋 Réglementations\n🔌 État des capteurs\n💰 Budget et ROI\n\nPosez-moi simplement votre question !"
    },
    "default": {
      keywords: [],
      response: "Je ne suis pas sûr de comprendre votre question. Voici ce que je peux faire pour vous :\n\n• Analyser votre consommation énergétique\n• Calculer votre empreinte carbone\n• Suggérer des actions d'optimisation\n• Vous informer sur les réglementations\n\nPouvez-vous reformuler votre question ?"
    }
  };

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

  // Initialize chatbot with pre-loaded messages
  useEffect(() => {
    const initialMessages = [
      {
        sender: 'user',
        text: 'Quel département consomme le plus d\'électricité ?',
        time: '10:30'
      },
      {
        sender: 'ai',
        text: 'Voici la répartition de consommation électrique par département :\n\n🏭 Production : 45% (département le plus énergivore)\n🏢 Bureaux : 25%\n📦 Entrepôt : 20%\n☕ Cafétéria : 10%\n\nRecommandation : Optimiser les horaires des machines en Production pourrait réduire jusqu\'à 15% votre facture !',
        time: '10:30'
      },
      {
        sender: 'user',
        text: 'Et pour les déchets, quel type produit-on le plus ?',
        time: '10:32'
      },
      {
        sender: 'ai',
        text: 'Répartition de vos déchets actuels :\n\n♻️ Recyclable : 42% (203 kg)\n🍃 Organique : 35% (185 kg)\n🗑️ Non-recyclable : 23% (138 kg)\n💻 Électronique : capteurs actifs\n☢️ Dangereux : traitement spécial\n\nBonne nouvelle : Votre taux de recyclage de 42% est au-dessus de la moyenne ! Objectif : atteindre 60% d\'ici 3 mois.',
        time: '10:32'
      }
    ];
    setChatMessages(initialMessages);
  }, []);

  // Initialize prediction charts when predictions tab is shown and predictions are generated
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

  // Scroll chat to bottom when messages change
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  // Switch AI sub-tab
  const switchAITab = (tabName) => {
    setActiveSubTab(tabName);
  };

  // Get AI response based on message
  const getAIResponse = (message) => {
    const lowerMessage = message.toLowerCase();

    for (const [key, data] of Object.entries(aiKnowledgeBase)) {
      if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
        return data.response;
      }
    }

    return aiKnowledgeBase.default.response;
  };

  // Send chat message
  const sendChatMessage = () => {
    const message = chatInput.trim();
    if (!message) return;

    // Get current time
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    // Add user message
    setChatMessages(prev => [...prev, { sender: 'user', text: message, time }]);

    // Clear input
    setChatInput('');

    // Show typing indicator
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      setIsTyping(false);

      // Get and add AI response
      const response = getAIResponse(message);
      const responseTime = new Date();
      const responseTimeStr = responseTime.getHours().toString().padStart(2, '0') + ':' + responseTime.getMinutes().toString().padStart(2, '0');
      setChatMessages(prev => [...prev, { sender: 'ai', text: response, time: responseTimeStr }]);
    }, 1000 + Math.random() * 1000);
  };

  // Handle Enter key in chat input
  const handleChatEnter = (event) => {
    if (event.key === 'Enter') {
      sendChatMessage();
    }
  };

  // Quick action button click
  const quickAction = (question) => {
    setChatInput(question);
    setTimeout(() => sendChatMessage(), 100);
  };

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
                  animation: 'fadeInUp 0.3s ease'
                }}>
                  <div className="message-avatar" style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: msg.sender === 'user'
                      ? `linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)`
                      : `var(--accent-color)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    flexShrink: 0
                  }}>
                    <i className={msg.sender === 'user' ? 'fas fa-user' : 'fas fa-robot'} />
                  </div>
                  <div style={{ flex: 1, maxWidth: '70%' }}>
                    <div className="message-bubble" style={{
                      padding: '12px 16px',
                      borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: msg.sender === 'user'
                        ? `linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)`
                        : 'rgba(255, 255, 255, 0.08)',
                      whiteSpace: 'pre-line',
                      lineHeight: '1.6',
                      fontSize: '14px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                    }}>
                      {msg.text}
                    </div>
                    <div className="message-time" style={{
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
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
          {/* Electricity Prediction */}
          <div className="prediction-card" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(254, 202, 87, 0.2)',
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
