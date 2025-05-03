import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api/reservations`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Get all reservations with optional filtering
const getReservations = async (filters = {}, token) => {
  try {
    // Convert filters object to URL parameters
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const queryString = params.toString();
    const url = queryString ? `?${queryString}` : '';
    
    const response = await api.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Get reservation by ID
const getReservationById = async (id, token) => {
  try {
    const response = await api.get(`/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Create a new reservation
const createReservation = async (reservationData, token) => {
  try {
    const response = await api.post('/', reservationData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Update reservation
const updateReservation = async (id, reservationData, token) => {
  try {
    const response = await api.put(`/${id}`, reservationData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Cancel reservation
const cancelReservation = async (id, token) => {
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

// Approve or reject reservation (for lab managers)
const approveReservation = async (id, approvalData, token) => {
  try {
    const response = await api.put(`/${id}/approve`, approvalData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Start reservation usage
const startUsage = async (id, token) => {
  try {
    const response = await api.post(`/${id}/start`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// End reservation usage
const endUsage = async (id, usageData, token) => {
  try {
    const response = await api.post(`/${id}/end`, usageData, {
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

const reservationService = {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  cancelReservation,
  approveReservation,
  startUsage,
  endUsage
};

export default reservationService; 