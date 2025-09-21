import { Breadcrumbs, Link, Typography } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const LABEL_MAP = {
  'dashboard': 'Dashboard',
  'doctors': 'Doctors',
  'appointments': 'Appointments',
  'medical-reports': 'Medical Reports',
  'upload-reports': 'Upload Reports',
  'medicines': 'Medicines',
  'symptom-checker': 'Symptom Checker',
  'chatbot': 'Chatbot',
  'credentials': 'Credentials',
  'profile': 'Profile',
  'health-tips': 'Health Tips',
  'emergency': 'Emergency',
  'admin': 'Admin',
  'users': 'Users',
  'system-health': 'System Health',
};

function titleize(segment) {
  if (LABEL_MAP[segment]) return LABEL_MAP[segment];
  if (/^\d+$/.test(segment)) return 'Detail';
  return segment
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

const BreadcrumbsNav = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);

  // Hide on root redirect (/) and on login/signup
  if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup') return null;

  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ my: 2 }}>
      <Link component={RouterLink} underline="hover" color="inherit" to="/dashboard">
        Home
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const label = titleize(value);
        return isLast ? (
          <Typography color="text.primary" key={to}>
            {label}
          </Typography>
        ) : (
          <Link component={RouterLink} underline="hover" color="inherit" to={to} key={to}>
            {label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};

export default BreadcrumbsNav;
