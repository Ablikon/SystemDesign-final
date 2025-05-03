const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Get all roles (admin only)
router.get('/', authMiddleware, roleController.getAllRoles);

// Create a new role (admin only)
router.post('/', authMiddleware, roleController.createRole);

// Assign role to user (admin only)
router.post('/assign', authMiddleware, roleController.assignRoleToUser);

// Remove role from user (admin only)
router.post('/revoke', authMiddleware, roleController.revokeRoleFromUser);

module.exports = router; 