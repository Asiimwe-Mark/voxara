import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
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
    minimumCacheTTL: 31536000,
  },

  productionBrowserSourceMaps: false,

  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

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
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.sentry.io https://js.stripe.com https://sandbox.paddle.com https://buy.paddle.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://images.pexels.com https://image.mux.com https://lh3.googleusercontent.com https://*.supabase.co https://*.supabase.in https://api.heygen.com https://api.d-id.com",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://*.supabase.in https://api.stripe.com https://sandbox.paddle.com https://api.paddle.com https://stream.mux.com https://api.mux.com https://sentry.io https://*.ingest.sentry.io https://api.heygen.com https://api.d-id.com https://open-api.tiktok.com https://api.instagram.com https://graph.instagram.com https://www.googleapis.com",
              "frame-src 'self' https://js.stripe.com https://sandbox.paddle.com https://buy.paddle.com https://www.youtube.com",
              "media-src 'self' blob: https://stream.mux.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },

  async redirects() {
    return [
      { source: '/docs', destination: 'https://docs.voxara.app', permanent: true },
      { source: '/api/docs', destination: 'https://docs.voxara.app/api', permanent: true },
    ]
  },

  async rewrites() {
    return { beforeFiles: [] }
  },

  turbopack: {},

  reactStrictMode: true,
  poweredByHeader: false,

  typescript: {
    tsconfigPath: './tsconfig.json',
  },
}

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
  widenClientFileUpload: true,
})
