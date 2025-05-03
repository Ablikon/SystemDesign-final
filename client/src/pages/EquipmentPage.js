import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  TextField,
  Typography,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Place as PlaceIcon
} from '@mui/icons-material';
import equipmentService from '../services/equipmentService';

const EquipmentPage = () => {
  // State for equipment data
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // State for filters
  const [filters, setFilters] = useState({
    name: '',
    category: '',
    location: '',
    status: 'available',
    page: 1,
    limit: 9
  });

  // Fetch equipment data
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        const response = await equipmentService.getEquipment({
          ...filters,
          page
        });
        
        setEquipment(response.data);
        setTotalPages(response.pagination.pages);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching equipment:', error);
        setError('Failed to load equipment. Please try again later.');
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [filters, page]);

  // Handle filter changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(1); // Reset to first page when filters change
  };

  // Handle search submit
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    // The useEffect will trigger the API call with updated filters
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Equipment Catalog
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSearchSubmit}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Search equipment"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
                placeholder="e.g., microscope, spectrometer"
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="microscopy">Microscopy</MenuItem>
                  <MenuItem value="spectroscopy">Spectroscopy</MenuItem>
                  <MenuItem value="chromatography">Chromatography</MenuItem>
                  <MenuItem value="robotics">Robotics</MenuItem>
                  <MenuItem value="computing">Computing</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Location</InputLabel>
                <Select
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  label="Location"
                >
                  <MenuItem value="">All Locations</MenuItem>
                  <MenuItem value="North America">North America</MenuItem>
                  <MenuItem value="Europe">Europe</MenuItem>
                  <MenuItem value="Asia">Asia</MenuItem>
                  <MenuItem value="Australia">Australia</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={2}>
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth
                startIcon={<FilterListIcon />}
              >
                Filter
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {/* Results section */}
      {loading ? (
        <Typography>Loading equipment...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>
              {equipment.length} result{equipment.length !== 1 ? 's' : ''} found
            </Typography>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Sort by</InputLabel>
              <Select
                value="newest"
                label="Sort by"
                size="small"
              >
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="availability">Availability</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Grid container spacing={3}>
            {equipment.length > 0 ? (
              equipment.map((item) => (
                <Grid item key={item.id} xs={12} sm={6} md={4}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)'
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={item.imageUrl || 'https://source.unsplash.com/random/800x600/?lab'}
                      alt={item.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography gutterBottom variant="h6" component="h2" noWrap>
                          {item.name}
                        </Typography>
                        <Chip 
                          label={item.status} 
                          color={item.status === 'available' ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {item.manufacturer} {item.model}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PlaceIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                          {item.location}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {item.description?.substring(0, 100)}
                        {item.description?.length > 100 ? '...' : ''}
                      </Typography>
                    </CardContent>
                    <Divider />
                    <CardActions>
                      <Button 
                        size="small" 
                        component={RouterLink}
                        to={`/equipment/${item.id}`}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="small" 
                        color="primary"
                        disabled={item.status !== 'available'}
                      >
                        Book Now
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h6">No equipment found matching your filters</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Try adjusting your search criteria or browse all equipment
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default EquipmentPage; 