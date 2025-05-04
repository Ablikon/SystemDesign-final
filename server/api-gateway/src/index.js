const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const axios = require('axios');
const path = require('path');
const { setupProxies } = require('./config/proxy.config');
const { errorHandler } = require('./middleware/error.middleware');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 8080;

app.use('/images', express.static(path.join(__dirname, '../public/images')));

const IDENTITY_SERVICE_URL = process.env.IDENTITY_SERVICE_URL || 'http://identity-service:3001';
const EQUIPMENT_SERVICE_URL = process.env.EQUIPMENT_SERVICE_URL || 'http://equipment-service:3002';
const RESERVATION_SERVICE_URL = process.env.RESERVATION_SERVICE_URL || 'http://reservation-service:3003';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3004';


app.use(helmet({
  contentSecurityPolicy: false, 
}));


app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id'],
  credentials: true
}));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 500, 
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

app.use(express.json());

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} from ${req.ip}`);
  next();
});

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


app.get('/api/test', (req, res) => {
  logger.info('Test endpoint called');
  return res.status(200).json({ 
    message: 'API Gateway is working!',
    time: new Date().toISOString() 
  });
});


app.get('/dashboard/stats', (req, res) => {
  logger.info('Processing dashboard stats request');

  const authHeader = req.headers.authorization;
  const isAuthenticated = !!(authHeader && authHeader.startsWith('Bearer '));
  
  if (isAuthenticated) {
    return res.status(200).json({
      upcomingReservations: 3,
      pastReservations: 12,
      favoriteEquipment: 5,
      pendingApprovals: 2,
      totalUsageHours: 127,
      lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 дня назад
    });
  }
  
  return res.status(200).json({
    upcomingReservations: 0,
    pastReservations: 0,
    favoriteEquipment: 0
  });
});

app.get('/reservations/recent', (req, res) => {
  logger.info('Processing recent reservations request');
  
  const authHeader = req.headers.authorization;
  const isAuthenticated = !!(authHeader && authHeader.startsWith('Bearer '));
  const token = isAuthenticated ? authHeader.split(' ')[1] : null;
  
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  
  const reservations = [
    {
      id: '1001',
      equipmentId: '101',
      equipmentName: "Electron Microscope XL-30",
      userId: token === 'test_token_123456789' ? '12345' : 'b2334c2f-1515-420f-9b27-c4a41b1be7a2',
      date: "May 10, 2025",
      startTime: yesterday.toISOString(),
      endTime: new Date(yesterday.getTime() + 4 * 60 * 60 * 1000).toISOString(), // +4 часа
      status: "completed",
      purpose: "Research on cell structure",
      facility: "Imaging Center",
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '1002',
      equipmentId: '102',
      equipmentName: "Mass Spectrometer 5800",
      userId: token === 'test_token_123456789' ? '12345' : 'b2334c2f-1515-420f-9b27-c4a41b1be7a2',
      date: "Jun 15, 2025",
      startTime: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
      status: "canceled",
      purpose: "Protein analysis",
      facility: "Proteomics Lab",
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '1003',
      equipmentId: '103',
      equipmentName: "NMR Spectrometer",
      userId: token === 'test_token_123456789' ? '12345' : 'b2334c2f-1515-420f-9b27-c4a41b1be7a2',
      date: "May 25, 2025",
      startTime: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
      status: "canceled",
      purpose: "Chemical compound analysis",
      facility: "Chemistry Department",
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '1004',
      equipmentId: '104',
      equipmentName: "Confocal Microscope",
      userId: token === 'test_token_123456789' ? '12345' : 'b2334c2f-1515-420f-9b27-c4a41b1be7a2',
      date: "May 17, 2025",
      startTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(),
      status: "approved",
      purpose: "Cell imaging",
      facility: "Imaging Center",
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  return res.status(200).json(reservations);
});


app.get('/notifications', (req, res) => {
  logger.info('Processing notifications request');
  

  const authHeader = req.headers.authorization;
  const isAuthenticated = !!(authHeader && authHeader.startsWith('Bearer '));
  const token = isAuthenticated ? authHeader.split(' ')[1] : null;
  

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  
  const threeDaysAgo = new Date(now);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  const notifications = [
    {
      id: 'notif-1',
      userId: token === 'test_token_123456789' ? '12345' : 'b2334c2f-1515-420f-9b27-c4a41b1be7a2',
      message: "Your reservation for Electron Microscope XL-30 has been approved",
      date: yesterday.toISOString(),
      read: false,
      type: "reservation_approved",
      relatedId: "1001",
      createdAt: yesterday.toISOString()
    },
    {
      id: 'notif-2',
      userId: token === 'test_token_123456789' ? '12345' : 'b2334c2f-1515-420f-9b27-c4a41b1be7a2',
      message: "New equipment added: Thermal Cycler PCR-1000",
      date: twoDaysAgo.toISOString(),
      read: true,
      type: "equipment_added",
      relatedId: "105",
      createdAt: twoDaysAgo.toISOString()
    },
    {
      id: 'notif-3',
      userId: token === 'test_token_123456789' ? '12345' : 'b2334c2f-1515-420f-9b27-c4a41b1be7a2',
      message: "Your report for NMR Spectrometer usage is due tomorrow",
      date: threeDaysAgo.toISOString(),
      read: false,
      type: "report_reminder",
      relatedId: "report-7289",
      createdAt: threeDaysAgo.toISOString()
    },
    {
      id: 'notif-4',
      userId: token === 'test_token_123456789' ? '12345' : 'b2334c2f-1515-420f-9b27-c4a41b1be7a2',
      message: "Maintenance scheduled for Mass Spectrometer on May 15",
      date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(), 
      read: true,
      type: "maintenance_notice",
      relatedId: "maint-223",
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  return res.status(200).json(notifications);
});


app.get('/user/activity', (req, res) => {
  logger.info('Processing user activity request');
  

  const now = new Date();
  
  const activities = [
    { 
      id: 'act-1',
      type: 'Reservation',
      date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Reserved Electron Microscope XL-30'
    },
    { 
      id: 'act-2',
      type: 'Data Upload',
      date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Uploaded research findings from experiment #3942'
    },
    { 
      id: 'act-3',
      type: 'Equipment Use',
      date: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Used DNA Sequencer for 4 hours'
    },
    { 
      id: 'act-4',
      type: 'Report Submission',
      date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Submitted usage report for Mass Spectrometer'
    },
    { 
      id: 'act-5',
      type: 'Profile Update',
      date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Updated research interests and profile information'
    }
  ];
  
  return res.status(200).json(activities);
});


app.get('/user/favorites', (req, res) => {
  logger.info('Processing user favorites request');
  

  const favorites = [
    { 
      id: 101, 
      name: 'Electron Microscope XL-30', 
      facility: 'Imaging Center',
      type: 'microscopy',
      lastUsed: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    },
    { 
      id: 102, 
      name: 'Mass Spectrometer 5800', 
      facility: 'Chemical Analysis Lab',
      type: 'spectroscopy',
      lastUsed: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
    },
    { 
      id: 103, 
      name: 'DNA Sequencer', 
      facility: 'Genomics Department',
      type: 'sequencing',
      lastUsed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    { 
      id: 104, 
      name: 'NMR Spectrometer', 
      facility: 'Chemistry Department',
      type: 'spectroscopy',
      lastUsed: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    },
    { 
      id: 105, 
      name: 'Thermal Cycler PCR-1000', 
      facility: 'Molecular Biology Lab',
      type: 'pcr',
      lastUsed: null 
    }
  ];
  
  return res.status(200).json(favorites);
});


const mockReservationsStore = [
  {
    id: '1',
    userId: 'b2334c2f-1515-420f-9b27-c4a41b1be7a2',
    equipmentId: '1',
    startTime: '2025-05-10T10:00:00Z',
    endTime: '2025-05-11T10:00:00Z',
    status: 'approved', 
    purpose: 'Research',
    notes: 'First test reservation',
    createdAt: '2023-05-01T12:00:00Z',
    updatedAt: '2023-05-01T12:00:00Z',
    approval: {
      id: '101',
      reservationId: '1',
      status: 'approved',
      approvalHistory: [
        {
          status: 'pending',
          date: '2023-05-01T12:00:00Z',
          comments: 'Waiting for approval'
        },
        {
          status: 'approved',
          date: '2023-05-02T12:00:00Z',
          comments: 'Approved automatically'
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
    userId: 'b2334c2f-1515-420f-9b27-c4a41b1be7a2',
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
          comments: 'Approved automatically'
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


app.get('/api/reservations-direct', (req, res) => {
  const { userId } = req.query;
  
  logger.info(`Direct reservations endpoint called for userId: ${userId}`);
  

  let userReservations = [...mockReservationsStore];
  if (userId) {
    userReservations = userReservations.filter(res => res.userId === userId);
  }
  
  return res.status(200).json({
    success: true,
    data: userReservations,
    pagination: {
      total: userReservations.length,
      page: 1,
      limit: 10,
      pages: 1
    },
    message: 'Mock reservations data'
  });
});


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
  
  const reservationId = `res-${Date.now()}`;
  
  const newReservation = {
    id: reservationId,
    userId,
    equipmentId,
    startTime,
    endTime,
    status: 'approved', 
    purpose,
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approval: {
      id: `app-${Date.now()}`,
      reservationId: reservationId,
      status: 'approved',
      approvalHistory: [
        {
          status: 'pending',
          date: new Date().toISOString(),
          comments: 'Reservation created'
        },
        {
          status: 'approved',
          date: new Date().toISOString(),
          comments: 'Approved automatically'
        }
      ]
    },
    usageRecord: {
      id: `usage-${Date.now()}`,
      reservationId: reservationId,
      status: 'not_started'
    }
  };
  

  mockReservationsStore.push(newReservation);
  
  logger.info(`Created new reservation with ID: ${reservationId}`);
  logger.info(`Total reservations in store: ${mockReservationsStore.length}`);
  
  return res.status(201).json({
    success: true,
    data: newReservation,
    message: 'Reservation created successfully'
  });
});

app.post('/api/reservations-direct/:id/start', (req, res) => {
  const { id } = req.params;
  
  logger.info(`Starting usage for reservation: ${id}`);
 
  const reservationIndex = mockReservationsStore.findIndex(r => r.id === id);
  
  if (reservationIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }
  
  const reservation = mockReservationsStore[reservationIndex];
  

  reservation.usageRecord.status = 'in_progress';
  reservation.usageRecord.actualStartTime = new Date().toISOString();
  
  mockReservationsStore[reservationIndex] = reservation;
  
  return res.status(200).json({
    success: true,
    data: reservation,
    message: 'Reservation usage started'
  });
});

app.delete('/api/reservations-direct/:id', (req, res) => {
  const { id } = req.params;
  
  logger.info(`Canceling reservation: ${id}`);
  

  const reservationIndex = mockReservationsStore.findIndex(r => r.id === id);
  
  if (reservationIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }
  

  const reservation = mockReservationsStore[reservationIndex];
  reservation.status = 'canceled';
  reservation.usageRecord.status = 'canceled';
  reservation.updatedAt = new Date().toISOString();
  
  mockReservationsStore[reservationIndex] = reservation;
  
  return res.status(200).json({
    success: true,
    message: 'Reservation canceled successfully'
  });
});


app.post('/api/reservations-direct/:id/end', (req, res) => {
  const { id } = req.params;
  
  logger.info(`Ending usage for reservation: ${id}`);
  

  const reservationIndex = mockReservationsStore.findIndex(r => r.id === id);
  
  if (reservationIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }
  
  const reservation = mockReservationsStore[reservationIndex];
  

  reservation.status = 'completed';
  reservation.usageRecord.status = 'completed';
  reservation.usageRecord.actualEndTime = new Date().toISOString();
  reservation.updatedAt = new Date().toISOString();
  

  mockReservationsStore[reservationIndex] = reservation;
  
  return res.status(200).json({
    success: true,
    data: reservation,
    message: 'Reservation usage completed'
  });
});


app.get('/api/system/status', async (req, res) => {
  logger.info('Checking system status');
  
  const services = {
    gateway: { status: 'UP', url: `http://localhost:${PORT}` },
    identity: { status: 'Unknown', url: IDENTITY_SERVICE_URL },
    equipment: { status: 'Unknown', url: EQUIPMENT_SERVICE_URL },
    reservation: { status: 'Unknown', url: RESERVATION_SERVICE_URL },
    notification: { status: 'Unknown', url: NOTIFICATION_SERVICE_URL }
  };
  

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


