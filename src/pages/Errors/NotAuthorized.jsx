import { Box, Button, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const NotAuthorized = () => {
  return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="70vh" gap={2}>
      <Typography variant="h3" color="error" gutterBottom>
        Access Denied
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ maxWidth: 560 }}>
        You don't have permission to access this page. If you believe this is a mistake, please contact an administrator.
      </Typography>
      <Button component={RouterLink} to="/dashboard" variant="contained">
        Back to Dashboard
      </Button>
    </Box>
  );
};

export default NotAuthorized;
