import { useEffect, useState } from "react";
import styles from "../styles/distanceStyle"
import { View, Text, } from 'react-native';
import { getVehiculeDestance } from "../services/LocaltionService";

const TotaleTraveledDestance = () => {
    const [totalDistance, setTotalDistance] = useState(0);
useEffect(() => {
        const fetchDistanceData = async () => {
            try {
                const distance = await getVehiculeDestance();
                setTotalDistance(distance);
            } catch (error) {
                console.log(error);
            }
        };

        fetchDistanceData();

        const intervalId = setInterval(fetchDistanceData, 2000);

        return () => clearInterval(intervalId);
    }, []);
    return (
        <View style={styles.distanceCard}>
            <Text style={styles.distanceLabel}>Distance Parcourue</Text>
            <View style={styles.distanceRow}>
                <Text style={styles.distanceValue}>
                    {totalDistance ? totalDistance.distance.toFixed(3) : '0.000'}
                </Text>
                <Text style={styles.distanceUnit}>km</Text>
            </View>
            <Text style={styles.positionCount}>positions</Text>
        </View>
    )
}

export default TotaleTraveledDestance