const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user data to request
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.header('x-auth-token') ||
                  req.query.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied',
        errorCode: 'NO_TOKEN'
      });
    }

    // Verify token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find user by ID from token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user not found',
        errorCode: 'USER_NOT_FOUND'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
        errorCode: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        errorCode: 'INVALID_TOKEN'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        errorCode: 'TOKEN_EXPIRED'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      errorCode: 'AUTH_SERVER_ERROR'
    });
  }
};

/**
 * Optional Auth Middleware
 * Same as auth but doesn't fail if no token is provided
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.header('x-auth-token') ||
                  req.query.token;

    if (!token) {
      req.user = null;
      return next();
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    
    if (user && user.isActive) {
      req.user = user;
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // For optional auth, we don't fail on token errors
    req.user = null;
    next();
  }
};

/**
 * Admin Only Middleware
 * Requires authentication and admin role
 */
const adminOnly = async (req, res, next) => {
  try {
    // First run auth middleware
    await auth(req, res, () => {});

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        errorCode: 'AUTH_REQUIRED'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
        errorCode: 'ADMIN_REQUIRED'
      });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authorization',
      errorCode: 'ADMIN_SERVER_ERROR'
    });
  }
};

/**
 * Authority Only Middleware
 * For government authorities and admin users
 */
const authorityOnly = async (req, res, next) => {
  try {
    await auth(req, res, () => {});

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        errorCode: 'AUTH_REQUIRED'
      });
    }

    const allowedRoles = ['admin', 'authority', 'police', 'tourism_official'];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Authority access required',
        errorCode: 'AUTHORITY_REQUIRED'
      });
    }

    next();
  } catch (error) {
    console.error('Authority middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authorization',
      errorCode: 'AUTHORITY_SERVER_ERROR'
    });
  }
};

/**
 * Rate Limiting Middleware
 * Simple in-memory rate limiting for API protection
 */
const createRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requests.has(clientId)) {
      requests.set(clientId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const clientData = requests.get(clientId);
    
    if (now > clientData.resetTime) {
      // Reset window
      clientData.count = 1;
      clientData.resetTime = now + windowMs;
      return next();
    }

    if (clientData.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        errorCode: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
    }

    clientData.count++;
    next();
  };
};

/**
 * Generate JWT Token
 * Utility function for creating tokens
 */
const generateToken = (userId, expiresIn = '7d') => {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  
  return jwt.sign(
    { id: userId },
    JWT_SECRET,
    { expiresIn }
  );
};

/**
 * Verify JWT Token
 * Utility function for token verification
 */
const verifyToken = (token) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  auth,
  optionalAuth,
  adminOnly,
  authorityOnly,
  createRateLimit,
  generateToken,
  verifyToken
};
