const jwt = require('jsonwebtoken');
const { ApiError } = require('./error.middleware');
const { User, Role } = require('../models');

// Verify JWT token middleware
exports.verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-secret-key'
    );
    
    // Set user ID in request object
    req.userId = decoded.id;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new ApiError(401, 'Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      next(new ApiError(401, 'Token expired'));
    } else {
      next(error);
    }
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