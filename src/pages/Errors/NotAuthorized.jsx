import { Box, Button, Typography, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const NotAuthorized = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh" px={2}>
      <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 3 }}>
        <Typography variant="h3" color="error" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ maxWidth: 560, mb: 3 }}>
          You don&apos;t have permission to access this page. If you believe this is a mistake, please contact an administrator.
        </Typography>
        <Button component={RouterLink} to="/dashboard" variant="contained" aria-label="Back to dashboard">
          Back to Dashboard
        </Button>
      </Paper>
    </Box>
  );
};

export default NotAuthorized;
