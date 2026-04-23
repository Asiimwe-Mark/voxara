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

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Handle transaction.completed event
 * Adds credits to user account after successful payment
 */
export async function handleTransactionCompleted(data: Record<string, any>): Promise<void> {
  const userId = extractUserIdFromWebhook(data);

  if (!userId) {
    console.warn('Transaction completed but no user_id found in webhook data');
    return;
  }

  try {
    const transactionId = data.id;
    const credits = extractCreditsFromWebhook(data);
    const amount = data.totals?.total || '0';
    const currencyCode = data.currency_code || 'USD';

    // Only process if credits are specified
    if (credits <= 0) {
      console.warn(`No credits specified for transaction ${transactionId}`);
      return;
    }

    // Add credits to user
    const { error: rpcError } = await supabaseAdmin.rpc('add_credits', {
      p_user_id: userId,
      p_credits: credits,
    });

    if (rpcError) {
      throw new Error(`Failed to add credits: ${rpcError.message}`);
    }

    // Record credit purchase in database
    const { error: insertError } = await supabaseAdmin.from('credit_purchases').insert({
      user_id: userId,
      credits_purchased: credits,
      amount_paid: parseInt(amount, 10),
      payment_intent_id: transactionId,
      provider: 'paddle',
      status: 'completed',
    });

    if (insertError) {
      throw new Error(`Failed to record purchase: ${insertError.message}`);
    }

    // Fetch user details for email
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name, credits')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Failed to fetch profile for email:', profileError);
    }

    // Send success email
    if (profile?.email) {
      try {
        await sendPaymentSuccessEmail(
          profile.email,
          profile.full_name || 'Creator',
          'credit_pack',
          `${currencyCode} ${(parseInt(amount, 10) / 100).toFixed(2)}`,
          credits,
          new Date().toLocaleDateString()
        );
      } catch (emailError) {
        console.error('Failed to send success email:', emailError);
      }
    }

    console.log(`✓ Transaction ${transactionId} processed: +${credits} credits for user ${userId}`);
  } catch (error) {
    console.error('Error handling transaction.completed:', error);
    throw error;
  }
}

/**
 * Handle subscription.created event
 * Creates subscription record and updates user plan
 */
export async function handleSubscriptionCreated(data: Record<string, any>): Promise<void> {
  const userId = extractUserIdFromWebhook(data);

  if (!userId) {
    console.warn('Subscription created but no user_id found in webhook data');
    return;
  }

  try {
    const subscriptionId = data.id;
    const planType = data?.custom_data?.plan_type || 'pro';
    const status = mapSubscriptionStatus(data.status);
    const credits = getCreditsForPlan(planType);

    // Upsert subscription record
    const { error: upsertError } = await supabaseAdmin
      .from('payment_subscriptions')
      .upsert(
        {
          user_id: userId,
          subscription_id: subscriptionId,
          provider: 'paddle',
          plan: planType,
          status,
          paddle_customer_id: data.customer_id,
          metadata: data?.custom_data || {},
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'subscription_id' }
      );

    if (upsertError) {
      throw new Error(`Failed to upsert subscription: ${upsertError.message}`);
    }

    // Update user profile with new plan and credits
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ plan: planType, credits })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    // Fetch user details for email
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Failed to fetch profile for email:', profileError);
    }

    // Send welcome/confirmation email
    if (profile?.email) {
      try {
        const prices: Record<string, string> = {
          'pro': '$19.99/month',
          'agency': '$49.99/month',
          'free': 'Free',
        };

        await sendPaymentSuccessEmail(
          profile.email,
          profile.full_name || 'Creator',
          planType,
          prices[planType] || '$0.00',
          credits,
          new Date().toLocaleDateString()
        );
      } catch (emailError) {
        console.error('Failed to send subscription email:', emailError);
      }
    }

    console.log(`✓ Subscription ${subscriptionId} created for user ${userId} (${planType})`);
  } catch (error) {
    console.error('Error handling subscription.created:', error);
    throw error;
  }
}

/**
 * Handle subscription.updated event
 * Updates subscription status and user plan
 */
export async function handleSubscriptionUpdated(data: Record<string, any>): Promise<void> {
  const userId = extractUserIdFromWebhook(data);

  if (!userId) {
    console.warn('Subscription updated but no user_id found in webhook data');
    return;
  }

  try {
    const subscriptionId = data.id;
    const planType = data?.custom_data?.plan_type || 'pro';
    const status = mapSubscriptionStatus(data.status);

    // Update subscription record
    const { error: updateError } = await supabaseAdmin
      .from('payment_subscriptions')
      .update({
        status,
        metadata: data?.custom_data || {},
        updated_at: new Date().toISOString(),
      })
      .eq('subscription_id', subscriptionId);

    if (updateError) {
      throw new Error(`Failed to update subscription: ${updateError.message}`);
    }

    console.log(`✓ Subscription ${subscriptionId} updated: status=${status}`);
  } catch (error) {
    console.error('Error handling subscription.updated:', error);
    throw error;
  }
}

