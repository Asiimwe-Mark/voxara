# Frontend & Webhook Integration Checklist

## ✅ Completed Tasks

### Backend Refactoring (13/13)
- ✅ Package.json: Next.js 16, GenKit, Lemon Squeezy, Flutterwave
- ✅ Payment adapter with multi-provider support
- ✅ API routes refactored for new payment providers
- ✅ Database migrations for payment schema
- ✅ Webhook handler supports both providers
- ✅ Background jobs updated for auto top-ups

### Frontend Updates (1/2)
- ✅ `useSubscription` hook updated to query `payment_*` tables with backward compatibility
- ⏳ Billing page component (IN PROGRESS)

---

## 🚀 Next Steps: Frontend Component Updates

### Task 1: Update Billing Page Component

**File**: [src/app/dashboard/billing/page.tsx](src/app/dashboard/billing/page.tsx)

**Changes Needed**:

#### 1a. Remove Stripe-specific CREDIT_PACKS array
**Current** (lines ~30-40):
```typescript
const CREDIT_PACKS = [
  { credits: 10, price: 900, label: '$9', priceEnvKey: 'NEXT_PUBLIC_STRIPE_CREDIT_PACK_10_PRICE_ID' },
  { credits: 25, price: 1900, label: '$19', priceEnvKey: 'NEXT_PUBLIC_STRIPE_CREDIT_PACK_25_PRICE_ID', popular: true },
  { credits: 50, price: 2900, label: '$29', priceEnvKey: 'NEXT_PUBLIC_STRIPE_CREDIT_PACK_50_PRICE_ID' },
];
```

**Change To**:
```typescript
const CREDIT_PACKS = [
  { credits: 10, price: 900, label: '$9' },
  { credits: 25, price: 1900, label: '$19', popular: true },
  { credits: 50, price: 2900, label: '$29' },
];
```

#### 1b. Update handleBuyCredits() function
**Current** (lines ~60-80):
```typescript
const handleBuyCredits = async (pack: CreditPack) => {
  const response = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      priceId: pack.priceEnvKey,  // ❌ WRONG
      mode: 'payment',
      credits: pack.credits,
    }),
  });
};
```

**Change To**:
```typescript
const handleBuyCredits = async (pack: CreditPack) => {
  const response = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      planType: 'credit_pack',  // ✅ NEW
      credits: pack.credits,
    }),
  });
};
```

#### 1c. Update loadBillingData() function
**Current** (lines ~100-110):
```typescript
const { data: subData } = await supabase
  .from('stripe_subscriptions')  // ❌ OLD TABLE
  .select('*')
  .eq('user_id', user.id)
  .single();
```

**Change To**:
```typescript
// Try new table first, fall back to old for backward compatibility
let { data: subData } = await supabase
  .from('payment_subscriptions')  // ✅ NEW TABLE
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle();

// Fallback for existing data
if (!subData) {
  const { data: legacyData } = await supabase
    .from('stripe_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  subData = legacyData;
}
```

#### 1d. Update subscription display
**Current** (lines ~150):
```typescript
// Using current_period_end from old schema
const nextBillingDate = subData?.current_period_end;
```

**Change To**:
```typescript
// Using renews_at from new schema (with fallback)
const nextBillingDate = subData?.renews_at || subData?.current_period_end;
```

---

### Task 2: Update Billing Components

**Files to Check**: 
- [src/components/dashboard/billing-section.tsx](src/components/dashboard/billing-section.tsx)
- [src/components/dashboard/subscription-card.tsx](src/components/dashboard/subscription-card.tsx)
- Any component using `stripe_subscriptions` table

**Quick Check**:
```bash
# Search for old Stripe table references
grep -r "stripe_customers\|stripe_subscriptions" src/components/
grep -r "stripe_customer_id\|stripe_subscription_id" src/components/
```

If found, update using the same pattern as the billing page.

---

## 🌐 Webhook Deployment Quick Start

### Phase 1: Local Testing (5 mins)

```bash
# 1. Start dev server
npm run dev

# 2. In another terminal, install and start ngrok
brew install ngrok
ngrok http 3000

# 3. Copy the ngrok URL (example: https://abc123-456-789.ngrok-free.app)

# 4. Test webhook locally
npm run test:webhooks -- --url=https://abc123-456-789.ngrok-free.app

# 5. Monitor webhook logs
tail -f ~/.pm2/logs/app-error.log
```

### Phase 2: Production Setup (10 mins)

