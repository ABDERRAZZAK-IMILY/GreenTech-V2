import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';

export default function GPSMapCard({ currentPosition }) {
  console.log('GPSMapCard.web.js loaded - Web version');
  console.log('Current position:', currentPosition);

  return (
    <View style={styles.trackingCard}>
      <View style={styles.cardHeader}>
        <Ionicons name="map" size={18} color={colors.accent} />
        <Text style={styles.cardHeaderText}>Carte GPS (Version Web)</Text>
      </View>
      <View style={styles.mapPlaceholder}>
        <Ionicons name="location" size={48} color={colors.accent} />
        <Text style={styles.placeholderText}>Carte GPS disponible sur mobile</Text>
        <Text style={styles.locationText}>{currentPosition.address}</Text>
        <Text style={styles.speedText}>{currentPosition.speed} km/h</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  trackingCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardHeaderText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  mapPlaceholder: {
    height: 250,
    borderRadius: 12,
    backgroundColor: 'rgba(42, 157, 111, 0.1)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  locationText: {
    fontSize: 13,
    color: colors.textPrimary,
    marginTop: 4,
  },
  speedText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
