import { supabaseAdmin } from '@/lib/supabase/admin';
import logger from '@/lib/logger';
import { createClient } from '@supabase/supabase-js';


export interface WebhookLogEntry {
  provider: 'paddle' | 'flutterwave';
  eventType: string;
  userId?: string;
  payload: Record<string, unknown>;
  status: 'success' | 'failure';
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log webhook events for monitoring and debugging
 */
export async function logWebhookEvent(entry: WebhookLogEntry) {
  try {
    await supabaseAdmin.from('webhook_logs').insert({
      provider: entry.provider,
      event_type: entry.eventType,
      user_id: entry.userId,
      payload: entry.payload,
      status: entry.status,
      error_message: entry.errorMessage,
      metadata: entry.metadata,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    // If logging fails, just log to console to avoid throwing
    logger.error('[WebhookLogger] Failed to log webhook event', { detail: err instanceof Error ? err.message : String(err) });
  }
}

/**
 * Get recent webhook logs
 */
export async function getWebhookLogs(
  filter?: {
    provider?: string;
    status?: 'success' | 'failure';
    limit?: number;
    offset?: number;
  }
) {
  try {
    let query = supabaseAdmin
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter?.provider) {
      query = query.eq('provider', filter.provider);
    }
    if (filter?.status) {
      query = query.eq('status', filter.status);
    }

    const limit = filter?.limit || 50;
    const offset = filter?.offset || 0;
    
    query = query.limit(limit).range(offset, offset + limit - 1);

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    logger.error('[WebhookLogger] Failed to fetch logs', { detail: err instanceof Error ? err.message : String(err) });
    return [];
  }
}

/**
 * Get webhook statistics
 */
export async function getWebhookStats(hours: number = 24) {
  try {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    const { data } = await supabaseAdmin
      .from('webhook_logs')
      .select('provider, status')
      .gte('created_at', since);

    const stats = {
      total: data?.length || 0,
      success: data?.filter(d => d.status === 'success').length || 0,
      failure: data?.filter(d => d.status === 'failure').length || 0,
      byProvider: {
        
        'flutterwave': 0,
        
      } as Record<string, number>,
    };

    data?.forEach(d => {
      if (d.provider in stats.byProvider) {
        stats.byProvider[d.provider as any]++;
      }
    });

    return stats;
  } catch (err) {
    logger.error('[WebhookLogger] Failed to get stats', { detail: err instanceof Error ? err.message : String(err) });
    return null;
  }
}

/**
 * Alert on webhook failures (send email, Slack, etc.)
 */
export async function alertOnWebhookFailure(
  entry: WebhookLogEntry,
  recipient?: string
) {
  if (entry.status === 'failure') {
    logger.error('[WebhookAlert]', {
      provider: entry.provider,
      eventType: entry.eventType,
      error: entry.errorMessage,
      timestamp: new Date().toISOString(),
    });

    // Send admin alert email via Resend when webhook keeps failing
    const adminEmail = process.env.ADMIN_ALERT_EMAIL ?? process.env.RESEND_FROM_EMAIL;
    if (adminEmail && process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? 'alerts@voxara.app',
          to: adminEmail,
          subject: `[Voxara] Webhook delivery failed: ${entry.eventType}`,
          text: [
            `Webhook delivery failed repeatedly.`,
            `Event: ${entry.eventType}`,
            `Endpoint: ${entry.endpointId}`,
            `Error: ${entry.errorMessage}`,
            `Time: ${new Date().toISOString()}`,
          ].join('\n'),
        });
      } catch {
        // Alert sending failed — not worth crashing over
      }
    }
  }
}
