import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Grid,
  Rating,
  Skeleton,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  CalendarToday,
  LocationOn,
  School,
  Work,
} from '@mui/icons-material';
import { doctorsAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import useRealtimePoll from '../../hooks/useRealtimePoll';

const DoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDoctorDetails();
  }, [id]);

  // Poll doctor details every 60s
  useRealtimePoll(fetchDoctorDetails, 60000, [id]);

  async function fetchDoctorDetails() {
    try {
      setLoading(true);
      setError(null);

      // Fetch doctor details from API
      const response = await doctorsAPI.getById(id);
      console.log('Doctor details response:', response);

      // Transform backend data to frontend format
      const doctorData = {
        id: response.id,
        name: `Dr. ${response.user?.firstName || response.firstName || 'Unknown'} ${response.user?.lastName || response.lastName || 'Doctor'}`,
        specialty: response.specialty || 'General Medicine',
        experience: response.yearsOfExperience || 0,
        rating: response.averageRating || 4.5,
        reviews: response.totalReviews || 0,
        location: response.clinicAddress || response.hospitalAffiliation || 'MedReserve Clinic',
        education: response.qualification || 'MD',
        about: response.biography || 'Experienced healthcare professional dedicated to providing quality care.',
        services: response.services || ['General Consultation', 'Health Checkup', 'Medical Advice'],
        availability: response.isAvailable ? 'Available Today' : 'Not Available',
        image: response.profileImage || null,
        consultationFee: response.consultationFee || 100,
        phone: response.user?.phoneNumber || '+91 (555) 123-4567',
        email: response.user?.email || 'doctor@medreserve.com'
      };

      setDoctor(doctorData);

    } catch (error) {
      console.error('Error fetching doctor details:', error);
      setError('Failed to load doctor details');

      // Fallback to demo data
      setDoctor({
        id: parseInt(id) || 1,
        name: 'Dr. Rajesh Kumar',
        specialty: 'Cardiology',
        experience: 15,
        rating: 4.8,
        reviews: 124,
        location: 'Building A, Floor 3',
        education: 'MBBS, MD - Cardiology',
        about: 'Dr. Rajesh Kumar is a highly experienced cardiologist with over 15 years of practice. He specializes in interventional cardiology and has performed numerous successful cardiac procedures.',
        services: ['Cardiac Catheterization', 'Echocardiography', 'Stress Testing', 'Pacemaker Implantation'],
        availability: 'Available Today',
        image: null,
        consultationFee: 150
      });
    } finally {
      setLoading(false);
    }
  }


  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                  <Skeleton variant="circular" width={120} height={120} sx={{ mb: 2 }} />
                  <Skeleton variant="text" width={200} height={32} />
                  <Skeleton variant="text" width={150} height={24} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width={300} height={40} sx={{ mb: 2 }} />
                <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="80%" height={20} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!doctor) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Doctor not found
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{ width: 150, height: 150, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}
                  src={doctor?.image || undefined}
                >
                  {(doctor?.name || 'U').split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                  {doctor?.name || 'Doctor'}
                </Typography>
                <Typography variant="h6" color="primary" gutterBottom>
                  {doctor?.specialty || 'Specialist'}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                  <Rating value={Math.round(doctor?.rating ?? 0)} precision={1} readOnly />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {Math.round(doctor?.rating ?? 0)} ({doctor?.reviews ?? 0} reviews)
                  </Typography>
                </Box>
                <Chip
                  label={doctor?.availability || 'Availability Unknown'}
                  color="success"
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CalendarToday />}
                  fullWidth
                aria-label={`Book appointment with ${doctor?.name || 'Doctor'}`}
                onClick={() => navigate(`/book-appointment/${doctor?.id || id}`)}
                >
                  Book Appointment
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                About Dr. {(doctor?.name || 'Doctor').split(' ')[1] || (doctor?.name || 'Doctor')}
              </Typography>
              <Typography variant="body1" paragraph>
                {doctor?.about || 'Experienced healthcare professional dedicated to providing quality care.'}
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Professional Details
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Work sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {doctor?.experience ?? 0} years of experience
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <School sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {doctor?.education || 'MD'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {doctor?.location || 'MedReserve Clinic'}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Services Offered
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {(doctor?.services || []).map((service, index) => (
                    <Chip
                      key={index}
                      label={service}
                      variant="outlined"
                      color="primary"
                    />
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DoctorDetail;
