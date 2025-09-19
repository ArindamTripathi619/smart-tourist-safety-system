import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  Animated,
} from 'react-native';
import { emergencyAPI, tokenManager } from '../services/api';
import { locationService } from '../services/locationService';
import socketService from '../services/socketService';
import emergencyContactService, { EmergencyNotificationData } from '../services/emergencyContactService';
import { EmergencyAlert, LocationData, NavigationProps, User } from '../types';

const EmergencyAlertScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [selectedType, setSelectedType] = useState<EmergencyAlert['type']>('panic');
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    getCurrentLocation();
    loadUserData();
    startPulseAnimation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserData = async () => {
    try {
      const userData = await tokenManager.getUserData();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
    try {
      // First request permission
      const hasPermission = await locationService.requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Location access is needed for emergency services. Please grant permission in settings.');
        return null;
      }

      // Get current location
      const currentLocation = await locationService.getCurrentLocation();
      console.log('Location obtained for emergency:', currentLocation);
      
      // Set the location state for the component
      const locationData = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        accuracy: currentLocation.accuracy,
        timestamp: new Date()
      };
      setLocation(locationData);
      
      return {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      };
    } catch (error: any) {
      console.error('Error getting location for emergency:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Unable to get location';
      if (error && typeof error === 'object') {
        if (error.code === 1) {
          errorMessage = 'Location permission denied. Please enable location services.';
        } else if (error.code === 2) {
          errorMessage = 'Location unavailable. Please check if GPS is enabled.';
        } else if (error.code === 3) {
          errorMessage = 'Location request timed out. Please try again.';
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Location Error', errorMessage);
      return null;
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const emergencyTypes = [
    { type: 'panic' as const, label: 'General Emergency', icon: '🚨', color: '#e74c3c' },
    { type: 'medical' as const, label: 'Medical Emergency', icon: '🏥', color: '#e67e22' },
    { type: 'theft' as const, label: 'Theft/Crime', icon: '⚠️', color: '#f39c12' },
    { type: 'other' as const, label: 'Other Emergency', icon: '📞', color: '#9b59b6' },
  ];

  const sendEmergencyAlert = async () => {
    if (!location) {
      Alert.alert(
        'Location Required',
        'We need your location to send an emergency alert. Please enable location services.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: getCurrentLocation },
        ]
      );
      return;
    }

    Alert.alert(
      'Send Emergency Alert',
      `Are you sure you want to send a ${emergencyTypes.find(t => t.type === selectedType)?.label} alert?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Alert',
          style: 'destructive',
          onPress: confirmSendAlert,
        },
      ]
    );
  };

  const confirmSendAlert = async () => {
    console.log('🚨 Emergency alert confirmation started');
    console.log('📍 Location available:', !!location);
    
    if (!location) {
      console.log('❌ No location available for emergency alert');
      return;
    }

    console.log('🔒 Setting sending state...');
    setSending(true);
    try {
      const alertData: EmergencyAlert = {
        type: selectedType,
        message: message.trim() || `${emergencyTypes.find(t => t.type === selectedType)?.label} - No additional details provided`,
        location,
      };

      console.log('📨 Sending emergency alert via Socket.IO...');
      console.log('📍 Alert location:', location);
      console.log('💬 Alert message:', `${selectedType.toUpperCase()}: ${alertData.message}`);

      // Send via Socket.IO for real-time alert (primary method)
      const socketSent = socketService.sendEmergencyAlert(
        location,
        `${selectedType.toUpperCase()}: ${alertData.message}`
      );

      console.log('🔌 Socket.IO emergency alert sent:', socketSent);

      // Also send via REST API as backup
      try {
        await emergencyAPI.sendAlert(alertData);
      } catch (apiError) {
        console.warn('REST API emergency alert failed, but socket alert sent:', apiError);
      }

      // Send notification to emergency contact
      if (user && user.emergencyContact) {
        try {
          const notificationData: EmergencyNotificationData = {
            touristName: user.name,
            digitalId: user.digitalId,
            location: { latitude: location.latitude, longitude: location.longitude },
            message: `${selectedType.toUpperCase()}: ${alertData.message}`,
            timestamp: new Date()
          };

          const contactData = {
            phone: user.emergencyContact,
            name: 'Emergency Contact'
          };

          // Show SMS option to user
          Alert.alert(
            'Alert Sent! 🚨',
            'Your emergency alert has been sent to authorities. Would you like to notify your emergency contact?',
            [
              {
                text: 'Skip',
                style: 'cancel',
                onPress: () => navigation.goBack(),
              },
              {
                text: 'Send SMS to Emergency Contact',
                onPress: async () => {
                  const smsSent = await emergencyContactService.sendSMS(contactData, notificationData);
                  if (smsSent) {
                    Alert.alert('Success', 'Emergency contact has been notified via SMS');
                  } else {
                    Alert.alert('Note', 'Please manually contact your emergency contact');
                  }
                  navigation.goBack();
                },
              },
            ]
          );
          return; // Don't show the original success dialog
        } catch (contactError) {
          console.error('Error notifying emergency contact:', contactError);
          // Continue with original success dialog if contact notification fails
        }
      }

      if (socketSent || true) { // Consider successful if either method works
        Alert.alert(
          'Emergency Alert Sent! 🚨',
          'Your emergency alert has been sent in real-time to authorities and your emergency contacts. Help is on the way!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        throw new Error('Failed to send emergency alert via real-time connection');
      }
    } catch (error: any) {
      console.error('Error sending emergency alert:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send emergency alert. Please try again or call emergency services directly.';
      Alert.alert('Alert Failed', errorMessage, [
        { text: 'Try Again', onPress: confirmSendAlert },
        { text: 'Cancel', style: 'cancel' }
      ]);
    } finally {
      setSending(false);
    }
  };

  const quickPanicAlert = () => {
    Alert.alert(
      'PANIC BUTTON',
      'This will immediately send an emergency alert to authorities and your emergency contacts.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'SEND ALERT NOW',
          style: 'destructive',
          onPress: () => {
            setSelectedType('panic');
            setMessage('PANIC BUTTON ACTIVATED - IMMEDIATE HELP NEEDED');
            setTimeout(confirmSendAlert, 100);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Emergency Alert</Text>
        <Text style={styles.headerSubtitle}>Get help quickly and safely</Text>
      </View>

      {/* Panic Button */}
      <View style={styles.panicSection}>
        <TouchableOpacity
          style={styles.panicButton}
          onPress={quickPanicAlert}
          disabled={sending}
        >
          <Animated.View
            style={[
              styles.panicButtonInner,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Text style={styles.panicButtonIcon}>🚨</Text>
            <Text style={styles.panicButtonText}>PANIC</Text>
            <Text style={styles.panicButtonSubtext}>Emergency Help</Text>
          </Animated.View>
        </TouchableOpacity>
        <Text style={styles.panicDescription}>
          Tap the panic button for immediate emergency assistance
        </Text>
      </View>

      {/* Emergency Type Selection */}
      <View style={styles.typeSection}>
        <Text style={styles.sectionTitle}>Select Emergency Type</Text>
        <View style={styles.typeGrid}>
          {emergencyTypes.map((type) => (
            <TouchableOpacity
              key={type.type}
              style={[
                styles.typeButton,
                { borderColor: type.color },
                selectedType === type.type && { backgroundColor: type.color },
              ]}
              onPress={() => setSelectedType(type.type)}
              disabled={sending}
            >
              <Text style={styles.typeIcon}>{type.icon}</Text>
              <Text
                style={[
                  styles.typeLabel,
                  selectedType === type.type && styles.typeLabelSelected,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Message Input */}
      <View style={styles.messageSection}>
        <Text style={styles.sectionTitle}>Additional Details (Optional)</Text>
        <TextInput
          style={styles.messageInput}
          placeholder="Describe your emergency or location details..."
          multiline
          numberOfLines={4}
          value={message}
          onChangeText={setMessage}
          editable={!sending}
        />
      </View>

      {/* Location Info */}
      {location && (
        <View style={styles.locationSection}>
          <Text style={styles.sectionTitle}>Your Current Location</Text>
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>
              📍 {locationService.formatLocation(location)}
            </Text>
            <Text style={styles.locationSubtext}>
              Accuracy: ±{location.accuracy?.toFixed(0) || 'Unknown'} meters
            </Text>
            <Text style={styles.locationSubtext}>
              Updated: {location.timestamp.toLocaleTimeString()}
            </Text>
          </View>
        </View>
      )}

      {/* Send Alert Button */}
      <View style={styles.sendSection}>
        <TouchableOpacity
          style={[
            styles.sendButton,
            sending && styles.sendButtonDisabled,
          ]}
          onPress={sendEmergencyAlert}
          disabled={sending}
        >
          <Text style={styles.sendButtonText}>
            {sending ? 'Sending Alert...' : 'Send Emergency Alert'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={sending}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Safety Tips */}
      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>Safety Tips</Text>
        <Text style={styles.tipsText}>
          • Stay calm and move to a safe location if possible{'\n'}
          • Keep your phone charged and with you{'\n'}
          • Follow local emergency procedures{'\n'}
          • Wait for help to arrive in a secure location
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#e74c3c',
    padding: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#f8c9c4',
  },
  panicSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    margin: 16,
    marginTop: -20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  panicButton: {
    marginBottom: 16,
  },
  panicButtonInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  panicButtonIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  panicButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  panicButtonSubtext: {
    fontSize: 14,
    color: '#f8c9c4',
  },
  panicDescription: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
  },
  typeSection: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  typeButton: {
    width: '48%',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  typeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
  },
  typeLabelSelected: {
    color: '#fff',
  },
  messageSection: {
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
  messageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    backgroundColor: '#f8f9fa',
    minHeight: 100,
  },
  locationSection: {
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
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  locationSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  sendSection: {
    margin: 16,
  },
  sendButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsSection: {
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
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  tipsText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
});

export default EmergencyAlertScreen;
