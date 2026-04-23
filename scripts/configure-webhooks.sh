#!/bin/bash
# Webhook Configuration Script
# This script helps you set up webhooks for Lemon Squeezy and Flutterwave

set -e

echo "╔════════════════════════════════════════╗"
echo "║   Webhook Configuration Helper         ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}Creating .env.local file...${NC}"
    cp .env.example .env.local
    echo -e "${GREEN}✓ Created .env.local${NC}"
fi

echo ""
echo -e "${YELLOW}Step 1: Lemon Squeezy Webhook Configuration${NC}"
echo "===================="
echo "1. Go to https://app.lemonsqueezy.com/settings"
echo "2. Navigate to 'API & Webhooks' → 'Webhooks'"
echo "3. Click 'Create Webhook'"
echo "4. Set the endpoint URL to:"
echo "   https://yourdomain.com/api/stripe/webhook"
echo ""
echo "5. Enable these events:"
echo "   ✓ order.created"
echo "   ✓ order.completed"
echo "   ✓ subscription.created"
echo "   ✓ subscription.updated"
echo "   ✓ subscription.cancelled"
echo ""
read -p "Enter Lemon Squeezy Webhook Secret (whsec_...): " LEMON_SECRET

if [ ! -z "$LEMON_SECRET" ]; then
    if grep -q "LEMON_SQUEEZY_WEBHOOK_SECRET" .env.local; then
        sed -i "s/^LEMON_SQUEEZY_WEBHOOK_SECRET=.*/LEMON_SQUEEZY_WEBHOOK_SECRET=$LEMON_SECRET/" .env.local
    else
        echo "LEMON_SQUEEZY_WEBHOOK_SECRET=$LEMON_SECRET" >> .env.local
    fi
    echo -e "${GREEN}✓ Lemon Squeezy webhook secret added${NC}"
else
    echo -e "${RED}✗ Skipped Lemon Squeezy configuration${NC}"
fi

echo ""
echo -e "${YELLOW}Step 2: Flutterwave Webhook Configuration${NC}"
echo "===================="
echo "1. Go to https://dashboard.flutterwave.com/settings"
echo "2. Navigate to 'Webhooks'"
echo "3. Set the endpoint URL to:"
echo "   https://yourdomain.com/api/stripe/webhook"
echo ""
read -p "Enter Flutterwave Webhook Secret: " FLUTTERWAVE_SECRET

if [ ! -z "$FLUTTERWAVE_SECRET" ]; then
    if grep -q "FLUTTERWAVE_WEBHOOK_SECRET" .env.local; then
        sed -i "s/^FLUTTERWAVE_WEBHOOK_SECRET=.*/FLUTTERWAVE_WEBHOOK_SECRET=$FLUTTERWAVE_SECRET/" .env.local
    else
        echo "FLUTTERWAVE_WEBHOOK_SECRET=$FLUTTERWAVE_SECRET" >> .env.local
    fi
    echo -e "${GREEN}✓ Flutterwave webhook secret added${NC}"
else
    echo -e "${RED}✗ Skipped Flutterwave configuration${NC}"
fi

echo ""
echo -e "${YELLOW}Step 3: Verify Configuration${NC}"
echo "===================="
echo "Current webhook configuration:"
echo ""
grep "WEBHOOK_SECRET" .env.local || echo "No webhook secrets configured"
echo ""

echo -e "${GREEN}✓ Webhook configuration complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Deploy your application with the new environment variables"
echo "2. Test webhooks: npm run test:webhooks"
echo "3. Monitor webhook logs in Supabase"
