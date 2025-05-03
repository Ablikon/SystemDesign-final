const moment = require('moment');

module.exports = (sequelize, DataTypes) => {
  const Reservation = sequelize.define('Reservation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id'
    },
    equipmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'equipment_id'
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_time',
      validate: {
        isDate: true,
        isFuture(value) {
          if (moment(value).isBefore(moment())) {
            throw new Error('Start time must be in the future');
          }
        }
      }
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'end_time',
      validate: {
        isDate: true,
        isAfterStartTime(value) {
          if (moment(value).isSameOrBefore(moment(this.startTime))) {
            throw new Error('End time must be after start time');
          }
        }
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'canceled', 'completed'),
      defaultValue: 'pending'
    },
    purpose: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'reservations',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'reservations_equipment_time_idx',
        fields: ['equipment_id', 'start_time', 'end_time']
      },
      {
        name: 'reservations_user_idx',
        fields: ['user_id']
      },
      {
        name: 'reservations_status_idx',
        fields: ['status']
      }
    ]
  });

  // Check for overlapping reservations
  Reservation.checkOverlap = async function(equipmentId, startTime, endTime, excludeId = null) {
    const whereClause = {
      equipment_id: equipmentId,
      status: { [sequelize.Op.in]: ['pending', 'approved'] },
      [sequelize.Op.or]: [
        {
          start_time: { [sequelize.Op.between]: [startTime, endTime] }
        },
        {
          end_time: { [sequelize.Op.between]: [startTime, endTime] }
        },
        {
          [sequelize.Op.and]: [
            { start_time: { [sequelize.Op.lte]: startTime } },
            { end_time: { [sequelize.Op.gte]: endTime } }
          ]
        }
      ]
    };

    // Exclude the current reservation when updating
    if (excludeId) {
      whereClause.id = { [sequelize.Op.ne]: excludeId };
    }

    const count = await this.count({ where: whereClause });
    return count > 0;
  };

  return Reservation;
}; 