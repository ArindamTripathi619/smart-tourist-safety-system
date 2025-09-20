import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure base URL - you can change this to your backend URL
const BASE_URL = 'http://10.5.120.254:5000/api'; // Your computer's IP for physical device testing

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, clear storage and redirect to login
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
    }
    return Promise.reject(error);
  }
);

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  emergencyContact: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  emergencyContact: string;
  digitalId: string;
  createdAt: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: Date;
}

export interface EmergencyAlert {
  type: 'panic' | 'medical' | 'accident' | 'theft' | 'harassment' | 'lost' | 'natural_disaster' | 'fire' | 'violence' | 'suspicious_activity' | 'transport' | 'other';
  message?: string;
  location: LocationData;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// Authentication API calls
export const authAPI = {
  login: async (loginData: LoginData) => {
    const response = await api.post('/auth/login', loginData);
    return response.data;
  },

  register: async (registerData: RegisterData) => {
    const response = await api.post('/auth/register', registerData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Location API calls
export const locationAPI = {
  updateLocation: async (locationData: LocationData) => {
    const response = await api.post('/location/update', locationData);
    return response.data;
  },

  getLocationHistory: async () => {
    const response = await api.get('/location/history');
    return response.data;
  },
};

// Emergency API calls
export const emergencyAPI = {
  sendAlert: async (alertData: EmergencyAlert) => {
    const response = await api.post('/emergency/alert', alertData);
    return response.data;
  },

  getAlertHistory: async () => {
    const response = await api.get('/emergency/history');
    return response.data;
  },
};

// Utility functions for token management
export const tokenManager = {
  setToken: async (token: string) => {
    await AsyncStorage.setItem('authToken', token);
  },

  getToken: async () => {
    return await AsyncStorage.getItem('authToken');
  },

  removeToken: async () => {
    await AsyncStorage.removeItem('authToken');
  },

  setUserData: async (userData: User) => {
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
  },

  getUserData: async (): Promise<User | null> => {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  removeUserData: async () => {
    await AsyncStorage.removeItem('userData');
  },
};

export default api;
