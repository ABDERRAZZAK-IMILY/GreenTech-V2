import * as Location from 'expo-location';
import { Alert } from 'react-native';

const WS_URL = "ws://172.19.32.1:8080/ws/location";




let locationSubscription = null;
let websocket = null;
let intervalSender = null;

export const startTracking = async (userId, vehicleType, onStatusChange) => {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    Alert.alert('Permission refusée', 'La localisation est nécessaire pour le suivi.');
    return;
  }

  onStatusChange && onStatusChange("Connexion au serveur WebSocket...");

  websocket = new WebSocket(WS_URL);

  websocket.onopen = () => {
    onStatusChange && onStatusChange("WebSocket connecté. Démarrage du GPS...");

    // 1. Start GPS tracker (high accuracy)
    startGpsListener(userId, vehicleType, onStatusChange);
  };

  websocket.onerror = (error) => {
    console.error("WS Error:", error);
    onStatusChange && onStatusChange("Erreur WebSocket");
  };

  websocket.onclose = () => {
    onStatusChange && onStatusChange("WebSocket déconnecté");
  };
};

/* ---------------- GPS LISTENER ---------------- */

let lastLocation = null;

const startGpsListener = async (userId, vehicleType, onStatusChange) => {
  locationSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Highest,
      timeInterval: 1000,   // Fetch location every 1 sec (internal)
      distanceInterval: 0,
    },
    (location) => {
      lastLocation = location;
    }
  );

  // 2. Send data every 2 seconds regardless of GPS update timing
  intervalSender = setInterval(() => {
    if (lastLocation && websocket && websocket.readyState === WebSocket.OPEN) {
      sendLocation(lastLocation, userId, vehicleType, onStatusChange);
    }
  }, 2000);
};

/* ---------------- SEND DATA THROUGH WS ---------------- */

const sendLocation = (location, userId, vehicleType, onStatusChange) => {
  const payload = {
    userId,
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    vehicleType,
  };

  websocket.send(JSON.stringify(payload));

  onStatusChange &&
    onStatusChange(
      `Données envoyées WS: ${payload.latitude.toFixed(4)}, ${payload.longitude.toFixed(4)}`
    );
};

/* ---------------- STOP TRACKING ---------------- */

export const stopTracking = () => {
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
  }

  if (intervalSender) {
    clearInterval(intervalSender);
    intervalSender = null;
  }

  if (websocket) {
    websocket.close();
    websocket = null;
  }
};
