import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';
import MarketplaceService from '../services/marketplaceService';
import { useFocusEffect } from '@react-navigation/native';
import GamificationService from '../services/GamificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserService from '../services/userService';
export default function MarketplaceScreen() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ecoCoins, setEcoCoins] = useState(0);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [successVisible, setSuccessVisible] = useState(false);
  const filters = [
    { id: 'all', label: 'Tout', icon: '✨' },
    { id: 'ECO_PRODUCTS', label: 'Éco-Produits', icon: '♻️' },
    { id: 'ENERGY_SAVING', label: 'Énergie', icon: '💡' },
    { id: 'BENEFITS', label: 'Avantages', icon: '🎁' },
  ];

  const fetchData = async () => {
    try {
      if (!refreshing) setLoading(true);

      const userId = await AsyncStorage.getItem('userId');

      if (!userId) {
        console.error("Aucun ID utilisateur trouvé");
        return;
      }

      const [userProfile, productsData, ordersData] = await Promise.all([
        UserService.getUserProfile(userId),
        MarketplaceService.getAllProducts(),
        MarketplaceService.getMyOrders(),
      ]);
      console.log("✅ Données utilisateur chargées:", ordersData);

      if (userProfile) {
        console.log("💰 Solde chargé depuis UserService:", userProfile.totalPoints);
        setEcoCoins(userProfile.totalPoints || 0);
        setUser({
          name: userProfile.name,
          email: userProfile.email
        });
      }

      setAvailableProducts(productsData);
      setPurchaseHistory(ordersData.map(order => ({
        id: order.id,
        productName: order.productName,
        costInPoints: order.cost,
        date: order.orderDate,
        status: order.status.toLowerCase(),
        icon: productsData.find(p => p.id === order.productId)?.emoji || '📦',
      })));

    } catch (error) {
      console.error("Erreur Marketplace:", error);
      Alert.alert("Erreur", "Impossible de charger les données");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  // --- 3. Gestion des cycles de vie ---

  useFocusEffect(
    useCallback(() => {
      fetchData();
      return;
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);


  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return colors.success;
      case 'pending': return '#f59e0b';
      case 'rejected': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const filteredProducts = activeFilter === 'all'
    ? availableProducts
    : availableProducts.filter(p => p.category === activeFilter);

  const handlePurchase = (product) => {
    const cost = product.costInPoints;

    if (ecoCoins < cost) {
      Alert.alert("Solde insuffisant", `Il vous manque ${cost - ecoCoins} points.`);
      return;
    }

    setSelectedProduct(product);
    setModalVisible(true);
  };

  const confirmPurchase = async () => {
    if (!selectedProduct) return;

    setModalVisible(false);
    setLoading(true);

    try {
      const orderRequest = { productId: selectedProduct.id };
      await MarketplaceService.createOrder(orderRequest);
      await fetchData();

      setLoading(false);
      setSuccessVisible(true);

    } catch (error) {
      setLoading(false);
      console.error("❌ Erreur API :", error);
      Alert.alert("Oups !", "Une erreur est survenue lors de l'achat.");
    } finally {
      setSelectedProduct(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'rejected': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Approuvé';
      case 'pending': return 'En attente';
      case 'rejected': return 'Refusé';
      default: return status;
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Chargement de la boutique...</Text>
      </View>
    );
  }


  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Balance */}
      <View style={styles.header}>
        <View style={styles.welcome}>
          <Text style={styles.welcomeTitle}>Boutique de Récompenses</Text>
          <Text style={styles.welcomeSubtitle}>Échangez vos Eco-Coins contre des récompenses exclusives</Text>
        </View>
        <View style={styles.balanceCard}>
          <View style={styles.balanceIcon}>
            <Ionicons name="wallet" size={24} color={colors.accent} />
          </View>
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>Mon Solde</Text>
            <Text style={styles.balanceAmount}>
              {ecoCoins.toLocaleString()} <Text style={styles.balanceUnit}>Eco-Coins</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {filters.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[styles.filterBtn, activeFilter === filter.id && styles.filterBtnActive]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <Text style={styles.filterIcon}>{filter.icon}</Text>
              <Text style={[styles.filterLabel, activeFilter === filter.id && styles.filterLabelActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products Grid */}
      <View style={styles.productsSection}>
        {filteredProducts.map((product, index) => {
          const canAfford = ecoCoins >= product.costInPoints;

          return (
            <View
              key={product.id}
              style={[
                styles.productCard,
                !canAfford && styles.productCardDisabled
              ]}
            >
              {product.badge && (
                <View style={[styles.productBadge, { backgroundColor: product.badgeColor }]}>
                  <Text style={styles.badgeText}>{product.badge}</Text>
                </View>
              )}
              <Text style={styles.productIcon}>{product.emoji}</Text>
              <View style={styles.productContent}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productDescription} numberOfLines={2}>{product.description}</Text>
                <View style={styles.productFooter}>
                  <View style={styles.productCost}>
                    <Ionicons name="wallet" size={14} color="#feca57" />
                    <Text style={styles.costText}>{product.costInPoints.toLocaleString()}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.purchaseBtn, !canAfford && styles.purchaseBtnDisabled]}
                    onPress={() => handlePurchase(product)}
                    disabled={!canAfford}
                  >
                    <Ionicons
                      name={canAfford ? "cart" : "lock-closed"}
                      size={13}
                      color={canAfford ? "#fff" : "rgba(255,255,255,0.5)"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* Purchase History Section */}
      <View style={styles.historySection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitle}>
            <Ionicons name="time" size={20} color={colors.accent} />
            <Text style={styles.sectionTitleText}>Historique des Achats</Text>
          </View>
          <View style={styles.historyCount}>
            <Text style={styles.historyCountText}>{purchaseHistory.length} demandes</Text>
          </View>
        </View>

        {purchaseHistory.length === 0 ? (
          <View style={styles.emptyHistory}>
            <Ionicons name="cart-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyHistoryText}>Aucun achat pour le moment</Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {purchaseHistory.map(item => (
              <View key={item.id} style={styles.historyItem}>
                <View style={styles.historyItemLeft}>
                  <Text style={styles.historyIcon}>{item.icon}</Text>
                  <View style={styles.historyItemInfo}>
                    <Text style={styles.historyProductName}>{item.productName}</Text>
                    <View style={styles.historyMeta}>
                      <View style={styles.historyCost}>
                        <Ionicons name="wallet" size={12} color="#feca57" />
                        <Text style={styles.historyCostText}>{item.costInPoints.toLocaleString()} Coins</Text>
                      </View>
                      <Text style={styles.historyDate}>
                        {new Date(item.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20`, borderColor: getStatusColor(item.status) }]}>
                  <Ionicons name={getStatusIcon(item.status)} size={12} color={getStatusColor(item.status)} />
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {getStatusText(item.status)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={{ height: 20 }} />
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirmer l'achat</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Body */}
            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                Êtes-vous sûr de vouloir échanger
                <Text style={{ fontWeight: 'bold', color: colors.accent }}> {selectedProduct?.costInPoints} points </Text>
                contre
                <Text style={{ fontWeight: 'bold', color: '#fff' }}> "{selectedProduct?.name}" </Text> ?
              </Text>
              <Text style={styles.modalSubText}>Cette action débitera votre solde immédiatement.</Text>
            </View>

            {/* Buttons */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnCancelText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnConfirm}
                onPress={confirmPurchase}
              >
                <Ionicons name="checkmark-circle" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.btnConfirmText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={successVisible}
        onRequestClose={() => setSuccessVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContainer}>

            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-done" size={48} color="#fff" />
            </View>

            <Text style={styles.successTitle}>Félicitations ! 🎉</Text>

            <Text style={styles.successMessage}>
              Votre commande a été validée avec succès. Vous recevrez bientôt votre récompense.
            </Text>

            <TouchableOpacity
              style={styles.btnSuccess}
              onPress={() => setSuccessVisible(false)}
            >
              <Text style={styles.btnSuccessText}>Génial !</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </ScrollView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  welcome: {
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  balanceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(42, 157, 111, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  balanceUnit: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  filtersContainer: {
    paddingVertical: 16,
  },
  filters: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  filterBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterIcon: {
    fontSize: 16,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterLabelActive: {
    color: '#fff',
  },
  productsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    position: 'relative',
    width: '48%',
    marginBottom: 12,
  },
  productCardLeft: {
  },
  productCardDisabled: {
    opacity: 0.6,
  },
  productBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  productIcon: {
    fontSize: 40,
    marginBottom: 10,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  productContent: {
    gap: 6,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  productDescription: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  productCost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  costText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  purchaseBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    backgroundColor: colors.accent,
    borderRadius: 8,
  },
  purchaseBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  historySection: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  historyCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  historyCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyHistoryText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 14,
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  historyIcon: {
    fontSize: 32,
  },
  historyItemInfo: {
    flex: 1,
  },
  historyProductName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyCost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyCostText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  historyDate: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    backgroundColor: colors.accent,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  modalBody: {
    padding: 24,
    alignItems: 'center',
  },
  modalText: {
    color: '#e2e8f0',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  modalSubText: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  btnCancelText: {
    color: '#cbd5e1',
    fontWeight: '600',
    fontSize: 15,
  },
  btnConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  btnConfirmText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  successModalContainer: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.2)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: colors.success,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: -10,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  btnSuccess: {
    backgroundColor: colors.success,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  btnSuccessText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  }
});
