/* eslint-disable no-console */
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Skeleton,
  Alert,
  Button,
  CircularProgress
} from '@mui/material';
import {
  HealthAndSafety,
  FitnessCenter,
  Restaurant,
  Bedtime,
  Psychology,
  LocalHospital,
  Refresh
} from '@mui/icons-material';
import { healthTipsAPI } from '../../services/api';
import useRealtimePoll from '../../hooks/useRealtimePoll';

const HealthTips = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHealthTips();
  }, []);

  // Refresh health tips every 60s
  useRealtimePoll(async () => {
    await fetchHealthTips();
  }, 60000, []);

  const fetchHealthTips = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch personalized health tips
      const response = await healthTipsAPI.getPersonalized();
      console.log('Health tips API response:', response);

      // Transform backend data to frontend format
      const tipsData = response.tips || response.data || response || [];
      const transformedTips = tipsData.map((tip, index) => ({
        id: tip.id || index + 1,
        category: tip.category || 'General Health',
        tip: tip.tip || tip.content || tip.message,
        importance: tip.importance || 'Medium',
        icon: getCategoryIcon(tip.category || 'General Health'),
        color: getCategoryColor(tip.category || 'General Health')
      }));

      console.log('Transformed tips:', transformedTips);

      if (transformedTips.length === 0) {
        // Fallback to demo tips
        setTips(getDemoTips());
        setError('No personalized tips available. Showing general health tips.');
      } else {
        setTips(transformedTips);
      }

    } catch (err) {
      console.error('Error fetching health tips:', err);
      setError('Failed to load health tips. Showing demo tips.');
      setTips(getDemoTips());
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'exercise':
      case 'fitness':
        return <FitnessCenter />;
      case 'nutrition':
      case 'diet':
        return <Restaurant />;
      case 'sleep':
        return <Bedtime />;
      case 'mental health':
      case 'stress':
        return <Psychology />;
      case 'medical':
        return <LocalHospital />;
      default:
        return <HealthAndSafety />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case 'exercise':
      case 'fitness':
        return '#4caf50';
      case 'nutrition':
      case 'diet':
        return '#ff9800';
      case 'sleep':
        return '#9c27b0';
      case 'mental health':
      case 'stress':
        return '#2196f3';
      case 'medical':
        return '#f44336';
      default:
        return '#607d8b';
    }
  };

  const getImportanceColor = (importance) => {
    switch (importance.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getDemoTips = () => [
    {
      id: 1,
      category: 'General Health',
      tip: 'Stay hydrated by drinking at least 8 glasses of water daily',
      importance: 'High',
      icon: <HealthAndSafety />,
      color: '#607d8b'
    },
    {
      id: 2,
      category: 'Exercise',
      tip: 'Aim for at least 30 minutes of moderate exercise 5 days a week',
      importance: 'High',
      icon: <FitnessCenter />,
      color: '#4caf50'
    },
    {
      id: 3,
      category: 'Nutrition',
      tip: 'Include a variety of fruits and vegetables in your daily diet',
      importance: 'Medium',
      icon: <Restaurant />,
      color: '#ff9800'
    },
    {
      id: 4,
      category: 'Sleep',
      tip: 'Maintain a consistent sleep schedule with 7-9 hours of sleep nightly',
      importance: 'High',
      icon: <Bedtime />,
      color: '#9c27b0'
    },
    {
      id: 5,
      category: 'Mental Health',
      tip: 'Practice stress management techniques like meditation or deep breathing',
      importance: 'Medium',
      icon: <Psychology />,
      color: '#2196f3'
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Health Tips
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Personalized health tips and wellness advice to help you stay healthy.
      </Typography>

      {error && (
        <Alert severity="info" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Your Health Tips
        </Typography>
        <Button
          variant="outlined"
          startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
          onClick={fetchHealthTips}
          disabled={loading}
          aria-label="Refresh health tips"
        >
          Refresh Tips
        </Button>
      </Box>

      <Grid container spacing={3}>
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                    <Skeleton variant="text" width={100} height={24} />
                  </Box>
                  <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="80%" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          tips.map((tip) => (
            <Grid item xs={12} md={6} lg={4} key={tip.id}>
              <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: tip.color, mr: 2 }}>
                      {tip.icon}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                        {tip.category}
                      </Typography>
                      <Chip
                        label={tip.importance}
                        size="small"
                        color={getImportanceColor(tip.importance)}
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {tip.tip}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default HealthTips;
