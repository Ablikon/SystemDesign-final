import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button
} from '@mui/material';
import { Link } from 'react-router-dom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ScienceIcon from '@mui/icons-material/Science';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [userStats, setUserStats] = useState({
    upcomingReservations: 0,
    pastReservations: 0,
    favoriteEquipment: 0
  });
  const [recentReservations, setRecentReservations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real app, you would make API calls to fetch this data
        const statsResponse = await api.get('/dashboard/stats');
        const reservationsResponse = await api.get('/reservations/recent');
        const notificationsResponse = await api.get('/notifications');
        
        setUserStats(statsResponse.data);
        setRecentReservations(reservationsResponse.data);
        setNotifications(notificationsResponse.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Use dummy data for demonstration
        setUserStats({
          upcomingReservations: 3,
          pastReservations: 12,
          favoriteEquipment: 5
        });
        setRecentReservations([
          { id: 1, equipmentName: "Electron Microscope", date: "2025-05-10", status: "Approved" },
          { id: 2, equipmentName: "Spectrophotometer", date: "2025-05-15", status: "Pending" },
          { id: 3, equipmentName: "NMR Spectrometer", date: "2025-05-20", status: "Approved" }
        ]);
        setNotifications([
          { id: 1, message: "Your reservation for Electron Microscope has been approved", date: "2025-05-01", read: false },
          { id: 2, message: "New equipment added: Thermal Cycler", date: "2025-04-29", read: true },
          { id: 3, message: "Your report for NMR Spectrometer usage is due tomorrow", date: "2025-04-28", read: false }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <Container maxWidth="lg">
      <Box mb={4} mt={2}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {currentUser?.firstName || 'Researcher'}!
        </Typography>
        <Typography color="textSecondary" gutterBottom>
          Here's an overview of your research activities and upcoming reservations.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Stats cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CalendarMonthIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h5" component="div">
                    {userStats.upcomingReservations}
                  </Typography>
                  <Typography color="textSecondary">
                    Upcoming Reservations
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ScienceIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h5" component="div">
                    {userStats.pastReservations}
                  </Typography>
                  <Typography color="textSecondary">
                    Completed Experiments
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <NotificationsIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h5" component="div">
                    {notifications.filter(n => !n.read).length}
                  </Typography>
                  <Typography color="textSecondary">
                    Unread Notifications
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent reservations */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Reservations
            </Typography>
            <List>
              {recentReservations.length > 0 ? (
                recentReservations.map((reservation, index) => (
                  <React.Fragment key={reservation.id}>
                    <ListItem>
                      <ListItemText
                        primary={reservation.equipmentName}
                        secondary={`Date: ${reservation.date} | Status: ${reservation.status}`}
                      />
                    </ListItem>
                    {index < recentReservations.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <Typography color="textSecondary">No upcoming reservations</Typography>
              )}
            </List>
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button 
                component={Link} 
                to="/reservations" 
                color="primary"
              >
                View All Reservations
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Notifications
            </Typography>
            <List>
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem sx={{ 
                      backgroundColor: notification.read ? 'inherit' : 'rgba(25, 118, 210, 0.08)'
                    }}>
                      <ListItemText
                        primary={notification.message}
                        secondary={`Date: ${notification.date}`}
                      />
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <Typography color="textSecondary">No notifications</Typography>
              )}
            </List>
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button 
                color="primary"
                onClick={() => console.log('Mark all as read')}
              >
                Mark All as Read
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 