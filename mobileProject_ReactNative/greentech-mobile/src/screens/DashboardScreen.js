import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { employeeData } from '../data/employeeData';
import colors from '../styles/colors';
import { startTracking, stopTracking } from '../services/LocationService';

export default function DashboardScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isTracking, setIsTracking] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Prêt à démarrer');

  useEffect(() => {
    return () => stopTracking();
  }, []);

  const toggleTracking = () => {
    if (isTracking) {
      stopTracking();
      setIsTracking(false);
      setStatusMsg('Suivi arrêté');
    } else {
      setIsTracking(true);
      startTracking('USER-001', setStatusMsg); 
    }
  };

  const progressPercentage = (employeeData.currentPoints / employeeData.nextLevelPoints) * 100;
  const rankPercentage = ((employeeData.totalEmployees - employeeData.rank) / employeeData.totalEmployees) * 100;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.welcome}>
          <Text style={styles.welcomeTitle}>Bonjour, {employeeData.name} 👋</Text>
          <Text style={styles.welcomeSubtitle}>Continuez vos actions écologiques !</Text>
        </View>
      </View>

      <View style={styles.trackingCard}>
        <View style={styles.trackingHeader}>
          <Ionicons name="car-sport" size={24} color={colors.accent} />
          <Text style={styles.trackingTitle}>Mode Conducteur</Text>
        </View>
        
        <Text style={styles.statusText}>{statusMsg}</Text>

        <TouchableOpacity 
          style={[styles.trackButton, isTracking ? styles.stopBtn : styles.startBtn]} 
          onPress={toggleTracking}
        >
          <Ionicons name={isTracking ? "stop-circle" : "play-circle"} size={24} color="white" />
          <Text style={styles.btnText}>
            {isTracking ? "Arrêter le trajet" : "Commencer le trajet"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Level Card */}
      <View style={styles.levelCard}>
        <View style={styles.levelInfo}>
          <View style={styles.levelBadge}>
            <Ionicons name="star" size={20} color={colors.accent} />
            <Text style={styles.levelText}>Niveau {employeeData.level}</Text>
          </View>
          <Text style={styles.levelPoints}>
            {employeeData.currentPoints} / {employeeData.nextLevelPoints} points
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {/* First Row: Points & Rank */}
        <View style={styles.statsRow}>
          {/* Points Card */}
          <View style={styles.statCard}>
            <LinearGradient
              colors={colors.gradients.gold}
              style={styles.statIcon}
            >
              <Ionicons name="wallet" size={24} color="#fff" />
            </LinearGradient>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Mes Points</Text>
              <Text style={styles.statValue}>{employeeData.currentPoints.toLocaleString()}</Text>
              <Text style={styles.statSubtitle}>Points disponibles</Text>
            </View>
          </View>

          {/* Rank Card */}
          <View style={styles.statCard}>
            <LinearGradient
              colors={colors.gradients.purple}
              style={styles.statIcon}
            >
              <Ionicons name="trophy" size={24} color="#fff" />
            </LinearGradient>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Classement</Text>
              <Text style={styles.statValue}>#{employeeData.rank}</Text>
              <Text style={styles.statSubtitle}>Top {Math.round(rankPercentage)}%</Text>
            </View>
          </View>
        </View>

        {/* Second Row: CO2 Impact (full width) */}
        <View style={[styles.statCard, styles.largeCard]}>
          <LinearGradient
            colors={colors.gradients.green}
            style={styles.statIcon}
          >
            <Ionicons name="leaf" size={24} color="#fff" />
          </LinearGradient>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Mon Impact CO2</Text>
            <Text style={styles.statValue}>{employeeData.co2Saved} kg</Text>
            <Text style={styles.statSubtitle}>CO2 économisé</Text>
            <View style={styles.equivalents}>
              <View style={styles.equivalentItem}>
                <Ionicons name="leaf-outline" size={14} color={colors.accent} />
                <Text style={styles.equivalentText}>{Math.round(employeeData.co2Saved / 22)} arbres plantés</Text>
              </View>
              <View style={styles.equivalentItem}>
                <Ionicons name="car-outline" size={14} color={colors.accent} />
                <Text style={styles.equivalentText}>{Math.round(employeeData.co2Saved / 0.12)} km évités</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Badges Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitle}>
            <Ionicons name="medal" size={20} color={colors.accent} />
            <Text style={styles.sectionTitleText}>Mes Badges</Text>
          </View>
          <View style={styles.badgeCount}>
            <Text style={styles.badgeCountText}>
              {employeeData.badges.filter(b => b.unlocked).length} / {employeeData.badges.length}
            </Text>
          </View>
        </View>
        <View style={styles.badgesGrid}>
          {employeeData.badges.map(badge => (
            <View
              key={badge.id}
              style={[styles.badgeItem, !badge.unlocked && styles.badgeLocked]}
            >
              <Text style={styles.badgeIcon}>{badge.icon}</Text>
              <Text style={styles.badgeName}>{badge.name}</Text>
              {!badge.unlocked && (
                <Ionicons name="lock-closed" size={12} color="rgba(255,255,255,0.3)" style={styles.lockIcon} />
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Transport Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitle}>
            <Ionicons name="car" size={20} color={colors.accent} />
            <Text style={styles.sectionTitleText}>Statistiques Transport</Text>
          </View>
        </View>
        <View style={styles.transportGrid}>
          {/* First Row: Distance & Fuel */}
          <View style={styles.transportRow}>
            <View style={styles.transportCard}>
              <Text style={styles.transportLabel}>Distance Parcourue</Text>
              <Text style={styles.transportValue}>{employeeData.transport.kmTotal} km</Text>
              <View style={styles.transportDetail}>
                <Ionicons name="checkmark-circle" size={14} color={colors.accent} />
                <Text style={styles.transportDetailText}>
                  {employeeData.transport.kmEcoDrive} km éco
                </Text>
              </View>
            </View>

            <View style={styles.transportCard}>
              <Text style={styles.transportLabel}>Carburant</Text>
              <Text style={styles.transportValue}>{employeeData.transport.fuelConsumed} L</Text>
              <View style={styles.transportDetail}>
                <Ionicons name="water" size={14} color={colors.textSecondary} />
                <Text style={styles.transportDetailText}>
                  {(employeeData.transport.fuelConsumed / employeeData.transport.kmTotal * 100).toFixed(1)} L/100km
                </Text>
              </View>
            </View>
          </View>

          {/* Second Row: CO2 (full width) */}
          <View style={[styles.transportCard, styles.transportHighlight, styles.transportFullWidth]}>
            <Text style={styles.transportLabel}>CO2 Transport</Text>
            <Text style={styles.transportValue}>{employeeData.transport.co2Transport} kg</Text>
            <View style={styles.transportComparison}>
              <Text style={styles.comparisonLabel}>Moyenne entreprise</Text>
              <Text style={styles.comparisonValue}>{employeeData.transport.avgCompany} kg</Text>
              <View style={styles.comparisonBadge}>
                <Ionicons name="arrow-down" size={12} color={colors.accent} />
                <Text style={styles.comparisonText}>
                  {Math.round((1 - employeeData.transport.co2Transport / employeeData.transport.avgCompany) * 100)}% moins
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Performance Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitle}>
            <Ionicons name="stats-chart" size={20} color={colors.accent} />
            <Text style={styles.sectionTitleText}>Mon Évolution</Text>
          </View>
          <View style={styles.periodSelector}>
            {['week', 'month', 'year'].map(period => (
              <TouchableOpacity
                key={period}
                style={[styles.periodBtn, selectedPeriod === period && styles.periodBtnActive]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text style={[styles.periodBtnText, selectedPeriod === period && styles.periodBtnTextActive]}>
                  {period === 'week' ? 'Semaine' : period === 'month' ? 'Mois' : 'Année'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.performanceGrid}>
          {/* First Row */}
          <View style={styles.performanceRow}>
            <View style={styles.performanceItem}>
              <View style={[styles.perfIcon, { backgroundColor: '#feca57' }]}>
                <Ionicons name="wallet" size={20} color="#fff" />
              </View>
              <View style={styles.perfData}>
                <Text style={styles.perfLabel}>Points Gagnés</Text>
                <Text style={styles.perfValue}>{employeeData.stats[selectedPeriod].points}</Text>
              </View>
            </View>
            <View style={styles.performanceItem}>
              <View style={[styles.perfIcon, { backgroundColor: colors.accent }]}>
                <Ionicons name="leaf" size={20} color="#fff" />
              </View>
              <View style={styles.perfData}>
                <Text style={styles.perfLabel}>CO2 Économisé</Text>
                <Text style={styles.perfValue}>{employeeData.stats[selectedPeriod].co2} kg</Text>
              </View>
            </View>
          </View>
          {/* Second Row */}
          <View style={styles.performanceItem}>
            <View style={[styles.perfIcon, { backgroundColor: '#667eea' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
            </View>
            <View style={styles.perfData}>
              <Text style={styles.perfLabel}>Actions Réalisées</Text>
              <Text style={styles.perfValue}>{employeeData.stats[selectedPeriod].actions}</Text>
            </View>
          </View>
        </View>
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
  levelCard: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
  },
  levelPoints: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 10,
  },
  statsGrid: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  largeCard: {
    width: '100%',
    flexDirection: 'row',
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  rankProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  rankBar: {
    flex: 1,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  rankFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 10,
  },
  rankPercentage: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent,
  },
  equivalents: {
    gap: 8,
    marginTop: 10,
  },
  equivalentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  equivalentText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  section: {
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
  badgeCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  badgeCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeItem: {
    width: '30%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  badgeLocked: {
    opacity: 0.5,
    borderColor: colors.cardBorder,
  },
  badgeIcon: {
    fontSize: 36,
  },
  badgeName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  lockIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  transportGrid: {
    gap: 12,
  },
  transportRow: {
    flexDirection: 'row',
    gap: 12,
  },
  transportCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 16,
  },
  transportFullWidth: {
    flex: 'none',
    width: '100%',
  },
  transportHighlight: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(42, 157, 111, 0.1)',
  },
  transportLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  transportValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  transportDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  transportDetailText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  transportComparison: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  comparisonLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  comparisonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(42, 157, 111, 0.2)',
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  comparisonText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 4,
    borderRadius: 10,
  },
  periodBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  periodBtnActive: {
    backgroundColor: colors.accent,
  },
  periodBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  periodBtnTextActive: {
    color: colors.textPrimary,
  },
  performanceGrid: {
    gap: 12,
  },
  performanceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  performanceItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 14,
  },
  perfIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perfData: {
    alignItems: 'center',
  },
  perfLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
    textAlign: 'center',
  },
  perfValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  // Tracking Card Styles
  trackingCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trackingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  trackingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: colors.textPrimary,
  },
  statusText: {
    textAlign: 'center',
    marginBottom: 20,
    color: colors.textSecondary,
    fontStyle: 'italic',
    fontSize: 14,
  },
  trackButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
  },
  startBtn: {
    backgroundColor: '#2ecc71',
  },
  stopBtn: {
    backgroundColor: '#e74c3c',
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
});
