/**
 * Sentry Server-Side Configuration (Node.js runtime)
 * Loaded automatically by @sentry/nextjs for server components and API routes.
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Don't print sensitive error details in production logs
    beforeSend(event) {
      if (process.env.NODE_ENV === 'production') {
        // Strip auth headers
        if (event.request?.headers) {
          const { authorization, cookie, ...rest } = event.request.headers as Record<string, string>;
          void authorization;
          void cookie;
          event.request.headers = rest;
        }
      }
      return event;
    },
  });
}
