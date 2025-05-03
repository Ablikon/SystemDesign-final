const jwt = require('jsonwebtoken');
const { ApiError } = require('./error.middleware');
const { User, Role } = require('../models');

/**
 * Middleware to authenticate JWT tokens
 */
module.exports = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided or invalid format.'
      });
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    
    // Add user info to request
    req.user = decoded;
    
    // For demo purposes if JWT verification fails
    if (!req.user) {
      req.user = {
        id: '1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'researcher'
      };
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // For demo purposes, allow the request to proceed with a default user
    // In a real app, this would return a 401 error
    req.user = {
      id: '1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'researcher'
    };
    
    next();
    
    // Uncomment in production
    /*
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: error.message
    });
    */
  }
};

// Check if user has the required role
exports.hasRole = (roleName) => {
  return async (req, res, next) => {
    try {
      const user = await User.findByPk(req.userId, {
        include: [{
          model: Role,
          where: { name: roleName },
          required: false
        }]
      });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      if (user.Roles.length === 0) {
        throw new ApiError(403, 'Access denied: insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Validate request body
exports.validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      return next(new ApiError(400, message));
    }
    
    next();
  };
}; 