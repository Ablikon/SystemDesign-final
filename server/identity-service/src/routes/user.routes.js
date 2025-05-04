const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Get current user profile
router.get('/profile', authenticate, userController.getCurrentUser);

// Update user profile
router.put('/profile', authenticate, userController.updateProfile);

// Get user by ID (admin only)
router.get('/:id', authenticate, userController.getUserById);

// Get all users (admin only)
router.get('/', authenticate, userController.getAllUsers);

// Create a new user (admin only)
router.post('/', authenticate, userController.createUser);

// Delete a user (admin only)
router.delete('/:id', authenticate, userController.deleteUser);

module.exports = router; 