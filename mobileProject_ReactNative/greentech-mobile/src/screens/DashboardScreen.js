import React, { useState, useEffect } from 'react';
import styles from '../styles/DashboardStyle';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { employeeData } from '../data/employeeData';
import colors from '../styles/colors';
import Header from '../components/Dashboard/header';
import Level from '../components/Dashboard/Level';
import StatsGrid from '../components/Dashboard/StatsGrid';
import GpsTraker from '../components/Dashboard/GpsTraker';

export default function DashboardScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');



  

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <Header />

      <GpsTraker />

      {/* Level Card */}
      <Level />

      {/* Stats Grid */}
      <StatsGrid />

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


