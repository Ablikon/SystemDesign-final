import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent,
  CardMedia,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { Link } from 'react-router-dom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ScienceIcon from '@mui/icons-material/Science';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useAuth } from '../contexts/AuthContext';
import reservationService from '../services/reservationService';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export default function DashboardPage() {
  const { currentUser, token } = useAuth();
  const [userStats, setUserStats] = useState({
    upcomingReservations: 0,
    pastReservations: 0,
    favoriteEquipment: 0
  });
  const [recentReservations, setRecentReservations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [favoriteEquipment, setFavoriteEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Получаем статистику и уведомления
        const [statsResponse, notificationsResponse, favoriteResponse] = await Promise.all([
          axios.get(`${API_URL}/dashboard/stats`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          }),
          axios.get(`${API_URL}/notifications`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          }),
          axios.get(`${API_URL}/user/favorites`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          })
        ]);
        
        // Получаем актуальные резервации 
        let reservationsData = [];
        try {
          if (token) {
            // Используем сервис резерваций с реальными данными
            const reservationsResponse = await reservationService.getReservations({
              status: 'approved',
              limit: 3,
              sort: 'date'
            }, token);
            
            reservationsData = reservationsResponse.data || [];
          } else {
            // Если нет токена, используем общий запрос
            const reservationsResponse = await axios.get(`${API_URL}/reservations/recent`);
            reservationsData = reservationsResponse.data || [];
          }
        } catch (reservationError) {
          console.error("Error fetching reservations:", reservationError);
          // Продолжаем выполнение, чтобы хотя бы статистика и уведомления отобразились
        }
        
        // Обновляем состояние компонента
        setUserStats(statsResponse.data);
        setNotifications(notificationsResponse.data);
        setFavoriteEquipment(favoriteResponse.data || []);
        
        // Форматируем данные резерваций для отображения
        const formattedReservations = Array.isArray(reservationsData) 
          ? reservationsData.map(res => ({
              id: res.id,
              equipmentName: res.equipmentName || res.equipment?.name || 'Equipment',
              date: res.startTime || res.date || new Date().toISOString(),
              status: res.status || 'Pending'
            }))
          : [];
        
        setRecentReservations(formattedReservations);
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please try again later.");
        
        // Используем mock данные в случае ошибки
        setUserStats({
          upcomingReservations: 3,
          pastReservations: 12,
          favoriteEquipment: 5
        });
        
        setRecentReservations([
          { id: '1', equipmentName: "Electron Microscope", date: "2025-05-10", status: "Approved" },
          { id: '2', equipmentName: "Spectrophotometer", date: "2025-05-15", status: "Pending" },
          { id: '3', equipmentName: "NMR Spectrometer", date: "2025-05-20", status: "Approved" }
        ]);
        
        setNotifications([
          { id: '1', message: "Your reservation for Electron Microscope has been approved", date: "2025-05-01", read: false },
          { id: '2', message: "New equipment added: Thermal Cycler", date: "2025-04-29", read: true },
          { id: '3', message: "Your report for NMR Spectrometer usage is due tomorrow", date: "2025-04-28", read: false }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  // Форматирование даты для отображения
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };

  // Обработчик для пометки всех уведомлений как прочитанных
  const handleMarkAllAsRead = async () => {
    try {
      // В реальном приложении здесь был бы API-запрос
      // await axios.post(`${API_URL}/notifications/mark-all-read`, {}, {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      
      // Обновляем UI для демонстрации
      setNotifications(notifications.map(notification => ({
        ...notification,
        read: true
      })));
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box mb={4} mt={2}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {currentUser?.firstName || 'Researcher'}!
        </Typography>
        <Typography color="textSecondary" gutterBottom>
          Here's an overview of your research activities and upcoming reservations.
        </Typography>
        
        {error && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
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
                    {userStats.upcomingReservations || 0}
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
                    {userStats.pastReservations || 0}
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
                    {(notifications.filter(n => !n.read) || []).length}
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
              {recentReservations && recentReservations.length > 0 ? (
                recentReservations.map((reservation, index) => (
                  <React.Fragment key={reservation.id}>
                    <ListItem>
                      <ListItemText
                        primary={reservation.equipmentName}
                        secondary={`Date: ${formatDate(reservation.date)} | Status: ${reservation.status}`}
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
                variant="outlined"
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
              {notifications && notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem sx={{ 
                      backgroundColor: notification.read ? 'inherit' : 'rgba(25, 118, 210, 0.08)',
                      borderRadius: '4px'
                    }}>
                      <ListItemText
                        primary={notification.message}
                        secondary={`Date: ${formatDate(notification.date)}`}
                      />
                    </ListItem>
                    {index < notifications.length - 1 && <Divider sx={{ my: 1 }} />}
                  </React.Fragment>
                ))
              ) : (
                <Typography color="textSecondary">No notifications</Typography>
              )}
            </List>
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button 
                color="primary"
                variant="outlined"
                onClick={handleMarkAllAsRead}
                disabled={notifications.every(n => n.read)}
              >
                Mark All as Read
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Favorite Equipment */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                <BookmarkIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Favorite Equipment
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                component={Link}
                to="/equipment"
              >
                View All Equipment
              </Button>
            </Box>
            
            <Grid container spacing={3}>
              {favoriteEquipment && favoriteEquipment.length > 0 ? (
                favoriteEquipment.slice(0, 3).map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="140"
                        image={`/images/equipment${item.id % 5 + 1}.jpg`}
                        alt={item.name}
                      />
                      <CardContent>
                        <Typography variant="h6" gutterBottom noWrap>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.facility}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Button 
                            size="small" 
                            component={Link} 
                            to={`/equipment/${item.id}`}
                          >
                            View Details
                          </Button>
                          <Button 
                            size="small" 
                            color="primary"
                            component={Link}
                            to={`/equipment/${item.id}?reserve=true`}
                            sx={{ ml: 1 }}
                          >
                            Book Now
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Box textAlign="center" py={3}>
                    <Typography color="textSecondary">
                      You don't have any favorite equipment yet.
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="primary"
                      component={Link}
                      to="/equipment"
                      sx={{ mt: 2 }}
                    >
                      Browse Equipment
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 