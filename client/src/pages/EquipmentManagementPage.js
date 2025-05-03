import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import api from '../services/api';

export default function EquipmentManagementPage() {
  const [equipment, setEquipment] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [currentEquipment, setCurrentEquipment] = useState({
    id: '',
    name: '',
    description: '',
    category: '',
    location: '',
    status: 'Available',
    specifications: '',
    imageUrl: ''
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const categories = [
    'Microscopy',
    'Spectroscopy',
    'Chromatography',
    'PCR & Sequencing',
    'Imaging',
    'Mass Spectrometry',
    'Cell Culture',
    'Other'
  ];

  const statuses = [
    'Available',
    'In Use',
    'Maintenance',
    'Out of Order'
  ];

  useEffect(() => {
    fetchEquipment();
  }, []);

  useEffect(() => {
    // Filter equipment based on search term and category
    const filtered = equipment.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === '' || item.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
    
    setFilteredEquipment(filtered);
  }, [searchTerm, categoryFilter, equipment]);

  const fetchEquipment = async () => {
    try {
      // In a real app, this would be an API call
      const response = await api.get('/equipment');
      setEquipment(response.data);
      setFilteredEquipment(response.data);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      // Demo data
      const demoData = [
        {
          id: 1,
          name: 'Electron Microscope XL-30',
          description: 'High-resolution electron microscope for detailed imaging of biological samples',
          category: 'Microscopy',
          location: 'Imaging Center, Room 105',
          status: 'Available',
          specifications: 'Resolution: 0.5nm, Magnification: 5,000-500,000x',
          imageUrl: 'https://example.com/microscope.jpg'
        },
        {
          id: 2,
          name: 'Gas Chromatograph GC-2010',
          description: 'Advanced chromatography system for analytical chemistry research',
          category: 'Chromatography',
          location: 'Chemistry Lab, Room 203',
          status: 'In Use',
          specifications: 'Detector: FID, TCD, ECD; Column oven: 4°C to 450°C',
          imageUrl: 'https://example.com/chromatograph.jpg'
        },
        {
          id: 3,
          name: 'PCR Thermal Cycler',
          description: 'Standard thermal cycler for PCR applications',
          category: 'PCR & Sequencing',
          location: 'Genomics Lab, Room 302',
          status: 'Available',
          specifications: 'Temperature range: 4°C to 99°C, Capacity: 96 wells',
          imageUrl: 'https://example.com/thermal-cycler.jpg'
        },
        {
          id: 4,
          name: 'Confocal Microscope LSM 800',
          description: 'Advanced imaging system for fluorescence microscopy',
          category: 'Imaging',
          location: 'Imaging Center, Room 110',
          status: 'Maintenance',
          specifications: 'Resolution: XY: 120 nm, Z: 300 nm; Lasers: 405, 488, 561, 640 nm',
          imageUrl: 'https://example.com/confocal.jpg'
        }
      ];
      setEquipment(demoData);
      setFilteredEquipment(demoData);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setCategoryFilter(event.target.value);
  };

  const handleOpenDialog = (mode, equipment = null) => {
    setDialogMode(mode);
    if (equipment) {
      setCurrentEquipment(equipment);
    } else {
      // Reset form for adding new equipment
      setCurrentEquipment({
        id: '',
        name: '',
        description: '',
        category: '',
        location: '',
        status: 'Available',
        specifications: '',
        imageUrl: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCurrentEquipment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (dialogMode === 'add') {
        // In a real app, this would be an API post request
        const response = await api.post('/equipment', currentEquipment);
        // For demo, simulate adding with a generated ID
        const newEquipment = {
          ...currentEquipment,
          id: equipment.length + 1
        };
        setEquipment([...equipment, newEquipment]);
        setSnackbar({
          open: true,
          message: 'Equipment added successfully!',
          severity: 'success'
        });
      } else {
        // In a real app, this would be an API put request
        await api.put(`/equipment/${currentEquipment.id}`, currentEquipment);
        // For demo, update the equipment list
        const updatedEquipment = equipment.map(item => 
          item.id === currentEquipment.id ? currentEquipment : item
        );
        setEquipment(updatedEquipment);
        setSnackbar({
          open: true,
          message: 'Equipment updated successfully!',
          severity: 'success'
        });
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving equipment:", error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message || 'Failed to save equipment'}`,
        severity: 'error'
      });
    }
  };

  const handleDeleteClick = (equipment) => {
    setEquipmentToDelete(equipment);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      // In a real app, this would be an API delete request
      await api.delete(`/equipment/${equipmentToDelete.id}`);
      // For demo, filter out the deleted equipment
      const updatedEquipment = equipment.filter(item => item.id !== equipmentToDelete.id);
      setEquipment(updatedEquipment);
      setSnackbar({
        open: true,
        message: 'Equipment deleted successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error("Error deleting equipment:", error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message || 'Failed to delete equipment'}`,
        severity: 'error'
      });
    } finally {
      setDeleteConfirmOpen(false);
      setEquipmentToDelete(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'success';
      case 'In Use': return 'primary';
      case 'Maintenance': return 'warning';
      case 'Out of Order': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Equipment Management
        </Typography>
        
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                variant="outlined"
                label="Search Equipment"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  endAdornment: <SearchIcon />
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Filter by Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={handleCategoryChange}
                  label="Filter by Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog('add')}
              >
                Add Equipment
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell width="15%">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">Loading equipment data...</TableCell>
                </TableRow>
              ) : filteredEquipment.length > 0 ? (
                filteredEquipment.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>
                      <Chip 
                        label={item.status} 
                        color={getStatusColor(item.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenDialog('edit', item)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteClick(item)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">No equipment found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Equipment Form Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
          <DialogTitle>
            {dialogMode === 'add' ? 'Add New Equipment' : 'Edit Equipment'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="name"
                  label="Equipment Name"
                  fullWidth
                  value={currentEquipment.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={currentEquipment.category}
                    onChange={handleInputChange}
                    label="Category"
                    required
                  >
                    {categories.map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="location"
                  label="Location"
                  fullWidth
                  value={currentEquipment.location}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={currentEquipment.status}
                    onChange={handleInputChange}
                    label="Status"
                    required
                  >
                    {statuses.map(status => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  value={currentEquipment.description}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="specifications"
                  label="Technical Specifications"
                  fullWidth
                  multiline
                  rows={3}
                  value={currentEquipment.specifications}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="imageUrl"
                  label="Image URL"
                  fullWidth
                  value={currentEquipment.imageUrl}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={handleSubmit} color="primary" variant="contained">
              {dialogMode === 'add' ? 'Add Equipment' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this equipment: <strong>{equipmentToDelete?.name}</strong>?
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
} 