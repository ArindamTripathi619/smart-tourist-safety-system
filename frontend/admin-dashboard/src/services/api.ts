import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  digitalId: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  token?: string;
  user?: User;
  users?: User[];
  count?: number;
  demo?: boolean;
  stats?: AlertStats;
  alerts?: EmergencyAlert[];
}

export interface AlertStats {
  totalAlerts: number;
  activeAlerts: number;
  resolvedAlerts: number;
  lastAlert: EmergencyAlert | null;
}

export interface EmergencyAlert {
  alertId: string;
  userId: string;
  digitalId: string;
  type: string;
  emergencyType?: string;
  priority?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
  status: string;
  message: string;
  resolvedAt?: string;
}

// API functions
export const apiService = {
  // Authentication
  login: async (credentials: LoginCredentials): Promise<ApiResponse<User>> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Get all users/tourists
  getAllUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = await apiClient.get('/auth/users');
    return response.data;
  },

  // Register new user (for admin use)
  registerUser: async (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: string;
  }): Promise<ApiResponse<User>> => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  // Health check
  healthCheck: async (): Promise<any> => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  // Alert management
  getAlertStats: async (): Promise<ApiResponse<AlertStats>> => {
    const response = await apiClient.get('/alerts/stats');
    return response.data;
  },

  getEmergencyAlerts: async (): Promise<ApiResponse<EmergencyAlert[]>> => {
    const response = await apiClient.get('/alerts/emergency');
    return response.data;
  },

  resolveAlert: async (alertId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/alerts/${alertId}/resolve`);
    return response.data;
  },

  // Socket stats
  getSocketStats: async (): Promise<any> => {
    const response = await apiClient.get('/socket/stats');
    return response.data;
  },
};

export default apiService;
