import React, { useState, useEffect } from 'react';
import './styles.css';

import { LoadingProvider, useLoading } from './contexts/LoadingContext';
import { EmployeeProvider } from './contexts/EmployeeContext';
import { PendingActionsProvider } from './contexts/PendingActionsContext';
import { AIProvider } from './contexts/AIContext';

import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';
import EmployeeNavigation from './components/layout/EmployeeNavigation';
import LoadingNotification from './components/ui/LoadingNotification'; // Import l-component l-jdid


import Dashboard from './pages/Dashboard';
import IoT from './pages/IoT';
import AI from './pages/AI';
import Reports from './pages/Reports';
import Gamification from './pages/Gamification/Gamification';
import EmployeeDashboard from './pages/EmployeeDashboard/EmployeeDashboard';
import EmployeeActions from './pages/EmployeeActions/EmployeeActions';
import EmployeeRewards from './pages/EmployeeRewards/EmployeeRewards';
import Login from './pages/Login/Login';

function AppContent() {
  const [employeeTab, setEmployeeTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('adminActiveTab') || 'dashboard';
  });
  const {
    isGeneratingPredictions, predictionProgress, predictionStep,
    isGeneratingRecommendations, recommendationProgress, recommendationStep,
    isGeneratingCarbon, carbonProgress, carbonStep,
    isGeneratingExport, exportProgress, exportStep,
    isGeneratingComparison, comparisonProgress, comparisonStep,
    isProcessingPurchase, purchaseProgress, purchaseStep, purchaseProductName
  } = useLoading();

useEffect(() => {
    if (userRole === 'admin') {
      localStorage.setItem('adminActiveTab', activeTab);
    }
  }, [activeTab, userRole]);
  useEffect(() => {
    if (userRole === 'user') {
      localStorage.setItem('employeeTab', employeeTab);
    }
  }, [employeeTab, userRole]);
  // Authentication Logic
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    const savedRole = localStorage.getItem('userRole');
    if (authStatus === 'true' && savedRole) {
      setIsAuthenticated(true);
      setUserRole(savedRole);
    }
  }, []);

  const handleLogin = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', role);
  };

 
const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    
    localStorage.removeItem('adminActiveTab');
    localStorage.removeItem('employeeTab');
    
    setActiveTab('dashboard');
    setEmployeeTab('dashboard');
  };
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }


  const loaders = [
    {
      active: isGeneratingPredictions,
      props: { title: "Génération des Prédictions", progress: predictionProgress, step: predictionStep, icon: "fa-chart-line", color: "var(--accent-color)" }
    },
    {
      active: isGeneratingRecommendations,
      props: { title: "Génération des Recommandations", progress: recommendationProgress, step: recommendationStep, icon: "fa-lightbulb", color: "var(--secondary-color)" }
    },
    {
      active: isGeneratingCarbon,
      props: { title: "Génération Empreinte Carbone", progress: carbonProgress, step: carbonStep, icon: "fa-smog", color: "var(--accent-color)" }
    },
    {
      active: isGeneratingExport,
      props: { title: "Génération Export & Historique", progress: exportProgress, step: exportStep, icon: "fa-download", color: "var(--accent-color)" }
    },
    {
      active: isGeneratingComparison,
      props: { title: "Génération Comparaison Mensuelle", progress: comparisonProgress, step: comparisonStep, icon: "fa-exchange-alt", color: "var(--accent-color)" }
    },
    {
      active: isProcessingPurchase,
      props: { title: purchaseProductName || "Traitement Achat", progress: purchaseProgress, step: purchaseStep, icon: "fa-shopping-cart", color: "var(--accent-color)" }
    }
  ];

  // Calculer l'index visible pour chaque loader actif (pour le stacking vertical)
  let visibleIndex = 0;

  return (
    <>
      <div className="animated-bg"></div>

      {/* Rendering optimisé des Loading Bars */}
      {loaders.map((loader, i) => {
        if (!loader.active) return null;
        const component = (
          <LoadingNotification
            key={i}
            isVisible={true}
            index={visibleIndex}
            {...loader.props}
          />
        );
        visibleIndex++; // Incrémenter seulement si le loader est visible
        return component;
      })}

      <Header onLogout={handleLogout} />

      {/* ADMIN VIEW */}
      {userRole === 'admin' && (
        <PendingActionsProvider>
          <EmployeeProvider>
            <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="container">
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'iot' && <IoT />}
              {activeTab === 'ai' && <AI />}
              {activeTab === 'reports' && <Reports />}
              {activeTab === 'gamification' && <Gamification />}
            </div>
          </EmployeeProvider>
        </PendingActionsProvider>
      )}

      {/* USER VIEW */}
      {userRole === 'user' && (
        <EmployeeProvider>
          <PendingActionsProvider>
            <EmployeeNavigation activeTab={employeeTab} setActiveTab={setEmployeeTab} />
            <div className="container">
              {employeeTab === 'dashboard' && <EmployeeDashboard />}
              {employeeTab === 'actions' && <EmployeeActions />}
              {employeeTab === 'rewards' && <EmployeeRewards />}
            </div>
          </PendingActionsProvider>
        </EmployeeProvider>
      )}

      <Footer />
    </>
  );
}


function App() {
  return (
    <LoadingProvider>
      <AIProvider>
        <AppContent />
      </AIProvider>
    </LoadingProvider>
  );
}

export default App;