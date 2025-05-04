import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Avatar,
  Button,
  TextField,
  Link,
  Grid,
  Box,
  Typography,
  Container,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { LockOutlined as LockOutlinedIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    email: 'test@example.com',
    password: 'password123'
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState('');
  const [requestTimeout, setRequestTimeout] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [systemStatus, setSystemStatus] = useState(null);
  const [testResult, setTestResult] = useState(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (requestTimeout) {
        clearTimeout(requestTimeout);
      }
    };
  }, [requestTimeout]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setLoginStatus('');
    setErrorMessage('');
    
    // Clear any existing timeout
    if (requestTimeout) {
      clearTimeout(requestTimeout);
    }
    
    // Set a new timeout for 10 seconds
    const timeout = setTimeout(() => {
      setLoading(false);
      setLoginStatus('timeout');
      setErrorMessage('Login request timed out. Please try again.');
    }, 10000);
    
    setRequestTimeout(timeout);
    
    try {
      console.log(`Sending login request for email: ${formData.email}`);
      const response = await login(formData);
      
      // Clear timeout as we got a response
      clearTimeout(timeout);
      
      if (response && response.data && response.data.token) {
        // Login successful
        setLoginStatus('success');
        
        // Store auth token and user data in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        // Invalid response format
        setLoginStatus('error');
        setErrorMessage('Invalid server response. Please try again.');
      }
    } catch (error) {
      // Clear timeout as we got an error
      clearTimeout(timeout);
      
      console.error('Login error:', error);
      setLoginStatus('error');
      setErrorMessage(error.message || 'An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
      setRequestTimeout(null);
    }
  };

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User already authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Функция для проверки соединения с API
  const checkConnection = async () => {
    try {
      setTestResult(null);
      const result = await authService.testConnection();
      setTestResult({
        success: true,
        message: `API доступен: ${result.message}`,
        data: result
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `Ошибка подключения к API: ${error.message}`,
        error
      });
    }
  };

  // Функция для проверки статуса всех сервисов
  const checkSystemStatus = async () => {
    try {
      setSystemStatus(null);
      const result = await authService.checkSystemStatus();
      setSystemStatus({
        success: true,
        message: 'Статус системы получен',
        data: result
      });
    } catch (error) {
      setSystemStatus({
        success: false,
        message: `Ошибка получения статуса системы: ${error.message}`,
        error
      });
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, borderRadius: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          
          {loginStatus && !error && (
            <Alert severity="info" sx={{ mt: 2, width: '100%' }}>
              {loginStatus}
            </Alert>
          )}
          
          {errorMessage && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              error={!!error && !formData.email}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              error={!!error && !formData.password}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            <Grid container>
              <Grid item xs>
                <Link component={RouterLink} to="#" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link component={RouterLink} to="/register" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
          
          {/* Добавляем кнопки для тестирования */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={checkConnection}
              sx={{ mr: 1 }}
            >
              Проверить API
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={checkSystemStatus}
            >
              Статус системы
            </Button>
          </Box>
          
          {/* Результаты проверки API */}
          {testResult && (
            <Alert severity={testResult.success ? "success" : "error"} sx={{ mt: 2 }}>
              {testResult.message}
            </Alert>
          )}
          
          {/* Результаты проверки статуса системы */}
          {systemStatus && (
            <Box sx={{ mt: 2 }}>
              <Alert severity={systemStatus.success ? "info" : "error"}>
                {systemStatus.message}
              </Alert>
              {systemStatus.success && systemStatus.data && (
                <Box sx={{ mt: 1, maxHeight: '200px', overflow: 'auto' }}>
                  <Typography variant="h6">Статус сервисов:</Typography>
                  {Object.entries(systemStatus.data.services).map(([name, info]) => (
                    <Box key={name} sx={{ mt: 1 }}>
                      <Typography variant="subtitle2">
                        {name}: {info.status === 'UP' ? '✅' : '❌'} {info.status}
                      </Typography>
                      {info.error && (
                        <Typography variant="caption" color="error">
                          Ошибка: {info.error}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Paper>
      
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          For testing, you can use:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Email: test@example.com | Password: password123
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginPage; 