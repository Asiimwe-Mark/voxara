# Step-by-Step Implementation Guide

## 🎯 Your Task: Complete the Frontend Integration (30 mins)

This guide will walk you through the exact steps to complete the refactoring.

---

## Phase 1: Prepare (5 mins)

### Step 1: Verify Current State
```bash
# Check billing page compiles
npm run type-check

# Check no errors
npm run build
```

**Expected**: Build should succeed or show minor TypeScript warnings.

### Step 2: Understand What Changed
Open these files in your editor:
- [src/app/dashboard/billing/page.tsx](src/app/dashboard/billing/page.tsx)
- [src/lib/payment-adapter.ts](src/lib/payment-adapter.ts)
- [src/app/api/stripe/checkout/route.ts](src/app/api/stripe/checkout/route.ts)

Read the comments to understand the flow.

---

## Phase 2: Update Frontend (10 mins)

### Step 3: Edit Billing Page - Remove Old Env Keys

**File**: [src/app/dashboard/billing/page.tsx](src/app/dashboard/billing/page.tsx)

**Find** this section (around line 30):
```typescript
const CREDIT_PACKS = [
  { credits: 10, price: 900, label: '$9', priceEnvKey: 'NEXT_PUBLIC_STRIPE_CREDIT_PACK_10_PRICE_ID' },
  { credits: 25, price: 1900, label: '$19', priceEnvKey: 'NEXT_PUBLIC_STRIPE_CREDIT_PACK_25_PRICE_ID', popular: true },
  { credits: 50, price: 2900, label: '$29', priceEnvKey: 'NEXT_PUBLIC_STRIPE_CREDIT_PACK_50_PRICE_ID' },
];
```

**Replace** with:
```typescript
const CREDIT_PACKS = [
  { credits: 10, price: 900, label: '$9' },
  { credits: 25, price: 1900, label: '$19', popular: true },
  { credits: 50, price: 2900, label: '$29' },
];
```

**Verify**: Removed `priceEnvKey` property entirely.

---

### Step 4: Update Buy Credits Handler

**File**: [src/app/dashboard/billing/page.tsx](src/app/dashboard/billing/page.tsx)

**Find** the `handleBuyCredits` function (around line 50-80):
```typescript
const handleBuyCredits = async (pack: CreditPack) => {
  try {
    setLoadingPackId(pack.credits);
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: pack.priceEnvKey,  // ❌ WRONG - this won't work
        mode: 'payment',
        credits: pack.credits,
      }),
    });
    // ... rest of handler
  }
};
```

**Replace** with:
```typescript
const handleBuyCredits = async (pack: CreditPack) => {
  try {
    setLoadingPackId(pack.credits);
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planType: 'credit_pack',  // ✅ NEW - generic plan type
        credits: pack.credits,    // ✅ Amount is automatic based on credits
      }),
    });
    // ... rest of handler
  }
};
```

**Verify**: 
- Removed `priceId: pack.priceEnvKey` line
- Removed `mode: 'payment'` line (no longer needed)
- Added `planType: 'credit_pack'` and `credits: pack.credits`

---

### Step 5: Update Billing Data Loader

**File**: [src/app/dashboard/billing/page.tsx](src/app/dashboard/billing/page.tsx)

**Find** the `loadBillingData` function (around line 120-150):
```typescript
const loadBillingData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    // OLD CODE
    const { data: subData } = await supabase
      .from('stripe_subscriptions')  // ❌ OLD TABLE
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    // ... rest of function
  }
};
```

**Replace with** (careful to keep surrounding code):
```typescript
const loadBillingData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    // NEW CODE - Try new table first, fall back to old
    let { data: subData } = await supabase
      .from('payment_subscriptions')  // ✅ NEW TABLE
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Fallback for backward compatibility with existing customers
    if (!subData) {
      const { data: legacyData } = await supabase
        .from('stripe_subscriptions')  // ✅ FALLBACK - old data
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      subData = legacyData;
    }
    
    // ... rest of function
  }
};
```

