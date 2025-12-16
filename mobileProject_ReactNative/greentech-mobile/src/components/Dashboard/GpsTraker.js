import styles from '../../styles/DashboardStyle';
import {
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../styles/colors';
import { useEffect, useRef, useState } from 'react';
import { checkGPSEnabled, findVehivle, getCurrentPosition, requestLocationPermissions, sendPositionToBackend, startBackgroundTracking, stopBackgroundTracking } from '../../services/LocaltionService';
import { API_CONFIG } from './../../config/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GpsTraker = () => {
    const [isTracking, setIsTracking] = useState(false);
    const [statusMsg, setStatusMsg] = useState('Prêt à démarrer');
    const [isLoading, setIsLoading] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [gpsEnabled, setGpsEnabled] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [sendCount, setSendCount] = useState(0);
    const [totalDistance, setTotalDistance] = useState(0);
    const [currentPosition, setCurrentPosition] = useState(null);
    const [sendStatus, setSendStatus] = useState('idle');
    const [error, setError] = useState(null);


    // Référence pour l'intervalle
    const trackingIntervalRef = useRef(null);

    useEffect(() => {
        initializeApp();
        return () => {
            // Nettoyage à la fermeture
            if (trackingIntervalRef.current) {
                clearInterval(trackingIntervalRef.current);
            }
        };
    }, []);

    const toggleTracking = () => {
        if (isTracking) {
            setIsTracking(false);
            setStatusMsg('Suivi arrêté');
        } else {
            setIsTracking(true);
        }
    };

    const initializeApp = async () => {
        setIsLoading(true);
        setError(null);

        // Vérifier le GPS
        const gpsStatus = await checkGPSEnabled();
        
        
        setGpsEnabled(gpsStatus);
        if (!gpsStatus) {
            setError('Le GPS est désactivé. Veuillez l\'activer dans les paramètres.');
            setIsLoading(false);
            return;
        }
        
        // Demander les permissions
        const permResult = await requestLocationPermissions();
        
        if (!permResult.success) {
            setError(permResult.error);
            setIsLoading(false);
            return;
        }
        
        setPermissionGranted(true);
        
        // Obtenir la position initiale
        try {
            const position = await getCurrentPosition();
            setCurrentPosition(position);
            setLastUpdate(new Date());
        } catch (err) {
            console.log('Position initiale non disponible:', err.message);
        }
        
        setIsLoading(false);
    };

    const startTracking = async () => {
        if (!permissionGranted) {
            const permResult = await requestLocationPermissions();
            if (!permResult.success) {
                setError(permResult.error);
                return;
            }
            setPermissionGranted(true);
        }

        setIsTracking(true);
        setError(null);
        setSendCount(0);
        setTotalDistance(0);

        // Démarrer le tracking en background si possible
        await startBackgroundTracking();

        // Tracking en foreground avec intervalle
        trackingIntervalRef.current = setInterval(async () => {
            await updateAndSendPosition();
        }, API_CONFIG.SEND_INTERVAL);

        // Première mise à jour immédiate
        await updateAndSendPosition();
    };
    // Arrêter le tracking
    const stopTracking = async () => {
        setIsTracking(false);

        // Arrêter l'intervalle foreground
        if (trackingIntervalRef.current) {
            clearInterval(trackingIntervalRef.current);
            trackingIntervalRef.current = null;
        }

        // Arrêter le tracking background
        await stopBackgroundTracking();

        setSendStatus('idle');
    };


    const updateAndSendPosition = async () => {
        try {
            setSendStatus('sending');

            // Obtenir la position actuelle
            const position = await getCurrentPosition();
            setCurrentPosition(position);
            setLastUpdate(new Date());
            const userId = await AsyncStorage.getItem('userId');
            const vehicule  = await findVehivle(userId);
            console.log(vehicule);
            

            // Envoyer au backend et récupérer les stats
            const response = await sendPositionToBackend(position.latitude, position.longitude,vehicule.id);

            // Mettre à jour la distance totale depuis la réponse du backend
            if (response && response.totalDistance !== undefined) {
                setTotalDistance(response.totalDistance);
            }

            setSendStatus('success');
            setSendCount(prev => prev + 1);
            setError(null);

            // Remettre le statut à idle après 2 secondes
            setTimeout(() => {
                setSendStatus('idle');
            }, 2000);

        } catch (err) {
            console.error('Erreur tracking:', err);
            setSendStatus('error');
            setError('Erreur de connexion au serveur');
        }
    };
    const renderSendStatus = () => {
        let statusColor, statusText, statusIcon;

        switch (sendStatus) {
            case 'sending':
                statusColor = colors.warning;
                statusText = 'Envoi en cours...';
                statusIcon = '📡';
                break;
            case 'success':
                statusColor = colors.success;
                statusText = 'Position envoyée';
                statusIcon = '✓';
                break;
            case 'error':
                statusColor = colors.error;
                statusText = 'Erreur d\'envoi';
                statusIcon = '✗';
                break;
            default:
                statusColor = colors.textSecondary;
                statusText = 'En attente';
                statusIcon = '○';
        }

        return (
            <View style={[styles.statusIndicator, { borderColor: statusColor }]}>
                <Text style={[styles.statusIcon, { color: statusColor }]}>{statusIcon}</Text>
                <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
            </View>
        );
    };



    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={colors.background} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.accent} />
                    <Text style={styles.loadingText}>Initialisation...</Text>
                </View>
            </SafeAreaView>
        );
    }



    return (
        <View style={styles.trackingCard}>
            <View style={styles.trackingHeader}>
                <Ionicons name="car-sport" size={24} color={colors.accent} />
                <Text style={styles.trackingTitle}>Mode Conducteur</Text>
            </View>

            <Text style={styles.statusText}>{statusMsg}</Text>

            <TouchableOpacity
                style={[styles.trackButton, isTracking ? styles.stopBtn : styles.startBtn]}
                onPress={isTracking ? stopTracking : startTracking}
            >
                <Ionicons name={isTracking ? "stop-circle" : "play-circle"} size={24} color="white" />
                <Text style={styles.btnText}>
                    {isTracking ? "Arrêter le trajet" : "Commencer le trajet"}
                </Text>
            </TouchableOpacity>
        </View>
    )
}

export default GpsTraker