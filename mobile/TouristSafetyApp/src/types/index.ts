export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  emergencyContact: string;
  digitalId: string;
  createdAt: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  emergencyContact: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: Date;
  accuracy?: number;
  altitude?: number;
  speed?: number;
}

export interface EmergencyAlert {
  id?: string;
  type: 'panic' | 'medical' | 'theft' | 'other';
  message?: string;
  location: LocationData;
  timestamp?: Date;
  status?: 'sent' | 'received' | 'resolved';
}

export interface NavigationProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
    replace: (screen: string, params?: any) => void;
  };
  route?: {
    params?: any;
  };
}

export interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  location: LocationData | null;
  emergencyAlerts: EmergencyAlert[];
}

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  EmergencyAlert: undefined;
  Profile: undefined;
  LocationHistory: undefined;
  Settings: undefined;
};

export type TabStackParamList = {
  Dashboard: undefined;
  DigitalID: undefined;
  Location: undefined;
  Emergency: undefined;
  Profile: undefined;
};
