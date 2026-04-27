/** @type {import('next').NextConfig} */

// Compute the allowed CORS origin dynamically so Vercel preview deployments
// also work. Production uses APP_URL; previews use the VERCEL_URL env var.
function getAllowedOrigin() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return '*'; // local dev fallback
}

const ALLOWED_ORIGIN = getAllowedOrigin();

const CORS_HEADERS = [
  { key: 'Access-Control-Allow-Credentials', value: 'true' },
  { key: 'Access-Control-Allow-Origin',      value: ALLOWED_ORIGIN },
  { key: 'Access-Control-Allow-Methods',     value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
  {
    key: 'Access-Control-Allow-Headers',
    value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-api-key',
  },
];

const nextConfig = {
  compress: true,

  // Image optimization
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'image.mux.com' },
      { protocol: 'https', hostname: 'stream.mux.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
      { protocol: 'https', hostname: 'api.heygen.com' },
      { protocol: 'https', hostname: 'api.d-id.com' },
      { protocol: 'https', hostname: 'cdn.pixabay.com' },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
  },

  productionBrowserSourceMaps: false,

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // Exclude Remotion / Puppeteer from the client bundle — server only
  serverExternalPackages: [
    '@remotion/bundler',
    '@remotion/renderer',
    '@remotion/cli',
    'puppeteer-core',
    'sharp',
    'inngest',
  ],

  async headers() {
    return [
      // Security headers on all routes
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control',  value: 'on' },
          { key: 'X-Frame-Options',          value: 'DENY' },
          { key: 'X-Content-Type-Options',   value: 'nosniff' },
          { key: 'X-XSS-Protection',         value: '1; mode=block' },
          { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',       value: 'geolocation=(), microphone=(), camera=()' },
        ],
      },
      // CORS headers on API routes — dynamically computed so previews work
      {
        source: '/api/:path*',
        headers: CORS_HEADERS,
      },
      // Long-lived cache for immutable static assets
      {
        source: '/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },

  async redirects() {
    return [
      { source: '/docs',     destination: 'https://docs.voxara.app',     permanent: true },
      { source: '/api/docs', destination: 'https://docs.voxara.app/api', permanent: true },
    ];
  },

  async rewrites() {
    return { beforeFiles: [] };
  },

  turbopack: {},
  webpack: (config) => config,

  env: {
    NEXT_PUBLIC_APP_URL:             process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL:        process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_VERSION:         process.env.NEXT_PUBLIC_APP_VERSION ?? 'dev',
  },

  reactStrictMode: true,
  poweredByHeader: false,

  typescript: {
    tsconfigPath: './tsconfig.json',
  },
};

// Wrap with Sentry for automatic error capture in the build pipeline
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org:     process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  disableServerWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
  disableClientWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
  hideSourceMaps: true,
  widenClientFileUpload: true,
});
