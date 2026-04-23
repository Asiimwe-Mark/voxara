/**
 * Monitoring and Error Tracking Configuration
 * Integrates Sentry for error tracking and performance monitoring
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Initialize Sentry for error tracking and performance monitoring
 */
export function initializeMonitoring() {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1, // 10% of transactions
      
      // Performance Monitoring
      integrations: [
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      
      // Capture replay for 10% of all sessions,
      // plus 100% of sessions with an error
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      // Ignore errors we don't care about
      ignoreErrors: [
        'NetworkError',
        'timeout of',
        'Network request failed',
        'Non-Error promise rejection captured',
      ],

      // Before sending to Sentry, clean sensitive data
      beforeSend(event, hint) {
        // Remove sensitive data
        if (event.request) {
          event.request.headers = {};
          event.request.cookies = {};
        }

        // Remove API keys from error messages
        if (event.message) {
          event.message = sanitizeMessage(event.message);
        }

        // Remove sensitive data from exception
        if (event.exception) {
          event.exception.values?.forEach((exception) => {
            if (exception.value) {
              exception.value = sanitizeMessage(exception.value);
            }
          });
        }

        return event;
      },
    });
  }
}

/**
 * Capture an exception for error tracking
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'production') {
    if (context) {
      Sentry.captureException(error, {
        contexts: { custom: context },
      });
    } else {
      Sentry.captureException(error);
    }
  } else {
    console.error('Error:', error, context);
  }
}

/**
 * Capture a message for monitoring
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureMessage(message, level);
  } else {
    console.log(`[${level.toUpperCase()}] ${message}`);
  }
}

/**
 * Start a performance transaction
 */
export function startTransaction(name: string, op: string = 'http.request') {
  if (process.env.NODE_ENV === 'production') {
    return Sentry.startTransaction({ name, op });
  }
  return null;
}

/**
 * Set user context for error tracking
 */
export function setUserContext(userId: string, email: string, subscription?: string) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.setUser({
      id: userId,
      email: email,
      subscription: subscription,
    });
  }
}

/**
 * Clear user context when logging out
 */
export function clearUserContext() {
  if (process.env.NODE_ENV === 'production') {
    Sentry.setUser(null);
  }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, data?: Record<string, any>, level: 'info' | 'warning' | 'error' = 'info') {
  if (process.env.NODE_ENV === 'production') {
    Sentry.addBreadcrumb({
      message,
      data,
      level,
      category: 'user-action',
    });
  }
}

/**
 * Monitor API request performance
 */
export function monitorApiRequest(method: string, path: string, duration: number, status: number) {
  if (process.env.NODE_ENV === 'production') {
    addBreadcrumb(`${method} ${path}`, {
      duration: `${duration}ms`,
      status,
    }, status >= 400 ? 'error' : 'info');
  }
}

/**
 * Monitor video generation
 */
export function monitorVideoGeneration(videoId: string, step: string, duration: number, success: boolean) {
  addBreadcrumb(`Video Generation - ${step}`, {
    videoId,
    duration: `${duration}ms`,
    success,
  }, success ? 'info' : 'warning');
}

/**
 * Monitor credit consumption
 */
export function monitorCreditConsumption(userId: string, creditsUsed: number, creditsRemaining: number) {
  addBreadcrumb('Credits Consumed', {
    creditsUsed,
    creditsRemaining,
  });
}

/**
 * Monitor payment events
 */
export function monitorPaymentEvent(event: string, amount: number, currency: string, status: string) {
  addBreadcrumb(`Payment - ${event}`, {
    amount: `${amount} ${currency}`,
    status,
  }, status === 'failed' ? 'error' : 'info');
}

/**
 * Sanitize message by removing API keys and sensitive data
 */
function sanitizeMessage(message: string): string {
  // Remove API keys
  message = message.replace(/sk_[a-zA-Z0-9_-]{20,}/g, 'sk_REDACTED');
  message = message.replace(/pk_[a-zA-Z0-9_-]{20,}/g, 'pk_REDACTED');
  
  // Remove tokens
  message = message.replace(/Bearer\s+[a-zA-Z0-9_-]+/gi, 'Bearer REDACTED');
  message = message.replace(/token=[\w-]+/gi, 'token=REDACTED');
  
  // Remove emails partially
  message = message.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '***@***.***');
  
  return message;
}

/**
 * Create a Sentry context for database operations
 */
export function createDatabaseContext(operation: string, table: string, rowsAffected?: number) {
  return {
    operation,
    table,
    rowsAffected,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Monitor queue processing
 */
export function monitorQueueProcessing(queueName: string, jobId: string, duration: number, status: 'success' | 'failed' | 'retried') {
  addBreadcrumb(`Queue - ${queueName}`, {
    jobId,
    duration: `${duration}ms`,
    status,
  }, status === 'failed' ? 'error' : 'info');
}

export default {
  initializeMonitoring,
  captureException,
  captureMessage,
  startTransaction,
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
