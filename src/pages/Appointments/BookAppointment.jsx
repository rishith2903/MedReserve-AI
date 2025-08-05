import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Chip,
  Alert,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  Person,
  Description,
  CheckCircle,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentsAPI } from '../../services/api';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form data
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptoms, setSymptoms] = useState('');

  // Available slots
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Doctor info (mock data for now)
  const doctor = {
    id: doctorId,
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    experience: 15,
    rating: 4.8,
    reviews: 156,
    image: null,
    consultationFee: 150,
  };

  const appointmentTypes = [
    { value: 'CONSULTATION', label: 'General Consultation' },
    { value: 'FOLLOW_UP', label: 'Follow-up Visit' },
    { value: 'EMERGENCY', label: 'Emergency Consultation' },
    { value: 'ROUTINE_CHECKUP', label: 'Routine Checkup' },
  ];

  const steps = [
    'Select Date & Time',
    'Appointment Details',
    'Review & Confirm'
  ];

  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(2024, 0, 1, hour, minute).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });

        // Simulate some slots being unavailable
        const isAvailable = Math.random() > 0.3;

        slots.push({
          time: timeString,
          display: displayTime,
          available: isAvailable
        });
      }
    }
    return slots;
  };

  useEffect(() => {
    if (selectedDate) {
      setLoadingSlots(true);
      // Simulate API call delay
      setTimeout(() => {
        setAvailableSlots(generateTimeSlots());
        setLoadingSlots(false);
      }, 1000);
    }
  }, [selectedDate]);

  const handleNext = () => {
    if (activeStep === 0 && (!selectedDate || !selectedTime)) {
      setError('Please select both date and time');
      return;
    }
    if (activeStep === 1 && (!appointmentType || !chiefComplaint)) {
      setError('Please fill in all required fields');
      return;
    }

    setError(null);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleBookAppointment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In real implementation, call the API:
      // const appointmentData = {
      //   doctorId: parseInt(doctorId),
      //   appointmentDateTime: `${selectedDate.toISOString().split('T')[0]} ${selectedTime}`,
      //   appointmentType,
      //   chiefComplaint,
      //   symptoms,
      //   durationMinutes: 30
      // };
      // await appointmentsAPI.book(appointmentData);

      setSuccess(true);
    } catch (err) {
      setError('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Select Date & Time
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Select Date"
                    value={selectedDate}
                    onChange={setSelectedDate}
                    minDate={new Date()}
                    maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 days from now
                    enableAccessibleFieldDOMStructure={false}
                    slots={{
                      textField: TextField
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} md={6}>
                {selectedDate && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                      Available Time Slots
                    </Typography>
                    {loadingSlots ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : (
                      <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                        <Grid container spacing={1}>
                          {availableSlots.map((slot) => (
                            <Grid item xs={6} sm={4} key={slot.time}>
                              <Button
                                fullWidth
                                variant={selectedTime === slot.time ? 'contained' : 'outlined'}
                                disabled={!slot.available}
                                onClick={() => setSelectedTime(slot.time)}
                                size="small"
                                sx={{ py: 1 }}
                              >
                                {slot.display}
                              </Button>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Appointment Details
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Appointment Type</InputLabel>
                  <Select
                    value={appointmentType}
                    label="Appointment Type"
                    onChange={(e) => setAppointmentType(e.target.value)}
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
                <TextField
                  fullWidth
                  required
                  label="Chief Complaint"
                  placeholder="Brief description of your main concern"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Symptoms (Optional)"
                  placeholder="Describe any symptoms you're experiencing"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Review & Confirm
            </Typography>

            <Paper sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Doctor"
                    secondary={`${doctor.name} - ${doctor.specialty}`}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Date & Time"
                    secondary={`${selectedDate?.toLocaleDateString()} at ${availableSlots.find(s => s.time === selectedTime)?.display}`}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Appointment Type"
                    secondary={appointmentTypes.find(t => t.value === appointmentType)?.label}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Chief Complaint"
                    secondary={chiefComplaint}
                  />
                </ListItem>
                {symptoms && (
                  <>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Symptoms"
                        secondary={symptoms}
                      />
                    </ListItem>
                  </>
                )}
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Consultation Fee"
                    secondary={`$${doctor.consultationFee}`}
                  />
                </ListItem>
              </List>
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  if (success) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Appointment Booked Successfully!
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Your appointment with {doctor.name} has been confirmed for{' '}
          {selectedDate?.toLocaleDateString()} at{' '}
          {availableSlots.find(s => s.time === selectedTime)?.display}.
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          You will receive a confirmation email shortly with appointment details.
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={() => navigate('/appointments')}
          >
            View My Appointments
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/doctors')}
          sx={{ mb: 2 }}
        >
          Back to Doctors
        </Button>

        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Book Appointment
        </Typography>

        {/* Doctor Info Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar
                sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}
                src={doctor.image}
              >
                {doctor.name.split(' ').map(n => n[0]).join('')}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {doctor.name}
                </Typography>
                <Typography variant="subtitle1" color="primary">
                  {doctor.specialty}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Chip label={`${doctor.experience} years exp.`} size="small" />
                  <Chip label={`${doctor.rating}★ (${doctor.reviews} reviews)`} size="small" />
                  <Chip label={`$${doctor.consultationFee} consultation`} size="small" color="primary" />
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stepper */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                <StepContent>
                  <Box sx={{ py: 2 }}>
                    {renderStepContent(index)}
                  </Box>
                  <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      startIcon={<ArrowBack />}
                    >
                      Back
                    </Button>
                    {index === steps.length - 1 ? (
                      <Button
                        variant="contained"
                        onClick={handleBookAppointment}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={16} /> : <CheckCircle />}
                      >
                        {loading ? 'Booking...' : 'Confirm Booking'}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        endIcon={<ArrowForward />}
                      >
                        Next
                      </Button>
                    )}
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BookAppointment;
