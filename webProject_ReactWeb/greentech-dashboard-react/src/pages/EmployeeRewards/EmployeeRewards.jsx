import React, { useState } from 'react';
import './EmployeeRewards.css';
import { useLoading } from '../../contexts/LoadingContext';
import { useEmployee } from '../../contexts/EmployeeContext';

const EmployeeRewards = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const {
    setIsProcessingPurchase,
    setPurchaseProgress,
    setPurchaseStep,
    setPurchaseProductName
  } = useLoading();

  const {
    ecoCoins,
    deductEcoCoins,
    purchaseHistory,
    addPurchaseToHistory
  } = useEmployee();

  const products = [
    {
      id: 1,
      name: "Bon d'achat Jumia",
      description: "Voucher de 1200 MAD pour vos achats en ligne",
      cost: 2000,
      category: 'rewards',
      icon: '🎁',
      badge: 'Populaire',
      badgeColor: '#3b82f6'
    },
    {
      id: 2,
      name: "Journée Télétravail Bonus",
      description: "Une journée de télétravail supplémentaire",
      cost: 1500,
      category: 'perks',
      icon: '🏠',
      badge: null,
      badgeColor: null
    },
    {
      id: 3,
      name: "Parking Premium - 1 Mois",
      description: "Accès au parking couvert pendant 1 mois",
      cost: 1000,
      category: 'benefits',
      icon: '🅿️',
      badge: null,
      badgeColor: null
    },
    {
      id: 4,
      name: "Café Gratuit - 1 Semaine",
      description: "Café et boissons chaudes offerts pendant 1 semaine",
      cost: 500,
      category: 'benefits',
      icon: '☕',
      badge: 'Meilleure affaire',
      badgeColor: '#10b981'
    },
    {
      id: 5,
      name: "Prime Verte - 1500 MAD",
      description: "Prime en espèces pour performance écologique",
      cost: 5000,
      category: 'rewards',
      icon: '💰',
      badge: 'Premium',
      badgeColor: '#f59e0b'
    },
    {
      id: 6,
      name: "Déjeuner Équipe Offert",
      description: "Déjeuner pour toute l'équipe dans un restaurant éco-responsable",
      cost: 8000,
      category: 'rewards',
      icon: '🍽️',
      badge: 'Collectif',
      badgeColor: '#8b5cf6'
    },
    {
      id: 7,
      name: "Week-end Éco-Tourisme",
      description: "Week-end découverte dans un éco-lodge au Maroc",
      cost: 12000,
      category: 'rewards',
      icon: '🌿',
      badge: 'Expérience',
      badgeColor: '#ec4899'
    }
  ];

  const filters = [
    { id: 'all', label: 'Tout', icon: '🌟' },
    { id: 'rewards', label: 'Récompenses', icon: '🎁' },
    { id: 'perks', label: 'Avantages', icon: '⭐' },
    { id: 'benefits', label: 'Bénéfices', icon: '💎' }
  ];

  const filteredProducts = activeFilter === 'all'
    ? products
    : products.filter(p => p.category === activeFilter);

  const handlePurchase = async (product) => {
    if (ecoCoins < product.cost) {
      // Show insufficient balance notification
      setPurchaseProductName(product.name);
      setIsProcessingPurchase(true);
      setPurchaseProgress(0);
      setPurchaseStep(`❌ Solde insuffisant - Il vous manque ${product.cost - ecoCoins} Eco-Coins`);

      // Simulate progress
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

    // Step 1: Validation
    setPurchaseStep('Vérification du solde...');
    for (let i = 0; i <= 30; i += 3) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setPurchaseProgress(i);
    }

    // Step 2: Creating request
    setPurchaseStep('Création de la demande d\'achat...');
    for (let i = 30; i <= 60; i += 3) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setPurchaseProgress(i);
    }

    // Step 3: Deduct coins and add to history
    setPurchaseStep('Déduction des Eco-Coins...');
    deductEcoCoins(product.cost);
    addPurchaseToHistory(product);

    for (let i = 60; i <= 90; i += 3) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setPurchaseProgress(i);
    }

    // Step 4: Success
    setPurchaseStep('✅ Demande envoyée avec succès!');
    for (let i = 90; i <= 100; i += 2) {
      await new Promise(resolve => setTimeout(resolve, 30));
      setPurchaseProgress(i);
    }

    // Hide notification after 3 seconds
    setTimeout(() => {
      setIsProcessingPurchase(false);
      setPurchaseProgress(0);
      setPurchaseStep('');
      setPurchaseProductName('');
    }, 3000);
  };

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
          {filteredProducts.map(product => {
            const canAfford = ecoCoins >= product.cost;

            return (
              <div key={product.id} className={`product-card ${!canAfford ? 'disabled' : ''}`}>
                {product.badge && (
                  <div className="product-badge" style={{ background: product.badgeColor }}>
                    {product.badge}
                  </div>
                )}
                <div className="product-icon">{product.icon}</div>
                <div className="product-content">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-footer">
                    <div className="product-cost">
                      <i className="fas fa-coins"></i>
                      <span>{product.cost.toLocaleString()} Coins</span>
                    </div>
                    <button
                      className="purchase-btn"
                      onClick={() => handlePurchase(product)}
                      disabled={!canAfford}
                    >
                      {canAfford ? (
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
          })}
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
                      <span className="product-icon">{item.icon}</span>
                      <span className="product-name">{item.productName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="cost-cell">
                      <i className="fas fa-coins"></i>
                      {item.cost.toLocaleString()} Coins
                    </div>
                  </td>
                  <td>
                    <div className="date-cell">
                      <i className="fas fa-calendar"></i>
                      {new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${item.status}`}>
                      {item.status === 'approved' && (
                        <>
                          <i className="fas fa-check-circle"></i>
                          Approuvé
                        </>
                      )}
                      {item.status === 'pending' && (
                        <>
                          <i className="fas fa-clock"></i>
                          En attente
                        </>
                      )}
                      {item.status === 'rejected' && (
                        <>
                          <i className="fas fa-times-circle"></i>
                          Refusé
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default EmployeeRewards;
