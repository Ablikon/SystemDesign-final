import axios from 'axios';

const API_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 
});

const login = async (credentials) => {
  try {
    console.log('Sending login request to direct endpoint');
    

    const response = await api.post('/api/auth/login-direct', credentials);
    console.log('Login response:', response);
    
    if (response.status !== 200) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const normalizedResponse = normalizeAuthResponse(response.data);
    console.log('Normalized response:', normalizedResponse);
    
    return normalizedResponse;
  } catch (error) {
    console.error('Login error:', error);
    if (error.code === 'ECONNABORTED') {
      throw { message: 'Login request timed out. Please try again.' };
    }
    throw handleError(error);
  }
};

const normalizeAuthResponse = (response) => {

  if (response && response.success === true && response.data && 
      response.data.token && response.data.user) {
    console.log('Response already normalized');
    return response;
  }
  
  
  let normalizedResponse = {
    success: true,
    data: {}
  };
  

  if (response && response.token && response.user) {
    normalizedResponse.data = {
      token: response.token,
      user: response.user
    };
    return normalizedResponse;
  }
  

  if (response && (response.data || response.token || response.user)) {
    normalizedResponse.data = {
      token: response.token || (response.data && response.data.token) || '',
      user: response.user || (response.data && response.data.user) || {}
    };
    return normalizedResponse;
  }
  
 
  console.error('Could not normalize response:', response);
  return {
    success: false,
    message: 'Invalid response format from server',
    originalResponse: response
  };
};


const register = async (userData) => {
  try {

    const essentialData = {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName
    };
    
    console.log('Sending register request to direct endpoint');
    

    const response = await api.post('/api/auth/register-direct', essentialData);
    console.log('Register response:', response);
    
    if (response.status !== 201 && response.status !== 200) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    return response.data;
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 'ECONNABORTED') {
      throw { message: 'Registration request timed out. Please try again.' };
    }
    throw handleError(error);
  }
};


const getCurrentUser = async (token) => {
  try {
    if (!token) {
      throw new Error('No authentication token provided');
    }
    
    console.log('Fetching current user with token:', token ? 'Token exists' : 'No token');
    const response = await api.get('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Current user response:', response);
    
    if (!response.data || !response.data.success) {
      throw new Error('Failed to get user data');
    }
    
    return response.data.data || response.data.user || response.data;
  } catch (error) {
    console.error('Get current user error:', error);
    throw handleError(error);
  }
};

const updateUser = async (userData, token) => {
  const API_TIMEOUT = 8000; 
  let retryAttempt = 0;
  const MAX_RETRIES = 1;
  
  const attemptUpdate = async () => {
    try {
      if (!token) {
        throw new Error('No authentication token provided');
      }
      
      console.log('Updating user with token:', token ? 'Token exists' : 'No token');
      console.log('Update user data:', userData);
      
    
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      

      const response = await api.put('/api/auth/users/profile-direct', userData, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      });
      

      clearTimeout(timeoutId);
      
      console.log('Update user response:', response);
      
      if (response.status !== 200) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      

      let userDataResponse = response.data;
      if (response.data && response.data.data) {
        userDataResponse = response.data.data;
      }
      
      return userDataResponse;
    } catch (error) {
      console.error('Update user error:', error);
      

      if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
        if (retryAttempt < MAX_RETRIES) {
          console.log(`Request timed out, retrying (attempt ${retryAttempt + 1})...`);
          retryAttempt++;
          return attemptUpdate(); 
        }
        throw new Error('Profile update request timed out after retry. Please try again later.');
      }
      
      throw handleError(error);
    }
  };
  
  return attemptUpdate();
};


const checkSystemStatus = async () => {
  try {
    const response = await api.get('/api/system/status');
    return response.data;
  } catch (error) {
    console.error('System status check error:', error);
    throw handleError(error);
  }
};


const testConnection = async () => {
  try {
    const response = await api.get('/api/test');
    return response.data;
  } catch (error) {
    console.error('Test connection error:', error);
    throw handleError(error);
  }
};


const handleError = (error) => {
  if (error.response) {

    console.error('Response error:', error.response.data);
    return {
      message: error.response.data.message || 'Authentication failed. Please try again.',
      status: error.response.status
    };
  } else if (error.request) {
  
    console.error('Request error - no response received');
    return {
      message: 'No response from server. Please check your internet connection.',
      status: 0
    };
  } else {
  
    console.error('Request setup error:', error.message);
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0
    };
  }
};

const authService = {
  login,
  register,
  getCurrentUser,
  updateUser,
  checkSystemStatus,
  testConnection
};

export default authService; 