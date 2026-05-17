# VOXARA - Complete Application Specification

## Project Overview
**Voxara** is an AI-powered video creation platform that enables users to create faceless videos and AI avatar videos without needing a camera. The platform includes video generation, social publishing, billing/subscriptions, team collaboration, and a template marketplace.

---

## Technology Stack

### Core Framework
- **Next.js 16.2.4** with App Router (React 19.2.5)
- **TypeScript 6.0.3**
- **Tailwind CSS 4.2.3** with custom design system

### Key Dependencies (exact versions)
```
@elevenlabs/elevenlabs-js: ^2.44.0
@genkit-ai/core: ^1.32.0
@genkit-ai/google-genai: ^1.32.0
@google/genai: *
@hookform/resolvers: ^5.2.2
@mux/mux-node: ^14.0.1
@mux/mux-player-react: ^3.11.8
@radix-ui/react-avatar: ^1.1.11
@radix-ui/react-checkbox: ^1.3.3
@radix-ui/react-dialog: ^1.1.15
@radix-ui/react-dropdown-menu: ^2.1.16
@radix-ui/react-label: ^2.1.8
@radix-ui/react-select: ^2.2.6
@radix-ui/react-slot: ^1.2.4
@radix-ui/react-switch: ^1.2.6
@radix-ui/react-tabs: ^1.1.13
@radix-ui/react-tooltip: ^1.2.8
@react-email/components: ^0.0.31
@remotion/bundler: ^4.0.450
@remotion/cli: ^4.0.450
@remotion/lambda: ^4.0.450
@remotion/media-utils: ^4.0.450
@remotion/player: ^4.0.450
@remotion/preload: ^4.0.450
@remotion/renderer: ^4.0.450
@remotion/tailwind: ^4.0.450
@sentry/nextjs: ^10.49.0
@supabase/ssr: ^0.10.2
@supabase/supabase-js: ^2.104.0
@travisvn/edge-tts: ^1.0.2
@upstash/ratelimit: ^2.0.8
@upstash/redis: ^1.37.0
axios: ^1.15.1
class-variance-authority: ^0.7.1
clsx: ^2.1.1
date-fns: ^4.1.0
flutterwave-node-v3: ^1.3.1
genkit: ^1.32.0
googleapis: ^171.4.0
inngest: ^4.2.4
lucide-react: ^1.8.0
motion: ^12.38.0
next-themes: ^0.4.6
pexels: ^1.4.0
qrcode: ^1.5.4
radix-ui: ^1.4.3
react-hook-form: ^7.73.1
react-icons: ^5.5.0
recharts: ^3.8.1
remotion: ^4.0.450
resend: ^6.12.2
sonner: ^2.0.7
tailwind-merge: ^3.5.0
zod: ^4.3.6
```

### Dev Dependencies
```
@playwright/test: ^1.59.1
@tailwindcss/forms: ^0.5.11
@tailwindcss/postcss: ^4.2.3
@types/node: ^25.6.0
@types/react: ^19.2.14
@types/react-dom: ^19.2.3
@typescript-eslint/eslint-plugin: ^8.59.0
@typescript-eslint/parser: ^8.59.0
@vitest/coverage-v8: ^4.1.5
autoprefixer: ^10.5.0
eslint: ^10.2.1
eslint-config-next: ^16.2.4
postcss: ^8.5.10
prettier: ^3.8.3
supabase: ^2.98.2
typescript: ^6.0.3
vitest: ^4.1.5
```

### Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Background Jobs**: Inngest
- **Video Hosting**: Mux
- **Payments* Paddle, Flutterwave
- **Email**: Resend
- **Monitoring**: Sentry
- **Rate Limiting**: Upstash Redis

---

## Complete File Structure

### Application Routes

#### Public Pages
```
src/app/(marketing)/layout.tsx         - Marketing layout with floating shapes
src/app/(marketing)/page.tsx            - Landing page (hero, features, pricing, FAQ)
src/app/(marketing)/pricing/page.tsx   - Pricing page with plan comparison
```

#### Auth Pages
```
src/app/(auth)/layout.tsx               - Auth layout
src/app/(auth)/login/page.tsx          - Login with email/password
src/app/(auth)/signup/page.tsx         - Signup with email/password
src/app/(auth)/reset-password/page.tsx  - Password reset request
src/app/(auth)/reset-password/confirm/page.tsx - Password reset confirmation
src/app/auth/callback/route.ts          - OAuth callback handler
src/app/invite/[token]/page.tsx         - Team invite acceptance
```

#### Dashboard Pages
```
src/app/dashboard/layout.tsx            - Dashboard layout with sidebar
src/app/dashboard/page.tsx             - Main dashboard (video list, stats)
src/app/dashboard/create/page.tsx      - Video creation wizard (topic→script→generating)
src/app/dashboard/ai-studio/page.tsx   - AI Avatar studio
src/app/dashboard/analytics/page.tsx  - Analytics dashboard with charts
src/app/dashboard/billing/page.tsx    - Billing & subscription management
src/app/dashboard/marketplace/page.tsx - Template marketplace
src/app/dashboard/team/page.tsx        - Team management
src/app/dashboard/settings/page.tsx    - Settings (profile, workspace, social, API, danger)
```

