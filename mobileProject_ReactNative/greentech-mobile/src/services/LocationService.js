import * as Location from 'expo-location';
import { Alert } from 'react-native';

const API_URL = 'http://192.168.1.5:8080/api/v1/ingest';

let locationSubscription = null;

export const startTracking = async (userId, onStatusChange) => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission refusée', 'La localisation est nécessaire pour le suivi.');
    return;
  }

  onStatusChange && onStatusChange('Démarrage du GPS...');

  locationSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 10,
    },
    (location) => {
      sendLocationToBackend(location, userId, onStatusChange);
    }
  );
};

export const stopTracking = () => {
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
  }
};

const sendLocationToBackend = async (location, userId, onStatusChange) => {
  try {
    const speedKmh = location.coords.speed ? (location.coords.speed * 3.6) : 0;

    const payload = {
      dataType: "TRANSPORT",
      value: parseFloat(speedKmh.toFixed(1)),
      unit: "km/h",
      sensorId: `DRIVER-${userId}`,
      location: "En route",
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      status: speedKmh > 1 ? "MOVING" : "IDLE"
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
        onStatusChange && onStatusChange(`Données envoyées: ${payload.latitude.toFixed(4)}, ${payload.longitude.toFixed(4)}`);
    } else {
        console.log("Erreur serveur:", response.status);
    }

  } catch (error) {
    console.error("Erreur connexion:", error);
    onStatusChange && onStatusChange("Erreur de connexion au serveur");
  }
};
