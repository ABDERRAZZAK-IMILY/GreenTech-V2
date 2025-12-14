import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Alert } from 'react-native';

const WS_URL = "ws://192.168.1.5:8080/ws/location";
const LOCATION_TASK_NAME = 'background-location-task';

let websocket = null;
let currentUserId = null;
let currentVehicleType = null;
let statusCallback = null;

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Task Manager Error:', error);
    return;
  }
  if (data) {
    const { locations } = data;
    const location = locations[0];
    
    if (location && websocket && websocket.readyState === WebSocket.OPEN) {
      sendLocationToWebSocket(location);
    }
  }
});

export const startTracking = async (userId, vehicleType, onStatusChange) => {
  currentUserId = userId;
  currentVehicleType = vehicleType;
  statusCallback = onStatusChange;

  const foreground = await Location.requestForegroundPermissionsAsync();
  if (foreground.status !== 'granted') {
    Alert.alert('Permission refusée', 'La localisation est nécessaire.');
    return;
  }

  const background = await Location.requestBackgroundPermissionsAsync();
  if (background.status !== 'granted') {
    console.log("Background permission not granted, tracking might stop when app is closed.");
  }

  updateStatus("Connexion au serveur WebSocket...");
  
  setupWebSocket();
};

const setupWebSocket = () => {
  if (websocket) {
    websocket.close();
  }

  websocket = new WebSocket(WS_URL);

  websocket.onopen = async () => {
    updateStatus("Connecté. Démarrage du GPS...");
    
    await startLocationUpdates();
  };

  websocket.onerror = (error) => {
    console.error("WS Error:", error);
    updateStatus("Erreur de connexion serveur");
  };

  websocket.onclose = () => {
    updateStatus("Déconnecté du serveur");
  };
};

const startLocationUpdates = async () => {
  const isTaskDefined = await TaskManager.isTaskDefined(LOCATION_TASK_NAME);
  
  if (!isTaskDefined) {
    console.log("Task not defined, defining now...");
  }

  const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  
  if (hasStarted) {
    console.log("Tracking déjà actif");
    return;
  }

  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.High,
    timeInterval: 2000,
    distanceInterval: 5,
    deferredUpdatesInterval: 1000,
    foregroundService: {
      notificationTitle: "GreenTech Tracking",
      notificationBody: "Suivi de votre trajet écologique en cours...",
      notificationColor: "#2d9561",
    },
    showsBackgroundLocationIndicator: true,
  });
};

const sendLocationToWebSocket = (location) => {
  if (!currentUserId) return;

  const payload = {
    userId: currentUserId,
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    vehicleType: currentVehicleType,
    timestamp: new Date().toISOString()
  };

  try {
    websocket.send(JSON.stringify(payload));
    updateStatus(`Position envoyée: ${payload.latitude.toFixed(4)}, ${payload.longitude.toFixed(4)}`);
  } catch (e) {
    console.error("Send Error", e);
  }
};

export const stopTracking = async () => {
  try {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (hasStarted) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }

    if (websocket) {
      websocket.close();
      websocket = null;
    }
    
    updateStatus("Tracking arrêté");
  } catch (error) {
    console.error("Stop Error:", error);
  }
};

const updateStatus = (msg) => {
  if (statusCallback) statusCallback(msg);
  console.log(`[LocationService]: ${msg}`);
};

export default {
  startTracking,
  stopTracking
};