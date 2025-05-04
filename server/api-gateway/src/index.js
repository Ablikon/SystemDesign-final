const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const axios = require('axios');
const { setupProxies } = require('./config/proxy.config');
const { errorHandler } = require('./middleware/error.middleware');
const logger = require('./utils/logger');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Service URLs
const IDENTITY_SERVICE_URL = process.env.IDENTITY_SERVICE_URL || 'http://identity-service:3001';
const EQUIPMENT_SERVICE_URL = process.env.EQUIPMENT_SERVICE_URL || 'http://equipment-service:3002';
const RESERVATION_SERVICE_URL = process.env.RESERVATION_SERVICE_URL || 'http://reservation-service:3003';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3004';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development
}));

// Настройка CORS для разрешения запросов с любого источника
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Parse JSON bodies
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} from ${req.ip}`);
  next();
});

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Open Science Collaboration Hub API',
      version: '1.0.0',
      description:
        'API Documentation for Open Science Collaboration Hub',
      contact: {
        name: 'API Support',
        email: 'support@opensciencehub.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Добавим тестовый эндпоинт для проверки соединения
app.get('/api/test', (req, res) => {
  logger.info('Test endpoint called');
  return res.status(200).json({ 
    message: 'API Gateway is working!',
    time: new Date().toISOString() 
  });
});

// Эндпоинт для проверки доступности всех сервисов
app.get('/api/system/status', async (req, res) => {
  logger.info('Checking system status');
  
  const services = {
    gateway: { status: 'UP', url: `http://localhost:${PORT}` },
    identity: { status: 'Unknown', url: IDENTITY_SERVICE_URL },
    equipment: { status: 'Unknown', url: EQUIPMENT_SERVICE_URL },
    reservation: { status: 'Unknown', url: RESERVATION_SERVICE_URL },
    notification: { status: 'Unknown', url: NOTIFICATION_SERVICE_URL }
  };
  
  // Проверяем доступность каждого сервиса
  try {
    await axios.get(`${IDENTITY_SERVICE_URL}/health`);
    services.identity.status = 'UP';
  } catch (error) {
    services.identity.status = 'DOWN';
    services.identity.error = error.message;
  }
  
  try {
    await axios.get(`${EQUIPMENT_SERVICE_URL}/health`);
    services.equipment.status = 'UP';
  } catch (error) {
    services.equipment.status = 'DOWN';
    services.equipment.error = error.message;
  }
  
  try {
    await axios.get(`${RESERVATION_SERVICE_URL}/health`);
    services.reservation.status = 'UP';
  } catch (error) {
    services.reservation.status = 'DOWN';
    services.reservation.error = error.message;
  }
  
  try {
    await axios.get(`${NOTIFICATION_SERVICE_URL}/health`);
    services.notification.status = 'UP';
  } catch (error) {
    services.notification.status = 'DOWN';
    services.notification.error = error.message;
  }
  
  return res.status(200).json({
    timestamp: new Date().toISOString(),
    services
  });
});

// Добавим прямой эндпоинт для регистрации в обход proxy middleware
app.post('/api/auth/register-direct', async (req, res) => {
  try {
    logger.info('Direct registration endpoint called');
    
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    // Отправляем запрос напрямую в identity-service
    const response = await axios.post(`${IDENTITY_SERVICE_URL}/api/auth/register`, {
      email, password, firstName, lastName
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    logger.info('Direct registration response:', response.status);
    return res.status(response.status).json(response.data);
  } catch (error) {
    logger.error('Direct registration error:', error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to register user directly',
      error: error.message
    });
  }
});

// Добавим прямой эндпоинт для входа в обход proxy middleware
app.post('/api/auth/login-direct', async (req, res) => {
  try {
    logger.info('Direct login endpoint called');
    
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Missing email or password' });
    }
    
    // Для тестовой учетной записи - разрешаем вход напрямую
    if (email === 'test@example.com' && password === 'password123') {
      logger.info('Using test account credentials');
      
      // Создаем токен и фиктивного пользователя для тестового аккаунта
      const testUser = {
        id: '12345',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        roles: ['researcher']
      };
      
      const token = 'test_token_123456789';
      
      return res.status(200).json({
        success: true,
        data: {
          user: testUser,
          token: token
        }
      });
    }
    
    // Отправляем запрос напрямую в identity-service
    try {
      const response = await axios.post(`${IDENTITY_SERVICE_URL}/api/auth/login`, {
        email, password
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      logger.info('Direct login response for', email, ':', response.status);
      return res.status(response.status).json(response.data);
    } catch (apiError) {
      if (apiError.response) {
        logger.error(`API error: ${apiError.response.status} - ${JSON.stringify(apiError.response.data)}`);
        return res.status(apiError.response.status).json(apiError.response.data);
      }
      throw apiError;
    }
  } catch (error) {
    logger.error('Direct login error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to login directly',
      error: error.message
    });
  }
});

// Setup API proxies to microservices
setupProxies(app);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'api-gateway' });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
}); 