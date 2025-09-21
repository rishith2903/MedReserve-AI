/* eslint-disable react/prop-types */
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

// Supports either requiredRole (string) or requiredRoles (array of strings)
const ProtectedRoute = ({ children, requiredRole, requiredRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based access check (if provided)
  const userRole = user?.role?.name || user?.role;
  let allowed = true;
  if (Array.isArray(requiredRoles) && requiredRoles.length > 0) {
    allowed = requiredRoles.includes(userRole);
  } else if (requiredRole) {
    allowed = userRole === requiredRole;
  }

  if (!allowed) {
    return <Navigate to="/not-authorized" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
