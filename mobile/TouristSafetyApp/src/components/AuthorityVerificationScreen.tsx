import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput
} from 'react-native';

interface VerificationResult {
  isValid: boolean;
  userData?: {
    digitalId: string;
    name: string;
    email: string;
    phone: string;
    emergencyContacts: Array<{
      name: string;
      phone: string;
      relation: string;
    }>;
    lastVerified: string;
    verificationMethod: string;
  };
  error?: string;
  errorCode?: string;
}

const AuthorityVerificationScreen: React.FC = () => {
  const [digitalId, setDigitalId] = useState<string>('');
  const [qrData, setQrData] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'id' | 'qr'>('id');

  const verifyByDigitalId = async () => {
    if (!digitalId.trim()) {
      Alert.alert('Error', 'Please enter a Digital ID');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Replace with your actual API endpoint
      const response = await fetch(`${API_BASE_URL}/api/verify/${digitalId}`);
      const data = await response.json();

      if (data.success) {
        setResult({
          isValid: true,
          userData: data.data
        });
      } else {
        setResult({
          isValid: false,
          error: data.message,
          errorCode: data.errorCode
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      setResult({
        isValid: false,
        error: 'Network error. Please check your connection.',
        errorCode: 'NETWORK_ERROR'
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyByQRCode = async () => {
    if (!qrData.trim()) {
      Alert.alert('Error', 'Please enter QR code data');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/verify/qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrData }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          isValid: true,
          userData: data.data
        });
      } else {
        setResult({
          isValid: false,
          error: data.message,
          errorCode: data.errorCode
        });
      }
    } catch (error) {
      console.error('QR verification error:', error);
      setResult({
        isValid: false,
        error: 'Network error. Please check your connection.',
        errorCode: 'NETWORK_ERROR'
      });
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResult(null);
    setDigitalId('');
    setQrData('');
  };

  const callEmergencyContact = (phone: string, name: string) => {
    Alert.alert(
      'Call Emergency Contact',
      `Call ${name} at ${phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            // In a real app, you'd use Linking.openURL(`tel:${phone}`)
            Alert.alert('Calling...', `Dialing ${phone}`);
          }
        }
      ]
    );
  };

  const renderVerificationResult = () => {
    if (!result) return null;

    if (result.isValid && result.userData) {
      return (
        <View style={styles.resultContainer}>
          <View style={styles.successHeader}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>VERIFIED TOURIST</Text>
          </View>

          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfoTitle}>Tourist Information:</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Digital ID:</Text>
              <Text style={styles.infoValue}>{result.userData.digitalId}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{result.userData.name}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{result.userData.email}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{result.userData.phone}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Verified:</Text>
              <Text style={styles.infoValue}>{new Date(result.userData.lastVerified).toLocaleString()}</Text>
            </View>
          </View>

          {result.userData.emergencyContacts && result.userData.emergencyContacts.length > 0 && (
            <View style={styles.emergencyContactsContainer}>
              <Text style={styles.emergencyTitle}>Emergency Contacts:</Text>
              {result.userData.emergencyContacts.map((contact, index) => (
                <View key={index} style={styles.contactCard}>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactRelation}>{contact.relation}</Text>
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => callEmergencyContact(contact.phone, contact.name)}
                  >
                    <Text style={styles.callButtonText}>📞 Call</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      );
    } else {
      return (
        <View style={styles.resultContainer}>
          <View style={styles.errorHeader}>
            <Text style={styles.errorIcon}>❌</Text>
            <Text style={styles.errorTitle}>VERIFICATION FAILED</Text>
          </View>

          <View style={styles.errorInfoContainer}>
            <Text style={styles.errorMessage}>{result.error}</Text>
            {result.errorCode && (
              <Text style={styles.errorCode}>Error Code: {result.errorCode}</Text>
            )}
            
            <Text style={styles.errorAdvice}>
              {result.errorCode === 'EXPIRED' && 'Ask the tourist to generate a new QR code.'}
              {result.errorCode === 'NOT_FOUND' && 'This Digital ID may not exist or has been deactivated.'}
              {result.errorCode === 'TAMPERED' && 'This QR code appears to have been modified.'}
              {result.errorCode === 'NETWORK_ERROR' && 'Please check your internet connection and try again.'}
              {!result.errorCode && 'Please verify the Digital ID or QR code and try again.'}
            </Text>
          </View>
        </View>
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🛡️ RakshaSetu Verification</Text>
        <Text style={styles.subtitle}>Authority Verification Portal</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'id' && styles.activeTab]}
          onPress={() => setActiveTab('id')}
        >
          <Text style={[styles.tabText, activeTab === 'id' && styles.activeTabText]}>
            Digital ID
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'qr' && styles.activeTab]}
          onPress={() => setActiveTab('qr')}
        >
          <Text style={[styles.tabText, activeTab === 'qr' && styles.activeTabText]}>
            QR Code
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'id' ? (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Enter Digital ID:</Text>
          <TextInput
            style={styles.textInput}
            value={digitalId}
            onChangeText={setDigitalId}
            placeholder="e.g., TID1758255882785218"
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={[styles.verifyButton, loading && styles.disabledButton]}
            onPress={verifyByDigitalId}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.verifyButtonText}>🔍 Verify ID</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Enter QR Code Data:</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            value={qrData}
            onChangeText={setQrData}
            placeholder="Paste QR code data here..."
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity
            style={[styles.verifyButton, loading && styles.disabledButton]}
            onPress={verifyByQRCode}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.verifyButtonText}>🔍 Verify QR</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {result && renderVerificationResult()}

      {result && (
        <TouchableOpacity style={styles.clearButton} onPress={clearResults}>
          <Text style={styles.clearButtonText}>🔄 New Verification</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -10,
    borderRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  inputContainer: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    marginBottom: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  verifyButton: {
    backgroundColor: '#28A745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  successHeader: {
    backgroundColor: '#D4EDDA',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#C3E6CB',
  },
  successIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#155724',
  },
  errorHeader: {
    backgroundColor: '#F8D7DA',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1B2B7',
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#721C24',
  },
  userInfoContainer: {
    padding: 20,
  },
  userInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  emergencyContactsContainer: {
    padding: 20,
    backgroundColor: '#FFF3CD',
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 12,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  contactRelation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 12,
    color: '#007AFF',
    fontFamily: 'monospace',
  },
  callButton: {
    backgroundColor: '#28A745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  errorInfoContainer: {
    padding: 20,
  },
  errorMessage: {
    fontSize: 16,
    color: '#721C24',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorCode: {
    fontSize: 12,
    color: '#721C24',
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorAdvice: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  clearButton: {
    margin: 20,
    backgroundColor: '#6C757D',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

// For demo purposes, using a mock API_BASE_URL
const API_BASE_URL = 'http://localhost:5000';

export default AuthorityVerificationScreen;
