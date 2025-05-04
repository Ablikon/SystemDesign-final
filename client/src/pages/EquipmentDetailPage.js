import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Science as ScienceIcon,
  ListAlt as ListAltIcon,
  Bolt as BoltIcon
} from '@mui/icons-material';
import equipmentService from '../services/equipmentService';
import { useAuth } from '../contexts/AuthContext';
import ReservationForm from '../components/ReservationForm';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`equipment-tabpanel-${index}`}
      aria-labelledby={`equipment-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const EquipmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [reservationDialogOpen, setReservationDialogOpen] = useState(false);

  // Fetch equipment details
  useEffect(() => {
    const fetchEquipmentDetails = async () => {
      try {
        setLoading(true);
        const response = await equipmentService.getEquipmentById(id);
        console.log('Equipment details:', response.data);
        
        // Ensure equipment has a status, default to 'available' if none provided
        const equipmentData = {
          ...response.data,
          status: response.data.status || 'available'
        };
        
        setEquipment(equipmentData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching equipment details:', error);
        setError('Failed to load equipment details. Please try again later.');
        setLoading(false);
      }
    };

    fetchEquipmentDetails();
  }, [id]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle reservation button click
  const handleReserve = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/equipment/${id}` } });
    } else {
      setReservationDialogOpen(true);
    }
  };

  // Handle reservation success
  const handleReservationSuccess = (reservation) => {
    console.log('Reservation created:', reservation);
    // Show success message and navigate to reservations page
    navigate('/reservations', { 
      state: { 
        successMessage: `Reservation for ${equipment.name} has been submitted and is pending approval.` 
      } 
    });
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading equipment details...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!equipment) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="warning">Equipment not found.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Equipment Header */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box
            component="img"
            src={equipment.imageUrl || 'https://source.unsplash.com/random/800x600/?laboratory'}
            alt={equipment.name}
            sx={{
              width: '100%',
              height: 'auto',
              borderRadius: 2,
              boxShadow: 3
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1">
              {equipment.name}
            </Typography>
            <Chip
              label={equipment.status}
              color={equipment.status === 'available' ? 'success' : 'default'}
              sx={{ ml: 2 }}
            />
          </Box>
          
          <Typography variant="subtitle1" gutterBottom>
            {equipment.manufacturer} {equipment.model}
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            {equipment.description}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Location
              </Typography>
              <Typography variant="body1">
                {equipment.location}
              </Typography>
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Owner
              </Typography>
              <Typography variant="body1">
                {equipment.ownerName || 'University Lab'}
              </Typography>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<CalendarIcon />}
              onClick={handleReserve}
              sx={{ mr: 2 }}
            >
              Reserve Equipment
            </Button>
            <Button
              variant="outlined"
              startIcon={<ScienceIcon />}
              sx={{ mr: 2 }}
            >
              View Protocols
            </Button>
          </Box>
        </Grid>
      </Grid>
      
      {/* Tabs Section */}
      <Box sx={{ mt: 6 }}>
        <Paper sx={{ borderRadius: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab icon={<ListAltIcon />} label="Specifications" />
            <Tab icon={<BoltIcon />} label="Capabilities" />
            <Tab icon={<CalendarIcon />} label="Availability" />
          </Tabs>
          
          {/* Specifications Tab */}
          <TabPanel value={tabValue} index={0}>
            <TableContainer>
              <Table>
                <TableBody>
                  {equipment.specifications && Object.entries(equipment.specifications).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '30%' }}>
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </TableCell>
                      <TableCell>
                        {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!equipment.specifications || Object.keys(equipment.specifications).length === 0) && (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        No specifications available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
          
          {/* Capabilities Tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="body1">
              {equipment.capabilities || 'No capabilities information available.'}
            </Typography>
          </TabPanel>
          
          {/* Availability Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="body1">
              Current Status: <Chip 
                label={equipment.status} 
                color={equipment.status === 'available' ? 'success' : 'default'} 
              />
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">
                {equipment.availabilityNotes || 'No additional availability information.'}
              </Typography>
            </Box>
          </TabPanel>
        </Paper>
      </Box>
      
      {/* Reservation Form Dialog */}
      <ReservationForm
        equipment={equipment}
        open={reservationDialogOpen}
        onClose={() => setReservationDialogOpen(false)}
        onSuccess={handleReservationSuccess}
      />
    </Container>
  );
};

export default EquipmentDetailPage; 