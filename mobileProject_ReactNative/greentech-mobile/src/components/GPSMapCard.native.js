import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import colors from '../styles/colors';

export default function GPSMapCard({ currentPosition }) {
  console.log('GPSMapCard.native.js loaded - Native version');
  console.log('Current position:', currentPosition);

  return (
    <View style={styles.trackingCard}>
      <View style={styles.cardHeader}>
        <Ionicons name="map" size={18} color={colors.accent} />
        <Text style={styles.cardHeaderText}>Carte GPS (Version Native)</Text>
      </View>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: currentPosition.lat,
            longitude: currentPosition.lng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker
            coordinate={{
              latitude: currentPosition.lat,
              longitude: currentPosition.lng,
            }}
            title="Position Actuelle"
            description={`${currentPosition.address} - ${currentPosition.speed} km/h`}
            pinColor={colors.accent}
          />
        </MapView>
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
  mapContainer: {
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
