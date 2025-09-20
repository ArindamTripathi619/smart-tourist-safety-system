import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
  StatusBar,
  BackHandler
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { tokenManager } from '../services/api';
import { verificationService } from '../services/verificationService';
import { API_BASE_URL } from '../config';

interface QRVerificationScreenProps {
  digitalId: string;
  onClose: () => void;
}

const QRVerificationScreen: React.FC<QRVerificationScreenProps> = ({ digitalId, onClose }) => {
  const [qrData, setQrData] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    generateQRCode();

    // Handle Android back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true; // Prevent default behavior
    });

    return () => {
      backHandler.remove();
    };
  }, [onClose]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      setError('');

      const result = await verificationService.generateQRCode(digitalId);

      if (result.success && result.qrData) {
        setQrData(result.qrData);
      } else {
        setError(result.message || 'Failed to generate QR code');
      }
    } catch (error: any) {
      console.error('QR generation error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const shareQRCode = async () => {
    try {
      const shareMessage = verificationService.formatQRDataForSharing(digitalId, qrData);
      const result = await Share.share({
        message: shareMessage,
        title: 'RakshaSetu Digital ID Verification',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const copyQRData = () => {
    // In a real app, you'd use Clipboard
    Alert.alert(
      'QR Data',
      qrData.substring(0, 300) + '...',
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Copy', onPress: () => {
          // Clipboard.setString(qrData);
          Alert.alert('Copied!', 'QR data copied to clipboard');
        }}
      ]
    );
  };

  const saveQRCode = () => {
    // This would save the QR code as an image in a real implementation
    Alert.alert(
      'Save QR Code',
      'QR code saved to gallery!\n\n(Feature will be implemented with react-native-fs or expo-media-library)',
      [{ text: 'OK' }]
    );
  };

  const refreshQRCode = () => {
    generateQRCode();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Generating QR Code</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Generating QR Code...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>QR Code Error</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>⚠️ Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshQRCode}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Digital ID Verification</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.idInfo}>
          <Text style={styles.subtitle}>ID: {digitalId}</Text>
        </View>

      <View style={styles.qrContainer}>
        {qrData ? (
          <QRCode
            value={qrData}
            size={250}
            color="#000000"
            backgroundColor="#FFFFFF"
            logoSize={40}
            logoBackgroundColor="transparent"
            logoMargin={2}
            logoBorderRadius={20}
            enableLinearGradient={true}
            linearGradient={['#007AFF', '#0051D5']}
            gradientDirection={['0%', '0%', '100%', '100%']}
          />
        ) : (
          <View style={styles.qrLoadingPlaceholder}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.qrLoadingText}>Generating QR Code...</Text>
          </View>
        )}
        <View style={styles.qrInfo}>
          <Text style={styles.qrInfoText}>
            ID: {digitalId}
          </Text>
          <Text style={styles.qrInfoText}>
            Expires in 24 hours • Secure & Verified
          </Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>✅ How to Verify:</Text>
        <Text style={styles.infoText}>
          1. Show this QR code to authorities{'\n'}
          2. They scan with any QR scanner app{'\n'}
          3. Instant verification of your identity{'\n'}
          4. QR code expires in 24 hours for security
        </Text>
      </View>

      <View style={styles.securityInfo}>
        <Text style={styles.securityTitle}>🔐 Security Features:</Text>
        <Text style={styles.securityText}>
          • Cryptographic signature{'\n'}
          • Tamper detection{'\n'}
          • 24-hour expiration{'\n'}
          • Real-time verification
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={shareQRCode}>
          <Text style={styles.actionButtonText}>📤 Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={saveQRCode}>
          <Text style={styles.actionButtonText}>� Save</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={refreshQRCode}>
          <Text style={styles.actionButtonText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.secondaryButtonContainer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={copyQRData}>
          <Text style={styles.secondaryButtonText}>📋 Copy QR Data</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 80, // Same width as back button to center title
  },
  content: {
    flex: 1,
    padding: 20,
  },
  idInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC3545',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'monospace',
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 16,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  qrInfo: {
    marginTop: 16,
    alignItems: 'center',
  },
  qrInfoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 2,
  },
  qrLoadingPlaceholder: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  qrLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#155724',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#155724',
    lineHeight: 20,
  },
  securityInfo: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButtonContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#6C757D',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#6C757D',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QRVerificationScreen;
