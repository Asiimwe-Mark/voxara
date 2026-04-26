import logger from '@/lib/logger';
/**
 * Paddle Webhook Utilities
 * Handles webhook signature verification and event type checking
 */

import crypto from 'crypto';
import { z } from 'zod';

/**
 * Zod schemas for webhook payload validation
 */

export const paddleWebhookMetaSchema = z.object({
  event_id: z.string(),
  occurred_at: z.string().datetime(),
  notification_id: z.string(),
});

export const paddleWebhookCustomerDataSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  locale: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const paddleWebhookTransactionDataSchema = z.object({
  id: z.string(),
  customer_id: z.string().optional(),
  subscription_id: z.string().optional(),
  status: z.enum(['draft', 'ready', 'completed', 'canceled', 'failed']),
  currency_code: z.string(),
  items: z.array(
    z.object({
      price_id: z.string(),
      quantity: z.number(),
    })
  ),
  custom_data: z.record(z.any()).optional(),
  totals: z
    .object({
      subtotal: z.string(),
      tax: z.string(),
      total: z.string(),
      grand_total: z.string(),
    })
    .optional(),
  billed_at: z.string().datetime().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const paddleWebhookSubscriptionDataSchema = z.object({
  id: z.string(),
  customer_id: z.string(),
  status: z.enum(['active', 'trialing', 'paused', 'past_due', 'canceled', 'expired']),
  currency_code: z.string(),
  items: z.array(
    z.object({
      status: z.enum(['active', 'trialing', 'paused', 'past_due', 'canceled', 'expired']),
      price_id: z.string(),
      quantity: z.number(),
      next_billed_at: z.string().datetime().optional(),
    })
  ),
  custom_data: z.record(z.any()).optional(),
  current_billing_period: z
    .object({
      starts_at: z.string().datetime(),
      ends_at: z.string().datetime(),
    })
    .optional(),
  next_billed_at: z.string().datetime().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const paddleWebhookEventSchema = z.object({
  event_id: z.string(),
  event_type: z.string(),
  occurred_at: z.string().datetime(),
  notification_id: z.string(),
  data: z.record(z.any()),
});

export type PaddleWebhookEvent = z.infer<typeof paddleWebhookEventSchema>;

/**
 * Paddle Webhook Event Types
 */
export enum PaddleWebhookEventType {
  // Transaction events
  TRANSACTION_CREATED = 'transaction.created',
  TRANSACTION_UPDATED = 'transaction.updated',
  TRANSACTION_COMPLETED = 'transaction.completed',
  TRANSACTION_READY = 'transaction.ready',
  TRANSACTION_FAILED = 'transaction.failed',

  // Subscription events
  SUBSCRIPTION_CREATED = 'subscription.created',
  SUBSCRIPTION_UPDATED = 'subscription.updated',
  SUBSCRIPTION_PAUSED = 'subscription.paused',
  SUBSCRIPTION_RESUMED = 'subscription.resumed',
  SUBSCRIPTION_CANCELED = 'subscription.canceled',
  SUBSCRIPTION_ACTIVE = 'subscription.active',
  SUBSCRIPTION_TRIALING = 'subscription.trialing',
  SUBSCRIPTION_PAST_DUE = 'subscription.past_due',

  // Customer events
  CUSTOMER_CREATED = 'customer.created',
  CUSTOMER_UPDATED = 'customer.updated',

  // Other events
  CHECKOUT_COMPLETED = 'checkout.completed',
}

/**
 * List of events that trigger credit additions
 */
export const CREDIT_TRIGGER_EVENTS = [
  PaddleWebhookEventType.TRANSACTION_COMPLETED,
  PaddleWebhookEventType.SUBSCRIPTION_CREATED,
];

/**
 * List of events that affect subscription status
 */
export const SUBSCRIPTION_STATUS_EVENTS = [
  PaddleWebhookEventType.SUBSCRIPTION_CREATED,
  PaddleWebhookEventType.SUBSCRIPTION_UPDATED,
  PaddleWebhookEventType.SUBSCRIPTION_PAUSED,
  PaddleWebhookEventType.SUBSCRIPTION_RESUMED,
  PaddleWebhookEventType.SUBSCRIPTION_CANCELED,
  PaddleWebhookEventType.SUBSCRIPTION_ACTIVE,
];

/**
 * Verify Paddle webhook signature
 * @param payload Raw request body as string
 * @param signature X-Paddle-Signature header value
 * @param webhookSecret Paddle webhook secret from environment
 * @returns boolean indicating if signature is valid
 */
export function verifyPaddleWebhookSignature(
  payload: string,
  signature: string,
  webhookSecret: string
): boolean {
  try {
    const hash = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    // Use constant-time comparison to prevent timing attacks
    return timingSafeCompare(hash, signature);
  } catch (error) {
    logger.error('Webhook signature verification failed', { detail: error instanceof Error ? error.message : String(error) });
    return false;
  }
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeCompare(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, 'hex');
  const bufferB = Buffer.from(b, 'hex');

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufferA, bufferB);
}

/**
 * Check if an event type is a supported webhook event
 */
export function isSupportedEvent(eventType: string): boolean {
  return Object.values(PaddleWebhookEventType).includes(eventType as PaddleWebhookEventType);
}

/**
 * Check if an event should trigger credit additions
 */
export function isCreditTriggerEvent(eventType: string): boolean {
  return CREDIT_TRIGGER_EVENTS.includes(eventType as any);
}

/**
 * Check if an event affects subscription status
 */
export function isSubscriptionStatusEvent(eventType: string): boolean {
  return SUBSCRIPTION_STATUS_EVENTS.includes(eventType as any);
}

/**
 * Extract user ID from webhook data
 */
export function extractUserIdFromWebhook(data: Record<string, unknown>): string | null {
  // Try custom_data first
  if (data?.custom_data?.user_id) {
    return data.custom_data.user_id;
  }

  // For transaction/subscription data
  if (data?.metadata?.user_id) {
    return data.metadata.user_id;
  }

  // Try different nested paths
  if (data?.attributes?.custom_data?.user_id) {
    return data.attributes.custom_data.user_id;
  }

  return null;
}

/**
 * Extract credits amount from webhook data
 */
export function extractCreditsFromWebhook(data: Record<string, unknown>): number {
  // From custom_data
  if (data?.custom_data?.credits) {
    return parseInt(data.custom_data.credits, 10);
  }

  // From metadata
  if (data?.metadata?.credits) {
    return parseInt(data.metadata.credits, 10);
  }

  return 0;
}

/**
 * Get credits mapping for plan types
 */
export function getCreditsForPlan(planType: string): number {
  const planCreditsMap: Record<string, number> = {
    free: 3,
    pro: 30,
    agency: 100,
    'credit-pack': 25, // Variable, depends on pack size
  };

  return planCreditsMap[planType.toLowerCase()] || 0;
}

/**
 * Map Paddle subscription status to internal status
 */
export function mapSubscriptionStatus(paddleStatus: string): 'active' | 'inactive' | 'paused' | 'canceled' {
  const statusMap: Record<string, 'active' | 'inactive' | 'paused' | 'canceled'> = {
    active: 'active',
    trialing: 'active',
    paused: 'paused',
    past_due: 'inactive',
    canceled: 'canceled',
    expired: 'canceled',
  };

  return statusMap[paddleStatus] || 'inactive';
}

/**
 * Format Paddle transaction amount to USD cents
 */
export function formatTransactionAmount(
  amount: string,
  currencyCode: string
): number {
  // Paddle API returns amounts as strings in the smallest currency unit (cents)
  return parseInt(amount, 10);
}

/**
 * Validate webhook event structure
 */
export function validateWebhookEvent(
  event: unknown
): { valid: boolean; errors?: string[] } {
  try {
    paddleWebhookEventSchema.parse(event);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      return { valid: false, errors };
    }
    return { valid: false, errors: ['Unknown validation error'] };
  }
}
