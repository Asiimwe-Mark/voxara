import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, any>;
}

interface DeliveryResult {
  success: boolean;
  statusCode?: number;
  responseBody?: string;
  durationMs: number;
  error?: string;
}

/**
 * Generate HMAC-SHA256 signature for webhook payload.
 */
function generateSignature(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Deliver a webhook to a single endpoint with retries.
 */
async function deliverToEndpoint(
  endpoint: {
    id: string;
    url: string;
    secret: string;
  },
  payload: WebhookPayload,
  maxRetries: number = 3
): Promise<DeliveryResult> {
  const payloadString = JSON.stringify(payload);
  const signature = generateSignature(payloadString, endpoint.secret);

  let lastError: Error | null = null;
  let lastStatus: number | undefined;
  let lastBody: string | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const startTime = Date.now();
    try {
      const response = await fetch(endpoint.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature,
          "X-Webhook-Event": payload.event,
          "X-Delivery-Attempt": attempt.toString(),
        },
        body: payloadString,
      });

      const responseBody = await response.text().catch(() => "");
      const durationMs = Date.now() - startTime;

      if (response.ok) {
        return {
          success: true,
          statusCode: response.status,
          responseBody,
          durationMs,
        };
      }

      lastStatus = response.status;
      lastBody = responseBody;

      // Don't retry on 4xx errors (except 429)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return {
          success: false,
          statusCode: response.status,
          responseBody,
          durationMs,
          error: `Client error: ${response.status}`,
        };
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }

    if (attempt < maxRetries) {
      // Exponential backoff: 2^attempt seconds
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return {
    success: false,
    statusCode: lastStatus,
    responseBody: lastBody,
    durationMs: 0,
    error: lastError?.message || "Max retries exceeded",
  };
}

/**
 * Log webhook delivery attempt to database.
 */
async function logDelivery(
  endpointId: string,
  eventType: string,
  payload: WebhookPayload,
  result: DeliveryResult
): Promise<void> {
  await supabaseAdmin.from("webhook_logs").insert({
    endpoint_id: endpointId,
    event_type: eventType,
    payload,
    response_status: result.statusCode,
    response_body: result.responseBody,
    duration_ms: result.durationMs,
  });
}

/**
 * Deliver an event to all active webhook endpoints for a user.
 */
export async function deliverWebhook(
  eventType: string,
  data: Record<string, any>,
  userId: string
): Promise<void> {
  // Find all active endpoints subscribed to this event
  const { data: endpoints, error } = await supabaseAdmin
    .from("webhook_endpoints")
    .select("id, url, secret")
    .eq("user_id", userId)
    .eq("status", "active")
    .contains("events", [eventType]);

  if (error || !endpoints || endpoints.length === 0) {
    return;
  }

  const payload: WebhookPayload = {
    event: eventType,
    timestamp: new Date().toISOString(),
    data,
  };

  // Deliver to all endpoints concurrently
  await Promise.all(
    endpoints.map(async (endpoint) => {
      const result = await deliverToEndpoint(endpoint, payload);
      await logDelivery(endpoint.id, eventType, payload, result);
    })
  );
}

/**
 * Deliver an event to a single webhook URL (used for ad‑hoc webhooks).
 */
export async function deliverAdHocWebhook(
  url: string,
  secret: string,
  eventType: string,
  data: Record<string, any>
): Promise<DeliveryResult> {
  const payload: WebhookPayload = {
    event: eventType,
    timestamp: new Date().toISOString(),
    data,
  };

  return deliverToEndpoint({ id: "ad-hoc", url, secret }, payload);
}

/**
 * Verify an incoming webhook signature (for receiving webhooks).
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = generateSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}