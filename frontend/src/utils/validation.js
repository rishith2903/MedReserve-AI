// Centralized validation utilities for forms

export const INDIA_PHONE_REGEX = /^\+91[6-9]\d{9}$/;
export const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const validationMessages = {
  phoneIndia: 'Please provide a valid Indian phone number in +91 format (10 digits, starts with 6-9)',
  passwordStrong: 'Password must be 8+ chars with uppercase, lowercase, digit, and one of @$!%*?&.',
};

export const validateIndianPhone = (value) => INDIA_PHONE_REGEX.test((value || '').trim());
export const validateStrongPassword = (value) => STRONG_PASSWORD_REGEX.test(value || '');
