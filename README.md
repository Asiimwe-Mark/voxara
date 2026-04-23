# voxara

> AI-powered SaaS for creating viral faceless and avatar-based videos — no camera or editing skills required.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com)
[![Stripe](https://img.shields.io/badge/Stripe-payments-blueviolet?logo=stripe)](https://stripe.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Getting Started](#getting-started)
6. [Environment Variables](#environment-variables)
7. [Database Migrations](#database-migrations)
8. [Running Locally](#running-locally)
9. [Deployment](#deployment)
10. [Monetization](#monetization)
11. [API Reference](#api-reference)
12. [Testing](#testing)
13. [Contributing](#contributing)

---

## Overview

voxara lets anyone turn a topic into a professional video in minutes:

1. Enter a topic → Gemini AI generates a script
2. Edge TTS converts the script to a natural voiceover
3. Pexels stock footage is matched to the script keywords
4. Remotion assembles everything into an MP4
5. Mux hosts it for adaptive streaming
6. One click publishes to YouTube, TikTok, or Instagram

Users can optionally use AI avatars (HeyGen, D-ID, Synthesia fallback chain) or clone their own voice (ElevenLabs).

---

## Features

| Category | Features |
|---|---|
| **AI** | Script generation (Gemini), SEO optimisation, AI auto-edit timeline |
| **Video** | Faceless (Remotion + stock footage), AI Avatar (HeyGen → D-ID → Synthesia) |
| **Voice** | Edge TTS (free), ElevenLabs voice cloning (Pro+) |
| **Publishing** | YouTube, TikTok, Instagram OAuth; scheduled publishing |
| **Billing** | Stripe subscriptions (Free / Pro / Agency), credit packs, auto top-up |
| **Analytics** | Views, watch time, CTR, retention per video |
| **Teams** | Multi-user workspaces, role-based access |
| **API** | Public REST API with SHA-256 hashed API keys |
| **Marketplace** | Creator template marketplace with Stripe Connect payouts |
| **Infra** | Inngest background jobs, Upstash rate limiting, Resend emails |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Auth & DB | Supabase (PostgreSQL + Row Level Security) |
| AI | Google Gemini 2.0 Flash |
| Video render | Remotion 4 |
| Video streaming | Mux |
| Background jobs | Inngest |
| Payments | Stripe (subscriptions + Connect) |
| Email | Resend + React Email |
| Voice | Edge TTS / ElevenLabs |
| Avatar | HeyGen, D-ID, Synthesia |
| Stock footage | Pexels |
| Rate limiting | Upstash Redis |

---

## Architecture

```
Browser ──► Next.js App Router
              ├── /app/(marketing)     Landing, Pricing
              ├── /app/(auth)          Login, Sign-up, Reset password
              ├── /app/dashboard       Protected dashboard pages
              └── /app/api             REST API routes
                    ├── /stripe        Checkout, Portal, Webhooks
                    ├── /videos        CRUD + render trigger
                    ├── /ai            Script gen, Auto-edit, SEO
                    ├── /avatar        Create, status, list
                    ├── /voice         Clone, list
                    ├── /oauth         YouTube, TikTok, Instagram
                    ├── /publish       YouTube direct + scheduled
                    ├── /marketplace   Templates + purchases
                    └── /v1            Public API (API key auth)

Inngest workers (background)
  ├── generate-video   Voiceover → stock footage → Remotion → Mux
  ├── poll-avatar-status   Poll HeyGen until avatar is ready
  ├── process-auto-top-up  Charge card, add credits
  ├── publish-scheduled    Post to social platforms at scheduled time
  └── aggregate-metrics    Roll up daily analytics
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account
- API keys for the services you want to use (see [Environment Variables](#environment-variables))

### 1. Clone and install

```bash
git clone https://github.com/your-org/faceless-video-saas.git
cd faceless-video-saas
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
# Open .env.local and fill in every value
```

See [Environment Variables](#environment-variables) for a description of each key.

### 3. Database migrations

```bash
# Using the Supabase CLI:
supabase db push

# Or apply manually in the Supabase SQL editor,
# in numerical order from supabase/migrations/
```

### 4. Stripe setup

1. Create **Products** in the Stripe Dashboard for Pro and Agency plans (monthly + yearly prices).
2. Copy each **Price ID** into `.env.local` (`STRIPE_PRO_MONTHLY_PRICE_ID`, etc.).
3. Configure a **Customer Portal** and copy its configuration ID.
4. Point Stripe webhooks to `https://your-domain.com/api/stripe/webhook` and select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

### 5. Inngest setup

1. Sign up at [inngest.com](https://www.inngest.com) and create an app.
2. Copy the **Event Key** and **Signing Key** into `.env.local`.
3. In development, run the Inngest dev server alongside Next.js (see [Running Locally](#running-locally)).

---

## Environment Variables

See `.env.example` for the full list with descriptions. Minimum required to start:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role (server-only) |
| `GEMINI_API_KEY` | ✅ | Google AI Gemini key |
| `STRIPE_SECRET_KEY` | ✅ | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe webhook signing secret |
| `MUX_TOKEN_ID` / `MUX_TOKEN_SECRET` | ✅ | Mux video platform credentials |
| `INNGEST_EVENT_KEY` | ✅ | Inngest event ingestion key |
| `RESEND_API_KEY` | ✅ | Resend transactional email key |
| `PEXELS_API_KEY` | ✅ | Pexels stock footage API key |

---

## Database Migrations

All migrations live in `supabase/migrations/` and must be applied in order:

| File | Description |
|---|---|
| `001_initial_schema.sql` | Profiles, videos, storage, RLS |
| `002_billing.sql` | Stripe tables, credit purchases, auto top-up |
| `003_avatars_voices.sql` | User avatars and cloned voices |
| `004_teams.sql` | Team workspaces and member roles |
| `005_analytics.sql` | Video metrics aggregation |
| `006_marketplace.sql` | Template marketplace and creator accounts |
| `007_api_keys.sql` | Hashed API keys for public API |
| `008_atomic_credit_ops.sql` | Atomic `deduct_credits` / `add_credits` RPCs |

---

## Running Locally

```bash
# Terminal 1 — Next.js dev server
npm run dev

# Terminal 2 — Inngest dev server (forwards events to localhost)
npx inngest-cli@latest dev -u http://localhost:3000/api/inngest

# Terminal 3 — Stripe webhook forwarding (optional)
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

### Vercel (recommended)

1. Push to GitHub and import the repo in [Vercel](https://vercel.com).
2. Add all environment variables from `.env.example`.
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `.next`

### Docker

```bash
docker build -t faceless-video .
docker run -p 3000:3000 --env-file .env.local faceless-video
```

See `docker/docker-compose.yml` for a full stack including Kong gateway.

### CI/CD

`.github/workflows/ci.yml` runs lint and tests on every PR.  
`.github/workflows/deploy.yml` — fill in your deployment commands (Vercel CLI, fly.io, etc.).

---

## Monetization

### Plans

| Plan | Price | Credits/month | Key features |
|---|---|---|---|
| Free | $0 | 3 | 720p, watermark |
| Pro | $19/mo or $15/mo yearly | 30 | 1080p, no watermark, voice cloning |
| Agency | $49/mo or $39/mo yearly | 100 | 4K, white-label, avatars, team, API |

### Credit Packs (one-time)

Users can purchase additional credits via Stripe without changing their plan. Credit packs are defined in the `credit_packs` table and surfaced on the Billing page.

### Auto Top-Up

Users on any paid plan can enable automatic top-up: when credits drop below a threshold, a payment is automatically charged and credits are added via the `process-auto-top-up` Inngest function.

### Template Marketplace

Creators can list video templates for sale. The platform takes a 10% fee; the rest is transferred to the creator's Stripe Connect account. Managed in `supabase/migrations/006_marketplace.sql`.

---

## API Reference

All public API endpoints are prefixed `/api/v1/` and require an `x-api-key` header (Agency plan).

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/videos` | GET | List your videos |
| `/api/v1/credits` | GET | Get current credit balance and plan |

API keys are created in **Dashboard → Settings → API Keys**. Keys are shown once at creation; only a SHA-256 hash is stored.

---

## Testing

```bash
# Unit + integration tests (Vitest)
npm test

# End-to-end tests (Playwright)
npm run test:e2e
```

Tests live in `tests/`:

```
tests/
├── unit/
│   ├── api-key.test.ts         Key generation and hashing
│   ├── credits.test.ts         Credit deduction logic
│   └── script-generator.test.ts  AI prompt formatting
├── integration/
│   ├── auth.test.ts            Sign-up / sign-in flow
│   └── video-generation.test.ts  End-to-end generation pipeline
└── e2e/
    ├── auth.spec.ts            Browser auth flows
    └── video.spec.ts           Create and render video
```

---

## Contributing

1. Fork the repo and create a branch: `git checkout -b feat/my-feature`
2. Make your changes and add tests
3. Run `npm run lint && npm test`
4. Open a pull request with a clear description

Please follow the existing code style (ESLint + Prettier config included).

---

## License

[MIT](LICENSE) © voxara Contributors
