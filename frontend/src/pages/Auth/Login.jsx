import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import { Tooltip } from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  LocalHospital,
  Person,
  AdminPanelSettings,
  PlayArrow
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

// Check for success message from signup
useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location.state]);

// Show session expired message if set by API client
useEffect(() => {
    const msg = localStorage.getItem('sessionMsg');
    if (msg) {
      setError(msg);
      localStorage.removeItem('sessionMsg');
    }
  }, []);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Pre-fill email if coming from signup
useEffect(() => {
    if (location.state?.email) {
      setValue('email', location.state.email);
    }
  }, [location.state, setValue]);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      await login(data);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    {
      role: 'Patient',
      email: 'patient@medreserve.com',
      password: 'password123',
      icon: <Person />,
      color: 'primary'
    },
    {
      role: 'Doctor',
      email: 'doctor@medreserve.com',
      password: 'password123',
      icon: <LocalHospital />,
      color: 'secondary'
    },
    {
      role: 'Admin',
      email: 'admin@medreserve.com',
      password: 'password123',
      icon: <AdminPanelSettings />,
      color: 'error'
    }
  ];

  const handleDemoLogin = (credentials) => {
    onSubmit(credentials);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 3,
        }}
      >
        {/* Logo and Title */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <LocalHospital sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} aria-hidden />
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            MedReserve AI
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Advanced Healthcare Management Platform
          </Typography>
        </Box>

        <Card sx={{ width: '100%', maxWidth: 500 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
              Sign In
            </Typography>

            {successMessage && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {successMessage}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    margin="normal"
                    required
                    fullWidth
                    label="Email Address"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    margin="normal"
                    required
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">
                  Don&apos;t have an account?{' '}
                  <Link to="/signup" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Button variant="text" size="small">
                      Sign Up
                    </Button>
                  </Link>
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Demo Accounts
              </Typography>
            </Divider>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {demoCredentials.map((cred) => (
                <Tooltip key={cred.role} title={`Login as ${cred.role}`} arrow>
                  <Button
                  key={cred.role}
                  variant="outlined"
                  color={cred.color}
                  startIcon={cred.icon}
                  endIcon={<PlayArrow />}
                  onClick={() => handleDemoLogin({ email: cred.email, password: cred.password })}
                  sx={{ justifyContent: 'space-between' }}
                >
                  <span>Login as {cred.role}</span>
                  </Button>
                </Tooltip>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Login;
