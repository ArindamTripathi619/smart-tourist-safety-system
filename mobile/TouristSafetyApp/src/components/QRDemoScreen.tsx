import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import QRVerificationScreen from '../components/QRVerificationScreen';

const QRDemoScreen: React.FC = () => {
  const [showQR, setShowQR] = useState(false);
  const [selectedDigitalId, setSelectedDigitalId] = useState('');

  // Sample tourist digital IDs for demo
  const sampleIds = [
    'TID1758255882785218',
    'TID1758255882785219',
    'TID1758255882785220',
  ];

  const openQRScreen = (digitalId: string) => {
    setSelectedDigitalId(digitalId);
    setShowQR(true);
  };

  const closeQRScreen = () => {
    setShowQR(false);
    setSelectedDigitalId('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      <View style={styles.header}>
        <Text style={styles.title}>🛡️ RakshaSetu QR Demo</Text>
        <Text style={styles.subtitle}>Test Digital ID Verification</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>📱 Sample Tourist IDs:</Text>
        
        {sampleIds.map((digitalId, index) => (
          <TouchableOpacity
            key={digitalId}
            style={styles.idCard}
            onPress={() => openQRScreen(digitalId)}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Tourist #{index + 1}</Text>
              <Text style={styles.cardId}>{digitalId}</Text>
              <Text style={styles.cardAction}>Tap to generate QR code</Text>
            </View>
            <Text style={styles.cardIcon}>📱</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>✨ Features Demonstrated:</Text>
          <Text style={styles.infoText}>
            • Real QR code generation with gradients{'\n'}
            • Secure cryptographic data{'\n'}
            • Share & save functionality{'\n'}
            • 24-hour expiration security{'\n'}
            • Professional UI design
          </Text>
        </View>

        <View style={styles.instructionsBox}>
          <Text style={styles.instructionsTitle}>📋 Demo Instructions:</Text>
          <Text style={styles.instructionsText}>
            1. Tap any Tourist ID above{'\n'}
            2. QR code will generate automatically{'\n'}
            3. Test Share, Save, and Refresh buttons{'\n'}
            4. Copy QR data to test verification{'\n'}
            5. Use AuthorityVerificationScreen to verify
          </Text>
        </View>
      </View>

      {/* QR Code Modal */}
      <Modal
        visible={showQR}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <QRVerificationScreen
          digitalId={selectedDigitalId}
          onClose={closeQRScreen}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 24,
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
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  idCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  cardId: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#007AFF',
    marginBottom: 4,
  },
  cardAction: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  cardIcon: {
    fontSize: 24,
    marginLeft: 12,
  },
  infoBox: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
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
  instructionsBox: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});

export default QRDemoScreen;
