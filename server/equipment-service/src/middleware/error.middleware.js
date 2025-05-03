const logger = require('../utils/logger');

/**
 * Custom API Error class for meaningful error responses
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle 404 errors for routes that don't exist
 */
const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route not found - ${req.originalUrl}`);
  next(error);
};

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 if no status code is set
  const statusCode = err.statusCode || 500;
  
  // Log the error for server debugging
  console.error(`[ERROR] ${err.name}: ${err.message}`);
  if (statusCode === 500) {
    console.error(err.stack);
  }
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = {
  ApiError,
  notFound,
  errorHandler
}; 