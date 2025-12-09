import React, { createContext, useState, useContext } from 'react';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  // Predictions loading state
  const [isGeneratingPredictions, setIsGeneratingPredictions] = useState(false);
  const [predictionProgress, setPredictionProgress] = useState(0);
  const [predictionStep, setPredictionStep] = useState('');
  const [isPredictionsGenerated, setIsPredictionsGenerated] = useState(false);

  // Recommendations loading state
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [recommendationProgress, setRecommendationProgress] = useState(0);
  const [recommendationStep, setRecommendationStep] = useState('');
  const [isRecommendationsGenerated, setIsRecommendationsGenerated] = useState(false);

  // Carbon Report loading state
  const [isGeneratingCarbon, setIsGeneratingCarbon] = useState(false);
  const [carbonProgress, setCarbonProgress] = useState(0);
  const [carbonStep, setCarbonStep] = useState('');
  const [isCarbonGenerated, setIsCarbonGenerated] = useState(false);

  // Export/History Report loading state
  const [isGeneratingExport, setIsGeneratingExport] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStep, setExportStep] = useState('');
  const [isExportGenerated, setIsExportGenerated] = useState(false);

  // Comparison Report loading state
  const [isGeneratingComparison, setIsGeneratingComparison] = useState(false);
  const [comparisonProgress, setComparisonProgress] = useState(0);
  const [comparisonStep, setComparisonStep] = useState('');
  const [isComparisonGenerated, setIsComparisonGenerated] = useState(false);

  // Purchase Request loading state
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);
  const [purchaseProgress, setPurchaseProgress] = useState(0);
  const [purchaseStep, setPurchaseStep] = useState('');
  const [purchaseProductName, setPurchaseProductName] = useState('');

  const value = {
    isGeneratingPredictions,
    setIsGeneratingPredictions,
    predictionProgress,
    setPredictionProgress,
    predictionStep,
    setPredictionStep,
    isPredictionsGenerated,
    setIsPredictionsGenerated,
    isGeneratingRecommendations,
    setIsGeneratingRecommendations,
    recommendationProgress,
    setRecommendationProgress,
    recommendationStep,
    setRecommendationStep,
    isRecommendationsGenerated,
    setIsRecommendationsGenerated,
    isGeneratingCarbon,
    setIsGeneratingCarbon,
    carbonProgress,
    setCarbonProgress,
    carbonStep,
    setCarbonStep,
    isCarbonGenerated,
    setIsCarbonGenerated,
    isGeneratingExport,
    setIsGeneratingExport,
    exportProgress,
    setExportProgress,
    exportStep,
    setExportStep,
    isExportGenerated,
    setIsExportGenerated,
    isGeneratingComparison,
    setIsGeneratingComparison,
    comparisonProgress,
    setComparisonProgress,
    comparisonStep,
    setComparisonStep,
    isComparisonGenerated,
    setIsComparisonGenerated,
    isProcessingPurchase,
    setIsProcessingPurchase,
    purchaseProgress,
    setPurchaseProgress,
    purchaseStep,
    setPurchaseStep,
    purchaseProductName,
    setPurchaseProductName
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};
