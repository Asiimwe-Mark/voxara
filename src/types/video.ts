export type VideoStatus = "pending" | "processing" | "ready" | "failed";

export interface Video {
  id: string;
  user_id: string;
  organization_id: string | null;
  title: string;
  script: string;
  audio_url: string | null;
  video_url: string | null;
  status: VideoStatus;
  mux_asset_id: string | null;
  mux_playback_id: string | null;
  youtube_id: string | null;
  avatar_id: string | null;
  voice_id: string | null;
  footage_urls: string[] | null;
  timeline: TimelineData | null;
  duration_frames: number | null;
  created_at: string;
  updated_at?: string;
}

export interface TimelineClip {
  id: string;
  trackId: string;
  start: number;
  end: number;
  type: "video" | "image" | "text" | "audio";
  url?: string;
  content?: string;
  properties: Record<string, any>;
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: "video" | "audio" | "text" | "overlay";
  clips: TimelineClip[];
  muted?: boolean;
  volume?: number;
}

export interface TimelineData {
  tracks: TimelineTrack[];
  durationInFrames: number;
}

export interface VideoMetrics {
  id: string;
  video_id: string;
  user_id: string;
  date: string;
  views: number;
  unique_viewers: number;
  watch_time_seconds: number;
  average_view_percentage: number;
  clicks: number;
  ctr: number;
  retention_30s: number;
  retention_60s: number;
  retention_complete: number;
  created_at: string;
  updated_at: string;
}

export interface ViewerSession {
  id: string;
  video_id: string;
  session_id: string;
  viewer_id: string | null;
  start_time: string;
  end_time: string | null;
  watch_duration: number;
  watch_percentage: number;
  device_type: string | null;
  browser: string | null;
  country: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  playback_events: PlaybackEvent[];
  created_at: string;
}

export interface PlaybackEvent {
  type: "progress" | "click" | "pause" | "seek";
  progress?: number;
  time?: number;
  timestamp: string;
}

export interface VideoTemplate {
  id: string;
  creator_id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  preview_url: string | null;
  template_data: Record<string, any> | null;
  downloads: number;
  rating: number | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface TemplatePurchase {
  id: string;
  template_id: string;
  buyer_id: string;
  amount_paid: number;
  platform_fee: number;
  creator_payout: number;
  stripe_payment_intent_id: string | null;
  created_at: string;
}