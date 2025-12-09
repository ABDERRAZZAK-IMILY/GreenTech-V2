import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { EmployeeProvider } from './src/contexts/EmployeeContext';

// Import screens
import DashboardScreen from './src/screens/DashboardScreen';
import ActionsScreen from './src/screens/ActionsScreen';
import MarketplaceScreen from './src/screens/MarketplaceScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <EmployeeProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerStyle: {
              backgroundColor: '#1e272e',
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255, 255, 255, 0.1)',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 18,
            },
            tabBarStyle: {
              backgroundColor: '#1e272e',
              borderTopWidth: 1,
              borderTopColor: 'rgba(255, 255, 255, 0.1)',
              paddingBottom: 5,
              paddingTop: 5,
              height: 60,
            },
            tabBarActiveTintColor: '#2a9d6f',
            tabBarInactiveTintColor: '#808e9b',
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
            },
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Tableau de Bord') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Actions') {
                iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
              } else if (route.name === 'Boutique') {
                iconName = focused ? 'gift' : 'gift-outline';
              } else if (route.name === 'Profil') {
                iconName = focused ? 'person' : 'person-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen
            name="Tableau de Bord"
            component={DashboardScreen}
            options={{ title: 'Tableau de Bord' }}
          />
          <Tab.Screen
            name="Actions"
            component={ActionsScreen}
            options={{ title: 'Mes Actions' }}
          />
          <Tab.Screen
            name="Boutique"
            component={MarketplaceScreen}
            options={{ title: 'Boutique' }}
          />
          <Tab.Screen
            name="Profil"
            component={ProfileScreen}
            options={{ title: 'Mon Profil' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </EmployeeProvider>
  );
}
