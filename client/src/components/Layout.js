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
      
      <Box 
        sx={{ 
          display: 'flex', 
          flexGrow: 1,
          pt: `${HEADER_HEIGHT}px`,
          backgroundColor: 'background.default',
        }}
      >
        {isAuthenticated && (
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { 
              xs: '100%', 
              md: isAuthenticated ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' 
            },
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Outlet />
          </Box>
          
          <Footer />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout; 