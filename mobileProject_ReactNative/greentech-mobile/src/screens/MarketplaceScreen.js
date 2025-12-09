import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { products, filters } from '../data/products';
import { useEmployee } from '../contexts/EmployeeContext';
import colors from '../styles/colors';

export default function MarketplaceScreen() {
  const [activeFilter, setActiveFilter] = useState('all');
  const { ecoCoins, deductEcoCoins, purchaseHistory, addPurchaseToHistory } = useEmployee();

  const filteredProducts = activeFilter === 'all'
    ? products
    : products.filter(p => p.category === activeFilter);

  const handlePurchase = (product) => {
    if (ecoCoins < product.cost) {
      Alert.alert(
        'Solde insuffisant',
        `Il vous manque ${product.cost - ecoCoins} Eco-Coins pour cet achat.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Confirmer l\'achat',
      `Voulez-vous échanger ${product.cost.toLocaleString()} Eco-Coins contre "${product.name}"?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => {
            deductEcoCoins(product.cost);
            addPurchaseToHistory(product);
            Alert.alert(
              'Demande envoyée!',
              'Votre demande d\'achat a été envoyée pour validation par un administrateur.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return colors.success;
      case 'pending': return '#f59e0b';
      case 'rejected': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'rejected': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'approved': return 'Approuvé';
      case 'pending': return 'En attente';
      case 'rejected': return 'Refusé';
      default: return status;
    }
  };

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
          const canAfford = ecoCoins >= product.cost;

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
              <Text style={styles.productIcon}>{product.icon}</Text>
              <View style={styles.productContent}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productDescription} numberOfLines={2}>{product.description}</Text>
                <View style={styles.productFooter}>
                  <View style={styles.productCost}>
                    <Ionicons name="wallet" size={14} color="#feca57" />
                    <Text style={styles.costText}>{product.cost.toLocaleString()}</Text>
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
                        <Text style={styles.historyCostText}>{item.cost.toLocaleString()} Coins</Text>
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
    fontSize: 36,
    marginBottom: 10,
    textAlign: 'center',
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
});
