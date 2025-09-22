import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import { Tooltip } from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  LocalHospital,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { validationMessages, INDIA_PHONE_REGEX, STRONG_PASSWORD_REGEX } from '../../utils/validation';
import { normalizePayload } from '../../utils/normalize';
import { useAuth } from '../../contexts/AuthContext';

const schema = yup.object({
  firstName: yup.string().trim().min(2, 'First name must be at least 2 characters').required('First name is required'),
  lastName: yup.string().trim().min(2, 'Last name must be at least 2 characters').required('Last name is required'),
  email: yup.string().trim().email('Invalid email').required('Email is required'),
  phoneNumber: yup
    .string()
    .matches(INDIA_PHONE_REGEX, validationMessages.phoneIndia)
    .required('Phone number is required'),
  password: yup
    .string()
    .matches(STRONG_PASSWORD_REGEX, validationMessages.passwordStrong)
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [topError, setTopError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordValue, setPasswordValue] = useState('');

  const {
    control,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      role: 'PATIENT',
    },
  });

  const computePasswordStrength = (val) => {
    const v = val || '';
    let score = 0;
    if (v.length >= 8) score += 1;
    if (/[A-Z]/.test(v)) score += 1;
    if (/[a-z]/.test(v)) score += 1;
    if (/\d/.test(v)) score += 1;
    if (/[@$!%*?&]/.test(v)) score += 1;
    // Cap at 4 for UI scale (length + 3 categories + special -> 5). We map 0-4.
    return Math.min(4, score);
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setTopError(null);
      const { confirmPassword, ...signupData } = data;

      // Normalize and sanitize payload
      const normalized = normalizePayload(signupData);

      const response = await signup(normalized);

      // Signup successful, redirect to login
      navigate('/login', {
        state: {
          message: response.message || 'Account created successfully! Please log in.',
          email: signupData.email
        }
      });
    } catch (err) {
      const data = err?.response?.data;

      // Map server-side validation errors to fields using shared utility
      try {
        const { applyServerValidationErrors, extractServerMessage } = await import('../../utils/errorMap');
        applyServerValidationErrors(
          setError,
          setFocus,
          data,
          ['firstName','lastName','email','phoneNumber','password','confirmPassword']
        );
        setTopError(extractServerMessage(err));
      } catch (_) {
        const msg = data?.message || err?.message || 'Signup failed. Please try again.';
        setTopError(msg);
      }
    } finally {
      setIsLoading(false);
    }
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
            Join our healthcare platform
          </Typography>
        </Box>

        <Card sx={{ width: '100%', maxWidth: 500 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
              Sign Up
            </Typography>

            {topError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {topError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      margin="normal"
                      required
                      fullWidth
                      label="First Name"
                      autoFocus
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />

                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      margin="normal"
                      required
                      fullWidth
                      label="Last Name"
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message}
                    />
                  )}
                />
              </Box>

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
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    margin="normal"
                    required
                    fullWidth
                    label="Phone Number"
                    type="tel"
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber?.message || 'Use Indian +91 format, e.g., +919876543210'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone />
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
                  <Box>
                    <TextField
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        const val = e.target.value;
                        setPasswordValue(val);
                        setPasswordStrength(computePasswordStrength(val));
                      }}
                      margin="normal"
                      required
                      fullWidth
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      error={!!errors.password}
                      helperText={errors.password?.message || validationMessages.passwordStrong}
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
                    {passwordValue && (
                      <Box sx={{ mt: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, (passwordStrength / 4) * 100)}
                          color={passwordStrength <= 1 ? 'error' : passwordStrength <= 3 ? 'warning' : 'success'}
                          sx={{ height: 8, borderRadius: 1 }}
                        />
                        <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}
                          color={passwordStrength <= 1 ? 'error.main' : passwordStrength <= 3 ? 'warning.main' : 'success.main'}
                        >
                          Strength: {passwordStrength <= 1 ? 'Weak' : passwordStrength <= 3 ? 'Medium' : 'Strong'}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              />

              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    margin="normal"
                    required
                    fullWidth
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
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
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">
                  Already have an account?{' '}
                  <Link to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Button variant="text" size="small">
                      Sign In
                    </Button>
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Signup;
