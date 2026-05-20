/**
 * CORS pre-flight helper.
 *
 * Next.js App Router does not automatically emit OPTIONS responses for
 * custom route files. Browsers send an OPTIONS pre-flight before any
 * cross-origin POST/PUT/DELETE, so without this handler the real request
 * is blocked with a 405 / 404.
 *
 * Usage — add to every API route that accepts browser requests:
 *
 *   export { OPTIONS } from '@/lib/api/cors';
 *
 * Or inline if you need custom logic:
 *
 *   import { optionsResponse } from '@/lib/api/cors';
 *   export function OPTIONS() { return optionsResponse(); }
 */

import { NextResponse } from 'next/server';

function getAllowedOrigin(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  // Never fall back to wildcard — reject if no origin is configured
  console.warn('[cors] WARNING: No NEXT_PUBLIC_APP_URL or VERCEL_URL set. CORS origin will be empty.');
  return 'https://localhost'; // Safe fallback that won't match real requests
}

export function optionsResponse(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin':      getAllowedOrigin(),
      'Access-Control-Allow-Methods':     'GET,DELETE,PATCH,POST,PUT,OPTIONS',
      'Access-Control-Allow-Headers':
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-api-key',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/** Exportable OPTIONS handler — re-export directly from route files. */
export function OPTIONS(): NextResponse {
  return optionsResponse();
}