#### Admin Pages (role-based access)
```
src/app/dashboard/admin/layout.tsx     - Admin layout
src/app/dashboard/admin/page.tsx       - Admin dashboard
src/app/dashboard/admin/users/page.tsx - User management
src/app/dashboard/admin/billing/page.tsx - Billing management
src/app/dashboard/admin/analytics/page.tsx - System analytics
```

#### Legal Pages
```
src/app/legal/layout.tsx               - Legal layout
src/app/legal/page.tsx                - Legal index
src/app/legal/privacy/page.tsx         - Privacy policy
src/app/legal/terms/page.tsx           - Terms of service
src/app/legal/aup/page.tsx             - Acceptable use policy
src/app/legal/cookies/page.tsx         - Cookie policy
src/app/legal/refunds/page.tsx         - Refund policy
src/app/legal/sla/page.tsx             - SLA agreement
src/app/legal/dpa/page.tsx             - Data processing agreement
```

### API Routes

#### Auth APIs
```
src/app/api/auth/2fa/disable/route.ts       - Disable 2FA
src/app/api/auth/2fa/setup/route.ts         - Setup 2FA
src/app/api/auth/2fa/validate/route.ts      - Validate 2FA code
src/app/api/auth/2fa/verify/route.ts        - Verify 2FA
src/app/api/auth/reset-password/route.ts    - Password reset
```

#### AI APIs
```
src/app/api/ai/generate-script/route.ts     - Generate video script using AI
src/app/api/ai/auto-edit/route.ts          - Auto-edit video
```

#### Avatar APIs
```
src/app/api/avatar/create/route.ts         - Create AI avatar
src/app/api/avatar/list/route.ts           - List user avatars
src/app/api/avatar/regenerate/route.ts      - Regenerate avatar
src/app/api/avatar/status/route.ts          - Check avatar status
```

#### Voice APIs
```
src/app/api/voice/clone/route.ts            - Clone voice
src/app/api/voice/list/route.ts            - List user voices
```

#### Video APIs
```
src/app/api/videos/route.ts                - List/create videos
src/app/api/videos/render/route.ts         - Trigger video rendering
src/app/api/videos/[id]/route.ts           - Get/update/delete video
src/app/api/videos/[id]/timeline/route.ts  - Video timeline
src/app/api/v1/videos/route.ts             - v1 videos API
```

#### Publishing APIs
```
src/app/api/publish/youtube/route.ts       - Publish to YouTube
src/app/api/publish/tiktok/route.ts        - Publish to TikTok
src/app/api/publish/instagram/route.ts      - Publish to Instagram
src/app/api/publish/schedule/route.ts      - Schedule publishing
```

#### OAuth APIs
```
src/app/api/oauth/youtube/route.ts          - YouTube OAuth initiation
src/app/api/oauth/youtube/callback/route.ts - YouTube OAuth callback
src/app/api/oauth/tiktok/route.ts           - TikTok OAuth initiation
src/app/api/oauth/tiktok/callback/route.ts  - TikTok OAuth callback
src/app/api/oauth/instagram/route.ts         - Instagram OAuth initiation
src/app/api/oauth/instagram/callback/route.ts - Instagram OAuth callback
src/app/api/oauth/disconnect/route.ts        - Disconnect social account
```

#### Billing APIs
```
src/app/api/stripe/checkout/route.ts        - Stripe checkout
src/app/api/stripe/portal/route.ts         - Stripe customer portal
src/app/api/stripe/webhook/route.ts         - Stripe webhook handler
src/app/api/billing/history/route.ts        - Billing history
src/app/api/billing/auto-top-up/route.ts    - Auto top-up settings
```

#### Other APIs
```
src/app/api/marketplace/templates/route.ts  - List templates
src/app/api/marketplace/purchase/route.ts   - Purchase template
src/app/api/team/invite/route.ts            - Team invitation
src/app/api/organizations/route.ts          - Organization management
src/app/api/analytics/overview/route.ts     - Analytics overview
src/app/api/analytics/track/route.ts        - Track analytics
src/app/api/referral/route.ts               - Referral system
src/app/api/credits/share/route.ts          - Share for credits
src/app/api/keys/route.ts                   - API key management
src/app/api/keys/[id]/route.ts             - API key CRUD
src/app/api/seo/analyze/route.ts            - SEO analysis
src/app/api/social/share/route.ts           - Social sharing
src/app/api/upload/route.ts                 - File upload
src/app/api/webhook/route.ts                - General webhook
src/app/api/health/route.ts                 - Health check
src/app/api/inngest/route.ts                - Inngest webhook
```

#### v1 Webhooks
```
src/app/api/v1/webhooks/mux/route.ts         - Mux webhook
src/app/api/v1/webhooks/heygen/route.ts     - HeyGen webhook
src/app/api/webhooks/heygen/route.ts        - HeyGen webhook alt
```

---

## UI Components

