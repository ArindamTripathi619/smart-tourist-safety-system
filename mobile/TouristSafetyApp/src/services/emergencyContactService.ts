import { Alert, Linking } from 'react-native';

export interface EmergencyContactData {
  name?: string;
  phone: string;
  relation?: string;
}

export interface EmergencyNotificationData {
  touristName: string;
  digitalId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  message: string;
  timestamp: Date;
}

class EmergencyContactService {
  /**
   * Send SMS to emergency contact
   */
  async sendSMS(contact: EmergencyContactData, data: EmergencyNotificationData): Promise<boolean> {
    try {
      const locationText = `${data.location.latitude.toFixed(6)}, ${data.location.longitude.toFixed(6)}`;
      const googleMapsUrl = `https://maps.google.com/?q=${data.location.latitude},${data.location.longitude}`;
      
      const smsBody = `🚨 EMERGENCY ALERT 🚨\n\n` +
        `${data.touristName} (ID: ${data.digitalId}) needs help!\n\n` +
        `Message: ${data.message}\n\n` +
        `Location: ${locationText}\n` +
        `Map: ${googleMapsUrl}\n\n` +
        `Time: ${data.timestamp.toLocaleString()}\n\n` +
        `This is an automated emergency notification from RakshaSetu Tourist Safety App.`;

      const phoneNumber = contact.phone.replace(/\D/g, ''); // Remove non-digits
      const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(smsBody)}`;

      const canOpen = await Linking.canOpenURL(smsUrl);
      if (canOpen) {
        await Linking.openURL(smsUrl);
        return true;
      } else {
        console.warn('SMS not supported on this device');
        return false;
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  /**
   * Call emergency contact
   */
  async callEmergencyContact(contact: EmergencyContactData): Promise<boolean> {
    try {
      const phoneNumber = contact.phone.replace(/\D/g, ''); // Remove non-digits
      const phoneUrl = `tel:${phoneNumber}`;

      const canOpen = await Linking.canOpenURL(phoneUrl);
      if (canOpen) {
        await Linking.openURL(phoneUrl);
        return true;
      } else {
        Alert.alert('Error', 'Phone calling is not supported on this device');
        return false;
      }
    } catch (error) {
      console.error('Error calling emergency contact:', error);
      Alert.alert('Error', 'Failed to initiate call');
      return false;
    }
  }

  /**
   * Show emergency contact options dialog
   */
  showEmergencyContactDialog(contact: EmergencyContactData, notificationData?: EmergencyNotificationData) {
    const contactName = contact.name || 'Emergency Contact';
    const contactInfo = contact.relation ? `${contactName} (${contact.relation})` : contactName;
    
    Alert.alert(
      'Emergency Contact',
      `${contactInfo}\nPhone: ${contact.phone}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          style: 'default',
          onPress: () => this.callEmergencyContact(contact),
        },
        ...(notificationData ? [{
          text: 'Send SMS Alert',
          style: 'destructive' as const,
          onPress: () => this.sendSMS(contact, notificationData),
        }] : []),
      ]
    );
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
  }

  /**
   * Format phone number for display
   */
  formatPhoneNumber(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      return `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`;
    }
    return phone;
  }
}

export const emergencyContactService = new EmergencyContactService();
export default emergencyContactService;
