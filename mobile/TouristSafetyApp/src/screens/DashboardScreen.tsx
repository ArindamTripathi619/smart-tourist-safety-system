import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ScrollView,
  Dimensions,
} from 'react-native';
import { tokenManager } from '../services/api';
import { locationService } from '../services/locationService';
import socketService from '../services/socketService';
import { User, LocationData, NavigationProps } from '../types';

const { width } = Dimensions.get('window');

const DashboardScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [user, setUser] = useState<User | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    requestLocationPermission();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserData = async () => {
    try {
      const userData = await tokenManager.getUserData();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    const hasPermission = await locationService.requestLocationPermission();
    if (hasPermission) {
      getCurrentLocation();
    } else {
      Alert.alert(
        'Location Permission Required',
        'This app needs location access for safety monitoring features.'
      );
    }
  };

  const getCurrentLocation = async () => {
    try {
      const currentLocation = await locationService.getCurrentLocation();
      setLocation(currentLocation);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const toggleLocationTracking = () => {
    if (isTrackingLocation) {
      locationService.stopLocationTracking();
      setIsTrackingLocation(false);
      Alert.alert('Location Tracking', 'Location tracking stopped');
    } else {
      locationService.startLocationTracking(
        (newLocation) => {
          setLocation(newLocation);
          
          // Send location update to server via Socket.IO for real-time monitoring
          socketService.sendLocationUpdate(newLocation);
          console.log('Location sent to server:', newLocation);
        },
        (error) => {
          Alert.alert('Location Error', 'Failed to track location');
          console.error('Location tracking error:', error);
        }
      );
      setIsTrackingLocation(true);
      Alert.alert(
        'Real-time Location Tracking', 
        'Location tracking started. Your location will be shared with authorities for safety monitoring.',
        [
          { text: 'OK' }
        ]
      );
    }
  };

  const handleEmergency = () => {
    Alert.alert(
      'Emergency Alert',
      'Are you sure you want to send an emergency alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Alert',
          style: 'destructive',
          onPress: () => navigation.navigate('Emergency'),
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    await getCurrentLocation();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name || 'Tourist'}!</Text>
        <Text style={styles.subGreeting}>Stay safe on your journey</Text>
      </View>

      {/* Digital ID Card */}
      <View style={styles.digitalIdCard}>
        <Text style={styles.cardTitle}>Digital Tourist ID</Text>
        <View style={styles.idContainer}>
          <Text style={styles.idLabel}>ID:</Text>
          <Text style={styles.idValue}>{user?.digitalId || 'Loading...'}</Text>
        </View>
        <TouchableOpacity
          style={styles.viewIdButton}
          onPress={() => navigation.navigate('DigitalID')}
        >
          <Text style={styles.viewIdButtonText}>View Full Details</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.emergencyButton]}
            onPress={handleEmergency}
          >
            <Text style={styles.emergencyButtonText}>🚨</Text>
            <Text style={styles.actionButtonText}>Emergency</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.locationButton]}
            onPress={toggleLocationTracking}
          >
            <Text style={styles.locationButtonText}>📍</Text>
            <Text style={styles.actionButtonText}>
              {isTrackingLocation ? 'Stop Tracking' : 'Start Tracking'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Current Location */}
      {location && (
        <View style={styles.locationCard}>
          <Text style={styles.sectionTitle}>Current Location</Text>
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Coordinates:</Text>
            <Text style={styles.locationValue}>
              {locationService.formatLocation(location)}
            </Text>
            <Text style={styles.locationLabel}>Accuracy:</Text>
            <Text style={styles.locationValue}>
              ±{location.accuracy?.toFixed(0) || 'Unknown'} meters
            </Text>
            <Text style={styles.locationLabel}>Last Updated:</Text>
            <Text style={styles.locationValue}>
              {location.timestamp.toLocaleTimeString()}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.refreshLocationButton}
            onPress={getCurrentLocation}
          >
            <Text style={styles.refreshLocationButtonText}>Refresh Location</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Status Indicators */}
      <View style={styles.statusCard}>
        <Text style={styles.sectionTitle}>Safety Status</Text>
        <View style={styles.statusIndicators}>
          <View style={styles.statusItem}>
            <Text style={styles.statusIcon}>
              {location ? '🟢' : '🔴'}
            </Text>
            <Text style={styles.statusText}>
              Location: {location ? 'Active' : 'Inactive'}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusIcon}>
              {isTrackingLocation ? '🟢' : '🟡'}
            </Text>
            <Text style={styles.statusText}>
              Tracking: {isTrackingLocation ? 'On' : 'Off'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 24,
    paddingTop: 40,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    color: '#ecf0f1',
  },
  digitalIdCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: -20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  idContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  idLabel: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  idValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: 'monospace',
  },
  viewIdButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewIdButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: (width - 48) / 2 - 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  locationButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  emergencyButtonText: {
    fontSize: 32,
    marginBottom: 8,
  },
  locationButtonText: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
  },
  locationCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationInfo: {
    marginBottom: 16,
  },
  locationLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 8,
  },
  locationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  refreshLocationButton: {
    backgroundColor: '#27ae60',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  refreshLocationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusIndicators: {
    marginTop: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  statusText: {
    fontSize: 16,
    color: '#2c3e50',
  },
});

export default DashboardScreen;
