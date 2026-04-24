/**
 * Application-wide constants and configuration
 */

// API Configuration
export const API_CONFIG = {
  VERSION: 'v1',
  TIMEOUT_MS: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  MAX_FILE_SIZE_MB: 100,
};

// Video Generation Configuration
export const VIDEO_CONFIG = {
  MIN_SCRIPT_LENGTH: 10,
  MAX_SCRIPT_LENGTH: 10000,
  DEFAULT_DURATION_SECONDS: 60,
  MAX_DURATION_SECONDS: 600,
  SUPPORTED_QUALITIES: ['720p', '1080p', '4k'],
  SUPPORTED_FORMATS: ['mp4', 'webm'],
  DEFAULT_FRAME_RATE: 30,
  DEFAULT_BITRATE_KBPS: 5000,
};

// Credit Configuration
export const CREDITS_CONFIG = {
  FREE_TIER_MONTHLY_CREDITS: 1, // Reduced from 3 to 1 to prevent abuse
  CREDITS_PER_VIDEO: 1,
  FREE_TRIAL_DURATION_DAYS: 7,
  // Social sharing rewards
  SOCIAL_SHARE_CREDITS: 2, // Credits earned per social share
  SOCIAL_SHARE_MAX_PER_MONTH: 5, // Max social share credits per month
};

// Pricing Configuration
export const PRICING_CONFIG = {
  PLANS: {
    FREE: { name: 'Free', monthlyCredits: 3, price: 0 },
    PRO: { name: 'Pro', monthlyCredits: 30, price: 2900 }, // $29.00 in cents
    AGENCY: { name: 'Agency', monthlyCredits: 100, price: 9900 }, // $99.00 in cents
  },
  CREDIT_PACKS: {
    PACK_10: { credits: 10, price: 900 }, // $9.00
    PACK_25: { credits: 25, price: 1900 }, // $19.00
    PACK_50: { credits: 50, price: 2900 }, // $29.00
  },
};

// Rate Limiting Configuration
export const RATE_LIMIT_CONFIG = {
  PUBLIC_API_REQUESTS_PER_MINUTE: 100,
  AUTHENTICATED_API_REQUESTS_PER_MINUTE: 300,
  SIGNUP_REQUESTS_PER_HOUR: 10,
  LOGIN_ATTEMPTS_PER_HOUR: 20,
  VIDEO_GENERATION_REQUESTS_PER_DAY: 50,
};

// Avatar & Voice Configuration
export const AI_CONFIG = {
  AVATAR_PROVIDERS: ['heygen', 'd-id', 'synthesia'],
  VOICE_PROVIDERS: ['elevenlabs', 'edge-tts', 'google-tts'],
  SUPPORTED_LANGUAGES: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh'],
  MAX_VOICE_SAMPLES: 10,
  VOICE_SAMPLE_DURATION_MS: 20000,
};

// Webhook Configuration
export const WEBHOOK_CONFIG = {
  MAX_RETRY_ATTEMPTS: 5,
  RETRY_BACKOFF_MULTIPLIER: 2,
  INITIAL_RETRY_DELAY_MS: 1000,
  MAX_RETRY_DELAY_MS: 60000,
  TIMEOUT_MS: 30000,
  BATCH_SIZE: 100,
};

// Storage Configuration
export const STORAGE_CONFIG = {
  MAX_VIDEO_SIZE_MB: 5000,
  MAX_AUDIO_SIZE_MB: 500,
  MAX_IMAGE_SIZE_MB: 50,
  RETENTION_DAYS: 365,
  ARCHIVE_AFTER_DAYS: 90,
};

// Authentication Configuration
export const AUTH_CONFIG = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  SESSION_DURATION_HOURS: 24,
  REFRESH_TOKEN_DURATION_DAYS: 30,
  FORGOT_PASSWORD_TOKEN_EXPIRY_MINUTES: 60,
  MFA_TOKEN_EXPIRY_MINUTES: 15,
};

// Email Configuration
export const EMAIL_CONFIG = {
  FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL || 'noreply@voxara.app',
  FROM_NAME: 'voxara',
  REPLY_TO: 'support@voxara.app',
  MAX_RECIPIENTS_PER_BATCH: 1000,
  RESEND_ON_BOUNCE: false,
};

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  BATCH_SIZE: 100,
  FLUSH_INTERVAL_MS: 10000,
  RETENTION_DAYS: 90,
  AGGREGATION_INTERVAL_HOURS: 1,
};

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Authentication required. Please log in.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  BAD_REQUEST: 'Invalid request parameters.',
  INTERNAL_ERROR: 'An unexpected error occurred. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  INVALID_EMAIL: 'Invalid email address format.',
  WEAK_PASSWORD: 'Password does not meet security requirements.',
  EMAIL_EXISTS: 'An account with this email already exists.',
  CREDITS_INSUFFICIENT: 'You have insufficient credits to perform this action.',
  VIDEO_NOT_READY: 'Video is still being processed. Please try again later.',
  AVATAR_NOT_READY: 'Avatar is still being created. This can take a few minutes.',
  VOICE_NOT_READY: 'Voice clone is still being created. This can take a few minutes.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  VIDEO_CREATED: 'Video created successfully!',
  VIDEO_GENERATED: 'Video generated successfully!',
  VIDEO_PUBLISHED: 'Video published successfully!',
  AVATAR_CREATED: 'Avatar created successfully!',
  VOICE_CREATED: 'Voice clone created successfully!',
  PAYMENT_SUCCESS: 'Payment processed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  EMAIL_SENT: 'Email sent successfully!',
};

// Feature Flags
export const FEATURES = {
  ENABLE_VIDEO_EDITING: true,
  ENABLE_MARKETPLACE: true,
  ENABLE_TEAM_COLLABORATION: true,
  ENABLE_API_ACCESS: true,
  ENABLE_WEBHOOKS: true,
  ENABLE_AUTO_TOPUP: true,
  ENABLE_WHITE_LABEL: true,
  ENABLE_CUSTOM_DOMAIN: true,
};

// External Service Configuration
export const EXTERNAL_SERVICES = {
  HEYGEN_API_BASE: 'https://api.heygen.com',
  D_ID_API_BASE: 'https://api.d-id.com',
  SYNTHESIA_API_BASE: 'https://api.synthesia.io',
  ELEVENLABS_API_BASE: 'https://api.elevenlabs.io',
  PEXELS_API_BASE: 'https://api.pexels.com',
  STRIPE_API_BASE: 'https://api.stripe.com',
  MUX_API_BASE: 'https://api.mux.com',
};

// URL Configuration
export const URLS = {
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://voxara.app',
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.voxara.app',
  DOCS_URL: 'https://docs.voxara.app',
  SUPPORT_URL: 'https://support.voxara.app',
  STATUS_PAGE: 'https://status.voxara.app',
};
