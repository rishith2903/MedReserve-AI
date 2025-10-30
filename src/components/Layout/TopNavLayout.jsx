import { useState, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Divider,
  Button,
  useTheme,
  useMediaQuery,
  Fab,
  Container,
} from '@mui/material';
import { Tooltip } from '@mui/material';
import {
  Dashboard,
  People,
  CalendarToday,
  Psychology,
  Chat,
  Person,
  HealthAndSafety,
  LocalHospital,
  Logout,
  Notifications,
  Description,
  Medication,
  CloudUpload,
  MonitorHeart,
  Security,
  DarkMode,
  LightMode,
  MoreVert,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import { useAutoLogout } from '../../hooks/useAutoLogout';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { ROLES } from '../../utils/roles';
import BreadcrumbsNav from '../BreadcrumbsNav';

const TopNavLayout = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useCustomTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [navMenuAnchor, setNavMenuAnchor] = useState(null);

  // Auto logout hook with warning
  const { showWarning, secondsRemaining, staySignedIn } = useAutoLogout();

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchor(null);
  };

  const handleNavMenuOpen = (event) => {
    setNavMenuAnchor(event.currentTarget);
  };

  const handleNavMenuClose = () => {
    setNavMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleProfileMenuClose();
  };

  // Role-based navigation items (memoized)
  const navigationItems = useMemo(() => {
    const userRole = user?.role?.name || user?.role;

    // Common items for all authenticated users
    const commonItems = [
      { label: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
    ];

    if (userRole === ROLES.PATIENT) {
      return [
        ...commonItems,
        { label: 'Find Doctors', path: '/doctors', icon: <People /> },
        { label: 'My Appointments', path: '/appointments', icon: <CalendarToday /> },
        { label: 'Medical Reports', path: '/medical-reports', icon: <Description /> },
        { label: 'My Medicines', path: '/medicines', icon: <Medication /> },
        { label: 'Upload Reports', path: '/upload-reports', icon: <CloudUpload /> },
        { label: 'AI Symptom Checker', path: '/symptom-checker', icon: <Psychology /> },
        { label: 'AI Chatbot', path: '/chatbot', icon: <Chat /> },
        { label: 'Health Tips', path: '/health-tips', icon: <HealthAndSafety /> },
        { label: 'Emergency', path: '/emergency', icon: <LocalHospital /> },
      ];
    }

    if (userRole === ROLES.DOCTOR) {
      return [
        ...commonItems,
        { label: 'My Patients', path: '/patients', icon: <People /> },
        { label: 'My Schedule', path: '/appointments', icon: <CalendarToday /> },
        { label: 'Patient Reports', path: '/medical-reports', icon: <Description /> },
        { label: 'AI Tools', path: '/symptom-checker', icon: <Psychology /> },
        { label: 'Chat with Patients', path: '/chatbot', icon: <Chat /> },
        { label: 'My Profile', path: '/profile', icon: <Person /> },
      ];
    }

    if (userRole === ROLES.ADMIN || userRole === ROLES.MASTER_ADMIN) {
      return [
        ...commonItems,
        { label: 'All Users', path: '/admin/users', icon: <People /> },
        { label: 'All Doctors', path: '/admin/doctors', icon: <People /> },
        { label: 'System Health', path: '/admin/system-health', icon: <MonitorHeart /> },
        { label: 'Appointments', path: '/admin/appointments', icon: <CalendarToday /> },
        { label: 'Credentials', path: '/admin/credentials', icon: <Security /> },
        { label: 'Reports', path: '/medical-reports', icon: <Description /> },
      ];
    }

    return commonItems;
  }, [user]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box sx={{ flexGrow: 1 }}>
        {/* Top Navigation Bar */}
        <AppBar position="sticky" elevation={0} sx={{ zIndex: (t) => t.zIndex.drawer + 1, borderBottom: (t) => `1px solid ${t.palette.divider}`, bgcolor: 'background.paper', color: 'text.primary' }}>
          <Toolbar>
          {/* Logo and Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <LocalHospital sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              MedReserve AI
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
              {navigationItems.slice(0, 6).map((item) => (
                <Tooltip key={item.path} title={item.label} arrow>
                  <Button
                  key={item.path}
                  color="inherit"
                  onClick={() => navigate(item.path)}
                  sx={{
                    minWidth: 'auto',
                    px: 2,
                    backgroundColor: location.pathname === item.path ? (theme) => theme.palette.action.selected : 'transparent',
                    '&:hover': {
                      backgroundColor: (theme) => theme.palette.action.hover,
                    },
                  }}
                    aria-current={location.pathname === item.path ? 'page' : undefined}
                >
                  {item.icon}
                  <Typography variant="body2" sx={{ ml: 1, display: { xs: 'none', lg: 'block' } }}>
                    {item.label}
                  </Typography>
                  </Button>
                </Tooltip>
              ))}
              {navigationItems.length > 6 && (
                <Tooltip title="More navigation" arrow>
                  <IconButton color="inherit" onClick={handleNavMenuOpen} aria-label="Open more navigation">
                    <MoreVert />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}

          {/* Right side icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Mobile Navigation Menu Button */}
            {isMobile && (
              <Tooltip title="Menu" arrow>
                <IconButton color="inherit" onClick={handleNavMenuOpen} aria-label="Open navigation menu">
                  <MoreVert />
                </IconButton>
              </Tooltip>
            )}

            {/* Theme Toggle */}
            <Tooltip title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'} arrow>
              <IconButton color="inherit" onClick={toggleDarkMode} aria-label={isDarkMode ? 'Activate light mode' : 'Activate dark mode'}>
                {isDarkMode ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Notifications" arrow>
              <IconButton color="inherit" onClick={handleNotificationMenuOpen} aria-label="Open notifications">
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>


            {/* Profile Avatar */}
            <Tooltip title="Account" arrow>
              <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0, ml: 1 }} aria-label="Open account menu">
              <Avatar
                alt={user?.firstName || 'User'}
                src={user?.profilePicture}
                sx={{ width: 40, height: 40 }}
              >
                {user?.firstName?.charAt(0) || 'U'}
              </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
        </AppBar>

        {/* Profile Menu */}
        <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
      >
        <MenuItem onClick={() => navigate('/profile')}>
          <Person sx={{ mr: 2 }} />
          Profile
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <Logout sx={{ mr: 2 }} />
          Logout
        </MenuItem>
      </Menu>

        {/* Notification Menu */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationMenuClose}
        >
          <MenuItem>
            <Typography variant="body2">No new notifications</Typography>
          </MenuItem>
        </Menu>

        {/* Navigation Menu (mobile and overflow on desktop) */}
        <Menu
          anchorEl={navMenuAnchor}
          open={Boolean(navMenuAnchor)}
          onClose={handleNavMenuClose}
        >
          {navigationItems.map((item) => (
            <MenuItem
              key={item.path}
              selected={location.pathname === item.path}
              onClick={() => {
                handleNavMenuClose();
                navigate(item.path);
              }}
            >
              {item.icon}
              <Typography variant="body2" sx={{ ml: item.icon ? 2 : 0 }}>
                {item.label}
              </Typography>
            </MenuItem>
          ))}
        </Menu>

        {/* Inactivity Warning Dialog */}
        <Dialog open={!!showWarning} onClose={staySignedIn} aria-labelledby="inactivity-warning-title">
          <DialogTitle id="inactivity-warning-title">Are you still there?</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              You will be logged out due to inactivity in {secondsRemaining}s.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleLogout} color="error">Logout now</Button>
            <Button onClick={staySignedIn} variant="contained">Stay signed in</Button>
          </DialogActions>
        </Dialog>

        {/* Main Content (reduced top spacing) */}
        <Container component="main" id="main-content" maxWidth="xl" sx={{ flexGrow: 1, py: 1 }}>
          <BreadcrumbsNav />
          <Outlet />
        </Container>

        {/* Mobile Chat Fab */}
        {/* Mobile Chat Fab */}
        {isMobile && (
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000,
            }}
            onClick={() => navigate('/chatbot')}
          >
            <Chat />
          </Fab>
        )}
      </Box>
    </Box>
  );
};

export default TopNavLayout;
