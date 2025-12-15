import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Zidna hadi
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { EmployeeProvider } from './src/contexts/EmployeeContext';

// Import screens
import DashboardScreen from './src/screens/DashboardScreen';
import ActionsScreen from './src/screens/ActionsScreen';
import MarketplaceScreen from './src/screens/MarketplaceScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator(); // Stack jdid

// Hada Component khass b les Tabs bo7dhom
function MainTabs() {
  return (
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
        tabBarStyle: {
      position: 'absolute',     // Takes it out of the normal layout flow
      bottom: 25,               // Distance from the bottom of the screen
      left: 20,                 // Distance from left
      right: 20,                // Distance from right
      elevation: 5,             // Shadow for Android
      backgroundColor: '#1e272e',
      borderRadius: 15,         // Rounded corners
      height: 70,               // Slightly taller to accommodate the float look
      borderTopWidth: 0,        // Remove standard top border
      borderWidth: 1,           // Add border around the whole shape
      borderColor: 'rgba(255, 255, 255, 0.1)',
      
      // Shadow for iOS
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 3.5,
      paddingBottom: 10,       // Adjust inner padding
      paddingTop: 10,
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
  );
}

// Hada App principal
export default function App() {
  return (
    <EmployeeProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }}
          />

          <Stack.Screen 
            name="MainApp" 
            component={MainTabs} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="EditProfile" 
            component={EditProfileScreen} 
            options={{ headerShown: false }}
          />

        </Stack.Navigator>
      </NavigationContainer>
    </EmployeeProvider>
  );
}