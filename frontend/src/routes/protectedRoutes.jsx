import React from 'react';

const Dashboard = React.lazy(() => import('../pages/Dashboard/DashboardMain'));
const DoctorList = React.lazy(() => import('../pages/Doctors/DoctorList'));
const DoctorDetail = React.lazy(() => import('../pages/Doctors/DoctorDetail'));
const BookAppointment = React.lazy(() => import('../pages/Appointments/BookAppointment'));
const MyAppointments = React.lazy(() => import('../pages/Appointments/MyAppointments'));
const AppointmentDetail = React.lazy(() => import('../pages/Appointments/AppointmentDetail'));
const MyPatients = React.lazy(() => import('../pages/Doctor/MyPatients'));
const MedicalReports = React.lazy(() => import('../pages/Health/MedicalReports'));
const UploadReports = React.lazy(() => import('../pages/Health/UploadReports'));
const Medicines = React.lazy(() => import('../pages/Health/Medicines'));
const SymptomChecker = React.lazy(() => import('../pages/AI/SymptomChecker'));
const Chatbot = React.lazy(() => import('../pages/AI/Chatbot'));
const Profile = React.lazy(() => import('../pages/Profile/Profile'));
const HealthTips = React.lazy(() => import('../pages/Health/HealthTips'));
const EmergencyContacts = React.lazy(() => import('../pages/Emergency/EmergencyContacts'));

export const protectedRoutes = [
  { path: 'dashboard', element: <Dashboard /> },
  { path: 'doctors', element: <DoctorList /> },
  { path: 'doctors/:id', element: <DoctorDetail /> },
  { path: 'book-appointment/:doctorId', element: <BookAppointment /> },
  { path: 'appointments', element: <MyAppointments /> },
  { path: 'appointments/:id', element: <AppointmentDetail /> },
  { path: 'patients', element: <MyPatients /> },
  { path: 'medical-reports', element: <MedicalReports /> },
  { path: 'upload-reports', element: <UploadReports /> },
  { path: 'medicines', element: <Medicines /> },
  { path: 'symptom-checker', element: <SymptomChecker /> },
  { path: 'chatbot', element: <Chatbot /> },
  { path: 'profile', element: <Profile /> },
  { path: 'health-tips', element: <HealthTips /> },
  { path: 'emergency', element: <EmergencyContacts /> },
];
