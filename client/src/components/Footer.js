import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Link,
  Typography,
  Divider
} from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100]
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Open Science Hub
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connecting researchers with laboratory equipment worldwide
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Resources
            </Typography>
            <Link component={RouterLink} to="/equipment" color="inherit" display="block">
              Equipment Catalog
            </Link>
            <Link component={RouterLink} to="/about" color="inherit" display="block">
              About Us
            </Link>
            <Link component="a" href="#" color="inherit" display="block">
              Documentation
            </Link>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Legal
            </Typography>
            <Link component="a" href="#" color="inherit" display="block">
              Privacy Policy
            </Link>
            <Link component="a" href="#" color="inherit" display="block">
              Terms of Service
            </Link>
            <Link component="a" href="#" color="inherit" display="block">
              Data Handling
            </Link>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Contact Us
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: info@opensciencehub.com
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Phone: +1 (555) 123-4567
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ mt: 3, mb: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Open Science Collaboration Hub
          </Typography>
          <Box>
            <Link href="#" color="inherit" sx={{ px: 1 }}>
              <i className="fab fa-facebook"></i>
            </Link>
            <Link href="#" color="inherit" sx={{ px: 1 }}>
              <i className="fab fa-twitter"></i>
            </Link>
            <Link href="#" color="inherit" sx={{ px: 1 }}>
              <i className="fab fa-linkedin"></i>
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 