const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const memoryStore = require('../utils/memoryStore');

const router = express.Router();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Check if we should use in-memory store (when MongoDB is not available)
let useMemoryStore = false;

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').isMobilePhone().withMessage('Please provide a valid phone number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, password, phone, role = 'tourist' } = req.body;

    // Try MongoDB first, fallback to memory store
    let existingUser;
    let savedUser;
    
    try {
      // Try MongoDB
      existingUser = await User.findOne({ email });
    } catch (mongoError) {
      console.log('📊 MongoDB not available, using in-memory store for demo');
      useMemoryStore = true;
      existingUser = await memoryStore.findOne({ email });
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Generate digital ID
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const digitalId = `TID${timestamp}${random}`;

    if (useMemoryStore) {
      // For in-memory store, we need to hash manually
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const userData = {
        name,
        email,
        password: hashedPassword,
        phone,
        role,
        digitalId
      };
      
      savedUser = await memoryStore.save(userData);
    } else {
      // For MongoDB, let the model handle password hashing
      const user = new User({
        name,
        email,
        password, // Don't hash here - let the model do it
        phone,
        role,
        digitalId
      });
      
      savedUser = await user.save();
    }

    // Generate JWT token
    const token = generateToken(savedUser.id || savedUser._id);

    // Return user data (without password)
    const responseUser = {
      id: savedUser.id || savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      phone: savedUser.phone,
      role: savedUser.role,
      digitalId: savedUser.digitalId
    };

    res.status(201).json({
      success: true,
      message: useMemoryStore ? 
        'User registered successfully (using demo mode - no database)' : 
        'User registered successfully',
      token,
      user: responseUser,
      demo: useMemoryStore
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    console.log('Login attempt:', { email, passwordLength: password.length });

    // Try to find user (MongoDB or memory store)
    let user;
    try {
      user = await User.findOne({ email });
    } catch (mongoError) {
      console.log('📊 Using in-memory store for login');
      useMemoryStore = true;
      user = await memoryStore.findOne({ email });
    }

    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('User found:', { id: user.id || user._id, email: user.email });

    // Check password
    let isPasswordValid;
    if (useMemoryStore) {
      // For in-memory store, compare with bcrypt
      console.log('Comparing password with bcrypt (memory store)');
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // For MongoDB, use the model method
      console.log('Comparing password with model method (MongoDB)');
      isPasswordValid = await user.comparePassword(password);
    }

    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = generateToken(user.id || user._id);

    // Return user data (without password)
    const userData = {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      digitalId: user.digitalId
    };

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userData,
      demo: useMemoryStore
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
});

// @route   GET /api/auth/users
// @desc    Get all users (for testing/demo purposes)
// @access  Public (in production, make this admin-only)
router.get('/users', async (req, res) => {
  try {
    let users;
    
    if (useMemoryStore) {
      users = memoryStore.getAllUsers();
    } else {
      users = await User.find({}).select('-password');
    }

    res.json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        digitalId: user.digitalId,
        createdAt: user.createdAt
      })),
      demo: useMemoryStore
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users'
    });
  }
});

module.exports = router;
