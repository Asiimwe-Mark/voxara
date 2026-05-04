import { supabaseAdmin } from '@/lib/supabase/admin';
import { logger } from '@/lib/logger';
/**
 * Paddle Webhook Event Handlers
 * Processes different Paddle webhook events and updates database state
 */

import { createClient } from '@supabase/supabase-js';
import { sendPaymentSuccessEmail, sendPaymentFailedEmail } from '@/lib/email/service';
import {
  extractUserIdFromWebhook,
  extractCreditsFromWebhook,
  mapSubscriptionStatus,
  getCreditsForPlan,
} from './webhook-utils';


/**
 * Handle transaction.completed event
 * Adds credits to user account after successful payment
 */
export async function handleTransactionCompleted(data: Record<string, unknown>): Promise<void> {
  const userId = extractUserIdFromWebhook(data);

  if (!userId) {
    logger.warn('Transaction completed but no user_id found in webhook data');
    return;
  }

  try {
    const transactionId = data.id as string;
    const credits = extractCreditsFromWebhook(data);
    const amount = (data.totals as any)?.total || '0';
    const currencyCode = (data.currency_code as string) || 'USD';

    // Only process if credits are specified
    if (credits <= 0) {
      logger.warn(`No credits specified for transaction ${transactionId}`);
      return;
    }

    // Add credits to user
    const { error: rpcError } = await supabaseAdmin.rpc('add_credits' as any, {
      p_user_id: userId,
      p_credits: credits,
    } as any);

    if (rpcError) {
      throw new Error(`Failed to add credits: ${rpcError.message}`);
    }

    // Record credit purchase in database
    const { error: insertError } = await supabaseAdmin.from('credit_purchases' as any).insert({
      user_id: userId,
      credits_purchased: credits,
      amount_paid: parseInt(amount, 10),
      payment_intent_id: transactionId,
      provider: 'paddle',
      status: 'completed',
    } as any);

    if (insertError) {
      throw new Error(`Failed to record purchase: ${insertError.message}`);
    }

    // Fetch user details for email
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles' as any)
      .select('email, full_name, credits')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      logger.error('Failed to fetch profile for email', { detail: profileError instanceof Error ? profileError.message : String(profileError) });
    }

    // Send success email
    if ((profile as any)?.email) {
      try {
        await sendPaymentSuccessEmail(
          (profile as any).email,
          (profile as any).full_name || 'Creator',
          'credit_pack',
          `${currencyCode} ${(parseInt(amount, 10) / 100).toFixed(2)}`,
          credits,
          new Date().toLocaleDateString()
        );
      } catch (emailError) {
        logger.error('Failed to send success email', { detail: emailError instanceof Error ? emailError.message : String(emailError) });
      }
    }

    logger.info(`✓ Transaction ${transactionId} processed: +${credits} credits for user ${userId}`);
  } catch (error) {
    logger.error('Error handling transaction.completed', { detail: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

/**
 * Handle subscription.created event
 * Creates subscription record and updates user plan
 */
export async function handleSubscriptionCreated(data: Record<string, unknown>): Promise<void> {
  const userId = extractUserIdFromWebhook(data);

  if (!userId) {
    logger.warn('Subscription created but no user_id found in webhook data');
    return;
  }

  try {
    const subscriptionId = data.id as string;
    const planType = (data.custom_data as any)?.plan_type || 'pro';
    const status = mapSubscriptionStatus(data.status as string);
    const credits = getCreditsForPlan(planType);

    // Upsert subscription record
    const { error: upsertError } = await supabaseAdmin
      .from('payment_subscriptions' as any)
      .upsert(
        {
          user_id: userId,
          subscription_id: subscriptionId,
          provider: 'paddle',
          plan: planType,
          status,
          paddle_customer_id: data.customer_id as string,
          metadata: (data.custom_data as any) || {},
          updated_at: new Date().toISOString(),
        } as any,
        { onConflict: 'subscription_id' }
      );

    if (upsertError) {
      throw new Error(`Failed to upsert subscription: ${upsertError.message}`);
    }

    // Update user profile with new plan and credits
    const { error: updateError } = await (supabaseAdmin as any)
      .from('profiles')
      .update({ plan: planType, credits })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    // Fetch user details for email
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles' as any)
      .select('email, full_name')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      logger.error('Failed to fetch profile for email', { detail: profileError instanceof Error ? profileError.message : String(profileError) });
    }

    // Send welcome/confirmation email
    if ((profile as any)?.email) {
      try {
        const prices: Record<string, string> = {
          'pro': '$19.99/month',
          'agency': '$49.99/month',
          'free': 'Free',
        };

        await sendPaymentSuccessEmail(
          (profile as any).email,
          (profile as any).full_name || 'Creator',
          planType,
          prices[planType] || '$0.00',
          credits,
          new Date().toLocaleDateString()
        );
      } catch (emailError) {
        logger.error('Failed to send subscription email', { detail: emailError instanceof Error ? emailError.message : String(emailError) });
      }
    }

    logger.info(`✓ Subscription ${subscriptionId} created for user ${userId} (${planType})`);
  } catch (error) {
    logger.error('Error handling subscription.created', { detail: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

/**
 * Handle subscription.updated event
 * Updates subscription status and user plan
 */
export async function handleSubscriptionUpdated(data: Record<string, unknown>): Promise<void> {
  const userId = extractUserIdFromWebhook(data);

  if (!userId) {
    logger.warn('Subscription updated but no user_id found in webhook data');
    return;
  }

  try {
    const subscriptionId = data.id as string;
    const planType = (data.custom_data as any)?.plan_type || 'pro';
    const status = mapSubscriptionStatus(data.status as string);

    // Update subscription record
    const { error: updateError } = await (supabaseAdmin
      .from('payment_subscriptions' as any) as any)
      .update({
        status,
        metadata: (data.custom_data as any) || {},
        updated_at: new Date().toISOString(),
      })
      .eq('subscription_id', subscriptionId);

    if (updateError) {
      throw new Error(`Failed to update subscription: ${updateError.message}`);
    }

    logger.info(`✓ Subscription ${subscriptionId} updated: status=${status}`);
  } catch (error) {
    logger.error('Error handling subscription.updated', { detail: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

/**
 * Handle subscription.paused event
 * Updates subscription status to paused
 */
export async function handleSubscriptionPaused(data: Record<string, unknown>): Promise<void> {
  const userId = extractUserIdFromWebhook(data);

  if (!userId) {
    logger.warn('Subscription paused but no user_id found in webhook data');
    return;
  }

  try {
    const subscriptionId = data.id as string;

    // Update subscription status to paused
    const { error: updateError } = await (supabaseAdmin
      .from('payment_subscriptions' as any) as any)
      .update({
        status: 'paused',
        updated_at: new Date().toISOString(),
      })
      .eq('subscription_id', subscriptionId);

    if (updateError) {
      throw new Error(`Failed to pause subscription: ${updateError.message}`);
    }

    logger.info(`✓ Subscription ${subscriptionId} paused`);
  } catch (error) {
    logger.error('Error handling subscription.paused', { detail: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

/**
 * Handle subscription.resumed event
 * Updates subscription status to active
 */
export async function handleSubscriptionResumed(data: Record<string, unknown>): Promise<void> {
  const userId = extractUserIdFromWebhook(data);

  if (!userId) {
    logger.warn('Subscription resumed but no user_id found in webhook data');
    return;
  }

  try {
    const subscriptionId = data.id as string;

    // Update subscription status to active
    const { error: updateError } = await (supabaseAdmin
      .from('payment_subscriptions' as any) as any)
      .update({
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('subscription_id', subscriptionId);

    if (updateError) {
      throw new Error(`Failed to resume subscription: ${updateError.message}`);
    }

    logger.info(`✓ Subscription ${subscriptionId} resumed`);
  } catch (error) {
    logger.error('Error handling subscription.resumed', { detail: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

/**
 * Handle subscription.canceled event
 * Downgrades user to free plan
 */
export async function handleSubscriptionCanceled(data: Record<string, unknown>): Promise<void> {
  const userId = extractUserIdFromWebhook(data);

  if (!userId) {
    logger.warn('Subscription canceled but no user_id found in webhook data');
    return;
  }

  try {
    const subscriptionId = data.id as string;

    // Update subscription status to canceled
    const { error: updateError } = await (supabaseAdmin
      .from('payment_subscriptions' as any) as any)
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('subscription_id', subscriptionId);

    if (updateError) {
      throw new Error(`Failed to cancel subscription: ${updateError.message}`);
    }

    // Downgrade user to free plan
    const { error: profileError } = await (supabaseAdmin as any)
      .from('profiles')
      .update({ plan: 'free', credits: 1 })
      .eq('id', userId);

    if (profileError) {
      throw new Error(`Failed to downgrade profile: ${profileError.message}`);
    }

    // Send cancellation email
    const { data: profile } = await supabaseAdmin
      .from('profiles' as any)
      .select('email, full_name')
      .eq('id', userId)
      .maybeSingle();

    if ((profile as any)?.email) {
      try {
        // Send cancellation email (you may want to create a specific email template for this)
        logger.info(`Subscription canceled for ${(profile as any).email}`);
      } catch (emailError) {
        logger.error('Failed to send cancellation email', { detail: emailError instanceof Error ? emailError.message : String(emailError) });
      }
    }

    logger.info(`✓ Subscription ${subscriptionId} canceled, user ${userId} downgraded to free`);
  } catch (error) {
    logger.error('Error handling subscription.canceled', { detail: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

/**
 * Handle customer.created event
 * Records Paddle customer ID in database
 */
export async function handleCustomerCreated(data: Record<string, unknown>): Promise<void> {
  const userId = extractUserIdFromWebhook(data);

  if (!userId) {
    logger.warn('Customer created but no user_id found in webhook data');
    return;
  }

  try {
    const customerId = data.id as string;
    const email = data.email as string;

    // Record Paddle customer ID
    const { error: upsertError } = await supabaseAdmin
      .from('payment_customers' as any)
      .upsert(
        {
          user_id: userId,
          payment_customer_id: customerId,
          provider: 'paddle',
          email,
          metadata: data,
        } as any,
        { onConflict: 'user_id' }
      );

    if (upsertError) {
      throw new Error(`Failed to record customer: ${upsertError.message}`);
    }

    logger.info(`✓ Customer ${customerId} created for user ${userId}`);
  } catch (error) {
    logger.error('Error handling customer.created', { detail: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

/**
 * Log webhook event for debugging
 */
export async function logWebhookEvent(
  eventType: string,
  data: Record<string, unknown>,
  status: 'success' | 'error',
  error?: Error
): Promise<void> {
  try {
    await supabaseAdmin.from('webhook_logs' as any).insert({
      provider: 'paddle',
      event_type: eventType,
      payload: data,
      status,
      error_message: error?.message || null,
      created_at: new Date().toISOString(),
    } as any);
  } catch (logError) {
    logger.error('Failed to log webhook event', { detail: logError instanceof Error ? logError.message : String(logError) });
  }
}
