import { describe, it, expect } from 'vitest';
import { validateIndianPhone, validateStrongPassword } from './validation';

describe('validation utils', () => {
  describe('validateIndianPhone (+91 format)', () => {
    it('accepts valid +91 numbers starting 6-9 and 10 digits', () => {
      expect(validateIndianPhone('+919876543210')).toBe(true);
      expect(validateIndianPhone('+916123456789')).toBe(true);
      expect(validateIndianPhone(' +919876543210 ')).toBe(true); // trimming allowed
    });

    it('rejects numbers not in +91 format', () => {
      expect(validateIndianPhone('+15551234567')).toBe(false); // non-India
      expect(validateIndianPhone('+911234567890')).toBe(false); // starts with 1
      expect(validateIndianPhone('+910123456789')).toBe(false); // starts with 0
      expect(validateIndianPhone('+91987654321')).toBe(false); // too short
      expect(validateIndianPhone('+9198765432100')).toBe(false); // too long
      expect(validateIndianPhone('919876543210')).toBe(false); // missing +
      expect(validateIndianPhone('+91 9876543210')).toBe(false); // space not allowed
    });
  });

  describe('validateStrongPassword', () => {
    it('accepts strong passwords', () => {
      expect(validateStrongPassword('Str0ng!Pass')).toBe(true);
      expect(validateStrongPassword('A1b2c3d4!')).toBe(true);
      expect(validateStrongPassword('Zz1@zzzzzz')).toBe(true);
    });

    it('rejects weak passwords', () => {
      expect(validateStrongPassword('Abc123')).toBe(false); // too short, lacks special
      expect(validateStrongPassword('Passw0rd')).toBe(false); // missing special
      expect(validateStrongPassword('PASSWORD1!')).toBe(false); // missing lowercase
      expect(validateStrongPassword('password1!')).toBe(false); // missing uppercase
      expect(validateStrongPassword('Short1!')).toBe(false); // length < 8
    });
  });
});
