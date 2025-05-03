module.exports = (sequelize, DataTypes) => {
  const Capability = sequelize.define('Capability', {
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    parameters: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'capabilities',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'capability_equipment_idx',
        fields: ['equipment_id']
      }
    ]
  });

  return Capability;
}; 