import React, { useState } from 'react';
import { showNotification } from '../../../utils/notifications';

const ProfileTeamsTab = () => {
  const [isAdmin] = useState(true); // Hardcoded for now - will be from auth context later

  // Members management state with Moroccan names
  const [members, setMembers] = useState([
    { id: 1, name: 'Youssef Alami', email: 'youssef.alami@greentech.com', department: 'IT', role: 'Développeur Senior', ecoCoins: 12450, pointsEarned: 15200, pointsSpent: 2750, actionsCompleted: 127, badges: 8, level: 6, joinDate: '2023-01-15', status: 'active' },
    { id: 2, name: 'Fatima Zahra Bennani', email: 'fatima.bennani@greentech.com', department: 'RH', role: 'Responsable RH', ecoCoins: 11800, pointsEarned: 13500, pointsSpent: 1700, actionsCompleted: 115, badges: 7, level: 6, joinDate: '2023-02-10', status: 'active' },
    { id: 3, name: 'Mehdi Tazi', email: 'mehdi.tazi@greentech.com', department: 'Commercial', role: 'Chef de Ventes', ecoCoins: 10500, pointsEarned: 12000, pointsSpent: 1500, actionsCompleted: 98, badges: 6, level: 5, joinDate: '2023-03-20', status: 'active' },
    { id: 4, name: 'Salma Idrissi', email: 'salma.idrissi@greentech.com', department: 'IT', role: 'Développeur Full Stack', ecoCoins: 8450, pointsEarned: 10200, pointsSpent: 1750, actionsCompleted: 87, badges: 6, level: 5, joinDate: '2023-01-10', status: 'active' },
    { id: 5, name: 'Amine Berrada', email: 'amine.berrada@greentech.com', department: 'IT', role: 'DevOps Engineer', ecoCoins: 9200, pointsEarned: 10500, pointsSpent: 1300, actionsCompleted: 92, badges: 5, level: 5, joinDate: '2023-04-05', status: 'active' },
    { id: 6, name: 'Karima Lahlou', email: 'karima.lahlou@greentech.com', department: 'Logistique', role: 'Responsable Logistique', ecoCoins: 8800, pointsEarned: 10100, pointsSpent: 1300, actionsCompleted: 84, badges: 5, level: 5, joinDate: '2023-05-12', status: 'active' },
    { id: 7, name: 'Omar El Fassi', email: 'omar.elfassi@greentech.com', department: 'RH', role: 'Chargé RH', ecoCoins: 7650, pointsEarned: 8900, pointsSpent: 1250, actionsCompleted: 76, badges: 4, level: 4, joinDate: '2023-06-18', status: 'active' },
    { id: 8, name: 'Zineb Chaoui', email: 'zineb.chaoui@greentech.com', department: 'Commercial', role: 'Commerciale', ecoCoins: 7200, pointsEarned: 8300, pointsSpent: 1100, actionsCompleted: 71, badges: 4, level: 4, joinDate: '2023-07-22', status: 'active' },
    { id: 9, name: 'Hamza Benjelloun', email: 'hamza.benjelloun@greentech.com', department: 'IT', role: 'UX Designer', ecoCoins: 6850, pointsEarned: 7800, pointsSpent: 950, actionsCompleted: 65, badges: 4, level: 4, joinDate: '2023-08-30', status: 'active' },
    { id: 10, name: 'Khadija Amrani', email: 'khadija.amrani@greentech.com', department: 'Logistique', role: 'Agent Logistique', ecoCoins: 5950, pointsEarned: 6700, pointsSpent: 750, actionsCompleted: 58, badges: 3, level: 3, joinDate: '2023-09-14', status: 'active' },
    { id: 11, name: 'Rachid Moussaoui', email: 'rachid.moussaoui@greentech.com', department: 'Production', role: 'Chef Production', ecoCoins: 7450, pointsEarned: 8800, pointsSpent: 1350, actionsCompleted: 79, badges: 5, level: 4, joinDate: '2023-07-01', status: 'active' },
    { id: 12, name: 'Imane Kadiri', email: 'imane.kadiri@greentech.com', department: 'Commercial', role: 'Commerciale', ecoCoins: 6200, pointsEarned: 7100, pointsSpent: 900, actionsCompleted: 62, badges: 3, level: 3, joinDate: '2023-08-15', status: 'active' }
  ]);

  // Modal states
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    role: ''
  });

  const [pointsData, setPointsData] = useState({
    memberId: null,
    points: 0,
    reason: '',
    type: 'add' // 'add' or 'remove'
  });

  // Calculate statistics
  const activeMembers = members.filter(m => m.status === 'active');
  const totalEmployees = activeMembers.length;
  const totalActionsCompleted = activeMembers.reduce((sum, m) => sum + m.actionsCompleted, 0);
  const totalBadgesEarned = activeMembers.reduce((sum, m) => sum + m.badges, 0);
  const pendingRequests = 0; // Moved to MarketplaceTab
  const participationRate = ((activeMembers.filter(m => m.actionsCompleted > 0).length / totalEmployees) * 100).toFixed(1);

  // Handlers
  const handleAddMember = (e) => {
    e.preventDefault();
    const newMember = {
      id: members.length + 1,
      ...formData,
      ecoCoins: 0,
      pointsEarned: 0,
      pointsSpent: 0,
      actionsCompleted: 0,
      badges: 0,
      level: 1,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    setMembers([...members, newMember]);
    setShowAddMemberModal(false);
    setFormData({ name: '', email: '', department: '', role: '' });
    showNotification(`Membre ${newMember.name} ajouté avec succès !`, 'success');
  };

  const handleEditMember = (e) => {
    e.preventDefault();
    setMembers(members.map(m => m.id === selectedMember.id ? { ...m, ...formData } : m));
    setShowEditMemberModal(false);
    setSelectedMember(null);
    setFormData({ name: '', email: '', department: '', role: '' });
    showNotification('Membre modifié avec succès !', 'success');
  };

  const handleDeleteMember = (memberId) => {
    const member = members.find(m => m.id === memberId);
    setConfirmAction({
      type: 'delete',
      title: 'Supprimer le membre',
      message: `Êtes-vous sûr de vouloir désactiver ${member.name} ? Cette action peut être annulée en réactivant le membre ultérieurement.`,
      onConfirm: () => {
        setMembers(members.map(m => m.id === memberId ? { ...m, status: 'inactive' } : m));
        setShowConfirmModal(false);
        setConfirmAction(null);
        showNotification(`${member.name} a été désactivé avec succès`, 'success');
      }
    });
    setShowConfirmModal(true);
  };

  const handleAttributePoints = (e) => {
    e.preventDefault();
    const member = members.find(m => m.id === pointsData.memberId);
    if (member) {
      if (pointsData.type === 'add') {
        setMembers(members.map(m =>
          m.id === pointsData.memberId
            ? { ...m, ecoCoins: m.ecoCoins + pointsData.points, pointsEarned: m.pointsEarned + pointsData.points }
            : m
        ));
        showNotification(`${pointsData.points} points ajoutés à ${member.name}`, 'success');
      } else {
        setMembers(members.map(m =>
          m.id === pointsData.memberId
            ? { ...m, ecoCoins: Math.max(0, m.ecoCoins - pointsData.points), pointsSpent: m.pointsSpent + pointsData.points }
            : m
        ));
        showNotification(`${pointsData.points} points retirés de ${member.name}`, 'success');
      }
    }
    setShowPointsModal(false);
    setPointsData({ memberId: null, points: 0, reason: '', type: 'add' });
  };

  const openEditModal = (member) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      department: member.department,
      role: member.role
    });
    setShowEditMemberModal(true);
  };

  const openPointsModal = (member) => {
    setPointsData({ ...pointsData, memberId: member.id });
    setShowPointsModal(true);
  };

  const closeModals = () => {
    setShowAddMemberModal(false);
    setShowEditMemberModal(false);
    setShowPointsModal(false);
    setShowHistoryModal(false);
    setSelectedMember(null);
    setFormData({ name: '', email: '', department: '', role: '' });
    setPointsData({ memberId: null, points: 0, reason: '', type: 'add' });
  };

  return (
    <div className="profile-teams-tab">

      {/* ADMIN VIEW - Employee Statistics Section */}
      <div className="admin-statistics-section" style={{
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '25px',
        marginBottom: '30px',
        border: '1px solid rgba(102, 126, 234, 0.3)'
      }}>
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fas fa-chart-pie"></i> Statistiques des Employés
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div className="stat-box" style={{
            background: 'rgba(118, 75, 162, 0.25)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            border: '1px solid rgba(118, 75, 162, 0.4)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#a78bfa', marginBottom: '5px' }}>{totalEmployees}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Employés Actifs</div>
          </div>
          <div className="stat-box" style={{
            background: 'rgba(67, 233, 123, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            border: '1px solid rgba(67, 233, 123, 0.3)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#43e97b', marginBottom: '5px' }}>{totalActionsCompleted.toLocaleString()}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Actions Complétées</div>
          </div>
          <div className="stat-box" style={{
            background: 'rgba(254, 202, 87, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            border: '1px solid rgba(254, 202, 87, 0.3)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏆</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#feca57', marginBottom: '5px' }}>{totalBadgesEarned}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Badges Obtenus</div>
          </div>
          <div className="stat-box" style={{
            background: 'rgba(240, 147, 251, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            border: '1px solid rgba(240, 147, 251, 0.3)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#f093fb', marginBottom: '5px' }}>{pendingRequests}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Demandes en Attente</div>
          </div>
          <div className="stat-box" style={{
            background: 'rgba(255, 159, 64, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            border: '1px solid rgba(255, 159, 64, 0.3)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#ff9f40', marginBottom: '5px' }}>{participationRate}%</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Taux de Participation</div>
          </div>
        </div>
      </div>

      {/* ADMIN SECTION - Only visible for admins */}
      {isAdmin && (
        <>
          <div className="admin-section" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '25px',
            marginBottom: '30px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ margin: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fas fa-user-shield"></i> Administration - Gestion des Membres
            </h3>

            {/* Members Table with Scrollbar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-users"></i> Liste des employés
                </h4>
                <div id='actionbutton' className='flex'>

                <button
                  onClick={() => setShowAddMemberModal(true)}
                  style={{
                    background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                  }}
                >
                  <i className="fas fa-user-plus"></i>
                  Ajouter un departement
                </button>
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  style={{
                    background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                  }}
                >
                  <i className="fas fa-user-plus"></i>
                  Ajouter un membre
                </button>
                </div>
              </div>

              <div style={{
                maxHeight: '460px',
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
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Nom</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Département</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Eco-Coins</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Gagnés</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Dépensés</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Actions</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Niveau</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Gestion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.filter(m => m.status === 'active').map(member => (
                      <tr key={member.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '12px' }}>
                          <div>
                            <div style={{ fontWeight: '600' }}>{member.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{member.email}</div>
                          </div>
                        </td>
                        <td style={{ padding: '12px' }}>{member.department}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ color: 'var(--accent-color)', fontWeight: '700' }}>{member.ecoCoins}</span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ color: '#43e97b' }}>+{member.pointsEarned}</span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ color: '#ff6b6b' }}>-{member.pointsSpent}</span>
                        </td>
                        <td style={{ padding: '12px' }}>{member.actionsCompleted}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: 'white',
                            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                          }}>
                            Niv. {member.level}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                            <button
                              onClick={() => openPointsModal(member)}
                              title="Attribuer/Retirer points"
                              style={{
                                background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                                border: 'none',
                                color: 'white',
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 3px 10px rgba(102, 126, 234, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-3px) scale(1.1)';
                                e.currentTarget.style.boxShadow = '0 6px 15px rgba(102, 126, 234, 0.6)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = '0 3px 10px rgba(102, 126, 234, 0.4)';
                              }}
                            >
                              <i className="fas fa-coins"></i>
                            </button>
                            <button
                              onClick={() => openEditModal(member)}
                              title="Modifier"
                              style={{
                                background: 'linear-gradient(135deg, #c9971f, #d47d1f)',
                                border: 'none',
                                color: 'white',
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 3px 10px rgba(201, 151, 31, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-3px) scale(1.1)';
                                e.currentTarget.style.boxShadow = '0 6px 15px rgba(201, 151, 31, 0.6)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = '0 3px 10px rgba(201, 151, 31, 0.4)';
                              }}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteMember(member.id)}
                              title="Supprimer"
                              style={{
                                background: 'linear-gradient(135deg, #c94b4b, #b84855)',
                                border: 'none',
                                color: 'white',
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 3px 10px rgba(201, 75, 75, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-3px) scale(1.1)';
                                e.currentTarget.style.boxShadow = '0 6px 15px rgba(201, 75, 75, 0.6)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = '0 3px 10px rgba(201, 75, 75, 0.4)';
                              }}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* MODALS */}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="modal" style={{display: 'block', background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)'}} onClick={closeModals}>
          <div className="modal-content" style={{
            maxWidth: '600px',
            background: 'linear-gradient(135deg, rgba(30, 39, 46, 0.98) 0%, rgba(45, 52, 54, 0.98) 100%)',
            borderRadius: '20px',
            padding: '0',
            border: '2px solid rgba(102, 126, 234, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
              padding: '25px 30px',
              borderRadius: '18px 18px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '20px', fontWeight: '700' }}>
                <i className="fas fa-user-plus"></i> Ajouter un membre
              </h3>
              <button onClick={closeModals} style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}>
                <i className="fas fa-times" style={{ fontSize: '18px' }}></i>
              </button>
            </div>
            <form onSubmit={handleAddMember} style={{ padding: '30px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  <i className="fas fa-user" style={{ marginRight: '8px', color: 'var(--primary-color)' }}></i>
                  Nom complet
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="Ex: Youssef Alami"
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  <i className="fas fa-envelope" style={{ marginRight: '8px', color: 'var(--primary-color)' }}></i>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  placeholder="youssef.alami@greentech.com"
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    <i className="fas fa-building" style={{ marginRight: '8px', color: 'var(--primary-color)' }}></i>
                    Département
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      transition: 'all 0.3s ease',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  >
                    <option value="" style={{ background: '#1e272e', color: '#fff' }}>Sélectionner...</option>
                    <option value="IT" style={{ background: '#1e272e', color: '#fff' }}>IT</option>
                    <option value="RH" style={{ background: '#1e272e', color: '#fff' }}>RH</option>
                    <option value="Commercial" style={{ background: '#1e272e', color: '#fff' }}>Commercial</option>
                    <option value="Logistique" style={{ background: '#1e272e', color: '#fff' }}>Logistique</option>
                    <option value="Production" style={{ background: '#1e272e', color: '#fff' }}>Production</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    <i className="fas fa-briefcase" style={{ marginRight: '8px', color: 'var(--primary-color)' }}></i>
                    Rôle
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    required
                    placeholder="Développeur Senior"
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      transition: 'all 0.3s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                <button type="button" onClick={closeModals} style={{
                  flex: 1,
                  padding: '14px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}>
                  Annuler
                </button>
                <button type="submit" style={{
                  flex: 1,
                  padding: '14px',
                  background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                }}>
                  <i className="fas fa-plus"></i> Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditMemberModal && (
        <div className="modal" style={{display: 'block', background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)'}} onClick={closeModals}>
          <div className="modal-content" style={{
            maxWidth: '600px',
            background: 'linear-gradient(135deg, rgba(30, 39, 46, 0.98) 0%, rgba(45, 52, 54, 0.98) 100%)',
            borderRadius: '20px',
            padding: '0',
            border: '2px solid rgba(254, 202, 87, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              background: 'linear-gradient(135deg, #feca57, #ff9f40)',
              padding: '25px 30px',
              borderRadius: '18px 18px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '20px', fontWeight: '700' }}>
                <i className="fas fa-edit"></i> Modifier le membre
              </h3>
              <button onClick={closeModals} style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}>
                <i className="fas fa-times" style={{ fontSize: '18px' }}></i>
              </button>
            </div>
            <form onSubmit={handleEditMember} style={{ padding: '30px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  <i className="fas fa-user" style={{ marginRight: '8px', color: '#feca57' }}></i>
                  Nom complet
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="Ex: Youssef Alami"
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#feca57'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  <i className="fas fa-envelope" style={{ marginRight: '8px', color: '#feca57' }}></i>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  placeholder="youssef.alami@greentech.com"
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#feca57'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    <i className="fas fa-building" style={{ marginRight: '8px', color: '#feca57' }}></i>
                    Département
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      transition: 'all 0.3s ease',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#feca57'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  >
                    <option value="IT" style={{ background: '#1e272e', color: '#fff' }}>IT</option>
                    <option value="RH" style={{ background: '#1e272e', color: '#fff' }}>RH</option>
                    <option value="Commercial" style={{ background: '#1e272e', color: '#fff' }}>Commercial</option>
                    <option value="Logistique" style={{ background: '#1e272e', color: '#fff' }}>Logistique</option>
                    <option value="Production" style={{ background: '#1e272e', color: '#fff' }}>Production</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    <i className="fas fa-briefcase" style={{ marginRight: '8px', color: '#feca57' }}></i>
                    Rôle
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    required
                    placeholder="Développeur Senior"
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      transition: 'all 0.3s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#feca57'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                <button type="button" onClick={closeModals} style={{
                  flex: 1,
                  padding: '14px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}>
                  Annuler
                </button>
                <button type="submit" style={{
                  flex: 1,
                  padding: '14px',
                  background: 'linear-gradient(135deg, #feca57, #ff9f40)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(254, 202, 87, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(254, 202, 87, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(254, 202, 87, 0.4)';
                }}>
                  <i className="fas fa-save"></i> Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Points Attribution Modal */}
      {showPointsModal && (
        <div className="modal" style={{display: 'block', background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)'}} onClick={closeModals}>
          <div className="modal-content" style={{
            maxWidth: '600px',
            background: 'linear-gradient(135deg, rgba(30, 39, 46, 0.98) 0%, rgba(45, 52, 54, 0.98) 100%)',
            borderRadius: '20px',
            padding: '0',
            border: '2px solid rgba(102, 126, 234, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
              padding: '25px 30px',
              borderRadius: '18px 18px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '20px', fontWeight: '700' }}>
                <i className="fas fa-coins"></i> Gérer les points
              </h3>
              <button onClick={closeModals} style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}>
                <i className="fas fa-times" style={{ fontSize: '18px' }}></i>
              </button>
            </div>
            <form onSubmit={handleAttributePoints} style={{ padding: '30px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  <i className="fas fa-exchange-alt" style={{ marginRight: '8px', color: 'var(--primary-color)' }}></i>
                  Type d'opération
                </label>
                <select
                  value={pointsData.type}
                  onChange={(e) => setPointsData({...pointsData, type: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                >
                  <option value="add" style={{ background: '#1e272e', color: '#fff' }}>➕ Ajouter des points</option>
                  <option value="remove" style={{ background: '#1e272e', color: '#fff' }}>➖ Retirer des points</option>
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  <i className="fas fa-hashtag" style={{ marginRight: '8px', color: 'var(--primary-color)' }}></i>
                  Nombre de points
                </label>
                <input
                  type="number"
                  min="1"
                  value={pointsData.points}
                  onChange={(e) => setPointsData({...pointsData, points: parseInt(e.target.value)})}
                  required
                  placeholder="Ex: 500"
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  <i className="fas fa-comment-dots" style={{ marginRight: '8px', color: 'var(--primary-color)' }}></i>
                  Raison
                </label>
                <textarea
                  value={pointsData.reason}
                  onChange={(e) => setPointsData({...pointsData, reason: e.target.value})}
                  required
                  placeholder="Ex: Action écologique complétée"
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                ></textarea>
              </div>
              <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                <button type="button" onClick={closeModals} style={{
                  flex: 1,
                  padding: '14px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}>
                  Annuler
                </button>
                <button type="submit" style={{
                  flex: 1,
                  padding: '14px',
                  background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                }}>
                  <i className="fas fa-check"></i> Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <div className="modal" style={{display: 'block', background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)'}} onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content" style={{
            maxWidth: '450px',
            background: 'linear-gradient(135deg, rgba(30, 39, 46, 0.98) 0%, rgba(45, 52, 54, 0.98) 100%)',
            borderRadius: '20px',
            padding: '0',
            border: confirmAction.type === 'approve'
              ? '2px solid rgba(45, 149, 97, 0.4)'
              : '2px solid rgba(201, 75, 75, 0.4)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              background: confirmAction.type === 'approve'
                ? 'linear-gradient(135deg, #2d9561, #28a68a)'
                : 'linear-gradient(135deg, #c94b4b, #b84855)',
              padding: '25px 30px',
              borderRadius: '18px 18px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '18px', fontWeight: '700' }}>
                <i className={confirmAction.type === 'approve' ? 'fas fa-check-circle' : 'fas fa-times-circle'}></i>
                {confirmAction.title}
              </h3>
              <button onClick={() => setShowConfirmModal(false)} style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}>
                <i className="fas fa-times" style={{ fontSize: '16px' }}></i>
              </button>
            </div>
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text-primary)', marginBottom: '30px' }}>
                {confirmAction.message}
              </p>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button type="button" onClick={() => setShowConfirmModal(false)} style={{
                  flex: 1,
                  padding: '14px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}>
                  Annuler
                </button>
                <button type="button" onClick={confirmAction.onConfirm} style={{
                  flex: 1,
                  padding: '14px',
                  background: confirmAction.type === 'approve'
                    ? 'linear-gradient(135deg, #2d9561, #28a68a)'
                    : 'linear-gradient(135deg, #c94b4b, #b84855)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: confirmAction.type === 'approve'
                    ? '0 4px 15px rgba(45, 149, 97, 0.4)'
                    : '0 4px 15px rgba(201, 75, 75, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = confirmAction.type === 'approve'
                    ? '0 6px 20px rgba(45, 149, 97, 0.6)'
                    : '0 6px 20px rgba(201, 75, 75, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = confirmAction.type === 'approve'
                    ? '0 4px 15px rgba(45, 149, 97, 0.4)'
                    : '0 4px 15px rgba(201, 75, 75, 0.4)';
                }}>
                  <i className={confirmAction.type === 'approve' ? 'fas fa-check' : (confirmAction.type === 'delete' ? 'fas fa-trash' : 'fas fa-times')}></i>
                  {confirmAction.type === 'approve' ? 'Valider' : (confirmAction.type === 'delete' ? 'Supprimer' : 'Refuser')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileTeamsTab;