app.post('/api/auth/register-direct', async (req, res) => {
  try {
    logger.info('Direct registration endpoint called');
    
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

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

app.post('/api/auth/login-direct', async (req, res) => {
  try {
    logger.info('Direct login endpoint called');
    
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Missing email or password' });
    }
    

    if (email === 'test@example.com' && password === 'password123') {
      logger.info('Using test account credentials');

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
    
    try {
      const response = await axios.post(`${IDENTITY_SERVICE_URL}/api/auth/login`, {
        email, password
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      logger.info('Direct login response for', email, ':', response.status);

      const responseData = response.data;
      
      let formattedResponse = {
        success: true,
        data: {
          token: '',
          user: {}
        }
      };
      

      if (responseData.success === true && responseData.data && 
          responseData.data.token && responseData.data.user) {

        formattedResponse = responseData;
      }
      else if (responseData.token && responseData.user) {

        formattedResponse.data.token = responseData.token;
        formattedResponse.data.user = responseData.user;
      }
      else if (responseData.data && responseData.data.token && responseData.data.user) {

        formattedResponse.data = responseData.data;
      }
      else {

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

app.put('/api/auth/users/profile-direct', async (req, res) => {
  try {
    logger.info('Direct profile update endpoint called');
    
    const userData = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No authorization token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (token === 'test_token_123456789' || token.startsWith('mock_token_')) {
      logger.info('Using test account for profile update');
      

      const updatedUser = {
        id: '12345',
        email: 'test@example.com',
        firstName: userData.firstName || 'Test',
        lastName: userData.lastName || 'User',
        institution: userData.institution || 'Test Institution',
        position: userData.position || 'Researcher',
        fieldOfStudy: userData.fieldOfStudy || 'Science',
        bio: userData.bio || 'Test user bio',
        roles: ['researcher']
      };
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return res.status(200).json({
        success: true,
        data: updatedUser
      });
    }
    
    try {
      logger.info(`Updating profile for user with token: ${token.substring(0, 10)}...`);
      
      const updatedUser = {
        id: Math.random().toString(36).substring(2, 15),
        email: userData.email || 'user@example.com',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        institution: userData.institution || '',
        position: userData.position || '',
        fieldOfStudy: userData.fieldOfStudy || '',
        bio: userData.bio || '',
        updatedAt: new Date().toISOString()
      };
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      logger.info('Profile updated successfully');
      return res.status(200).json({
        success: true,
        data: updatedUser
      });
    } catch (error) {
      logger.error(`Profile update error: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Error updating profile',
        error: error.message
      });
    }
  } catch (error) {
    logger.error('Direct profile update error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile directly',
      error: error.message
    });
  }
});

app.post('/api/test/profile-update', (req, res) => {
  logger.info('Test profile update endpoint called');
  
  setTimeout(() => {
    res.status(200).json({
      success: true,
      data: {
        ...req.body,
        id: '12345',
        updatedAt: new Date().toISOString()
      },
      message: 'Profile update test successful'
    });
  }, 500);
});

app.get('/api/equipment', (req, res) => {
  logger.info('Mock equipment endpoint called');
  
  const mockEquipment = [
    {
      id: 1,
      name: 'Electron Microscope XL-30',
      description: 'High-resolution scanning electron microscope capable of imaging at nanometer scale. Perfect for material science and biological sample analysis.',
      manufacturer: 'Phillips',
      model: 'XL-30',
      category: 'microscopy',
      location: 'North America',
      facility: 'Stanford Imaging Center',
      status: 'available',
      imageUrl: '/images/equipment1.jpg',
      specifications: 'Resolution: 1.5nm, Accelerating voltage: 0.2-30kV'
    },
    {
      id: 2,
      name: 'Mass Spectrometer 5800',
      description: 'MALDI TOF mass spectrometer for protein identification and biomarker discovery. High throughput and excellent sensitivity.',
      manufacturer: 'Sciex',
      model: '5800',
      category: 'spectroscopy',
      location: 'Europe',
      facility: 'Berlin Proteomics Lab',
      status: 'available',
      imageUrl: '/images/equipment2.jpg',
      specifications: 'Mass range: 50-6000 Da, Resolution: 25000 FWHM'
    },
    {
      id: 3,
      name: 'DNA Sequencer',
      description: 'Next-generation sequencing system for whole genome sequencing and targeted gene panels. High throughput and accurate results.',
      manufacturer: 'Illumina',
      model: 'NovaSeq 6000',
      category: 'genomics',
      location: 'Asia',
      facility: 'Tokyo Genomics Center',
      status: 'available',
      imageUrl: '/images/equipment3.jpg',
      specifications: 'Output: up to 6 TB of data per run, Read length: up to 2x150 bp'
    },
    {
      id: 4,
      name: 'NMR Spectrometer 500 MHz',
      description: 'Nuclear magnetic resonance spectrometer for detailed structural analysis of organic compounds and biomolecules.',
      manufacturer: 'Bruker',
      model: 'Avance NEO 500',
      category: 'spectroscopy',
      location: 'North America',
      facility: 'MIT Chemistry Department',
      status: 'maintenance',
      imageUrl: '/images/equipment4.jpg',
      specifications: 'Field strength: 11.7 T, Frequency: 500 MHz'
    },
    {
      id: 5,
      name: 'Confocal Microscope',
      description: 'High-resolution optical imaging system with depth selectivity for 3D cellular imaging and live cell experiments.',
      manufacturer: 'Leica',
      model: 'SP8',
      category: 'microscopy',
      location: 'Europe',
      facility: 'Imperial College London',
      status: 'available',
      imageUrl: '/images/equipment5.jpg',
      specifications: 'Resolution: XY=180nm Z=500nm, Laser lines: 405nm, 488nm, 552nm, 638nm'
    },
    {
      id: 6,
      name: 'High-Performance Computing Cluster',
      description: 'Parallel computing system for intensive computational tasks like molecular dynamics simulations and genomic data analysis.',
      manufacturer: 'Dell',
      model: 'PowerEdge C6525',
      category: 'computing',
      location: 'Australia',
      facility: 'Australian National Computing Infrastructure',
      status: 'available',
      imageUrl: '/images/equipment1.jpg',
      specifications: 'CPU cores: 2048, RAM: 8TB, Storage: 1PB, Network: 100Gb/s'
    }
  ];
  
  let filteredEquipment = [...mockEquipment];
  const { name, category, location, status } = req.query;
  
  if (name) {
    filteredEquipment = filteredEquipment.filter(item => 
      item.name.toLowerCase().includes(name.toLowerCase())
    );
  }
  
  if (category) {
    filteredEquipment = filteredEquipment.filter(item => 
      item.category === category
    );
  }
  
  if (location) {
    filteredEquipment = filteredEquipment.filter(item => 
      item.location === location
    );
  }
  
  if (status) {
    filteredEquipment = filteredEquipment.filter(item => 
      item.status === status
    );
  }
  
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const paginatedEquipment = filteredEquipment.slice(startIndex, endIndex);
  
  return res.status(200).json({
    success: true,
    data: paginatedEquipment,
    pagination: {
      total: filteredEquipment.length,
      page: page,
      limit: limit,
      pages: Math.ceil(filteredEquipment.length / limit)
    }
  });
});

app.get('/api/equipment/:id', (req, res) => {
  logger.info(`Mock equipment details endpoint called for ID: ${req.params.id}`);
  
  const id = parseInt(req.params.id);
  const mockEquipment = [
    {
      id: 1,
      name: 'Electron Microscope XL-30',
      description: 'High-resolution scanning electron microscope capable of imaging at nanometer scale. Perfect for material science and biological sample analysis.',
      manufacturer: 'Phillips',
      model: 'XL-30',
      category: 'microscopy',
      location: 'North America',
      facility: 'Stanford Imaging Center',
      status: 'available',
      imageUrl: '/images/equipment1.jpg',
      specifications: 'Resolution: 1.5nm, Accelerating voltage: 0.2-30kV',
      capabilities: 'Capable of imaging biological samples, conductive and non-conductive materials with high resolution.',
      availabilityNotes: 'Available Monday to Friday, 9am to 5pm. Special requests for weekend usage can be made in advance.'
    },
    {
      id: 2,
      name: 'Mass Spectrometer 5800',
      description: 'MALDI TOF mass spectrometer for protein identification and biomarker discovery. High throughput and excellent sensitivity.',
      manufacturer: 'Sciex',
      model: '5800',
      category: 'spectroscopy',
      location: 'Europe',
      facility: 'Berlin Proteomics Lab',
      status: 'available',
      imageUrl: '/images/equipment2.jpg',
      specifications: 'Mass range: 50-6000 Da, Resolution: 25000 FWHM',
      capabilities: 'Protein identification, biomarker discovery, high-throughput analysis of complex samples.',
      availabilityNotes: 'Available by appointment only. Training required before first use.'
    },
    {
      id: 3,
      name: 'DNA Sequencer',
      description: 'Next-generation sequencing system for whole genome sequencing and targeted gene panels. High throughput and accurate results.',
      manufacturer: 'Illumina',
      model: 'NovaSeq 6000',
      category: 'genomics',
      location: 'Asia',
      facility: 'Tokyo Genomics Center',
      status: 'available',
      imageUrl: '/images/equipment3.jpg',
      specifications: 'Output: up to 6 TB of data per run, Read length: up to 2x150 bp',
      capabilities: 'Whole genome sequencing, exome sequencing, RNA-seq, ChIP-seq, and other high-throughput genomic applications.',
      availabilityNotes: 'Requires sample preparation by lab technicians. Book at least 2 weeks in advance.'
    },
    {
      id: 4,
      name: 'NMR Spectrometer 500 MHz',
      description: 'Nuclear magnetic resonance spectrometer for detailed structural analysis of organic compounds and biomolecules.',
      manufacturer: 'Bruker',
      model: 'Avance NEO 500',
      category: 'spectroscopy',
      location: 'North America',
      facility: 'MIT Chemistry Department',
      status: 'maintenance',
      imageUrl: '/images/equipment4.jpg',
      specifications: 'Field strength: 11.7 T, Frequency: 500 MHz',
      capabilities: 'Structure elucidation of small molecules, proteins, and nucleic acids. Both solid-state and solution NMR capabilities.',
      availabilityNotes: 'Currently undergoing maintenance until June 15, 2025. Please check back after this date.'
    },
    {
      id: 5,
      name: 'Confocal Microscope',
      description: 'High-resolution optical imaging system with depth selectivity for 3D cellular imaging and live cell experiments.',
      manufacturer: 'Leica',
      model: 'SP8',
      category: 'microscopy',
      location: 'Europe',
      facility: 'Imperial College London',
      status: 'available',
      imageUrl: '/images/equipment5.jpg',
      specifications: 'Resolution: XY=180nm Z=500nm, Laser lines: 405nm, 488nm, 552nm, 638nm',
      capabilities: 'Live cell imaging, FRET, FRAP, time-lapse imaging, 3D reconstruction, multi-channel fluorescence imaging.',
      availabilityNotes: 'Training workshop held every first Monday of the month. Must attend before first use.'
    },
    {
      id: 6,
      name: 'High-Performance Computing Cluster',
      description: 'Parallel computing system for intensive computational tasks like molecular dynamics simulations and genomic data analysis.',
      manufacturer: 'Dell',
      model: 'PowerEdge C6525',
      category: 'computing',
      location: 'Australia',
      facility: 'Australian National Computing Infrastructure',
      status: 'available',
      imageUrl: '/images/equipment1.jpg',
      specifications: 'CPU cores: 2048, RAM: 8TB, Storage: 1PB, Network: 100Gb/s',
      capabilities: 'Molecular dynamics simulations, genomic data analysis, AI/ML model training, climate modeling, and other computationally intensive tasks.',
      availabilityNotes: 'Job submission via web portal. Priority given to funded research projects.'
    }
  ];
  
  const equipment = mockEquipment.find(item => item.id === id);
  
  if (!equipment) {
    return res.status(404).json({ 
      success: false, 
      message: 'Equipment not found' 
    });
  }
  
  return res.status(200).json({
    success: true,
    data: equipment
  });
});


setupProxies(app);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'api-gateway' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
}); 