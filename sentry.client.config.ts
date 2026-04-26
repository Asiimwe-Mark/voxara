/**
 * Sentry Client-Side Configuration (browser)
 * This file is loaded by @sentry/nextjs automatically for browser bundles.
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,

    // Performance: capture 10% of transactions in production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Session Replay: 10% normal sessions, 100% on error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Ignore common noisy errors
    ignoreErrors: [
      'NetworkError',
      'Network request failed',
      'Non-Error promise rejection captured',
      /ResizeObserver loop/,
    ],

    // Scrub sensitive data before sending
    beforeSend(event) {
      if (event.request) {
        event.request.headers = {};
        event.request.cookies = {};
      }
      return event;
    },
  });
}
