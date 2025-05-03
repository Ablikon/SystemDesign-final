import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api/equipment`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Get all equipment with optional filtering
const getEquipment = async (filters = {}, token = null) => {
  try {
    // Convert filters object to URL parameters
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const queryString = params.toString();
    const url = queryString ? `?${queryString}` : '';
    
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const response = await api.get(url, { headers });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Get equipment by ID
const getEquipmentById = async (id, token = null) => {
  try {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await api.get(`/${id}`, { headers });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Create new equipment
const createEquipment = async (equipmentData, token) => {
  try {
    const response = await api.post('/', equipmentData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Update equipment
const updateEquipment = async (id, equipmentData, token) => {
  try {
    const response = await api.put(`/${id}`, equipmentData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Delete equipment
const deleteEquipment = async (id, token) => {
  try {
    const response = await api.delete(`/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Error handling helper
const handleError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return {
      message: error.response.data.message || 'An error occurred',
      status: error.response.status
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      message: 'No response from server. Please check your internet connection.',
      status: 0
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0
    };
  }
};

const equipmentService = {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment
};

export default equipmentService; 