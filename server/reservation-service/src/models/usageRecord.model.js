module.exports = (sequelize, DataTypes) => {
  const UsageRecord = sequelize.define('UsageRecord', {
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    reservationId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'reservation_id',
      references: {
        model: 'reservations',
        key: 'id'
      }
    },
    actualStartTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'actual_start_time'
    },
    actualEndTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'actual_end_time'
    },
    dataVolume: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'data_volume',
      defaultValue: 0
    },
    telemetry: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    status: {
      type: DataTypes.ENUM('not_started', 'in_progress', 'completed', 'canceled', 'error'),
      defaultValue: 'not_started'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'usage_records',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'usage_reservation_idx',
        fields: ['reservation_id']
      },
      {
        name: 'usage_status_idx',
        fields: ['status']
      }
    ]
  });

  // Calculate duration in minutes
  UsageRecord.prototype.getDuration = function() {
    if (this.actualStartTime && this.actualEndTime) {
      const start = new Date(this.actualStartTime);
      const end = new Date(this.actualEndTime);
      return Math.round((end - start) / (1000 * 60)); // Duration in minutes
    }
    return 0;
  };

  return UsageRecord;
}; 