### Core Components
```
src/components/analytics/AnalyticsDashboard.tsx  - Analytics with charts
src/components/credits/ReferralCard.tsx          - Referral system card
src/components/credits/ShareForCredits.tsx        - Share video for credits
src/components/dashboard/credits-badge.tsx       - Credits display badge
src/components/dashboard/header.tsx              - Dashboard header with user menu
src/components/dashboard/sidebar.tsx            - Navigation sidebar
src/components/dashboard/video-card.tsx         - Video card with actions
src/components/email/WelcomeEmail.tsx           - Welcome email template
src/components/marketing/FloatingShapes.tsx      - Decorative floating shapes
src/components/marketing/Hero.tsx               - Landing hero section
src/components/marketing/PricingSection.tsx      - Pricing comparison
src/components/marketing/FeatureCards.tsx        - Feature cards
src/components/navigation/Breadcrumbs.tsx      - Breadcrumb navigation
src/components/settings/ProfileSettings.tsx      - Profile settings
src/components/settings/ConnectedAccounts.tsx    - Social accounts
src/components/settings/ApiKeyManager.tsx         - API key management
src/components/settings/DangerZone.tsx           - Account deletion
src/components/settings/WorkspaceSettings.tsx   - Workspace settings
src/components/video/TopicForm.tsx              - Video topic input form
src/components/video/ScriptEditor.tsx           - Script editing
src/components/video/ProgressTracker.tsx       - Creation progress
```

### UI Primitive Components
```
src/components/ui/alert-dialog.tsx
src/components/ui/avatar.tsx
src/components/ui/badge.tsx
src/components/ui/button.tsx
src/components/ui/card.tsx
src/components/ui/checkbox.tsx
src/components/ui/dialog.tsx
src/components/ui/dropdown-menu.tsx
src/components/ui/empty-state.tsx
src/components/ui/floating-shapes.tsx
src/components/ui/form-wrapper.tsx
src/components/ui/form.tsx
src/components/ui/input.tsx
src/components/ui/label.tsx
src/components/ui/loading-spinner.tsx
src/components/ui/premium-card.tsx
src/components/ui/progress.tsx
src/components/ui/radio-group.tsx
src/components/ui/select.tsx
src/components/ui/separator.tsx
src/components/ui/sidebar.tsx
src/components/ui/skeleton.tsx
src/components/ui/slider.tsx
src/components/ui/status-badge.tsx
src/components/ui/switch.tsx
src/components/ui/tabs.tsx
src/components/ui/textarea.tsx
src/components/ui/tooltip.tsx
src/components/ui/theme-provider.tsx
```

---

## Feature Services

### Avatar Services
```
src/features/avatar/services/d-id.ts
src/features/avatar/services/elevenlabs.ts
src/features/avatar/services/heygen.ts
src/features/avatar/services/synthesia.ts
```

### Billing Services
```
src/features/billing/hooks/useCredit.ts
src/features/billing/services/subscription.ts
```

### Social Services
```
src/features/social/hooks/useSocialAccounts.ts
src/features/social/services/instagram.ts
src/features/social/services/linkedin.ts
src/features/social/services/tiktok.ts
src/features/social/services/youtube.ts
```

### Video Services
```
src/features/video/hooks/useVideoStatus.ts
src/features/video/services/renderer.ts
src/features/video/services/script-generator.ts
src/features/video/services/visuals.ts
src/features/video/services/voiceover.ts
```

---

## Library Files

### Supabase
```
src/lib/supabase/admin.ts      - Admin client
src/lib/supabase/client.ts     - Browser client
src/lib/supabase/middleware.ts - Middleware client
src/lib/supabase/server.ts     - Server client
src/lib/supabase/types.ts      - Database types
src/lib/supabase/with-admin.ts - Admin context helper
```

### Payments
```
src/lib/paddle/client.ts        - Paddle client
src/lib/paddle/event-handlers.ts
src/lib/paddle/webhook-utils.ts
src/lib/flutterwave/client.ts   - Flutterwave client
src/lib/payment-adapter.ts      - Payment provider abstraction
```

### External Services
```
src/lib/ai/seo-optimizer.ts     - SEO AI
src/lib/voice-router.ts         - Voice service router
src/lib/social/youtube.ts      - YouTube API
```

### Infrastructure
```
src/lib/rate-limit.ts           - Rate limiting
src/lib/analytics/tracker.ts    - Analytics tracker
src/lib/email/service.ts        - Email service
src/lib/email/avatar-notification.ts
src/lib/email/template.tsx      - Email templates
src/lib/webhook-logger.ts       - Webhook logging
src/lib/webhooks/deliver.ts     - Webhook delivery
src/lib/monitoring.ts           - Monitoring/observability
src/lib/logger.ts               - Logging utility
src/lib/error-handler.ts        - Error handling
src/lib/security.ts             - Security utilities
src/lib/security.node.ts        - Node security
src/lib/two-factor-auth.ts      - 2FA
src/lib/totp-encryption.ts      - TOTP encryption
```

### Utilities
```
src/lib/utils.ts                - General utilities
src/lib/constants.ts            - App constants
src/lib/credits.ts              - Credit management
src/lib/icons.ts                - Custom icons (YouTube, Instagram, TikTok)
src/lib/api-keys.ts             - API key utilities
src/lib/api/cors.ts             - CORS handling
src/lib/env.ts                  - Environment variable validation
src/lib/resend.ts               - Email client
src/lib/render/video-renderer.ts - Video rendering
```

---

## Inngest Background Functions
```
src/inngest/client.ts                   - Inngest client setup
src/inngest/functions/index.ts         - Function exports
src/inngest/functions/generate-video.ts - Video generation
src/inngest/functions/auto-top-up.ts   - Auto top-up trigger
src/inngest/functions/aggregate-metrics.ts - Metrics aggregation
src/inngest/functions/poll-avatar-status.ts - Avatar status polling
src/inngest/functions/cancel-avatar-polling.ts - Cancel avatar polling
src/inngest/functions/publish-scheduled.ts - Scheduled publishing
```

