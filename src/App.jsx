import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext';
import TopNavLayout from './components/Layout/TopNavLayout';
import MedicalReports from './pages/Health/MedicalReports';
import Medicines from './pages/Health/Medicines';
import UploadReports from './pages/Health/UploadReports';
import Credentials from './pages/Admin/Credentials';
import AllUsers from './pages/Admin/AllUsers';
import AllDoctors from './pages/Admin/AllDoctors';
import SystemHealth from './pages/Admin/SystemHealth';
import MyPatients from './pages/Doctor/MyPatients';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Dashboard from './pages/Dashboard/DashboardMain';
import DoctorList from './pages/Doctors/DoctorList';
import DoctorDetail from './pages/Doctors/DoctorDetail';
import BookAppointment from './pages/Appointments/BookAppointment';
import MyAppointments from './pages/Appointments/MyAppointments';
import AppointmentDetail from './pages/Appointments/AppointmentDetail';
import SymptomChecker from './pages/AI/SymptomChecker';
import Chatbot from './pages/AI/Chatbot';
import Profile from './pages/Profile/Profile';
import HealthTips from './pages/Health/HealthTips';
import EmergencyContacts from './pages/Emergency/EmergencyContacts';
import ChatbotLanguageSelector from './components/ChatbotLanguageSelector';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CustomThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected routes */}
              <Route path="/" element={<ProtectedRoute><TopNavLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />

                <Route path="dashboard" element={<Dashboard />} />
                <Route path="doctors" element={<DoctorList />} />
                <Route path="doctors/:id" element={<DoctorDetail />} />
                <Route path="book-appointment/:doctorId" element={<BookAppointment />} />
                <Route path="appointments" element={<MyAppointments />} />
                <Route path="appointments/:id" element={<AppointmentDetail />} />
                <Route path="patients" element={<MyPatients />} />
                <Route path="medical-reports" element={<MedicalReports />} />
                <Route path="upload-reports" element={<UploadReports />} />
                <Route path="medicines" element={<Medicines />} />
                <Route path="symptom-checker" element={<SymptomChecker />} />
                <Route path="chatbot" element={<Chatbot />} />
                <Route path="credentials" element={<Credentials />} />
                <Route path="profile" element={<Profile />} />
                <Route path="health-tips" element={<HealthTips />} />
                <Route path="emergency" element={<EmergencyContacts />} />

                {/* Admin routes */}
                <Route path="admin/users" element={<AllUsers />} />
                <Route path="admin/doctors" element={<AllDoctors />} />
                <Route path="admin/system-health" element={<SystemHealth />} />
                <Route path="admin/appointments" element={<div>Admin Appointments Page</div>} />
                <Route path="admin/credentials" element={<Credentials />} />
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Multilingual Chatbot Language Selector */}
            <ChatbotLanguageSelector />
          </Router>
        </AuthProvider>
      </CustomThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
