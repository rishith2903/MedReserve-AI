import { describe, it, expect, vi } from 'vitest';
import { applyServerValidationErrors, extractServerMessage } from './errorMap';

function mkSetters() {
  const calls = { set: [], focus: [] };
  const setError = (field, payload) => calls.set.push([field, payload]);
  const setFocus = (field) => calls.focus.push(field);
  return { calls, setError, setFocus };
}

describe('errorMap', () => {
  it('maps validationErrors to fields and focuses first', () => {
    const { calls, setError, setFocus } = mkSetters();
    const data = { validationErrors: { email: 'Invalid', password: 'Weak' } };
    const applied = applyServerValidationErrors(setError, setFocus, data, ['email','password']);
    expect(applied).toBe(true);
    expect(calls.set.length).toBe(2);
    expect(calls.set[0][0]).toBe('email');
    expect(calls.set[1][0]).toBe('password');
    expect(calls.focus[0]).toBe('email');
  });

  it('anchors business messages to fields', () => {
    const { calls, setError, setFocus } = mkSetters();
    const data = { message: 'Email is already in use!' };
    applyServerValidationErrors(setError, setFocus, data, ['email']);
    expect(calls.set[0][0]).toBe('email');
  });

  it('extracts server message from error object', () => {
    const error = { response: { data: { message: 'Bad request' } } };
    expect(extractServerMessage(error)).toBe('Bad request');
  });

  it('falls back to generic message', () => {
    const error = { message: undefined };
    expect(extractServerMessage(error)).toBe('Operation failed. Please try again.');
  });
});
