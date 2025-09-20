/**
 * Tourist Safety Mobile App
 * Smart Tourist Safety Monitoring System
 *
 * @format
 */

import React from 'react';
import { StatusBar, StyleSheet, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-gesture-handler';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import DigitalIDScreen from './src/screens/DigitalIDScreen';
import EmergencyAlertScreen from './src/screens/EmergencyAlertScreen';

// Import hooks
import useAuth from './src/hooks/useAuth';
import { RootStackParamList, TabStackParamList } from './src/types';

// Create navigators
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabStackParamList>();

// Tab icon components
const HomeIcon = () => <Text style={styles.tabIcon}>🏠</Text>;
const IDIcon = () => <Text style={styles.tabIcon}>🆔</Text>;
const EmergencyIcon = () => <Text style={styles.tabIcon}>🚨</Text>;

// Splash Screen Component
const SplashScreen: React.FC = () => {
  return (
    <View style={styles.splashContainer}>
      <Text style={styles.splashTitle}>Tourist Safety</Text>
      <Text style={styles.splashSubtitle}>Loading...</Text>
    </View>
  );
};

// Tab Navigator Component
const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#7f8c8d',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#ecf0f1',
          paddingBottom: 8, // Increased padding for better touch targets
          paddingTop: 8, // Increased top padding
          height: 70, // Increased height for better accessibility
          elevation: 8, // Higher elevation to show above content
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Home',
          tabBarIcon: HomeIcon,
        }}
      />
      <Tab.Screen
        name="DigitalID"
        component={DigitalIDScreen}
        options={{
          title: 'Digital ID',
          headerStyle: { backgroundColor: '#2c3e50' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          tabBarLabel: 'Digital ID',
          tabBarIcon: IDIcon,
        }}
      />
      <Tab.Screen
        name="Emergency"
        component={EmergencyAlertScreen}
        options={{
          title: 'Emergency',
          headerStyle: { backgroundColor: '#e74c3c' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          tabBarLabel: 'Emergency',
          tabBarIcon: EmergencyIcon,
        }}
      />
    </Tab.Navigator>
  );
};

// Main App Component
const App: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#3498db" />
        <SplashScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          {isAuthenticated ? (
            // Authenticated user screens
            <Stack.Screen name="MainTabs" component={TabNavigator} />
          ) : (
            // Authentication screens
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{
                  headerShown: true,
                  title: 'Create Account',
                  headerStyle: { backgroundColor: '#27ae60' },
                  headerTintColor: '#fff',
                  headerTitleStyle: { fontWeight: 'bold' },
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3498db',
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  splashSubtitle: {
    fontSize: 16,
    color: '#ecf0f1',
  },
  tabIcon: {
    fontSize: 24, // Increased from 20 for better visibility
  },
});

export default App;
