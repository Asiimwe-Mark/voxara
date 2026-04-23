// ======================================================
// Core Types
// ======================================================

export type PlanType = "free" | "pro" | "agency";
export type VideoStatus = "pending" | "processing" | "ready" | "failed";
export type AvatarStatus = "pending" | "processing" | "ready" | "failed";
export type VoiceStatus = "pending" | "ready" | "failed";
export type SocialPlatform = "youtube" | "tiktok" | "instagram" | "linkedin";

// ======================================================
// User & Profile
// ======================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  credits: number;
  plan: PlanType;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
}

// ======================================================
// Video
// ======================================================

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

export interface VideoWithDetails extends Video {
  profiles?: Profile;
  user_avatars?: UserAvatar;
  user_voices?: UserVoice;
}

// ======================================================
// Timeline Editor
// ======================================================

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

// ======================================================
// AI Avatars
// ======================================================

export interface UserAvatar {
  id: string;
  user_id: string;
  name: string;
  status: AvatarStatus;
  image_url: string | null;
  avatar_model_id: string | null;
  heygen_task_id: string | null;
  provider: string;
  polling_canceled: boolean;
  created_at: string;
  updated_at?: string;
}

// ======================================================
// Voice Cloning
// ======================================================

export interface UserVoice {
  id: string;
  user_id: string;
  name: string;
  status: VoiceStatus;
  sample_audio_url: string | null;
  voice_id: string | null;
  created_at: string;
}

// ======================================================
// Billing & Subscriptions
// ======================================================

export interface StripeCustomer {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  created_at: string;
}

export interface StripeSubscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string | null;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price_amount: number;
  stripe_price_id: string | null;
  active: boolean;
  created_at: string;
}

export interface CreditPurchase {
  id: string;
  user_id: string;
  credit_pack_id: string | null;
  credits_purchased: number;
  amount_paid: number;
  stripe_payment_intent_id: string | null;
  status: string;
  created_at: string;
}

export interface AutoTopUpSettings {
  id: string;
  user_id: string;
  enabled: boolean;
  threshold: number;
  top_up_amount: number;
  updated_at: string;
}

// ======================================================
// Social Accounts
// ======================================================

export interface SocialAccount {
  id: string;
  user_id: string;
  platform: SocialPlatform;
  account_id: string;
  account_name: string | null;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublishingSchedule {
  id: string;
  user_id: string;
  video_id: string;
  platforms: SocialPlatform[];
  scheduled_time: string;
  status: "pending" | "processing" | "published" | "failed";
  publish_result: Record<string, any> | null;
  created_at: string;
}

// ======================================================
// Team & Workspaces
// ======================================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  created_by: string | null;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  joined_at: string;
}

export interface OrganizationInvite {
  id: string;
  organization_id: string;
  email: string;
  role: "admin" | "member";
  invited_by: string | null;
  token: string;
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
}

export interface OrganizationSubscription {
  id: string;
  organization_id: string;
  stripe_subscription_id: string | null;
  plan: PlanType;
  seats: number;
  credits_shared: number;
  status: string;
  current_period_end: string | null;
  created_at: string;
}

// ======================================================
// Analytics
// ======================================================

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

// ======================================================
// Marketplace
// ======================================================

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

export interface CreatorAccount {
  id: string;
  user_id: string;
  stripe_account_id: string | null;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  created_at: string;
}

// ======================================================
// API Keys
// ======================================================

export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_preview: string;
  permissions: string[];
  last_used_at: string | null;
  expires_at: string | null;
  status: "active" | "revoked";
  created_at: string;
}

export interface WebhookEndpoint {
  id: string;
  user_id: string;
  url: string;
  events: string[];
  secret: string;
  status: "active" | "inactive";
  created_at: string;
}

// ======================================================
// API Response Types
// ======================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

// ======================================================
// Form Types
// ======================================================

export interface TopicFormValues {
  topic: string;
}

export interface ScriptFormValues {
  script: string;
}

export interface AvatarFormValues {
  name: string;
  imageBase64?: string;
  gender?: "male" | "female" | "neutral";
}

export interface VoiceFormValues {
  name: string;
  audioUrl?: string;
  description?: string;
}

// ======================================================
// Component Props
// ======================================================

export interface DashboardHeaderProps {
  user: {
    name: string;
    email: string;
    credits: number;
    plan: PlanType;
  };
}

export interface VideoCardProps {
  video: Video;
  onDelete?: () => void;
}

export interface CreditsBadgeProps {
  userId?: string;
  initialCredits?: number;
  className?: string;
  showIcon?: boolean;
  variant?: "default" | "outline" | "secondary";
}

// ======================================================
// Hook Return Types
// ======================================================

export interface UseCreditsReturn {
  credits: number | null;
  isLoading: boolean;
  isSubscribed: boolean;
  refresh: () => Promise<void>;
  deduct: (amount: number) => Promise<boolean>;
  add: (amount: number) => Promise<void>;
  error: string | null;
}

export interface UseVideoStatusReturn {
  status: VideoStatus | null;
  playbackId: string | null;
  videoUrl: string | null;
  error: string | null;
  isLoading: boolean;
  isPolling: boolean;
  refresh: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
}

export interface UseSocialAccountsReturn {
  accounts: SocialAccount[];
  isLoading: boolean;
  isConnecting: boolean;
  connectingPlatform: SocialPlatform | null;
  connect: (platform: SocialPlatform) => void;
  disconnect: (accountId: string) => Promise<void>;
  refresh: () => Promise<void>;
  isConnected: (platform: SocialPlatform) => boolean;
  getAccount: (platform: SocialPlatform) => SocialAccount | undefined;
}