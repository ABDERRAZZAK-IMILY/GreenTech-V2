import React, { useState, useEffect } from 'react';
import './EmployeeRewards.css';
import { useLoading } from '../../contexts/LoadingContext';
import marketplaceService from '../../services/marketplaceService';
import gamificationService from '../../services/gamificationService';

const EmployeeRewards = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for API data
  const [products, setProducts] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [userStats, setUserStats] = useState(null);

  const {
    setIsProcessingPurchase,
    setPurchaseProgress,
    setPurchaseStep,
    setPurchaseProductName
  } = useLoading();

  // Get user's current points
  const ecoCoins = userStats?.currentPoints || 0;

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [productsData, ordersData, statsData] = await Promise.all([
          marketplaceService.getAllProducts(),
          marketplaceService.getMyOrders(),
          gamificationService.getMyStats()
        ]);

        setProducts(productsData || []);
        setPurchaseHistory(ordersData || []);
        setUserStats(statsData);
      } catch (err) {
        console.error('Error fetching rewards data:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Map product icon based on category
  const getProductIcon = (product) => {
    if (product.imageUrl) return product.imageUrl;
    const icons = {
      'rewards': '🎁',
      'perks': '⭐',
      'benefits': '💎',
      'voucher': '🎫',
      'experience': '🌿',
      'premium': '💰'
    };
    return icons[product.category?.toLowerCase()] || '🎁';
  };

  // Map status to badge info
  const getStatusBadge = (product) => {
    if (product.stockQuantity <= 3 && product.stockQuantity > 0) {
      return { text: 'Stock limité', color: '#f59e0b' };
    }
    if (product.rating >= 4.5) {
      return { text: 'Populaire', color: '#3b82f6' };
    }
    if (product.costInPoints >= 5000) {
      return { text: 'Premium', color: '#8b5cf6' };
    }
    return null;
  };

  const filters = [
    { id: 'all', label: 'Tout', icon: '🌟' },
    { id: 'rewards', label: 'Récompenses', icon: '🎁' },
    { id: 'eco_products', label: 'Produits Éco', icon: '🌿' },
    { id: 'energy_saving', label: 'Économie d\'énergie', icon: '⚡' }
  ];

  // Backend already filters by isActive, no need to filter again
  const filteredProducts = activeFilter === 'all'
    ? products
    : products.filter(p => p.category?.toLowerCase() === activeFilter);

  const handlePurchase = async (product) => {
    if (ecoCoins < product.costInPoints) {
      // Show insufficient balance notification
      setPurchaseProductName(product.name);
      setIsProcessingPurchase(true);
      setPurchaseProgress(0);
      setPurchaseStep(`❌ Solde insuffisant - Il vous manque ${product.costInPoints - ecoCoins} Eco-Coins`);

      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 30));
        setPurchaseProgress(i);
      }

      setTimeout(() => {
        setIsProcessingPurchase(false);
        setPurchaseProgress(0);
        setPurchaseStep('');
        setPurchaseProductName('');
      }, 2000);
      return;
    }

    // Process purchase request
    setPurchaseProductName(product.name);
    setIsProcessingPurchase(true);
    setPurchaseProgress(0);

    try {
      // Step 1: Validation
      setPurchaseStep('Vérification du solde...');
      for (let i = 0; i <= 30; i += 3) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setPurchaseProgress(i);
      }

      // Step 2: Creating order
      setPurchaseStep('Création de la demande d\'achat...');
      for (let i = 30; i <= 60; i += 3) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setPurchaseProgress(i);
      }

      // Step 3: Send order to backend
      setPurchaseStep('Déduction des Eco-Coins...');
      await marketplaceService.createOrder({ productId: product.id });

      for (let i = 60; i <= 90; i += 3) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setPurchaseProgress(i);
      }

      // Refresh data
      const [ordersData, statsData] = await Promise.all([
        marketplaceService.getMyOrders(),
        gamificationService.getMyStats()
      ]);
      setPurchaseHistory(ordersData || []);
      setUserStats(statsData);

      // Step 4: Success
      setPurchaseStep('✅ Demande envoyée avec succès!');
      for (let i = 90; i <= 100; i += 2) {
        await new Promise(resolve => setTimeout(resolve, 30));
        setPurchaseProgress(i);
      }

      setTimeout(() => {
        setIsProcessingPurchase(false);
        setPurchaseProgress(0);
        setPurchaseStep('');
        setPurchaseProductName('');
      }, 3000);
    } catch (err) {
      console.error('Error creating order:', err);
      setPurchaseStep('❌ Erreur lors de l\'achat');
      setPurchaseProgress(100);
      
      setTimeout(() => {
        setIsProcessingPurchase(false);
        setPurchaseProgress(0);
        setPurchaseStep('');
        setPurchaseProductName('');
      }, 2000);
    }
  };

  // Loading state
  if (loading) {
    return (
      <section className="employee-rewards">
        <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', color: 'var(--accent-color)' }}></i>
            <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Chargement de la boutique...</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="employee-rewards">
        <div className="error-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <i className="fas fa-exclamation-triangle" style={{ fontSize: '48px', color: '#ef4444' }}></i>
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '16px', padding: '10px 20px', background: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Réessayer
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="employee-rewards">
      {/* Header with Balance */}
      <div className="rewards-header">
        <div className="rewards-welcome">
          <h1>Boutique de Récompenses</h1>
          <p>Échangez vos Eco-Coins contre des récompenses exclusives</p>
        </div>
        <div className="user-balance-card">
          <div className="balance-icon">
            <i className="fas fa-coins"></i>
          </div>
          <div className="balance-info">
            <div className="balance-label">Mon Solde</div>
            <div className="balance-amount">{ecoCoins.toLocaleString()} <span>Eco-Coins</span></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rewards-filters">
        {filters.map(filter => (
          <button
            key={filter.id}
            className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter.id)}
          >
            <span className="filter-icon">{filter.icon}</span>
            <span className="filter-label">{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="products-section">
        <div className="products-grid">
          {filteredProducts.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <i className="fas fa-inbox" style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}></i>
              <p>Aucun produit disponible dans cette catégorie</p>
            </div>
          ) : (
            filteredProducts.map(product => {
              const canAfford = ecoCoins >= product.costInPoints;
              const badge = getStatusBadge(product);
              const icon = getProductIcon(product);

              return (
                <div key={product.id} className={`product-card ${!canAfford ? 'disabled' : ''}`}>
                  {badge && (
                    <div className="product-badge" style={{ background: badge.color }}>
                      {badge.text}
                    </div>
                  )}
                  <div className="product-icon">{icon}</div>
                  <div className="product-content">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
                      <div className="stock-warning" style={{ color: '#f59e0b', fontSize: '12px', marginBottom: '8px' }}>
                        <i className="fas fa-exclamation-triangle"></i> Plus que {product.stockQuantity} en stock
                      </div>
                    )}
                    <div className="product-footer">
                      <div className="product-cost">
                        <i className="fas fa-coins"></i>
                        <span>{product.costInPoints.toLocaleString()} Coins</span>
                      </div>
                      <button
                        className="purchase-btn"
                        onClick={() => handlePurchase(product)}
                        disabled={!canAfford || product.stockQuantity <= 0}
                      >
                        {product.stockQuantity <= 0 ? (
                          <>
                            <i className="fas fa-ban"></i>
                            Épuisé
                          </>
                        ) : canAfford ? (
                          <>
                            <i className="fas fa-shopping-cart"></i>
                            Acheter
                          </>
                        ) : (
                          <>
                            <i className="fas fa-lock"></i>
                            Insuffisant
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Purchase History Section */}
      <div className="history-section">
        <div className="section-header">
          <h2>
            <i className="fas fa-history"></i>
            Historique des Achats
          </h2>
          <span className="history-count">{purchaseHistory.length} demandes</span>
        </div>
        <div className="history-table-container">
          {purchaseHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <i className="fas fa-shopping-bag" style={{ fontSize: '48px', marginBottom: '16px', display: 'block', opacity: 0.5 }}></i>
              <p>Aucun achat effectué pour le moment</p>
            </div>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Coût</th>
                  <th>Date</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {purchaseHistory.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className="product-cell">
                        <span className="product-name">{item.productName}</span>
                      </div>
                    </td>
                    <td>
                      <div className="cost-cell">
                        <i className="fas fa-coins"></i>
                        {(item.cost || 0).toLocaleString()} Coins
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        <i className="fas fa-calendar"></i>
                        {item.orderDate ? new Date(item.orderDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${item.status?.toLowerCase()}`}>
                        {item.status === 'APPROVED' && (
                          <>
                            <i className="fas fa-check-circle"></i>
                            Approuvé
                          </>
                        )}
                        {item.status === 'PENDING' && (
                          <>
                            <i className="fas fa-clock"></i>
                            En attente
                          </>
                        )}
                        {item.status === 'REJECTED' && (
                          <>
                            <i className="fas fa-times-circle"></i>
                            Refusé
                          </>
                        )}
                        {item.status === 'CANCELLED' && (
                          <>
                            <i className="fas fa-ban"></i>
                            Annulé
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
    </section>
  );
};

export default EmployeeRewards;
