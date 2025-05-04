const { User, Role } = require('../models');
const logger = require('../utils/logger');


exports.getCurrentUser = async (req, res, next) => {
  try {

    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Role,
        through: { attributes: [] }
      }]
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error(`Error fetching current user: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
};


exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, institution, position, researchInterests, bio } = req.body;
    

    let user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    

    await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      institution: institution || user.institution,
      position: position || user.position,
      researchInterests: researchInterests || user.researchInterests,
      bio: bio || user.bio
    });
    

    user = await User.findByPk(req.user.id, {
      include: [{
        model: Role,
        through: { attributes: [] }
      }]
    });
    
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    logger.error(`Error updating profile: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};


exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const adminUser = await User.findByPk(req.user.id, {
      include: [{
        model: Role,
        where: { name: 'admin' },
        required: false
      }]
    });
    
    if (!adminUser || adminUser.Roles.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privileges required'
      });
    }
    

    const user = await User.findByPk(id, {
      include: [{
        model: Role,
        through: { attributes: [] }
      }]
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error(`Error fetching user by ID: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};


exports.getAllUsers = async (req, res, next) => {
  try {

    const adminUser = await User.findByPk(req.user.id, {
      include: [{
        model: Role,
        where: { name: 'admin' },
        required: false
      }]
    });
    
    if (!adminUser || adminUser.Roles.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privileges required'
      });
    }
    
    const users = await User.findAll({
      include: [{
        model: Role,
        through: { attributes: [] }
      }]
    });
    
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    logger.error(`Error fetching all users: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

exports.createUser = async (req, res, next) => {
  try {

    const adminUser = await User.findByPk(req.user.id, {
      include: [{
        model: Role,
        where: { name: 'admin' },
        required: false
      }]
    });
    
    if (!adminUser || adminUser.Roles.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privileges required'
      });
    }
    
    const { firstName, lastName, email, password, roleName, institution, position, researchInterests, bio } = req.body;
    
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }
    

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password, 
      institution: institution || '',
      position: position || '',
      researchInterests: researchInterests || [],
      bio: bio || ''
    });
    
    if (roleName) {
      const role = await Role.findOne({ where: { name: roleName } });
      if (role) {
        await newUser.addRole(role);
      }
    } else {
 
      const researcherRole = await Role.findOne({ where: { name: 'researcher' } });
      if (researcherRole) {
        await newUser.addRole(researcherRole);
      }
    }
    

    const createdUser = await User.findByPk(newUser.id, {
      include: [{
        model: Role,
        through: { attributes: [] }
      }]
    });
    
    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: createdUser
    });
  } catch (error) {
    logger.error(`Error creating user: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};


exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    

    const adminUser = await User.findByPk(req.user.id, {
      include: [{
        model: Role,
        where: { name: 'admin' },
        required: false
      }]
    });
    
    if (!adminUser || adminUser.Roles.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privileges required'
      });
    }
    

    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    

    await user.destroy();
    
    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting user: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
}; 