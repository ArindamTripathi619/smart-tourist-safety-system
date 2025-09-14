const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Tourist Safety System API',
    version: '1.0.0',
    status: 'running'
  });
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// User routes (placeholder)
app.post('/api/auth/register', (req, res) => {
  // TODO: Implement user registration
  res.json({ message: 'User registration endpoint - Coming soon!' });
});

app.post('/api/auth/login', (req, res) => {
  // TODO: Implement user login
  res.json({ message: 'User login endpoint - Coming soon!' });
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Smart Tourist Safety System API`);
  console.log(`🌐 http://localhost:${PORT}`);
});

module.exports = app;
