export const aiKnowledgeBase = {
    "bonjour": {
      keywords: ["bonjour", "salut", "hello", "hi", "salam"],
      response: "Bonjour ! Je suis l'assistant GreenTech. Je suis connecté à vos données en temps réel. Comment puis-je vous aider ?"
    },
    "économiser": {
      keywords: ["économiser", "économie", "réduire", "baisser", "diminuer"],
      response: "Voici 3 actions pour réduire vos coûts :\n1️⃣ Éteindre les équipements en veille (-8%)\n2️⃣ Installer des LED (-60% éclairage)\n3️⃣ Régler la clim à 24°C (-15%)"
    },
    "suggestions": {
      keywords: ["suggestions", "actions", "recommandations", "conseils", "faire quoi"],
      response: "Mes recommandations basées sur vos données :\n⭐ Installer des LED (ROI 18 mois)\n⭐ Panneaux solaires (Rentable sur 5 ans)\n⭐ Optimiser les tournées de transport."
    },
    "réglementations": {
      keywords: ["réglementation", "loi", "normes", "iso"],
      response: "📋 Vous êtes soumis à la norme ISO 14001 et à la réglementation RE2020. Votre reporting carbone est à jour ✅."
    },
    "capteurs": {
      keywords: ["capteur", "iot", "sensor", "état", "marche"],
      response: "🔌 État système :\n✅ Électricité (SCT013) : OK\n✅ Gaz & Eau : OK\n✅ Déchets (HX711) : OK\n🚀 Tous les capteurs envoient des données."
    },
    "solaire": {
      keywords: ["solaire", "panneaux", "photovoltaïque", "soleil"],
      response: "☀️ Le solaire est idéal pour votre usine. Avec 25,000 MAD d'investissement, vous économisez ~5,200 MAD/an."
    },
    "merci": {
        keywords: ["merci", "top", "thanks", "chokran"],
        response: "Avec plaisir ! Je suis là pour ça. 🤖"
    },
    "default": {
      keywords: [],
      response: "Je ne suis pas sûr de comprendre. Essayez : 'Ma consommation', 'Mon budget', ou 'Conseils'."
    }
};
  
export const getSmartResponse = (message, realStats) => {
    const lowerMessage = message.toLowerCase();
  
    if (realStats) {
        if (lowerMessage.includes('consom') || lowerMessage.includes('énergie') || lowerMessage.includes('électricité')) {
            const icon = realStats.energyTrend.includes('-') ? '📉' : '📈';
            return `⚡ **Consommation Actuelle** :\n` +
                   `Ce mois-ci : **${realStats.currentMonthEnergy.toLocaleString()} kWh**\n` +
                   `Comparaison : **${realStats.energyTrend}** ${icon} vs mois dernier.`;
        }
        
        if (lowerMessage.includes('coût') || lowerMessage.includes('budget') || lowerMessage.includes('prix') || lowerMessage.includes('argent')) {
            return `💰 **Estimation Coûts** :\n` +
                   `Facture estimée : **${realStats.estimatedCost.toLocaleString()} MAD**\n` +
                   `Basé sur une consommation de ${realStats.currentMonthEnergy.toFixed(0)} kWh.`;
        }

        if (lowerMessage.includes('co2') || lowerMessage.includes('recycl') || lowerMessage.includes('carbone') || lowerMessage.includes('empreinte')) {
            const emoji = realStats.recyclingRate > 40 ? '✅' : '⚠️';
            return `🌍 **Impact Environnemental** :\n` +
                   `• Émissions CO2 : **${realStats.totalCo2.toFixed(1)} kg**\n` +
                   `• Taux de Recyclage : **${realStats.recyclingRate.toFixed(1)}%** ${emoji}`;
        }
    }
  
    for (const [key, data] of Object.entries(aiKnowledgeBase)) {
      if (data.keywords && data.keywords.some(keyword => lowerMessage.includes(keyword))) {
        return data.response;
      }
    }
  
    return aiKnowledgeBase.default.response;
};