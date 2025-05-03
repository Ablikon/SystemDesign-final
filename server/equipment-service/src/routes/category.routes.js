const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Get all categories
router.get('/', categoryController.getAllCategories);

// Get category by ID
router.get('/:id', categoryController.getCategoryById);

// Create a new category (admin only)
router.post('/', authMiddleware, categoryController.createCategory);

// Update a category (admin only)
router.put('/:id', authMiddleware, categoryController.updateCategory);

// Delete a category (admin only)
router.delete('/:id', authMiddleware, categoryController.deleteCategory);

module.exports = router; 