---

## Database Schema (Supabase PostgreSQL)

### Tables

#### profiles
```sql
- id: string (PK, references auth.users)
- email: string | null
- full_name: string | null
- avatar_url: string | null
- credits: number | null (default: 1 for free users)
- plan: string | null (free, pro, agency)
- subscription_status: string | null
- current_organization_id: string | null (FK to organizations)
- created_at: timestamp
- updated_at: timestamp
```

#### videos
```sql
- id: string (PK)
- user_id: string (FK to auth.users, required)
- title: string | null
- script: string | null
- status: string | null (pending, processing, ready, failed)
- mux_playback_id: string | null
- video_url: string | null
- youtube_id: string | null
- avatar_id: string | null (FK to user_avatars)
- voice_id: string | null (FK to user_voices)
- organization_id: string | null (FK to organizations)
- webhook_url: string | null
- published_at: timestamp | null
- created_at: timestamp
- updated_at: timestamp
```

#### user_avatars
```sql
- id: string (PK)
- user_id: string (FK to auth.users, required)
- name: string (required)
- avatar_model_id: string | null
- image_url: string | null
- provider: string | null (heygen, elevenlabs, etc.)
- status: string | null (pending, ready, failed)
- heygen_task_id: string | null
- gender: string | null
- polling_canceled: boolean | null
- created_at: timestamp
- updated_at: timestamp
```

#### user_voices
```sql
- id: string (PK)
- user_id: string (FK to auth.users, required)
- name: string (required)
- voice_id: string | null
- sample_audio_url: string | null
- status: string | null (pending, ready, failed)
- created_at: timestamp
```

#### organizations
```sql
- id: string (PK)
- name: string (required)
- slug: string (required, unique)
- logo_url: string | null
- created_by: string | null
- created_at: timestamp
- updated_at: timestamp
```

#### organization_members
```sql
- id: string (PK)
- organization_id: string (FK to organizations, required)
- user_id: string (required)
- role: string | null (admin, member)
- joined_at: timestamp | null
```

#### organization_invites
```sql
- id: string (PK)
- organization_id: string (FK to organizations, required)
- email: string (required)
- role: string (required)
- invited_by: string | null
- token: string (required, unique)
- expires_at: timestamp (required)
- accepted_at: timestamp | null
- created_at: timestamp
```

#### organization_subscriptions
```sql
- id: string (PK)
- organization_id: string (FK to organizations, required, unique)
- plan: string | null
- status: string | null
- stripe_subscription_id: string | null
- seats: number | null
- credits_shared: number | null
- current_period_end: timestamp | null
- created_at: timestamp
- updated_at: timestamp
```

#### credit_packs
```sql
- id: string (PK)
- name: string (required)
- credits: number (required)
- price_amount: number (required)
- provider_price_id: string | null
- active: boolean | null
- created_at: timestamp
```

#### credit_purchases
```sql
- id: string (PK)
- user_id: string | null
- credit_pack_id: string | null (FK to credit_packs)
- credits_purchased: number | null
- amount_paid: number | null
- provider: string | null
- provider_tx_id: string | null
- payment_intent_id: string | null
- status: string | null
- created_at: timestamp
```

#### auto_top_up_settings
```sql
- id: string (PK)
- user_id: string (required)
- enabled: boolean | null
- threshold: number | null
- top_up_amount: number | null
- updated_at: timestamp
```

#### pending_credit_purchases
```sql
- id: number (PK, auto-increment)
- user_id: string | null
- credits_pending: number (required)
- provider: string | null
- tx_ref: string | null
- status: string | null
- metadata: json | null
- created_at: timestamp
- updated_at: timestamp
```

#### payment_sessions
```sql
- id: number (PK, auto-increment)
- user_id: string | null
- session_id: string | null
- provider: string | null
- status: string | null
- credits: number | null
- plan_type: string | null
- metadata: json | null
- created_at: timestamp
- updated_at: timestamp
```

#### payment_customers
```sql
- id: string (PK)
- user_id: string | null
- provider: string | null
- payment_customer_id: string | null
- paddle_customer_id: string | null
- flutterwave_customer_id: string | null
- metadata: json | null
- created_at: timestamp
```

#### payment_subscriptions
```sql
- id: string (PK)
- user_id: string | null
- provider: string | null
- subscription_id: string | null
- provider_subscription_id: string | null
- plan: string | null
- status: string | null
- current_period_end: timestamp | null
- metadata: json | null
- created_at: timestamp
- updated_at: timestamp
```

#### stripe_customers
```sql
- id: string (PK)
- user_id: string (required)
- stripe_customer_id: string (required)
- created_at: timestamp
```

#### social_accounts
```sql
- id: string (PK)
- user_id: string | null
- platform: string | null (youtube, tiktok, instagram)
- account_id: string | null
- account_name: string | null
- created_at: timestamp
```

#### social_shares
```sql
- id: string (PK)
- user_id: string (required)
- video_id: string (FK to videos, required)
- platform: string (required)
- share_url: string | null
- credits_awarded: number | null
- created_at: timestamp
```

#### social_share_monthly_limits
```sql
- id: string (PK)
- user_id: string (required)
- month: string (required, format: YYYY-MM)
- credits_earned: number | null
```

