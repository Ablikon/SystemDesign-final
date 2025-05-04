import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: `${API_URL}/api/reservations`,
  headers: {
    'Content-Type': 'application/json'
  }
});

const getReservations = async (filters = {}, token) => {
  try {
    if (!token) {
      throw new Error('No authentication token provided');
    }
    
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const queryString = params.toString();
    const url = queryString ? `?${queryString}` : '';
    
    console.log(`Fetching reservations with filters: ${queryString || 'none'}`);
    
    try {

      console.log('Trying direct endpoint for reservations');
      const directResponse = await axios.get(`${API_URL}/api/reservations-direct${url}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Direct reservations response:', directResponse);
      return directResponse.data;
    } catch (directError) {
      console.warn('Direct endpoint failed, falling back to standard endpoint:', directError.message);
      
      const response = await api.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Standard reservations response:', response);
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching reservations:', error);
    throw handleError(error);
  }
};

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

const createReservation = async (reservationData, token, retryCount = 0) => {
  try {
    if (!token) {
      throw new Error('No authentication token provided');
    }
    
    console.log('Creating reservation with data:', reservationData);
    console.log('Using token:', token ? 'Token exists' : 'No token');
    

    try {
      console.log('Trying direct endpoint for reservation creation');
      const directResponse = await axios.post(`${API_URL}/api/reservations-direct`, reservationData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': localStorage.getItem('userId')
        },
        timeout: 5000
      });
      
      console.log('Direct reservation creation response:', directResponse);
      return directResponse.data;
    } catch (directError) {
      console.warn('Direct endpoint failed, falling back to standard endpoint:', directError.message);
      
      const response = await api.post('/', reservationData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': localStorage.getItem('userId')
        },
        timeout: 10000
      });
      
      console.log('Create reservation response:', response);
      
      if (response.data && !response.data.data && response.status === 201) {
        return {
          data: response.data
        };
      }
      
      return response.data;
    }
  } catch (error) {
    console.error('Error creating reservation:', error);
    
    if (retryCount < 2 && (error.code === 'ECONNABORTED' || !error.response || error.response.status >= 500)) {
      console.log(`Retrying reservation creation (attempt ${retryCount + 1})...`);

      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return createReservation(reservationData, token, retryCount + 1);
    }
    

    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. The server may be experiencing issues. Please try again later.');
    }
    
    if (error.response && error.response.status === 504) {
      throw new Error('Gateway timeout. Please try again later.');
    }
    
    throw handleError(error);
  }
};

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

const cancelReservation = async (id, token) => {
  try {
    if (!token) {
      throw new Error('No authentication token provided');
    }
    
    console.log(`Canceling reservation ${id}`);
    
    try {
      console.log('Trying direct endpoint for canceling reservation');
      const directResponse = await axios.delete(`${API_URL}/api/reservations-direct/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Direct cancel response:', directResponse);
      return directResponse.data;
    } catch (directError) {
      console.warn('Direct endpoint failed, falling back to standard endpoint:', directError.message);
      
      const response = await api.delete(`/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Cancel reservation response:', response);
      return response.data;
    }
  } catch (error) {
    console.error(`Error canceling reservation ${id}:`, error);
    throw handleError(error);
  }
};


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


const startUsage = async (id, token) => {
  try {
    if (!token) {
      throw new Error('No authentication token provided');
    }
    
    console.log(`Starting usage for reservation ${id}`);
    

    try {
      console.log('Trying direct endpoint for starting usage');
      const directResponse = await axios.post(`${API_URL}/api/reservations-direct/${id}/start`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Direct start usage response:', directResponse);
      return directResponse.data;
    } catch (directError) {
      console.warn('Direct endpoint failed, falling back to standard endpoint:', directError.message);
      

      const response = await api.post(`/${id}/start`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Start usage response:', response);
      return response.data;
    }
  } catch (error) {
    console.error(`Error starting usage for reservation ${id}:`, error);
    throw handleError(error);
  }
};

const endUsage = async (id, usageData, token) => {
  try {
    if (!token) {
      throw new Error('No authentication token provided');
    }
    
    console.log(`Ending usage for reservation ${id} with data:`, usageData);
    
    try {
      console.log('Trying direct endpoint for ending usage');
      const directResponse = await axios.post(`${API_URL}/api/reservations-direct/${id}/end`, usageData || {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Direct end usage response:', directResponse);
      return directResponse.data;
    } catch (directError) {
      console.warn('Direct endpoint failed, falling back to standard endpoint:', directError.message);
      
      const response = await api.post(`/${id}/end`, usageData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('End usage response:', response);
      return response.data;
    }
  } catch (error) {
    console.error(`Error ending usage for reservation ${id}:`, error);
    throw handleError(error);
  }
};


const handleError = (error) => {
  if (error.response) {

    console.error('Response error:', error.response.data);
    return {
      message: error.response.data.message || 'An error occurred with the reservation service',
      status: error.response.status
    };
  } else if (error.request) {

    console.error('Request error - no response received');
    

    if (!navigator.onLine) {
      return {
        message: 'You are offline. Please check your internet connection.',
        status: 0
      };
    }
    
    if (error.message && error.message.includes('NetworkError')) {
      return {
        message: 'Network error: This might be due to CORS restrictions or service unavailability.',
        status: 0
      };
    }
    
    return {
      message: 'The reservation service is currently unavailable. Please try again later.',
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