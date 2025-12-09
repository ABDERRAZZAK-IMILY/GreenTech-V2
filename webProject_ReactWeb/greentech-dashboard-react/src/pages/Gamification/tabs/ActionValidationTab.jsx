import React, { useState } from 'react';
import { usePendingActions } from '../../../contexts/PendingActionsContext';
import { useEmployee } from '../../../contexts/EmployeeContext';
import { useLoading } from '../../../contexts/LoadingContext';
import './ActionValidationTab.css';

const ActionValidationTab = () => {
  const { pendingActions, approveAction, rejectAction } = usePendingActions();
  const { addEcoCoins } = useEmployee();
  const {
    setIsProcessingPurchase,
    setPurchaseProgress,
    setPurchaseStep,
    setPurchaseProductName
  } = useLoading();

  const [selectedProof, setSelectedProof] = useState(null);
  const [showProofModal, setShowProofModal] = useState(false);

  // Main sub-tab state (historique, validation, creation)
  const [activeSubTab, setActiveSubTab] = useState('validation');

  // Nested filter for validation tab (pending, approved, rejected)
  const [validationFilter, setValidationFilter] = useState('pending');

  const filteredActions = activeSubTab === 'historique'
    ? pendingActions
    : pendingActions.filter(action => action.status === validationFilter);

  // Available action types for creation tab
  const [availableActions, setAvailableActions] = useState([
    { id: 1, name: 'Éteindre ordinateur en pause', points: 15, category: 'Énergie', active: true, description: 'Éteindre son ordinateur pendant les pauses' },
    { id: 2, name: 'Apporter sa tasse/mug personnel', points: 10, category: 'Déchet', active: true, description: 'Utiliser sa propre tasse au lieu de gobelets jetables' },
    { id: 3, name: 'Utiliser un pass transport en commun', points: 20, category: 'Transport', active: true, description: 'Prendre les transports en commun pour venir au travail' },
    { id: 4, name: 'Marcher pour venir au travail', points: 25, category: 'Transport', active: true, description: 'Venir au travail à pied' },
    { id: 5, name: 'Utiliser une trottinette électrique', points: 20, category: 'Transport', active: true, description: 'Utiliser une trottinette électrique pour le trajet' },
    { id: 6, name: 'Déjeuner avec lunch box réutilisable', points: 15, category: 'Déchet', active: true, description: 'Apporter son repas dans un contenant réutilisable' },
    { id: 7, name: 'Participer à une action de nettoyage', points: 50, category: 'Collectif', active: true, description: 'Participer à une action collective de nettoyage' },
    { id: 8, name: 'Installer une plante au bureau', points: 30, category: 'Bureau', active: true, description: 'Installer une plante verte sur son bureau' }
  ]);

  // Action form modal states
  const [showActionFormModal, setShowActionFormModal] = useState(false);
  const [editingAction, setEditingAction] = useState(null);
  const [actionForm, setActionForm] = useState({
    name: '',
    description: '',
    category: 'Transport',
    points: 0
  });

  // Calculate statistics
  const totalActions = pendingActions.length;
  const pendingCount = pendingActions.filter(a => a.status === 'pending').length;
  const approvedCount = pendingActions.filter(a => a.status === 'approved').length;
  const rejectedCount = pendingActions.filter(a => a.status === 'rejected').length;
  const totalPointsAwarded = pendingActions
    .filter(a => a.status === 'approved')
    .reduce((sum, a) => sum + a.points, 0);

  // Most active employee
  const employeeStats = {};
  pendingActions.forEach(action => {
    if (!employeeStats[action.employeeName]) {
      employeeStats[action.employeeName] = { count: 0, points: 0 };
    }
    employeeStats[action.employeeName].count++;
    if (action.status === 'approved') {
      employeeStats[action.employeeName].points += action.points;
    }
  });

  const topEmployee = Object.entries(employeeStats).sort((a, b) => b[1].count - a[1].count)[0];
  const mostActiveEmployee = topEmployee ? { name: topEmployee[0], ...topEmployee[1] } : { name: 'N/A', count: 0 };

  const handleApprove = async (action) => {
    // Show processing notification
    setPurchaseProductName(`Validation: ${action.actionName}`);
    setIsProcessingPurchase(true);
    setPurchaseProgress(0);
    setPurchaseStep('Validation de l\'action...');

    // Simulate processing
    for (let i = 0; i <= 50; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 80));
      setPurchaseProgress(i);
    }

    setPurchaseStep('Attribution des points...');

    // Approve and add coins
    approveAction(action.id);
    addEcoCoins(action.points);

    for (let i = 50; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 80));
      setPurchaseProgress(i);
    }

    setPurchaseStep(`✅ Action approuvée - ${action.points} points attribués`);

    setTimeout(() => {
      setIsProcessingPurchase(false);
      setPurchaseProgress(0);
      setPurchaseStep('');
      setPurchaseProductName('');
    }, 2000);
  };

  const handleReject = async (action) => {
    // Show processing notification
    setPurchaseProductName(`Validation: ${action.actionName}`);
    setIsProcessingPurchase(true);
    setPurchaseProgress(0);
    setPurchaseStep('Rejet de l\'action...');

    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 60));
      setPurchaseProgress(i);
    }

    rejectAction(action.id, "Preuve insuffisante ou action non conforme");

    setPurchaseStep('❌ Action rejetée');

    setTimeout(() => {
      setIsProcessingPurchase(false);
      setPurchaseProgress(0);
      setPurchaseStep('');
      setPurchaseProductName('');
    }, 2000);
  };

  const viewProof = (action) => {
    setSelectedProof(action);
    setShowProofModal(true);
  };

  // Open form for creating new action
  const handleCreateNewAction = () => {
    setEditingAction(null);
    setActionForm({
      name: '',
      description: '',
      category: 'Transport',
      points: 0
    });
    setShowActionFormModal(true);
  };

  // Open form for editing existing action
  const handleEditAction = (action) => {
    setEditingAction(action);
    setActionForm({
      name: action.name,
      description: action.description,
      category: action.category,
      points: action.points
    });
    setShowActionFormModal(true);
  };

  // Toggle action active/inactive status
  const handleToggleActionStatus = (actionId) => {
    setAvailableActions(prev => prev.map(action =>
      action.id === actionId ? { ...action, active: !action.active } : action
    ));
  };

  // Save action (create or update)
  const handleSaveAction = () => {
    if (!actionForm.name || !actionForm.description || actionForm.points <= 0) {
      alert('Veuillez remplir tous les champs correctement');
      return;
    }

    if (editingAction) {
      // Update existing action
      setAvailableActions(prev => prev.map(action =>
        action.id === editingAction.id
          ? { ...action, ...actionForm }
          : action
      ));
    } else {
      // Create new action
      const newAction = {
        id: Math.max(...availableActions.map(a => a.id), 0) + 1,
        ...actionForm,
        active: true
      };
      setAvailableActions(prev => [...prev, newAction]);
    }

    setShowActionFormModal(false);
    setEditingAction(null);
  };

  return (
    <div className="action-validation-tab">
      {/* KPI Statistics */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '25px',
        marginBottom: '30px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fas fa-chart-line"></i> Statistiques de Validation
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          {/* Total Actions */}
          <div className="stat-box" style={{
            background: 'rgba(102, 126, 234, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            border: '1px solid rgba(102, 126, 234, 0.3)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#667eea', marginBottom: '5px' }}>
              {totalActions}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Actions Soumises</div>
          </div>

          {/* Pending */}
          <div className="stat-box" style={{
            background: 'rgba(245, 158, 11, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b', marginBottom: '5px' }}>
              {pendingCount}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>En Attente de Validation</div>
          </div>

          {/* Approved */}
          <div className="stat-box" style={{
            background: 'rgba(67, 233, 123, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            border: '1px solid rgba(67, 233, 123, 0.3)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#43e97b', marginBottom: '5px' }}>
              {approvedCount}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Actions Approuvées</div>
          </div>

          {/* Rejected */}
          <div className="stat-box" style={{
            background: 'rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>❌</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#ef4444', marginBottom: '5px' }}>
              {rejectedCount}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Actions Rejetées</div>
          </div>

          {/* Total Points Awarded */}
          <div className="stat-box" style={{
            background: 'rgba(250, 177, 160, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            border: '1px solid rgba(250, 177, 160, 0.3)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#fab1a0', marginBottom: '5px' }}>
              {totalPointsAwarded.toLocaleString()}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Points Attribués</div>
          </div>

          {/* Most Active Employee */}
          <div className="stat-box" style={{
            background: 'rgba(254, 202, 87, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            border: '1px solid rgba(254, 202, 87, 0.3)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏆</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#feca57', marginBottom: '2px' }}>
              {mostActiveEmployee.name}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {mostActiveEmployee.count} actions soumises
            </div>
          </div>
        </div>
      </div>

      {/* Main Sub-Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '30px',
        borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '0'
      }}>
        <button
          onClick={() => setActiveSubTab('historique')}
          style={{
            flex: 1,
            padding: '14px 20px',
            background: activeSubTab === 'historique'
              ? 'linear-gradient(135deg, var(--primary-color), var(--accent-color))'
              : 'transparent',
            border: 'none',
            borderBottom: activeSubTab === 'historique'
              ? '3px solid var(--accent-color)'
              : '3px solid transparent',
            borderRadius: '12px 12px 0 0',
            color: activeSubTab === 'historique' ? 'white' : 'var(--text-secondary)',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: activeSubTab === 'historique'
              ? '0 4px 12px rgba(42, 157, 111, 0.4)'
              : 'none'
          }}
          onMouseEnter={(e) => {
            if (activeSubTab !== 'historique') {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeSubTab !== 'historique') {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }
          }}
        >
          <i className="fas fa-history"></i>
          Historique
        </button>

        <button
          onClick={() => setActiveSubTab('validation')}
          style={{
            flex: 1,
            padding: '14px 20px',
            background: activeSubTab === 'validation'
              ? 'linear-gradient(135deg, var(--primary-color), var(--accent-color))'
              : 'transparent',
            border: 'none',
            borderBottom: activeSubTab === 'validation'
              ? '3px solid var(--accent-color)'
              : '3px solid transparent',
            borderRadius: '12px 12px 0 0',
            color: activeSubTab === 'validation' ? 'white' : 'var(--text-secondary)',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            position: 'relative',
            boxShadow: activeSubTab === 'validation'
              ? '0 4px 12px rgba(42, 157, 111, 0.4)'
              : 'none'
          }}
          onMouseEnter={(e) => {
            if (activeSubTab !== 'validation') {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeSubTab !== 'validation') {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }
          }}
        >
          <i className="fas fa-check-double"></i>
          Validation
          {pendingCount > 0 && (
            <span style={{
              background: '#f59e0b',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '700'
            }}>
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('creation')}
          style={{
            flex: 1,
            padding: '14px 20px',
            background: activeSubTab === 'creation'
              ? 'linear-gradient(135deg, var(--primary-color), var(--accent-color))'
              : 'transparent',
            border: 'none',
            borderBottom: activeSubTab === 'creation'
              ? '3px solid var(--accent-color)'
              : '3px solid transparent',
            borderRadius: '12px 12px 0 0',
            color: activeSubTab === 'creation' ? 'white' : 'var(--text-secondary)',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: activeSubTab === 'creation'
              ? '0 4px 12px rgba(42, 157, 111, 0.4)'
              : 'none'
          }}
          onMouseEnter={(e) => {
            if (activeSubTab !== 'creation') {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeSubTab !== 'creation') {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }
          }}
        >
          <i className="fas fa-plus-circle"></i>
          Création d'Actions
        </button>
      </div>

      {/* Historique Tab */}
      {activeSubTab === 'historique' && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '25px',
          marginBottom: '30px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fas fa-history"></i> Historique de Toutes les Actions
          </h3>
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            overflowX: 'auto',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {filteredActions.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-inbox"></i>
                <h3>Aucune action dans l'historique</h3>
                <p>Les actions soumises apparaîtront ici</p>
              </div>
            ) : (
              <table className="validation-table" style={{
                width: '100%',
                borderCollapse: 'collapse',
                background: 'rgba(255, 255, 255, 0.03)'
              }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--card-bg)' }}>
                  <tr style={{ background: 'rgba(30, 39, 46, 0.98)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Employé</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Action</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Points</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Preuve</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActions.map(action => (
                    <tr key={action.id}>
                      <td>
                        <span className="employee-name">{action.employeeName}</span>
                      </td>
                      <td>
                        <div className="action-cell">
                          <span className="action-name">{action.actionName}</span>
                        </div>
                      </td>
                      <td>
                        <div className="points-cell">
                          <i className="fas fa-coins"></i>
                          <span>{action.points} pts</span>
                        </div>
                      </td>
                      <td>
                        <div className="date-cell">
                          <i className="fas fa-calendar"></i>
                          <span>{new Date(action.submittedDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </td>
                      <td>
                        <div className="proof-cell">
                          {action.proofImage ? (
                            <button className="view-proof-btn" onClick={() => viewProof(action)}>
                              <i className="fas fa-image"></i>
                              Voir la preuve
                            </button>
                          ) : (
                            <span className="no-proof">
                              <i className="fas fa-ban"></i>
                              Aucune preuve
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${action.status}`}>
                          {action.status === 'pending' && (
                            <>
                              <i className="fas fa-clock"></i>
                              En attente
                            </>
                          )}
                          {action.status === 'approved' && (
                            <>
                              <i className="fas fa-check-circle"></i>
                              Approuvée
                            </>
                          )}
                          {action.status === 'rejected' && (
                            <>
                              <i className="fas fa-times-circle"></i>
                              Rejetée
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Validation Tab */}
      {activeSubTab === 'validation' && (
        <>
          {/* Status Filters */}
          <div className="status-filters">
            <button
              className={`filter-tab ${validationFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setValidationFilter('pending')}
            >
              <i className="fas fa-clock"></i>
              En Attente
              {pendingCount > 0 && <span style={{ marginLeft: '8px', background: '#f59e0b', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>{pendingCount}</span>}
            </button>
            <button
              className={`filter-tab ${validationFilter === 'approved' ? 'active' : ''}`}
              onClick={() => setValidationFilter('approved')}
            >
              <i className="fas fa-check-circle"></i>
              Approuvées
            </button>
            <button
              className={`filter-tab ${validationFilter === 'rejected' ? 'active' : ''}`}
              onClick={() => setValidationFilter('rejected')}
            >
              <i className="fas fa-times-circle"></i>
              Rejetées
            </button>
          </div>

          {/* Validation Table */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '25px',
            marginBottom: '30px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              overflowX: 'auto',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {filteredActions.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-inbox"></i>
                  <h3>Aucune action {validationFilter === 'pending' ? 'en attente' : validationFilter === 'approved' ? 'approuvée' : 'rejetée'}</h3>
                  <p>Les actions soumises apparaîtront ici</p>
                </div>
              ) : (
                <table className="validation-table" style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  background: 'rgba(255, 255, 255, 0.03)'
                }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--card-bg)' }}>
                    <tr style={{ background: 'rgba(30, 39, 46, 0.98)' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Employé</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Action</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Points</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Date</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Preuve</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Statut</th>
                      {validationFilter === 'pending' && <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActions.map(action => (
                      <tr key={action.id}>
                        <td>
                          <span className="employee-name">{action.employeeName}</span>
                        </td>
                        <td>
                          <div className="action-cell">
                            <span className="action-name">{action.actionName}</span>
                          </div>
                        </td>
                        <td>
                          <div className="points-cell">
                            <i className="fas fa-coins"></i>
                            <span>{action.points} pts</span>
                          </div>
                        </td>
                        <td>
                          <div className="date-cell">
                            <i className="fas fa-calendar"></i>
                            <span>{new Date(action.submittedDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </td>
                        <td>
                          <div className="proof-cell">
                            {action.proofImage ? (
                              <button className="view-proof-btn" onClick={() => viewProof(action)}>
                                <i className="fas fa-image"></i>
                                Voir la preuve
                              </button>
                            ) : (
                              <span className="no-proof">
                                <i className="fas fa-ban"></i>
                                Aucune preuve
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${action.status}`}>
                            {action.status === 'pending' && (
                              <>
                                <i className="fas fa-clock"></i>
                                En attente
                              </>
                            )}
                            {action.status === 'approved' && (
                              <>
                                <i className="fas fa-check-circle"></i>
                                Approuvée
                              </>
                            )}
                            {action.status === 'rejected' && (
                              <>
                                <i className="fas fa-times-circle"></i>
                                Rejetée
                              </>
                            )}
                          </span>
                        </td>
                        {validationFilter === 'pending' && (
                          <td>
                            <div className="action-buttons">
                              <button
                                className="approve-btn"
                                onClick={() => handleApprove(action)}
                                title="Approuver"
                              >
                                <i className="fas fa-check"></i>
                                Approuver
                              </button>
                              <button
                                className="reject-btn"
                                onClick={() => handleReject(action)}
                                title="Rejeter"
                              >
                                <i className="fas fa-times"></i>
                                Rejeter
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {/* Creation d'Actions Tab */}
      {activeSubTab === 'creation' && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '25px',
          marginBottom: '30px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fas fa-tasks"></i> Gestion des Actions Disponibles
            </h3>
            <button
              onClick={handleCreateNewAction}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(42, 157, 111, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(42, 157, 111, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(42, 157, 111, 0.4)';
              }}
            >
              <i className="fas fa-plus"></i>
              Nouvelle Action
            </button>
          </div>

          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            overflowX: 'auto',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: 'rgba(255, 255, 255, 0.03)'
            }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--card-bg)' }}>
                <tr style={{ background: 'rgba(30, 39, 46, 0.98)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Nom de l'Action</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Description</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Catégorie</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Points</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Statut</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {availableActions.map(action => (
                  <tr key={action.id}>
                    <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: '600' }}>
                      {action.name}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      {action.description}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 12px',
                        background: action.category === 'Transport' ? 'rgba(59, 130, 246, 0.2)' :
                                   action.category === 'Énergie' ? 'rgba(251, 191, 36, 0.2)' :
                                   'rgba(16, 185, 129, 0.2)',
                        color: action.category === 'Transport' ? '#3b82f6' :
                               action.category === 'Énergie' ? '#fbbf24' :
                               '#10b981',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {action.category}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-color)', fontWeight: '600' }}>
                        <i className="fas fa-coins"></i>
                        {action.points} pts
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 12px',
                        background: action.active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                        color: action.active ? '#10b981' : '#9ca3af',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        <i className={`fas fa-${action.active ? 'check-circle' : 'pause-circle'}`}></i>
                        {action.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEditAction(action)}
                          style={{
                            padding: '6px 12px',
                            background: 'rgba(59, 130, 246, 0.2)',
                            border: '1px solid #3b82f6',
                            borderRadius: '8px',
                            color: '#3b82f6',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleToggleActionStatus(action.id)}
                          style={{
                            padding: '6px 12px',
                            background: action.active ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                            border: `1px solid ${action.active ? '#ef4444' : '#10b981'}`,
                            borderRadius: '8px',
                            color: action.active ? '#ef4444' : '#10b981',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = action.active ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = action.active ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <i className={`fas fa-${action.active ? 'pause' : 'play'}`}></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Form Modal */}
      {showActionFormModal && (
        <div className="proof-modal-overlay" onClick={() => setShowActionFormModal(false)}>
          <div className="proof-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="proof-modal-header">
              <div>
                <h3>
                  <i className={`fas fa-${editingAction ? 'edit' : 'plus-circle'}`}></i>
                  {editingAction ? 'Modifier l\'Action' : 'Nouvelle Action'}
                </h3>
              </div>
              <button className="close-modal-btn" onClick={() => setShowActionFormModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="proof-modal-body" style={{ padding: '24px', background: 'rgba(42, 157, 111, 0.15)', display: 'block' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Nom de l'action */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    <i className="fas fa-tag" style={{ marginRight: '8px', color: 'var(--accent-color)' }}></i>
                    Nom de l'Action
                  </label>
                  <input
                    type="text"
                    value={actionForm.name}
                    onChange={(e) => setActionForm({ ...actionForm, name: e.target.value })}
                    placeholder="Ex: Transport Écologique"
                    style={{
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
                  />
                </div>

                {/* Description */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    <i className="fas fa-align-left" style={{ marginRight: '8px', color: 'var(--accent-color)' }}></i>
                    Description
                  </label>
                  <textarea
                    value={actionForm.description}
                    onChange={(e) => setActionForm({ ...actionForm, description: e.target.value })}
                    placeholder="Décrivez l'action en détail..."
                    rows={3}
                    style={{
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
                  />
                </div>

                {/* Catégorie et Points */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {/* Catégorie */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      <i className="fas fa-folder" style={{ marginRight: '8px', color: 'var(--accent-color)' }}></i>
                      Catégorie
                    </label>
                    <select
                      value={actionForm.category}
                      onChange={(e) => setActionForm({ ...actionForm, category: e.target.value })}
                      style={{
                        padding: '12px 16px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '10px',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        outline: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
                    >
                      <option value="Transport">Transport</option>
                      <option value="Énergie">Énergie</option>
                      <option value="Déchet">Déchet</option>
                      <option value="Eau">Eau</option>
                      <option value="Bureau">Bureau</option>
                      <option value="Collectif">Collectif</option>
                    </select>
                  </div>

                  {/* Points */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      <i className="fas fa-coins" style={{ marginRight: '8px', color: 'var(--accent-color)' }}></i>
                      Points
                    </label>
                    <input
                      type="number"
                      value={actionForm.points}
                      onChange={(e) => setActionForm({ ...actionForm, points: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      min="0"
                      style={{
                        padding: '12px 16px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '10px',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="proof-modal-footer">
              <button
                onClick={() => setShowActionFormModal(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <i className="fas fa-times"></i>
                Annuler
              </button>
              <button
                onClick={handleSaveAction}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(42, 157, 111, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(42, 157, 111, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(42, 157, 111, 0.4)';
                }}
              >
                <i className="fas fa-save"></i>
                {editingAction ? 'Mettre à jour' : 'Créer l\'Action'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proof Viewer Modal */}
      {showProofModal && selectedProof && (
        <div className="proof-modal-overlay" onClick={() => setShowProofModal(false)}>
          <div className="proof-modal" onClick={(e) => e.stopPropagation()}>
            <div className="proof-modal-header">
              <div>
                <h3>Preuve: {selectedProof.actionName}</h3>
                <p>Soumis par {selectedProof.employeeName}</p>
              </div>
              <button className="close-modal-btn" onClick={() => setShowProofModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="proof-modal-body">
              {selectedProof.proofImage ? (
                <img src={selectedProof.proofImage} alt="Preuve" className="proof-image-full" />
              ) : (
                <div className="no-proof-message">
                  <i className="fas fa-ban"></i>
                  <p>Aucune preuve fournie</p>
                </div>
              )}
            </div>
            <div className="proof-modal-footer">
              <div className="action-info-footer">
                <span className="points-display">
                  <i className="fas fa-coins"></i>
                  {selectedProof.points} points
                </span>
                <span className="date-display">
                  <i className="fas fa-calendar"></i>
                  {new Date(selectedProof.submittedDate).toLocaleDateString('fr-FR')}
                </span>
              </div>
              {selectedProof.status === 'pending' && (
                <div className="modal-action-buttons">
                  <button className="reject-btn-modal" onClick={() => { handleReject(selectedProof); setShowProofModal(false); }}>
                    <i className="fas fa-times"></i>
                    Rejeter
                  </button>
                  <button className="approve-btn-modal" onClick={() => { handleApprove(selectedProof); setShowProofModal(false); }}>
                    <i className="fas fa-check"></i>
                    Approuver
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionValidationTab;