#### video_publishes
```sql
- id: string (PK)
- user_id: string (required)
- video_id: string (FK to videos, required)
- platform: string (required)
- external_id: string | null
- status: string (required)
- error_message: string | null
- published_at: timestamp | null
- created_at: timestamp
```

#### publishing_schedules
```sql
- id: string (PK)
- user_id: string (required)
- video_id: string (FK to videos, required)
- platform: string (required)
- scheduled_at: timestamp (required)
- title: string | null
- caption: string | null
- status: string | null
- created_at: timestamp
```

#### video_templates
```sql
- id: string (PK)
- name: string (required)
- description: string | null
- preview_url: string | null
- category: string | null
- price: number | null
- rating: number | null
- downloads: number | null
- status: string | null
- template_data: json | null
- creator_id: string | null
- created_at: timestamp
- updated_at: timestamp
```

#### video_metrics
```sql
- id: string (PK)
- video_id: string (FK to videos, required)
- user_id: string (required)
- date: string (required, format: YYYY-MM-DD)
- views: number | null
- unique_viewers: number | null
- clicks: number | null
- ctr: number | null
- watch_time_seconds: number | null
- average_view_percentage: number | null
- retention_30s: number | null
- retention_60s: number | null
- retention_complete: number | null
- created_at: timestamp
- updated_at: timestamp
```

#### viewer_sessions
```sql
- id: string (PK)
- video_id: string (FK to videos, required)
- session_id: string (required)
- viewer_id: string | null
- start_time: timestamp (required)
- end_time: timestamp | null
- watch_duration: number | null
- watch_percentage: number | null
- country: string | null
- browser: string | null
- device_type: string | null
- referrer: string | null
- utm_source: string | null
- utm_medium: string | null
- utm_campaign: string | null
- playback_events: json | null
- created_at: timestamp
```

#### api_keys
```sql
- id: string (PK)
- user_id: string (required)
- name: string (required)
- key_hash: string (required)
- key_preview: string (required)
- permissions: string[] | null
- status: string | null
- expires_at: timestamp | null
- last_used_at: timestamp | null
- created_at: timestamp
- updated_at: timestamp
```

#### ab_experiments
```sql
- id: string (PK)
- user_id: string (required)
- video_id: string (FK to videos, required)
- name: string (required)
- type: string (required)
- variants: json (required)
- winner_variant_id: string | null
- confidence_level: number | null
- start_time: timestamp (required)
- end_time: timestamp | null
- status: string | null
- metrics: json | null
- created_at: timestamp
```

#### ab_impressions
```sql
- id: string (PK)
- experiment_id: string | null (FK to ab_experiments)
- variant_id: string (required)
- session_id: string (required)
- impression_time: timestamp (required)
- clicked: boolean | null
- click_time: timestamp | null
- watched_duration: number | null
- created_at: timestamp
```

#### seo_performance
```sql
- id: string (PK)
- video_id: string (FK to videos, required)
- user_id: string (required)
- overall_seo_score: number | null
- title_score: number | null
- description_score: number | null
- tags_score: number | null
- search_impressions: number | null
- search_clicks: number | null
- search_ctr: number | null
- average_position: number | null
- keyword_rankings: json | null
- suggestions: json | null
- checked_at: timestamp | null
```

#### webhook_endpoints
```sql
- id: string (PK)
- user_id: string (required)
- url: string (required)
- events: string[] (required)
- secret: string (required)
- status: string | null
- created_at: timestamp
- updated_at: timestamp
```

#### webhook_logs
```sql
- id: string (PK)
- user_id: string | null
- endpoint_id: string | null (FK to webhook_endpoints)
- event_type: string (required)
- provider: string | null
- payload: json | null
- metadata: json | null
- status: string | null
- response_status: number | null
- response_body: string | null
- duration_ms: number | null
- error_message: string | null
- created_at: timestamp
- updated_at: timestamp
```

### Database Views

#### webhook_stats_24h
```sql
- event_type: string | null
- provider: string | null
- status: string | null
- count: number | null
- count_last_hour: number | null
- count_last_6h: number | null
```

### Database Functions

```sql
add_credits(p_credits: number, p_user_id: string) -> void
deduct_credits(p_credits?: number, p_user_id: string) -> boolean
award_social_share_credits(p_user_id: string, p_video_id: string, p_platform: string) -> boolean
get_remaining_social_share_credits(p_user_id: string) -> number
get_video_share_status(p_user_id: string, p_video_id: string) -> table(platform, shared, credits_awarded)[]
create_organization(p_name: string, p_slug: string, p_user_id?: string) -> string
get_user_organizations(p_user_id?: string) -> table(...)
switch_organization(p_organization_id: string) -> void
delete_user_account() -> void
aggregate_daily_metrics(p_date?: string) -> number
cleanup_old_sessions() -> number
```

---

## Environment Variables

### Required
```
NEXT_PUBLIC_APP_URL               - App URL (e.g., http://localhost:3000)
NEXT_PUBLIC_SUPABASE_URL          - Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     - Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY         - Supabase service role key
```

### AI Providers (at least one required)
```
GOOGLE_GENAI_API_KEY              - Google Gemini API key
GOOGLE_GENERATIVE_AI_API_KEY      - Alt Gemini key
ANTHROPIC_API_KEY                 - Anthropic/Claude API key
```

