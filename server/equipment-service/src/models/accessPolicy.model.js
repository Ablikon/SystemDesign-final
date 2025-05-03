module.exports = (sequelize, DataTypes) => {
  const AccessPolicy = sequelize.define('AccessPolicy', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    equipmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'equipment_id',
      references: {
        model: 'equipment',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rules: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'access_policies',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'policy_equipment_idx',
        fields: ['equipment_id']
      }
    ]
  });

  return AccessPolicy;
}; 