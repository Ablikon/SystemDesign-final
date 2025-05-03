import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import GroupsIcon from '@mui/icons-material/Groups';
import SchoolIcon from '@mui/icons-material/School';

export default function AboutPage() {
  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          About the Open Science Collaboration Hub
        </Typography>
        
        <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" gutterBottom>Our Mission</Typography>
          <Typography paragraph>
            The Open Science Collaboration Hub is a platform dedicated to democratizing access to scientific resources 
            and equipment. We connect researchers, educators, and students with remote laboratory equipment and 
            facilities, enabling collaborative research and education regardless of geographical or institutional 
            boundaries.
          </Typography>
          <Typography paragraph>
            By providing a centralized platform for equipment sharing and remote access, we aim to accelerate 
            scientific discovery, promote resource efficiency, and foster interdisciplinary collaboration across 
            the global scientific community.
          </Typography>
        </Paper>

        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3 }}>
          Key Features
        </Typography>
        
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                <ScienceIcon fontSize="large" color="primary" />
              </Box>
              <CardContent>
                <Typography variant="h6" component="h2" align="center" gutterBottom>
                  Remote Equipment Access
                </Typography>
                <Typography variant="body2">
                  Access sophisticated scientific equipment remotely through our secure platform.
                  Schedule experiments, control instruments, and collect data without the need for physical presence.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                <GroupsIcon fontSize="large" color="primary" />
              </Box>
              <CardContent>
                <Typography variant="h6" component="h2" align="center" gutterBottom>
                  Collaborative Research
                </Typography>
                <Typography variant="body2">
                  Connect with researchers from around the world who have similar interests or complementary skills.
                  Form interdisciplinary teams to tackle complex scientific challenges together.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                <SchoolIcon fontSize="large" color="primary" />
              </Box>
              <CardContent>
                <Typography variant="h6" component="h2" align="center" gutterBottom>
                  Educational Resources
                </Typography>
                <Typography variant="body2">
                  Access training materials, tutorials, and guides for using scientific equipment.
                  Share your knowledge and expertise with the scientific community.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Paper elevation={2} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>Contact Us</Typography>
          <Typography paragraph>
            We're always open to feedback, partnerships, and new ideas. If you'd like to get in touch with our team,
            please email us at <strong>contact@opensciencehub.org</strong> or call <strong>+1 (555) 123-4567</strong>.
          </Typography>
          <Typography>
            Open Science Collaboration Hub<br />
            123 Research Avenue<br />
            Science City, SC 12345<br />
            United States
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
} 