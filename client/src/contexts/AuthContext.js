import React, { createContext, useState, useContext, useEffect } from 'react';
import jwt_decode from 'jwt-decode';
import authService from '../services/authService';

// Create authentication context
const AuthContext = createContext(null);

// AuthProvider component to wrap the application
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Check if token is valid and not expired
  const isValidToken = (token) => {
    if (!token) return false;
    
    try {
      // For our mock tokens that don't have an expiration, just consider them valid
      if (token.startsWith('mock_token_')) {
        console.log('Mock token detected, considering valid');
        return true;
      }
      
      const decoded = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  };

  // Effect to load user data from token
  useEffect(() => {
    const initAuth = async () => {
      console.log('Initializing auth with token:', token);
      if (token && isValidToken(token)) {
        try {
          console.log('Token is valid, fetching user data');
          const userData = await authService.getCurrentUser(token);
          console.log('Received user data:', userData);
          setCurrentUser(userData);
        } catch (error) {
          console.error('Failed to get user data:', error);
          logout();
        }
      } else if (token) {
        // If token exists but is invalid, remove it
        console.log('Token is invalid, logging out');
        logout();
      }
      
      setLoading(false);
    };

    initAuth();
  }, [token]);

  // Login function
  const login = async (credentials) => {
    console.log('Attempting login with credentials:', credentials.email);
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      console.log('Login response:', response);
      
      if (!response || response.success === false) {
        console.error('Invalid login response:', response);
        throw new Error('Invalid response from server');
      }
      
      // Handle the correct response structure
      // The structure is { success: true, data: { user: {...}, token: '...' } }
      const responseData = response.data;
      
      if (!responseData || !responseData.token || !responseData.user) {
        console.error('Missing token or user in response data:', responseData);
        throw new Error('Invalid authentication data received');
      }
      
      // Store token in localStorage
      localStorage.setItem('token', responseData.token);
      localStorage.setItem('user', JSON.stringify(responseData.user));
      console.log('Token stored in localStorage');
      
      // Update state
      setToken(responseData.token);
      setCurrentUser(responseData.user);
      console.log('User authenticated:', responseData.user.email);
      
      return response; // Return the full response
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    console.log('Attempting registration with email:', userData.email);
    try {
      setLoading(true);
      const response = await authService.register(userData);
      console.log('Registration response:', response);
      
      if (!response || response.success === false) {
        console.error('Invalid registration response:', response);
        throw new Error(response?.message || 'Invalid response from server');
      }
      
      // Handle the correct response structure
      // The structure is { success: true, data: { user: {...}, token: '...' } }
      const responseData = response.data;
      
      if (!responseData || !responseData.token || !responseData.user) {
        console.error('Missing token or user in response data:', responseData);
        throw new Error('Invalid authentication data received');
      }
      
      // Store token in localStorage
      localStorage.setItem('token', responseData.token);
      localStorage.setItem('user', JSON.stringify(responseData.user));
      console.log('Token stored in localStorage');
      
      // Update state
      setToken(responseData.token);
      setCurrentUser(responseData.user);
      console.log('User registered and authenticated:', responseData.user.email);
      
      return response; // Return the full response
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    console.log('Logging out');
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Reset state
    setToken(null);
    setCurrentUser(null);
  };

  // Update user profile
  const updateUserProfile = async (userData) => {
    console.log('Mock updating profile:', userData);
    try {
      // Create a mock delay to simulate network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a mock updated user by merging the current user with the new data
      const updatedUser = {
        ...(currentUser || {}),
        ...userData,
        updatedAt: new Date().toISOString()
      };
      
      console.log('Mock profile updated:', updatedUser);
      
      // Update the current user with the mock data
      setCurrentUser(updatedUser);
      
      // Save updated user to localStorage
      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error('Failed to update profile: ' + (error.message || 'Unknown error'));
    }
  };

  // Context value
  const value = {
    currentUser,
    token,
    isAuthenticated: !!currentUser,
    loading,
    login,
    register,
    logout,
    updateUserProfile
  };

  console.log('Auth context value:', { 
    currentUser: currentUser ? { ...currentUser, token: '***' } : null,
    isAuthenticated: !!currentUser,
    loading
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 