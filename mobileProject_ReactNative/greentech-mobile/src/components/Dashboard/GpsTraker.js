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
import TotaleTraveledDestance from '../TotaleTraveledDestance';


const GpsTraker = () => {
    const [isTracking, setIsTracking] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [isDriver, setIsDriver] = useState(false);

    // Référence pour l'intervalle
    const trackingIntervalRef = useRef(null);
    useEffect(() => {
        const checkDriver = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                const vehicule = await findVehivle(userId);
                if (vehicule) {
                    setIsDriver(true);
                } else {
                    setIsDriver(false);
                }
            } catch (error) {
                setIsDriver(false)
            }
        };
        console.log(isDriver);
        
        checkDriver();
    }, []);

    useEffect(() => {
        initializeApp();
        return () => {
            // Nettoyage à la fermeture
            if (trackingIntervalRef.current) {
                clearInterval(trackingIntervalRef.current);
            }
        };
    }, []);

    const initializeApp = async () => {
        setIsLoading(true);

        // Vérifier le GPS
        const gpsStatus = await checkGPSEnabled();
        if (!gpsStatus) {
            setIsLoading(false);
            return;
        }

        // Demander les permissions
        const permResult = await requestLocationPermissions();
        if (!permResult.success) {
            setIsLoading(false);
            return;
        }

        setPermissionGranted(true);
        setIsLoading(false);
    };

    const startTracking = async () => {
        if (!permissionGranted) {
            const permResult = await requestLocationPermissions();
            if (!permResult.success) {
                return;
            }
            setPermissionGranted(true);
        }

        setIsTracking(true);

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
    };


    const updateAndSendPosition = async () => {
        try {
            // Obtenir la position actuelle
            const position = await getCurrentPosition();
            const userId = await AsyncStorage.getItem('userId');
            const vehicule = await findVehivle(userId);
            
            // Envoyer au backend
            if (vehicule && position) {
                await sendPositionToBackend(position.latitude, position.longitude, vehicule.id);
            }

        } catch (err) {
            console.error('Erreur tracking:', err);
        }
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
            <TotaleTraveledDestance />
            <View style={styles.trackingHeader}>
                <Ionicons name="car-sport" size={24} color={colors.accent} />
                <Text style={styles.trackingTitle}>Mode Conducteur</Text>
            </View>

            <Text style={styles.statusText}>
                {isTracking ? 'Suivi en cours' : 'Prêt à démarrer'}
            </Text>

            <TouchableOpacity
                style={[
                    styles.trackButton,
                    isTracking ? styles.stopBtn : styles.startBtn,
                    !isDriver && styles.disabledBtn, // optional disabled style
                ]}
                onPress={isTracking ? stopTracking : startTracking}
                disabled={!isDriver}
            >
                <Ionicons
                    name={isTracking ? "stop-circle" : "play-circle"}
                    size={24}
                    color="white"
                />
                <Text style={styles.btnText}>
                    {isTracking ? "Arrêter le trajet" : "Commencer le trajet"}
                </Text>
            </TouchableOpacity>
        </View>
    )
}

export default GpsTraker;