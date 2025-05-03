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
  IconButton
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  EventNote as EventNoteIcon,
  Settings as SettingsIcon,
  Science as ScienceIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

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
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton onClick={onClose}>
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigate(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem button>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
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
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
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
            width: drawerWidth,
            position: 'relative',
            height: '100%'
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