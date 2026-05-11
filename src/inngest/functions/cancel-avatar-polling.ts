import { getAdminClient } from '@/lib/supabase/admin';
import logger from '@/lib/logger';
import { inngest } from "@/inngest/client";


export const cancelAvatarPolling = inngest.createFunction(
  {
    id: "cancel-avatar-polling",
    name: "Cancel Avatar Polling",
    triggers: { event: "avatar/cancel-polling" },
  },
  async ({ event, step }: { event: any; step: any }) => {
    const supabaseAdmin = getAdminClient();
    const { avatarId } = event.data;

    if (!avatarId) {
      return { skipped: true, reason: "No avatarId provided" };
    }

    await step.run("mark-polling-canceled", async () => {
      const { error } = await supabaseAdmin
        .from("user_avatars")
        .update({
          polling_canceled: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", avatarId);

      if (error) {
        logger.error("Failed to mark polling canceled:", { detail: error });
        throw error;
      }
    });

    return {
      success: true,
      avatarId,
      message: "Polling canceled for avatar",
    };
  }
);