const { Reservation, Approval, UsageRecord, sequelize } = require('../models');
const { ApiError } = require('../middleware/error.middleware');
const axios = require('axios');
const logger = require('../utils/logger');
const moment = require('moment');
const { Op } = require('sequelize');

// Equipment service URL
const EQUIPMENT_SERVICE_URL = process.env.EQUIPMENT_SERVICE_URL || 'http://localhost:3002';

// Create a new reservation
exports.createReservation = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { equipmentId, startTime, endTime, purpose, notes } = req.body;
    const userId = req.userId;

    // Validate equipment exists and is available
    try {
      const equipmentResponse = await axios.get(`${EQUIPMENT_SERVICE_URL}/api/equipment/${equipmentId}`);
      const equipment = equipmentResponse.data.data;
      
      if (equipment.status !== 'available') {
        throw new ApiError(400, 'Equipment is not available for reservation');
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      
      logger.error('Failed to verify equipment:', error.message);
      throw new ApiError(404, 'Equipment not found or service unavailable');
    }

    // Check for overlapping reservations
    const hasOverlap = await Reservation.checkOverlap(equipmentId, startTime, endTime);
    if (hasOverlap) {
      throw new ApiError(409, 'This time slot conflicts with an existing reservation');
    }

    // Create reservation
    const reservation = await Reservation.create({
      userId,
      equipmentId,
      startTime,
      endTime,
      purpose,
      notes,
      status: 'pending'
    }, { transaction });
    
    // Create approval entry
    const approval = await Approval.create({
      reservationId: reservation.id,
      status: 'pending',
      approvalHistory: [{
        status: 'pending',
        date: new Date(),
        comments: 'Reservation created, awaiting approval'
      }]
    }, { transaction });
    
    // Create usage record
    const usageRecord = await UsageRecord.create({
      reservationId: reservation.id,
      status: 'not_started'
    }, { transaction });
    
    await transaction.commit();
    
    logger.info(`New reservation created: ${reservation.id}`);
    
    res.status(201).json({
      success: true,
      data: {
        ...reservation.toJSON(),
        approval: approval.toJSON(),
        usageRecord: usageRecord.toJSON()
      }
    });
    
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Get all reservations with optional filtering
exports.getReservations = async (req, res, next) => {
  try {
    const { 
      userId, 
      equipmentId, 
      status, 
      startDate, 
      endDate,
      page = 1,
      limit = 10
    } = req.query;
    
    // Build query conditions
    const where = {};
    if (userId) where.userId = userId;
    if (equipmentId) where.equipmentId = equipmentId;
    if (status) where.status = status;
    
    // Date range filter
    if (startDate || endDate) {
      where[Op.or] = [];
      
      if (startDate && endDate) {
        where[Op.or].push({
          [Op.and]: [
            { startTime: { [Op.gte]: new Date(startDate) } },
            { startTime: { [Op.lte]: new Date(endDate) } }
          ]
        });
      } else if (startDate) {
        where.startTime = { [Op.gte]: new Date(startDate) };
      } else if (endDate) {
        where.startTime = { [Op.lte]: new Date(endDate) };
      }
    }
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Execute query
    const { count, rows } = await Reservation.findAndCountAll({
      where,
      include: [
        { model: Approval, as: 'approval' },
        { model: UsageRecord, as: 'usageRecord' }
      ],
      limit: parseInt(limit),
      offset,
      order: [['startTime', 'ASC']]
    });
    
    logger.info(`Retrieved ${rows.length} reservations`);
    
    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get reservation by ID
exports.getReservationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const reservation = await Reservation.findByPk(id, {
      include: [
        { model: Approval, as: 'approval' },
        { model: UsageRecord, as: 'usageRecord' }
      ]
    });
    
    if (!reservation) {
      throw new ApiError(404, 'Reservation not found');
    }
    
    res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    next(error);
  }
};

// Update reservation
exports.updateReservation = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { startTime, endTime, purpose, notes } = req.body;
    const userId = req.userId;
    
    // Find reservation
    const reservation = await Reservation.findByPk(id);
    
    if (!reservation) {
      throw new ApiError(404, 'Reservation not found');
    }
    
    // Check if user owns the reservation or is an admin
    if (reservation.userId !== userId) {
      throw new ApiError(403, 'Not authorized to update this reservation');
    }
    
    // Only pending reservations can be updated
    if (reservation.status !== 'pending') {
      throw new ApiError(400, `Cannot update reservation with status: ${reservation.status}`);
    }
    
    // Check for time change and overlaps
    if (startTime && endTime) {
      const hasOverlap = await Reservation.checkOverlap(
        reservation.equipmentId, 
        startTime, 
        endTime,
        id
      );
      
      if (hasOverlap) {
        throw new ApiError(409, 'This time slot conflicts with an existing reservation');
      }
    }
    
    // Update reservation
    await reservation.update({
      startTime: startTime || reservation.startTime,
      endTime: endTime || reservation.endTime,
      purpose: purpose || reservation.purpose,
      notes: notes || reservation.notes
    }, { transaction });
    
    // Get related approval
    const approval = await Approval.findOne({ 
      where: { reservationId: id } 
    });
    
    if (approval) {
      // Add history entry about update
      const history = approval.approvalHistory || [];
      history.push({
        status: 'pending',
        date: new Date(),
        comments: 'Reservation details updated, awaiting approval'
      });
      
      await approval.update({
        approvalHistory: history,
        status: 'pending' // Reset to pending due to changes
      }, { transaction });
    }
    
    await transaction.commit();
    
    // Get updated reservation with associations
    const updatedReservation = await Reservation.findByPk(id, {
      include: [
        { model: Approval, as: 'approval' },
        { model: UsageRecord, as: 'usageRecord' }
      ]
    });
    
    logger.info(`Reservation updated: ${id}`);
    
    res.status(200).json({
      success: true,
      data: updatedReservation
    });
    
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Cancel reservation
exports.cancelReservation = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    // Find reservation
    const reservation = await Reservation.findByPk(id);
    
    if (!reservation) {
      throw new ApiError(404, 'Reservation not found');
    }
    
    // Check if user owns the reservation or is an admin
    if (reservation.userId !== userId) {
      throw new ApiError(403, 'Not authorized to cancel this reservation');
    }
    
    // Only pending or approved reservations can be canceled
    if (!['pending', 'approved'].includes(reservation.status)) {
      throw new ApiError(400, `Cannot cancel reservation with status: ${reservation.status}`);
    }
    
    // Update reservation status
    await reservation.update({
      status: 'canceled'
    }, { transaction });
    
    // Update usage record if exists
    const usageRecord = await UsageRecord.findOne({
      where: { reservationId: id }
    });
    
    if (usageRecord) {
      await usageRecord.update({
        status: 'canceled'
      }, { transaction });
    }
    
    await transaction.commit();
    
    logger.info(`Reservation canceled: ${id}`);
    
    res.status(200).json({
      success: true,
      message: 'Reservation canceled successfully'
    });
    
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Handle reservation approval
exports.approveReservation = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { status, comments } = req.body;
    const approverId = req.userId;
    
    // Status must be either approved or rejected
    if (!['approved', 'rejected'].includes(status)) {
      throw new ApiError(400, 'Status must be either approved or rejected');
    }
    
    // Find reservation and approval
    const reservation = await Reservation.findByPk(id);
    
    if (!reservation) {
      throw new ApiError(404, 'Reservation not found');
    }
    
    const approval = await Approval.findOne({
      where: { reservationId: id }
    });
    
    if (!approval) {
      throw new ApiError(404, 'Approval record not found');
    }
    
    // Update approval
    await approval.update({
      status,
      approverId,
      comments,
      approvalDate: new Date()
    }, { transaction });
    
    // Update reservation status
    await reservation.update({
      status: status === 'approved' ? 'approved' : 'rejected'
    }, { transaction });
    
    await transaction.commit();
    
    logger.info(`Reservation ${status}: ${id}`);
    
    // Get updated reservation with associations
    const updatedReservation = await Reservation.findByPk(id, {
      include: [
        { model: Approval, as: 'approval' },
        { model: UsageRecord, as: 'usageRecord' }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: updatedReservation
    });
    
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Record usage start
exports.startUsage = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    // Find reservation
    const reservation = await Reservation.findByPk(id);
    
    if (!reservation) {
      throw new ApiError(404, 'Reservation not found');
    }
    
    // Check if user owns the reservation
    if (reservation.userId !== userId) {
      throw new ApiError(403, 'Not authorized to start usage for this reservation');
    }
    
    // Check if reservation is approved
    if (reservation.status !== 'approved') {
      throw new ApiError(400, 'Only approved reservations can be started');
    }
    
    // Check if within time window
    const now = moment();
    const startTime = moment(reservation.startTime);
    const endTime = moment(reservation.endTime);
    
    if (now.isBefore(startTime.subtract(15, 'minutes'))) {
      throw new ApiError(400, 'Cannot start usage more than 15 minutes before scheduled time');
    }
    
    if (now.isAfter(endTime)) {
      throw new ApiError(400, 'Scheduled time has already passed');
    }
    
    // Get usage record
    const usageRecord = await UsageRecord.findOne({
      where: { reservationId: id }
    });
    
    if (!usageRecord) {
      throw new ApiError(404, 'Usage record not found');
    }
    
    if (usageRecord.status !== 'not_started') {
      throw new ApiError(400, `Usage already in status: ${usageRecord.status}`);
    }
    
    // Update usage record
    await usageRecord.update({
      status: 'in_progress',
      actualStartTime: new Date()
    }, { transaction });
    
    await transaction.commit();
    
    logger.info(`Reservation usage started: ${id}`);
    
    res.status(200).json({
      success: true,
      data: {
        ...usageRecord.toJSON(),
        reservation: reservation.toJSON()
      }
    });
    
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Record usage end
exports.endUsage = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { dataVolume, telemetry, notes } = req.body;
    const userId = req.userId;
    
    // Find reservation
    const reservation = await Reservation.findByPk(id);
    
    if (!reservation) {
      throw new ApiError(404, 'Reservation not found');
    }
    
    // Check if user owns the reservation
    if (reservation.userId !== userId) {
      throw new ApiError(403, 'Not authorized to end usage for this reservation');
    }
    
    // Get usage record
    const usageRecord = await UsageRecord.findOne({
      where: { reservationId: id }
    });
    
    if (!usageRecord) {
      throw new ApiError(404, 'Usage record not found');
    }
    
    if (usageRecord.status !== 'in_progress') {
      throw new ApiError(400, 'Usage is not in progress');
    }
    
    // Update usage record
    await usageRecord.update({
      status: 'completed',
      actualEndTime: new Date(),
      dataVolume: dataVolume || usageRecord.dataVolume,
      telemetry: telemetry || usageRecord.telemetry,
      notes: notes || usageRecord.notes
    }, { transaction });
    
    // Update reservation status
    await reservation.update({
      status: 'completed'
    }, { transaction });
    
    await transaction.commit();
    
    logger.info(`Reservation usage completed: ${id}`);
    
    res.status(200).json({
      success: true,
      data: {
        ...usageRecord.toJSON(),
        duration: usageRecord.getDuration(),
        reservation: reservation.toJSON()
      }
    });
    
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}; 