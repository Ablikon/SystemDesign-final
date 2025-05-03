module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    permissions: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'roles',
    timestamps: true,
    underscored: true
  });

  return Role;
}; 