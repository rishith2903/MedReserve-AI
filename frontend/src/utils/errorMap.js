// Utility to map backend validation and business errors to form fields
// Backend error shapes observed:
// - GlobalExceptionHandler: {
//     message: 'Invalid input data',
//     validationErrors: { fieldName: 'Error message', ... }
//   }
// - MessageResponse (AuthController): { message: '...', success: false }
// - Other: { message: '...' }

export function applyServerValidationErrors(setError, setFocus, data, knownFields = []) {
  if (!data) return false;
  let focused = false;
  let applied = false;

  const addError = (field, message) => {
    if (!field || !message) return;
    setError(field, { type: 'server', message: String(message) });
    if (!focused) {
      setFocus(field);
      focused = true;
    }
    applied = true;
  };

  // Preferred: field-level validation errors
  if (data.validationErrors && typeof data.validationErrors === 'object') {
    Object.entries(data.validationErrors).forEach(([field, message]) => {
      if (knownFields.length === 0 || knownFields.includes(field)) {
        addError(field, message);
      }
    });
  }

  // Known business messages we want to anchor to fields
  if (typeof data.message === 'string') {
    const lower = data.message.toLowerCase();
    if (lower.includes('email is already in use')) {
      addError('email', data.message);
    }
    if (lower.includes('phone number is already in use')) {
      addError('phoneNumber', data.message);
    }
  }

  return applied;
}

export function extractServerMessage(error) {
  const data = error?.response?.data;
  if (data?.message) return data.message;
  if (typeof error?.message === 'string') return error.message;
  return 'Operation failed. Please try again.';
}
