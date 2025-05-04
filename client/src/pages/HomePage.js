import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions
} from '@mui/material';
import { 
  Science as ScienceIcon,
  CalendarToday as CalendarIcon,
  Group as GroupIcon
} from '@mui/icons-material';

const HomePage = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6,
          borderRadius: 2,
          background: 'linear-gradient(45deg, #1976d2 30%, #9c27b0 90%)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                Open Science Collaboration Hub
              </Typography>
              <Typography variant="h5" paragraph>
                Connect with laboratory equipment across the globe to accelerate your research
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Button
                  component={RouterLink}
                  to="/equipment"
                  variant="contained"
                  color="secondary"
                  size="large"
                  sx={{ mr: 2 }}
                >
                  Browse Equipment
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="outlined"
                  color="inherit"
                  size="large"
                >
                  Join Now
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/images/hero.jpg"
                alt="Laboratory equipment"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: 10,
                  display: { xs: 'none', md: 'block' }
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography
          variant="h4"
          component="h2"
          align="center"
          gutterBottom
          sx={{ mb: 6 }}
        >
          How It Works
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <ScienceIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Discover Equipment
              </Typography>
              <Typography>
                Browse our catalog of specialized scientific equipment available for remote access from research institutions worldwide.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <CalendarIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Schedule Access
              </Typography>
              <Typography>
                Book time slots to remotely operate equipment, with instant confirmation or expert-reviewed approvals.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <GroupIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Collaborate
              </Typography>
              <Typography>
                Work with colleagues in real-time, collect and analyze data together, and share experimental protocols.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Featured Equipment Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component="h2"
            align="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            Featured Equipment
          </Typography>

          <Grid container spacing={4}>
            {featuredEquipment.map((item) => (
              <Grid item key={item.id} xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)'
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.image}
                    alt={item.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h3">
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {item.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Location:</strong> {item.location}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      component={RouterLink}
                      to={`/equipment/${item.id}`}
                    >
                      View Details
                    </Button>
                    <Button size="small" color="primary"
                      component={RouterLink}
                      to={`/equipment/${item.id}?reserve=true`}
                    >
                      Book Now
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              component={RouterLink}
              to="/equipment"
              variant="contained"
              color="primary"
              size="large"
            >
              View All Equipment
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

// Mock data for featured equipment
const featuredEquipment = [
  {
    id: '1',
    name: 'Scanning Electron Microscope',
    description: 'High-resolution imaging for nanoscale samples with remote operation capabilities.',
    location: 'University of California, Berkeley',
    image: '/images/equipment1.jpg'
  },
  {
    id: '2',
    name: 'Liquid Chromatography Mass Spectrometer',
    description: 'Advanced analysis system for complex biological and chemical samples.',
    location: 'ETH Zurich',
    image: '/images/equipment2.jpg'
  },
  {
    id: '3',
    name: 'Atomic Force Microscope',
    description: 'Nanoscale imaging and measurement with atomic resolution for material science.',
    location: 'Tokyo Institute of Technology',
    image: '/images/equipment3.jpg'
  }
];

export default HomePage; 