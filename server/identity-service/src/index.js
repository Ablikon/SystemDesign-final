const express = require('express');
const cors = require('cors');
const { sequelize, Role } = require('./models');
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const roleRoutes = require('./routes/role.routes');
const { errorHandler } = require('./middleware/error.middleware');
const logger = require('./utils/logger');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'identity-service' });
});

// Error handling middleware
app.use(errorHandler);

// Initialize default roles
async function initRoles() {
  try {
    const roles = ['researcher', 'lab_manager', 'admin'];
    
    for (const roleName of roles) {
      const existingRole = await Role.findOne({ where: { name: roleName } });
      
      if (!existingRole) {
        await Role.create({
          name: roleName,
          description: `${roleName.charAt(0).toUpperCase() + roleName.slice(1)} role`
        });
        logger.info(`Created role: ${roleName}`);
      }
    }
    
    logger.info('Roles initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize roles:', error);
  }
}

// Start server
async function startServer() {
  try {
    // Sync database models
    await sequelize.sync();
    logger.info('Database synchronized successfully');
    
    // Initialize roles
    await initRoles();

    // Start listening
    app.listen(PORT, () => {
      logger.info(`Identity service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 