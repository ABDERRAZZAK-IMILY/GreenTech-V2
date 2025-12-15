import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native'; // Import ActivityIndicator
import { Ionicons } from '@expo/vector-icons';
import colors from '../../styles/colors';
import styles from './../../styles/DashboardStyle';
import gamification from '../../services/GamificationService';

const Level = () => {
    const [state, setState] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await gamification.getMyStats();
                console.log("Stats received:", response); // Check your logs!
                
                // FIX 1: Remove '.data' unless your backend explicitly wraps it in a 'data' field
                // With fetch(), the response IS the data.
                setState(response); 
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };
        fetchData();
    }, []);

    // FIX 2: Handle the "Loading" state
    // If we don't return here, the code below crashes accessing 'state.currentPoints'
    if (!state) {
        return (
            <View style={[styles.levelCard, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="small" color={colors.accent} />
            </View>
        );
    }

    // Safety check for math (avoid dividing by zero/undefined)
    const progress = state.totalPointsEarned > 0 
        ? (state.currentPoints / state.totalPointsEarned) * 100 
        : 0;

    return (
        <View style={styles.levelCard}>
            <View style={styles.levelInfo}>
                <View style={styles.levelBadge}>
                    <Ionicons name="star" size={20} color={colors.accent} />
                    {/* Uncommenting this is safe now */}
                    <Text style={styles.levelText}>Niveau {state.level || 0}</Text> 
                </View>
                <Text style={styles.levelPoints}>
                    {state.currentPoints} / {state.totalPointsEarned} points
                </Text>
            </View>
            <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
        </View>
    );
}

export default Level;