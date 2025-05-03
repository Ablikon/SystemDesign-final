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
      const decoded = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  // Effect to load user data from token
  useEffect(() => {
    const initAuth = async () => {
      if (token && isValidToken(token)) {
        try {
          const userData = await authService.getCurrentUser(token);
          setCurrentUser(userData);
        } catch (error) {
          console.error('Failed to get user data:', error);
          logout();
        }
      } else if (token) {
        // If token exists but is invalid, remove it
        logout();
      }
      
      setLoading(false);
    };

    initAuth();
  }, [token]);

  // Login function
  const login = async (credentials) => {
    const response = await authService.login(credentials);
    const { token, user } = response;
    
    // Store token in localStorage
    localStorage.setItem('token', token);
    
    // Update state
    setToken(token);
    setCurrentUser(user);
    
    return user;
  };

  // Register function
  const register = async (userData) => {
    const response = await authService.register(userData);
    const { token, user } = response;
    
    // Store token in localStorage
    localStorage.setItem('token', token);
    
    // Update state
    setToken(token);
    setCurrentUser(user);
    
    return user;
  };

  // Logout function
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Reset state
    setToken(null);
    setCurrentUser(null);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    const updatedUser = await authService.updateUser(userData, token);
    setCurrentUser(updatedUser);
    return updatedUser;
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
    updateProfile
  };

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