const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Get all roles (admin only)
router.get('/', authenticate, roleController.getAllRoles);

// Create a new role (admin only)
router.post('/', authenticate, roleController.createRole);

// Assign role to user (admin only)
router.post('/assign', authenticate, roleController.assignRoleToUser);

// Remove role from user (admin only)
router.post('/revoke', authenticate, roleController.revokeRoleFromUser);

module.exports = router; 