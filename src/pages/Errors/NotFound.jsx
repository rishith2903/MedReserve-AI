import { Box, Button, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const NotFound = () => {
  return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="70vh" gap={2}>
      <Typography variant="h3" gutterBottom>
        404 — Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ maxWidth: 560 }}>
        The page you are looking for doesn’t exist or has been moved.
      </Typography>
      <Box display="flex" gap={2}>
        <Button component={RouterLink} to="/dashboard" variant="contained">Back to Dashboard</Button>
        <Button component={RouterLink} to="/login" variant="outlined">Go to Login</Button>
      </Box>
    </Box>
  );
};

export default NotFound;
