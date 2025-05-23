import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Chip,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/History';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import api from '../services/api';
import axios from 'axios';

export default function ProfilePage() {
  const { currentUser, updateUserProfile } = useAuth();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    institution: '',
    position: '',
    fieldOfStudy: '',
    bio: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [recentActivity, setRecentActivity] = useState([]);
  const [favoriteEquipment, setFavoriteEquipment] = useState([]);

  useEffect(() => {
    // In a real app, fetch profile from API
    if (currentUser) {
      setProfile({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        institution: currentUser.institution || 'Stanford University',
        position: currentUser.position || 'Research Associate',
        fieldOfStudy: currentUser.fieldOfStudy || 'Molecular Biology',
        bio: currentUser.bio || 'Researcher focused on genetic analysis techniques and their applications in medical diagnostics.'
      });
    }

    // Fetch user activity and favorites
    const fetchUserData = async () => {
      try {
        // In real app, use API calls
        const activityResponse = await api.get('/user/activity');
        const favoritesResponse = await api.get('/user/favorites');
        
        setRecentActivity(activityResponse.data);
        setFavoriteEquipment(favoritesResponse.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Demo data
        setRecentActivity([
          { id: 1, type: 'Reservation', date: '2025-04-28', description: 'Reserved Electron Microscope' },
          { id: 2, type: 'Data Upload', date: '2025-04-25', description: 'Uploaded research findings' },
          { id: 3, type: 'Equipment Use', date: '2025-04-22', description: 'Used DNA Sequencer' }
        ]);
        setFavoriteEquipment([
          { id: 101, name: 'Electron Microscope', facility: 'Imaging Center' },
          { id: 102, name: 'Mass Spectrometer', facility: 'Chemical Analysis Lab' },
          { id: 103, name: 'DNA Sequencer', facility: 'Genomics Department' }
        ]);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log('Submitting profile update with data:', profile);
      
      // Add a message to indicate we're submitting
      setMessage({ 
        type: 'info', 
        text: 'Updating profile...' 
      });
      
      const result = await updateUserProfile(profile);
      console.log('Profile update result:', result);
      
      setMessage({ 
        type: 'success', 
        text: 'Profile updated successfully!' 
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update profile' 
      });
    } finally {
      setIsLoading(false);
    }
    
    // Clear message after 5 seconds
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 5000);
  };

  // Direct test function to bypass layers
  const handleDirectTest = async () => {
    setIsLoading(true);
    setMessage({ type: 'info', text: 'Using local mock implementation...' });
    
    try {
      console.log('Testing with mock data:', profile);
      
      // Create a simple mock implementation right here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      // Create mock updated user
      const updatedUser = {
        ...(currentUser || {}),
        ...profile,
        updatedAt: new Date().toISOString()
      };
      
      console.log('Mock update successful:', updatedUser);
      
      setMessage({ 
        type: 'success', 
        text: 'Mock update successful! Real API calls are bypassed.' 
      });
    } catch (error) {
      console.error('Mock update error:', error);
      
      setMessage({ 
        type: 'error', 
        text: 'Even the mock implementation failed: ' + error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Researcher Profile
        </Typography>
        
        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}
        
        <Grid container spacing={4}>
          {/* Profile Info */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    src="/images/avatar.jpg"
                    sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main' }}
                  >
                    {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h5">
                      {profile.firstName} {profile.lastName}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      {profile.position} at {profile.institution}
                    </Typography>
                    <Chip 
                      label={profile.fieldOfStudy} 
                      size="small" 
                      sx={{ mt: 1 }} 
                      color="primary" 
                      variant="outlined" 
                    />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {/* <Button 
                    startIcon={<SettingsBackupRestoreIcon />}
                    onClick={handleDirectTest}
                    variant="outlined"
                    color="secondary"
                    disabled={isLoading}
                  >
                    Test API
                  </Button> */}
                  <Button 
                    startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                    onClick={() => isEditing ? handleSubmit() : setIsEditing(true)}
                    variant={isEditing ? "contained" : "outlined"}
                    color="primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                        Processing...
                      </Box>
                    ) : (
                      isEditing ? 'Save' : 'Edit Profile'
                    )}
                  </Button>
                </Box>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="firstName"
                      label="First Name"
                      value={profile.firstName}
                      onChange={handleChange}
                      fullWidth
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="lastName"
                      label="Last Name"
                      value={profile.lastName}
                      onChange={handleChange}
                      fullWidth
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="email"
                      label="Email"
                      value={profile.email}
                      onChange={handleChange}
                      fullWidth
                      disabled={true} // Email should not be editable
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="institution"
                      label="Institution"
                      value={profile.institution}
                      onChange={handleChange}
                      fullWidth
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="position"
                      label="Position"
                      value={profile.position}
                      onChange={handleChange}
                      fullWidth
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="fieldOfStudy"
                      label="Field of Study"
                      value={profile.fieldOfStudy}
                      onChange={handleChange}
                      fullWidth
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="bio"
                      label="Biography"
                      value={profile.bio}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={4}
                      disabled={!isEditing}
                    />
                  </Grid>
                  {isEditing && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button 
                          variant="outlined" 
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          variant="contained" 
                          color="primary"
                          startIcon={<SaveIcon />}
                        >
                          Save Changes
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Paper>
          </Grid>
          
          {/* Activity & Favorites */}
          <Grid item xs={12} md={4}>
            <Grid container spacing={3} direction="column">
              <Grid item>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <HistoryIcon sx={{ mr: 1 }} /> Recent Activity
                    </Typography>
                    <List dense>
                      {recentActivity.map(activity => (
                        <ListItem key={activity.id}>
                          <ListItemText
                            primary={activity.description}
                            secondary={activity.date}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BookmarkIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Favorite Equipment</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    {favoriteEquipment.map(item => (
                      <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <Card>
                          <Box sx={{ position: 'relative' }}>
                            <img 
                              src={`/images/equipment${item.id % 5 + 1}.jpg`}
                              alt={item.name}
                              style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                            />
                            <Box 
                              sx={{ 
                                position: 'absolute', 
                                bottom: 0, 
                                width: '100%', 
                                bgcolor: 'rgba(0,0,0,0.6)',
                                color: 'white',
                                p: 1
                              }}
                            >
                              <Typography variant="subtitle1">
                                {item.name}
                              </Typography>
                              <Typography variant="caption">
                                {item.facility}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                              href={`/equipment/${item.id}`}
                            >
                              View
                            </Button>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
} 