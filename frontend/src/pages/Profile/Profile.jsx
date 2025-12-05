import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardHeader,
  LinearProgress,
  IconButton,
  InputAdornment,
  Skeleton
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  Cancel,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api, { authAPI } from '../../services/api';
import useRealtimePoll from '../../hooks/useRealtimePoll';
import { validateIndianPhone, validationMessages, STRONG_PASSWORD_REGEX } from '../../utils/validation';
import { normalizePayload } from '../../utils/normalize';
import { useForm, Controller } from 'react-hook-form';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  // Profile form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    address: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        address: user.address || ''
      });
    }
  }, [user]);

  // Poll current user data every 60s to keep profile fresh
  useRealtimePoll(async () => {
    try {
      const fresh = await authAPI.getCurrentUser();
      updateUser(fresh);
    } catch (_) { void 0; }
  }, 60000, [updateUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phoneNumber') {
      setPhoneError('');
    }
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setPhoneError('');

    // Basic client-side validation for Indian +91 phone numbers
    const trimmedPhone = (formData.phoneNumber || '').trim();
    if (trimmedPhone && !validateIndianPhone(trimmedPhone)) {
      setPhoneError(validationMessages.phoneIndia);
      setLoading(false);
      return;
    }

    try {
      const payload = normalizePayload({ ...formData, phoneNumber: trimmedPhone });
      const response = await api.put('/auth/profile', payload);
      updateUser(response.data);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      const data = err?.response?.data;
      const fe = {};
      if (data?.validationErrors && typeof data.validationErrors === 'object') {
        Object.entries(data.validationErrors).forEach(([field, message]) => {
          fe[field] = String(message);
        });
      }
      if (typeof data?.message === 'string') {
        const lower = data.message.toLowerCase();
        if (lower.includes('email is already in use')) fe.email = data.message;
        if (lower.includes('phone number is already in use')) fe.phoneNumber = data.message;
      }
      setFieldErrors(fe);
      setError(data?.message || err?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        address: user.address || ''
      });
    }
    setIsEditing(false);
    setError('');
  };

  // Change Password form
  const {
    control: pwdControl,
    handleSubmit: handlePwdSubmit,
    reset: resetPwdForm,
    formState: { errors: pwdErrors, isSubmitting: pwdSubmitting }
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    }
  });

  const computePasswordStrength = (val) => {
    const v = val || '';
    let score = 0;
    if (v.length >= 8) score += 1;
    if (/[A-Z]/.test(v)) score += 1;
    if (/[a-z]/.test(v)) score += 1;
    if (/\d/.test(v)) score += 1;
    if (/[@$!%*?&]/.test(v)) score += 1;
    return Math.min(4, score);
  };

  const [newPwdValue, setNewPwdValue] = useState('');
  const [newPwdStrength, setNewPwdStrength] = useState(0);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const onChangePassword = async (data) => {
    try {
      setError('');
      setSuccess('');
      // Validate new password strength and match
      const { currentPassword, newPassword, confirmNewPassword } = data;
      if (!STRONG_PASSWORD_REGEX.test(newPassword)) {
        throw new Error('New password must be 8+ chars with uppercase, lowercase, digit, and one of @$!%*?&.');
      }
      if (newPassword !== confirmNewPassword) {
        throw new Error('New password and confirm password do not match');
      }
      await authAPI.changePassword({ currentPassword, newPassword });
      setSuccess('Password changed successfully!');
      resetPwdForm();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to change password');
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Card>
          <CardHeader
            avatar={<Skeleton variant="circular" width={80} height={80} />}
            title={<Skeleton width={240} height={40} />}
            subheader={<Skeleton width={180} height={24} />}
          />
          <CardContent>
            <Grid container spacing={3}>
              {[...Array(6)].map((_, i) => (
                <Grid item xs={12} sm={6} key={i}>
                  <Skeleton height={56} />
                </Grid>
              ))}
              <Grid item xs={12}>
                <Skeleton height={24} width={160} />
                <Skeleton height={56} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Card>
        <CardHeader
          avatar={
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                fontSize: '2rem'
              }}
            >
              {user.firstName?.charAt(0) || 'U'}
            </Avatar>
          }
          title={
            <Typography variant="h4" component="h1">
              {user.firstName} {user.lastName}
            </Typography>
          }
          subheader={
            <Typography variant="subtitle1" color="text.secondary">
              {(() => {
                const roleLabel = user?.role?.name || user?.role || 'User';
                const year = user?.createdAt ? new Date(user.createdAt).getFullYear() : undefined;
                return year ? `${roleLabel} • Member since ${year}` : roleLabel;
              })()}
            </Typography>
          }
          action={
            !isEditing ? (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => setIsEditing(true)}
                aria-label="Edit profile"
              >
                Edit Profile
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={loading}
                  aria-label="Save profile"
                >
                  {loading ? <CircularProgress size={20} /> : 'Save'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                  disabled={loading}
                  aria-label="Cancel editing"
                >
                  Cancel
                </Button>
              </Box>
            )
          }
        />

        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person /> Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={!isEditing}
                variant={isEditing ? "outlined" : "filled"}
                error={Boolean(fieldErrors.firstName)}
                helperText={fieldErrors.firstName || ''}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                disabled={!isEditing}
                variant={isEditing ? "outlined" : "filled"}
                error={Boolean(fieldErrors.lastName)}
                helperText={fieldErrors.lastName || ''}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                variant={isEditing ? "outlined" : "filled"}
                error={Boolean(fieldErrors.email)}
                helperText={fieldErrors.email || ''}
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                disabled={!isEditing}
                variant={isEditing ? "outlined" : "filled"}
                error={Boolean(phoneError) || Boolean(fieldErrors.phoneNumber)}
                helperText={phoneError || fieldErrors.phoneNumber || (isEditing ? 'Use Indian +91 format, e.g., +919876543210' : '')}
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                disabled={!isEditing}
                variant={isEditing ? "outlined" : "filled"}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!isEditing} variant={isEditing ? "outlined" : "filled"}>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  label="Gender"
                >
                  <MenuItem value="">
                    <em>Select Gender</em>
                  </MenuItem>
                  <MenuItem value="MALE">Male</MenuItem>
                  <MenuItem value="FEMALE">Female</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                variant={isEditing ? "outlined" : "filled"}
                multiline
                rows={3}
                InputProps={{
                  startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />
                }}
              />
            </Grid>

            {/* Change Password */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box component="form" onSubmit={handlePwdSubmit(onChangePassword)} noValidate>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="currentPassword"
                      control={pwdControl}
                      rules={{ required: 'Current password is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type={showCurrentPwd ? 'text' : 'password'}
                          label="Current Password"
                          fullWidth
                          required
                          error={!!pwdErrors.currentPassword}
                          helperText={pwdErrors.currentPassword?.message}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton aria-label="toggle current password visibility" edge="end" onClick={() => setShowCurrentPwd(v => !v)}>
                                  {showCurrentPwd ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="newPassword"
                      control={pwdControl}
                      rules={{ required: 'New password is required' }}
                      render={({ field }) => (
                        <Box>
                          <TextField
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              const val = e.target.value;
                              setNewPwdValue(val);
                              setNewPwdStrength(computePasswordStrength(val));
                            }}
                            type={showNewPwd ? 'text' : 'password'}
                            label="New Password"
                            fullWidth
                            required
                            error={!!pwdErrors.newPassword}
                            helperText={pwdErrors.newPassword?.message || validationMessages.passwordStrong}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton aria-label="toggle new password visibility" edge="end" onClick={() => setShowNewPwd(v => !v)}>
                                    {showNewPwd ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              )
                            }}
                          />
                          {newPwdValue && (
                            <Box sx={{ mt: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(100, (newPwdStrength / 4) * 100)}
                                color={newPwdStrength <= 1 ? 'error' : newPwdStrength <= 3 ? 'warning' : 'success'}
                                sx={{ height: 8, borderRadius: 1 }}
                              />
                              <Typography
                                variant="caption"
                                sx={{ mt: 0.5, display: 'block' }}
                                color={newPwdStrength <= 1 ? 'error.main' : newPwdStrength <= 3 ? 'warning.main' : 'success.main'}
                              >
                                Strength: {newPwdStrength <= 1 ? 'Weak' : newPwdStrength <= 3 ? 'Medium' : 'Strong'}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="confirmNewPassword"
                      control={pwdControl}
                      rules={{ required: 'Confirm new password is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type={showConfirmPwd ? 'text' : 'password'}
                          label="Confirm New Password"
                          fullWidth
                          required
                          error={!!pwdErrors.confirmNewPassword}
                          helperText={pwdErrors.confirmNewPassword?.message}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton aria-label="toggle confirm password visibility" edge="end" onClick={() => setShowConfirmPwd(v => !v)}>
                                  {showConfirmPwd ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button type="submit" variant="contained" disabled={pwdSubmitting}>
                      {pwdSubmitting ? 'Changing...' : 'Change Password'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Profile;
