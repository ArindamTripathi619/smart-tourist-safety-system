import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SocketService {
  private socket: any = null;
  private isConnected = false;
  private token: string | null = null;
  
  constructor() {
    this.initializeSocket();
  }

  private async initializeSocket() {
    try {
      this.token = await AsyncStorage.getItem('token');
      
      this.socket = io('http://10.5.120.254:5000', {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Socket initialization error:', error);
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.isConnected = true;
      this.authenticate();
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('authenticated', (data: any) => {
      console.log('Socket authenticated:', data);
    });

    this.socket.on('auth_error', (error: any) => {
      console.error('Socket authentication error:', error);
    });

    this.socket.on('emergency_sent', (data: any) => {
      console.log('Emergency alert sent:', data);
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });

    this.socket.on('pong', (data: any) => {
      console.log('Pong received:', data);
    });
  }

  private async authenticate() {
    if (!this.socket || !this.token) return;

    try {
      this.socket.emit('authenticate', {
        token: this.token,
        userType: 'tourist'
      });
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  }

  // Send location update to server
  public sendLocationUpdate(location: any) {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected, cannot send location');
      return;
    }

    this.socket.emit('location_update', {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      timestamp: new Date(),
      source: 'mobile_app'
    });
  }

  // Send emergency alert
  public sendEmergencyAlert(location: any, message?: string) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected, cannot send emergency alert');
      return false;
    }

    this.socket.emit('emergency_alert', {
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy || 100
      },
      message: message || 'Emergency assistance needed',
      timestamp: new Date()
    });

    return true;
  }

  // Ping server to check connection
  public ping() {
    if (this.socket && this.isConnected) {
      this.socket.emit('ping');
    }
  }

  // Reconnect if needed
  public async reconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    
    await this.initializeSocket();
  }

  // Update token (when user logs in)
  public async updateToken(newToken: string) {
    this.token = newToken;
    if (this.isConnected) {
      this.authenticate();
    }
  }

  // Disconnect socket
  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  // Get connection status
  public getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null,
      hasToken: !!this.token
    };
  }

  // Subscribe to events
  public on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Unsubscribe from events
  public off(event: string, callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export default new SocketService();
