"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type VideoStatus = "pending" | "processing" | "ready" | "failed";

interface VideoStatusState {
  status: VideoStatus | null;
  playbackId: string | null;
  videoUrl: string | null;
  error: string | null;
  isLoading: boolean;
  isPolling: boolean;
}

interface UseVideoStatusOptions {
  /** Polling interval in milliseconds (default: 5000). */
  pollInterval?: number;
  /** Whether to poll automatically (default: true). */
  enabled?: boolean;
  /** Stop polling when status becomes ready or failed (default: true). */
  stopOnTerminal?: boolean;
}

interface UseVideoStatusReturn extends VideoStatusState {
  /** Manually refresh the video status. */
  refresh: () => Promise<void>;
  /** Start polling (if not already enabled). */
  startPolling: () => void;
  /** Stop polling. */
  stopPolling: () => void;
}

export function useVideoStatus(
  videoId: string | null,
  options: UseVideoStatusOptions = {}
): UseVideoStatusReturn {
  const {
    pollInterval = 5000,
    enabled = true,
    stopOnTerminal = true,
  } = options;

  const supabase = createClient();
  const [state, setState] = useState<VideoStatusState>({
    status: null,
    playbackId: null,
    videoUrl: null,
    error: null,
    isLoading: true,
    isPolling: false,
  });

  const [shouldPoll, setShouldPoll] = useState(enabled && !!videoId);

  const fetchStatus = useCallback(async () => {
    if (!videoId) return;

    try {
      const { data, error } = await supabase
        .from("videos")
        .select("status, mux_playback_id, video_url")
        .eq("id", videoId)
        .single();

      if (error) throw error;

      setState((prev) => ({
        ...prev,
        status: data.status,
        playbackId: data.mux_playback_id,
        videoUrl: data.video_url,
        error: null,
        isLoading: false,
      }));

      // Stop polling if terminal state reached
      if (stopOnTerminal && (data.status === "ready" || data.status === "failed")) {
        setShouldPoll(false);
        setState((prev) => ({ ...prev, isPolling: false }));
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Failed to fetch video status",
        isLoading: false,
      }));
    }
  }, [videoId, supabase, stopOnTerminal]);

  const startPolling = useCallback(() => {
    if (videoId) setShouldPoll(true);
  }, [videoId]);

  const stopPolling = useCallback(() => {
    setShouldPoll(false);
    setState((prev) => ({ ...prev, isPolling: false }));
  }, []);

  // Initial fetch
  useEffect(() => {
    if (videoId) {
      fetchStatus();
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [videoId, fetchStatus]);

  // Polling effect
  useEffect(() => {
    if (!shouldPoll || !videoId) {
      setState((prev) => ({ ...prev, isPolling: false }));
      return;
    }

    setState((prev) => ({ ...prev, isPolling: true }));

    const interval = setInterval(fetchStatus, pollInterval);
    return () => {
      clearInterval(interval);
      setState((prev) => ({ ...prev, isPolling: false }));
    };
  }, [shouldPoll, videoId, pollInterval, fetchStatus]);

  // Real‑time subscription as backup
  useEffect(() => {
    if (!videoId) return;

    const channel = supabase
      .channel(`video-${videoId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "videos",
          filter: `id=eq.${videoId}`,
        },
        (payload) => {
          setState((prev) => ({
            ...prev,
            status: payload.new.status,
            playbackId: payload.new.mux_playback_id,
            videoUrl: payload.new.video_url,
          }));

          if (stopOnTerminal && (payload.new.status === "ready" || payload.new.status === "failed")) {
            setShouldPoll(false);
            setState((prev) => ({ ...prev, isPolling: false }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [videoId, supabase, stopOnTerminal]);

  return {
    ...state,
    refresh: fetchStatus,
    startPolling,
    stopPolling,
  };
}