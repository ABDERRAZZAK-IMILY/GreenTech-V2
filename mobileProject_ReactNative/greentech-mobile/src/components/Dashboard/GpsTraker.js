import styles from '../../styles/DashboardStyle';
import {
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../styles/colors';
import { useEffect, useState } from 'react';
import { checkGPSEnabled, getCurrentPosition, requestLocationPermissions } from '../../services/LocaltionService';

const GpsTraker = () => {
    const [isTracking, setIsTracking] = useState(false);
    const [statusMsg, setStatusMsg] = useState('Prêt à démarrer');
    const [isLoading, setIsLoading] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(null);
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
                onPress={toggleTracking}
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