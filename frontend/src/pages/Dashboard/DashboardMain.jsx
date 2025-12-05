import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const userRole = user?.role?.name || user?.role;

  switch (userRole) {
    case 'PATIENT':
      return <PatientDashboard />;
    case 'DOCTOR':
      return <DoctorDashboard />;
    case 'ADMIN':
    case 'MASTER_ADMIN':
      return <AdminDashboard />;
    default:
      return <PatientDashboard />;
  }
};

export default Dashboard;
