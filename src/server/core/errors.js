// Error hierarchy (Replace Conditional with Polymorphism): each error type knows
// its HTTP status and public code, so handlers never branch on error kinds.

export class AppError extends Error {
  constructor(message, { status = 500, code = 'INTERNAL_ERROR', details, expose } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.details = details;
    /** Whether `message` is safe to show to clients. */
    this.expose = expose ?? status < 500;
  }

  toResponseBody() {
    return {
      success: false,
      code: this.code,
      message: this.expose ? this.message : 'Something went wrong. Please try again.',
      ...(this.expose && this.details ? { details: this.details } : {}),
    };
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Invalid request', details) {
    super(message, { status: 400, code: 'VALIDATION_ERROR', details });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, { status: 401, code: 'UNAUTHORIZED' });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, { status: 403, code: 'FORBIDDEN' });
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, { status: 404, code: 'NOT_FOUND' });
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', code = 'CONFLICT') {
    super(message, { status: 409, code });
  }
}

export class InsufficientStockError extends ConflictError {
  constructor(productName) {
    super(`Not enough stock for ${productName}`, 'INSUFFICIENT_STOCK');
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfterSeconds) {
    super('Too many requests. Please try again later.', { status: 429, code: 'RATE_LIMITED' });
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, { status: 503, code: 'SERVICE_UNAVAILABLE', expose: true });
  }
}

const MONGO_DUPLICATE_KEY = 11000;

/** Normalise any thrown value (Mongoose, Zod, unknown) into an AppError. */
export function toAppError(err) {
  if (err instanceof AppError) return err;
  if (err?.name === 'ZodError') {
    return new ValidationError('Invalid request', formatZodIssues(err.issues));
  }
  if (err?.code === MONGO_DUPLICATE_KEY) {
    const field = Object.keys(err.keyPattern || {}).filter((k) => k !== 'storeId')[0] || 'value';
    return new ConflictError(`A record with this ${field} already exists`, 'DUPLICATE');
  }
  if (err?.name === 'ValidationError' && err.errors) {
    const details = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
    return new ValidationError('Invalid data', details);
  }
  if (err?.name === 'CastError') {
    return new ValidationError(`Invalid value for ${err.path}`);
  }
  if (err?.name === 'MongoServerSelectionError' || err?.name === 'MongoNetworkError') {
    return new ServiceUnavailableError('Database unavailable');
  }
  return new AppError(err?.message || 'Internal error', { expose: false });
}

export function formatZodIssues(issues = []) {
  return Object.fromEntries(issues.map((i) => [i.path.join('.') || '_', i.message]));
}
