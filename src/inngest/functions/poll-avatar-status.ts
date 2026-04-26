import { supabaseAdmin } from '@/lib/supabase/admin';
import { inngest } from '@/inngest/client';
import { createClient } from '@supabase/supabase-js';
import { checkHeyGenAvatarStatus } from '@/features/avatar/services/heygen';
import { sendAvatarReadyEmail } from '@/lib/email/avatar-notification';


export const pollAvatarStatus = inngest.createFunction(
  { id: 'poll-avatar-status', name: 'Poll Avatar Status', retries: 10 },
  { event: 'avatar/poll-status' },
  async ({ event, step }) => {
    const { avatarId, retryCount = 0 } = event.data;

    // Step 1: Fetch current avatar state (status + cancellation flag)
    const currentState = await step.run('check-current', async () => {
      const { data } = await supabaseAdmin
        .from('user_avatars')
        .select('status, polling_canceled, heygen_task_id, user_id, name')
        .eq('id', avatarId)
        .single();
      return data;
    });

    if (!currentState) return { status: 'not_found' };

    // Respect explicit cancellation
    if (currentState.polling_canceled) {
      return { status: 'canceled', reason: 'Polling was explicitly canceled' };
    }

    // Already in terminal state — nothing to do
    if (currentState.status === 'ready' || currentState.status === 'failed') {
      return { status: 'already_completed', finalStatus: currentState.status };
    }

    if (!currentState.heygen_task_id) {
      return { status: 'error', reason: 'No HeyGen task ID on record' };
    }

    // Step 2: Poll HeyGen API
    const heygenStatus = await step.run('poll-heygen', () =>
      checkHeyGenAvatarStatus(currentState.heygen_task_id)
    );

    if (heygenStatus === 'completed') {
      await step.run('update-ready', async () => {
        await supabaseAdmin
          .from('user_avatars')
          .update({ status: 'ready', updated_at: new Date().toISOString() })
          .eq('id', avatarId);

        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(
          currentState.user_id
        );
        if (userData?.user?.email) {
          await sendAvatarReadyEmail(
            userData.user.email,
            userData.user.user_metadata?.full_name || 'Creator',
            currentState.name
          );
        }
      });
      return { status: 'ready' };
    }

    if (heygenStatus === 'failed') {
      await step.run('update-failed', () =>
        supabaseAdmin
          .from('user_avatars')
          .update({ status: 'failed', updated_at: new Date().toISOString() })
          .eq('id', avatarId)
      );
      return { status: 'failed' };
    }

    // Still processing — schedule next poll (max 30 retries = ~30 min)
    if (retryCount < 30) {
      await step.sleep('wait-before-next-poll', '1m');
      await step.run('schedule-next-poll', () =>
        inngest.send({
          name: 'avatar/poll-status',
          data: { avatarId, retryCount: retryCount + 1 },
        })
      );
    } else {
      // Timeout — mark as failed after 30 min
      await supabaseAdmin
        .from('user_avatars')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', avatarId);
      return { status: 'timeout' };
    }

    return { status: 'polling', retryCount };
  }
);
