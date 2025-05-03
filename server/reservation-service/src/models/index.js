const { Sequelize } = require('sequelize');
const dbConfig = require('../config/db.config');

// Determine environment
const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

// Create Sequelize instance
const sequelize = new Sequelize(config.url, {
  dialect: config.dialect,
  operatorsAliases: 0,
  logging: config.logging,
  pool: config.pool,
  dialectOptions: config.dialectOptions
});

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
  as: 'approval'
});

db.Approval.belongsTo(db.Reservation, {
  foreignKey: 'reservation_id'
});

db.Reservation.hasOne(db.UsageRecord, {
  foreignKey: 'reservation_id',
  as: 'usageRecord'
});

db.UsageRecord.belongsTo(db.Reservation, {
  foreignKey: 'reservation_id'
});

module.exports = db; 