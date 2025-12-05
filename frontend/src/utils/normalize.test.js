import { describe, it, expect } from 'vitest';
import { normalizePayload } from './normalize';

describe('normalizePayload', () => {
  it('trims strings and omits empty', () => {
    const input = { a: '  foo  ', b: '   ', c: 'bar' };
    const out = normalizePayload(input);
    expect(out).toEqual({ a: 'foo', c: 'bar' });
  });

  it('coerces boolean strings to booleans', () => {
    const input = { x: ' true ', y: 'FALSE', z: 'yes' };
    const out = normalizePayload(input);
    expect(out).toEqual({ x: true, y: false, z: 'yes' });
  });

  it('supports custom coercers', () => {
    const input = { phone: '  +91 9876543210  ' };
    const out = normalizePayload(input, {
      coerce: {
        phone: (v) => (v || '').replace(/\s+/g, ''),
      },
    });
    expect(out.phone).toBe('+919876543210');
  });
});
