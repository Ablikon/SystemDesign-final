const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Role } = require('../models');
const logger = require('../utils/logger');

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
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user in database
    const newUser = await User.create({
      email,
      password, // Will be hashed by the beforeCreate hook in the model
      firstName,
      lastName,
      institution: institution || '',
      researchInterests: researchInterests || []
    });

    // Find the researcher role
    const researcherRole = await Role.findOne({ where: { name: 'researcher' } });
    
    // Assign researcher role to user
    if (researcherRole) {
      await newUser.addRole(researcherRole);
    }

    // Generate token
    const token = jwt.sign(
      { id: newUser.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    logger.info(`New user registered: ${email}`);

    // Return user data and token
    return res.status(201).json({
      success: true,
      data: {
        user: newUser.toJSON(),
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
    const user = await User.findOne({ where: { email } });

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.validPassword(password);
    if (!isPasswordValid) {
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

    // Return user data and token
    return res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
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
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: Role,
          through: { attributes: [] }
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user.toJSON()
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