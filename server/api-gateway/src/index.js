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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased from 100 to 500 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later'
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

// Temporary endpoint routes until microservices are fully implemented
// Dashboard statistics
app.get('/dashboard/stats', (req, res) => {
  logger.info('Processing dashboard stats request');
  return res.status(200).json({
    upcomingReservations: 3,
    pastReservations: 12,
    favoriteEquipment: 5
  });
});

// Recent reservations
app.get('/reservations/recent', (req, res) => {
  logger.info('Processing recent reservations request');
  return res.status(200).json([
    { id: 1, equipmentName: "Electron Microscope", date: "2025-05-10", status: "Approved" },
    { id: 2, equipmentName: "Spectrophotometer", date: "2025-05-15", status: "Pending" },
    { id: 3, equipmentName: "NMR Spectrometer", date: "2025-05-20", status: "Approved" }
  ]);
});

// Notifications
app.get('/notifications', (req, res) => {
  logger.info('Processing notifications request');
  return res.status(200).json([
    { id: 1, message: "Your reservation for Electron Microscope has been approved", date: "2025-05-01", read: false },
    { id: 2, message: "New equipment added: Thermal Cycler", date: "2025-04-29", read: true },
    { id: 3, message: "Your report for NMR Spectrometer usage is due tomorrow", date: "2025-04-28", read: false }
  ]);
});

// User activity
app.get('/user/activity', (req, res) => {
  logger.info('Processing user activity request');
  return res.status(200).json([
    { id: 1, type: 'Reservation', date: '2025-04-28', description: 'Reserved Electron Microscope' },
    { id: 2, type: 'Data Upload', date: '2025-04-25', description: 'Uploaded research findings' },
    { id: 3, type: 'Equipment Use', date: '2025-04-22', description: 'Used DNA Sequencer' }
  ]);
});

// User favorites
app.get('/user/favorites', (req, res) => {
  logger.info('Processing user favorites request');
  return res.status(200).json([
    { id: 101, name: 'Electron Microscope', facility: 'Imaging Center' },
    { id: 102, name: 'Mass Spectrometer', facility: 'Chemical Analysis Lab' },
    { id: 103, name: 'DNA Sequencer', facility: 'Genomics Department' }
  ]);
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
      
      // Получаем данные из ответа сервера
      const responseData = response.data;
      
      // Гарантируем, что ответ имеет ожидаемую структуру
      // Формат: { success: true, data: { user: {...}, token: '...' } }
      let formattedResponse = {
        success: true,
        data: {
          token: '',
          user: {}
        }
      };
      
      // Проверяем различные варианты структуры ответа и нормализуем
      if (responseData.success === true && responseData.data && 
          responseData.data.token && responseData.data.user) {
        // Уже в нужном формате
        formattedResponse = responseData;
      }
      else if (responseData.token && responseData.user) {
        // Вариант: { token, user }
        formattedResponse.data.token = responseData.token;
        formattedResponse.data.user = responseData.user;
      }
      else if (responseData.data && responseData.data.token && responseData.data.user) {
        // Вариант: { data: { token, user } } без success
        formattedResponse.data = responseData.data;
      }
      else {
        // Поиск token и user в любой структуре
        formattedResponse.data.token = responseData.token || 
                                      (responseData.data && responseData.data.token) || 
                                      '';
        formattedResponse.data.user = responseData.user || 
                                     (responseData.data && responseData.data.user) || 
                                     { email };
      }
      
      logger.info('Formatted login response structure:', 
                 JSON.stringify({
                   success: formattedResponse.success,
                   dataExists: !!formattedResponse.data,
                   tokenExists: !!formattedResponse.data.token,
                   userExists: !!formattedResponse.data.user
                 }));
      
      return res.status(200).json(formattedResponse);
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

// Добавим прямой эндпоинт для получения резерваций
app.get('/api/reservations-direct', (req, res) => {
  const { userId } = req.query;
  
  logger.info(`Direct reservations endpoint called for userId: ${userId}`);
  
  // Создаем имитированные данные для резерваций
  const mockReservations = [
    {
      id: '1',
      userId: userId || 'b2334c2f-1515-420f-9b27-c4a41b1be7a2',
      equipmentId: '1',
      startTime: '2025-05-10T10:00:00Z',
      endTime: '2025-05-11T10:00:00Z',
      status: 'pending',
      purpose: 'Research',
      notes: 'First test reservation',
      createdAt: '2023-05-01T12:00:00Z',
      updatedAt: '2023-05-01T12:00:00Z',
      approval: {
        id: '101',
        reservationId: '1',
        status: 'pending',
        approvalHistory: [
          {
            status: 'pending',
            date: '2023-05-01T12:00:00Z',
            comments: 'Waiting for approval'
          }
        ]
      },
      usageRecord: {
        id: '201',
        reservationId: '1',
        status: 'not_started'
      }
    },
    {
      id: '2',
      userId: userId || 'b2334c2f-1515-420f-9b27-c4a41b1be7a2',
      equipmentId: '2',
      startTime: '2025-06-15T14:00:00Z',
      endTime: '2025-06-16T14:00:00Z',
      status: 'approved',
      purpose: 'Analysis',
      notes: 'Second test reservation',
      createdAt: '2023-05-05T15:30:00Z',
      updatedAt: '2023-05-06T10:00:00Z',
      approval: {
        id: '102',
        reservationId: '2',
        status: 'approved',
        approvalHistory: [
          {
            status: 'pending',
            date: '2023-05-05T15:30:00Z',
            comments: 'Waiting for approval'
          },
          {
            status: 'approved',
            date: '2023-05-06T10:00:00Z',
            comments: 'Approved'
          }
        ]
      },
      usageRecord: {
        id: '202',
        reservationId: '2',
        status: 'not_started'
      }
    }
  ];
  
  return res.status(200).json({
    success: true,
    data: mockReservations,
    pagination: {
      total: mockReservations.length,
      page: 1,
      limit: 10,
      pages: 1
    },
    message: 'Mock reservations data'
  });
});

// Добавим прямой эндпоинт для создания резерваций
app.post('/api/reservations-direct', (req, res) => {
  const { equipmentId, startTime, endTime, purpose, notes } = req.body;
  const authHeader = req.headers.authorization;
  
  logger.info('Direct reservation creation endpoint called');
  logger.info(`Request body: ${JSON.stringify(req.body)}`);
  
  // Извлекаем userId из токена или используем тестовый ID
  let userId = 'b2334c2f-1515-420f-9b27-c4a41b1be7a2';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token === 'test_token_123456789') {
      userId = '12345';
    }
  }
  
  // Создаем новую резервацию с имитированными данными
  const newReservation = {
    id: `res-${Date.now()}`,
    userId,
    equipmentId,
    startTime,
    endTime,
    status: 'pending',
    purpose,
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approval: {
      id: `app-${Date.now()}`,
      reservationId: `res-${Date.now()}`,
      status: 'pending',
      approvalHistory: [
        {
          status: 'pending',
          date: new Date().toISOString(),
          comments: 'Reservation created, awaiting approval'
        }
      ]
    },
    usageRecord: {
      id: `usage-${Date.now()}`,
      reservationId: `res-${Date.now()}`,
      status: 'not_started'
    }
  };
  
  return res.status(201).json({
    success: true,
    data: newReservation,
    message: 'Mock reservation created successfully'
  });
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