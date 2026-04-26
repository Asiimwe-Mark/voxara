/**
 * Sentry Edge Runtime Configuration
 * Loaded automatically by @sentry/nextjs for middleware and edge API routes.
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    // Lower sample rate for edge — very high request volume
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,
  });
}
