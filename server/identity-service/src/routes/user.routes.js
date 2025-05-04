const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');


router.get('/profile', authenticate, userController.getCurrentUser);


router.put('/profile', authenticate, userController.updateProfile);


router.get('/:id', authenticate, userController.getUserById);


router.get('/', authenticate, userController.getAllUsers);


router.post('/', authenticate, userController.createUser);


router.delete('/:id', authenticate, userController.deleteUser);

module.exports = router; 