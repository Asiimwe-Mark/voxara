/**
 * Monitoring and Error Tracking
 * Sentry v10-compatible — uses new spanAPI and replayIntegration()
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Capture an exception for error tracking
 */
export function captureException(error: Error, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, context ? { contexts: { custom: context } } : undefined);
  } else {
    if (typeof process !== 'undefined') process.stderr.write(JSON.stringify({ level: 'error', error: String(error), context }) + '\n');
  }
}

/**
 * Capture a message for monitoring
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureMessage(message, level);
  } else {
    if (typeof process !== 'undefined') process.stderr.write(`[${level.toUpperCase()}] ${message}\n`);
  }
}

/**
 * Wrap an async function in a Sentry span (replaces deprecated startTransaction)
 */
export async function withSpan<T>(
  name: string,
  op: string,
  fn: () => Promise<T>
): Promise<T> {
  return Sentry.startSpan({ name, op }, fn);
}

/**
 * Set user context for error tracking
 */
export function setUserContext(userId: string, email: string, subscription?: string) {
  Sentry.setUser({ id: userId, email, subscription });
}

/**
 * Clear user context when logging out
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  data?: Record<string, unknown>,
  level: 'info' | 'warning' | 'error' = 'info'
) {
  Sentry.addBreadcrumb({ message, data, level, category: 'user-action' });
}

/**
 * Monitor API request performance
 */
export function monitorApiRequest(
  method: string,
  path: string,
  duration: number,
  status: number
) {
  addBreadcrumb(
    `${method} ${path}`,
    { duration: `${duration}ms`, status },
    status >= 400 ? 'error' : 'info'
  );
}

/**
 * Monitor video generation steps
 */
export function monitorVideoGeneration(
  videoId: string,
  step: string,
  duration: number,
  success: boolean
) {
  addBreadcrumb(
    `Video Generation - ${step}`,
    { videoId, duration: `${duration}ms`, success },
    success ? 'info' : 'warning'
  );
}

/**
 * Monitor credit consumption
 */
export function monitorCreditConsumption(
  userId: string,
  creditsUsed: number,
  creditsRemaining: number
) {
  addBreadcrumb('Credits Consumed', { userId, creditsUsed, creditsRemaining });
}

/**
 * Monitor payment events
 */
export function monitorPaymentEvent(
  event: string,
  amount: number,
  currency: string,
  status: string
) {
  addBreadcrumb(
    `Payment - ${event}`,
    { amount: `${amount} ${currency}`, status },
    status === 'failed' ? 'error' : 'info'
  );
}

/**
 * Monitor queue processing
 */
export function monitorQueueProcessing(
  queueName: string,
  jobId: string,
  duration: number,
  status: 'success' | 'failed' | 'retried'
) {
  addBreadcrumb(
    `Queue - ${queueName}`,
    { jobId, duration: `${duration}ms`, status },
    status === 'failed' ? 'error' : 'info'
  );
}

/**
 * Create a Sentry context for database operations
 */
export function createDatabaseContext(
  operation: string,
  table: string,
  rowsAffected?: number
) {
  return { operation, table, rowsAffected, timestamp: new Date().toISOString() };
}

export default {
  captureException,
  captureMessage,
  withSpan,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
  monitorApiRequest,
  monitorVideoGeneration,
  monitorCreditConsumption,
  monitorPaymentEvent,
  createDatabaseContext,
  monitorQueueProcessing,
};
