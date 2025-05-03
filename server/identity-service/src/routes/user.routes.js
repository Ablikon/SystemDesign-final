const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Get current user profile
router.get('/profile', authMiddleware, userController.getCurrentUser);

// Update user profile
router.put('/profile', authMiddleware, userController.updateProfile);

// Get user by ID (admin only)
router.get('/:id', authMiddleware, userController.getUserById);

// Get all users (admin only)
router.get('/', authMiddleware, userController.getAllUsers);

// Create a new user (admin only)
router.post('/', authMiddleware, userController.createUser);

// Delete a user (admin only)
router.delete('/:id', authMiddleware, userController.deleteUser);

module.exports = router; 