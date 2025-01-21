import React from 'react';
import { Button } from '@mui/material';

const LogoutButton = ({ onLogout }) => (
  <Button 
    variant="outlined" 
    onClick={onLogout}
    sx={{ position: 'absolute', top: 16, right: 16 }}
  >
    Logout
  </Button>
);

export default LogoutButton; 