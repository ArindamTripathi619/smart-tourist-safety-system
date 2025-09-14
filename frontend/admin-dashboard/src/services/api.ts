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
};

export default apiService;
