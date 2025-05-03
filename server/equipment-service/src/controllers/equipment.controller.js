const { Equipment, Category, Capability, AccessPolicy, sequelize } = require('../models');
const { ApiError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// Get all equipment with optional filtering
exports.findAll = async (req, res, next) => {
  try {
    const { 
      name, 
      manufacturer, 
      category, 
      location, 
      status, 
      ownerOrgId,
      page = 1,
      limit = 10
    } = req.query;

    // Build query conditions
    const where = {};
    if (name) where.name = { [Op.iLike]: `%${name}%` };
    if (manufacturer) where.manufacturer = { [Op.iLike]: `%${manufacturer}%` };
    if (location) where.location = { [Op.iLike]: `%${location}%` };
    if (status) where.status = status;
    if (ownerOrgId) where.ownerOrgId = ownerOrgId;

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Build include based on category filter
    const include = [
      {
        model: Capability,
        attributes: ['id', 'name', 'description']
      }
    ];

    // Add category filter if specified
    if (category) {
      include.push({
        model: Category,
        where: { name: { [Op.iLike]: `%${category}%` } },
        through: { attributes: [] }
      });
    } else {
      include.push({
        model: Category,
        through: { attributes: [] }
      });
    }

    // Execute query
    const { count, rows } = await Equipment.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset,
      distinct: true
    });

    logger.info(`Retrieved ${rows.length} equipment items`);

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get equipment by ID
exports.findById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const equipment = await Equipment.findByPk(id, {
      include: [
        {
          model: Category,
          through: { attributes: [] }
        },
        {
          model: Capability
        },
        {
          model: AccessPolicy
        }
      ]
    });

    if (!equipment) {
      throw new ApiError(404, 'Equipment not found');
    }

    logger.info(`Retrieved equipment: ${equipment.name}`);

    res.status(200).json({
      success: true,
      data: equipment
    });
  } catch (error) {
    next(error);
  }
};

// Create new equipment
exports.create = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { 
      name, 
      model, 
      manufacturer, 
      location, 
      ownerOrgId, 
      specifications,
      connectivityDetails,
      status,
      description,
      imageUrl,
      categories = [],
      capabilities = []
    } = req.body;

    // Create equipment
    const equipment = await Equipment.create({
      name,
      model,
      manufacturer,
      location,
      ownerOrgId,
      specifications,
      connectivityDetails,
      status,
      description,
      imageUrl
    }, { transaction });

    // Add categories
    if (categories.length > 0) {
      const categoryInstances = await Category.findAll({
        where: { id: { [Op.in]: categories } }
      });
      await equipment.addCategories(categoryInstances, { transaction });
    }

    // Add capabilities
    if (capabilities.length > 0) {
      const capabilityInstances = await Promise.all(
        capabilities.map(capability => 
          Capability.create({
            ...capability,
            equipmentId: equipment.id
          }, { transaction })
        )
      );
    }

    await transaction.commit();

    // Fetch the complete equipment with associations
    const completeEquipment = await Equipment.findByPk(equipment.id, {
      include: [
        {
          model: Category,
          through: { attributes: [] }
        },
        {
          model: Capability
        }
      ]
    });

    logger.info(`Created new equipment: ${name}`);

    res.status(201).json({
      success: true,
      data: completeEquipment
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Update equipment
exports.update = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { 
      name, 
      model, 
      manufacturer, 
      location, 
      specifications,
      connectivityDetails,
      status,
      description,
      imageUrl,
      categories = [],
      capabilities = []
    } = req.body;

    // Check if equipment exists
    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      throw new ApiError(404, 'Equipment not found');
    }

    // Update equipment
    await equipment.update({
      name,
      model,
      manufacturer,
      location,
      specifications,
      connectivityDetails,
      status,
      description,
      imageUrl
    }, { transaction });

    // Update categories if provided
    if (categories.length > 0) {
      const categoryInstances = await Category.findAll({
        where: { id: { [Op.in]: categories } }
      });
      await equipment.setCategories(categoryInstances, { transaction });
    }

    // Update capabilities if provided
    if (capabilities.length > 0) {
      // Remove existing capabilities
      await Capability.destroy({
        where: { equipmentId: id },
        transaction
      });

      // Add new capabilities
      await Promise.all(
        capabilities.map(capability => 
          Capability.create({
            ...capability,
            equipmentId: id
          }, { transaction })
        )
      );
    }

    await transaction.commit();

    // Fetch the updated equipment with associations
    const updatedEquipment = await Equipment.findByPk(id, {
      include: [
        {
          model: Category,
          through: { attributes: [] }
        },
        {
          model: Capability
        }
      ]
    });

    logger.info(`Updated equipment: ${updatedEquipment.name}`);

    res.status(200).json({
      success: true,
      data: updatedEquipment
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Delete equipment
exports.delete = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    // Check if equipment exists
    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      throw new ApiError(404, 'Equipment not found');
    }

    // Delete capabilities
    await Capability.destroy({
      where: { equipmentId: id },
      transaction
    });

    // Delete access policies
    await AccessPolicy.destroy({
      where: { equipmentId: id },
      transaction
    });

    // Delete equipment (will also remove category associations)
    await equipment.destroy({ transaction });

    await transaction.commit();

    logger.info(`Deleted equipment: ${equipment.name}`);

    res.status(200).json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}; 