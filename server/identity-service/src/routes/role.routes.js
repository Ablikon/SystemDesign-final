const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const { authenticate } = require('../middleware/auth.middleware');


router.get('/', authenticate, roleController.getAllRoles);


router.post('/', authenticate, roleController.createRole);


router.post('/assign', authenticate, roleController.assignRoleToUser);


router.post('/revoke', authenticate, roleController.revokeRoleFromUser);

module.exports = router; 