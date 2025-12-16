import axios from 'axios';
import { useLoading } from '../contexts/LoadingContext';
import { useAI } from '../contexts/AIContext'; // <--- Import du nouveau contexte
import { showNotification } from '../utils/notifications';

const useAIRecommendations = () => {
    // On récupère le state global au lieu du state local
    const { 
        recommendations, 
        setRecommendations, 
        isRecommendationsGenerated, 
        setIsRecommendationsGenerated 
    } = useAI();
    
    const { 
        setIsGeneratingRecommendations,
        setRecommendationProgress,
        setRecommendationStep
    } = useLoading();

    const generateRecommendations = async () => {
        // Si on a déjà des données, on peut éviter de rappeler l'API (Optionnel)
        // if (isRecommendationsGenerated) return; 

        setIsGeneratingRecommendations(true);
        setRecommendationProgress(10);
        setRecommendationStep("Analyse des flux énergétiques...");

        try {
            // Simulation UX
            setTimeout(() => { setRecommendationProgress(40); setRecommendationStep("Identification des gaspillages..."); }, 1000);
            setTimeout(() => { setRecommendationProgress(70); setRecommendationStep("Calcul des ROI et impact carbone..."); }, 2500);

            const response = await axios.get('http://localhost:8080/api/ai/recommendations');
            
            setRecommendationProgress(100);
            setRecommendationStep("Finalisation...");
            
            // Mise à jour du State GLOBAL
            setRecommendations(response.data.actions); 
            setIsRecommendationsGenerated(true);
            
            showNotification('Plan d\'action généré avec succès !', 'success');

        } catch (error) {
            console.error("Erreur recommandations:", error);
            showNotification("Impossible de générer les recommandations", "error");
        } finally {
            setIsGeneratingRecommendations(false);
        }
    };

    return { recommendations, isRecommendationsGenerated, generateRecommendations };
};

export default useAIRecommendations;