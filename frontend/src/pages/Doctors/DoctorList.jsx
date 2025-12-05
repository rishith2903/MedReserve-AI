import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Alert,
  CircularProgress,
  Skeleton
} from '@mui/material';
import {
  Search,
  LocationOn,
  Star,
  CalendarToday,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import realTimeDataService from '../../services/realTimeDataService';
import useRealtimePoll from '../../hooks/useRealtimePoll';

const DoctorList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState(['All']);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchDoctors();
    fetchSpecialties();

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      if (!loading && !isRefreshing) {
        handleRefresh();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useRealtimePoll(async () => {
    if (!loading && !isRefreshing) {
      await handleRefresh();
    }
  }, 60000, [loading, isRefreshing]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchDoctors(), fetchSpecialties()]);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching doctors using real-time data service...');
      const doctorsData = await realTimeDataService.fetchDoctors();

      setDoctors(doctorsData);
      setLastUpdated(new Date());
      console.log('✅ Successfully loaded doctors:', doctorsData.length);

      if (doctorsData.length > 50) {
        setError('Showing enhanced doctor database with real-time availability updates.');
      }

    } catch (error) {
      console.error('❌ Error fetching doctors:', error);
      setError('Failed to load doctors. Please try again.');

      // This shouldn't happen as the service has built-in fallbacks
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/doctors/specialties`);
      if (response.ok) {
        const specialtiesData = await response.json();
        setSpecialties(['All', ...specialtiesData]);
      }
    } catch (error) {
      console.error('Error fetching specialties:', error);
      // Fallback specialties
      setSpecialties(['All', 'Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Psychiatry']);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === '' || selectedSpecialty === 'All' ||
                            doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Find Doctors
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Browse our qualified healthcare professionals
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading && (
        <>
          <Grid container spacing={3} sx={{ mb: 2 }}>
            {[...Array(6)].map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Skeleton variant="circular" width={60} height={60} sx={{ mr: 2 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Skeleton width="60%" height={28} />
                        <Skeleton width="40%" height={20} />
                      </Box>
                    </Box>
                    <Skeleton width="80%" height={20} sx={{ mb: 1 }} />
                    <Skeleton width="50%" height={20} sx={{ mb: 1 }} />
                    <Skeleton width="70%" height={20} sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Skeleton width={80} height={32} />
                      <Skeleton width={90} height={36} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Search and Filter */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search doctors by name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'background.paper'
              }
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Filter by Specialty</InputLabel>
            <Select
              value={selectedSpecialty}
              label="Filter by Specialty"
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              sx={{
                borderRadius: 2,
                backgroundColor: 'background.paper'
              }}
            >
              {specialties.map((specialty) => (
                <MenuItem key={specialty} value={specialty === 'All' ? '' : specialty}>
                  {specialty}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            sx={{
              height: '56px',
              borderRadius: 2,
              borderColor: 'primary.main',
              '&:hover': {
                borderColor: 'primary.dark',
                backgroundColor: 'primary.50'
              }
            }}
          >
            {(loading || isRefreshing) ? <CircularProgress size={24} /> : 'Refresh'}
          </Button>
        </Grid>
      </Grid>

      {/* Results Summary */}
      {!loading && (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            {filteredDoctors.length === 0
              ? 'No doctors found matching your criteria'
              : `Showing ${filteredDoctors.length} doctor${filteredDoctors.length !== 1 ? 's' : ''}`
            }
            {selectedSpecialty && ` in ${selectedSpecialty}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </Typography>
          {lastUpdated && (
            <Typography variant="caption" color="text.secondary">
              Last updated: {lastUpdated.toLocaleTimeString()}
              {isRefreshing && ' (refreshing...)'}
            </Typography>
          )}
        </Box>
      )}

      {/* Doctors Grid */}
      <Grid container spacing={3}>
        {filteredDoctors.map((doctor) => (
          <Grid item xs={12} sm={6} md={4} key={doctor.id}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => navigate(`/doctors/${doctor.id}`)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{ width: 60, height: 60, mr: 2, bgcolor: 'primary.main' }}
                    src={doctor.image}
                  >
                    {doctor.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {doctor.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {doctor.specialty}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={Math.round((Number(doctor.rating ?? 0)) * 100) / 100} precision={0.1} size="small" readOnly />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {Number(doctor.rating ?? 0).toFixed(2)} ({doctor.reviews} reviews)
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {typeof doctor.experience === 'number' ? `${doctor.experience} years` : doctor.experience} experience
                  </Typography>

                  <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 600 }}>
                    ₹{doctor.consultationFee} consultation fee
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {doctor.location}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    label={doctor.availability}
                    size="small"
                    color={doctor.availability.includes('Today') ? 'success' : 'warning'}
                    variant="outlined"
                  />
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<CalendarToday />}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/book-appointment/${doctor.id}`);
                    }}
                  >
                    Book
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredDoctors.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No doctors found matching your criteria
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filter options
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DoctorList;