/**
 * Handle subscription.paused event
 * Updates subscription status to paused
 */
export async function handleSubscriptionPaused(data: Record<string, any>): Promise<void> {
  const userId = extractUserIdFromWebhook(data);

  if (!userId) {
    console.warn('Subscription paused but no user_id found in webhook data');
    return;
  }

  try {
    const subscriptionId = data.id;

    // Update subscription status to paused
    const { error: updateError } = await supabaseAdmin
      .from('payment_subscriptions')
      .update({
        status: 'paused',
        updated_at: new Date().toISOString(),
      })
      .eq('subscription_id', subscriptionId);

    if (updateError) {
      throw new Error(`Failed to pause subscription: ${updateError.message}`);
    }

    console.log(`✓ Subscription ${subscriptionId} paused`);
  } catch (error) {
    console.error('Error handling subscription.paused:', error);
    throw error;
  }
}

/**
 * Handle subscription.resumed event
 * Updates subscription status to active
 */
export async function handleSubscriptionResumed(data: Record<string, any>): Promise<void> {
  const userId = extractUserIdFromWebhook(data);

  if (!userId) {
    console.warn('Subscription resumed but no user_id found in webhook data');
    return;
  }

  try {
    const subscriptionId = data.id;

    // Update subscription status to active
    const { error: updateError } = await supabaseAdmin
      .from('payment_subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('subscription_id', subscriptionId);

    if (updateError) {
      throw new Error(`Failed to resume subscription: ${updateError.message}`);
    }

    console.log(`✓ Subscription ${subscriptionId} resumed`);
  } catch (error) {
    console.error('Error handling subscription.resumed:', error);
    throw error;
  }
}

/**
 * Handle subscription.canceled event
 * Downgrades user to free plan
 */
export async function handleSubscriptionCanceled(data: Record<string, any>): Promise<void> {
  const userId = extractUserIdFromWebhook(data);

  if (!userId) {
    console.warn('Subscription canceled but no user_id found in webhook data');
    return;
  }

  try {
    const subscriptionId = data.id;

    // Update subscription status to canceled
    const { error: updateError } = await supabaseAdmin
      .from('payment_subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('subscription_id', subscriptionId);

    if (updateError) {
      throw new Error(`Failed to cancel subscription: ${updateError.message}`);
    }

    // Downgrade user to free plan
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ plan: 'free', credits: 3 })
      .eq('id', userId);

    if (profileError) {
      throw new Error(`Failed to downgrade profile: ${profileError.message}`);
    }

    // Send cancellation email
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .maybeSingle();

    if (profile?.email) {
      try {
        // Send cancellation email (you may want to create a specific email template for this)
        console.log(`Subscription canceled for ${profile.email}`);
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError);
      }
    }

    console.log(`✓ Subscription ${subscriptionId} canceled, user ${userId} downgraded to free`);
  } catch (error) {
    console.error('Error handling subscription.canceled:', error);
    throw error;
  }
}

/**
 * Handle customer.created event
 * Records Paddle customer ID in database
 */
export async function handleCustomerCreated(data: Record<string, any>): Promise<void> {
  const userId = extractUserIdFromWebhook(data);

  if (!userId) {
    console.warn('Customer created but no user_id found in webhook data');
    return;
  }

  try {
    const customerId = data.id;
    const email = data.email;

    // Record Paddle customer ID
    const { error: upsertError } = await supabaseAdmin
      .from('payment_customers')
      .upsert(
        {
          user_id: userId,
          payment_customer_id: customerId,
          provider: 'paddle',
          email,
          metadata: data,
        },
        { onConflict: 'user_id' }
      );

    if (upsertError) {
      throw new Error(`Failed to record customer: ${upsertError.message}`);
    }

    console.log(`✓ Customer ${customerId} created for user ${userId}`);
  } catch (error) {
    console.error('Error handling customer.created:', error);
    throw error;
  }
}

/**
 * Log webhook event for debugging
 */
export async function logWebhookEvent(
  eventType: string,
  data: Record<string, any>,
  status: 'success' | 'error',
  error?: Error
): Promise<void> {
  try {
    await supabaseAdmin.from('webhook_logs').insert({
      provider: 'paddle',
      event_type: eventType,
      payload: data,
      status,
      error_message: error?.message || null,
      created_at: new Date().toISOString(),
    });
  } catch (logError) {
    console.error('Failed to log webhook event:', logError);
  }
}
