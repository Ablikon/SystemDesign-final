
const categories = [
  {
    id: '1',
    name: 'Microscopy',
    description: 'Equipment for observing objects too small to be seen by the naked eye',
    imageUrl: 'https://example.com/images/microscopy.jpg'
  },
  {
    id: '2',
    name: 'Spectroscopy',
    description: 'Equipment for analyzing the interaction between matter and electromagnetic radiation',
    imageUrl: 'https://example.com/images/spectroscopy.jpg'
  },
  {
    id: '3',
    name: 'Chromatography',
    description: 'Equipment for separating mixtures by passing them through a medium',
    imageUrl: 'https://example.com/images/chromatography.jpg'
  },
  {
    id: '4',
    name: 'PCR & Sequencing',
    description: 'Equipment for DNA amplification and analysis',
    imageUrl: 'https://example.com/images/pcr.jpg'
  },
  {
    id: '5',
    name: 'Imaging',
    description: 'Equipment for visual representation of samples and objects',
    imageUrl: 'https://example.com/images/imaging.jpg'
  }
];


exports.getAllCategories = (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

exports.getCategoryById = (req, res) => {
  try {
    const { id } = req.params;
    

    const category = categories.find(c => c.id === id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
};


exports.createCategory = (req, res) => {
  try {

    if (req.user.role !== 'admin' && req.user.role !== 'lab_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privileges required'
      });
    }
    
    const { name, description, imageUrl } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }
    

    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const newCategory = {
      id: (categories.length + 1).toString(),
      name,
      description: description || '',
      imageUrl: imageUrl || ''
    };
    
    categories.push(newCategory);
    
    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: newCategory
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
};

exports.updateCategory = (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.user.role !== 'admin' && req.user.role !== 'lab_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privileges required'
      });
    }
    

    const categoryIndex = categories.findIndex(c => c.id === id);
    
    if (categoryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    const { name, description, imageUrl } = req.body;
    
    if (name && name !== categories[categoryIndex].name) {
      const nameExists = categories.some(
        (c, index) => index !== categoryIndex && c.name.toLowerCase() === name.toLowerCase()
      );
      
      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }
    
 
    const updatedCategory = {
      ...categories[categoryIndex],
      name: name || categories[categoryIndex].name,
      description: description !== undefined ? description : categories[categoryIndex].description,
      imageUrl: imageUrl !== undefined ? imageUrl : categories[categoryIndex].imageUrl
    };

    categories[categoryIndex] = updatedCategory;
    
    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
};

exports.deleteCategory = (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.user.role !== 'admin' && req.user.role !== 'lab_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privileges required'
      });
    }
    

    const categoryIndex = categories.findIndex(c => c.id === id);
    
    if (categoryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    const deletedCategory = categories.splice(categoryIndex, 1)[0];
    
    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: deletedCategory
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
}; 