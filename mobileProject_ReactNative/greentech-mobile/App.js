import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
const Stack = createNativeStackNavigator();

// 1. Hada howa MainTabs (N9I BLA MCHAKIL)
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
        tabBarActiveTintColor: '#2a9d6f',
        tabBarInactiveTintColor: '#808e9b',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: 25,
          left: 20,
          right: 20,
          elevation: 5,
          backgroundColor: '#1e272e',
          borderRadius: 15,
          height: 70,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.25,
          shadowRadius: 3.5,
          paddingBottom: 10,
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
        options={{ 
          title: 'Mon Profil',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

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

          {/* HNA ZIDNA L-MODAL ANIMATION */}
          <Stack.Screen 
            name="EditProfile" 
            component={EditProfileScreen} 
            options={{ 
              headerShown: false,
              presentation: 'modal',       // <-- HADI LI KATHAKEM
              animation: 'slide_from_bottom' // <-- HADI LI KATDIR SLIDE
            }} 
          />

        </Stack.Navigator>
      </NavigationContainer>
    </EmployeeProvider>
  );
}