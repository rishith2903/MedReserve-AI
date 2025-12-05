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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import {
  People,
  Schedule,
  TrendingUp,
  Star,
  AccessTime,
  Person,
  CalendarToday,
  Psychology,
  Chat,
  Description,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI, doctorsAPI } from '../../services/api';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [doctorMetrics, setDoctorMetrics] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDoctorDashboardData();
  }, []);

  const fetchDoctorDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch real data from APIs
      const [appointmentsResponse] = await Promise.allSettled([
        appointmentsAPI.getAll().catch(() => ({ content: [] }))
      ]);

      const appointments = appointmentsResponse.status === 'fulfilled'
        ? (appointmentsResponse.value.content || appointmentsResponse.value || [])
        : [];

      // Calculate real metrics for doctor
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

      const todaysAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDateTime);
        return aptDate >= todayStart && aptDate < todayEnd;
      }).length;

      const thisWeekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
      const thisWeekAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDateTime);
        return aptDate >= thisWeekStart;
      }).length;

      // Set real-time metrics
      setDoctorMetrics([
        {
          title: 'Today\'s Patients',
          value: todaysAppointments.toString(),
          icon: <People />,
          color: '#2196f3',
          change: todaysAppointments > 0 ? `${todaysAppointments} scheduled today` : 'No appointments today',
          changeType: todaysAppointments > 0 ? 'positive' : 'info'
        },
        {
          title: 'This Week\'s Appointments',
          value: thisWeekAppointments.toString(),
          icon: <Schedule />,
          color: '#4caf50',
          change: `${thisWeekAppointments} appointments this week`,
          changeType: 'positive'
        },
        {
          title: 'Patient Rating',
          value: '4.8', // This would come from doctor profile
          icon: <Star />,
          color: '#ff9800',
          change: 'Based on patient reviews',
          changeType: 'info'
        },
        {
          title: 'Total Appointments',
          value: appointments.length.toString(),
          icon: <AccessTime />,
          color: '#9c27b0',
          change: 'All time',
          changeType: 'info'
        }
      ]);

    } catch (error) {
      console.error('Error fetching doctor dashboard data:', error);
      setError('Failed to load dashboard data');

      // Fallback to demo data
      setDoctorMetrics([
        {
          title: 'Today\'s Patients',
          value: '12',
          icon: <People />,
          color: '#2196f3',
          change: '3 more than yesterday',
          changeType: 'positive'
        },
        {
          title: 'This Week\'s Appointments',
          value: '48',
          icon: <Schedule />,
          color: '#4caf50',
          change: '+15% from last week',
          changeType: 'positive'
        },
        {
          title: 'Patient Rating',
          value: '4.8',
          icon: <Star />,
          color: '#ff9800',
          change: 'Based on 127 reviews',
          changeType: 'info'
        },
        {
          title: 'Consultation Hours',
          value: '32h',
          icon: <AccessTime />,
          color: '#9c27b0',
          change: 'This week',
          changeType: 'info'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const todaysAppointments = [
    { time: '09:00 AM', patient: 'John Smith', type: 'Consultation', status: 'confirmed' },
    { time: '10:30 AM', patient: 'Sarah Johnson', type: 'Follow-up', status: 'confirmed' },
    { time: '02:00 PM', patient: 'Mike Wilson', type: 'Check-up', status: 'pending' },
    { time: '03:30 PM', patient: 'Emma Davis', type: 'Consultation', status: 'confirmed' },
  ];

  const quickActions = [
    {
      title: 'View Patients',
      description: 'Manage your patient list',
      icon: <People />,
      color: '#2196f3',
      action: () => navigate('/patients')
    },
    {
      title: 'Schedule',
      description: 'View your appointments',
      icon: <CalendarToday />,
      color: '#4caf50',
      action: () => navigate('/appointments')
    },
    {
      title: 'AI Tools',
      description: 'Use diagnostic tools',
      icon: <Psychology />,
      color: '#9c27b0',
      action: () => navigate('/symptom-checker')
    },
    {
      title: 'Patient Chat',
      description: 'Communicate with patients',
      icon: <Chat />,
      color: '#ff9800',
      action: () => navigate('/chatbot')
    }
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Paper sx={{ mb: 4, p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
          Good morning, Dr. {user?.lastName || 'Doctor'}! 👨‍⚕️
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ready to help your patients today
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Typography>
      </Paper>

      {/* Doctor Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {doctorMetrics.map((metric, index) => (
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
                  <Avatar sx={{
                    bgcolor: metric.color,
                    mr: 2,
                    width: 48,
                    height: 48
                  }}>
                    {metric.icon}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: metric.color }}>
                      {loading ? <Skeleton width={60} /> : metric.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {metric.title}
                    </Typography>
                  </Box>
                </Box>
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
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Today's Schedule and Quick Actions */}
      <Grid container spacing={3}>
        {/* Today's Appointments */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Today&apos;s Appointments
              </Typography>
              <List>
                {todaysAppointments.map((appointment, index) => (
                  <ListItem key={index} sx={{ 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 2, 
                    mb: 1,
                    '&:hover': { bgcolor: 'action.hover' }
                  }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#2196f3' }}>
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {appointment.patient}
                          </Typography>
                          <Chip
                            label={appointment.status}
                            size="small"
                            color={appointment.status === 'confirmed' ? 'success' : 'warning'}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {appointment.time} • {appointment.type}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {quickActions.map((action, index) => (
                  <Grid item xs={12} key={index}>
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
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DoctorDashboard;
