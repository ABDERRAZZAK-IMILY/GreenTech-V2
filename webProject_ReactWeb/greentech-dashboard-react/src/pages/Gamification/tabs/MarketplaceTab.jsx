import React, { useState, useEffect } from 'react';
import { showNotification } from '../../../utils/notifications';
import marketplaceService from '../../../services/marketplaceService';
import authService from '../../../services/authService';

const MarketplaceTab = () => {
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('userRole') === 'admin'); 
  const [loading, setLoading] = useState(true);

  // States
  const [products, setProducts] = useState([]);
  const [purchaseRequests, setPurchaseRequests] = useState([]); // This represents Orders
  const [employeeExchanges, setEmployeeExchanges] = useState([]); // For KPIs

  // Modal & UI States
  const [activeSubTab, setActiveSubTab] = useState('exchanges');
  const [exchangeSortBy, setExchangeSortBy] = useState('pointsSpent');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Form state
  const [productForm, setProductForm] = useState({
    name: '',
    emoji: '🎁',
    description: '',
    cost: 0,
    category: 'rewards',
    badge: '',
    stock: 100,
    imageUrl: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

 const fetchData = async () => {
    try {
      setLoading(true);
      
      const productsData = await marketplaceService.getAllProducts();
      setProducts(productsData || []);

      const currentUserRole = localStorage.getItem('userRole'); 
      const isUserAdmin = currentUserRole === 'ADMIN' || currentUserRole === 'admin';
      setIsAdmin(isUserAdmin);

      if (isUserAdmin) {
        const ordersData = await marketplaceService.getAllOrders();
        
        const formattedOrders = ordersData.map(order => ({
            id: order.id,
            memberId: order.userId,
            memberName: order.userName || 'Utilisateur', 
            product: order.productName,
            
            cost: order.costAtPurchase || order.cost || 0, 
            
            date: new Date(order.orderDate).toLocaleString('fr-FR'),
            status: order.status,
            category: order.category || 'Autre' 
        }));
        
        setPurchaseRequests(formattedOrders.filter(o => o.status === 'PENDING'));
        
        const completed = formattedOrders.filter(o => o.status === 'APPROVED');
        processExchangesStats(completed);

      } else {
        const user = authService.getCurrentUser();
        if (user && user.id) {
            const myOrders = await marketplaceService.getMyOrders(); 
            setPurchaseRequests(myOrders.map(order => ({
                ...order,
                cost: order.costAtPurchase || order.cost || 0, 
                date: new Date(order.orderDate).toLocaleString('fr-FR')
            })));
        }
      }
    } catch (error) {
      console.error("Error fetching marketplace data", error);
      showNotification('Erreur de chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const processExchangesStats = (completedOrders) => {
      const statsMap = {};
      
      completedOrders.forEach(order => {
          if (!statsMap[order.memberName]) {
              statsMap[order.memberName] = {
                  id: order.memberId,
                  employeeName: order.memberName,
                  department: 'General',
                  totalExchanges: 0,
                  pointsSpent: 0,
                  lastExchange: order.product,
                  lastDate: order.date,
                  categories: {}
              };
          }
          const emp = statsMap[order.memberName];
          emp.totalExchanges += 1;
          emp.pointsSpent += order.cost;
          emp.categories[order.category] = (emp.categories[order.category] || 0) + 1;
      });

      const processedExchanges = Object.values(statsMap).map(emp => {
          const favCategory = Object.keys(emp.categories).reduce((a, b) => emp.categories[a] > emp.categories[b] ? a : b, 'None');
          return { ...emp, favoriteCategory: favCategory };
      });

      setEmployeeExchanges(processedExchanges);
  };

  // --- Handlers ---

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await marketplaceService.createProduct({
          name: productForm.name,
          description: productForm.description,
          costInPoints: productForm.cost,
          category: productForm.category,
          stockQuantity: parseInt(productForm.stock) || 100,
          imageUrl: productForm.imageUrl,
          isActive: true
      });
      showNotification('Produit ajouté avec succès !', 'success');
      setShowAddProductModal(false);
      setProductForm({ name: '', emoji: '🎁', description: '', cost: 0, category: 'rewards', badge: '', stock: 100, imageUrl: '' });
      fetchData(); // Refresh list
    } catch (error) {
      showNotification('Erreur lors de l\'ajout', 'error');
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      await marketplaceService.updateProduct(selectedProduct.id, {
          name: productForm.name,
          description: productForm.description,
          costInPoints: productForm.cost,
          category: productForm.category,
          stockQuantity: parseInt(productForm.stock) || selectedProduct.stockQuantity || 100,
          imageUrl: productForm.imageUrl,
          isActive: selectedProduct.isActive !== undefined ? selectedProduct.isActive : true
      });
      showNotification('Produit modifié avec succès !', 'success');
      setShowEditProductModal(false);
      setSelectedProduct(null);
      fetchData(); // Refresh
    } catch (error) {
      showNotification('Erreur lors de la modification', 'error');
    }
  };

  const handleDeleteProduct = (productId) => {
    const product = products.find(p => p.id === productId);
    setConfirmAction({
      type: 'delete',
      title: 'Supprimer le produit',
      message: `Êtes-vous sûr de vouloir supprimer "${product.name}" ?`,
      onConfirm: async () => {
        try {
          await marketplaceService.deleteProduct(productId);
          showNotification(`Le produit a été supprimé`, 'success');
          setShowConfirmModal(false);
          setConfirmAction(null);
          fetchData(); // Refresh
        } catch (error) {
           showNotification('Erreur lors de la suppression', 'error');
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleToggleActive = async (productId) => {
      const product = products.find(p => p.id === productId);
      try {
          await marketplaceService.updateProduct(productId, { ...product, active: !product.active });
          fetchData();
      } catch (error) {
          console.error(error);
      }
  };

  // Purchase request handlers
  const handleApprovePurchase = (requestId) => {
    const request = purchaseRequests.find(r => r.id === requestId);
    setConfirmAction({
      type: 'approve',
      title: 'Valider la demande',
      message: `Voulez-vous valider la demande de ${request.memberName} ?`,
      onConfirm: async () => {
        try {
            await marketplaceService.updateOrderStatus(requestId, 'APPROVED');
            showNotification(`Demande approuvée !`, 'success');
            setShowConfirmModal(false);
            setConfirmAction(null);
            fetchData();
        } catch (error) {
            showNotification('Erreur lors de la validation', 'error');
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleRejectPurchase = (requestId) => {
    const request = purchaseRequests.find(r => r.id === requestId);
    setConfirmAction({
      type: 'reject',
      title: 'Refuser la demande',
      message: `Voulez-vous refuser la demande ?`,
      onConfirm: async () => {
        try {
            await marketplaceService.updateOrderStatus(requestId, 'REJECTED');
            showNotification(`Demande refusée`, 'success');
            setShowConfirmModal(false);
            setConfirmAction(null);
            fetchData();
        } catch (error) {
            showNotification('Erreur', 'error');
        }
      }
    });
    setShowConfirmModal(true);
  };

  // Helper functions like openEditModal, closeModals remain the same...
  const openEditModal = (product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      emoji: product.emoji || '🎁',
      description: product.description,
      cost: product.cost,
      category: product.category,
      badge: product.badge,
      stock: product.stock,
      imageUrl: product.imageUrl || ''
    });
    setShowEditProductModal(true);
  };

  const closeModals = () => {
    setShowAddProductModal(false);
    setShowEditProductModal(false);
    setShowConfirmModal(false);
    setSelectedProduct(null);
    setConfirmAction(null);
    setProductForm({ name: '', emoji: '🎁', description: '', cost: 0, category: 'rewards', badge: '', stock: 100, imageUrl: '' });
  };

  // Sorting Logic (Keep existing logic but handle empty data)
  const sortedExchanges = [...employeeExchanges].sort((a, b) => {
    if (exchangeSortBy === 'pointsSpent') return b.pointsSpent - a.pointsSpent;
    if (exchangeSortBy === 'totalExchanges') return b.totalExchanges - a.totalExchanges;
    if (exchangeSortBy === 'recent') return new Date(b.lastDate) - new Date(a.lastDate);
    return 0;
  });

  // Calculate KPIs (Handle empty arrays safely)
  const totalPointsSpent = employeeExchanges.reduce((sum, emp) => sum + emp.pointsSpent, 0);
  const totalExchanges = employeeExchanges.reduce((sum, emp) => sum + emp.totalExchanges, 0);
  const avgPointsPerEmployee = employeeExchanges.length > 0 ? Math.round(totalPointsSpent / employeeExchanges.length) : 0;
  const topSpender = employeeExchanges.length > 0 ? employeeExchanges.reduce((max, emp) => emp.pointsSpent > max.pointsSpent ? emp : max, employeeExchanges[0]) : { employeeName: 'N/A', pointsSpent: 0 };

  // Calculate most popular product
  const productCounts = {};
  employeeExchanges.forEach(emp => {
    const product = emp.lastExchange;
    productCounts[product] = (productCounts[product] || 0) + 1;
  });
  
  let mostPopularProduct = "Aucun";
  if (Object.keys(productCounts).length > 0) {
      mostPopularProduct = Object.keys(productCounts).reduce((a, b) => productCounts[a] > productCounts[b] ? a : b);
  }

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        color: 'var(--text-secondary)' 
      }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', marginRight: '12px' }}></i>
        <span style={{ fontSize: '16px' }}>Chargement des données...</span>
      </div>
    );
  }

  return (
    <div className="marketplace-tab">

      {/* ADMIN VIEW - Analytics KPIs */}
      <div className="admin-statistics-section" style={{
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '25px',
        marginBottom: '30px',
        border: '1px solid rgba(102, 126, 234, 0.3)'
      }}>
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fas fa-chart-line"></i> Statistiques du Marketplace
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          {/* Total Points Spent */}
          <div className="stat-box" style={{
            background: 'rgba(118, 75, 162, 0.25)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            border: '1px solid rgba(118, 75, 162, 0.4)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#a78bfa', marginBottom: '5px' }}>
              {totalPointsSpent.toLocaleString()}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Points Totaux Dépensés</div>
          </div>

          {/* Total Exchanges */}
          <div className="stat-box" style={{
            background: 'rgba(67, 233, 123, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            border: '1px solid rgba(67, 233, 123, 0.3)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎁</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#5cdb95', marginBottom: '5px' }}>
              {totalExchanges}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Échanges Totaux</div>
          </div>

          {/* Average per Employee */}
          <div className="stat-box" style={{
            background: 'rgba(250, 177, 160, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            border: '1px solid rgba(250, 177, 160, 0.3)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#fab1a0', marginBottom: '5px' }}>
              {avgPointsPerEmployee.toLocaleString()}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Moyenne par Employé</div>
          </div>

          {/* Top Spender */}
          <div className="stat-box" style={{
            background: 'rgba(254, 202, 87, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            border: '1px solid rgba(254, 202, 87, 0.3)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏆</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#feca57', marginBottom: '2px' }}>
              {topSpender.employeeName}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {topSpender.pointsSpent.toLocaleString()} points dépensés
            </div>
          </div>

          {/* Most Popular Product */}
          <div className="stat-box" style={{
            background: 'rgba(255, 107, 107, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            border: '1px solid rgba(255, 107, 107, 0.3)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔥</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#ff6b6b', marginBottom: '2px' }}>
              {mostPopularProduct}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Produit le Plus Populaire
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '30px',
        borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '0'
      }}>
        <button
          onClick={() => setActiveSubTab('exchanges')}
          style={{
            flex: 1,
            padding: '14px 20px',
            background: activeSubTab === 'exchanges'
              ? 'linear-gradient(135deg, var(--primary-color), var(--accent-color))'
              : 'transparent',
            border: 'none',
            borderBottom: activeSubTab === 'exchanges'
              ? '3px solid var(--accent-color)'
              : '3px solid transparent',
            borderRadius: '12px 12px 0 0',
            color: activeSubTab === 'exchanges' ? 'white' : 'var(--text-secondary)',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: activeSubTab === 'exchanges'
              ? '0 4px 12px rgba(42, 157, 111, 0.4)'
              : 'none'
          }}
          onMouseEnter={(e) => {
            if (activeSubTab !== 'exchanges') {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeSubTab !== 'exchanges') {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }
          }}
        >
          <i className="fas fa-exchange-alt"></i>
          Historique des Échanges
        </button>

        <button
          onClick={() => setActiveSubTab('requests')}
          style={{
            flex: 1,
            padding: '14px 20px',
            background: activeSubTab === 'requests'
              ? 'linear-gradient(135deg, var(--primary-color), var(--accent-color))'
              : 'transparent',
            border: 'none',
            borderBottom: activeSubTab === 'requests'
              ? '3px solid var(--accent-color)'
              : '3px solid transparent',
            borderRadius: '12px 12px 0 0',
            color: activeSubTab === 'requests' ? 'white' : 'var(--text-secondary)',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            position: 'relative',
            boxShadow: activeSubTab === 'requests'
              ? '0 4px 12px rgba(42, 157, 111, 0.4)'
              : 'none'
          }}
          onMouseEnter={(e) => {
            if (activeSubTab !== 'requests') {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeSubTab !== 'requests') {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }
          }}
        >
          <i className="fas fa-shopping-cart"></i>
          Demandes en Attente
          {purchaseRequests.length > 0 && (
            <span style={{
              background: '#ff6b6b',
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
              {purchaseRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('products')}
          style={{
            flex: 1,
            padding: '14px 20px',
            background: activeSubTab === 'products'
              ? 'linear-gradient(135deg, var(--primary-color), var(--accent-color))'
              : 'transparent',
            border: 'none',
            borderBottom: activeSubTab === 'products'
              ? '3px solid var(--accent-color)'
              : '3px solid transparent',
            borderRadius: '12px 12px 0 0',
            color: activeSubTab === 'products' ? 'white' : 'var(--text-secondary)',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: activeSubTab === 'products'
              ? '0 4px 12px rgba(42, 157, 111, 0.4)'
              : 'none'
          }}
          onMouseEnter={(e) => {
            if (activeSubTab !== 'products') {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeSubTab !== 'products') {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }
          }}
        >
          <i className="fas fa-gift"></i>
          Gestion des Récompenses
        </button>
      </div>

      {/* ADMIN VIEW - Employee Exchanges Table */}
      {activeSubTab === 'exchanges' && (
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
            <i className="fas fa-exchange-alt"></i> Historique des Échanges par Employé
          </h3>

          {/* Sort Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              { id: 'pointsSpent', label: '💰 Top Dépensiers', icon: 'fa-coins' },
              { id: 'totalExchanges', label: '🔢 Plus d\'Échanges', icon: 'fa-exchange-alt' },
              { id: 'recent', label: '⏱️ Plus Récents', icon: 'fa-clock' }
            ].map(sort => (
              <button
                key={sort.id}
                onClick={() => setExchangeSortBy(sort.id)}
                style={{
                  background: exchangeSortBy === sort.id
                    ? 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))'
                    : 'rgba(255, 255, 255, 0.08)',
                  border: exchangeSortBy === sort.id
                    ? 'none'
                    : '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '700',
                  transition: 'all 0.3s ease',
                  boxShadow: exchangeSortBy === sort.id
                    ? '0 4px 12px rgba(102, 126, 234, 0.4)'
                    : 'none'
                }}
                onMouseEnter={(e) => {
                  if (exchangeSortBy !== sort.id) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (exchangeSortBy !== sort.id) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  }
                }}
              >
                {sort.label}
              </button>
            ))}
          </div>
        </div>

        {/* Exchanges Table */}
        <div style={{
          maxHeight: '400px',
          overflowY: 'auto',
          overflowX: 'auto',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{
                background: 'rgba(30, 39, 46, 0.98)',
                position: 'sticky',
                top: 0,
                zIndex: 1
              }}>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)', fontWeight: '700', fontSize: '13px' }}>
                  <i className="fas fa-trophy" style={{ marginRight: '8px', color: '#feca57' }}></i>Rang
                </th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)', fontWeight: '700', fontSize: '13px' }}>
                  <i className="fas fa-user" style={{ marginRight: '8px', color: 'var(--primary-color)' }}></i>Employé
                </th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)', fontWeight: '700', fontSize: '13px' }}>
                  <i className="fas fa-building" style={{ marginRight: '8px', color: 'var(--primary-color)' }}></i>Département
                </th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid rgba(255, 255, 255, 0.1)', fontWeight: '700', fontSize: '13px' }}>
                  <i className="fas fa-coins" style={{ marginRight: '8px', color: '#feca57' }}></i>Points Dépensés
                </th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid rgba(255, 255, 255, 0.1)', fontWeight: '700', fontSize: '13px' }}>
                  <i className="fas fa-exchange-alt" style={{ marginRight: '8px', color: '#43e97b' }}></i>Nb Échanges
                </th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)', fontWeight: '700', fontSize: '13px' }}>
                  <i className="fas fa-gift" style={{ marginRight: '8px', color: '#fab1a0' }}></i>Dernier Échange
                </th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid rgba(255, 255, 255, 0.1)', fontWeight: '700', fontSize: '13px' }}>
                  <i className="fas fa-calendar" style={{ marginRight: '8px', color: 'var(--secondary-color)' }}></i>Date
                </th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)', fontWeight: '700', fontSize: '13px' }}>
                  <i className="fas fa-heart" style={{ marginRight: '8px', color: '#ff6b6b' }}></i>Catégorie Favorite
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedExchanges.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    <i className="fas fa-inbox" style={{ fontSize: '48px', marginBottom: '12px', display: 'block', opacity: 0.5 }}></i>
                    Aucun échange enregistré pour le moment
                  </td>
                </tr>
              ) : (
              sortedExchanges.map((exchange, index) => (
                <tr key={exchange.id} style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '15px', textAlign: 'left' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: index === 0
                        ? 'linear-gradient(135deg, #feca57, #ff9f40)'
                        : index === 1
                        ? 'linear-gradient(135deg, #c0c0c0, #a8a8a8)'
                        : index === 2
                        ? 'linear-gradient(135deg, #cd7f32, #b8860b)'
                        : 'rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '14px'
                    }}>
                      {index + 1}
                    </div>
                  </td>
                  <td style={{ padding: '15px', fontWeight: '600' }}>{exchange.employeeName}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{
                      background: 'rgba(102, 126, 234, 0.2)',
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {exchange.department}
                    </span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center', fontWeight: '700', color: '#feca57' }}>
                    {exchange.pointsSpent.toLocaleString()}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center', fontWeight: '700', color: '#43e97b' }}>
                    {exchange.totalExchanges}
                  </td>
                  <td style={{ padding: '15px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {exchange.lastExchange}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center', fontSize: '13px' }}>
                    {new Date(exchange.lastDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: '15px' }}>
                    <span style={{
                      background: exchange.favoriteCategory === 'Primes'
                        ? 'rgba(254, 202, 87, 0.2)'
                        : exchange.favoriteCategory === 'Récompenses'
                        ? 'rgba(67, 233, 123, 0.2)'
                        : 'rgba(250, 177, 160, 0.2)',
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {exchange.favoriteCategory}
                    </span>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* ADMIN VIEW - Purchase Requests Table */}
      {activeSubTab === 'requests' && (
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '25px',
        marginBottom: '30px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h3 style={{ margin: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fas fa-shopping-cart"></i> Demandes d'achat en attente
          <span style={{
            background: 'rgba(255, 107, 107, 0.2)',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '700',
            color: '#ff6b6b'
          }}>
            {purchaseRequests.length}
          </span>
        </h3>

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
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Employé</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Produit</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Coût</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchaseRequests.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    <i className="fas fa-check-circle" style={{ fontSize: '48px', marginBottom: '12px', display: 'block', opacity: 0.5, color: '#43e97b' }}></i>
                    Aucune demande en attente
                  </td>
                </tr>
              ) : (
              purchaseRequests.map(request => (
                <tr key={request.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '12px' }}>{request.memberName}</td>
                  <td style={{ padding: '12px' }}>{request.product}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ color: 'var(--accent-color)', fontWeight: '600' }}>
                      {request.cost} <i className="fas fa-coins" style={{ fontSize: '12px' }}></i>
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{request.date}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleApprovePurchase(request.id)}
                      style={{
                        background: 'rgba(67, 233, 123, 0.2)',
                        border: '1px solid #43e97b',
                        color: '#43e97b',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        marginRight: '8px',
                        fontSize: '13px'
                      }}
                    >
                      <i className="fas fa-check"></i> Valider
                    </button>
                    <button
                      onClick={() => handleRejectPurchase(request.id)}
                      style={{
                        background: 'rgba(255, 107, 107, 0.2)',
                        border: '1px solid #ff6b6b',
                        color: '#ff6b6b',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      <i className="fas fa-times"></i> Refuser
                    </button>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* ADMIN SECTION - Product Management */}
      {activeSubTab === 'products' && isAdmin && (
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
              <i className="fas fa-gift"></i> Administration - Gestion des Récompenses
            </h3>
            <button
              onClick={() => setShowAddProductModal(true)}
              style={{
                background: 'linear-gradient(135deg, #2d9561, #28a68a)',
                color: 'white',
                border: 'none',
                padding: '11px 22px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(45, 149, 97, 0.35)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(45, 149, 97, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 149, 97, 0.35)';
              }}
            >
              <i className="fas fa-plus-circle" style={{ fontSize: '15px' }}></i>
              Ajouter un produit
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
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Produit</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Catégorie</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Coût</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Stock</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Badge</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Statut</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                      <i className="fas fa-gift" style={{ fontSize: '48px', marginBottom: '12px', display: 'block', opacity: 0.5 }}></i>
                      Aucun produit disponible
                    </td>
                  </tr>
                ) : (
                products.map(product => (
                  <tr key={product.id} style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    opacity: product.active ? 1 : 0.5
                  }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '24px' }}>{product.emoji}</span>
                        <div>
                          <div style={{ fontWeight: '600' }}>{product.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        background: product.category === 'rewards' ? 'rgba(102, 126, 234, 0.2)' :
                                   product.category === 'perks' ? 'rgba(254, 202, 87, 0.2)' :
                                   'rgba(67, 233, 123, 0.2)',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {product.category === 'rewards' ? 'Récompense' :
                         product.category === 'perks' ? 'Prime' : 'Avantage'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ color: 'var(--accent-color)', fontWeight: '700' }}>
                        {product.cost} <i className="fas fa-coins" style={{ fontSize: '12px' }}></i>
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{product.stock}</td>
                    <td style={{ padding: '12px' }}>
                      {product.badge && (
                        <span style={{
                          background: 'rgba(240, 147, 251, 0.2)',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          color: '#f093fb'
                        }}>
                          {product.badge}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleToggleActive(product.id)}
                        style={{
                          background: product.active
                            ? 'linear-gradient(135deg, #2d9561, #28a68a)'
                            : 'linear-gradient(135deg, #c94b4b, #b84855)',
                          border: 'none',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '700',
                          boxShadow: product.active
                            ? '0 3px 10px rgba(45, 149, 97, 0.3)'
                            : '0 3px 10px rgba(201, 75, 75, 0.3)',
                          transition: 'all 0.3s ease',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = product.active
                            ? '0 5px 15px rgba(45, 149, 97, 0.5)'
                            : '0 5px 15px rgba(201, 75, 75, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = product.active
                            ? '0 3px 10px rgba(45, 149, 97, 0.3)'
                            : '0 3px 10px rgba(201, 75, 75, 0.3)';
                        }}
                      >
                        <i className={product.active ? 'fas fa-check-circle' : 'fas fa-times-circle'}></i>
                        {product.active ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                          onClick={() => openEditModal(product)}
                          title="Modifier"
                          style={{
                            background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                            border: 'none',
                            color: 'white',
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 3px 8px rgba(79, 172, 254, 0.35)',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 5px 12px rgba(79, 172, 254, 0.5)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 3px 8px rgba(79, 172, 254, 0.35)';
                          }}
                        >
                          <i className="fas fa-pen"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          title="Supprimer"
                          style={{
                            background: 'linear-gradient(135deg, #ff6b6b, #ee5a6f)',
                            border: 'none',
                            color: 'white',
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 3px 8px rgba(255, 107, 107, 0.35)',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 5px 12px rgba(255, 107, 107, 0.5)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 3px 8px rgba(255, 107, 107, 0.35)';
                          }}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODALS */}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }} onClick={closeModals}>
          <div style={{
            maxWidth: '650px',
            width: '100%',
            background: 'linear-gradient(135deg, rgba(30, 39, 46, 0.98) 0%, rgba(45, 52, 54, 0.98) 100%)',
            borderRadius: '20px',
            padding: '0',
            border: '2px solid rgba(45, 149, 97, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              background: 'linear-gradient(135deg, #2d9561, #28a68a)',
              padding: '25px 30px',
              borderRadius: '18px 18px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '20px', fontWeight: '700' }}>
                <i className="fas fa-plus-circle"></i> Ajouter un produit
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
            <form onSubmit={handleAddProduct} style={{ padding: '30px' }}>
              {/* Nom du produit */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  <i className="fas fa-tag" style={{ marginRight: '8px', color: '#2d9561' }}></i>
                  Nom du produit
                </label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  required
                  placeholder="Ex: Bon d'achat Jumia 1200MAD"
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
                  onFocus={(e) => e.target.style.borderColor = '#2d9561'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                />
              </div>

              {/* Emoji et Description */}
              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    <i className="fas fa-smile" style={{ marginRight: '8px', color: '#2d9561' }}></i>
                    Emoji
                  </label>
                  <select
                    value={productForm.emoji}
                    onChange={(e) => setProductForm({...productForm, emoji: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      height: '70px',
                      padding: '12px 15px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: 'var(--text-primary)',
                      fontSize: '16px',
                      textAlign: 'left',
                      transition: 'all 0.3s ease',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2d9561'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  >
                    <option value="" style={{ background: '#1e272e', color: '#fff' }}>Choisir...</option>
                    <option value="🎁" style={{ background: '#1e272e', color: '#fff' }}>🎁 Cadeau</option>
                    <option value="💰" style={{ background: '#1e272e', color: '#fff' }}>💰 Argent</option>
                    <option value="🏠" style={{ background: '#1e272e', color: '#fff' }}>🏠 Maison</option>
                    <option value="🅿️" style={{ background: '#1e272e', color: '#fff' }}>🅿️ Parking</option>
                    <option value="☕" style={{ background: '#1e272e', color: '#fff' }}>☕ Café</option>
                    <option value="🍽️" style={{ background: '#1e272e', color: '#fff' }}>🍽️ Restaurant</option>
                    <option value="🏕️" style={{ background: '#1e272e', color: '#fff' }}>🏕️ Camping</option>
                    <option value="🚴" style={{ background: '#1e272e', color: '#fff' }}>🚴 Vélo</option>
                    <option value="🎓" style={{ background: '#1e272e', color: '#fff' }}>🎓 Formation</option>
                    <option value="🧘" style={{ background: '#1e272e', color: '#fff' }}>🧘 Yoga</option>
                    <option value="🏋️" style={{ background: '#1e272e', color: '#fff' }}>🏋️ Sport</option>
                    <option value="🎮" style={{ background: '#1e272e', color: '#fff' }}>🎮 Jeux</option>
                    <option value="📚" style={{ background: '#1e272e', color: '#fff' }}>📚 Livres</option>
                    <option value="🎬" style={{ background: '#1e272e', color: '#fff' }}>🎬 Cinéma</option>
                    <option value="🎵" style={{ background: '#1e272e', color: '#fff' }}>🎵 Musique</option>
                    <option value="✈️" style={{ background: '#1e272e', color: '#fff' }}>✈️ Voyage</option>
                    <option value="🌿" style={{ background: '#1e272e', color: '#fff' }}>🌿 Nature</option>
                    <option value="🌍" style={{ background: '#1e272e', color: '#fff' }}>🌍 Écologie</option>
                    <option value="⚡" style={{ background: '#1e272e', color: '#fff' }}>⚡ Énergie</option>
                    <option value="🏆" style={{ background: '#1e272e', color: '#fff' }}>🏆 Trophée</option>
                    <option value="⭐" style={{ background: '#1e272e', color: '#fff' }}>⭐ Étoile</option>
                    <option value="💎" style={{ background: '#1e272e', color: '#fff' }}>💎 Diamant</option>
                    <option value="🎯" style={{ background: '#1e272e', color: '#fff' }}>🎯 Objectif</option>
                    <option value="🔥" style={{ background: '#1e272e', color: '#fff' }}>🔥 Feu</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    <i className="fas fa-align-left" style={{ marginRight: '8px', color: '#2d9561' }}></i>
                    Description
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    required
                    placeholder="Description courte du produit"
                    rows="2"
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
                    onFocus={(e) => e.target.style.borderColor = '#2d9561'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  ></textarea>
                </div>
              </div>

              {/* Coût et Catégorie */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    <i className="fas fa-coins" style={{ marginRight: '8px', color: '#2d9561' }}></i>
                    Coût (Eco-Coins)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={productForm.cost}
                    onChange={(e) => setProductForm({...productForm, cost: parseInt(e.target.value)})}
                    required
                    placeholder="2000"
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
                    onFocus={(e) => e.target.style.borderColor = '#2d9561'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    <i className="fas fa-list" style={{ marginRight: '8px', color: '#2d9561' }}></i>
                    Catégorie
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
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
                    onFocus={(e) => e.target.style.borderColor = '#2d9561'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  >
                    <option value="rewards" style={{ background: '#1e272e', color: '#fff' }}>🎁 Récompense</option>
                    <option value="perks" style={{ background: '#1e272e', color: '#fff' }}>💰 Prime</option>
                    <option value="benefits" style={{ background: '#1e272e', color: '#fff' }}>⭐ Avantage</option>
                  </select>
                </div>
              </div>

              {/* Badge et Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    <i className="fas fa-award" style={{ marginRight: '8px', color: '#2d9561' }}></i>
                    Badge (optionnel)
                  </label>
                  <input
                    type="text"
                    value={productForm.badge}
                    onChange={(e) => setProductForm({...productForm, badge: e.target.value})}
                    placeholder="Ex: Populaire, Premium"
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
                    onFocus={(e) => e.target.style.borderColor = '#2d9561'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    <i className="fas fa-boxes" style={{ marginRight: '8px', color: '#2d9561' }}></i>
                    Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({...productForm, stock: parseInt(e.target.value) || 0})}
                    required
                    placeholder="100"
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
                    onFocus={(e) => e.target.style.borderColor = '#2d9561'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  />
                </div>
              </div>

              {/* Boutons */}
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
                  background: 'linear-gradient(135deg, #2d9561, #28a68a)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(45, 149, 97, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(45, 149, 97, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(45, 149, 97, 0.4)';
                }}>
                  <i className="fas fa-plus-circle"></i> Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProductModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }} onClick={closeModals}>
          <div style={{
            maxWidth: '650px',
            width: '100%',
            background: 'linear-gradient(135deg, rgba(30, 39, 46, 0.98) 0%, rgba(45, 52, 54, 0.98) 100%)',
            borderRadius: '20px',
            padding: '0',
            border: '2px solid rgba(79, 172, 254, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
              padding: '25px 30px',
              borderRadius: '18px 18px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '20px', fontWeight: '700', color: 'white' }}>
                <i className="fas fa-pen"></i> Modifier le produit
              </h3>
              <button
                onClick={closeModals}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'rotate(90deg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'rotate(0deg)';
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleEditProduct} style={{ padding: '30px' }}>
              {/* Nom du produit */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                  <i className="fas fa-tag" style={{ marginRight: '8px', color: '#4facfe' }}></i>
                  Nom du produit
                </label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '2px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#4facfe'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
                />
              </div>

              {/* Emoji and Description */}
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                    <i className="fas fa-smile" style={{ marginRight: '8px', color: '#4facfe' }}></i>
                    Emoji
                  </label>
                  <input
                    type="text"
                    value={productForm.emoji}
                    onChange={(e) => setProductForm({...productForm, emoji: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '2px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box',
                      textAlign: 'center'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#4facfe'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                    <i className="fas fa-align-left" style={{ marginRight: '8px', color: '#4facfe' }}></i>
                    Description
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    required
                    rows="2"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '2px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#4facfe'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
                  ></textarea>
                </div>
              </div>

              {/* Coût and Catégorie */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                    <i className="fas fa-coins" style={{ marginRight: '8px', color: '#4facfe' }}></i>
                    Coût (Eco-Coins)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={productForm.cost}
                    onChange={(e) => setProductForm({...productForm, cost: parseInt(e.target.value)})}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '2px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#4facfe'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                    <i className="fas fa-th-large" style={{ marginRight: '8px', color: '#4facfe' }}></i>
                    Catégorie
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '2px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#4facfe'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
                  >
                    <option value="rewards" style={{ background: '#1e272e', color: 'white' }}>🎁 Récompense</option>
                    <option value="perks" style={{ background: '#1e272e', color: 'white' }}>💰 Prime</option>
                    <option value="benefits" style={{ background: '#1e272e', color: 'white' }}>⭐ Avantage</option>
                  </select>
                </div>
              </div>

              {/* Badge and Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                    <i className="fas fa-certificate" style={{ marginRight: '8px', color: '#4facfe' }}></i>
                    Badge (optionnel)
                  </label>
                  <input
                    type="text"
                    value={productForm.badge}
                    onChange={(e) => setProductForm({...productForm, badge: e.target.value})}
                    placeholder="Ex: Populaire, Premium..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '2px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#4facfe'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                    <i className="fas fa-box" style={{ marginRight: '8px', color: '#4facfe' }}></i>
                    Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({...productForm, stock: parseInt(e.target.value) || 0})}
                    required
                    placeholder="100"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '2px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#4facfe'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
                  />
                </div>
              </div>

              {/* URL Image */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                  <i className="fas fa-image" style={{ marginRight: '8px', color: '#4facfe' }}></i>
                  URL Image (optionnel)
                </label>
                <input
                  type="url"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({...productForm, imageUrl: e.target.value})}
                  placeholder="https://exemple.com/image.jpg"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '2px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#4facfe'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
                />
              </div>

              {/* Form Actions */}
              <div style={{ display: 'flex', gap: '12px', paddingTop: '10px' }}>
                <button
                  type="button"
                  onClick={closeModals}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    padding: '13px 24px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <i className="fas fa-times"></i>
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                    border: 'none',
                    color: 'white',
                    padding: '13px 24px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '700',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(79, 172, 254, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(79, 172, 254, 0.4)';
                  }}
                >
                  <i className="fas fa-save"></i>
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }} onClick={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.98)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '450px',
            width: '100%',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              textAlign: 'center',
              marginBottom: '25px'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #c94b4b, #b84855)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '36px',
                color: 'white',
                boxShadow: '0 10px 30px rgba(201, 75, 75, 0.3)'
              }}>
                <i className="fas fa-trash"></i>
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '12px',
                color: 'white'
              }}>
                {confirmAction.title}
              </h3>
              <p style={{
                fontSize: '15px',
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: '1.6',
                margin: 0
              }}>
                {confirmAction.message}
              </p>
            </div>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                }}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <i className="fas fa-times" style={{ marginRight: '8px' }}></i>
                Annuler
              </button>
              <button
                onClick={confirmAction.onConfirm}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #c94b4b, #b84855)',
                  border: 'none',
                  color: 'white',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  boxShadow: '0 4px 15px rgba(201, 75, 75, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(201, 75, 75, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(201, 75, 75, 0.3)';
                }}
              >
                <i className="fas fa-trash"></i> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceTab;