### Voice Services
```
ELEVENLABS_API_KEY                - ElevenLabs API key
```

### Video Services
```
MUX_TOKEN_ID                      - Mux token ID
MUX_TOKEN_SECRET                  - Mux token secret
MUX_WEBHOOK_SECRET                - Mux webhook secret
```

### Avatar Services
```
HEYGEN_API_KEY                    - HeyGen API key
HEYGEN_WEBHOOK_SECRET            - HeyGen webhook secret
```

### Stock Footage
```
PEXELS_API_KEY                    - Pexels API key
```

### Background Jobs
```
INNGEST_EVENT_KEY                 - Inngest event key
INNGEST_SIGNING_KEY              - Inngest signing key
```

### Email
```
RESEND_API_KEY                    - Resend API key
RESEND_FROM_EMAIL                 - From email (default: noreply@voxara.app)
```

### Payments
```
PADDLE_API_KEY                   - Paddle API key
PADDLE_WEBHOOK_SECRET            - Paddle webhook secret
FLUTTERWAVE_SECRET_KEY           - Flutterwave secret key
FLUTTERWAVE_WEBHOOK_SECRET       - Flutterwave webhook secret
```

### Rate Limiting
```
UPSTASH_REDIS_REST_URL            - Upstash Redis URL
UPSTASH_REDIS_REST_TOKEN          - Upstash Redis token
```

### Monitoring
```
NEXT_PUBLIC_SENTRY_DSN           - Sentry DSN
SENTRY_AUTH_TOKEN                - Sentry auth token
```

### Social OAuth
```
YOUTUBE_CLIENT_ID                - YouTube OAuth client ID
YOUTUBE_CLIENT_SECRET           - YouTube OAuth client secret
TIKTOK_CLIENT_KEY               - TikTok OAuth client key
TIKTOK_CLIENT_SECRET            - TikTok OAuth client secret
INSTAGRAM_CLIENT_ID             - Instagram OAuth client ID
INSTAGRAM_CLIENT_SECRET         - Instagram OAuth client secret
```

### Video Rendering
```
RENDER_BACKEND                   - auto, local, or lambda
REMOTION_LAMBDA_FUNCTION_NAME    - Lambda function name
REMOTION_SERVE_URL              - Remotion serve URL
AWS_REGION                       - AWS region (default: us-east-1)
AWS_ACCESS_KEY_ID               - AWS access key
AWS_SECRET_ACCESS_KEY           - AWS secret key
```

### Admin
```
ADMIN_USER_IDS                   - Comma-separated admin user IDs
```

---

## Design System

### CSS Variables
```css
--color-primary: hsl(221 83% 53%)
--color-primary-foreground: hsl(0 0% 100%)
--color-destructive: hsl(0 84.2% 60.2%)
--color-destructive-foreground: hsl(0 0% 100%)
--color-success: hsl(142 76% 36%)
--color-warning: hsl(38 92% 50%)
--background: hsl(0 0% 100%)
--foreground: hsl(222 47% 11%)
--card: hsl(0 0% 100%)
--card-foreground: hsl(222 47% 11%)
--popover: hsl(0 0% 100%)
--popover-foreground: hsl(222 47% 11%)
--muted: hsl(210 40% 96.1%)
--muted-foreground: hsl(215 16% 47%)
--accent: hsl(210 40% 96.1%)
--accent-foreground: hsl(222 47% 11%)
--border: hsl(214 32% 91%)
--input: hsl(214 32% 91%)
--ring: hsl(221 83% 53%)
--radius: 0.5rem
```

### Spacing Scale
```
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 3rem (48px)
3xl: 4rem (64px)
```

### Shadow System
```
shadow-xs: 0 1px 2px rgba(0,0,0,0.05)
shadow-sm: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)
shadow-md: 0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)
shadow-lg: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)
shadow-xl: 0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)
shadow-2xl: 0 25px 50px rgba(0,0,0,0.25)
```

### Animations
```css
animate-fadeIn: fade in with opacity
animate-slideInUp: slide up
animate-slideInDown: slide down
animate-slideInLeft: slide left
animate-slideInRight: slide right
animate-scaleIn: scale in from center
```

### Utility Classes
```css
.card-premium: Premium card styling with hover lift
.hover-lift: Lift effect on hover
.focus-ring: Accessible focus indicator
.empty-state: Empty state styling
.input-premium: Premium input styling
.transition-smooth: Standard 200ms transition
```

### Typography
```
text-h1: text-4xl font-bold tracking-tight
text-h2: text-3xl font-semibold
text-h3: text-2xl font-semibold
text-body: text-base leading-relaxed
text-small: text-sm leading-relaxed
```

---

## Features & Functionality

### Authentication
- Email/password signup and login
- Password reset with email
- OAuth callback handling
- Two-factor authentication (2FA)
- Session management via Supabase

### Video Creation
1. **Topic Entry**: User enters a topic, selects tone and duration
2. **AI Script Generation**: Uses Gemini/Claude to generate engaging script
3. **Script Review**: User can edit the generated script
4. **Video Type Selection**: Faceless (stock footage + voiceover) or AI Avatar
5. **Avatar Selection**: Users can select from their created avatars
6. **Voice Selection**: Default AI voice or custom cloned voice
7. **Rendering**: Trigger Inngest background job for video generation
8. **Status Tracking**: pending → processing → ready/failed

