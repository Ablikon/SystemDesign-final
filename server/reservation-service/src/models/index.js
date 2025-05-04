const { Sequelize } = require('sequelize');
const dbConfig = require('../config/db.config');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

// Determine environment
const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

// Create Sequelize instance with better error handling
let sequelize;
let useFallback = false;

try {
  sequelize = new Sequelize(config.url, {
    dialect: config.dialect,
    operatorsAliases: 0,
    logging: false,
    pool: config.pool,
    dialectOptions: config.dialectOptions,
    retry: {
      max: 3,
      timeout: 30000
    }
  });
  
  logger.info('Database connection established');
} catch (error) {
  logger.error('Failed to connect to database:', error);
  useFallback = true;
  // Use in-memory SQLite as fallback
  logger.info('Using in-memory SQLite as fallback');
  sequelize = new Sequelize('sqlite::memory:', {
    logging: false
  });
}

// Initialize db object
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.Reservation = require('./reservation.model')(sequelize, Sequelize);
db.Approval = require('./approval.model')(sequelize, Sequelize);
db.UsageRecord = require('./usageRecord.model')(sequelize, Sequelize);

// Define associations
db.Reservation.hasOne(db.Approval, {
  foreignKey: 'reservation_id',
  as: 'approval',
  onDelete: 'CASCADE'
});

db.Approval.belongsTo(db.Reservation, {
  foreignKey: 'reservation_id',
  onDelete: 'CASCADE'
});

db.Reservation.hasOne(db.UsageRecord, {
  foreignKey: 'reservation_id',
  as: 'usageRecord',
  onDelete: 'CASCADE'
});

db.UsageRecord.belongsTo(db.Reservation, {
  foreignKey: 'reservation_id',
  onDelete: 'CASCADE'
});

// Mock data for fallback
db.mockReservations = [];
db.mockApprovals = [];
db.mockUsageRecords = [];

// Mock data functions
db.createMockReservation = (data) => {
  const id = uuidv4();
  const reservation = {
    id,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const approval = {
    id: uuidv4(),
    reservationId: id,
    status: 'pending',
    approvalHistory: [{
      status: 'pending',
      date: new Date(),
      comments: 'Reservation created, awaiting approval'
    }],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const usageRecord = {
    id: uuidv4(),
    reservationId: id,
    status: 'not_started',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  db.mockReservations.push(reservation);
  db.mockApprovals.push(approval);
  db.mockUsageRecords.push(usageRecord);
  
  return {
    ...reservation,
    approval,
    usageRecord
  };
};

db.getMockReservations = (filters = {}) => {
  let filteredReservations = [...db.mockReservations];
  
  if (filters.userId) {
    filteredReservations = filteredReservations.filter(r => r.userId === filters.userId);
  }
  
  if (filters.equipmentId) {
    filteredReservations = filteredReservations.filter(r => r.equipmentId === filters.equipmentId);
  }
  
  if (filters.status) {
    filteredReservations = filteredReservations.filter(r => r.status === filters.status);
  }
  
  // Add related approvals and usage records
  return filteredReservations.map(reservation => {
    const approval = db.mockApprovals.find(a => a.reservationId === reservation.id) || null;
    const usageRecord = db.mockUsageRecords.find(u => u.reservationId === reservation.id) || null;
    
    return {
      ...reservation,
      approval,
      usageRecord
    };
  });
};

// Sync database with force option to reset tables if needed
db.syncDatabase = async (force = false) => {
  try {
    if (useFallback) {
      // For SQLite fallback, always force sync
      await sequelize.sync({ force: true });
      logger.info('Fallback database synced');
      
      // Populate with some sample data
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      
      // Create some sample reservations
      db.createMockReservation({
        userId: 'b2334c2f-1515-420f-9b27-c4a41b1be7a2',
        equipmentId: '1',
        startTime: tomorrow,
        endTime: dayAfter,
        status: 'pending',
        purpose: 'Research',
        notes: 'Sample reservation'
      });
    } else {
      await sequelize.sync({ force });
      logger.info(`Database synced successfully${force ? ' (with force reset)' : ''}`);
    }
    return true;
  } catch (error) {
    logger.error('Failed to sync database:', error);
    // If regular sync fails, try to use fallback
    useFallback = true;
    await sequelize.sync({ force: true });
    logger.info('Fallback database synced after sync failure');
    return false;
  }
};

// Flag for using fallback
db.useFallback = useFallback;

module.exports = db; 