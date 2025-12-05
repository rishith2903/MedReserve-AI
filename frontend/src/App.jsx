import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from './components/ErrorBoundary';
import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import DocumentTitle from './components/DocumentTitle';
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import TopNavLayout from './components/Layout/TopNavLayout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ChatbotLanguageSelector from './components/ChatbotLanguageSelector';
import NotAuthorized from './pages/Errors/NotAuthorized';
import NotFound from './pages/Errors/NotFound';
import { adminRoutes, adminRequiredRoles } from './routes/adminRoutes.jsx';
import { protectedRoutes } from './routes/protectedRoutes.jsx';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1 minute: avoid refetching too often
      gcTime: 5 * 60 * 1000, // keep cached data around to prevent reloading between tabs/views
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CustomThemeProvider>
        <AuthProvider>
          <ErrorBoundary>
            <Router>
              <Suspense fallback={<Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>}>
                <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected routes */}
              <Route path="/" element={<ProtectedRoute><TopNavLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />

                {protectedRoutes.map(({ path, element }) => (
                  <Route key={path} path={path} element={element} />
                ))}

                {/* Admin routes (restrict to ADMIN and MASTER_ADMIN) via centralized config */}
                {adminRoutes.map(({ path, element }) => (
                  <Route
                    key={path}
                    path={path}
                    element={<ProtectedRoute requiredRoles={adminRequiredRoles}>{element}</ProtectedRoute>}
                  />
                ))}
              </Route>

              {/* Not authorized and 404 */}
              <Route path="/not-authorized" element={<NotAuthorized />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
              </Suspense>

            <DocumentTitle />
            {/* Multilingual Chatbot Language Selector */}
            <ChatbotLanguageSelector />
            </Router>
          </ErrorBoundary>
        </AuthProvider>
      </CustomThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
