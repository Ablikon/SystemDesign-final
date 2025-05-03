module.exports = (sequelize, DataTypes) => {
  const Equipment = sequelize.define('Equipment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false
    },
    manufacturer: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ownerOrgId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'owner_org_id'
    },
    specifications: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    connectivityDetails: {
      type: DataTypes.JSONB,
      defaultValue: {},
      field: 'connectivity_details'
    },
    status: {
      type: DataTypes.ENUM('available', 'in_use', 'maintenance', 'offline'),
      defaultValue: 'available'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'image_url'
    }
  }, {
    tableName: 'equipment',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'equipment_name_idx',
        fields: ['name']
      },
      {
        name: 'equipment_status_idx',
        fields: ['status']
      },
      {
        name: 'equipment_location_idx',
        fields: ['location']
      }
    ]
  });

  return Equipment;
}; 