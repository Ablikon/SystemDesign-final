const express = require('express');
const { 
  findAll,
  findById,
  create,
  update,
  delete: deleteEquipment
} = require('../controllers/equipment.controller');
const { verifyToken, hasRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes (no authentication required)
router.get('/', findAll);
router.get('/:id', findById);

// Protected routes (authentication required)
router.post('/', verifyToken, hasRole('Laboratory Manager'), create);
router.put('/:id', verifyToken, hasRole('Laboratory Manager'), update);
router.delete('/:id', verifyToken, hasRole('Laboratory Manager'), deleteEquipment);

module.exports = router; 