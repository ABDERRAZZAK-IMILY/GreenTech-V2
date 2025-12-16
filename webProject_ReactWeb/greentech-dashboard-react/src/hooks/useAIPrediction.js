import { useState } from 'react';
import { useLoading } from '../contexts/LoadingContext';
import { showNotification } from '../utils/notifications';
import { getAIPredictions } from '../services/AI/aiService'; 
import { useAI } from '../contexts/AIContext'; 
const useAIPrediction = () => {
  const { chatMessages, setChatMessages } = useAI();
  const { 
        predictionData, 
        setPredictionData, 
        isPredictionsGenerated, 
        setIsPredictionsGenerated 
    } = useAI();

    const { 
        setIsGeneratingPredictions,
        setPredictionProgress,
        setPredictionStep
    } = useLoading();
  const generatePredictions = async () => {
    setIsGeneratingPredictions(true);
    setPredictionProgress(0);

    const steps = [
      { progress: 10, message: 'Connexion au serveur IA...', duration: 500 },
      { progress: 30, message: 'Analyse des données énergétiques...', duration: 800 },
      { progress: 60, message: 'Calcul des prévisions DeepSeek...', duration: 1000 },
      { progress: 80, message: 'Formatage des résultats...', duration: 500 },
    ];

    let currentStep = 0;

    const executeAnimation = async () => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        setPredictionProgress(step.progress);
        setPredictionStep(step.message);

        if (currentStep === 2) {
          try {
            const data = await getAIPredictions();
            setPredictionData(data);
           
          } catch (error) {
            console.error(error);
            showNotification("Impossible de récupérer les prédictions", "error");
            setIsGeneratingPredictions(false);
            return; // Arrêt si erreur
          }
        }

        setTimeout(() => {
          currentStep++;
          executeAnimation();
        }, step.duration);
      } else {
        // Fin de l'animation
        setPredictionProgress(100);
        setPredictionStep('Terminé !');

        setTimeout(() => {
          setIsGeneratingPredictions(false);
          setIsPredictionsGenerated(true);
          showNotification('Prédictions générées avec succès!', 'success');
        }, 500);
      }
    };

    executeAnimation();
  };

  return {
    predictionData,
    isPredictionsGenerated, 
    generatePredictions
  };
};

export default useAIPrediction;