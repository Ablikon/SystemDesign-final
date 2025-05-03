const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { setupProxies } = require('./config/proxy.config');
const { errorHandler } = require('./middleware/error.middleware');
const logger = require('./utils/logger');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Особый маршрут для резерваций без авторизации - ДОЛЖЕН БЫТЬ ДО MIDDLEWARE!
app.get('/api/reservations', (req, res) => {
  // Прямой ответ без авторизации
  logger.info(`ПРЯМОЙ ОТВЕТ НА /api/reservations с параметрами: ${JSON.stringify(req.query)}`);
  const reservations = [
    {
      id: 1,
      equipmentId: '1',
      equipmentName: 'Electron Microscope XL-30',
      startDate: '2023-06-01T09:00:00Z',
      endDate: '2023-06-01T12:00:00Z',
      purpose: 'Sample analysis for research project',
      status: 'Approved',
      createdAt: '2023-05-15T14:30:00Z',
      userId: req.query.userId || '123'
    },
    {
      id: 2,
      equipmentId: '2',
      equipmentName: 'Gas Chromatograph GC-2010',
      startDate: '2023-06-10T13:00:00Z',
      endDate: '2023-06-10T17:00:00Z',
      purpose: 'Chemical compound separation',
      status: 'Pending',
      createdAt: '2023-05-20T09:45:00Z',
      userId: req.query.userId || '123'
    }
  ];
  
  return res.status(200).json({
    success: true,
    data: reservations
  });
});

