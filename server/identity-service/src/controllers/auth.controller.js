const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Mock users for in-memory storage
const users = [
  {
    id: '1',
    email: 'john.doe@example.com',
    password: '$2a$10$XHbkKJl95ZyDHAm9LYtY3.Rzy9T2T0isCZfm/4fNfXYAmzmGd8XIi', // 'password123'
    firstName: 'John',
    lastName: 'Doe',
    institution: 'Stanford University',
    researchInterests: ['Genetics', 'Bioinformatics']
  }
];

// Register a new user
exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, institution, researchInterests } = req.body;

    // Simple validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create a mock user (in a real app, we would hash the password)
    const newUser = {
      id: (users.length + 1).toString(),
      email,
      password, // In a real app, this would be hashed
      firstName,
      lastName,
      institution: institution || '',
      researchInterests: researchInterests || []
    };

    // Add to users array
    users.push(newUser);

    // Generate token
    const token = jwt.sign(
      { id: newUser.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    logger.info(`New user registered: ${email}`);

    // Don't send the password back
    const userResponse = { ...newUser };
    delete userResponse.password;

    // Return user data and token
    return res.status(201).json({
      success: true,
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);

    // Check if user exists and password is correct
    // In a real app, we would compare hashed passwords
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    logger.info(`User logged in: ${email}`);

    // Don't send the password back
    const userResponse = { ...user };
    delete userResponse.password;

    // Return user data and token
    return res.status(200).json({
      success: true,
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get current user profile
exports.me = async (req, res, next) => {
  try {
    // Find user by ID from token
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't send the password back
    const userResponse = { ...user };
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    logger.error(`Get profile error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Could not retrieve user profile',
      error: error.message
    });
  }
}; 