#### For Lemon Squeezy:
1. Log in to [Lemon Squeezy Dashboard](https://app.lemonsqueezy.com)
2. Go to **Settings** → **API & Webhooks** → **Webhooks**
3. Click **Create Webhook**
4. Set endpoint: `https://yourdomain.com/api/stripe/webhook`
5. Select events:
   - ✅ order.created
   - ✅ order.completed
   - ✅ subscription.created
   - ✅ subscription.updated
   - ✅ subscription.cancelled
6. Copy webhook secret to `.env.local`:
   ```
   LEMON_SQUEEZY_WEBHOOK_SECRET=whsec_xxxxx
   ```
7. Redeploy: `vercel --prod`

#### For Flutterwave:
1. Log in to [Flutterwave Dashboard](https://dashboard.flutterwave.com)
2. Go to **Settings** → **Webhooks**
3. Set endpoint: `https://yourdomain.com/api/stripe/webhook`
4. Test the webhook (click "Test Webhook")
5. Copy webhook secret to `.env.local`:
   ```
   FLUTTERWAVE_WEBHOOK_SECRET=whsec_xxxxx
   ```
6. Redeploy: `vercel --prod`

### Phase 3: Verification (5 mins)

```bash
# 1. Check environment variables are set
vercel env ls

# 2. Test webhook from provider dashboard
# Lemon Squeezy: Settings → Webhooks → [Your webhook] → Test
# Flutterwave: Settings → Webhooks → Test Webhook

# 3. Verify in logs
vercel logs -f

# 4. Check webhook_logs table
supabase sql "SELECT * FROM webhook_logs LIMIT 10;"
```

---

## 📊 Webhook Monitoring Setup

### Add Webhook Logger to Handler

**File**: [src/app/api/stripe/webhook/route.ts](src/app/api/stripe/webhook/route.ts)

Add at the top:
```typescript
import { logWebhookEvent, alertOnWebhookFailure } from '@/lib/webhook-logger';
```

Then wrap webhook processing:
```typescript
try {
  // Process webhook...
  await logWebhookEvent({
    provider: process.env.PAYMENT_PROVIDER || 'lemon-squeezy',
    eventType: event.type,
    userId: customData.user_id,
    payload: JSON.parse(body),
    status: 'success',
  });
} catch (error) {
  await logWebhookEvent({
    provider: process.env.PAYMENT_PROVIDER || 'lemon-squeezy',
    eventType: event.type,
    userId: customData.user_id,
    payload: JSON.parse(body),
    status: 'failure',
    errorMessage: error.message,
  });
  
  await alertOnWebhookFailure({
    provider: process.env.PAYMENT_PROVIDER || 'lemon-squeezy',
    eventType: event.type,
    payload: JSON.parse(body),
    status: 'failure',
    errorMessage: error.message,
  });
}
```

---

## 🧪 Testing Checklist

- [ ] Local webhook test passes with ngrok
- [ ] Lemon Squeezy test webhook delivers successfully
- [ ] Flutterwave test webhook delivers successfully
- [ ] Database migrations run successfully
- [ ] webhook_logs table populated with test events
- [ ] Frontend billing page loads without errors
- [ ] Buy credits button sends planType instead of priceId
- [ ] Payment completes and credits are added
- [ ] Subscription status displays correctly
- [ ] Webhook logs visible in admin dashboard

---

## 🔍 Troubleshooting

### Common Issues

**Issue**: "Webhook signature verification failed"
- Check `.env.local` has correct `LEMON_SQUEEZY_WEBHOOK_SECRET` or `FLUTTERWAVE_WEBHOOK_SECRET`
- Verify secret matches in provider dashboard

**Issue**: "Credits not added after payment"
- Check webhook_logs table for error messages
- Verify `user_id` in webhook matches database user
- Confirm `rpc('add_credits')` function exists

**Issue**: "Webhooks not delivering"
- Verify endpoint URL is publicly accessible
- Check firewall allows HTTPS POST
- Use provider dashboard to resend failed webhooks
- Monitor logs: `vercel logs -f`

---

## 📝 Implementation Order

1. **Update useSubscription hook** ✅ (DONE)
2. **Update billing page component** (5 mins)
3. **Deploy application** (5 mins)
4. **Set webhook endpoints in providers** (5 mins)
5. **Test with ngrok locally** (5 mins)
6. **Test in production** (5 mins)
7. **Monitor webhook logs** (ongoing)

**Total Time**: ~30 mins

---

## 🎉 Success Indicators

When complete, you should see:
1. ✅ Billing page loads with credit packs
2. ✅ "Buy Credits" button works and redirects to payment provider
3. ✅ Payment completed in provider dashboard
4. ✅ User credits increase in application
5. ✅ Webhook events logged in webhook_logs table
6. ✅ No errors in application logs or provider webhooks

---

## 📚 Additional Resources

- [WEBHOOK_DEPLOYMENT_GUIDE.md](WEBHOOK_DEPLOYMENT_GUIDE.md) - Full webhook deployment guide
- [src/lib/webhook-logger.ts](src/lib/webhook-logger.ts) - Webhook logging utilities
- [scripts/test-webhooks.ts](scripts/test-webhooks.ts) - Webhook testing script
- [supabase/migrations/015_webhook_logging.sql](supabase/migrations/015_webhook_logging.sql) - Webhook logs schema

---

**Questions?** Check the webhook deployment guide or test the endpoint manually:
```bash
curl -X POST http://localhost:3000/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```
