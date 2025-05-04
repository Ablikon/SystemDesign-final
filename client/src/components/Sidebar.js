import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Typography
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  EventNote as EventNoteIcon,
  Science as ScienceIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

// Export the drawer width so it can be used consistently across the app
export const DRAWER_WIDTH = 240;
// Define header height for consistent spacing
export const HEADER_HEIGHT = 64;

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  // Check if user has lab manager role
  const isLabManager = currentUser?.Roles?.some(role => role.name === 'Laboratory Manager');

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard'
    },
    {
      text: 'Profile',
      icon: <PersonIcon />,
      path: '/profile'
    },
    {
      text: 'My Reservations',
      icon: <EventNoteIcon />,
      path: '/reservations'
    }
  ];

  // Add equipment management for lab managers
  if (isLabManager) {
    menuItems.push({
      text: 'Manage Equipment',
      icon: <ScienceIcon />,
      path: '/manage/equipment'
    });
  }

  const handleNavigate = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 2,
        backgroundColor: (theme) => theme.palette.primary.main,
        color: 'white'
      }}>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          Open Science Hub
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1, px: 1 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigate(item.path)}
            selected={location.pathname === item.path}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: (theme) => `${theme.palette.primary.light}20`,
                color: 'primary.main',
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                }
              },
              '&:hover': {
                backgroundColor: (theme) => `${theme.palette.primary.light}10`,
              }
            }}
          >
            <ListItemIcon 
              sx={{ 
                minWidth: 40,
                color: location.pathname === item.path ? 'primary.main' : 'inherit'
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} Open Science Hub
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ 
        width: { md: DRAWER_WIDTH }, 
        flexShrink: { md: 0 },
        height: '100%' 
      }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: DRAWER_WIDTH,
            position: 'fixed',
            height: `calc(100vh - ${HEADER_HEIGHT}px)`,
            top: HEADER_HEIGHT,
            borderRight: '1px solid rgba(0, 0, 0, 0.12)'
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar; 