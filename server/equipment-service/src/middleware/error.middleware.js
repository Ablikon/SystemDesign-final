const logger = require('../utils/logger');

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route not found - ${req.originalUrl}`);
  next(error);
};


const errorHandler = (err, req, res, next) => {

  const statusCode = err.statusCode || 500;
  
  console.error(`[ERROR] ${err.name}: ${err.message}`);
  if (statusCode === 500) {
    console.error(err.stack);
  }
  
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