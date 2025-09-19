import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { tokenManager } from '../services/api';
import emergencyContactService from '../services/emergencyContactService';
import { User, NavigationProps } from '../types';

const EmergencyContactScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newContact, setNewContact] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactRelation, setContactRelation] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await tokenManager.getUserData();
      if (userData) {
        setUser(userData);
        setNewContact(userData.emergencyContact || '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const validateContact = (): boolean => {
    if (!emergencyContactService.validatePhoneNumber(newContact)) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid phone number (10-15 digits)');
      return false;
    }
    return true;
  };

  const saveContact = async () => {
    if (!validateContact()) return;

    try {
      setLoading(true);
      // In a real implementation, you would call an API to update the user's emergency contact
      // For now, we'll update locally
      
      if (user) {
        const updatedUser = { ...user, emergencyContact: newContact };
        setUser(updatedUser);
        // Save to async storage or API here
        await tokenManager.setUserData(updatedUser);
      }

      Alert.alert('Success', 'Emergency contact updated successfully');
      setEditing(false);
    } catch (error) {
      console.error('Error saving contact:', error);
      Alert.alert('Error', 'Failed to update emergency contact');
    } finally {
      setLoading(false);
    }
  };

  const testContact = () => {
    if (!user?.emergencyContact) {
      Alert.alert('No Contact', 'Please add an emergency contact first');
      return;
    }

    emergencyContactService.showEmergencyContactDialog({
      phone: user.emergencyContact,
      name: contactName || 'Emergency Contact',
      relation: contactRelation || 'Family'
    });
  };

  const cancelEdit = () => {
    setNewContact(user?.emergencyContact || '');
    setEditing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Contacts</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📞 Current Emergency Contact</Text>
          
          {user?.emergencyContact ? (
            <View style={styles.contactInfo}>
              <Text style={styles.contactPhone}>
                {emergencyContactService.formatPhoneNumber(user.emergencyContact)}
              </Text>
              <Text style={styles.contactLabel}>Primary Emergency Contact</Text>
              
              <View style={styles.contactActions}>
                <TouchableOpacity style={styles.actionButton} onPress={testContact}>
                  <Text style={styles.actionButtonText}>📞 Test Call</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.editButton]} 
                  onPress={() => setEditing(true)}
                >
                  <Text style={styles.actionButtonText}>✏️ Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.noContact}>
              <Text style={styles.noContactText}>No emergency contact set</Text>
              <TouchableOpacity 
                style={styles.addButton} 
                onPress={() => setEditing(true)}
              >
                <Text style={styles.addButtonText}>+ Add Emergency Contact</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {editing && (
          <View style={styles.editCard}>
            <Text style={styles.editTitle}>
              {user?.emergencyContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter phone number"
                value={newContact}
                onChangeText={setNewContact}
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Contact Name (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., John Doe"
                value={contactName}
                onChangeText={setContactName}
                autoComplete="name"
                textContentType="name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Relationship (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Spouse, Parent, Friend"
                value={contactRelation}
                onChangeText={setContactRelation}
              />
            </View>

            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={cancelEdit}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={saveContact}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Saving...' : 'Save Contact'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>ℹ️ Emergency Contact Information</Text>
          <Text style={styles.infoText}>
            • Your emergency contact will be notified via SMS when you send an emergency alert{'\n\n'}
            • Make sure to inform your contact that they may receive emergency notifications from RakshaSetu{'\n\n'}
            • Keep your emergency contact information up to date{'\n\n'}
            • You can test the contact functionality using the "Test Call" button
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  content: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  contactInfo: {
    alignItems: 'center',
  },
  contactPhone: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  contactLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: '#f39c12',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  noContact: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noContactText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  editCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
});

export default EmergencyContactScreen;
