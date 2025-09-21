import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TITLE_MAP = {
  'login': 'Sign In',
  'signup': 'Sign Up',
  'dashboard': 'Dashboard',
  'doctors': 'Doctors',
  'appointments': 'Appointments',
  'medical-reports': 'Medical Reports',
  'upload-reports': 'Upload Reports',
  'medicines': 'Medicines',
  'symptom-checker': 'Symptom Checker',
  'chatbot': 'Chatbot',
  'profile': 'Profile',
  'health-tips': 'Health Tips',
  'emergency': 'Emergency',
  'admin': 'Admin',
  'users': 'Users',
  'system-health': 'System Health',
  'credentials': 'Credentials',
  'not-authorized': 'Not Authorized',
};

function titleize(segment) {
  if (TITLE_MAP[segment]) return TITLE_MAP[segment];
  if (/^\d+$/.test(segment)) return 'Detail';
  return segment
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

const DocumentTitle = ({ base = 'MedReserve AI' }) => {
  const location = useLocation();

  useEffect(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (!parts.length) {
      document.title = base;
      return;
    }
    const label = titleize(parts[parts.length - 1]);
    document.title = `${label} • ${base}`;
  }, [location.pathname, base]);

  return null;
};

export default DocumentTitle;