// Enable CORS with more permissive settings for development
app.use(cors({
  origin: '*', // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
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

// Setup API proxies to microservices
setupProxies(app);

// Dashboard stats endpoint
app.get('/dashboard/stats', (req, res) => {
  logger.info('Processing dashboard stats request');
  
  // Return mock dashboard stats
  return res.status(200).json({
    success: true,
    data: {
      upcomingReservations: 3,
      pastReservations: 12,
      favoriteEquipment: 5
    }
  });
});

// Authentication endpoints
// Register endpoint
app.post('/api/auth/register', (req, res) => {
  logger.info('Processing registration request');
  
  const { email, password, firstName, lastName } = req.body;
  
  // Simple validation
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }
  
  // Create a mock token
  const token = 'mock_token_' + Date.now();
  
  // Return success response
  return res.status(201).json({
    success: true,
    data: {
      user: {
        id: '123',
        email,
        firstName,
        lastName,
        role: 'researcher'
      },
      token
    }
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  logger.info(`Processing login request: ${JSON.stringify(req.body)}`);
  
  try {
    const { email, password } = req.body;
    
    // Simple validation
    if (!email || !password) {
      logger.warn('Login failed: Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Accept any credentials for testing
    // Create a mock token that doesn't expire
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImVtYWlsIjoicmVzZWFyY2hlckBleGFtcGxlLmNvbSIsImlhdCI6MTY0NjI0OTAyMiwiZXhwIjoxOTgxODcyNjIyfQ.8mQEpj3GOL8t0EneCSnPJOFwZfBaQRLc6GR_49L8D6Y';
    
    const user = {
      id: '123',
      email: email,
      firstName: email.split('@')[0],
      lastName: 'User',
      role: 'researcher'
    };
    
    logger.info(`Login successful for ${email}`);
    // Return exactly what the client expects - token and user in data object
    return res.status(200).json({
      success: true,
      data: {
        token: token,
        user: user
      }
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

// Add a login endpoint without /api prefix as well
app.post('/auth/login', (req, res) => {
  logger.info(`Processing direct login request: ${JSON.stringify(req.body)}`);
  
  try {
    const { email, password } = req.body;
    
    // Simple validation
    if (!email || !password) {
      logger.warn('Direct login failed: Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Accept any credentials for testing
    // Create a mock token that doesn't expire
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImVtYWlsIjoicmVzZWFyY2hlckBleGFtcGxlLmNvbSIsImlhdCI6MTY0NjI0OTAyMiwiZXhwIjoxOTgxODcyNjIyfQ.8mQEpj3GOL8t0EneCSnPJOFwZfBaQRLc6GR_49L8D6Y';
    
    const user = {
      id: '123',
      email: email,
      firstName: email.split('@')[0],
      lastName: 'User',
      role: 'researcher'
    };
    
    logger.info(`Direct login successful for ${email}`);
    // Return exactly what the client expects - token and user in data object
    return res.status(200).json({
      success: true,
      data: {
        token: token,
        user: user
      }
    });
  } catch (error) {
    logger.error(`Direct login error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

// Me endpoint
app.get('/api/auth/me', (req, res) => {
  logger.info('Processing me request');
  
  // Check authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Me request failed: No authorization header');
    return res.status(401).json({
      success: false,
      message: 'Authorization required'
    });
  }
  
  // Return a mock user
  return res.status(200).json({
    success: true,
    data: {
      id: '123',
      email: 'researcher@example.com',
      firstName: 'Research',
      lastName: 'User',
      role: 'researcher'
    }
  });
});

// Direct me endpoint without /api prefix
app.get('/auth/me', (req, res) => {
  logger.info('Processing direct me request');
  
  // Check authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Direct me request failed: No authorization header');
    return res.status(401).json({
      success: false,
      message: 'Authorization required'
    });
  }
  
  // Return a mock user
  return res.status(200).json({
    success: true,
    data: {
      id: '123',
      email: 'researcher@example.com',
      firstName: 'Research',
      lastName: 'User',
      role: 'researcher'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'api-gateway' });
});

// Add mock API endpoints for reservations and notifications
app.get('/api/reservations/recent', (req, res) => {
  logger.info('Processing recent reservations request');
  
  return res.status(200).json([
    { id: 1, equipmentName: "Electron Microscope", date: "2025-05-10", status: "Approved" },
    { id: 2, equipmentName: "Spectrophotometer", date: "2025-05-15", status: "Pending" },
    { id: 3, equipmentName: "NMR Spectrometer", date: "2025-05-20", status: "Approved" }
  ]);
});

// Direct endpoint without /api prefix to match frontend requests
app.get('/reservations/recent', (req, res) => {
  logger.info('Processing direct recent reservations request');
  
  return res.status(200).json([
    { id: 1, equipmentName: "Electron Microscope", date: "2025-05-10", status: "Approved" },
    { id: 2, equipmentName: "Spectrophotometer", date: "2025-05-15", status: "Pending" },
    { id: 3, equipmentName: "NMR Spectrometer", date: "2025-05-20", status: "Approved" }
  ]);
});

app.get('/api/notifications', (req, res) => {
  logger.info('Processing notifications request');
  
  return res.status(200).json([
    { id: 1, message: "Your reservation for Electron Microscope has been approved", date: "2025-05-01", read: false },
    { id: 2, message: "New equipment added: Thermal Cycler", date: "2025-04-29", read: true },
    { id: 3, message: "Your report for NMR Spectrometer usage is due tomorrow", date: "2025-04-28", read: false }
  ]);
});

// Direct notifications endpoint without /api prefix
app.get('/notifications', (req, res) => {
  logger.info('Processing direct notifications request');
  
  return res.status(200).json([
    { id: 1, message: "Your reservation for Electron Microscope has been approved", date: "2025-05-01", read: false },
    { id: 2, message: "New equipment added: Thermal Cycler", date: "2025-04-29", read: true },
    { id: 3, message: "Your report for NMR Spectrometer usage is due tomorrow", date: "2025-04-28", read: false }
  ]);
});

// Debug endpoint to help troubleshoot
app.get('/debug/endpoints', (req, res) => {
  logger.info('Listing all registered endpoints');
  
  const endpoints = [];
  
  // List registered routes
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Routes registered directly on the app
      endpoints.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      // Router middleware
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          endpoints.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  
  return res.status(200).json({
    success: true,
    endpoints
  });
});

// Create a catch-all endpoint specifically for login
app.post('/login', (req, res) => {
  logger.info('Catch-all login endpoint hit');
  // Forward to the proper login endpoint
  return res.redirect(307, '/api/auth/login');
});

// Add another catch-all for login with auth prefix
app.post('/auth/login', (req, res) => {
  logger.info('Catch-all auth/login endpoint hit');
  // Forward to the proper login endpoint
  return res.redirect(307, '/api/auth/login');
});

// Error handler
app.use(errorHandler);

// Явные endpoints для /api/reservations и /api/reservations/
const reservationsHandler = (req, res) => {
  const userId = req.query.userId || req.query.userid || req.query.uid || '123';
  logger.info(`Explicit /api/reservations endpoint hit with userId=${userId}`);
  const reservations = [
    {
      id: 1,
      equipmentId: '1',
      equipmentName: 'Electron Microscope XL-30',
      startDate: '2023-06-01T09:00:00Z',
      endDate: '2023-06-01T12:00:00Z',
      purpose: 'Sample analysis for research project',
      status: 'Approved',
      createdAt: '2023-05-15T14:30:00Z',
      userId: userId
    },
    {
      id: 2,
      equipmentId: '2',
      equipmentName: 'Gas Chromatograph GC-2010',
      startDate: '2023-06-10T13:00:00Z',
      endDate: '2023-06-10T17:00:00Z',
      purpose: 'Chemical compound separation',
      status: 'Pending',
      createdAt: '2023-05-20T09:45:00Z',
      userId: userId
    }
  ];
  return res.status(200).json({ success: true, data: reservations });
};
app.get('/api/reservations', reservationsHandler);
app.get('/api/reservations/', reservationsHandler);

// Direct endpoint without /api prefix for equipment
app.get('/equipment', (req, res) => {
  logger.info('Processing direct equipment request');
  
  // Mirror the same response format as the equipment service
  const equipmentData = [
    {
      id: '1',
      name: 'Electron Microscope XL-30',
      manufacturer: 'TechVision',
      model: 'XL-30',
      location: 'Imaging Lab, Room 105',
      status: 'Available',
      description: 'High-resolution electron microscope for detailed imaging of biological samples',
      specifications: 'Resolution: 0.5nm, Magnification: 5,000-500,000x',
      imageUrl: 'https://example.com/microscope.jpg',
      categories: ['Microscopy'],
      capabilities: [
        { name: 'Resolution', value: '0.5nm' },
        { name: 'Magnification', value: '5,000-500,000x' },
        { name: 'Sample Types', value: 'Biological, Materials' },
        { name: 'Imaging Modes', value: 'Secondary Electron, Backscattered Electron' },
        { name: 'Computer Interface', value: 'Yes, with analysis software' }
      ],
      owner: 'University Lab'
    },
    {
      id: '2',
      name: 'Gas Chromatograph GC-2010',
      manufacturer: 'AnalyticsLab',
      model: 'GC-2010',
      location: 'Chemistry Lab, Room 203',
      status: 'In Use',
      description: 'Advanced chromatography system for analytical chemistry research',
      specifications: 'Detector: FID, TCD, ECD; Column oven: 4°C to 450°C',
      imageUrl: 'https://example.com/chromatograph.jpg',
      categories: ['Chromatography'],
      capabilities: [
        { name: 'Detector Types', value: 'FID, TCD, ECD' },
        { name: 'Column Oven Range', value: '4°C to 450°C' },
        { name: 'Sample Capacity', value: '120 samples' },
        { name: 'Analysis Speed', value: 'Fast, 20 samples/hour' }
      ],
      owner: 'Chemistry Department'
    },
    {
      id: '3',
      name: 'PCR Thermal Cycler',
      manufacturer: 'BioGenix',
      model: 'TC-500',
      location: 'Genomics Lab, Room 302',
      status: 'Available',
      description: 'Standard thermal cycler for PCR applications',
      specifications: 'Temperature range: 4°C to 99°C, Capacity: 96 wells',
      imageUrl: 'https://example.com/thermal-cycler.jpg',
      categories: ['PCR & Sequencing'],
      capabilities: [
        { name: 'Temperature Range', value: '4°C to 99°C' },
        { name: 'Well Capacity', value: '96 wells' },
        { name: 'Heating/Cooling Rate', value: '4°C/second' },
        { name: 'Programming', value: 'Up to 100 stored programs' },
        { name: 'Computer Interface', value: 'USB and Bluetooth' }
      ],
      owner: 'Genomics Department'
    }
  ];
  
  // Parse query parameters
  const { status, page = 1, limit = 10 } = req.query;
  
  // Filter by status if provided
  let filteredEquipment = equipmentData;
  if (status) {
    filteredEquipment = filteredEquipment.filter(e => 
      e.status.toLowerCase() === status.toLowerCase()
    );
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedEquipment = filteredEquipment.slice(startIndex, endIndex);
  
  return res.status(200).json({
    success: true,
    data: paginatedEquipment,
    pagination: {
      total: filteredEquipment.length,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(filteredEquipment.length / limit)
    }
  });
});

// Direct endpoint for getting equipment by ID
app.get('/equipment/:id', (req, res) => {
  logger.info(`Processing direct equipment by ID request: ${req.params.id}`);
  
  const equipmentData = [
    {
      id: '1',
      name: 'Electron Microscope XL-30',
      manufacturer: 'TechVision',
      model: 'XL-30',
      location: 'Imaging Lab, Room 105',
      status: 'Available',
      description: 'High-resolution electron microscope for detailed imaging of biological samples',
      specifications: {
        'Resolution': '0.5nm',
        'Magnification': '5,000-500,000x',
        'Sample Types': 'Biological, Materials',
        'Operating Voltage': '5-30kV',
        'Imaging Modes': 'Secondary Electron, Backscattered Electron'
      },
      imageUrl: 'https://example.com/microscope.jpg',
      categories: ['Microscopy'],
      capabilities: [
        { name: 'Resolution', value: '0.5nm' },
        { name: 'Magnification', value: '5,000-500,000x' },
        { name: 'Sample Types', value: 'Biological, Materials' },
        { name: 'Imaging Modes', value: 'Secondary Electron, Backscattered Electron' },
        { name: 'Computer Interface', value: 'Yes, with analysis software' }
      ],
      owner: 'University Lab'
    },
    {
      id: '2',
      name: 'Gas Chromatograph GC-2010',
      manufacturer: 'AnalyticsLab',
      model: 'GC-2010',
      location: 'Chemistry Lab, Room 203',
      status: 'In Use',
      description: 'Advanced chromatography system for analytical chemistry research',
      specifications: {
        'Detector': 'FID, TCD, ECD',
        'Column oven': '4°C to 450°C',
        'Sample Capacity': '120 samples',
        'Analysis Speed': 'Fast, 20 samples/hour'
      },
      imageUrl: 'https://example.com/chromatograph.jpg',
      categories: ['Chromatography'],
      capabilities: [
        { name: 'Detector Types', value: 'FID, TCD, ECD' },
        { name: 'Column Oven Range', value: '4°C to 450°C' },
        { name: 'Sample Capacity', value: '120 samples' },
        { name: 'Analysis Speed', value: 'Fast, 20 samples/hour' }
      ],
      owner: 'Chemistry Department'
    },
    {
      id: '3',
      name: 'PCR Thermal Cycler',
      manufacturer: 'BioGenix',
      model: 'TC-500',
      location: 'Genomics Lab, Room 302',
      status: 'Available',
      description: 'Standard thermal cycler for PCR applications',
      specifications: {
        'Temperature Range': '4°C to 99°C',
        'Well Capacity': '96 wells', 
        'Heating/Cooling Rate': '4°C/second',
        'Programming': 'Up to 100 stored programs'
      },
      imageUrl: 'https://example.com/thermal-cycler.jpg',
      categories: ['PCR & Sequencing'],
      capabilities: [
        { name: 'Temperature Range', value: '4°C to 99°C' },
        { name: 'Well Capacity', value: '96 wells' },
        { name: 'Heating/Cooling Rate', value: '4°C/second' },
        { name: 'Programming', value: 'Up to 100 stored programs' },
        { name: 'Computer Interface', value: 'USB and Bluetooth' }
      ],
      owner: 'Genomics Department'
    }
  ];
  
  const equipment = equipmentData.find(e => e.id === req.params.id);
  
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

// Add a reservation endpoint to create new reservations
app.post('/api/reservations', (req, res) => {
  logger.info(`Processing reservation creation request: ${JSON.stringify(req.body)}`);
  
  // Check authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authorization required'
    });
  }
  
  const { equipmentId, startDate, endDate, purpose } = req.body;
  
  // Validate required fields
  if (!equipmentId || !startDate || !endDate || !purpose) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }
  
  // Create mock reservation
  const reservation = {
    id: Math.floor(Math.random() * 1000) + 1,
    equipmentId,
    startDate,
    endDate,
    purpose,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };
  
  logger.info(`Reservation created: ${JSON.stringify(reservation)}`);
  
  // Return success
  return res.status(201).json({
    success: true,
    data: reservation
  });
});

// Same endpoint without /api prefix
app.post('/reservations', (req, res) => {
  logger.info(`Processing direct reservation creation request: ${JSON.stringify(req.body)}`);
  
  // Check authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authorization required'
    });
  }
  
  const { equipmentId, startDate, endDate, purpose } = req.body;
  
  // Validate required fields
  if (!equipmentId || !startDate || !endDate || !purpose) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }
  
  // Create mock reservation
  const reservation = {
    id: Math.floor(Math.random() * 1000) + 1,
    equipmentId,
    startDate,
    endDate,
    purpose,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };
  
  logger.info(`Direct reservation created: ${JSON.stringify(reservation)}`);
  
  // Return success
  return res.status(201).json({
    success: true,
    data: reservation
  });
});

// User reservations endpoint with userid parameter
app.get('/api/reservations', (req, res) => {
  const userId = req.query.userId || req.query.userid || '123';
  logger.info(`Processing user reservations request for userId: ${userId}`);
  
  // Sample data for user reservations
  const reservations = [
    {
      id: 1,
      equipmentId: '1',
      equipmentName: 'Electron Microscope XL-30',
      startDate: '2023-06-01T09:00:00Z',
      endDate: '2023-06-01T12:00:00Z',
      purpose: 'Sample analysis for research project',
      status: 'Approved',
      createdAt: '2023-05-15T14:30:00Z',
      userId: userId
    },
    {
      id: 2,
      equipmentId: '2',
      equipmentName: 'Gas Chromatograph GC-2010',
      startDate: '2023-06-10T13:00:00Z',
      endDate: '2023-06-10T17:00:00Z',
      purpose: 'Chemical compound separation',
      status: 'Pending',
      createdAt: '2023-05-20T09:45:00Z',
      userId: userId
    }
  ];
  
  return res.status(200).json({
    success: true,
    data: reservations
  });
});

// Direct endpoint with userId parameter
app.get('/reservations', (req, res) => {
  const userId = req.query.userId || req.query.userid || '123';
  logger.info(`Processing direct reservations request for userId: ${userId}`);
  
  // Sample data for user reservations
  const reservations = [
    {
      id: 1,
      equipmentId: '1',
      equipmentName: 'Electron Microscope XL-30',
      startDate: '2023-06-01T09:00:00Z',
      endDate: '2023-06-01T12:00:00Z',
      purpose: 'Sample analysis for research project',
      status: 'Approved',
      createdAt: '2023-05-15T14:30:00Z',
      userId: userId
    },
    {
      id: 2,
      equipmentId: '2',
      equipmentName: 'Gas Chromatograph GC-2010',
      startDate: '2023-06-10T13:00:00Z',
      endDate: '2023-06-10T17:00:00Z',
      purpose: 'Chemical compound separation',
      status: 'Pending',
      createdAt: '2023-05-20T09:45:00Z',
      userId: userId
    }
  ];
  
  return res.status(200).json({
    success: true,
    data: reservations
  });
});

// Specific endpoint for ?userid= parameter
app.get('/reservations/:userid', (req, res) => {
  const userId = req.params.userid || '123';
  logger.info(`Processing reservations request for user ID in path: ${userId}`);
  
  // Sample data for user reservations
  const reservations = [
    {
      id: 1,
      equipmentId: '1',
      equipmentName: 'Electron Microscope XL-30',
      startDate: '2023-06-01T09:00:00Z',
      endDate: '2023-06-01T12:00:00Z',
      purpose: 'Sample analysis for research project',
      status: 'Approved',
      createdAt: '2023-05-15T14:30:00Z',
      userId: userId
    },
    {
      id: 2,
      equipmentId: '2',
      equipmentName: 'Gas Chromatograph GC-2010',
      startDate: '2023-06-10T13:00:00Z',
      endDate: '2023-06-10T17:00:00Z',
      purpose: 'Chemical compound separation',
      status: 'Pending',
      createdAt: '2023-05-20T09:45:00Z',
      userId: userId
    }
  ];
  
  return res.status(200).json({
    success: true,
    data: reservations
  });
});

// Dashboard endpoint
app.get('/api/dashboard', (req, res) => {
  logger.info('Processing dashboard request');
  
  // Check authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authorization required'
    });
  }
  
  // Return mock dashboard data
  return res.status(200).json({
    success: true,
    data: {
      upcomingReservations: [
        {
          id: 1,
          equipmentId: '1',
          equipmentName: 'Electron Microscope XL-30',
          startDate: '2023-06-01T09:00:00Z',
          endDate: '2023-06-01T12:00:00Z',
          status: 'Approved'
        },
        {
          id: 2,
          equipmentId: '2',
          equipmentName: 'Gas Chromatograph GC-2010',
          startDate: '2023-06-10T13:00:00Z',
          endDate: '2023-06-10T17:00:00Z',
          status: 'Pending'
        }
      ],
      recentActivity: [
        {
          id: 1,
          type: 'Reservation',
          description: 'Your reservation for Electron Microscope XL-30 was approved',
          date: '2023-05-15T14:30:00Z'
        },
        {
          id: 2,
          type: 'Equipment',
          description: 'New equipment added: PCR Thermal Cycler',
          date: '2023-05-10T09:15:00Z'
        },
        {
          id: 3,
          type: 'Reservation',
          description: 'You submitted a reservation for Gas Chromatograph GC-2010',
          date: '2023-05-05T11:20:00Z'
        }
      ],
      favoriteEquipment: [
        {
          id: '1',
          name: 'Electron Microscope XL-30',
          status: 'Available'
        },
        {
          id: '3',
          name: 'PCR Thermal Cycler',
          status: 'Available'
        }
      ]
    }
  });
});

// Same endpoint without /api prefix
app.get('/dashboard', (req, res) => {
  logger.info('Processing direct dashboard request');
  
  // Check authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authorization required'
    });
  }
  
  // Return mock dashboard data
  return res.status(200).json({
    success: true,
    data: {
      upcomingReservations: [
        {
          id: 1,
          equipmentId: '1',
          equipmentName: 'Electron Microscope XL-30',
          startDate: '2023-06-01T09:00:00Z',
          endDate: '2023-06-01T12:00:00Z',
          status: 'Approved'
        },
        {
          id: 2,
          equipmentId: '2',
          equipmentName: 'Gas Chromatograph GC-2010',
          startDate: '2023-06-10T13:00:00Z',
          endDate: '2023-06-10T17:00:00Z',
          status: 'Pending'
        }
      ],
      recentActivity: [
        {
          id: 1,
          type: 'Reservation',
          description: 'Your reservation for Electron Microscope XL-30 was approved',
          date: '2023-05-15T14:30:00Z'
        },
        {
          id: 2,
          type: 'Equipment',
          description: 'New equipment added: PCR Thermal Cycler',
          date: '2023-05-10T09:15:00Z'
        },
        {
          id: 3,
          type: 'Reservation',
          description: 'You submitted a reservation for Gas Chromatograph GC-2010',
          date: '2023-05-05T11:20:00Z'
        }
      ],
      favoriteEquipment: [
        {
          id: '1',
          name: 'Electron Microscope XL-30',
          status: 'Available'
        },
        {
          id: '3',
          name: 'PCR Thermal Cycler',
          status: 'Available'
        }
      ]
    }
  });
});

// Add a simple auto-login endpoint for testing
app.get('/auto-login', (req, res) => {
  logger.info('Auto-login endpoint called');
  
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImVtYWlsIjoicmVzZWFyY2hlckBleGFtcGxlLmNvbSIsImlhdCI6MTY0NjI0OTAyMiwiZXhwIjoxOTgxODcyNjIyfQ.8mQEpj3GOL8t0EneCSnPJOFwZfBaQRLc6GR_49L8D6Y';
  
  return res.send(`
    <html>
      <head>
        <title>Auto Login</title>
        <script>
          // Store the token in localStorage
          localStorage.setItem('token', '${token}');
          
          // Redirect to homepage
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        </script>
      </head>
      <body>
        <h1>Auto Login</h1>
        <p>You will be redirected in 1 second...</p>
      </body>
    </html>
  `);
});

// Create reservation endpoint - compatible with Book Now button
app.post('/api/equipment/reserve', (req, res) => {
  // Без валидации - просто возвращаем успешный ответ
  return res.status(201).json({
    success: true,
    message: 'Reservation created successfully!',
    data: {
      id: Math.floor(Math.random() * 1000) + 1,
      equipmentId: req.body.equipmentId || '1',
      equipmentName: 'Electron Microscope XL-30',
      startDate: req.body.startDate || new Date().toISOString(),
      endDate: req.body.endDate || new Date().toISOString(),
      purpose: req.body.purpose || 'Research',
      status: 'Pending',
      createdAt: new Date().toISOString()
    }
  });
});

// Same endpoint without /api prefix
app.post('/equipment/reserve', (req, res) => {
  logger.info(`Processing direct equipment reservation: ${JSON.stringify(req.body)}`);
  
  // Validate request body
  const { equipmentId, startDate, endDate, purpose } = req.body;
  
  if (!equipmentId || !startDate || !endDate || !purpose) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }
  
  // Create a new reservation
  const reservation = {
    id: Math.floor(Math.random() * 1000) + 1,
    equipmentId,
    equipmentName: equipmentId === '1' ? 'Electron Microscope XL-30' : 
                   equipmentId === '2' ? 'Gas Chromatograph GC-2010' : 
                   equipmentId === '3' ? 'PCR Thermal Cycler' : 'Unknown Equipment',
    startDate,
    endDate,
    purpose,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    userId: '123'
  };
  
  logger.info(`Created direct reservation: ${JSON.stringify(reservation)}`);
  
  // Return success
  return res.status(201).json({
    success: true,
    data: reservation,
    message: 'Reservation created successfully!'
  });
});

// Add history reservations endpoint
app.get('/api/reservations/history', (req, res) => {
  logger.info('Processing reservations history request');
  
  // Check authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authorization required'
    });
  }
  
  // Return mock historical reservations
  return res.status(200).json({
    success: true,
    data: [
      {
        id: 3,
        equipmentId: '3',
        equipmentName: 'PCR Thermal Cycler',
        startDate: '2023-04-15T10:00:00Z',
        endDate: '2023-04-15T14:00:00Z',
        purpose: 'DNA amplification for gene expression study',
        status: 'Completed',
        createdAt: '2023-04-01T08:15:00Z',
        userId: '123'
      },
      {
        id: 4,
        equipmentId: '1',
        equipmentName: 'Electron Microscope XL-30',
        startDate: '2023-03-20T13:00:00Z',
        endDate: '2023-03-20T16:00:00Z',
        purpose: 'Cell structure imaging',
        status: 'Completed',
        createdAt: '2023-03-10T11:30:00Z',
        userId: '123'
      }
    ]
  });
});

// Same endpoint without /api prefix
app.get('/reservations/history', (req, res) => {
  logger.info('Processing direct reservations history request');
  
  // Check authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authorization required'
    });
  }
  
  // Return mock historical reservations
  return res.status(200).json({
    success: true,
    data: [
      {
        id: 3,
        equipmentId: '3',
        equipmentName: 'PCR Thermal Cycler',
        startDate: '2023-04-15T10:00:00Z',
        endDate: '2023-04-15T14:00:00Z',
        purpose: 'DNA amplification for gene expression study',
        status: 'Completed',
        createdAt: '2023-04-01T08:15:00Z',
        userId: '123'
      },
      {
        id: 4,
        equipmentId: '1',
        equipmentName: 'Electron Microscope XL-30',
        startDate: '2023-03-20T13:00:00Z',
        endDate: '2023-03-20T16:00:00Z',
        purpose: 'Cell structure imaging',
        status: 'Completed',
        createdAt: '2023-03-10T11:30:00Z',
        userId: '123'
      }
    ]
  });
});

// Handle /reservations?userid=123 format
app.get('/api/reservations/user/:userid', (req, res) => {
  const userId = req.params.userid;
  logger.info(`Processing user reservations by userid param: ${userId}`);
  
  // Sample data for user reservations
  const reservations = [
    {
      id: 1,
      equipmentId: '1',
      equipmentName: 'Electron Microscope XL-30',
      startDate: '2023-06-01T09:00:00Z',
      endDate: '2023-06-01T12:00:00Z',
      purpose: 'Sample analysis for research project',
      status: 'Approved',
      createdAt: '2023-05-15T14:30:00Z',
      userId: userId
    },
    {
      id: 2,
      equipmentId: '2',
      equipmentName: 'Gas Chromatograph GC-2010',
      startDate: '2023-06-10T13:00:00Z',
      endDate: '2023-06-10T17:00:00Z',
      purpose: 'Chemical compound separation',
      status: 'Pending',
      createdAt: '2023-05-20T09:45:00Z',
      userId: userId
    }
  ];
  
  return res.status(200).json(reservations);
});

// Handle direct /reservations?userid=123 format
app.get('/reservations/user/:userid', (req, res) => {
  const userId = req.params.userid;
  logger.info(`Processing direct user reservations by userid param: ${userId}`);
  
  // Sample data for user reservations
  const reservations = [
    {
      id: 1,
      equipmentId: '1',
      equipmentName: 'Electron Microscope XL-30',
      startDate: '2023-06-01T09:00:00Z',
      endDate: '2023-06-01T12:00:00Z',
      purpose: 'Sample analysis for research project',
      status: 'Approved',
      createdAt: '2023-05-15T14:30:00Z',
      userId: userId
    },
    {
      id: 2,
      equipmentId: '2',
      equipmentName: 'Gas Chromatograph GC-2010',
      startDate: '2023-06-10T13:00:00Z',
      endDate: '2023-06-10T17:00:00Z',
      purpose: 'Chemical compound separation',
      status: 'Pending',
      createdAt: '2023-05-20T09:45:00Z',
      userId: userId
    }
  ];
  
  return res.status(200).json(reservations);
});

// Заглушка для user activity
app.get('/user/activity', (req, res) => {
  return res.status(200).json({ success: true, data: [] });
});
app.get('/api/user/activity', (req, res) => {
  return res.status(200).json({ success: true, data: [] });
});

// Заглушка для user favorites
app.get('/user/favorites', (req, res) => {
  return res.status(200).json({ 
    success: true, 
    data: [
      { id: 1, equipmentId: '1', equipmentName: 'Electron Microscope XL-30' },
      { id: 3, equipmentId: '3', equipmentName: 'PCR Thermal Cycler' }
    ]
  });
});

// Очень простая заглушка для резерваций - сделаем самый минимальный хэндлер
app.get('/api/reservations', (req, res) => {
  // Без парсинга запроса - просто возвращаем данные
  return res.json({ 
    success: true, 
    data: [
      {
        id: 1,
        equipmentId: '1',
        equipmentName: 'Electron Microscope XL-30',
        startDate: '2023-06-01T09:00:00Z',
        endDate: '2023-06-01T12:00:00Z',
        purpose: 'Sample analysis for research project',
        status: 'Approved',
        createdAt: '2023-05-15T14:30:00Z'
      },
      {
        id: 2,
        equipmentId: '2',
        equipmentName: 'Gas Chromatograph GC-2010',
        startDate: '2023-06-10T13:00:00Z',
        endDate: '2023-06-10T17:00:00Z',
        purpose: 'Chemical compound separation',
        status: 'Pending',
        createdAt: '2023-05-20T09:45:00Z'
      }
    ]
  });
});

// Endpoint для загрузки доступности оборудования
app.get('/api/equipment/:id/availability', (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      available: true,
      nextAvailableDate: new Date().toISOString(),
      blockedDates: []
    }
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
}); 