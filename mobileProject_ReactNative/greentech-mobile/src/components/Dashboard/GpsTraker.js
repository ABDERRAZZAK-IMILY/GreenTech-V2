import styles from '../../styles/DashboardStyle';
import {
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../styles/colors';
import { useState } from 'react';

const GpsTraker = () => {
    const [isTracking, setIsTracking] = useState(false);
    const [statusMsg, setStatusMsg] = useState('Prêt à démarrer');
    const toggleTracking = () => {
        if (isTracking) {
            setIsTracking(false);
            setStatusMsg('Suivi arrêté');
        } else {
            setIsTracking(true);
        }
    };
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