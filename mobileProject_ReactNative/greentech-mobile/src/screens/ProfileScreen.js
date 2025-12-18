import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native'; 

import UserService from '../services/userService';
import AuthService from '../services/authService'; // Pour le logout
import colors from '../styles/colors';
// import { log } from 'console';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Fonction pour charger les données
  const fetchUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert("Erreur", "Utilisateur non identifié");
        return;
      }

      const [userInfo, userProfile] = await Promise.all([
        UserService.getUserById(userId),
        UserService.getUserProfile(userId)
      ]);
      console.log("User ID from AsyncStorage:", userProfile.totalPoints);

      setUser({ ...userInfo, ...userProfile });

    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible de charger le profil");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

 useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );
const settingsOptions = [
    {
      id: 1,
      section: 'Compte',
      items: [
        { 
          id: 'edit-profile', 
          title: 'Modifier le profil', 
          icon: 'person-outline', 
          action: () => navigation.navigate('EditProfile', { user: user, mode: 'profile' })
        },
        { 
          id: 'change-password', 
          title: 'Changer le mot de passe', 
          icon: 'key-outline', 
          action: () => navigation.navigate('EditProfile', { user: user, mode: 'password' }) 
        },
      ]
    },
    {
      id: 2,
      section: 'Préférences',
      items: [
        { id: 'notifications', title: 'Notifications', icon: 'notifications-outline', action: () => Alert.alert('Info', 'Fonctionnalité à venir') },
        { id: 'language', title: 'Langue', icon: 'language-outline', subtitle: 'Français', action: () => Alert.alert('Info', 'Fonctionnalité à venir') },
        { id: 'theme', title: 'Thème', icon: 'moon-outline', subtitle: 'Sombre', action: () => Alert.alert('Info', 'Fonctionnalité à venir') },
      ]
    },
    {
      id: 3,
      section: 'Assistance',
      items: [
        { id: 'help', title: 'Centre d\'aide', icon: 'help-circle-outline', action: () => Alert.alert('Info', 'Fonctionnalité à venir') },
        { id: 'contact', title: 'Nous contacter', icon: 'chatbubble-outline', action: () => Alert.alert('Info', 'Fonctionnalité à venir') },
        { id: 'about', title: 'À propos', icon: 'information-circle-outline', action: () => Alert.alert('GreenTech PME', 'Version 1.0.0') },
      ]
    },
  ];
  // Recharger les données quand on "tire" l'écran vers le bas
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserData();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await AuthService.logout();
            // Rediriger vers le Stack Login (LoginScreen)
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
      }
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase():""}
            </Text>
          </View>
          <View style={styles.currentLevel}>
            <Ionicons name="star" size={14} color="#fff" />
            <Text style={styles.levelBadgeText}>{user?.level || 'Niv 1'}</Text>
          </View>
        </View>
        <Text style={styles.profileName}>
          {user?.name} {user?.name.charAt(0).toUpperCase() }
        </Text>
        <Text style={styles.profileRole}>
          {user?.role || 'Employé'} · GreenTech PME
        </Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.totalPoints || 0}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>#{user?.rank || '-'}</Text>
            <Text style={styles.statLabel}>Classement</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.badgesCount || 0}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
        </View>
      </View>

      {/* Settings Sections */}
      {settingsOptions.map(section => (
        <View key={section.id} style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>{section.section}</Text>
          <View style={styles.settingsCard}>
            {section.items.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.settingItem,
                  index !== section.items.length - 1 && styles.settingItemBorder
                ]}
                onPress={item.action}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconContainer}>
                    <Ionicons name={item.icon} size={20} color={colors.accent} />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    {item.subtitle && (
                      <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Déconnexion</Text>
      </TouchableOpacity>

      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
        <Text style={styles.copyrightText}>© 2024 GreenTech PME</Text>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.background,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#feca57',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.background,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.cardBorder,
  },
  settingsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  settingsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(42, 157, 111, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: 30,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ef4444',
  },
  versionContainer: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  versionText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
});
