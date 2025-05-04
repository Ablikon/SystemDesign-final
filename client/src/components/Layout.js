import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import Sidebar, { DRAWER_WIDTH, HEADER_HEIGHT } from './Sidebar';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <Header toggleSidebar={toggleSidebar} />
      
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {isAuthenticated && (
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: '100%',
            backgroundColor: 'background.default',
            mt: `${HEADER_HEIGHT}px`,
            // Add left margin to main content when authenticated to prevent sidebar overlap
            ...(isAuthenticated && {

            })
          }}
        >
          <Outlet />
        </Box>
      </Box>
      
      <Footer />
    </Box>
  );
};

export default Layout; 