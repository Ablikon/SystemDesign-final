// Mock user data for demonstration
const users = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'researcher',
    institution: 'Stanford University',
    position: 'Research Associate',
    fieldOfStudy: 'Molecular Biology',
    bio: 'Researcher focused on genetic analysis techniques.'
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    role: 'lab_admin',
    institution: 'MIT',
    position: 'Laboratory Manager',
    fieldOfStudy: 'Biomedical Engineering',
    bio: 'Manages advanced laboratory equipment and resources.'
  }
];

/**
 * Get the current authenticated user
 */
exports.getCurrentUser = (req, res) => {
  try {
    // In a real app, we would fetch the user from the database based on the authenticated user ID
    // For demo purposes, we'll just return the first user
    const user = users.find(u => u.id === req.user.id) || users[0];
    
    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
};

/**
 * Update the current user's profile
 */
exports.updateProfile = (req, res) => {
  try {
    const { firstName, lastName, institution, position, fieldOfStudy, bio } = req.body;
    
    // In a real app, we would update the user in the database
    // For demo purposes, we'll just return the updated user data
    
    const updatedUser = {
      id: req.user.id,
      firstName: firstName || req.user.firstName,
      lastName: lastName || req.user.lastName,
      email: req.user.email, // Email cannot be changed
      role: req.user.role,   // Role cannot be changed
      institution: institution || req.user.institution,
      position: position || req.user.position,
      fieldOfStudy: fieldOfStudy || req.user.fieldOfStudy,
      bio: bio || req.user.bio
    };
    
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

/**
 * Get a user by ID (admin only)
 */
exports.getUserById = (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the user has admin privileges
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privileges required'
      });
    }
    
    // Find the user by ID
    const user = users.find(u => u.id === id);
    
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
    console.error('Error fetching user:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

/**
 * Get all users (admin only)
 */
exports.getAllUsers = (req, res) => {
  try {
    // Check if the user has admin privileges
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privileges required'
      });
    }
    
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

/**
 * Create a new user (admin only)
 */
exports.createUser = (req, res) => {
  try {
    // Check if the user has admin privileges
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privileges required'
      });
    }
    
    const { firstName, lastName, email, role, institution, position, fieldOfStudy, bio } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }
    
    // Create new user (in a real app, we would save to database)
    const newUser = {
      id: (users.length + 1).toString(),
      firstName,
      lastName,
      email,
      role,
      institution: institution || '',
      position: position || '',
      fieldOfStudy: fieldOfStudy || '',
      bio: bio || ''
    };
    
    // Add to users array (in a real app, we would save to database)
    users.push(newUser);
    
    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

/**
 * Delete a user (admin only)
 */
exports.deleteUser = (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the user has admin privileges
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privileges required'
      });
    }
    
    // Find the user by ID
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Remove the user (in a real app, we would delete from database)
    const deletedUser = users.splice(userIndex, 1)[0];
    
    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: deletedUser
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
}; 