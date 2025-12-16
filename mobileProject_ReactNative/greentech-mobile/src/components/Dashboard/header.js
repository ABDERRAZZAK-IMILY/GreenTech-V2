import React from 'react'
import {
    View,
    Text,

} from 'react-native';
import { useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native-paper';
import styles from '../../styles/DashboardStyle'
import userService from "../../services/userService";

const Header = () => {
    // 1. Initialize state to null (empty)
    const [user, setUser] = useState(null);

    // 2. Use useEffect to handle the Promise
    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Wait for the promise to resolve here
                const userData = await userService.getUserById();

                // Update the state
                setUser(userData);
            } catch (error) {
                console.error("Failed to fetch user:", error);
            }
        };

        fetchUser(); // Call the async function
    }, []); // Empty array [] means "run once when component mounts"

    // 3. Handle the "Loading" state (while user is still null)
    if (!user) {
        return (
            <View style={styles.header}>
                <ActivityIndicator color="#2a9d6f" />
            </View>
        );
    }

    // 4. Render the data (now guaranteed to exist)
    return (
        <View style={styles.header}>
            <View style={styles.welcome}>
                {/* Now you can safely access user.name */}
                <Text style={styles.welcomeTitle}>Bonjour, {user.name} 👋</Text>
                <Text style={styles.welcomeSubtitle}>Continuez vos actions écologiques !</Text>
            </View>
        </View>
    );
}

export default Header