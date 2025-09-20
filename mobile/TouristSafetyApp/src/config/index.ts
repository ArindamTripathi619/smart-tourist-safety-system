// Configuration file for RakshaSetu app

// API Configuration
export const API_BASE_URL = 'http://10.5.120.254:5000'; // Your backend server URL
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  VERIFICATION: '/api',
  EMERGENCY: '/api/emergency',
  LOCATION: '/api/location',
};

// App Configuration
export const APP_CONFIG = {
  name: 'RakshaSetu',
  version: '1.0.0',
  description: 'Smart Tourist Safety System',
};

// QR Code Configuration
export const QR_CONFIG = {
  size: 250,
  expirationHours: 24,
  logoSize: 50,
};

// Emergency Configuration
export const EMERGENCY_CONFIG = {
  defaultTimeout: 30000, // 30 seconds
  maxRetries: 3,
};

// Socket Configuration
export const SOCKET_CONFIG = {
  url: 'http://10.5.120.254:5000',
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
};

// Color Theme
export const COLORS = {
  primary: '#007AFF',
  secondary: '#28A745',
  danger: '#DC3545',
  warning: '#FFC107',
  info: '#17A2B8',
  light: '#F8F9FA',
  dark: '#1A1A1A',
  success: '#28A745',
  error: '#DC3545',
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  APP_CONFIG,
  QR_CONFIG,
  EMERGENCY_CONFIG,
  SOCKET_CONFIG,
  COLORS,
};
