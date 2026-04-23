-- Add database indexes for performance optimization
-- Migration: 013_add_performance_indexes.sql

-- Add published_at column to videos if not exists
ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Add subscription_status column to profiles if not exists
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_status TEXT;

-- Indexes for videos table
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_user_id_status ON videos(user_id, status);
CREATE INDEX IF NOT EXISTS idx_videos_user_id_created_at ON videos(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_published ON videos(published_at) WHERE published_at IS NOT NULL;

-- Indexes for profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);

-- Indexes for video_metrics table (replaces analytics)
CREATE INDEX IF NOT EXISTS idx_video_metrics_video_id ON video_metrics(video_id);
CREATE INDEX IF NOT EXISTS idx_video_metrics_created_at ON video_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_metrics_video_id_created_at ON video_metrics(video_id, created_at DESC);

-- Indexes for user_avatars table (replaces avatars)
CREATE INDEX IF NOT EXISTS idx_user_avatars_user_id ON user_avatars(user_id);
CREATE INDEX IF NOT EXISTS idx_user_avatars_created_at ON user_avatars(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_avatars_provider ON user_avatars(provider);

-- Indexes for user_voices table
CREATE INDEX IF NOT EXISTS idx_user_voices_user_id ON user_voices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_voices_created_at ON user_voices(created_at DESC);

-- Indexes for api_keys table
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_status ON api_keys(status);
CREATE INDEX IF NOT EXISTS idx_api_keys_created_at ON api_keys(created_at DESC);

-- Indexes for organizations table (replaces teams)
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON organizations(created_by);
CREATE INDEX IF NOT EXISTS idx_organizations_created_at ON organizations(created_at DESC);

-- Indexes for organization_members table (replaces team_members)
CREATE INDEX IF NOT EXISTS idx_organization_members_organization_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_org_user ON organization_members(organization_id, user_id);

-- Indexes for video_templates table
CREATE INDEX IF NOT EXISTS idx_video_templates_creator_id ON video_templates(creator_id);
CREATE INDEX IF NOT EXISTS idx_video_templates_category ON video_templates(category);
CREATE INDEX IF NOT EXISTS idx_video_templates_created_at ON video_templates(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_videos_user_sort ON videos(user_id, created_at DESC) WHERE status != 'deleted';

-- ANALYZE to update statistics
ANALYZE;

-- Comment on indexes
COMMENT ON INDEX idx_videos_user_id IS 'Fast lookup of user videos';
COMMENT ON INDEX idx_videos_created_at IS 'Sort videos by creation date';
COMMENT ON INDEX idx_videos_status IS 'Filter videos by status';
COMMENT ON INDEX idx_video_metrics_video_id IS 'Fast lookup of video metrics';
COMMENT ON INDEX idx_api_keys_key_hash IS 'Fast lookup of API keys by hash';
