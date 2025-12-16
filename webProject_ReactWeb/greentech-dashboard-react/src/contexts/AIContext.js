import React, { createContext, useContext, useState } from 'react';

const AIContext = createContext();

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error("useAI must be used within an AIProvider");
  }
  return context;
};

export const AIProvider = ({ children }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [isRecommendationsGenerated, setIsRecommendationsGenerated] = useState(false);

  const [predictionData, setPredictionData] = useState(null);
  const [isPredictionsGenerated, setIsPredictionsGenerated] = useState(false);

   const [chatMessages, setChatMessages] = useState([
    {
        sender: 'ai',
        text: "Bonjour ! 👋 Je suis l'assistant intelligent **GreenTech**.\n\nJe suis là pour optimiser votre performance énergétique. Je peux :\n\n- 📊 **Analyser** vos consommations (Électricité, Gaz, Transport)\n- 🔮 **Prédire** vos futures factures et émissions CO₂\n- 💡 **Proposer** des solutions pour réduire les coûts\n- ⚠️ **Détecter** les anomalies en temps réel\n\n**Posez-moi une question ou choisissez une action ci-dessous !** 👇",
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }
]);

  const value = {
    
    recommendations, setRecommendations,
    isRecommendationsGenerated, setIsRecommendationsGenerated,

  
    predictionData, setPredictionData,
    isPredictionsGenerated, setIsPredictionsGenerated,

   
    chatMessages, setChatMessages
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};