/* eslint-disable react/prop-types */
/* eslint-disable no-console */
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Box,
  Chip,
  Skeleton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { appointmentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const RealTimeBooking = ({ open, onClose, doctorId, doctorName, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    appointmentDate: new Date(),
    appointmentTime: '',
    appointmentType: 'CONSULTATION',
    chiefComplaint: '',
    symptoms: ''
  });

  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const appointmentTypes = [
    { value: 'CONSULTATION', label: 'General Consultation' },
    { value: 'FOLLOW_UP', label: 'Follow-up Visit' },
    { value: 'EMERGENCY', label: 'Emergency' },
    { value: 'ONLINE', label: 'Online Consultation' }
  ];

  useEffect(() => {
    if (open && doctorId && formData.appointmentDate) {
      fetchAvailableSlots();
    }
  }, [open, doctorId, formData.appointmentDate]);

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      // Generate time slots (this would normally come from the backend)
      const slots = [];
      for (let hour = 9; hour <= 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push({
            time: timeStr,
            available: Math.random() > 0.3 // Random availability for demo
          });
        }
      }
      
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setError('Failed to load available time slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please log in to book an appointment');
      return;
    }

    if (!formData.appointmentTime) {
      setError('Please select an appointment time');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Build 'yyyy-MM-dd HH:mm' from selected date and time
      const d = formData.appointmentDate;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hhmm = formData.appointmentTime; // already HH:mm

      // Map UI type to backend enum
      const mapType = (t) => {
        switch (t) {
          case 'ONLINE':
            return 'ONLINE';
          case 'FOLLOW_UP':
            return 'FOLLOW_UP';
          case 'EMERGENCY':
            return 'EMERGENCY';
          case 'CONSULTATION':
          default:
            return 'IN_PERSON';
        }
      };

      const appointmentData = {
        doctorId: parseInt(doctorId),
        appointmentDateTime: `${yyyy}-${mm}-${dd} ${hhmm}`,
        appointmentType: mapType(formData.appointmentType),
        chiefComplaint: formData.chiefComplaint,
        symptoms: formData.symptoms,
        durationMinutes: 30,
      };

      console.log('Booking appointment:', appointmentData);

      const response = await appointmentsAPI.book(appointmentData);
      console.log('Appointment booked:', response);

      setSuccess(true);
      
      // Call success callback to refresh appointments list
      if (onSuccess) {
        onSuccess(response);
      }

      // Close dialog after 2 seconds
      setTimeout(() => {
        onClose();
        setSuccess(false);
        resetForm();
      }, 2000);

    } catch (error) {
      console.error('Error booking appointment:', error);
      setError(error.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      appointmentDate: new Date(),
      appointmentTime: '',
      appointmentType: 'CONSULTATION',
      chiefComplaint: '',
      symptoms: ''
    });
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth aria-labelledby="booking-dialog-title">
        <DialogTitle id="booking-dialog-title">
          Book Appointment with {doctorName}
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Appointment booked successfully! You will receive a confirmation email.
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Appointment Date"
                  value={formData.appointmentDate}
                  onChange={(newValue) => setFormData(prev => ({ ...prev, appointmentDate: newValue }))}
                  minDate={new Date()}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Appointment Type</InputLabel>
                  <Select
                    value={formData.appointmentType}
                    label="Appointment Type"
                    onChange={(e) => setFormData(prev => ({ ...prev, appointmentType: e.target.value }))}
                  >
                    {appointmentTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Available Time Slots
                </Typography>
                
                {loadingSlots ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }} aria-label="Loading available time slots">
                    {[...Array(8)].map((_, i) => (
                      <Skeleton key={i} variant="rounded" width={80} height={32} />
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {availableSlots.map((slot) => (
                      <Chip
                        key={slot.time}
                        label={slot.time}
                        clickable={slot.available}
                        color={formData.appointmentTime === slot.time ? 'primary' : 'default'}
                        variant={slot.available ? 'outlined' : 'filled'}
                        disabled={!slot.available}
                        onClick={() => slot.available && setFormData(prev => ({ ...prev, appointmentTime: slot.time }))}
                        sx={{
                          opacity: slot.available ? 1 : 0.5,
                          cursor: slot.available ? 'pointer' : 'not-allowed'
                        }}
                        aria-label={slot.available ? `Select time ${slot.time}` : `Time ${slot.time} unavailable`}
                        aria-pressed={formData.appointmentTime === slot.time}
                      />
                    ))}
                  </Box>
                )}
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Chief Complaint"
                  value={formData.chiefComplaint}
                  onChange={(e) => setFormData(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                  placeholder="Brief description of your main concern"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Symptoms (Optional)"
                  value={formData.symptoms}
                  onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                  placeholder="Describe any symptoms you&apos;re experiencing"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading} aria-label="Cancel booking">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading || !formData.appointmentTime || success}
            startIcon={loading && <CircularProgress size={20} />}
            aria-label="Confirm booking"
          >
            {loading ? 'Booking...' : 'Book Appointment'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default RealTimeBooking;
