const express = require('express');
const equipmentController = require('../controllers/equipment.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', equipmentController.findAll);
router.get('/:id', equipmentController.findById);

router.post('/', authMiddleware, equipmentController.create);
router.put('/:id', authMiddleware, equipmentController.update);
router.delete('/:id', authMiddleware, equipmentController.delete);

module.exports = router; 