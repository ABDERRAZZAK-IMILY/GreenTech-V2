import React, { useState, useEffect, useCallback } from 'react';
import { useLoading } from '../../../contexts/LoadingContext';
import gamificationService from '../../../services/gamificationService';
import './ActionValidationTab.css';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Coins, 
  Trophy 
} from 'lucide-react';
const ActionValidationTab = () => {
  const {
    setIsProcessingPurchase,
    setPurchaseProgress,
    setPurchaseStep,
    setPurchaseProductName
  } = useLoading();

  // Data states
  const [submissions, setSubmissions] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [stats, setStats] = useState({
    totalActions: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    totalPointsAwarded: 0,
    mostActiveUser: { name: 'N/A', count: 0 }
  });

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedProof, setSelectedProof] = useState(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('validation');
  const [validationFilter, setValidationFilter] = useState('pending');

  // Action form modal states
  const [showActionFormModal, setShowActionFormModal] = useState(false);
  const [editingAction, setEditingAction] = useState(null);
  const [actionForm, setActionForm] = useState({
    title: '',
    description: '',
    category: 'Transport',
    pointsReward: 0
  });
  const [isSaving, setIsSaving] = useState(false);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [submissionsData, challengesData, statsData] = await Promise.all([
        gamificationService.getAllSubmissions(),
        gamificationService.getAllChallenges(),
        gamificationService.getSubmissionsStats()
      ]);

      setSubmissions(submissionsData || []);
      setChallenges(challengesData || []);
      setStats({
        totalActions: statsData.totalActions || 0,
        pendingCount: statsData.pendingCount || 0,
        approvedCount: statsData.approvedCount || 0,
        rejectedCount: statsData.rejectedCount || 0,
        totalPointsAwarded: statsData.totalPointsAwarded || 0,
        mostActiveUser: statsData.mostActiveUser || { name: 'N/A', count: 0 }
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Erreur lors du chargement des données. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter submissions based on active tab and filter
  const filteredSubmissions = activeSubTab === 'historique'
    ? submissions
    : submissions.filter(sub => {
        const status = sub.status?.toLowerCase();
        if (validationFilter === 'pending') return status === 'pending';
        if (validationFilter === 'approved') return status === 'approved';
        if (validationFilter === 'rejected') return status === 'rejected';
        return true;
      });

  // Handle approve submission
  const handleApprove = async (submission) => {
    setPurchaseProductName(`Validation: ${submission.challengeTitle}`);
    setIsProcessingPurchase(true);
    setPurchaseProgress(0);
    setPurchaseStep('Validation de l\'action...');

    try {
      for (let i = 0; i <= 50; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 80));
        setPurchaseProgress(i);
      }

      setPurchaseStep('Attribution des points...');

      await gamificationService.validateSubmission(submission.id, 'APPROVED', 'Action approuvée par l\'administrateur');

      for (let i = 50; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 80));
        setPurchaseProgress(i);
      }

      setPurchaseStep(`✅ Action approuvée - ${submission.pointsAwarded} points attribués`);

      // Refresh data
      await fetchData();

      setTimeout(() => {
        setIsProcessingPurchase(false);
        setPurchaseProgress(0);
        setPurchaseStep('');
        setPurchaseProductName('');
      }, 2000);
    } catch (err) {
      console.error('Error approving submission:', err);
      setPurchaseStep('❌ Erreur lors de l\'approbation');
      setTimeout(() => {
        setIsProcessingPurchase(false);
        setPurchaseProgress(0);
        setPurchaseStep('');
        setPurchaseProductName('');
      }, 2000);
    }
  };

  // Handle reject submission
  const handleReject = async (submission) => {
    setPurchaseProductName(`Validation: ${submission.challengeTitle}`);
    setIsProcessingPurchase(true);
    setPurchaseProgress(0);
    setPurchaseStep('Rejet de l\'action...');

    try {
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 60));
        setPurchaseProgress(i);
      }

      await gamificationService.validateSubmission(submission.id, 'REJECTED', 'Preuve insuffisante ou action non conforme');

      setPurchaseStep('❌ Action rejetée');

      // Refresh data
      await fetchData();

      setTimeout(() => {
        setIsProcessingPurchase(false);
        setPurchaseProgress(0);
        setPurchaseStep('');
        setPurchaseProductName('');
      }, 2000);
    } catch (err) {
      console.error('Error rejecting submission:', err);
      setPurchaseStep('❌ Erreur lors du rejet');
      setTimeout(() => {
        setIsProcessingPurchase(false);
        setPurchaseProgress(0);
        setPurchaseStep('');
        setPurchaseProductName('');
      }, 2000);
    }
  };

  // View proof
  const viewProof = (submission) => {
    setSelectedProof(submission);
    setShowProofModal(true);
  };

  // Open form for creating new challenge
  const handleCreateNewAction = () => {
    setEditingAction(null);
    setActionForm({
      title: '',
      description: '',
      category: 'Transport',
      pointsReward: 0
    });
    setShowActionFormModal(true);
  };

  // Open form for editing existing challenge
  const handleEditAction = (challenge) => {
    setEditingAction(challenge);
    setActionForm({
      title: challenge.title,
      description: challenge.description,
      category: challenge.category,
      pointsReward: challenge.pointsReward
    });
    setShowActionFormModal(true);
  };

  // Toggle challenge active/inactive status
  const handleToggleActionStatus = async (challengeId) => {
    try {
      await gamificationService.toggleChallengeStatus(challengeId);
      await fetchData();
    } catch (err) {
      console.error('Error toggling challenge status:', err);
      alert('Erreur lors de la modification du statut');
    }
  };

  // Delete challenge
  const handleDeleteChallenge = async (challengeId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce défi ?')) {
      return;
    }
    try {
      await gamificationService.deleteChallenge(challengeId);
      await fetchData();
    } catch (err) {
      console.error('Error deleting challenge:', err);
      alert('Erreur lors de la suppression');
    }
  };

  // Save challenge (create or update)
  const handleSaveAction = async () => {
    if (!actionForm.title || !actionForm.description || actionForm.pointsReward <= 0) {
      alert('Veuillez remplir tous les champs correctement');
      return;
    }

    setIsSaving(true);
    try {
      const challengeData = {
        title: actionForm.title,
        description: actionForm.description,
        category: actionForm.category,
        pointsReward: actionForm.pointsReward
      };

      if (editingAction) {
        await gamificationService.updateChallenge(editingAction.id, challengeData);
      } else {
        await gamificationService.createChallenge(challengeData);
      }

      await fetchData();
      setShowActionFormModal(false);
      setEditingAction(null);
    } catch (err) {
      console.error('Error saving challenge:', err);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setIsSaving(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get status display
  const getStatusDisplay = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'pending') return { text: 'En attente', icon: 'fa-clock', class: 'pending' };
    if (statusLower === 'approved') return { text: 'Approuvée', icon: 'fa-check-circle', class: 'approved' };
    if (statusLower === 'rejected') return { text: 'Rejetée', icon: 'fa-times-circle', class: 'rejected' };
    return { text: status, icon: 'fa-question', class: '' };
  };

  // Get category color
  const getCategoryStyle = (category) => {
    const cat = category?.toLowerCase();
    if (cat === 'transport') return { bg: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' };
    if (cat === 'energy' || cat === 'énergie') return { bg: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' };
    if (cat === 'trash' || cat === 'déchet') return { bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' };
    if (cat === 'water' || cat === 'eau') return { bg: 'rgba(6, 182, 212, 0.2)', color: '#06b6d4' };
    if (cat === 'office' || cat === 'bureau') return { bg: 'rgba(168, 85, 247, 0.2)', color: '#a855f7' };
    if (cat === 'collective' || cat === 'collectif') return { bg: 'rgba(236, 72, 153, 0.2)', color: '#ec4899' };
    return { bg: 'rgba(16, 185, 129, 0.2)', color: '#10b981' };
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="action-validation-tab">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          gap: '20px'
        }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', color: 'var(--accent-color)' }}></i>
          <p style={{ color: 'var(--text-secondary)' }}>Chargement des données...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="action-validation-tab">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          gap: '20px'
        }}>
          <i className="fas fa-exclamation-triangle" style={{ fontSize: '48px', color: '#ef4444' }}></i>
          <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <button
            onClick={fetchData}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            <i className="fas fa-redo"></i> Réessayer
          </button>
        </div>
      </div>
    );
  }

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
          <button
            onClick={fetchData}
            style={{
              marginLeft: 'auto',
              padding: '8px 12px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="fas fa-sync-alt"></i> Actualiser
          </button>
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
        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
            <ClipboardList size={32} color="#667eea" />
        </div>
        <div style={{ fontSize: '28px', fontWeight: '700', color: '#667eea', marginBottom: '5px' }}>
            {stats.totalActions}
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
        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
            <Clock size={32} color="#f59e0b" />
        </div>
        <div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b', marginBottom: '5px' }}>
            {stats.pendingCount}
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
        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
            <CheckCircle2 size={32} color="#43e97b" />
        </div>
        <div style={{ fontSize: '28px', fontWeight: '700', color: '#43e97b', marginBottom: '5px' }}>
            {stats.approvedCount}
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
        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
            <XCircle size={32} color="#ef4444" />
        </div>
        <div style={{ fontSize: '28px', fontWeight: '700', color: '#ef4444', marginBottom: '5px' }}>
            {stats.rejectedCount}
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
        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
            <Coins size={32} color="#fab1a0" />
        </div>
        <div style={{ fontSize: '28px', fontWeight: '700', color: '#fab1a0', marginBottom: '5px' }}>
            {stats.totalPointsAwarded.toLocaleString()}
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
        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
            <Trophy size={32} color="#feca57" />
        </div>
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#feca57', marginBottom: '2px' }}>
            {stats.mostActiveUser.name}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {stats.mostActiveUser.count} actions soumises
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
        >
          <i className="fas fa-check-double"></i>
          Validation
          {stats.pendingCount > 0 && (
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
              {stats.pendingCount}
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
        >
          <i className="fas fa-plus-circle"></i>
          Gestion des Défis
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
            {submissions.length === 0 ? (
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
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Défi</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Catégorie</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Points</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Preuve</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map(submission => {
                    const statusInfo = getStatusDisplay(submission.status);
                    const categoryStyle = getCategoryStyle(submission.challengeCategory);
                    return (
                      <tr key={submission.id}>
                        <td>
                          <span className="employee-name">{submission.userName || 'Unknown'}</span>
                        </td>
                        <td>
                          <div className="action-cell">
                            <span className="action-name">{submission.challengeTitle}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '4px 12px',
                            background: categoryStyle.bg,
                            color: categoryStyle.color,
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {submission.challengeCategory || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <div className="points-cell">
                            <i className="fas fa-coins"></i>
                            <span>{submission.pointsAwarded} pts</span>
                          </div>
                        </td>
                        <td>
                          <div className="date-cell">
                            <i className="fas fa-calendar"></i>
                            <span>{formatDate(submission.submissionDate)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="proof-cell">
                            {submission.proofImageUrl && submission.proofImageUrl !== 'no-proof-required' ? (
                              <button className="view-proof-btn" onClick={() => viewProof(submission)}>
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
                          <span className={`status-badge ${statusInfo.class}`}>
                            <i className={`fas ${statusInfo.icon}`}></i>
                            {statusInfo.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
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
              {stats.pendingCount > 0 && <span style={{ marginLeft: '8px', background: '#f59e0b', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>{stats.pendingCount}</span>}
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
              {filteredSubmissions.length === 0 ? (
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
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Défi</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Points</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Date</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Preuve</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Statut</th>
                      {validationFilter === 'pending' && <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map(submission => {
                      const statusInfo = getStatusDisplay(submission.status);
                      return (
                        <tr key={submission.id}>
                          <td>
                            <span className="employee-name">{submission.userName || 'Unknown'}</span>
                          </td>
                          <td>
                            <div className="action-cell">
                              <span className="action-name">{submission.challengeTitle}</span>
                            </div>
                          </td>
                          <td>
                            <div className="points-cell">
                              <i className="fas fa-coins"></i>
                              <span>{submission.pointsAwarded} pts</span>
                            </div>
                          </td>
                          <td>
                            <div className="date-cell">
                              <i className="fas fa-calendar"></i>
                              <span>{formatDate(submission.submissionDate)}</span>
                            </div>
                          </td>
                          <td>
                            <div className="proof-cell">
                              {submission.proofImageUrl && submission.proofImageUrl !== 'no-proof-required' ? (
                                <button className="view-proof-btn" onClick={() => viewProof(submission)}>
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
                            <span className={`status-badge ${statusInfo.class}`}>
                              <i className={`fas ${statusInfo.icon}`}></i>
                              {statusInfo.text}
                            </span>
                          </td>
                          {validationFilter === 'pending' && (
                            <td>
                              <div className="action-buttons">
                                <button
                                  className="approve-btn"
                                  onClick={() => handleApprove(submission)}
                                  title="Approuver"
                                >
                                  <i className="fas fa-check"></i>
                                  Approuver
                                </button>
                                <button
                                  className="reject-btn"
                                  onClick={() => handleReject(submission)}
                                  title="Rejeter"
                                >
                                  <i className="fas fa-times"></i>
                                  Rejeter
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {/* Challenges Management Tab */}
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
              <i className="fas fa-tasks"></i> Gestion des Défis Disponibles
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
            >
              <i className="fas fa-plus"></i>
              Nouveau Défi
            </button>
          </div>

          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            overflowX: 'auto',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {challenges.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-tasks"></i>
                <h3>Aucun défi créé</h3>
                <p>Créez votre premier défi écologique</p>
              </div>
            ) : (
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                background: 'rgba(255, 255, 255, 0.03)'
              }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--card-bg)' }}>
                  <tr style={{ background: 'rgba(30, 39, 46, 0.98)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Nom du Défi</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Description</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Catégorie</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Points</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Statut</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {challenges.map(challenge => {
                    const categoryStyle = getCategoryStyle(challenge.category);
                    return (
                      <tr key={challenge.id}>
                        <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: '600' }}>
                          {challenge.title}
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '250px' }}>
                          {challenge.description}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '4px 12px',
                            background: categoryStyle.bg,
                            color: categoryStyle.color,
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {challenge.category}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-color)', fontWeight: '600' }}>
                            <i className="fas fa-coins"></i>
                            {challenge.pointsReward} pts
                          </div>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 12px',
                            background: challenge.active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                            color: challenge.active ? '#10b981' : '#9ca3af',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            <i className={`fas fa-${challenge.active ? 'check-circle' : 'pause-circle'}`}></i>
                            {challenge.active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleEditAction(challenge)}
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
                              title="Modifier"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              onClick={() => handleToggleActionStatus(challenge.id)}
                              style={{
                                padding: '6px 12px',
                                background: challenge.active ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                border: `1px solid ${challenge.active ? '#ef4444' : '#10b981'}`,
                                borderRadius: '8px',
                                color: challenge.active ? '#ef4444' : '#10b981',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                              }}
                              title={challenge.active ? 'Désactiver' : 'Activer'}
                            >
                              <i className={`fas fa-${challenge.active ? 'pause' : 'play'}`}></i>
                            </button>
                            <button
                              onClick={() => handleDeleteChallenge(challenge.id)}
                              style={{
                                padding: '6px 12px',
                                background: 'rgba(239, 68, 68, 0.2)',
                                border: '1px solid #ef4444',
                                borderRadius: '8px',
                                color: '#ef4444',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                              }}
                              title="Supprimer"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Challenge Form Modal */}
      {showActionFormModal && (
        <div className="proof-modal-overlay" onClick={() => setShowActionFormModal(false)}>
          <div className="proof-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="proof-modal-header">
              <div>
                <h3>
                  <i className={`fas fa-${editingAction ? 'edit' : 'plus-circle'}`}></i>
                  {editingAction ? 'Modifier le Défi' : 'Nouveau Défi'}
                </h3>
              </div>
              <button className="close-modal-btn" onClick={() => setShowActionFormModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="proof-modal-body" style={{ padding: '24px', background: 'rgba(42, 157, 111, 0.15)', display: 'block' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Nom du défi */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    <i className="fas fa-tag" style={{ marginRight: '8px', color: 'var(--accent-color)' }}></i>
                    Nom du Défi
                  </label>
                  <input
                    type="text"
                    value={actionForm.title}
                    onChange={(e) => setActionForm({ ...actionForm, title: e.target.value })}
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
                    placeholder="Décrivez le défi en détail..."
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
                        background: 'rgba(30, 30, 30, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '10px',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        outline: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <option value="Transport" style={{ background: '#1a1a2e', color: '#fff' }}>Transport</option>
                      <option value="energy" style={{ background: '#1a1a2e', color: '#fff' }}>Énergie</option>
                      <option value="trash" style={{ background: '#1a1a2e', color: '#fff' }}>Déchet</option>
                      <option value="water" style={{ background: '#1a1a2e', color: '#fff' }}>Eau</option>
                      <option value="office" style={{ background: '#1a1a2e', color: '#fff' }}>Bureau</option>
                      <option value="collective" style={{ background: '#1a1a2e', color: '#fff' }}>Collectif</option>
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
                      value={actionForm.pointsReward}
                      onChange={(e) => setActionForm({ ...actionForm, pointsReward: parseInt(e.target.value) || 0 })}
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
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="proof-modal-footer">
              <button
                onClick={() => setShowActionFormModal(false)}
                disabled={isSaving}
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
              >
                <i className="fas fa-times"></i>
                Annuler
              </button>
              <button
                onClick={handleSaveAction}
                disabled={isSaving}
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
                  cursor: isSaving ? 'wait' : 'pointer',
                  boxShadow: '0 4px 12px rgba(42, 157, 111, 0.4)',
                  transition: 'all 0.3s ease',
                  opacity: isSaving ? 0.7 : 1
                }}
              >
                {isSaving ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    {editingAction ? 'Mettre à jour' : 'Créer le Défi'}
                  </>
                )}
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
                <h3>Preuve: {selectedProof.challengeTitle}</h3>
                <p>Soumis par {selectedProof.userName}</p>
              </div>
              <button className="close-modal-btn" onClick={() => setShowProofModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="proof-modal-body">
              {selectedProof.proofImageUrl && selectedProof.proofImageUrl !== 'no-proof-required' ? (
                <img src={selectedProof.proofImageUrl} alt="Preuve" className="proof-image-full" />
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
                  {selectedProof.pointsAwarded} points
                </span>
                <span className="date-display">
                  <i className="fas fa-calendar"></i>
                  {formatDate(selectedProof.submissionDate)}
                </span>
              </div>
              {selectedProof.status?.toLowerCase() === 'pending' && (
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
