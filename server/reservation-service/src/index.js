const express = require('express');
const cors = require('cors');
const { sequelize, syncDatabase } = require('./models');
const reservationRoutes = require('./routes/reservation.routes');
const { errorHandler } = require('./middleware/error.middleware');
const logger = require('./utils/logger');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id'],
  credentials: true,
  maxAge: 86400 // Cache preflight request for 1 day
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Add middleware to handle any database errors
app.use((req, res, next) => {
  // Attach sequelize to request for controllers to use
  req.sequelize = sequelize;
  next();
});

// Routes
app.use('/api/reservations', reservationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'reservation-service' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Try to sync database with force to reset if needed
    const shouldReset = process.env.RESET_DB === 'true';
    const syncResult = await syncDatabase(shouldReset);
    
    if (!syncResult) {
      logger.warn('Database sync had issues - continuing with caution');
    }

    // Start listening
    app.listen(PORT, () => {
      logger.info(`Reservation service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    // Continue anyway to prevent container from crashing
    app.listen(PORT, () => {
      logger.info(`Reservation service running on port ${PORT} (with errors)`);
    });
  }
}

startServer(); 