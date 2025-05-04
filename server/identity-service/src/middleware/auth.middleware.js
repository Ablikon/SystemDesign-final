const jwt = require('jsonwebtoken');
const { ApiError } = require('./error.middleware');
const { User, Role } = require('../models');
const logger = require('../utils/logger');


const authenticate = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided or invalid format.'
      });
    }
    

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    

    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }
    

    req.user = decoded;
    
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: error.message
    });
  }
};

const hasRole = (roleName) => {
  return async (req, res, next) => {
    try {
      const user = await User.findByPk(req.user.id, {
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


const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      return next(new ApiError(400, message));
    }
    
    next();
  };
};

module.exports = {
  authenticate,
  hasRole,
  validateRequest
}; 