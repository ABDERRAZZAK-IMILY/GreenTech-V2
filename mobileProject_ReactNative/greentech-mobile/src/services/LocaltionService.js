import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { API_CONFIG } from './../config/api';



const LOCATION_TASK_NAME = 'BACKGROUND_LOCATION_TASK';



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
