import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api/auth`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Register a new user
const register = async (userData) => {
  try {
    const response = await api.post('/register', userData);
    return response.data.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Login user
const login = async (credentials) => {
  try {
    const response = await api.post('/login', credentials);
    return response.data.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Get current user
const getCurrentUser = async (token) => {
  try {
    const response = await api.get('/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Update user profile
const updateUser = async (userData, token) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/users/${userData.id}`,
      userData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data.data;
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

const authService = {
  register,
  login,
  getCurrentUser,
  updateUser
};

export default authService; 