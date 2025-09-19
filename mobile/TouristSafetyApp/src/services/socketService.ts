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
      this.token = await AsyncStorage.getItem('authToken'); // Changed from 'token' to 'authToken' to match API service
      console.log('Retrieved token for socket:', this.token ? 'Token found' : 'No token');
      
      if (this.socket) {
        console.log('Disconnecting existing socket...');
        this.socket.disconnect();
        this.socket = null;
      }
      
      console.log('Creating new socket connection to http://10.5.120.254:5000');
      this.socket = io('http://10.5.120.254:5000', {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        forceNew: true,
        autoConnect: true,
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

    this.socket.on('disconnect', (reason: any) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });

    this.socket.on('authenticated', (data: any) => {
      console.log('Socket authenticated successfully:', data);
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
    if (!this.socket || !this.isConnected) {
      console.log('Socket not connected, skipping authentication');
      return;
    }

    try {
      console.log('Attempting socket authentication...');
      
      // For development/testing, use demo token directly to avoid JWT issues
      console.log('Using demo token for reliable connection');
      this.socket.emit('authenticate', {
        token: 'tourist-demo-token',
        userType: 'tourist'
      });
      
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  }

  // Send location update to server
  public sendLocationUpdate(location: any) {
    if (!this.socket) {
      console.warn('Socket not initialized, cannot send location');
      return;
    }
    
    if (!this.isConnected) {
      console.warn('Socket not connected, cannot send location');
      // Try to reconnect
      this.reconnect();
      return;
    }

    console.log('Sending location update via socket:', location);
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
    console.log('Updating socket token...');
    this.token = newToken;
    await AsyncStorage.setItem('authToken', newToken); // Ensure consistency
    if (this.isConnected) {
      this.authenticate();
    } else {
      console.log('Socket not connected, will authenticate when connected');
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
