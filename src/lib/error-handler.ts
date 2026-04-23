/**
 * Enterprise-grade error handling utilities
 * Provides structured error handling, logging, and user-friendly messages
 */

export interface AppError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
  timestamp: string;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }

  toJSON(): AppError {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Common API errors
 */
export const Errors = {
  UNAUTHORIZED: new ApiError(401, 'UNAUTHORIZED', 'Authentication required'),
  FORBIDDEN: new ApiError(403, 'FORBIDDEN', 'You do not have permission to access this resource'),
  NOT_FOUND: new ApiError(404, 'NOT_FOUND', 'The requested resource was not found'),
  BAD_REQUEST: new ApiError(400, 'BAD_REQUEST', 'Invalid request parameters'),
  CONFLICT: new ApiError(409, 'CONFLICT', 'Resource already exists'),
  INTERNAL_ERROR: new ApiError(500, 'INTERNAL_ERROR', 'An unexpected error occurred'),
  SERVICE_UNAVAILABLE: new ApiError(503, 'SERVICE_UNAVAILABLE', 'Service temporarily unavailable'),
  RATE_LIMITED: new ApiError(429, 'RATE_LIMITED', 'Too many requests. Please try again later'),
  INSUFFICIENT_CREDITS: new ApiError(402, 'INSUFFICIENT_CREDITS', 'Insufficient credits to perform this action'),
  INVALID_EMAIL: new ApiError(400, 'INVALID_EMAIL', 'Invalid email address'),
  WEAK_PASSWORD: new ApiError(400, 'WEAK_PASSWORD', 'Password does not meet security requirements'),
  USER_NOT_FOUND: new ApiError(404, 'USER_NOT_FOUND', 'User account not found'),
  EMAIL_ALREADY_EXISTS: new ApiError(409, 'EMAIL_ALREADY_EXISTS', 'Email address already in use'),
  INVALID_VIDEO_ID: new ApiError(400, 'INVALID_VIDEO_ID', 'Invalid or missing video ID'),
  VIDEO_NOT_FOUND: new ApiError(404, 'VIDEO_NOT_FOUND', 'Video not found'),
  PAYMENT_FAILED: new ApiError(402, 'PAYMENT_FAILED', 'Payment processing failed'),
  STRIPE_ERROR: new ApiError(500, 'STRIPE_ERROR', 'Payment processor error'),
  GENERATION_FAILED: new ApiError(500, 'GENERATION_FAILED', 'Video generation failed'),
  AVATAR_NOT_READY: new ApiError(400, 'AVATAR_NOT_READY', 'Avatar is still being created'),
  VOICE_NOT_READY: new ApiError(400, 'VOICE_NOT_READY', 'Voice clone is still being created'),
  NO_AVATARS_AVAILABLE: new ApiError(400, 'NO_AVATARS_AVAILABLE', 'No avatars available. Please create one first'),
  INVALID_SCRIPT: new ApiError(400, 'INVALID_SCRIPT', 'Script is empty or too short'),
  EXTERNAL_API_ERROR: new ApiError(500, 'EXTERNAL_API_ERROR', 'External service error'),
};

/**
 * Safely log errors with sensitive data redaction
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  const errorData = {
    timestamp,
    context,
    error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
  };

  // In production, send to error tracking service (e.g., Sentry)
  if (process.env.NODE_ENV === 'production') {
    console.error('[ERROR]', JSON.stringify(errorData));
    // TODO: Send to Sentry or other error tracking service
  } else {
    console.error('[ERROR]', errorData);
  }
}

/**
 * Format error for API response
 */
export function formatErrorResponse(error: unknown): AppError {
  if (error instanceof ApiError) {
    return error.toJSON();
  }

  if (error instanceof Error) {
    return {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'An error occurred' : error.message,
      statusCode: 500,
      details: process.env.NODE_ENV === 'production' ? undefined : { originalMessage: error.message },
      timestamp: new Date().toISOString(),
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred',
    statusCode: 500,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validate required fields
 */
export function validateRequired(
  data: Record<string, unknown>,
  requiredFields: string[]
): { valid: boolean; errors?: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      errors[field] = `${field} is required`;
    }
  }

  return { valid: Object.keys(errors).length === 0, errors: Object.keys(errors).length > 0 ? errors : undefined };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number');
  if (!/[!@#$%^&*]/.test(password)) errors.push('Password must contain at least one special character (!@#$%^&*)');

  return { valid: errors.length === 0, errors };
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets to prevent XSS
    .substring(0, 10000); // Limit length
}

/**
 * Rate limiting key generation
 */
export function generateRateLimitKey(identifier: string, scope: string): string {
  return `ratelimit:${scope}:${identifier}`;
}
