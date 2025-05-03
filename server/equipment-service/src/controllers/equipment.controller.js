const { Equipment, Category, Capability, AccessPolicy, sequelize } = require('../models');
const { ApiError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// Mock data for equipment
const equipmentData = [
  {
    id: '1',
    name: 'Electron Microscope XL-30',
    manufacturer: 'TechVision',
    model: 'XL-30',
    location: 'Imaging Lab, Room 105',
    status: 'Available',
    description: 'High-resolution electron microscope for detailed imaging of biological samples',
    specifications: 'Resolution: 0.5nm, Magnification: 5,000-500,000x',
    imageUrl: 'https://example.com/microscope.jpg',
    categories: ['Microscopy'],
    capabilities: [
      { name: 'Resolution', value: '0.5nm' },
      { name: 'Magnification', value: '5,000-500,000x' },
      { name: 'Sample Types', value: 'Biological, Materials' },
      { name: 'Imaging Modes', value: 'Secondary Electron, Backscattered Electron' },
      { name: 'Computer Interface', value: 'Yes, with analysis software' }
    ],
    owner: 'University Lab'
  },
  {
    id: '2',
    name: 'Gas Chromatograph GC-2010',
    manufacturer: 'AnalyticsLab',
    model: 'GC-2010',
    location: 'Chemistry Lab, Room 203',
    status: 'In Use',
    description: 'Advanced chromatography system for analytical chemistry research',
    specifications: 'Detector: FID, TCD, ECD; Column oven: 4°C to 450°C',
    imageUrl: 'https://example.com/chromatograph.jpg',
    categories: ['Chromatography'],
    capabilities: [
      { name: 'Detector Types', value: 'FID, TCD, ECD' },
      { name: 'Column Oven Range', value: '4°C to 450°C' },
      { name: 'Sample Capacity', value: '120 samples' },
      { name: 'Analysis Speed', value: 'Fast, 20 samples/hour' }
    ],
    owner: 'Chemistry Department'
  },
  {
    id: '3',
    name: 'PCR Thermal Cycler',
    manufacturer: 'BioGenix',
    model: 'TC-500',
    location: 'Genomics Lab, Room 302',
    status: 'Available',
    description: 'Standard thermal cycler for PCR applications',
    specifications: 'Temperature range: 4°C to 99°C, Capacity: 96 wells',
    imageUrl: 'https://example.com/thermal-cycler.jpg',
    categories: ['PCR & Sequencing'],
    capabilities: [
      { name: 'Temperature Range', value: '4°C to 99°C' },
      { name: 'Well Capacity', value: '96 wells' },
      { name: 'Heating/Cooling Rate', value: '4°C/second' },
      { name: 'Programming', value: 'Up to 100 stored programs' },
      { name: 'Computer Interface', value: 'USB and Bluetooth' }
    ],
    owner: 'Genomics Department'
  }
];

/**
 * Get all equipment with optional filtering
 */
exports.findAll = (req, res) => {
  try {
    const { 
      name, 
      manufacturer, 
      category, 
      status,
      page = 1,
      limit = 10
    } = req.query;

    // Filter equipment
    let filteredEquipment = [...equipmentData];
    
    if (name) {
      filteredEquipment = filteredEquipment.filter(e => 
        e.name.toLowerCase().includes(name.toLowerCase())
      );
    }
    
    if (manufacturer) {
      filteredEquipment = filteredEquipment.filter(e => 
        e.manufacturer.toLowerCase().includes(manufacturer.toLowerCase())
      );
    }
    
    if (category) {
      filteredEquipment = filteredEquipment.filter(e => 
        e.categories.some(c => c.toLowerCase().includes(category.toLowerCase()))
      );
    }
    
    if (status) {
      filteredEquipment = filteredEquipment.filter(e => 
        e.status.toLowerCase() === status.toLowerCase()
      );
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedEquipment = filteredEquipment.slice(startIndex, endIndex);
    
    logger.info(`Retrieved ${paginatedEquipment.length} equipment items`);
    
    return res.status(200).json({
      success: true,
      data: paginatedEquipment,
      pagination: {
        total: filteredEquipment.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(filteredEquipment.length / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching equipment:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching equipment',
      error: error.message
    });
  }
};

/**
 * Get equipment by ID
 */
exports.findById = (req, res) => {
  try {
    const { id } = req.params;
    
    const equipment = equipmentData.find(e => e.id === id);
    
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }
    
    logger.info(`Retrieved equipment: ${equipment.name}`);
    
    return res.status(200).json({
      success: true,
      data: equipment
    });
  } catch (error) {
    logger.error('Error fetching equipment by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching equipment',
      error: error.message
    });
  }
};

/**
 * Create new equipment
 */
exports.create = (req, res) => {
  try {
    const { 
      name, 
      manufacturer, 
      model,
      location, 
      status,
      description,
      specifications,
      imageUrl,
      categories
    } = req.body;
    
    // Validate required fields
    if (!name || !manufacturer || !model) {
      return res.status(400).json({
        success: false,
        message: 'Name, manufacturer, and model are required'
      });
    }
    
    // Create new equipment
    const newEquipment = {
      id: (equipmentData.length + 1).toString(),
      name,
      manufacturer,
      model,
      location: location || '',
      status: status || 'Available',
      description: description || '',
      specifications: specifications || '',
      imageUrl: imageUrl || '',
      categories: categories || [],
      capabilities: [],
      owner: ''
    };
    
    // Add to equipment data
    equipmentData.push(newEquipment);
    
    logger.info(`Created new equipment: ${name}`);
    
    return res.status(201).json({
      success: true,
      data: newEquipment
    });
  } catch (error) {
    logger.error('Error creating equipment:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating equipment',
      error: error.message
    });
  }
};

/**
 * Update equipment
 */
exports.update = (req, res) => {
  try {
    const { id } = req.params;
    
    // Find equipment by ID
    const equipmentIndex = equipmentData.findIndex(e => e.id === id);
    
    if (equipmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }
    
    const { 
      name, 
      manufacturer, 
      model,
      location, 
      status,
      description,
      specifications,
      imageUrl,
      categories,
      capabilities,
      owner
    } = req.body;
    
    // Update equipment
    const updatedEquipment = {
      ...equipmentData[equipmentIndex],
      name: name || equipmentData[equipmentIndex].name,
      manufacturer: manufacturer || equipmentData[equipmentIndex].manufacturer,
      model: model || equipmentData[equipmentIndex].model,
      location: location || equipmentData[equipmentIndex].location,
      status: status || equipmentData[equipmentIndex].status,
      description: description || equipmentData[equipmentIndex].description,
      specifications: specifications || equipmentData[equipmentIndex].specifications,
      imageUrl: imageUrl || equipmentData[equipmentIndex].imageUrl,
      categories: categories || equipmentData[equipmentIndex].categories,
      capabilities: capabilities || equipmentData[equipmentIndex].capabilities,
      owner: owner || equipmentData[equipmentIndex].owner
    };
    
    // Update in data array
    equipmentData[equipmentIndex] = updatedEquipment;
    
    logger.info(`Updated equipment: ${updatedEquipment.name}`);
    
    return res.status(200).json({
      success: true,
      data: updatedEquipment
    });
  } catch (error) {
    logger.error('Error updating equipment:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating equipment',
      error: error.message
    });
  }
};

/**
 * Delete equipment
 */
exports.delete = (req, res) => {
  try {
    const { id } = req.params;
    
    // Find equipment by ID
    const equipmentIndex = equipmentData.findIndex(e => e.id === id);
    
    if (equipmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }
    
    // Remove equipment
    const deletedEquipment = equipmentData.splice(equipmentIndex, 1)[0];
    
    logger.info(`Deleted equipment: ${deletedEquipment.name}`);
    
    return res.status(200).json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting equipment:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting equipment',
      error: error.message
    });
  }
}; 