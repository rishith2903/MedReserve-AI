/* eslint-disable no-console */
import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
} from '@mui/material';
import {
  Event,
  Person,
  AccessTime,
  LocationOn,
  Phone,
  Email,
  Cancel,
  Update,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentsAPI } from '../../services/api';
import realTimeDataService from '../../services/realTimeDataService';
import useRealtimePoll from '../../hooks/useRealtimePoll';

const MyAppointments = () => {
  const { user } = useAuth();
  const theme = useTheme();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleDialog, setRescheduleDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [newDateTime, setNewDateTime] = useState(null);

  // Enhanced fallback appointments data (used only when API fails)
  const getFallbackAppointments = () => {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return [
      {
        id: 1,
        doctorName: 'Dr. Sarah Johnson',
        specialty: 'Cardiology',
        date: tomorrow.toLocaleDateString(),
        time: '10:00 AM',
        status: 'CONFIRMED',
        type: 'CONSULTATION',
        location: 'MedReserve Medical Center - Cardiology Wing',
        phone: '+1 (555) 123-4567',
        email: 'sarah.johnson@medreserve.com',
        notes: 'Regular cardiac checkup and consultation'
      },
      {
        id: 2,
        doctorName: 'Dr. Michael Chen',
        specialty: 'Dermatology',
        date: nextWeek.toLocaleDateString(),
        time: '2:30 PM',
        status: 'PENDING',
        type: 'FOLLOW_UP',
        location: 'MedReserve Medical Center - Dermatology Clinic',
        phone: '+1 (555) 987-6543',
        email: 'michael.chen@medreserve.com',
        notes: 'Follow-up appointment for skin condition treatment'
      },
      {
        id: 3,
        doctorName: 'Dr. Emily Rodriguez',
        specialty: 'Neurology',
        date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        time: '9:15 AM',
        status: 'COMPLETED',
        type: 'CONSULTATION',
        location: 'MedReserve Medical Center - Neurology Department',
        phone: '+1 (555) 456-7890',
        email: 'emily.rodriguez@medreserve.com',
        notes: 'Neurological consultation for recurring headaches'
      }
    ];
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useRealtimePoll(async () => {
    await fetchAppointments();
  }, 60000, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      setError(null);

      console.log('🔄 Fetching appointments using real-time data service...');
      const appointmentsData = await realTimeDataService.fetchAppointments();

      setAppointments(appointmentsData);
      console.log('✅ Successfully loaded appointments:', appointmentsData.length);

      if (appointmentsData.length <= 2) {
        setError('Showing demo appointments. Book real appointments to see them here.');
      }

    } catch (err) {
      console.error('❌ Error fetching appointments:', err);
      setError('Failed to load appointments from server. Showing sample data for demonstration.');

      // Fallback to enhanced demo data if API fails
      setAppointments(getFallbackAppointments());
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'COMPLETED':
        return 'info';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle />;
      case 'PENDING':
        return <Schedule />;
      case 'COMPLETED':
        return <CheckCircle />;
      case 'CANCELLED':
        return <Cancel />;
      default:
        return <Event />;
    }
  };

  const handleReschedule = async () => {
    if (!newDateTime || !selectedAppointment) return;

    try {
      // Call the API to reschedule appointment
      await appointmentsAPI.reschedule(selectedAppointment.id, newDateTime.toISOString());

      // Update local state
      setAppointments(prev => prev.map(apt =>
        apt.id === selectedAppointment.id
          ? { ...apt, date: newDateTime.toDateString(), time: newDateTime.toLocaleTimeString() }
          : apt
      ));

      setRescheduleDialog(false);
      setSelectedAppointment(null);
      setNewDateTime(null);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Reschedule error:', err);
      setError(err.response?.data?.message || 'Failed to reschedule appointment');
    }
  };

  const handleCancel = async () => {
    if (!selectedAppointment) return;

    try {
      // Call the API to cancel appointment
      await appointmentsAPI.cancel(selectedAppointment.id);

      // Update local state
      setAppointments(prev => prev.map(apt =>
        apt.id === selectedAppointment.id
          ? { ...apt, status: 'CANCELLED' }
          : apt
      ));

      setCancelDialog(false);
      setSelectedAppointment(null);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Cancel error:', err);
      setError(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  if (loading) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Skeleton width={260} height={40} sx={{ mb: 1 }} />
          <Skeleton width={420} height={24} />
        </Box>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={12} md={6} lg={4} key={i}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Skeleton width={100} height={28} />
                    <Skeleton width={60} height={20} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton width="70%" height={24} />
                      <Skeleton width="40%" height={20} />
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Skeleton width="60%" height={20} sx={{ mb: 1 }} />
                  <Skeleton width="40%" height={20} sx={{ mb: 1 }} />
                  <Skeleton width="50%" height={20} />
                  <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                    <Skeleton width={120} height={36} />
                    <Skeleton width={140} height={36} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          My Appointments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage your upcoming and past appointments
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Appointments List */}
      <Grid container spacing={3}>
        {appointments.map((appointment) => (
          <Grid item xs={12} md={6} lg={4} key={appointment.id}>
            <Card
              sx={{
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Status and Type */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip
                    icon={getStatusIcon(appointment.status)}
                    label={appointment.status}
                    color={getStatusColor(appointment.status)}
                    size="small"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {appointment.type}
                  </Typography>
                </Box>

                {/* Doctor Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {appointment.doctorName}
                    </Typography>
                    <Typography variant="body2" color="primary">
                      {appointment.specialty}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Appointment Details */}
                <Box sx={{ space: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Event sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {appointment.date}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {appointment.time}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {appointment.location}
                    </Typography>
                  </Box>

                  {appointment.notes && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                      &quot;{appointment.notes}&quot;
                    </Typography>
                  )}
                </Box>

                {/* Action Buttons */}
                {appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED' && (
                  <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Update />}
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setRescheduleDialog(true);
                      }}
                      sx={{ flex: 1 }}
                    >
                      Reschedule
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<Cancel />}
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setCancelDialog(true);
                      }}
                      sx={{ flex: 1 }}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {appointments.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Event sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Appointments Found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            You don&apos;t have any appointments scheduled yet.
          </Typography>
          <Button variant="contained" href="/doctors">
            Book Your First Appointment
          </Button>
        </Box>
      )}

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialog} onClose={() => setRescheduleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reschedule Appointment</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Select a new date and time for your appointment with {selectedAppointment?.doctorName}.
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="New Date & Time"
              value={newDateTime}
              onChange={setNewDateTime}
              minDateTime={new Date()}
              enableAccessibleFieldDOMStructure={false}
              slots={{
                textField: TextField
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  sx: { mt: 2 }
                }
              }}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRescheduleDialog(false)}>Cancel</Button>
          <Button
            onClick={handleReschedule}
            variant="contained"
            disabled={!newDateTime}
          >
            Reschedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)}>
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel your appointment with {selectedAppointment?.doctorName}
            on {selectedAppointment?.date} at {selectedAppointment?.time}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog(false)}>Keep Appointment</Button>
          <Button onClick={handleCancel} color="error" variant="contained">
            Cancel Appointment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyAppointments;
