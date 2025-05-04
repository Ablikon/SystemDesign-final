const { createProxyMiddleware } = require('http-proxy-middleware');
const logger = require('../utils/logger');


const IDENTITY_SERVICE_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001';
const EQUIPMENT_SERVICE_URL = process.env.EQUIPMENT_SERVICE_URL || 'http://localhost:3002';
const RESERVATION_SERVICE_URL = process.env.RESERVATION_SERVICE_URL || 'http://localhost:3003';


const proxyOptions = {
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth',
    '^/api/users': '/api/users',
    '^/api/equipment': '/api/equipment',
    '^/api/categories': '/api/categories',
    '^/api/reservations': '/api/reservations'
  },
  logLevel: 'silent', 
  onProxyReq: (proxyReq, req, res) => {
    logger.debug(`Proxying request to: ${proxyReq.path}`);
    
    logger.debug(`Proxy headers: ${JSON.stringify(proxyReq.getHeaders())}`);
    if (req.body) {
      logger.debug(`Request body: ${JSON.stringify(req.body)}`);
    }
  },
  onError: (err, req, res) => {
    logger.error(`Proxy error: ${err.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Service temporarily unavailable'
    });
  },

  timeout: 30000 
};

const proxyRoutes = [
  {
    context: ['/api/auth', '/api/users'],
    target: IDENTITY_SERVICE_URL,
    ...proxyOptions
  },
  {
    context: ['/api/equipment', '/api/categories'],
    target: EQUIPMENT_SERVICE_URL,
    ...proxyOptions
  },
  {
    context: ['/api/reservations'],
    target: RESERVATION_SERVICE_URL,
    ...proxyOptions
  }
];


const setupProxies = (app) => {
  proxyRoutes.forEach(route => {
    app.use(
      route.context,
      createProxyMiddleware({
        target: route.target,
        changeOrigin: route.changeOrigin,
        pathRewrite: route.pathRewrite,
        logLevel: route.logLevel,
        onProxyReq: route.onProxyReq,
        onError: route.onError
      })
    );
    
    logger.info(`Proxy configured: ${route.context} -> ${route.target}`);
  });
};

module.exports = { setupProxies }; 