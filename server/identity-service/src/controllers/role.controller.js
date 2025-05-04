
const roles = [
  { id: 1, name: 'Researcher', description: 'Regular researcher' },
  { id: 2, name: 'Lab Admin', description: 'Laboratory administrator' },
  { id: 3, name: 'System Admin', description: 'System administrator' }
];


const userRoles = [
  { userId: 1, roleId: 1 },
  { userId: 2, roleId: 2 }
];

exports.getAllRoles = (req, res) => {
  try {

    if (req.user.role !== 'admin' && req.user.role !== 'lab_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privileges required'
      });
    }
    
    return res.status(200).json({
      success: true,
      count: roles.length,
      data: roles
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching roles',
      error: error.message
    });
  }
};


exports.createRole = (req, res) => {
  try {
  
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privileges required'
      });
    }
    
    const { name, description } = req.body;
    

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Role name is required'
      });
    }
    

    if (roles.some(r => r.name.toLowerCase() === name.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Role with this name already exists'
      });
    }
    

    const newRole = {
      id: roles.length + 1,
      name,
      description: description || ''
    };
    
  
    roles.push(newRole);
    
    return res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: newRole
    });
  } catch (error) {
    console.error('Error creating role:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating role',
      error: error.message
    });
  }
};

exports.assignRoleToUser = (req, res) => {
  try {

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privileges required'
      });
    }
    
    const { userId, roleId } = req.body;
    
    if (!userId || !roleId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Role ID are required'
      });
    }
    

    const role = roles.find(r => r.id === roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }
    
    if (userRoles.some(ur => ur.userId === userId && ur.roleId === roleId)) {
      return res.status(400).json({
        success: false,
        message: 'User already has this role'
      });
    }
    

    const assignment = { userId, roleId };
    userRoles.push(assignment);
    
    return res.status(200).json({
      success: true,
      message: 'Role assigned successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Error assigning role:', error);
    return res.status(500).json({
      success: false,
      message: 'Error assigning role',
      error: error.message
    });
  }
};

exports.revokeRoleFromUser = (req, res) => {
  try {

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privileges required'
      });
    }
    
    const { userId, roleId } = req.body;
    
    if (!userId || !roleId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Role ID are required'
      });
    }
    
    const assignmentIndex = userRoles.findIndex(
      ur => ur.userId === userId && ur.roleId === roleId
    );
    
    if (assignmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User does not have this role'
      });
    }
    
    const removedAssignment = userRoles.splice(assignmentIndex, 1)[0];
    
    return res.status(200).json({
      success: true,
      message: 'Role revoked successfully',
      data: removedAssignment
    });
  } catch (error) {
    console.error('Error revoking role:', error);
    return res.status(500).json({
      success: false,
      message: 'Error revoking role',
      error: error.message
    });
  }
}; 