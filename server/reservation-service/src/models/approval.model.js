module.exports = (sequelize, DataTypes) => {
  const Approval = sequelize.define('Approval', {
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
    approverId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'approver_id'
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    approvalDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'approval_date'
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    approvalHistory: {
      type: DataTypes.JSONB,
      defaultValue: [],
      field: 'approval_history'
    }
  }, {
    tableName: 'approvals',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeUpdate: (approval) => {
        // Add entry to approval history if status changes
        if (approval.changed('status')) {
          const history = approval.approvalHistory || [];
          history.push({
            status: approval.status,
            approverId: approval.approverId,
            date: new Date(),
            comments: approval.comments
          });
          approval.approvalHistory = history;
          
          // Set approval date if approved or rejected
          if (['approved', 'rejected'].includes(approval.status)) {
            approval.approvalDate = new Date();
          }
        }
      }
    }
  });

  return Approval;
}; 