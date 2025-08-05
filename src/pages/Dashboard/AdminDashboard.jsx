import React, { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  People,
  LocalHospital,
  TrendingUp,
  Security,
  MonitorHeart,
  Assessment,
  AdminPanelSettings,
  HealthAndSafety,
  CalendarToday,
  Description,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const systemMetrics = [
    {
      title: 'Total Users',
      value: '1,247',
      icon: <People />,
      color: '#2196f3',
      change: '+12% this month',
      changeType: 'positive'
    },
    {
      title: 'Active Doctors',
      value: '89',
      icon: <LocalHospital />,
      color: '#4caf50',
      change: '5 new this week',
      changeType: 'positive'
    },
    {
      title: 'System Health',
      value: '99.8%',
      icon: <MonitorHeart />,
      color: '#ff9800',
      change: 'Uptime',
      changeType: 'info'
    },
    {
      title: 'Security Score',
      value: '95%',
      icon: <Security />,
      color: '#9c27b0',
      change: 'All systems secure',
      changeType: 'positive'
    }
  ];

  const recentActivity = [
    { action: 'New doctor registered', user: 'Dr. Sarah Wilson', time: '2 hours ago', type: 'doctor' },
    { action: 'System backup completed', user: 'System', time: '4 hours ago', type: 'system' },
    { action: 'Security scan passed', user: 'Security Bot', time: '6 hours ago', type: 'security' },
    { action: 'New patient registered', user: 'John Doe', time: '8 hours ago', type: 'patient' },
  ];

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'View and manage all users',
      icon: <People />,
      color: '#2196f3',
      action: () => navigate('/admin/users')
    },
    {
      title: 'Doctor Management',
      description: 'Oversee doctor registrations',
      icon: <LocalHospital />,
      color: '#4caf50',
      action: () => navigate('/admin/doctors')
    },
    {
      title: 'System Health',
      description: 'Monitor system performance',
      icon: <MonitorHeart />,
      color: '#ff9800',
      action: () => navigate('/admin/system-health')
    },
    {
      title: 'Security Settings',
      description: 'Manage system security',
      icon: <Security />,
      color: '#9c27b0',
      action: () => navigate('/admin/credentials')
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'doctor': return <LocalHospital />;
      case 'patient': return <People />;
      case 'system': return <MonitorHeart />;
      case 'security': return <Security />;
      default: return <Assessment />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'doctor': return '#4caf50';
      case 'patient': return '#2196f3';
      case 'system': return '#ff9800';
      case 'security': return '#9c27b0';
      default: return '#757575';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: 'background.default', minHeight: '100vh' }}>
      {/* Welcome Section */}
      <Box sx={{
        mb: 4,
        p: 3,
        background: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)',
        borderRadius: 3,
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
            Admin Dashboard 🛡️
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
            System overview and management center
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8, mt: 1 }}>
            Welcome back, {user?.firstName || 'Admin'} • {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Typography>
        </Box>
      </Box>

      {/* System Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {systemMetrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{
              height: '100%',
              background: `linear-gradient(135deg, ${metric.color}15 0%, ${metric.color}25 100%)`,
              border: `1px solid ${metric.color}30`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 25px ${metric.color}40`,
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

      {/* Recent Activity and Quick Actions */}
      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Recent System Activity
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Activity</TableCell>
                      <TableCell>User/System</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentActivity.map((activity, index) => (
                      <TableRow key={index} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ 
                              bgcolor: getActivityColor(activity.type), 
                              mr: 2, 
                              width: 32, 
                              height: 32 
                            }}>
                              {getActivityIcon(activity.type)}
                            </Avatar>
                            {activity.action}
                          </Box>
                        </TableCell>
                        <TableCell>{activity.user}</TableCell>
                        <TableCell>{activity.time}</TableCell>
                        <TableCell>
                          <Chip 
                            label={activity.type} 
                            size="small" 
                            sx={{ 
                              bgcolor: `${getActivityColor(activity.type)}20`,
                              color: getActivityColor(activity.type)
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Admin Actions
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

export default AdminDashboard;
