/* eslint-disable no-console */
import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Paper,
  LinearProgress,
  Skeleton,
  alpha,
} from '@mui/material';
import {
  LocalHospital,
  Schedule,
  Description,
  TrendingUp,
  Favorite,
  MonitorHeart,
  Thermostat,
  BloodtypeOutlined,
  Psychology,
  CalendarToday,
  Person,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI, doctorsAPI } from '../../services/api';
import realTimeDataService from '../../services/realTimeDataService';
import EmptyState from '../../components/EmptyState';
import { Search } from '@mui/icons-material';

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [healthMetrics, setHealthMetrics] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching dashboard metrics using real-time data service...');
      const metrics = await realTimeDataService.getDashboardMetrics('patient');

      // Set real-time metrics
      setHealthMetrics([
        {
          title: 'Upcoming Appointments',
          value: metrics.upcomingAppointments.toString(),
          icon: <Schedule />,
          color: '#2196f3',
          change: metrics.upcomingAppointments > 0 ? `${metrics.upcomingAppointments} scheduled` : 'No upcoming appointments',
          changeType: 'info'
        },
        {
          title: 'Available Doctors',
          value: metrics.availableDoctors.toString(),
          icon: <Person />,
          color: '#4caf50',
          change: `${metrics.availableDoctors} of ${metrics.totalDoctors} available`,
          changeType: 'positive'
        },
        {
          title: 'Total Appointments',
          value: metrics.totalAppointments.toString(),
          icon: <Description />,
          color: '#ff9800',
          change: 'All time appointments',
          changeType: 'positive'
        },
        {
          title: 'Health Score',
          value: '85%', // This would come from a health metrics API
          icon: <TrendingUp />,
          color: '#9c27b0',
          change: '+5% from last month',
          changeType: 'positive'
        }
      ]);

      console.log('✅ Successfully loaded dashboard metrics');

    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');

      // Fallback to demo data
      setHealthMetrics([
        {
          title: 'Upcoming Appointments',
          value: '2',
          icon: <Schedule />,
          color: '#2196f3',
          change: 'Next: Tomorrow 2:00 PM',
          changeType: 'info'
        },
        {
          title: 'Medical Reports',
          value: '5',
          icon: <Description />,
          color: '#4caf50',
          change: 'Last updated: 2 days ago',
          changeType: 'positive'
        },
        {
          title: 'Active Medications',
          value: '3',
          icon: <LocalHospital />,
          color: '#ff9800',
          change: '1 due for refill',
          changeType: 'warning'
        },
        {
          title: 'Health Score',
          value: '85%',
          icon: <TrendingUp />,
          color: '#9c27b0',
          change: '+5% from last month',
          changeType: 'positive'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const vitalsData = [
    { label: 'Heart Rate', value: '72 bpm', icon: <Favorite />, color: '#e91e63' },
    { label: 'Blood Pressure', value: '120/80', icon: <MonitorHeart />, color: '#2196f3' },
    { label: 'Temperature', value: '98.6°F', icon: <Thermostat />, color: '#ff9800' },
    { label: 'Blood Type', value: 'O+', icon: <BloodtypeOutlined />, color: '#4caf50' },
  ];

  const quickActions = [
    {
      title: 'Find Doctors',
      description: 'Search and book appointments',
      icon: <Person />,
      color: '#2196f3',
      action: () => navigate('/doctors')
    },
    {
      title: 'AI Symptom Checker',
      description: 'Check your symptoms with AI',
      icon: <Psychology />,
      color: '#9c27b0',
      action: () => navigate('/symptom-checker')
    },
    {
      title: 'Upload Reports',
      description: 'Upload medical documents',
      icon: <Description />,
      color: '#4caf50',
      action: () => navigate('/upload-reports')
    },
    {
      title: 'Book Appointment',
      description: 'Schedule with your doctor',
      icon: <CalendarToday />,
      color: '#ff9800',
      action: () => navigate('/doctors')
    }
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Paper sx={{ mb: 4, p: 3 }}>
        {loading ? (
          <>
            <Skeleton width={260} height={36} />
            <Skeleton width={320} height={20} />
            <Skeleton width={200} height={16} />
          </>
        ) : (
          <>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
              Welcome back, {user?.firstName || 'Patient'}! 👋
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your health journey continues here
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>
          </>
        )}
      </Paper>

      {/* Health Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {(loading ? Array.from({ length: 4 }) : healthMetrics).map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card variant="outlined" sx={{
              height: '100%',
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)'
              }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {loading ? (
                    <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2 }} />
                  ) : (
                    <Avatar sx={{ bgcolor: metric.color, mr: 2, width: 48, height: 48 }}>
                      {metric.icon}
                    </Avatar>
                  )}
                  <Box sx={{ flex: 1 }}>
                    {loading ? (
                      <>
                        <Skeleton width={60} height={36} />
                        <Skeleton width={120} height={20} />
                      </>
                    ) : (
                      <>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: metric.color }}>
                          {metric.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {metric.title}
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>
                {loading ? (
                  <Skeleton width={160} height={24} />
                ) : (
                  <Chip
                    label={metric.change}
                    size="small"
                    sx={{
                      bgcolor: metric.changeType === 'positive' ? '#4caf5020' :
                               metric.changeType === 'warning' ? '#ff980020' : '#2196f320',
                      color: metric.changeType === 'positive' ? '#4caf50' :
                             metric.changeType === 'warning' ? '#ff9800' : '#2196f3',
                      fontWeight: 600,
                      border: 'none'
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions and Vitals */}
      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {quickActions.map((action, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Paper
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        border: `1px solid ${action.color}20`,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 4px 15px ${action.color}30`,
                          bgcolor: `${action.color}05`
                        }
                      }}
                      onClick={action.action}
                      role="button"
                      aria-label={action.title}
                    >
                      {loading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                          <Box sx={{ flex: 1 }}>
                            <Skeleton width={140} height={24} />
                            <Skeleton width={220} height={18} />
                          </Box>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ bgcolor: action.color, mr: 2, width: 40, height: 40 }}>
                            {action.icon}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {action.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {action.description}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Vitals */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Latest Vitals
              </Typography>
              <Grid container spacing={2}>
                {vitalsData.map((vital, index) => (
                  <Grid item xs={6} key={index}>
                    <Paper sx={{
                      p: 2,
                      textAlign: 'center',
                      bgcolor: alpha(vital.color, 0.1),
                      border: `1px solid ${alpha(vital.color, 0.2)}`
                    }}>
                      <Avatar sx={{
                        bgcolor: vital.color,
                        mx: 'auto',
                        mb: 1,
                        width: 32,
                        height: 32
                      }}>
                        {vital.icon}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: vital.color }}>
                        {loading ? <Skeleton width={40} /> : vital.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {vital.label}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              {!loading && vitalsData.length === 0 && (
                <Box sx={{ mt: 2 }}>
                  <EmptyState
                    title="No vitals yet"
                    description="Connect a device or add vitals to see them here."
                    actionLabel="Find Doctors"
                    onAction={() => navigate('/doctors')}
                    icon={Search}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PatientDashboard;
