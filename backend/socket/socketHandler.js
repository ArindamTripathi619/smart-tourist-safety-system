const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

class SocketHandler {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: true, // Allow all origins
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['*']
      },
      transports: ['polling', 'websocket'], // Try polling first
      allowEIO3: true, // Allow Engine.IO v3 clients
      pingTimeout: 60000,
      pingInterval: 25000
    });
    
    this.connectedUsers = new Map(); // Store user connections
    this.userLocations = new Map(); // Store latest user locations
    
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      // Authenticate user on connection
      socket.on('authenticate', (data) => {
        try {
          const { token, userType } = data;
          
          // Handle demo tokens for development/testing
          if (token === 'admin-demo-token' && userType === 'admin') {
            socket.userId = 'demo-admin';
            socket.userType = 'admin';
            socket.digitalId = 'DEMO-ADMIN';
            
            this.connectedUsers.set('demo-admin', {
              socketId: socket.id,
              userType: 'admin',
              digitalId: 'DEMO-ADMIN',
              connectedAt: new Date(),
              isDemoUser: true
            });

            socket.emit('authenticated', {
              success: true,
              userId: 'demo-admin',
              userType: 'admin'
            });

            console.log('Demo admin authenticated');
            
            // Send current user count to admins
            this.broadcastToAdmins('user_stats', {
              totalConnected: this.connectedUsers.size,
              onlineTourists: Array.from(this.connectedUsers.values()).filter(u => u.userType === 'tourist').length
            });
            return;
          }
          
          // Handle demo tokens for tourists
          if (token === 'tourist-demo-token' && userType === 'tourist') {
            const demoUserId = `demo-tourist-${socket.id.slice(-6)}`;
            socket.userId = demoUserId;
            socket.userType = 'tourist';
            socket.digitalId = `DEMO-${socket.id.slice(-6)}`;
            
            this.connectedUsers.set(demoUserId, {
              socketId: socket.id,
              userType: 'tourist',
              digitalId: socket.digitalId,
              connectedAt: new Date(),
              isDemoUser: true
            });

            socket.emit('authenticated', {
              success: true,
              userId: demoUserId,
              userType: 'tourist'
            });

            console.log(`Demo tourist authenticated: ${demoUserId}`);
            
            // Send current user count to admins
            this.broadcastToAdmins('user_stats', {
              totalConnected: this.connectedUsers.size,
              onlineTourists: Array.from(this.connectedUsers.values()).filter(u => u.userType === 'tourist').length
            });
            return;
          }
          
          // Handle real JWT tokens
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
          
          socket.userId = decoded.userId;
          socket.userType = userType; // 'tourist' or 'admin'
          socket.digitalId = decoded.digitalId;
          
          this.connectedUsers.set(socket.userId, {
            socketId: socket.id,
            userType,
            digitalId: decoded.digitalId,
            connectedAt: new Date()
          });

          socket.emit('authenticated', {
            success: true,
            userId: socket.userId,
            userType: socket.userType
          });

          console.log(`User authenticated: ${socket.userId} (${userType})`);
          
          // Send current user count to admins
          this.broadcastToAdmins('user_stats', {
            totalConnected: this.connectedUsers.size,
            onlineTourists: Array.from(this.connectedUsers.values()).filter(u => u.userType === 'tourist').length
          });

        } catch (error) {
          // Only log authentication errors once per socket to avoid spam
          if (!socket._authErrorLogged) {
            console.log(`Socket authentication failed for ${socket.id}: Invalid token`);
            socket._authErrorLogged = true;
          }
          socket.emit('auth_error', { message: 'Authentication failed - Invalid token' });
        }
      });

      // Handle location updates from mobile app
      socket.on('location_update', (locationData) => {
        if (!socket.userId) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }

        const enhancedLocationData = {
          userId: socket.userId,
          digitalId: socket.digitalId,
          ...locationData,
          timestamp: new Date(),
          socketId: socket.id
        };

        // Store latest location
        this.userLocations.set(socket.userId, enhancedLocationData);

        // Broadcast location to admins in real-time
        this.broadcastToAdmins('location_update', enhancedLocationData);

        console.log(`Location update from user ${socket.userId}:`, locationData);
      });

      // Handle emergency alerts
      socket.on('emergency_alert', (alertData) => {
        if (!socket.userId) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }

        const emergencyData = {
          userId: socket.userId,
          digitalId: socket.digitalId,
          type: 'EMERGENCY',
          location: alertData.location,
          timestamp: new Date(),
          status: 'ACTIVE',
          message: alertData.message || 'Emergency alert triggered'
        };

        // Store emergency alert
        console.log(`EMERGENCY ALERT from user ${socket.userId}:`, emergencyData);

        // Immediately broadcast to all admins
        this.broadcastToAdmins('emergency_alert', emergencyData);

        // Send confirmation to user
        socket.emit('emergency_sent', {
          success: true,
          alertId: `ALERT_${Date.now()}`,
          message: 'Emergency alert sent to authorities'
        });
      });

      // Handle admin requests for user locations
      socket.on('get_user_locations', () => {
        if (socket.userType !== 'admin') {
          socket.emit('error', { message: 'Unauthorized access' });
          return;
        }

        const allLocations = Array.from(this.userLocations.values());
        socket.emit('user_locations', allLocations);
      });

      // Handle admin requests for online users
      socket.on('get_online_users', () => {
        if (socket.userType !== 'admin') {
          socket.emit('error', { message: 'Unauthorized access' });
          return;
        }

        const onlineUsers = Array.from(this.connectedUsers.entries()).map(([userId, userData]) => ({
          userId,
          ...userData,
          lastLocation: this.userLocations.get(userId) || null
        }));

        socket.emit('online_users', onlineUsers);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
          
          // Update admin dashboards
          this.broadcastToAdmins('user_stats', {
            totalConnected: this.connectedUsers.size,
            onlineTourists: Array.from(this.connectedUsers.values()).filter(u => u.userType === 'tourist').length
          });
          
          console.log(`User disconnected: ${socket.userId}`);
        }
      });

      // Ping/Pong for connection health
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: new Date() });
      });
    });
  }

  // Broadcast message to all connected admins
  broadcastToAdmins(event, data) {
    const adminSockets = Array.from(this.connectedUsers.entries())
      .filter(([userId, userData]) => userData.userType === 'admin')
      .map(([userId, userData]) => userData.socketId);

    adminSockets.forEach(socketId => {
      this.io.to(socketId).emit(event, data);
    });
  }

  // Send message to specific user
  sendToUser(userId, event, data) {
    const userData = this.connectedUsers.get(userId);
    if (userData) {
      this.io.to(userData.socketId).emit(event, data);
    }
  }

  // Get current stats
  getStats() {
    return {
      totalConnected: this.connectedUsers.size,
      onlineTourists: Array.from(this.connectedUsers.values()).filter(u => u.userType === 'tourist').length,
      onlineAdmins: Array.from(this.connectedUsers.values()).filter(u => u.userType === 'admin').length,
      totalLocationsTracked: this.userLocations.size
    };
  }
}

module.exports = SocketHandler;