### AI Avatar Studio
- Create AI avatars via HeyGen integration
- List user avatars with status
- Regenerate failed avatars
- Avatar polling via Inngest

### Voice Cloning
- Clone voice via ElevenLabs or Edge TTS
- List user voices
- Use custom voice in avatar videos

### Video Rendering Pipeline
1. Script → Voiceover (TTS)
2. Voiceover + Script → Stock footage selection (Pexels)
3. Footage + Voiceover → Remotion composition
4. Render → Mux upload
5. Mux playback ID → Store in DB

### Social Publishing
- YouTube OAuth and publishing
- TikTok OAuth and publishing
- Instagram OAuth and publishing
- Scheduled publishing
- Video publish tracking

### Credits System
- Free users get 1 credit
- Purchase credit packs (Stripe/Paddle/Flutterwave)
- Auto top-up when credits low
- Earn credits by sharing videos on social media
- Referral system

### Analytics
- Video metrics (views, watch time, retention)
- Viewer sessions with UTM tracking
- A/B testing for video thumbnails
- SEO performance tracking
- Analytics charts using Recharts

### Team Collaboration
- Create organizations
- Invite team members
- Role-based access (admin, member)
- Shared organization credits

### Template Marketplace
- Browse video templates
- Purchase templates
- Template preview
- Category filtering

### Billing & Subscription
- Stripe checkout and portal
- Paddle integration
- Flutterwave integration
- Credit pack purchases
- Subscription management
- Auto top-up configuration

### Settings
- Profile settings (name, email, avatar)
- Workspace settings
- Connected social accounts
- API key management
- Danger zone (account deletion)

---

## API Specifications

### Video APIs

#### POST /api/videos/render
Trigger video rendering
```json
Request: { "videoId": "uuid" }
Response: { "success": true }
```

#### GET /api/videos/[id]
Get video details
```json
Response: {
  "id": "uuid",
  "title": "string",
  "status": "string",
  "script": "string",
  "mux_playback_id": "string",
  "video_url": "string",
  "created_at": "timestamp"
}
```

#### DELETE /api/videos/[id]
Delete video

### Publishing APIs

#### POST /api/publish/youtube
```json
Request: { "videoId": "uuid" }
Response: { "success": true, "youtube_id": "string" }
```

#### POST /api/publish/tiktok
```json
Request: { "videoId": "uuid" }
Response: { "success": true, "tiktok_id": "string" }
```

#### POST /api/publish/instagram
```json
Request: { "videoId": "uuid" }
Response: { "success": true, "instagram_id": "string" }
```

### AI APIs

#### POST /api/ai/generate-script
```json
Request: {
  "topic": "string",
  "tone": "professional|casual|funny",
  "duration": "30s|60s|90s|120s"
}
Response: { "script": "string" }
```

### Avatar APIs

#### POST /api/avatar/create
```json
Request: { "name": "string", "gender": "male|female" }
Response: { "avatarId": "uuid", "status": "pending" }
```

#### GET /api/avatar/list
```json
Response: {
  "avatars": [
    { "id": "uuid", "name": "string", "status": "ready", "image_url": "string" }
  ]
}
```

### Voice APIs

#### POST /api/voice/clone
```json
Request: { "name": "string", "audioUrl": "string" }
Response: { "voiceId": "uuid", "status": "pending" }
```

#### GET /api/voice/list
```json
Response: {
  "voices": [
    { "id": "uuid", "name": "string", "status": "ready", "sample_audio_url": "string" }
  ]
}
```

### OAuth APIs

#### GET /api/oauth/youtube
Initiates YouTube OAuth flow

#### GET /api/oauth/youtube/callback
Handles YouTube OAuth callback

### Billing APIs

#### POST /api/stripe/checkout
```json
Request: { "priceId": "string", "quantity": number }
Response: { "url": "string" }
```

#### POST /api/stripe/portal
```json
Response: { "url": "string" }
```

### Analytics APIs

#### POST /api/analytics/track
```json
Request: {
  "event": "video_view|video_complete|click",
  "videoId": "uuid",
  "metadata": { ... }
}
```

---

## External Service Integrations

### Mux
- Video upload and hosting
- Playback ID generation
- Webhook for video ready events
- Thumbnail generation

### HeyGen
- AI avatar creation
- Avatar video generation
- Status polling
- Webhook callbacks

### ElevenLabs
- Voice cloning
- Text-to-speech
- Voice list retrieval

### Pexels
- Stock video footage
- Video search by topic
- HD video downloads

### Gemini/Claude
- Script generation
- SEO optimization
- Auto-editing suggestions

### Stripe
- Credit pack purchases
- Subscription management
- Webhook handling
- Customer portal

### Paddle
- Alternative payment provider
- Credit purchases
- Subscription management

### Flutterwave
- African payment provider
- Credit purchases

### YouTube Data API
- Video upload
- OAuth authentication
- Channel management

### TikTok API
- Video publishing
- OAuth authentication

### Instagram Graph API
- Video publishing
- OAuth authentication

### Inngest
- Background job processing
- Video rendering pipeline
- Scheduled publishing
- Avatar polling

### Resend
- Transactional emails
- Welcome emails
- Avatar notification emails

### Sentry
- Error tracking
- Performance monitoring
- Crash reporting

