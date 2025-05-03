const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const equipmentRoutes = require('./routes/equipment.routes');
const categoryRoutes = require('./routes/category.routes');
const { errorHandler } = require('./middleware/error.middleware');
const logger = require('./utils/logger');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/equipment', equipmentRoutes);
app.use('/api/categories', categoryRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'equipment-service' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Sync database models
    await sequelize.sync();
    logger.info('Database synchronized successfully');

    // Start listening
    app.listen(PORT, () => {
      logger.info(`Equipment service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 