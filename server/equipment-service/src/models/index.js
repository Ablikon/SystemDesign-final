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
db.Equipment = require('./equipment.model')(sequelize, Sequelize);
db.Category = require('./category.model')(sequelize, Sequelize);
db.Capability = require('./capability.model')(sequelize, Sequelize);
db.AccessPolicy = require('./accessPolicy.model')(sequelize, Sequelize);

// Define associations
db.Equipment.belongsToMany(db.Category, {
  through: 'equipment_categories',
  foreignKey: 'equipment_id',
  otherKey: 'category_id'
});

db.Category.belongsToMany(db.Equipment, {
  through: 'equipment_categories',
  foreignKey: 'category_id',
  otherKey: 'equipment_id'
});

db.Category.belongsTo(db.Category, {
  as: 'parent',
  foreignKey: 'parent_category_id'
});

db.Category.hasMany(db.Category, {
  as: 'children',
  foreignKey: 'parent_category_id'
});

db.Equipment.hasMany(db.Capability, {
  foreignKey: 'equipment_id'
});

db.Capability.belongsTo(db.Equipment, {
  foreignKey: 'equipment_id'
});

db.Equipment.hasMany(db.AccessPolicy, {
  foreignKey: 'equipment_id'
});

db.AccessPolicy.belongsTo(db.Equipment, {
  foreignKey: 'equipment_id'
});

module.exports = db; 