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
    if (!token) {
      throw new Error('No authentication token provided');
    }
    
    // Convert filters object to URL parameters
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const queryString = params.toString();
    const url = queryString ? `?${queryString}` : '';
    
    console.log(`Fetching reservations with filters: ${queryString || 'none'}`);
    
    const response = await api.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Reservations response:', response);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching reservations:', error);
    throw handleError(error);
  }
};

// Get reservation by ID
const getReservationById = async (id, token) => {
  try {
    if (!token) {
      throw new Error('No authentication token provided');
    }
    
    console.log(`Fetching reservation with ID: ${id}`);
    
    const response = await api.get(`/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Reservation response:', response);
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching reservation ${id}:`, error);
    throw handleError(error);
  }
};

// Create a new reservation
const createReservation = async (reservationData, token) => {
  try {
    if (!token) {
      throw new Error('No authentication token provided');
    }
    
    console.log('Creating reservation with data:', reservationData);
    console.log('Using token:', token ? 'Token exists' : 'No token');
    
    const response = await api.post('/', reservationData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Create reservation response:', response);
    
    return response.data;
  } catch (error) {
    console.error('Error creating reservation:', error);
    throw handleError(error);
  }
};

// Update reservation
const updateReservation = async (id, reservationData, token) => {
  try {
    if (!token) {
      throw new Error('No authentication token provided');
    }
    
    console.log(`Updating reservation ${id} with data:`, reservationData);
    
    const response = await api.put(`/${id}`, reservationData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Update reservation response:', response);
    
    return response.data;
  } catch (error) {
    console.error(`Error updating reservation ${id}:`, error);
    throw handleError(error);
  }
};

// Cancel reservation
const cancelReservation = async (id, token) => {
  try {
    if (!token) {
      throw new Error('No authentication token provided');
    }
    
    console.log(`Canceling reservation ${id}`);
    
    const response = await api.delete(`/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Cancel reservation response:', response);
    
    return response.data;
  } catch (error) {
    console.error(`Error canceling reservation ${id}:`, error);
    throw handleError(error);
  }
};

// Approve or reject reservation (for lab managers)
const approveReservation = async (id, approvalData, token) => {
  try {
    if (!token) {
      throw new Error('No authentication token provided');
    }
    
    console.log(`Approving/rejecting reservation ${id} with data:`, approvalData);
    
    const response = await api.put(`/${id}/approve`, approvalData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Approve reservation response:', response);
    
    return response.data;
  } catch (error) {
    console.error(`Error approving/rejecting reservation ${id}:`, error);
    throw handleError(error);
  }
};

// Start reservation usage
const startUsage = async (id, token) => {
  try {
    if (!token) {
      throw new Error('No authentication token provided');
    }
    
    console.log(`Starting usage for reservation ${id}`);
    
    const response = await api.post(`/${id}/start`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Start usage response:', response);
    
    return response.data;
  } catch (error) {
    console.error(`Error starting usage for reservation ${id}:`, error);
    throw handleError(error);
  }
};

// End reservation usage
const endUsage = async (id, usageData, token) => {
  try {
    if (!token) {
      throw new Error('No authentication token provided');
    }
    
    console.log(`Ending usage for reservation ${id} with data:`, usageData);
    
    const response = await api.post(`/${id}/end`, usageData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('End usage response:', response);
    
    return response.data;
  } catch (error) {
    console.error(`Error ending usage for reservation ${id}:`, error);
    throw handleError(error);
  }
};

// Error handling helper
const handleError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Response error:', error.response.data);
    return {
      message: error.response.data.message || 'An error occurred with the reservation service',
      status: error.response.status
    };
  } else if (error.request) {
    // The request was made but no response was received
    console.error('Request error - no response received');
    return {
      message: 'No response from server. Please check your internet connection.',
      status: 0
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Request setup error:', error.message);
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