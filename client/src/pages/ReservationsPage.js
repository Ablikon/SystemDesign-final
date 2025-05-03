import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Add as AddIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import reservationService from '../services/reservationService';
import equipmentService from '../services/equipmentService';

// Status chip component
const StatusChip = ({ status }) => {
  const getChipProps = () => {
    switch (status) {
      case 'approved':
        return { color: 'success', icon: <CheckCircleIcon fontSize="small" /> };
      case 'pending':
        return { color: 'warning', icon: <AccessTimeIcon fontSize="small" /> };
      case 'rejected':
        return { color: 'error', icon: <CancelIcon fontSize="small" /> };
      case 'canceled':
        return { color: 'default', icon: <DeleteIcon fontSize="small" /> };
      case 'completed':
        return { color: 'info', icon: <CheckCircleIcon fontSize="small" /> };
      default:
        return { color: 'default', icon: null };
    }
  };

  const { color, icon } = getChipProps();

  return (
    <Chip
      size="small"
      icon={icon}
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      color={color}
    />
  );
};

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reservations-tabpanel-${index}`}
      aria-labelledby={`reservations-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ReservationsPage = () => {
  const { currentUser, token } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [equipmentDetails, setEquipmentDetails] = useState({});

  // Check if user is a lab manager
  const isLabManager = currentUser?.Roles?.some(role => role.name === 'Laboratory Manager');

  // Fetch reservations
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        
        // Get user's reservations
        const userReservationsResponse = await reservationService.getReservations(
          { userId: currentUser.id },
          token
        );
        
        setReservations(userReservationsResponse.data);
        
        // If lab manager, get pending approvals
        if (isLabManager) {
          const pendingApprovalsResponse = await reservationService.getReservations(
            { status: 'pending' },
            token
          );
          
          setPendingApprovals(pendingApprovalsResponse.data);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reservations:', error);
        setError('Failed to load reservations. Please try again.');
        setLoading(false);
      }
    };

    if (currentUser && token) {
      fetchReservations();
    }
  }, [currentUser, token, isLabManager]);

  // Fetch equipment details for each reservation
  useEffect(() => {
    const fetchEquipmentDetails = async () => {
      const equipmentIds = [...reservations, ...pendingApprovals]
        .map(res => res.equipmentId)
        .filter((id, index, self) => self.indexOf(id) === index); // Unique IDs
      
      const details = {};
      
      await Promise.all(
        equipmentIds.map(async (id) => {
          try {
            const response = await equipmentService.getEquipmentById(id, token);
            details[id] = response.data;
          } catch (error) {
            console.error(`Error fetching equipment details for ${id}:`, error);
            details[id] = { name: 'Unknown Equipment', model: '', manufacturer: '' };
          }
        })
      );
      
      setEquipmentDetails(details);
    };

    if (reservations.length > 0 || pendingApprovals.length > 0) {
      fetchEquipmentDetails();
    }
  }, [reservations, pendingApprovals, token]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle reservation cancellation
  const handleCancelReservation = async () => {
    if (!selectedReservation) return;
    
    try {
      await reservationService.cancelReservation(selectedReservation.id, token);
      
      // Update reservations list
      setReservations(prevReservations => 
        prevReservations.map(res => 
          res.id === selectedReservation.id 
            ? { ...res, status: 'canceled' } 
            : res
        )
      );
      
      setCancelDialogOpen(false);
      setSelectedReservation(null);
    } catch (error) {
      console.error('Error canceling reservation:', error);
      setError('Failed to cancel reservation. Please try again.');
    }
  };

  // Handle reservation approval/rejection
  const handleApproveReservation = async (id, isApproved) => {
    try {
      await reservationService.approveReservation(
        id, 
        { 
          status: isApproved ? 'approved' : 'rejected',
          comments: isApproved ? 'Reservation approved' : 'Reservation rejected'
        }, 
        token
      );
      
      // Update pending approvals list
      setPendingApprovals(prevApprovals => 
        prevApprovals.filter(approval => approval.id !== id)
      );
    } catch (error) {
      console.error('Error approving/rejecting reservation:', error);
      setError('Failed to process approval. Please try again.');
    }
  };

  // Handle usage start
  const handleStartUsage = async (id) => {
    try {
      await reservationService.startUsage(id, token);
      
      // Update reservations list
      setReservations(prevReservations => 
        prevReservations.map(res => 
          res.id === id && res.usageRecord
            ? { 
                ...res, 
                usageRecord: { 
                  ...res.usageRecord, 
                  status: 'in_progress',
                  actualStartTime: new Date()
                } 
              } 
            : res
        )
      );
    } catch (error) {
      console.error('Error starting usage:', error);
      setError('Failed to start usage. Please try again.');
    }
  };

  // Handle usage end
  const handleEndUsage = async (id) => {
    try {
      await reservationService.endUsage(id, { dataVolume: 0 }, token);
      
      // Update reservations list
      setReservations(prevReservations => 
        prevReservations.map(res => 
          res.id === id
            ? { 
                ...res, 
                status: 'completed',
                usageRecord: { 
                  ...res.usageRecord, 
                  status: 'completed',
                  actualEndTime: new Date()
                } 
              } 
            : res
        )
      );
    } catch (error) {
      console.error('Error ending usage:', error);
      setError('Failed to end usage. Please try again.');
    }
  };

  // Format date and time
  const formatDateTime = (dateString) => {
    try {
      return format(new Date(dateString), 'PPP p');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Render reservation card
  const renderReservationCard = (reservation, isPendingApproval = false) => {
    const equipment = equipmentDetails[reservation.equipmentId] || {};
    const canCancel = ['pending', 'approved'].includes(reservation.status);
    const canStart = reservation.status === 'approved' && 
                    (!reservation.usageRecord || reservation.usageRecord.status === 'not_started');
    const canEnd = reservation.usageRecord?.status === 'in_progress';
    
    return (
      <Paper
        key={reservation.id}
        sx={{ 
          p: 2, 
          mb: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <Typography variant="h6" gutterBottom>
              {equipment.name || 'Loading equipment details...'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {equipment.manufacturer} {equipment.model}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                <strong>Status:</strong>
              </Typography>
              <StatusChip status={reservation.status} />
            </Box>
            <Typography variant="body2" paragraph>
              <strong>Purpose:</strong> {reservation.purpose}
            </Typography>
            <Typography variant="body2">
              <strong>Scheduled Time:</strong> {formatDateTime(reservation.startTime)} to {formatDateTime(reservation.endTime)}
            </Typography>
            {reservation.usageRecord?.actualStartTime && (
              <Typography variant="body2">
                <strong>Actual Start:</strong> {formatDateTime(reservation.usageRecord.actualStartTime)}
              </Typography>
            )}
            {reservation.usageRecord?.actualEndTime && (
              <Typography variant="body2">
                <strong>Actual End:</strong> {formatDateTime(reservation.usageRecord.actualEndTime)}
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            {isPendingApproval ? (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handleApproveReservation(reservation.id, true)}
                  sx={{ mb: 1, width: '100%' }}
                >
                  Approve
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => handleApproveReservation(reservation.id, false)}
                  sx={{ width: '100%' }}
                >
                  Reject
                </Button>
              </>
            ) : (
              <>
                {canStart && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PlayArrowIcon />}
                    onClick={() => handleStartUsage(reservation.id)}
                    sx={{ mb: 1, width: '100%' }}
                  >
                    Start Usage
                  </Button>
                )}
                
                {canEnd && (
                  <Button
                    variant="contained"
                    color="info"
                    startIcon={<StopIcon />}
                    onClick={() => handleEndUsage(reservation.id)}
                    sx={{ mb: 1, width: '100%' }}
                  >
                    End Usage
                  </Button>
                )}
                
                {canCancel && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                      setSelectedReservation(reservation);
                      setCancelDialogOpen(true);
                    }}
                    sx={{ width: '100%' }}
                  >
                    Cancel
                  </Button>
                )}
              </>
            )}
          </Grid>
        </Grid>
      </Paper>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Reservations
        </Typography>
        
        <Button
          component={RouterLink}
          to="/equipment"
          variant="contained"
          startIcon={<AddIcon />}
        >
          New Reservation
        </Button>
      </Box>
      
      {error && (
        <Paper sx={{ p: 2, mb: 4, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}
      
      <Paper sx={{ width: '100%', mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            aria-label="reservation tabs"
          >
            <Tab label="My Reservations" />
            {isLabManager && <Tab label="Pending Approvals" />}
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Typography>Loading reservations...</Typography>
          ) : reservations.length > 0 ? (
            reservations.map(reservation => renderReservationCard(reservation))
          ) : (
            <Typography align="center" sx={{ py: 4 }}>
              You don't have any reservations yet. Browse equipment to make a reservation.
            </Typography>
          )}
        </TabPanel>
        
        {isLabManager && (
          <TabPanel value={tabValue} index={1}>
            {loading ? (
              <Typography>Loading pending approvals...</Typography>
            ) : pendingApprovals.length > 0 ? (
              pendingApprovals.map(reservation => renderReservationCard(reservation, true))
            ) : (
              <Typography align="center" sx={{ py: 4 }}>
                No pending approvals at the moment.
              </Typography>
            )}
          </TabPanel>
        )}
      </Paper>
      
      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>Cancel Reservation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this reservation? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            No, Keep It
          </Button>
          <Button onClick={handleCancelReservation} color="error" autoFocus>
            Yes, Cancel Reservation
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReservationsPage; 