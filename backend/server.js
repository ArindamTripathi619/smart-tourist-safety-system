const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { createServer } = require('http');
require('dotenv').config();

// Import database connection and routes
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const verificationRoutes = require('./routes/verification');
const SocketHandler = require('./socket/socketHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server for Socket.IO
const server = createServer(app);

// Initialize Socket.IO
const socketHandler = new SocketHandler(server);

// Connect to database
connectDB();

// Middleware - Configure helmet to allow Socket.IO CDN
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://cdn.socket.io",
        "https://unpkg.com"
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: [
        "'self'", 
        "ws://10.5.120.254:5000",
        "wss://10.5.120.254:5000",
        "http://10.5.120.254:5000"
      ]
    }
  }
}));
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for monitoring dashboard)
app.use(express.static(require('path').join(__dirname, 'public')));

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Tourist Safety System API',
    version: '1.0.0',
    status: 'running'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', verificationRoutes);

// Socket.IO stats endpoint
app.get('/api/socket/stats', (req, res) => {
  res.json(socketHandler.getStats());
});

// Alert statistics endpoint
app.get('/api/alerts/stats', (req, res) => {
  const stats = socketHandler.getAlertStats();
  res.json({
    success: true,
    stats: {
      totalAlerts: stats.totalAlerts || 0,
      activeAlerts: stats.activeAlerts || 0,
      resolvedAlerts: stats.resolvedAlerts || 0,
      lastAlert: stats.lastAlert || null
    }
  });
});

// Get all emergency alerts (for admin)
app.get('/api/alerts/emergency', (req, res) => {
  const alerts = socketHandler.getEmergencyAlerts();
  res.json({
    success: true,
    alerts: alerts || []
  });
});

// Resolve an alert (for admin)
app.post('/api/alerts/:alertId/resolve', (req, res) => {
  const { alertId } = req.params;
  const resolved = socketHandler.resolveAlert(alertId);
  
  if (resolved) {
    res.json({
      success: true,
      message: 'Alert resolved successfully'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Alert not found'
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    socketStats: socketHandler.getStats()
  });
});

// Legacy routes (remove these once new auth routes are working)
app.post('/api/auth/register', (req, res) => {
  res.json({ message: 'Use POST /api/auth/register instead' });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ message: 'Use POST /api/auth/login instead' });
});

// Tourist routes (placeholder)
app.get('/api/tourist/profile', (req, res) => {
  // TODO: Get tourist profile
  res.json({ message: 'Tourist profile endpoint - Coming soon!' });
});

// Emergency routes (placeholder)
app.post('/api/emergency/panic', (req, res) => {
  // TODO: Handle panic button
  res.json({ message: 'Panic button endpoint - Coming soon!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server with Socket.IO running on port ${PORT}`);
  console.log(`📱 Smart Tourist Safety System API`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server ready for real-time connections`);
});

module.exports = app;
