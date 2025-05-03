const express = require('express');
const { 
  createReservation,
  getReservations,
  getReservationById,
  updateReservation,
  cancelReservation,
  approveReservation,
  startUsage,
  endUsage
} = require('../controllers/reservation.controller');
const { verifyToken, hasRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes - none for reservations

// Protected routes (require authentication)
router.post('/', verifyToken, createReservation);
router.get('/', verifyToken, getReservations);
router.get('/:id', verifyToken, getReservationById);
router.put('/:id', verifyToken, updateReservation);
router.delete('/:id', verifyToken, cancelReservation);

// Equipment manager can approve/reject reservations
router.put('/:id/approve', verifyToken, hasRole('Laboratory Manager'), approveReservation);

// Usage tracking routes
router.post('/:id/start', verifyToken, startUsage);
router.post('/:id/end', verifyToken, endUsage);

module.exports = router; 