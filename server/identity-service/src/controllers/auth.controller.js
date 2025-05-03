const jwt = require('jsonwebtoken');
const { User, Role, sequelize } = require('../models');
const { ApiError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');

// Register a new user
exports.register = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { email, password, firstName, lastName, institution, researchInterests } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists');
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      institution,
      researchInterests,
      profileData: {}
    }, { transaction });

    // Find default role (Researcher) and assign it to the user
    const researcherRole = await Role.findOne({ 
      where: { name: 'Researcher' } 
    });

    if (researcherRole) {
      await user.addRole(researcherRole, { transaction });
    }

    await transaction.commit();

    // Generate token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    logger.info(`New user registered: ${email}`);

    // Return user data and token
    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ 
      where: { email },
      include: [{
        model: Role,
        through: { attributes: [] }
      }]
    });

    // Check if user exists and password is correct
    if (!user || !(await user.validPassword(password))) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    logger.info(`User logged in: ${email}`);

    // Return user data and token
    res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
exports.me = async (req, res, next) => {
  try {
    // User is loaded from auth middleware and attached to req
    const user = await User.findByPk(req.userId, {
      include: [{
        model: Role,
        through: { attributes: [] }
      }]
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
}; 