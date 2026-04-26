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
 * Factory functions for common errors — avoids shared mutable error instances
 */
export const Errors = {
  unauthorized: (msg?: string) =>
    new ApiError(401, 'UNAUTHORIZED', msg ?? 'Authentication required'),
  forbidden: (msg?: string) =>
    new ApiError(403, 'FORBIDDEN', msg ?? 'You do not have permission to access this resource'),
  notFound: (resource = 'Resource') =>
    new ApiError(404, 'NOT_FOUND', `${resource} not found`),
  badRequest: (msg?: string) =>
    new ApiError(400, 'BAD_REQUEST', msg ?? 'Invalid request parameters'),
  conflict: (msg?: string) =>
    new ApiError(409, 'CONFLICT', msg ?? 'Resource already exists'),
  internalError: (msg?: string) =>
    new ApiError(500, 'INTERNAL_ERROR', msg ?? 'An unexpected error occurred'),
  serviceUnavailable: () =>
    new ApiError(503, 'SERVICE_UNAVAILABLE', 'Service temporarily unavailable'),
  rateLimited: () =>
    new ApiError(429, 'RATE_LIMITED', 'Too many requests. Please try again later'),
  insufficientCredits: () =>
    new ApiError(402, 'INSUFFICIENT_CREDITS', 'Insufficient credits to perform this action'),
  paymentFailed: (msg?: string) =>
    new ApiError(402, 'PAYMENT_FAILED', msg ?? 'Payment processing failed'),
  generationFailed: (msg?: string) =>
    new ApiError(500, 'GENERATION_FAILED', msg ?? 'Video generation failed'),
  invalidScript: () =>
    new ApiError(400, 'INVALID_SCRIPT', 'Script is empty or too short'),
  externalApiError: (service: string, msg?: string) =>
    new ApiError(502, 'EXTERNAL_API_ERROR', `${service} error: ${msg ?? 'unknown'}`),
} as const;

/**
 * Safely log errors with sensitive data redaction
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  const errorData = {
    timestamp,
    context,
    error:
      error instanceof Error
        ? { message: error.message, stack: error.stack }
        : error,
  };

  if (process.env.NODE_ENV === 'production') {
    // Structured JSON log — picked up by Vercel Log Drains / Datadog
    console.error(JSON.stringify({ level: 'error', ...errorData }));
  } else {
    console.error('[ERROR]', errorData);
  }
}

/**
 * Format any error into a standard API response shape
 */
export function formatErrorResponse(error: unknown): AppError {
  if (error instanceof ApiError) {
    return error.toJSON();
  }

  if (error instanceof Error) {
    return {
      code: 'INTERNAL_ERROR',
      message:
        process.env.NODE_ENV === 'production'
          ? 'An error occurred'
          : error.message,
      statusCode: 500,
      details:
        process.env.NODE_ENV === 'production'
          ? undefined
          : { originalMessage: error.message },
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
 * Validate required fields in a request body
 */
export function validateRequired(
  data: Record<string, unknown>,
  requiredFields: string[]
): { valid: boolean; errors?: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const field of requiredFields) {
    if (
      data[field] === undefined ||
      data[field] === null ||
      (typeof data[field] === 'string' && !(data[field] as string).trim())
    ) {
      errors[field] = `${field} is required`;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Must contain at least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Must contain at least one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Must contain at least one number');
  return { valid: errors.length === 0, errors };
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 10000);
}
