const express = require('express');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const router = express.Router();

// Mock users
const users = [
  {
    id: '1',
    email: 'john.doe@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    institution: 'Stanford University'
  }
];

// Simplified register endpoint
router.post('/register', (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    logger.info(`Registration attempt for: ${email}`);
    
    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Check for existing user
    if (users.find(u => u.email === email)) {
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      });
    }
    
    // Create new user
    const newUser = {
      id: (users.length + 1).toString(),
      email,
      password,
      firstName,
      lastName
    };
    
    // Add to users array
    users.push(newUser);
    
    // Generate token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      'secret-key',
      { expiresIn: '24h' }
    );
    
    // Return success
    return res.status(201).json({
      success: true,
      data: {
        user: { ...newUser, password: undefined },
        token
      }
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

// Simplified login endpoint
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    logger.info(`Login attempt for: ${email}`);
    
    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      'secret-key',
      { expiresIn: '24h' }
    );
    
    // Return success
    return res.status(200).json({
      success: true,
      data: {
        user: { ...user, password: undefined },
        token
      }
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Simplified me endpoint
router.get('/me', (req, res) => {
  // For simplicity, just return the first user
  const user = { ...users[0], password: undefined };
  
  return res.status(200).json({
    success: true,
    data: user
  });
});

module.exports = router; 