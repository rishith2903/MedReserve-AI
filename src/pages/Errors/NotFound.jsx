import { Box, Button, Typography, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const NotFound = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh" px={2}>
      <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 3 }}>
        <Typography variant="h1" sx={{ fontWeight: 700, fontSize: { xs: 56, md: 96 } }} gutterBottom>
          404
        </Typography>
        <Typography variant="h5" gutterBottom>
          Page not found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560, mx: 'auto', mb: 4 }}>
          The page you are looking for doesn&apos;t exist or has been moved.
        </Typography>
        <Box display="flex" gap={2} justifyContent="center">
          <Button component={RouterLink} to="/dashboard" variant="contained">Back to Dashboard</Button>
          <Button component={RouterLink} to="/login" variant="outlined">Go to Login</Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default NotFound;
