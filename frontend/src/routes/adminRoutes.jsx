import React from 'react';
import { ROLES } from '../utils/roles';

const AllUsers = React.lazy(() => import('../pages/Admin/AllUsers'));
const AllDoctors = React.lazy(() => import('../pages/Admin/AllDoctors'));
const SystemHealth = React.lazy(() => import('../pages/Admin/SystemHealth'));
const Credentials = React.lazy(() => import('../pages/Admin/Credentials'));

const AdminAppointmentsPage = () => <div>Admin Appointments Page</div>;

export const adminRequiredRoles = [ROLES.ADMIN, ROLES.MASTER_ADMIN];

export const adminRoutes = [
  { path: 'admin/users', element: <AllUsers /> },
  { path: 'admin/doctors', element: <AllDoctors /> },
  { path: 'admin/system-health', element: <SystemHealth /> },
  { path: 'admin/appointments', element: <AdminAppointmentsPage /> },
  { path: 'admin/credentials', element: <Credentials /> },
];
