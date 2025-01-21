import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

const AuthWrapper = ({ clientId, onLogin, t }) => {
  if (!clientId) {
    return (
      <Container>
        <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
          <Typography variant="h4" color="error" gutterBottom>
            Configuration Error
          </Typography>
          <Typography>
            Google Client ID is not configured. Please check your environment variables.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Container>
        <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
          <Typography variant="h4" gutterBottom>
            {t?.auth?.welcome || 'Welcome to Trivia Game'}
          </Typography>
          <GoogleLogin
            onSuccess={onLogin}
            onError={() => console.log('Login Failed')}
          />
        </Box>
      </Container>
    </GoogleOAuthProvider>
  );
};

export default AuthWrapper; 