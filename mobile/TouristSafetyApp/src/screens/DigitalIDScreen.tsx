import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Share,
} from 'react-native';
import { tokenManager } from '../services/api';
import { User, NavigationProps } from '../types';

const DigitalIDScreen: React.FC<NavigationProps> = ({ navigation: _navigation }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await tokenManager.getUserData();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const shareDigitalID = async () => {
    if (!user) return;

    try {
      await Share.share({
        message: `My Tourist Safety Digital ID: ${user.digitalId}\nName: ${user.name}\nEmail: ${user.email}`,
        title: 'Tourist Safety Digital ID',
      });
    } catch (error) {
      console.error('Error sharing digital ID:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading Digital ID...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load Digital ID</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Digital ID Card Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Digital Tourist ID</Text>
        <Text style={styles.headerSubtitle}>Official Safety Identification</Text>
      </View>

      {/* Main ID Card */}
      <View style={styles.idCard}>
        {/* ID Number Section */}
        <View style={styles.idSection}>
          <Text style={styles.idLabel}>Digital ID</Text>
          <View style={styles.idNumberContainer}>
            <Text style={styles.idNumber}>{user.digitalId}</Text>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.personalInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>{user.name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email Address</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <Text style={styles.infoValue}>{user.phone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Emergency Contact</Text>
            <Text style={styles.infoValue}>{user.emergencyContact}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Registration Date</Text>
            <Text style={styles.infoValue}>{formatDate(user.createdAt)}</Text>
          </View>
        </View>

        {/* Security Features */}
        <View style={styles.securitySection}>
          <Text style={styles.securityTitle}>Security Features</Text>
          <View style={styles.securityFeatures}>
            <View style={styles.securityItem}>
              <Text style={styles.securityIcon}>🔒</Text>
              <Text style={styles.securityText}>Encrypted Data</Text>
            </View>
            <View style={styles.securityItem}>
              <Text style={styles.securityIcon}>✅</Text>
              <Text style={styles.securityText}>Verified Identity</Text>
            </View>
            <View style={styles.securityItem}>
              <Text style={styles.securityIcon}>📱</Text>
              <Text style={styles.securityText}>Digital Authentication</Text>
            </View>
            <View style={styles.securityItem}>
              <Text style={styles.securityIcon}>🛡️</Text>
              <Text style={styles.securityText}>Safety Monitoring</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.shareButton} onPress={shareDigitalID}>
          <Text style={styles.shareButtonText}>Share Digital ID</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={() => {
            Alert.alert(
              'Emergency Contact',
              `Emergency Contact: ${user.emergencyContact}`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call Emergency Contact', onPress: () => {} },
              ]
            );
          }}
        >
          <Text style={styles.emergencyButtonText}>Emergency Contact Info</Text>
        </TouchableOpacity>
      </View>

      {/* QR Code Placeholder */}
      <View style={styles.qrSection}>
        <Text style={styles.qrTitle}>QR Code</Text>
        <View style={styles.qrPlaceholder}>
          <Text style={styles.qrText}>QR Code for {user.digitalId}</Text>
          <Text style={styles.qrSubtext}>
            Scan this code for instant ID verification
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          This Digital ID is issued by the Tourist Safety Monitoring System
        </Text>
        <Text style={styles.footerSubtext}>
          Keep this ID accessible during your travels
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#2c3e50',
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
    color: '#bdc3c7',
  },
  idCard: {
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
  idSection: {
    backgroundColor: '#3498db',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  idLabel: {
    fontSize: 16,
    color: '#ecf0f1',
    marginBottom: 8,
  },
  idNumberContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  idNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: 'monospace',
  },
  personalInfo: {
    padding: 20,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  securitySection: {
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    padding: 20,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  securityFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  securityItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  actionButtons: {
    margin: 16,
  },
  shareButton: {
    backgroundColor: '#27ae60',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emergencyButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  qrSection: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#ecf0f1',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#bdc3c7',
    borderStyle: 'dashed',
  },
  qrText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 8,
  },
  qrSubtext: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
  },
  footer: {
    margin: 16,
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
  },
});

export default DigitalIDScreen;
