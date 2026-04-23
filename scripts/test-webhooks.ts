#!/usr/bin/env node

/**
 * Webhook Testing Script
 * 
 * Usage:
 *   npm run test:webhooks
 *   npm run test:webhooks -- --provider=lemon-squeezy
 *   npm run test:webhooks -- --url=http://localhost:3000
 *   npm run test:webhooks -- --provider=flutterwave --simulate-failure
 */

import crypto from 'crypto';
import fetch from 'node-fetch';

interface TestOptions {
  provider: 'lemon-squeezy' | 'flutterwave';
  url: string;
  secret?: string;
  simulateFailure?: boolean;
}

const args = process.argv.slice(2);
const options: TestOptions = {
  provider: 'lemon-squeezy',
  url: 'http://localhost:3000',
  secret: process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || 'test-secret',
};

// Parse command line arguments
args.forEach((arg) => {
  if (arg.startsWith('--provider=')) {
    options.provider = arg.split('=')[1] as any;
  } else if (arg.startsWith('--url=')) {
    options.url = arg.split('=')[1];
  } else if (arg === '--simulate-failure') {
    options.simulateFailure = true;
  }
});

// Test payload generators
const testPayloads = {
  'lemon-squeezy': {
    'order.completed': {
      meta: {
        event_name: 'order.completed',
        webhook_id: 'webhook_test_123',
      },
      data: {
        type: 'orders',
        id: 'order_test_123',
        attributes: {
          identifier: 'TEST-ORDER-001',
          order_number: 1001,
          user_email: 'test@example.com',
          currency: 'USD',
          total: 1999,
          status: 'completed',
          created_at: new Date().toISOString(),
        },
        custom_data: {
          user_id: 'test-user-uuid-here',
          credits: 25,
          plan_type: 'pro',
        },
      },
    },
    'subscription.created': {
      meta: {
        event_name: 'subscription.created',
        webhook_id: 'webhook_test_124',
      },
      data: {
        type: 'subscriptions',
        id: 'sub_test_123',
        attributes: {
          user_email: 'test@example.com',
          status: 'active',
          variant_id: 123456,
          renews_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
        },
        custom_data: {
          user_id: 'test-user-uuid-here',
          plan_type: 'pro',
        },
      },
    },
    'subscription.cancelled': {
      meta: {
        event_name: 'subscription.cancelled',
        webhook_id: 'webhook_test_125',
      },
      data: {
        type: 'subscriptions',
        id: 'sub_test_123',
        attributes: {
          user_email: 'test@example.com',
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        },
        custom_data: {
          user_id: 'test-user-uuid-here',
        },
      },
    },
  },
  'flutterwave': {
    'charge.completed': {
      event: 'charge.completed',
      data: {
        id: 'txn_test_123',
        tx_ref: `test-tx-${Date.now()}`,
        flw_ref: 'FLW12345',
        amount: 25000, // in kobo (NGN)
        currency: 'NGN',
        status: 'successful',
        meta: {
          userId: 'test-user-uuid-here',
          credits: 25,
          user_id: 'test-user-uuid-here',
        },
      },
    },
    'charge.failed': {
      event: 'charge.failed',
      data: {
        id: 'txn_test_fail_123',
        tx_ref: `test-tx-fail-${Date.now()}`,
        amount: 25000,
        currency: 'NGN',
        status: 'failed',
        meta: {
          userId: 'test-user-uuid-here',
        },
      },
    },
  },
};

/**
 * Generate Lemon Squeezy signature
 */
function generateLemonSqueezySignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Generate Flutterwave signature
 */
function generateFlutterwaveSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Send test webhook
 */
async function sendWebhook(
  eventType: string,
  payload: any,
  options: TestOptions
) {
  const payloadString = JSON.stringify(payload);
  const endpoint = `${options.url}/api/stripe/webhook`;

  let headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.provider === 'lemon-squeezy') {
    const signature = generateLemonSqueezySignature(payloadString, options.secret || 'test');
    headers['x-signature'] = signature;
  } else if (options.provider === 'flutterwave') {
    const signature = generateFlutterwaveSignature(payloadString, options.secret || 'test');
    headers['verif-hash'] = signature;
  }

  console.log(`\n📤 Sending ${options.provider} webhook: ${eventType}`);
  console.log(`📍 Endpoint: ${endpoint}`);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: payloadString,
    });

    const text = await response.text();
    const isSuccess = response.ok || response.status === 200;

    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    
    if (text) {
      try {
        const json = JSON.parse(text);
        console.log(`📦 Response:`, JSON.stringify(json, null, 2));
      } catch {
        console.log(`📦 Response: ${text}`);
      }
    }

    return isSuccess;
  } catch (error) {
    console.log(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log(`
╔════════════════════════════════════════╗
║   Webhook Testing Suite                ║
║   Provider: ${options.provider.padEnd(28)}║
║   URL: ${options.url.padEnd(33)}║
╚════════════════════════════════════════╝
  `);

  const payloads = testPayloads[options.provider];
  if (!payloads) {
    console.error(`❌ Unknown provider: ${options.provider}`);
    process.exit(1);
  }

  let passed = 0;
  let failed = 0;

  for (const [eventType, payload] of Object.entries(payloads)) {
    const testPayload = options.simulateFailure ? { invalid: true } : payload;
    const success = await sendWebhook(eventType, testPayload, options);
    
    if (success) {
      console.log(`✅ Test passed`);
      passed++;
    } else {
      console.log(`❌ Test failed`);
      failed++;
    }

    // Wait between requests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(`
╔════════════════════════════════════════╗
║   Test Summary                         ║
║   Passed: ${String(passed).padEnd(29)}║
║   Failed: ${String(failed).padEnd(29)}║
╚════════════════════════════════════════╝
  `);

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
