import { LIMITS, LOGIN_THROTTLE, ROLES } from '@/shared/constants';
import { ApiError } from '@/lib/api-client';

// Client-side mirrors of the server rules in src/server/validation/schemas.js.
// The server stays authoritative; these only give faster feedback.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Same constant the server's login rate limit is built from. */
export const LOGIN_LOCKOUT_MINUTES = LOGIN_THROTTLE.WINDOW_MINUTES;

export const PASSWORD_HINT = `At least ${LIMITS.PASSWORD_MIN} characters with an uppercase letter, a lowercase letter and a number. Special characters are allowed.`;

/** Returns an error message, or null when the password satisfies the server rule. */
export function passwordError(password) {
  if (password.length < LIMITS.PASSWORD_MIN) return `Password must be at least ${LIMITS.PASSWORD_MIN} characters`;
  if (password.length > LIMITS.PASSWORD_MAX) return `Password must be at most ${LIMITS.PASSWORD_MAX} characters`;
  if (!/[a-z]/.test(password)) return 'Password needs a lowercase letter';
  if (!/[A-Z]/.test(password)) return 'Password needs an uppercase letter';
  if (!/\d/.test(password)) return 'Password needs a number';
  return null;
}

/** Field → message map for the sign-up form (empty object when valid). */
export function validateSignup(values, role) {
  const errors = {};
  const fullName = values.fullName.trim();
  if (!fullName) errors.fullName = 'Name is required';
  else if (fullName.length > LIMITS.FULL_NAME_MAX) errors.fullName = `Name must be at most ${LIMITS.FULL_NAME_MAX} characters`;

  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Please enter a valid email address';

  const pwError = passwordError(values.password);
  if (pwError) errors.password = pwError;
  if (values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords do not match';

  if (role === ROLES.ADMIN) {
    const shopName = values.shopName.trim();
    if (!shopName) errors.shopName = 'Shop name is required';
    else if (shopName.length > LIMITS.SHOP_NAME_MAX) errors.shopName = `Shop name must be at most ${LIMITS.SHOP_NAME_MAX} characters`;
  }
  return errors;
}

/** Maps a failed POST /api/register to { fieldErrors, message } for display. */
export function describeRegisterError(err) {
  if (!(err instanceof ApiError)) {
    return { fieldErrors: {}, message: 'Network error. Check your connection and try again.' };
  }
  switch (err.code) {
    case 'VALIDATION_ERROR': {
      const { _: general, ...fieldErrors } = err.details ?? {};
      return { fieldErrors, message: general || 'Please fix the highlighted fields.' };
    }
    case 'EMAIL_TAKEN':
      return { fieldErrors: { email: 'An account with this email already exists.' }, message: '' };
    case 'FORBIDDEN':
      return { fieldErrors: {}, message: err.message || 'This type of sign-up is currently disabled.' };
    case 'RATE_LIMITED':
      return { fieldErrors: {}, message: 'Too many sign-up attempts. Please try again later.' };
    default:
      return { fieldErrors: {}, message: err.message || 'Registration failed. Please try again.' };
  }
}

const LOGIN_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password.',
  CredentialsSignin: 'Invalid email or password.',
  RATE_LIMITED: `Too many attempts. Try again in ${LOGIN_LOCKOUT_MINUTES} minutes, or reset your password.`,
  EMAIL_NOT_VERIFIED: 'Please confirm your email first. Use the link we emailed you, or request a new one below.',
  SESSION_REVOKED: 'You were signed out because your password changed or your account was removed. Please sign in again.',
};

/** Readable text for next-auth `result.error` (or the `?error=` query param). */
export function loginErrorMessage(code) {
  if (!code) return '';
  return LOGIN_ERROR_MESSAGES[code] ?? 'Sign-in failed. Please try again.';
}

/** Field → message map for reset / change password forms (empty object when valid). */
export function validateNewPassword({ password, confirmPassword }) {
  const errors = {};
  const pwError = passwordError(password);
  if (pwError) errors.password = pwError;
  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
  return errors;
}

export const isValidEmail = (value) => EMAIL_PATTERN.test(String(value).trim());

/** Only same-origin relative paths are honoured ("/x", never "//host" or "http://"). */
export function safeCallbackUrl(value) {
  if (typeof value !== 'string') return null;
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return null;
  return value;
}
