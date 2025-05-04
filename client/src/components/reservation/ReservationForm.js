import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  Grid,
  Paper,
  TextField,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useAuth } from '../../contexts/AuthContext';
import reservationService from '../../services/reservationService';

const ReservationForm = ({ equipmentId, equipmentName, onSuccess }) => {
  const navigate = useNavigate();
  const { token, currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    startTime: new Date(Date.now() + 60 * 60 * 1000), // Default: 1 hour from now
    endTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // Default: 3 hours from now
    purpose: '',
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle date time picker changes
  const handleDateChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Form validation
  const validateForm = () => {
    if (!formData.startTime || !formData.endTime) {
      setError('Start and end times are required');
      return false;
    }
    
    if (formData.startTime >= formData.endTime) {
      setError('End time must be after start time');
      return false;
    }
    
    const now = new Date();
    if (formData.startTime < now) {
      setError('Start time must be in the future');
      return false;
    }
    
    if (!formData.purpose.trim()) {
      setError('Purpose is required');
      return false;
    }
    
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!token || !currentUser) {
      setError('You must be logged in to make a reservation');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Creating reservation with token:', token ? 'Token exists' : 'No token');
      console.log('Reservation data:', { ...formData, equipmentId });
      
      const reservationData = {
        ...formData,
        equipmentId
      };
      
      const response = await reservationService.createReservation(reservationData, token);
      console.log('Reservation created successfully:', response);
      
      setSuccess(true);
      setLoading(false);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      // Navigate to reservations page after a delay
      setTimeout(() => {
        navigate('/reservations');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating reservation:', error);
      setLoading(false);
      
      // Provide a more specific error message
      let errorMessage = 'Failed to create reservation. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.status === 401) {
        errorMessage = 'Authentication error. Please log in again.';
      } else if (error.status === 409) {
        errorMessage = 'This time slot conflicts with an existing reservation.';
      }
      
      setError(errorMessage);
      
      // If token is invalid, redirect to login
      if (error.status === 401) {
        setTimeout(() => {
          navigate('/login', { state: { from: `/equipment/${equipmentId}` } });
        }, 2000);
      }
    }
  };
  
  return (
    <Paper sx={{ p: 3, mt: 3 }} id="reservation-form">
      <Typography variant="h5" gutterBottom>
        Reserve Equipment
      </Typography>
      
      <Typography variant="subtitle1" sx={{ mb: 3 }}>
        {equipmentName}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Reservation created successfully! Redirecting to reservations page...
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Start Time"
                value={formData.startTime}
                onChange={(newValue) => handleDateChange('startTime', newValue)}
                renderInput={(params) => <TextField {...params} fullWidth required />}
                disablePast
                minutesStep={15}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="End Time"
                value={formData.endTime}
                onChange={(newValue) => handleDateChange('endTime', newValue)}
                renderInput={(params) => <TextField {...params} fullWidth required />}
                disablePast
                minutesStep={15}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="purpose"
              label="Purpose"
              value={formData.purpose}
              onChange={handleChange}
              fullWidth
              required
              placeholder="Brief description of your research purpose"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="notes"
              label="Additional Notes"
              value={formData.notes}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              placeholder="Any special requirements or additional information"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                sx={{ mr: 2 }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Submitting...
                  </>
                ) : (
                  'Reserve Now'
                )}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ReservationForm; 