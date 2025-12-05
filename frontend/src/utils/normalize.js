// Normalize objects for API requests
// - Trim string values
// - Omit keys with empty strings after trimming
// - Coerce "true"/"false" (case-insensitive) to boolean
// - Optionally, pass a map of custom coercers by key

export function normalizePayload(obj, options = {}) {
  const { coerce = {} } = options;
  const out = {};
  Object.entries(obj || {}).forEach(([k, v]) => {
    let val = v;

    // Custom coercer per key if provided
    if (typeof coerce[k] === 'function') {
      val = coerce[k](v);
    }

    // Trim strings
    if (typeof val === 'string') {
      val = val.trim();
      // Coerce booleans from strings
      const lower = val.toLowerCase();
      if (lower === 'true') val = true;
      else if (lower === 'false') val = false;
    }

    // Omit empty strings
    if (val === '') return;

    out[k] = val;
  });
  return out;
}
