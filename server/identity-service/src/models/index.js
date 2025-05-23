const { Sequelize } = require('sequelize');
const dbConfig = require('../config/db.config');

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];


const sequelize = new Sequelize(config.url, {
  dialect: config.dialect,
  operatorsAliases: 0,
  logging: config.logging,
  pool: config.pool,
  dialectOptions: config.dialectOptions
});


const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;


db.User = require('./user.model')(sequelize, Sequelize);
db.Role = require('./role.model')(sequelize, Sequelize);
db.Organization = require('./organization.model')(sequelize, Sequelize);


db.User.belongsToMany(db.Role, {
  through: 'user_roles',
  foreignKey: 'user_id',
  otherKey: 'role_id'
});

db.Role.belongsToMany(db.User, {
  through: 'user_roles',
  foreignKey: 'role_id',
  otherKey: 'user_id'
});

db.User.belongsToMany(db.Organization, {
  through: 'user_organizations',
  foreignKey: 'user_id',
  otherKey: 'organization_id'
});

db.Organization.belongsToMany(db.User, {
  through: 'user_organizations',
  foreignKey: 'organization_id',
  otherKey: 'user_id'
});

module.exports = db; 