const express = require('express');
const cors = require('cors');
const { sequelize, Role } = require('./models');
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const roleRoutes = require('./routes/role.routes');
const { errorHandler } = require('./middleware/error.middleware');
const logger = require('./utils/logger');


const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors());
app.use(express.json());


app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'identity-service' });
});


app.use(errorHandler);

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


async function startServer() {
  try {

    await sequelize.sync();
    logger.info('Database synchronized successfully');
    

    await initRoles();


    app.listen(PORT, () => {
      logger.info(`Identity service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 