import axios from 'axios';

// API_URL должен указывать на хост Docker-контейнера
const API_URL = 'http://localhost:8080';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // увеличим таймаут до 30 секунд
});

// Login user
const login = async (credentials) => {
  try {
    console.log('Sending login request to direct endpoint');
    
    // Используем прямой эндпоинт вместо прокси
    const response = await api.post('/api/auth/login-direct', credentials);
    console.log('Login response:', response);
    
    if (response.status !== 200) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    if (error.code === 'ECONNABORTED') {
      throw { message: 'Login request timed out. Please try again.' };
    }
    throw handleError(error);
  }
};

// Функция для нормализации ответа от сервера аутентификации
const normalizeAuthResponse = (response) => {
  // Проверяем, содержит ли ответ уже нормализованную структуру
  if (response && response.success === true && response.data && 
      response.data.token && response.data.user) {
    console.log('Response already normalized');
    return response;
  }
  
  // Если ответ не содержит success или data, преобразуем его
  let normalizedResponse = {
    success: true,
    data: {}
  };
  
  // Случай 1: Ответ имеет структуру { token, user }
  if (response && response.token && response.user) {
    normalizedResponse.data = {
      token: response.token,
      user: response.user
    };
    return normalizedResponse;
  }
  
  // Случай 2: Ответ является объектом data без обертки success
  if (response && (response.data || response.token || response.user)) {
    normalizedResponse.data = {
      token: response.token || (response.data && response.data.token) || '',
      user: response.user || (response.data && response.data.user) || {}
    };
    return normalizedResponse;
  }
  
  // Если не удалось нормализовать, возвращаем исходный ответ
  console.error('Could not normalize response:', response);
  return {
    success: false,
    message: 'Invalid response format from server',
    originalResponse: response
  };
};

// Register user
const register = async (userData) => {
  try {
    // Подготавливаем только необходимые данные
    const essentialData = {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName
    };
    
    console.log('Sending register request to direct endpoint');
    
    // Используем прямой эндпоинт вместо прокси
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

// Get current user
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

// Update user profile
const updateUser = async (userData, token) => {
  try {
    if (!token) {
      throw new Error('No authentication token provided');
    }
    
    console.log('Updating user with token:', token ? 'Token exists' : 'No token');
    const response = await api.put('/api/auth/users/profile', userData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Update user response:', response);
    
    return response.data;
  } catch (error) {
    console.error('Update user error:', error);
    throw handleError(error);
  }
};

// Добавляем функцию для проверки статуса системы
const checkSystemStatus = async () => {
  try {
    const response = await api.get('/api/system/status');
    return response.data;
  } catch (error) {
    console.error('System status check error:', error);
    throw handleError(error);
  }
};

// Добавляем функцию для тестового подключения
const testConnection = async () => {
  try {
    const response = await api.get('/api/test');
    return response.data;
  } catch (error) {
    console.error('Test connection error:', error);
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
      message: error.response.data.message || 'Authentication failed. Please try again.',
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

const authService = {
  login,
  register,
  getCurrentUser,
  updateUser,
  checkSystemStatus,
  testConnection
};

export default authService; 