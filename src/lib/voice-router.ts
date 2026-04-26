/**
 * Voice Router
 *
 * Routes voice synthesis requests to the cheapest available provider
 * based on the user's plan tier:
 *
 *   free    → Edge-TTS  (Microsoft, completely free, 100+ voices)
 *   pro     → ElevenLabs (premium quality, ~$0.09/video)
 *   agency  → ElevenLabs (premium quality + voice cloning)
 *
 * This single decision saves roughly $0.09 × all_free_videos per month.
 * At 500 free users × 1 video = ~$45/month saved just from this file.
 */

import { VOICE_ROUTING_CONFIG } from './constants';

export type VoiceProvider = 'edge-tts' | 'elevenlabs';
export type PlanType = 'free' | 'pro' | 'agency';

export interface VoiceRoutingDecision {
  provider: VoiceProvider;
  /** The voice ID to use. For edge-tts this is the neural voice name. */
  voiceId: string;
  /** Whether ElevenLabs voice cloning is available on this plan. */
  cloningEnabled: boolean;
}

/**
 * Returns the voice provider and voice ID to use for a given user plan.
 * For free tier users, always returns Edge-TTS regardless of any saved voiceId.
 */
export function resolveVoiceProvider(
  plan: PlanType,
  savedVoiceId?: string | null,
  language: string = 'en'
): VoiceRoutingDecision {
  if (plan === 'free') {
    return {
      provider: 'edge-tts',
      voiceId: VOICE_ROUTING_CONFIG.DEFAULT_EDGE_TTS_VOICES[language as keyof typeof VOICE_ROUTING_CONFIG.DEFAULT_EDGE_TTS_VOICES]
        ?? VOICE_ROUTING_CONFIG.DEFAULT_EDGE_TTS_VOICES['en'],
      cloningEnabled: false,
    };
  }

  // Pro and Agency: use their saved ElevenLabs voice ID if they have one
  return {
    provider: 'elevenlabs',
    voiceId: savedVoiceId ?? 'pNInz6obpgDQGcFmaJgB', // Adam — ElevenLabs default
    cloningEnabled: plan === 'agency' || plan === 'pro',
  };
}

/**
 * Returns true when the user's plan entitles them to Mux adaptive streaming.
 * Free tier videos are served directly from Supabase storage, saving the
 * $89/month Mux Growth plan until you're generating enough revenue to justify it.
 */
export function shouldUseMux(plan: PlanType): boolean {
  return plan === 'pro' || plan === 'agency';
}

/**
 * Returns the HeyGen voice config to embed in a video generation request.
 * Free users get HeyGen's built-in default voice (no external API cost).
 * Paid users get their ElevenLabs voice routed through HeyGen's integration.
 */
export function buildHeyGenVoiceConfig(
  plan: PlanType,
  savedVoiceId?: string | null
): { type: string; voice_id?: string } | undefined {
  if (plan === 'free' || !savedVoiceId) {
    // undefined = HeyGen uses its default built-in voice (free, no ElevenLabs call)
    return undefined;
  }
  return { type: 'elevenlabs', voice_id: savedVoiceId };
}
