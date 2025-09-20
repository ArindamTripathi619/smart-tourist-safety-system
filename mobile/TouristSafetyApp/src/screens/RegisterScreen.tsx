import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { authAPI, tokenManager } from '../services/api';
import { RegisterFormData, NavigationProps } from '../types';

const RegisterScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    emergencyContact: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return false;
    }
    if (!formData.emergencyContact.trim() || formData.emergencyContact.length < 10) {
      Alert.alert('Error', 'Please enter a valid emergency contact number');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authAPI.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        emergencyContact: formData.emergencyContact.trim(),
      });

      // Store token and user data
      await tokenManager.setToken(response.token);
      await tokenManager.setUserData(response.user);

      Alert.alert(
        'Registration Successful!',
        `Welcome ${response.user.name}! Your Digital ID is: ${response.user.digitalId}. You are now logged in and ready to explore!`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Since we stored the token, the App component will automatically
              // detect the authentication state change and navigate to MainTabs
              // No need to manually navigate - the useEffect in App.tsx will handle it
            },
          },
        ]
      );
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Join Tourist Safety</Text>
            <Text style={styles.subtitle}>Create your account for safer travels</Text>
          </View>

          {/* Registration Form */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>Create Account</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                keyboardType="phone-pad"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Emergency Contact</Text>
              <TextInput
                style={styles.input}
                placeholder="Emergency contact number"
                value={formData.emergencyContact}
                onChangeText={(value) => handleInputChange('emergencyContact', value)}
                keyboardType="phone-pad"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password (min 6 characters)"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                disabled={loading}
              >
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  registerButton: {
    backgroundColor: '#27ae60',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  loginLink: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default RegisterScreen;
