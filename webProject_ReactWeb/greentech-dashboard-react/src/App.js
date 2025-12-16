import React, { useState } from 'react';
import './styles.css';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';
import Dashboard from './pages/Dashboard';
import IoT from './pages/IoT';
import AI from './pages/AI';
import Reports from './pages/Reports';
import Gamification from './pages/Gamification/Gamification';
import EmployeeDashboard from './pages/EmployeeDashboard/EmployeeDashboard';
import EmployeeActions from './pages/EmployeeActions/EmployeeActions';
import EmployeeRewards from './pages/EmployeeRewards/EmployeeRewards';
import EmployeeNavigation from './components/layout/EmployeeNavigation';
import Login from './pages/Login/Login';
import { LoadingProvider, useLoading } from './contexts/LoadingContext';
import { EmployeeProvider } from './contexts/EmployeeContext';
import { PendingActionsProvider } from './contexts/PendingActionsContext';
import { AIProvider } from './contexts/AIContext';// Tu l'as déjà sûrement
function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [employeeTab, setEmployeeTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'admin' or 'user'

  // All hooks must be called before any conditional returns
  const {
    isGeneratingPredictions,
    predictionProgress,
    predictionStep,
    isGeneratingRecommendations,
    recommendationProgress,
    recommendationStep,
    isGeneratingCarbon,
    carbonProgress,
    carbonStep,
    isGeneratingExport,
    exportProgress,
    exportStep,
    isGeneratingComparison,
    comparisonProgress,
    comparisonStep,
    isProcessingPurchase,
    purchaseProgress,
    purchaseStep,
    purchaseProductName
  } = useLoading();

  // Handle successful login
  const handleLogin = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', role);
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
  };

  // Check if user is already authenticated on component mount
  React.useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    const savedRole = localStorage.getItem('userRole');
    if (authStatus === 'true' && savedRole) {
      setIsAuthenticated(true);
      setUserRole(savedRole);
    }
  }, []);

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Calculate stacked positions for loading bars
  const getLoadingBarTop = (index) => {
    return 20 + (index * 160); // 160px spacing between bars
  };

  return (
    <>
      <div className="animated-bg"></div>

      {/* Global Loading Bars - Always visible across all pages */}
      {isGeneratingPredictions && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, rgba(30, 39, 46, 0.98) 0%, rgba(45, 52, 54, 0.98) 100%)',
          padding: '20px',
          borderRadius: '16px',
          border: '2px solid var(--accent-color)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          minWidth: '350px',
          maxWidth: '400px',
          zIndex: 10000,
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <h4 style={{
              margin: '0',
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-chart-line" style={{ color: 'var(--accent-color)' }} />
              Génération des Prédictions
            </h4>
            <span style={{
              fontSize: '18px',
              fontWeight: '700',
              color: 'var(--accent-color)'
            }}>
              {predictionProgress}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '12px'
          }}>
            <div style={{
              width: `${predictionProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--primary-color), var(--accent-color))',
              borderRadius: '10px',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <p style={{
            margin: '0',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <i className="fas fa-spinner fa-spin" style={{ color: 'var(--accent-color)' }} />
            {predictionStep}
          </p>
        </div>
      )}

      {isGeneratingRecommendations && (
        <div style={{
          position: 'fixed',
          top: `${getLoadingBarTop([isGeneratingPredictions].filter(Boolean).length)}px`,
          right: '20px',
          background: 'linear-gradient(135deg, rgba(30, 39, 46, 0.98) 0%, rgba(45, 52, 54, 0.98) 100%)',
          padding: '20px',
          borderRadius: '16px',
          border: '2px solid var(--secondary-color)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          minWidth: '350px',
          maxWidth: '400px',
          zIndex: 10000,
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <h4 style={{
              margin: '0',
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-lightbulb" style={{ color: 'var(--secondary-color)' }} />
              Génération des Recommandations
            </h4>
            <span style={{
              fontSize: '18px',
              fontWeight: '700',
              color: 'var(--secondary-color)'
            }}>
              {recommendationProgress}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '12px'
          }}>
            <div style={{
              width: `${recommendationProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))',
              borderRadius: '10px',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <p style={{
            margin: '0',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <i className="fas fa-spinner fa-spin" style={{ color: 'var(--secondary-color)' }} />
            {recommendationStep}
          </p>
        </div>
      )}

      {/* Carbon Report Loading Bar */}
      {isGeneratingCarbon && (
        <div style={{
          position: 'fixed',
          top: `${getLoadingBarTop([isGeneratingPredictions, isGeneratingRecommendations].filter(Boolean).length)}px`,
          right: '20px',
          background: 'linear-gradient(135deg, rgba(30, 39, 46, 0.98) 0%, rgba(45, 52, 54, 0.98) 100%)',
          padding: '20px',
          borderRadius: '16px',
          border: '2px solid var(--accent-color)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          minWidth: '350px',
          maxWidth: '400px',
          zIndex: 10000,
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <h4 style={{
              margin: '0',
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-smog" style={{ color: 'var(--accent-color)' }} />
              Génération Empreinte Carbone
            </h4>
            <span style={{
              fontSize: '18px',
              fontWeight: '700',
              color: 'var(--accent-color)'
            }}>
              {carbonProgress}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '12px'
          }}>
            <div style={{
              width: `${carbonProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--primary-color), var(--accent-color))',
              borderRadius: '10px',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <p style={{
            margin: '0',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <i className="fas fa-spinner fa-spin" style={{ color: 'var(--accent-color)' }} />
            {carbonStep}
          </p>
        </div>
      )}

      {/* Export/History Report Loading Bar */}
      {isGeneratingExport && (
        <div style={{
          position: 'fixed',
          top: `${getLoadingBarTop([isGeneratingPredictions, isGeneratingRecommendations, isGeneratingCarbon].filter(Boolean).length)}px`,
          right: '20px',
          background: 'linear-gradient(135deg, rgba(30, 39, 46, 0.98) 0%, rgba(45, 52, 54, 0.98) 100%)',
          padding: '20px',
          borderRadius: '16px',
          border: '2px solid var(--accent-color)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          minWidth: '350px',
          maxWidth: '400px',
          zIndex: 10000,
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <h4 style={{
              margin: '0',
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-download" style={{ color: 'var(--accent-color)' }} />
              Génération Export & Historique
            </h4>
            <span style={{
              fontSize: '18px',
              fontWeight: '700',
              color: 'var(--accent-color)'
            }}>
              {exportProgress}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '12px'
          }}>
            <div style={{
              width: `${exportProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--primary-color), var(--accent-color))',
              borderRadius: '10px',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <p style={{
            margin: '0',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <i className="fas fa-spinner fa-spin" style={{ color: 'var(--accent-color)' }} />
            {exportStep}
          </p>
        </div>
      )}

      {/* Comparison Report Loading Bar */}
      {isGeneratingComparison && (
        <div style={{
          position: 'fixed',
          top: `${getLoadingBarTop([isGeneratingPredictions, isGeneratingRecommendations, isGeneratingCarbon, isGeneratingExport].filter(Boolean).length)}px`,
          right: '20px',
          background: 'linear-gradient(135deg, rgba(30, 39, 46, 0.98) 0%, rgba(45, 52, 54, 0.98) 100%)',
          padding: '20px',
          borderRadius: '16px',
          border: '2px solid var(--accent-color)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          minWidth: '350px',
          maxWidth: '400px',
          zIndex: 10000,
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <h4 style={{
              margin: '0',
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-exchange-alt" style={{ color: 'var(--accent-color)' }} />
              Génération Comparaison Mensuelle
            </h4>
            <span style={{
              fontSize: '18px',
              fontWeight: '700',
              color: 'var(--accent-color)'
            }}>
              {comparisonProgress}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '12px'
          }}>
            <div style={{
              width: `${comparisonProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--primary-color), var(--accent-color))',
              borderRadius: '10px',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <p style={{
            margin: '0',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <i className="fas fa-spinner fa-spin" style={{ color: 'var(--accent-color)' }} />
            {comparisonStep}
          </p>
        </div>
      )}

      {/* Purchase Request Loading Bar */}
      {isProcessingPurchase && (
        <div style={{
          position: 'fixed',
          top: `${getLoadingBarTop([isGeneratingPredictions, isGeneratingRecommendations, isGeneratingCarbon, isGeneratingExport, isGeneratingComparison].filter(Boolean).length)}px`,
          right: '20px',
          background: 'linear-gradient(135deg, rgba(30, 39, 46, 0.98) 0%, rgba(45, 52, 54, 0.98) 100%)',
          padding: '20px',
          borderRadius: '16px',
          border: '2px solid var(--accent-color)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          minWidth: '350px',
          maxWidth: '400px',
          zIndex: 10000,
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <h4 style={{
              margin: '0',
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-shopping-cart" style={{ color: 'var(--accent-color)' }} />
              {purchaseProductName}
            </h4>
            <span style={{
              fontSize: '18px',
              fontWeight: '700',
              color: 'var(--accent-color)'
            }}>
              {purchaseProgress}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '12px'
          }}>
            <div style={{
              width: `${purchaseProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--primary-color), var(--accent-color))',
              borderRadius: '10px',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <p style={{
            margin: '0',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <i className="fas fa-spinner fa-spin" style={{ color: 'var(--accent-color)' }} />
            {purchaseStep}
          </p>
        </div>
      )}

      <Header onLogout={handleLogout} />
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
