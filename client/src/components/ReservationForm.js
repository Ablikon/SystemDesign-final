import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../contexts/AuthContext';
import reservationService from '../services/reservationService';

const ReservationForm = ({ 
  equipment, 
  open, 
  onClose, 
  onSuccess 
}) => {
  const { token } = useAuth();
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!startTime || !endTime) {
      setError('Please select start and end times');
      return;
    }
    
    if (startTime >= endTime) {
      setError('End time must be after start time');
      return;
    }
    
    if (!purpose.trim()) {
      setError('Please enter a purpose for the reservation');
      return;
    }
    
    try {
      setLoading(true);
      
      const reservationData = {
        equipmentId: equipment.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        purpose,
        notes
      };
      
      console.log('Sending reservation request with data:', reservationData);
      
      // Add a timeout to avoid infinite waiting
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out')), 15000)
      );
      
      // Race between the actual request and the timeout
      const response = await Promise.race([
        reservationService.createReservation(reservationData, token),
        timeoutPromise
      ]);
      
      console.log('Reservation creation response:', response);
      
      setLoading(false);
      
      // Mock success if needed for testing (comment out in production)
      // Uncomment the following line to force success even if API fails
      // return onSuccess && onSuccess({ id: 'mock-id', ...reservationData }) && onClose();
      
      // Call the success callback with response data
      if (onSuccess) {
        const reservationResult = response.data || response;
        onSuccess(reservationResult);
      }
      
      // Close the dialog
      onClose();
    } catch (error) {
      console.error('Reservation creation error:', error);
      setLoading(false);
      
      // Handle specific error cases
      if (error.message === 'Request timed out') {
        setError('The request took too long to complete. Your reservation may have been created but we couldn\'t confirm it.');
      } else if (error.message && error.message.includes('Network Error')) {
        setError('A network error occurred. Please check your connection and try again.');
      } else {
        setError(error.message || 'Failed to create reservation. Please try again.');
      }
    }
  };
  
  const handleCancel = () => {
    // Reset form
    setStartTime(null);
    setEndTime(null);
    setPurpose('');
    setNotes('');
    setError('');
    
    // Close dialog
    onClose();
  };
  
  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Reserve {equipment?.name}</DialogTitle>
      
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Please select a time slot and provide details for your reservation.
        </DialogContentText>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ mb: 2 }}>
            <DateTimePicker
              label="Start Time"
              value={startTime}
              onChange={setStartTime}
              renderInput={(params) => <TextField {...params} fullWidth required />}
              minDateTime={new Date()}
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <DateTimePicker
              label="End Time"
              value={endTime}
              onChange={setEndTime}
              renderInput={(params) => <TextField {...params} fullWidth required />}
              minDateTime={startTime || new Date()}
            />
          </Box>
        </LocalizationProvider>
        
        <TextField
          margin="dense"
          id="purpose"
          label="Purpose"
          type="text"
          fullWidth
          required
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          sx={{ mb: 2 }}
        />
        
        <TextField
          margin="dense"
          id="notes"
          label="Additional Notes"
          multiline
          rows={4}
          fullWidth
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleCancel} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Reserve'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReservationForm; 