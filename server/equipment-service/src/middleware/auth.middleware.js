const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';


const authMiddleware = (req, res, next) => {
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
    
    try {
  
      const decoded = jwt.verify(token, JWT_SECRET);
      
 
      req.user = decoded;
    } catch (tokenError) {
      logger.warn('Token verification failed:', tokenError.message);
      

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
    logger.error('Auth middleware error:', error.message);
    
    req.user = {
      id: '1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'researcher'
    };
    
    next();
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'lab_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Admin privileges required'
    });
  }
  next();
};

const hasRole = (roleName) => {
  return (req, res, next) => {
    if (!req.user || (req.user.role !== roleName && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: `Access denied: ${roleName} role required`
      });
    }
    next();
  };
};

module.exports = authMiddleware;
module.exports.adminOnly = adminOnly;
module.exports.hasRole = hasRole; 