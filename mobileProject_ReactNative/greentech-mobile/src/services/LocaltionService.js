// Service de géolocalisation
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { API_CONFIG } from '../config/api';

// Nom de la tâche de background
const LOCATION_TASK_NAME = 'background-location-task';

// Définir la tâche de background pour le tracking
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
        console.error('Erreur task manager:', error);
        return;
    }
    if (data) {
        const { locations } = data;
        const location = locations[0];
        if (location) {
            try {
                await sendPositionToBackend(location.coords.latitude, location.coords.longitude);
            } catch (err) {
                console.error('Erreur envoi position background:', err);
            }
        }
    }
});

// Demander les permissions de localisation
export const requestLocationPermissions = async () => {
    try {
        // Permission foreground
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
        if (foregroundStatus !== 'granted') {
            return {
                success: false,
                error: 'Permission de localisation refusée. Veuillez autoriser l\'accès à la position.'
            };
        }

        // Permission background (pour tracking en arrière-plan)
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
            console.log('Permission background refusée - le tracking fonctionnera uniquement en foreground');
        }

        return { success: true, backgroundEnabled: backgroundStatus === 'granted' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Vérifier si le GPS est activé
export const checkGPSEnabled = async () => {
    try {
        const enabled = await Location.hasServicesEnabledAsync();
        return enabled;
    } catch (error) {
        return false;
    }
};

// Obtenir la position actuelle
export const getCurrentPosition = async () => {
    try {
        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
        });
        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            timestamp: location.timestamp,
        };
    } catch (error) {
        throw new Error('Impossible d\'obtenir la position: ' + error.message);
    }
};

// Envoyer la position au backend
export const sendPositionToBackend = async (latitude, longitude) => {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.POSITION}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                latitude,
                longitude,
                timestamp: new Date().toISOString(),
                deviceId: 'mobile-app-01', // Identifiant unique du device
            }),
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Erreur envoi position:', error);
        throw error;
    }
};

// Démarrer le tracking en background
export const startBackgroundTracking = async () => {
    try {
        const isTaskDefined = TaskManager.isTaskDefined(LOCATION_TASK_NAME);
        if (!isTaskDefined) {
            console.log('Tâche de background non définie');
            return false;
        }

        const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
        if (hasStarted) {
            console.log('Tracking background déjà actif');
            return true;
        }

        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.High,
            timeInterval: API_CONFIG.SEND_INTERVAL,
            distanceInterval: 10, // Mise à jour si déplacement de 10m
            foregroundService: {
                notificationTitle: 'GeoTrack Actif',
                notificationBody: 'Tracking de votre position en cours...',
                notificationColor: '#2a9d6f',
            },
            pausesUpdatesAutomatically: false,
            showsBackgroundLocationIndicator: true,
        });

        return true;
    } catch (error) {
        console.error('Erreur démarrage tracking background:', error);
        return false;
    }
};

// Arrêter le tracking en background
export const stopBackgroundTracking = async () => {
    try {
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
        if (hasStarted) {
            await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        }
        return true;
    } catch (error) {
        console.error('Erreur arrêt tracking background:', error);
        return false;
    }
};

export default {
    requestLocationPermissions,
    checkGPSEnabled,
    getCurrentPosition,
    sendPositionToBackend,
    startBackgroundTracking,
    stopBackgroundTracking,
};
