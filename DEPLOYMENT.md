# Voxara — Production Deployment Guide

## Prerequisites
- Node.js 20+ (LTS)
- npm 10+
- Vercel CLI: `npm i -g vercel`
- Supabase CLI: `npm i -g supabase`

---

## Step 1 — Environment Variables

Copy `.env.example` to `.env.local` for local dev:
```bash
cp .env.example .env.local
# Fill in your values
```

In Vercel dashboard: **Project → Settings → Environment Variables**  
Add every variable from `.env.example`. Required minimums:

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | From Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ | From Supabase project settings |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | From Supabase project settings |
| `NEXT_PUBLIC_APP_URL` | ✅ | Your production domain |
| `GEMINI_API_KEY` | ✅ | Script generation |
| `RESEND_API_KEY` | ✅ | Email delivery |
| `INNGEST_EVENT_KEY` | ✅ | Background jobs |
| `INNGEST_SIGNING_KEY` | ✅ | Background jobs |
| `PAYMENT_PROVIDER` | ✅ | `paddle` or `flutterwave` |
| `PADDLE_API_KEY` | ⚡ If using Paddle | |
| `FLUTTERWAVE_SECRET_KEY` | ⚡ If using Flutterwave | |
| `NEXT_PUBLIC_SENTRY_DSN` | Recommended | Error monitoring |

---

## Step 2 — Database Setup

```bash
# Login to Supabase CLI
npx supabase login

# Link your project
npx supabase link --project-ref YOUR_PROJECT_REF

# Run all migrations in order
npx supabase db push

# Verify migrations
npx supabase migration list
```

Expected: migrations 001–020 all applied successfully.

---

## Step 3 — Deploy to Vercel

```bash
# First time
vercel --prod

# Subsequent deploys
git push origin main  # Auto-deploys via Vercel Git integration
```

---

## Step 4 — Configure Webhooks

After your Vercel URL is live, configure each webhook:

### Paddle
```
Webhook URL: https://YOUR_DOMAIN/api/stripe/webhook
Events: transaction.completed, subscription.created, subscription.updated, subscription.canceled
```

### Mux
```
Webhook URL: https://YOUR_DOMAIN/api/v1/webhooks/mux
Events: video.asset.ready, video.upload.created
Signing secret: Copy to MUX_WEBHOOK_SECRET
```

### HeyGen
```
Webhook URL: https://YOUR_DOMAIN/api/v1/webhooks/heygen
Events: avatar_video.success, avatar_video.fail
```

### Inngest
```bash
# Point Inngest to your Vercel deployment
npx inngest-cli@latest sync https://YOUR_DOMAIN/api/inngest
```

---

## Step 5 — (Optional) Remotion Lambda for Video Rendering

Without this, the renderer runs in "passthrough" mode (stores raw URLs).
With it, full MP4 video composition works on Vercel.

```bash
# Install AWS CLI and configure credentials
aws configure

# Deploy Remotion Lambda function
npx remotion lambda policies validate
npx remotion lambda functions deploy \
  --memory=2048 \
  --disk=2048 \
  --timeout=120 \
  --region=us-east-1

# Deploy Remotion site to S3
npx remotion lambda sites create \
  --site-name=voxara \
  --region=us-east-1

# Set the outputs in Vercel env vars:
# REMOTION_LAMBDA_FUNCTION_NAME = (output from functions deploy)
# REMOTION_SERVE_URL = (output from sites create)
# RENDER_BACKEND = lambda
```

---

## Step 6 — Verify Deployment

```bash
# Check health endpoint
curl https://YOUR_DOMAIN/api/health

# Check admin access
curl -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  https://YOUR_DOMAIN/api/admin/check-access

# Trigger a test Inngest event
curl -X POST https://YOUR_DOMAIN/api/inngest \
  -H "Content-Type: application/json" \
  -d '{"name":"test/ping","data":{}}'
```

---

## Monitoring

- **Sentry**: https://sentry.io → Your Org → voxara project
- **Vercel Logs**: Dashboard → Project → Functions tab
- **Inngest**: https://app.inngest.com → Your app → Events
- **Supabase**: Dashboard → Database → Logs

---

## Rollback

```bash
# Vercel — instantly roll back to previous deployment
vercel rollback

# Database — Supabase migrations are forward-only.
# To undo: write a new migration that reverses the change.
```

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL is required` | Missing env var | Set in Vercel dashboard |
| Inngest jobs not running | Inngest not synced | Run `npx inngest-cli sync` |
| Videos stuck in "processing" | Mux webhook not configured | Set webhook URL in Mux dashboard |
| Stripe/Paddle checkout fails | Wrong price IDs | Verify `PADDLE_*_PRICE_ID` vars |
| Sentry not capturing errors | Missing DSN | Set `NEXT_PUBLIC_SENTRY_DSN` |
| Rate limiting disabled | No Redis | Set `UPSTASH_REDIS_*` vars |
| Video render = passthrough mode | No Lambda config | Follow Step 5 above |
