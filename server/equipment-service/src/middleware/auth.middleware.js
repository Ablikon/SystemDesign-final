const axios = require('axios');
const { ApiError } = require('./error.middleware');
const logger = require('../utils/logger');

// Identity service URL
const IDENTITY_SERVICE_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001';

// Middleware to verify JWT token
exports.verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided');
    }

    const token = authHeader.split(' ')[1];

    // Validate token with identity service
    try {
      const response = await axios.get(`${IDENTITY_SERVICE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // If valid, set userId in request
      req.userId = response.data.data.id;
      next();
    } catch (error) {
      logger.error('Token validation failed:', error.message);
      
      // Handle different error responses from identity service
      if (error.response) {
        throw new ApiError(
          error.response.status,
          error.response.data.message || 'Authentication failed'
        );
      } else {
        throw new ApiError(500, 'Identity service unavailable');
      }
    }
  } catch (error) {
    next(error);
  }
};

// Check if user has required roles (via Identity Service)
exports.hasRole = (roleName) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(401, 'No token provided');
      }

      const token = authHeader.split(' ')[1];

      // Get user roles from identity service
      try {
        const response = await axios.get(`${IDENTITY_SERVICE_URL}/api/users/${req.userId}/roles`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const roles = response.data.data.map(role => role.name);

        if (!roles.includes(roleName)) {
          throw new ApiError(403, 'Access denied: insufficient permissions');
        }

        next();
      } catch (error) {
        logger.error('Role validation failed:', error.message);
        
        if (error.response) {
          throw new ApiError(
            error.response.status,
            error.response.data.message || 'Permission check failed'
          );
        } else {
          throw new ApiError(500, 'Identity service unavailable');
        }
      }
    } catch (error) {
      next(error);
    }
  };
}; 