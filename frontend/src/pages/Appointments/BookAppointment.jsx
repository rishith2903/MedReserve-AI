import { useState, useEffect } from 'react';
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
  Container,
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
  Skeleton,
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
import { appointmentsAPI, doctorsAPI } from '../../services/api';
import useRealtimePoll from '../../hooks/useRealtimePoll';

/* removed old wizard component */
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

  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);

  useEffect(() => {
    fetchDoctorDetails();
  }, [doctorId]);

  // Poll available slots every 60s when a date is selected
  useRealtimePoll(() => {
    if (selectedDate) {
      return fetchAvailableSlotsFromApi(selectedDate);
    }
  }, 60000, [selectedDate, doctorId]);

  const fetchDoctorDetails = async () => {
    try {
      setLoadingDoctor(true);
      const response = await doctorsAPI.getById(doctorId);

      const doctorData = {
        id: response.id,
        name: `Dr. ${response.user?.firstName || response.firstName || 'Unknown'} ${response.user?.lastName || response.lastName || 'Doctor'}`,
        specialty: response.specialty || 'General Medicine',
        experience: response.yearsOfExperience || 0,
        rating: response.averageRating || 4.5,
        reviews: response.totalReviews || 0,
        image: response.profileImage || null,
        consultationFee: response.consultationFee || 100,
      };

      setDoctor(doctorData);
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      // Fallback to demo data
      setDoctor({
        id: doctorId,
        name: 'Dr. Sarah Johnson',
        specialty: 'Cardiology',
        experience: 15,
        rating: 4.8,
        reviews: 156,
        image: null,
        consultationFee: 500,
      });
    } finally {
      setLoadingDoctor(false);
    }
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

  // Fetch available time slots from backend API
  const fetchAvailableSlotsFromApi = async (dateObj) => {
    try {
      setLoadingSlots(true);
      const dateParam = dateObj.toISOString().split('T')[0];
      const apiSlots = await appointmentsAPI.getAvailableSlots(doctorId, dateParam);

      // Normalize response: accept ["HH:MM", ...] or [{ time: "HH:MM", available: true }, ...]
      const normalized = (apiSlots || []).map((slot) => {
        const timeStr = typeof slot === 'string' ? slot : slot.time;
        const available = typeof slot === 'string' ? true : slot.available !== false;
        const [hourStr, minuteStr] = (timeStr || '').split(':');
        const hour = parseInt(hourStr || '0', 10);
        const minute = parseInt(minuteStr || '0', 10);
        const display = new Date(2024, 0, 1, hour, minute).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        return { time: timeStr, display, available };
      });

      setAvailableSlots(normalized);
    } catch (err) {
      console.error('Error fetching available slots from API:', err);
      setError('Failed to load available time slots');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlotsFromApi(selectedDate);
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
      // Validate required fields
      if (!selectedDate || !selectedTime || !appointmentType || !chiefComplaint) {
        setError('Please fill in all required fields.');
        return;
      }

      // Prepare appointment data
      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const appointmentData = {
        doctorId: parseInt(doctorId),
        appointmentDateTime: appointmentDateTime.toISOString(),
        appointmentType,
        chiefComplaint,
        symptoms: symptoms || '',
        durationMinutes: 30
      };

      // Call the API to book appointment
      await appointmentsAPI.book(appointmentData);

      setSuccess(true);

      // Navigate to appointments page after successful booking
      setTimeout(() => {
        navigate('/appointments');
      }, 2000);
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.message || 'Failed to book appointment. Please try again.');
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
                  placeholder="Describe any symptoms you&apos;re experiencing"
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
                    secondary={`${doctor?.name || 'Doctor'} - ${doctor?.specialty || 'Specialist'}`}
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
                    secondary={`$${doctor?.consultationFee ?? 0}`}
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

  // Extra safety: if doctor details are still loading or absent, show a full-page skeleton
  if (loadingDoctor || !doctor) {
    return (
      <Box>
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

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Skeleton variant="circular" width={80} height={80} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width={200} height={32} />
                  <Skeleton variant="text" width={120} height={24} />
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Skeleton variant="rounded" width={120} height={24} />
                    <Skeleton variant="rounded" width={160} height={24} />
                    <Skeleton variant="rounded" width={200} height={24} />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Card>
          <CardContent sx={{ p: 4 }}>
            <Skeleton variant="text" width={240} height={28} sx={{ mb: 2 }} />
            <Skeleton variant="rounded" width="100%" height={180} />
          </CardContent>
        </Card>
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
                  <Chip label={`₹${doctor.consultationFee} consultation`} size="small" color="primary" />
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

// ----------------------------------------------
// New, simplified booking flow (replaces above)
// ----------------------------------------------

 

const NewBookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [error, setError] = useState(null);

  const [date, setDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [time, setTime] = useState('');
  const [type, setType] = useState('CONSULTATION');
  const [complaint, setComplaint] = useState('');
  const [sym, setSym] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void loadDoctor();
  }, [doctorId]);

  async function loadDoctor() {
    try {
      setLoadingDoctor(true);
      const res = await doctorsAPI.getById(doctorId);
      setDoctor({
        id: res.id,
        name: `Dr. ${res.user?.firstName || res.firstName || 'Unknown'} ${res.user?.lastName || res.lastName || 'Doctor'}`,
        specialty: res.specialty || 'General Medicine',
        image: res.profileImage || null,
        consultationFee: res.consultationFee || 100,
      });
    } catch (e) {
      setDoctor(null);
      setError('Failed to load doctor details');
    } finally {
      setLoadingDoctor(false);
    }
  }

  useEffect(() => {
    if (!date) return;
    void loadSlots(date);
  }, [date, doctorId]);

  async function loadSlots(d) {
    try {
      setLoadingSlots(true);
      const dateParam = d.toISOString().split('T')[0];
      const apiSlots = await appointmentsAPI.getAvailableSlots(doctorId, dateParam);
      const normalized = (apiSlots || []).map((s) => {
        const timeStr = typeof s === 'string' ? s : s.time;
        const available = typeof s === 'string' ? true : s.available !== false;
        const [hh, mm] = (timeStr || '').split(':');
        const disp = new Date(2024, 0, 1, parseInt(hh || '0', 10), parseInt(mm || '0', 10))
          .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        return { time: timeStr, display: disp, available };
      });
      setSlots(normalized);
    } catch (e) {
      setSlots([]);
      setError('Failed to load available time slots');
    } finally {
      setLoadingSlots(false);
    }
  }

  function mapType(t) {
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
  }

  async function submit() {
    try {
      setSubmitting(true);
      setError(null);
      if (!doctorId || !date || !time || !complaint) {
        setError('Please select date, time, and enter chief complaint.');
        return;
      }
      // Enforce 09:00–21:00 window with 30-minute steps (latest start 20:30)
      const [th, tm] = (time || '').split(':');
      const hhNum = Number(th);
      const mmNum = Number(tm);
      const inRange = (hhNum > 9 || (hhNum === 9 && mmNum >= 0)) && (hhNum < 21 || (hhNum === 21 && mmNum === 0));
      const latestStartOk = (hhNum < 21) && (hhNum < 20 || (hhNum === 20 && (mmNum === 0 || mmNum === 30)));
      const stepOk = (mmNum % 30 === 0);
      if (!inRange || !stepOk || !latestStartOk) {
        setError('Please pick a time between 09:00 and 21:00, aligned to 30-minute steps (latest start 20:30).');
        return;
      }
      const d = new Date(date);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const payload = {
        doctorId: parseInt(doctorId, 10),
        appointmentDateTime: `${yyyy}-${mm}-${dd} ${time}`,
        appointmentType: mapType(type),
        chiefComplaint: complaint,
        symptoms: sym || '',
        durationMinutes: 30,
      };
      const booked = await appointmentsAPI.book(payload);
      try {
        await appointmentsAPI.getAll({ page: 0, size: 10 });
      } catch (_) {}
      navigate('/appointments?refresh=1');
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/doctors')}>Back to Doctors</Button>
      </Box>

      <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>Book Appointment</Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          {loadingDoctor ? (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Skeleton variant="circular" width={64} height={64} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width={220} height={28} />
                <Skeleton variant="text" width={140} height={22} />
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }} src={doctor?.image || undefined}>
                {(doctor?.name || 'U').split(' ').map(n => n[0]).join('')}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{doctor?.name || 'Doctor'}</Typography>
                <Typography variant="body2" color="text.secondary">{doctor?.specialty || 'Specialist'}</Typography>
              </Box>
              <Chip label={`₹${doctor?.consultationFee ?? 0}`} />
            </Box>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Select Date"
                  value={date}
                  onChange={setDate}
                  minDate={new Date()}
                  enableAccessibleFieldDOMStructure={false}
                  slots={{ textField: TextField }}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              {loadingSlots ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={20} />
                </Box>
              ) : (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Available Time Slots</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {slots.map((s, idx) => (
                      <Chip key={`${s.time}-${idx}`} label={s.display}
                        color={time === s.time ? 'primary' : 'default'}
                        variant={s.available ? 'outlined' : 'filled'}
                        disabled={!s.available}
                        onClick={() => s.available && setTime(s.time)} />
                    ))}
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Or pick a custom time
                    </Typography>
                    <TextField
                      type="time"
                      fullWidth
                      value={time || ''}
                      onChange={(e) => setTime(e.target.value)}
                      inputProps={{ step: 1800, min: '09:00', max: '21:00' }}
                    />
                  </Box>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Appointment Type</InputLabel>
                <Select value={type} label="Appointment Type" onChange={(e) => setType(e.target.value)}>
                  <MenuItem value="CONSULTATION">General Consultation</MenuItem>
                  <MenuItem value="ONLINE">Online Consultation</MenuItem>
                  <MenuItem value="FOLLOW_UP">Follow-up Visit</MenuItem>
                  <MenuItem value="EMERGENCY">Emergency</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth required label="Chief Complaint" value={complaint} onChange={(e)=>setComplaint(e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Symptoms (Optional)" value={sym} onChange={(e)=>setSym(e.target.value)} multiline rows={3} />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" onClick={()=>navigate('/doctors')}>Cancel</Button>
                <Button variant="contained" onClick={submit} disabled={submitting || !date || !time} startIcon={submitting && <CircularProgress size={16} />}>
                  {submitting ? 'Booking…' : 'Book Appointment'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default NewBookAppointment;