**Verify**:
- First query uses `payment_subscriptions` table
- Second query uses `stripe_subscriptions` table as fallback
- Used `.maybeSingle()` instead of `.single()` (won't error if no data)
- Added `.order().limit(1)` to get most recent subscription

---

### Step 6: Update Subscription Display

**File**: [src/app/dashboard/billing/page.tsx](src/app/dashboard/billing/page.tsx)

**Find** where billing date is displayed (around line 160-180):
```typescript
// OLD CODE
const nextBillingDate = subData?.current_period_end;

// Or similar variations:
subData?.current_period_end ? new Date(...) : null
```

**Replace** with:
```typescript
// NEW CODE - Check both old and new fields
const nextBillingDate = subData?.renews_at || subData?.current_period_end;

// Or if already wrapped in Date():
subData?.renews_at ? new Date(subData.renews_at) : (subData?.current_period_end ? new Date(subData.current_period_end) : null)
```

**Verify**: Handles both old schema (`current_period_end`) and new schema (`renews_at`).

---

### Step 7: Verify No Errors

```bash
# Check for TypeScript errors
npm run type-check

# This should show no errors in billing/page.tsx
# If there are errors, they'll be listed with line numbers
```

**If errors**: Click the error message, it will show you exactly what's wrong.

---

## Phase 3: Deploy (5 mins)

### Step 8: Build for Production

```bash
# Full production build
npm run build

# Should output "compiled successfully" at the end
```

**Expected output**:
```
  ✓ Compiled successfully
  ✓ Linting and type checking
```

**If build fails**: 
- Read the error message carefully
- Check the line number in the error
- Verify you made the edits correctly in Step 3-6

---

### Step 9: Deploy to Production

#### Option A: Deploy to Vercel (Recommended)
```bash
vercel --prod

# Or from Vercel dashboard, click "Deploy"
```

#### Option B: Deploy to Other Platforms
```bash
# Railway
railway up

# Render
render deploy

# Or your preferred platform's deploy command
```

**Expected**: Deployment should complete in 2-5 minutes.

**Verify**: Visit https://yourdomain.com/dashboard/billing - page should load without errors.

---

## Phase 4: Configure Webhooks (10 mins)

### Step 10: Set Up Lemon Squeezy Webhook

1. Log in to [Lemon Squeezy Dashboard](https://app.lemonsqueezy.com)
2. Navigate to **Settings** → **API & Webhooks** → **Webhooks**
3. Click **Create Webhook**
4. Fill in:
   - **Webhook URL**: `https://yourdomain.com/api/stripe/webhook`
   - **Events**: Enable all:
     - ✅ order.created
     - ✅ order.completed
     - ✅ subscription.created
     - ✅ subscription.updated
     - ✅ subscription.cancelled
5. Click **Save**
6. **Copy the webhook secret** (looks like `whsec_...`)

### Step 11: Add Lemon Squeezy Secret to Environment

#### For Vercel:
```bash
# Add the webhook secret
vercel env add LEMON_SQUEEZY_WEBHOOK_SECRET

# Paste the secret when prompted, then press Enter
# It will ask "Add to which environments?" - select "production"
```

#### For Other Platforms:
Add to your `.env` or platform's environment variables:
```env
LEMON_SQUEEZY_WEBHOOK_SECRET=whsec_xxxxx_from_step_10
```

---

### Step 12: Set Up Flutterwave Webhook

1. Log in to [Flutterwave Dashboard](https://dashboard.flutterwave.com)
2. Navigate to **Settings** → **Webhooks**
3. Set:
   - **Webhook URL**: `https://yourdomain.com/api/stripe/webhook`
4. Click **Save**
5. **Copy the webhook secret**

### Step 13: Add Flutterwave Secret to Environment

```bash
# For Vercel
vercel env add FLUTTERWAVE_WEBHOOK_SECRET

# For other platforms
# Add to .env: FLUTTERWAVE_WEBHOOK_SECRET=whsec_xxxxx
```

---

### Step 14: Redeploy with Webhook Secrets

```bash
# For Vercel (redeploy automatically after env vars added)
vercel --prod

# For other platforms
git push production main
# or your deployment command
```

**Wait for deployment to complete.**

---

## Phase 5: Testing (5 mins)

### Step 15: Test Webhook Locally

```bash
# Start dev server in one terminal
npm run dev

# In another terminal, test webhooks
npm run test:webhooks -- --provider=lemon-squeezy

# Expected output:
# ✅ Test passed
# ✅ Test passed
# ✅ Test passed
```

**If tests fail**: Check that `LEMON_SQUEEZY_WEBHOOK_SECRET` is set in `.env.local`.

### Step 16: Test in Production

#### Via Provider Dashboard

**Lemon Squeezy**:
1. Settings → Webhooks → [Your webhook] → **Test Webhook**
2. Should return "Success" ✅

**Flutterwave**:
1. Settings → Webhooks → **Send Test**
2. Should return "Success" ✅

#### Via Database
```bash
# Check webhook logs
supabase sql "SELECT * FROM webhook_logs ORDER BY created_at DESC LIMIT 10;"

# Should show test webhook events with status='success'
```

### Step 17: Test Payment Flow

1. Go to https://yourdomain.com/dashboard/billing
2. Click **Buy Credits** button
3. Should redirect to Lemon Squeezy or Flutterwave
4. Complete a test payment in the provider's sandbox
5. Should redirect back to app
6. Check database for webhook event:
   ```bash
   supabase sql "SELECT * FROM webhook_logs WHERE event_type LIKE '%order%' OR event_type LIKE '%charge%' ORDER BY created_at DESC LIMIT 5;"
   ```

**Expected**: 
- ✅ Payment page loads
- ✅ Test payment succeeds
- ✅ Redirected back to app
- ✅ Webhook logged in database
- ✅ No errors in logs

---

## ✅ Completion Checklist

Mark these off as you complete them:

- [ ] **Billing page updated** (Step 3-6)
  - [ ] CREDIT_PACKS array simplified
  - [ ] handleBuyCredits uses planType
  - [ ] loadBillingData queries payment_subscriptions
  - [ ] Billing date uses renews_at

- [ ] **No TypeScript errors** (Step 7)
  - [ ] npm run type-check passes
  - [ ] npm run build succeeds

- [ ] **Deployed to production** (Step 8-9)
  - [ ] Vercel/platform shows "Deployment successful"
  - [ ] https://yourdomain.com/dashboard/billing loads

- [ ] **Webhooks configured** (Step 10-14)
  - [ ] Lemon Squeezy webhook created
  - [ ] Lemon Squeezy secret added to env vars
  - [ ] Flutterwave webhook created
  - [ ] Flutterwave secret added to env vars
  - [ ] Application redeployed with secrets

- [ ] **Webhooks tested** (Step 15-17)
  - [ ] npm run test:webhooks passes
  - [ ] Provider test webhooks succeed
  - [ ] webhook_logs table has entries
  - [ ] Full payment flow works end-to-end

---

## 🎉 Success!

If you've checked all boxes above, you're done! 🚀

Your application now has:
✅ Modern Next.js 16 framework
✅ GenKit AI integration
✅ Multi-provider payment processing
✅ Automatic webhook handling
✅ Comprehensive monitoring

---

## 🆘 Stuck? Troubleshooting

### "Module not found: @google/genai"
```bash
npm install --save @google/genai@0.1.0 @genkit-ai/core@0.9.0
npm run build
```

### "Webhook signature verification failed"
- Check `.env.local` or environment variables
- Verify secret matches in provider dashboard
- Test with: `npm run test:webhooks`

### "TypeScript errors in billing page"
- Check line numbers in error message
- Compare your changes to Steps 3-6 carefully
- Pay attention to commas and brackets

### "Build fails with 'Cannot find...' errors"
- Run: `npm install`
- Run: `npm run build`
- Check for typos in your edits

### "Webhooks not triggering"
- Verify `https://yourdomain.com/api/stripe/webhook` is accessible
- Check server logs: `vercel logs -f`
- Test manually: `npm run test:webhooks`
- Provider support: Check provider's webhook logs for delivery attempts

---

## 📞 Need Help?

Check these files in order:
1. [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick answers
2. [FRONTEND_WEBHOOK_CHECKLIST.md](FRONTEND_WEBHOOK_CHECKLIST.md) - Implementation details
3. [WEBHOOK_DEPLOYMENT_GUIDE.md](WEBHOOK_DEPLOYMENT_GUIDE.md) - Full webhook guide
4. [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md) - Complete overview

---

**You've got this! 💪**

The backend is already done. You're just updating the frontend to work with it. Each step is straightforward and clearly marked. Follow them in order and you'll be done in 30 minutes.

Good luck! 🚀
