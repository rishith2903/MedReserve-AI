import React from 'react';
import PlaceholderPage from '../PlaceholderPage';
import { CalendarToday } from '@mui/icons-material';

const AppointmentDetail = () => {
  return (
    <PlaceholderPage
      title="Appointment Details"
      description="View detailed information about your appointment."
      icon={CalendarToday}
    />
  );
};

export default AppointmentDetail;
