// Structured JSON logger with secret redaction.
// Fixes the old behaviour of logging request bodies and credentials in plaintext.

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const REDACT_KEY = /pass(word)?|secret|token|authorization|cookie|api[-_]?key|credential/i;
const MAX_DEPTH = 6;

export function redact(value, depth = 0) {
  if (value === null || typeof value !== 'object') return value;
  if (depth > MAX_DEPTH) return '[Truncated]';
  if (value instanceof Error) {
    return { name: value.name, message: value.message, code: value.code, stack: value.stack };
  }
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    out[k] = REDACT_KEY.test(k) ? '[REDACTED]' : redact(v, depth + 1);
  }
  return out;
}

function threshold() {
  return LEVELS[process.env.LOG_LEVEL] ?? (process.env.NODE_ENV === 'test' ? LEVELS.warn : LEVELS.info);
}

function write(level, msg, fields, bindings) {
  if (LEVELS[level] < threshold()) return;
  const line = JSON.stringify({
    time: new Date().toISOString(),
    level,
    msg,
    ...redact(bindings),
    ...redact(fields || {}),
  });
  (level === 'error' ? console.error : level === 'warn' ? console.warn : console.log)(line);
}

export function createLogger(bindings = {}) {
  return {
    debug: (msg, f) => write('debug', msg, f, bindings),
    info: (msg, f) => write('info', msg, f, bindings),
    warn: (msg, f) => write('warn', msg, f, bindings),
    error: (msg, f) => write('error', msg, f, bindings),
    child: (extra) => createLogger({ ...bindings, ...extra }),
  };
}

export const logger = createLogger({ service: 'trackit' });
