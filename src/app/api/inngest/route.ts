import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import {
  generateVideo,
  pollAvatarStatus,
  cancelAvatarPolling,
  aggregateMetrics,
  autoTopUp,
  publishScheduled,
} from "@/inngest/functions/index";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    generateVideo,
    pollAvatarStatus,
    cancelAvatarPolling,
    aggregateMetrics,
    autoTopUp,
    publishScheduled,
  ],
});
