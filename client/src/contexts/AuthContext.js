import React, { createContext, useState, useContext, useEffect } from 'react';
import jwt_decode from 'jwt-decode';
import authService from '../services/authService';


const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);


  const isValidToken = (token) => {
    if (!token) return false;
    
    try {
     
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

        console.log('Token is invalid, logging out');
        logout();
      }
      
      setLoading(false);
    };

    initAuth();
  }, [token]);


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
      

      const responseData = response.data;
      
      if (!responseData || !responseData.token || !responseData.user) {
        console.error('Missing token or user in response data:', responseData);
        throw new Error('Invalid authentication data received');
      }

      localStorage.setItem('token', responseData.token);
      localStorage.setItem('user', JSON.stringify(responseData.user));
      console.log('Token stored in localStorage');
      

      setToken(responseData.token);
      setCurrentUser(responseData.user);
      console.log('User authenticated:', responseData.user.email);
      
      return response; 
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };


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
      

      const responseData = response.data;
      
      if (!responseData || !responseData.token || !responseData.user) {
        console.error('Missing token or user in response data:', responseData);
        throw new Error('Invalid authentication data received');
      }
      

      localStorage.setItem('token', responseData.token);
      localStorage.setItem('user', JSON.stringify(responseData.user));
      console.log('Token stored in localStorage');
      

      setToken(responseData.token);
      setCurrentUser(responseData.user);
      console.log('User registered and authenticated:', responseData.user.email);
      
      return response; 
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out');

    localStorage.removeItem('token');
    

    setToken(null);
    setCurrentUser(null);
  };


  const updateUserProfile = async (userData) => {
    console.log('Mock updating profile:', userData);
    try {

      await new Promise(resolve => setTimeout(resolve, 1000));
      

      const updatedUser = {
        ...(currentUser || {}),
        ...userData,
        updatedAt: new Date().toISOString()
      };
      
      console.log('Mock profile updated:', updatedUser);
      
      setCurrentUser(updatedUser);
      

      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error('Failed to update profile: ' + (error.message || 'Unknown error'));
    }
  };


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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 