### Upstash Redis
- Rate limiting
- API request throttling

---

## Security Features

### Authentication
- Supabase Auth with email/password
- OAuth providers (Google, etc.)
- Two-factor authentication
- Session management

### Authorization
- Role-based access control
- Organization-level permissions
- API key permissions

### Data Protection
- Encrypted TOTP secrets
- Secure webhook secrets
- API key hashing (bcrypt)

### Input Validation
- Zod schemas for all inputs
- Server-side validation
- Type-safe API handlers

### Rate Limiting
- Upstash Redis rate limiting
- API endpoint protection
- Credit purchase throttling

---

## Testing

### Unit Tests
- Vitest for component testing
- React Testing Library for UI

### E2E Tests
- Playwright for E2E
- UI mode for debugging
- Headed mode for screenshots

### Test Commands
```bash
npm test              # Run unit tests
npm run test:e2e      # Run E2E tests
npm run test:e2e:ui   # Run with Playwright UI
npm run test:coverage # Coverage report
npm run test:all      # Typecheck + tests
```

---

## Docker Support

### Dockerfiles
- Dockerfile: Production build
- Dockerfile.dev: Development build

### Docker Compose
- Services: app, postgres, redis
- Port: 3000

---

## Scripts

### Development
```bash
npm run dev           # Start dev server with turbo
npm run dev:turbo     # Force turbopack
```

### Build
```bash
npm run build         # Production build
npm run preview       # Build + preview
npm run analyze       # Bundle analysis
```

### Testing
```bash
npm run typecheck     # TypeScript check
npm run lint          # ESLint
npm run lint:fix      # Auto-fix lint
npm run check:all     # All checks
```

### Database
```bash
npm run db:migrate    # List migrations
npm run db:migrate:latest # Push latest
npm run db:reset      # Reset database
npm run db:seed       # Seed database
npm run db:types      # Generate types
```

### Webhooks
```bash
npm run webhooks:configure # Configure webhooks
npm run webhooks:test      # Test webhooks
```

### Inngest
```bash
npm run inngest:dev   # Local Inngest dev server
npm run inngest:sync  # Sync functions
```

### Deployment
```bash
npm run deploy         # Deploy to Vercel
npm run predeploy      # Pre-deployment checks
```

### Cleanup
```bash
npm run clean          # Clean build artifacts
npm run clean:node_modules # Full clean
```

---

## Error Handling

### Global Error Page
- src/app/global-error.tsx
- src/app/error.tsx
- src/app/dashboard/error.tsx

### Error Logging
- Sentry integration
- Custom logger utility
- Webhook error logging

### API Error Responses
```typescript
{
  error: string,
  code?: string,
  details?: object
}
```

---

## Performance Optimization

### Code Splitting
- Route-based splitting
- Dynamic imports for heavy components

### Caching
- Static page caching
- API response caching
- SWR/React Query patterns

### Image Optimization
- Next.js Image component
- Lazy loading
- Mux thumbnail optimization

### Bundle Size
- Bundle analysis
- Tree shaking
- Dead code elimination

---

## Accessibility

### WCAG Compliance
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management

### Features
- Dark/light theme toggle
- Reduced motion support
- Color contrast compliance
- Screen reader support

---

## Monitoring & Observability

### Sentry
- Error tracking
- Performance monitoring
- Release tracking

### Custom Logging
- Structured logs
- Log levels (info, warn, error)
- Context tracking

### Webhook Logging
- Endpoint logging
- Delivery status tracking
- Retry mechanisms

---

## Deployment

### Vercel
- Automatic deployments
- Environment variables
- Edge functions support

### Docker
- Containerized deployment
- Docker Compose for local
- Production Dockerfile

---

## Package.json Scripts Reference

```json
{
  "dev": "next dev --turbo",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:e2e": "playwright test",
  "docker:build": "docker build -t faceless-video:latest .",
  "docker:compose:up": "docker-compose -f docker/docker-compose.yml up -d",
  "db:types": "supabase gen types typescript --local > src/types/supabase.ts",
  "inngest:dev": "npx inngest-cli@latest dev",
  "deploy": "vercel --prod"
}
```

---

## Key Files to Implement

1. **Configuration**
   - next.config.js
   - tailwind.config.ts
   - postcss.config.js
   - tsconfig.json
   - .env.example

2. **Core Layouts**
   - src/app/layout.tsx (root)
   - src/app/(marketing)/layout.tsx
   - src/app/(auth)/layout.tsx
   - src/app/dashboard/layout.tsx

3. **Database Types**
   - src/lib/supabase/types.ts
   - src/types/supabase.ts (generated)

4. **Auth System**
   - src/lib/supabase/client.ts
   - src/lib/supabase/server.ts
   - src/lib/supabase/middleware.ts
   - All auth pages and API routes

5. **UI Components**
   - All src/components/ui/* primitives
   - src/components/dashboard/* components

6. **Pages**
   - All route pages
   - Error pages
   - Loading states

7. **API Routes**
   - All src/app/api/* routes

8. **Background Jobs**
   - src/inngest/* functions

9. **External Integrations**
   - All src/lib/* service files

10. **Styles**
    - src/app/globals.css
    - Design tokens

---

This specification contains EVERYTHING needed to recreate the complete Voxara application exactly as it exists. Every file path, every component, every API route, every database table, every integration, every configuration, and every feature is documented in detail.