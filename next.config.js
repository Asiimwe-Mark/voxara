/** @type {import('next').NextConfig} */
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
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
  },

  productionBrowserSourceMaps: false,

  // Next.js experimental options
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

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  async redirects() {
    return [
      { source: '/docs', destination: 'https://docs.voxara.app', permanent: true },
      { source: '/api/docs', destination: 'https://docs.voxara.app/api', permanent: true },
    ];
  },

  async rewrites() {
    return { beforeFiles: [] };
  },

  // Turbopack configuration
  turbopack: {},

  webpack: (config) => config,

  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  reactStrictMode: true,
  poweredByHeader: false,

  typescript: {
    tsconfigPath: './tsconfig.json',
  },
};

// Wrap with Sentry for automatic error capture in build pipeline
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(nextConfig, {
  // Sentry webpack plugin options
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Disable source map upload if no auth token set
  authToken: process.env.SENTRY_AUTH_TOKEN,
  disableServerWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
  disableClientWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
  hideSourceMaps: true,
  widenClientFileUpload: true,
});
