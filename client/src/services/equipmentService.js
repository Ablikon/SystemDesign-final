import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';


const api = axios.create({
  baseURL: `${API_URL}/api/equipment`,
  headers: {
    'Content-Type': 'application/json'
  }
});


const getEquipment = async (filters = {}, token = null) => {
  try {

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


const getEquipmentById = async (id, token = null) => {
  try {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await api.get(`/${id}`, { headers });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};


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


const handleError = (error) => {
  if (error.response) {

    return {
      message: error.response.data.message || 'An error occurred',
      status: error.response.status
    };
  } else if (error.request) {

    return {
      message: 'No response from server. Please check your internet connection.',
      status: 0
    };
  } else {

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