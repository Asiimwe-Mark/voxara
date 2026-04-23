import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface WebhookLogEntry {
  provider: 'lemon-squeezy' | 'flutterwave' | 'stripe';
  eventType: string;
  userId?: string;
  payload: Record<string, any>;
  status: 'success' | 'failure';
  errorMessage?: string;
  metadata?: Record<string, any>;
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
    console.error('[WebhookLogger] Failed to log webhook event:', err);
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
    console.error('[WebhookLogger] Failed to fetch logs:', err);
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
        'lemon-squeezy': 0,
        'flutterwave': 0,
        'stripe': 0,
      } as Record<string, number>,
    };

    data?.forEach(d => {
      if (d.provider in stats.byProvider) {
        stats.byProvider[d.provider as any]++;
      }
    });

    return stats;
  } catch (err) {
    console.error('[WebhookLogger] Failed to get stats:', err);
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
    console.error('[WebhookAlert]', {
      provider: entry.provider,
      eventType: entry.eventType,
      error: entry.errorMessage,
      timestamp: new Date().toISOString(),
    });

    // TODO: Integrate with email service or Slack
    // Example:
    // await sendWebhookFailureEmail(
    //   recipient || process.env.ADMIN_EMAIL!,
    //   entry
    // );
  }
}
