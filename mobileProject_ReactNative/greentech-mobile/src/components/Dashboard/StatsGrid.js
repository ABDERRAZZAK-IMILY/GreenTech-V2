import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native'; // Don't forget ActivityIndicator
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../styles/colors';
import styles from '../../styles/DashboardStyle'; // Ensure path is correct
import userService from "../../services/userService";

const StatsGrid = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await userService.getUserProfile();
                setUser(userData);
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    }, []);

    // 1. STOP THE CRASH: Handle loading state
    if (!user) {
        return (
            <View style={[styles.statsGrid, { padding: 20, alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    // 2. DEFINE THE MISSING VARIABLE
    // Assuming you want to calculate it based on total employees (e.g., 50)
    // You can adjust the math based on your real logic
    const totalEmployees = 50; 
    const rankPercentage = ((totalEmployees - user.rank) / totalEmployees) * 100;

    return (
        <View style={styles.statsGrid}>
            {/* First Row: Points & Rank */}
            <View style={styles.statsRow}>
                {/* Points Card */}
                <View style={styles.statCard}>
                    <LinearGradient
                        colors={colors.gradients.gold}
                        style={styles.statIcon}
                    >
                        <Ionicons name="wallet" size={24} color="#fff" />
                    </LinearGradient>
                    <View style={styles.statContent}>
                        <Text style={styles.statLabel}>Mes Points</Text>
                        <Text style={styles.statValue}>{user.totalPoints}</Text>
                        <Text style={styles.statSubtitle}>Points disponibles</Text>
                    </View>
                </View>

                {/* Rank Card */}
                <View style={styles.statCard}>
                    <LinearGradient
                        colors={colors.gradients.purple}
                        style={styles.statIcon}
                    >
                        <Ionicons name="trophy" size={24} color="#fff" />
                    </LinearGradient>
                    <View style={styles.statContent}>
                        <Text style={styles.statLabel}>Classement</Text>
                        <Text style={styles.statValue}>#{user.rank}</Text>
                        <Text style={styles.statSubtitle}>Top {Math.round(rankPercentage)}%</Text>
                    </View>
                </View>
            </View>

            {/* Second Row: CO2 Impact (full width) */}
            <View style={[styles.statCard, styles.largeCard]}>
                <LinearGradient
                    colors={colors.gradients.green}
                    style={styles.statIcon}
                >
                    <Ionicons name="leaf" size={24} color="#fff" />
                </LinearGradient>
                <View style={styles.statContent}>
                    <Text style={styles.statLabel}>Mon Impact CO2</Text>
                    {/* You might want to make this dynamic too: {user.co2Saved} */}
                    <Text style={styles.statValue}>15 kg</Text> 
                    <Text style={styles.statSubtitle}>CO2 économisé</Text>
                    <View style={styles.equivalents}>
                        <View style={styles.equivalentItem}>
                            <Ionicons name="leaf-outline" size={14} color={colors.accent} />
                            <Text style={styles.equivalentText}>{Math.round(15 / 22)} arbres plantés</Text>
                        </View>
                        <View style={styles.equivalentItem}>
                            <Ionicons name="car-outline" size={14} color={colors.accent} />
                            <Text style={styles.equivalentText}>{Math.round(15 / 0.12)} km évités</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

export default StatsGrid;