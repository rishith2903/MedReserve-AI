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
  Chip
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

      const appointmentData = {
        doctorId: parseInt(doctorId),
        appointmentDate: formData.appointmentDate.toISOString().split('T')[0],
        appointmentTime: formData.appointmentTime,
        appointmentType: formData.appointmentType,
        chiefComplaint: formData.chiefComplaint,
        symptoms: formData.symptoms
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
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
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
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={24} />
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
                  required
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
                  placeholder="Describe any symptoms you're experiencing"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading || !formData.appointmentTime || success}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Booking...' : 'Book Appointment'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default RealTimeBooking;
