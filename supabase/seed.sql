-- ======================================================
-- SEED DATA FOR DEVELOPMENT & TESTING
--
-- Fixed vs original:
--   1. Added pgcrypto extension (required for crypt/gen_salt in seed_create_user)
--   2. Added DELETE FROM auth.users before TRUNCATEs so re-runs don't fail
--      with duplicate email violations
--   3. Fixed credit_packs ON CONFLICT (name) → ON CONFLICT DO NOTHING
--      ('name' is not a unique column — only 'credits' and 'stripe_price_id' are)
--   4. Fixed storage bucket insert: ON CONFLICT DO UPDATE so file_size_limit
--      and allowed_mime_types actually get applied to the pre-existing 'videos'
--      bucket (created in migration 001 without those columns)
--   5. Added DROP POLICY IF EXISTS guards for voice-samples storage RLS
--      policies so the seed is idempotent on re-runs
--   6. Added one admin user for testing /api/admin/* routes (role = 'admin')
-- ======================================================

-- Required for crypt() and gen_salt() used in seed_create_user
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ======================================================
-- CLEAN EXISTING SEED DATA
-- Order matters: delete from auth.users first — the ON DELETE CASCADE on
-- profiles.id → auth.users.id cascades through all downstream tables.
-- Then TRUNCATE tables that have no FK to auth.users (orgs, templates, etc).
-- ======================================================

-- Remove seed users from auth (cascades to profiles + all child tables)
DELETE FROM auth.users WHERE email LIKE '%@example.com';

-- Truncate tables not covered by the cascade above
TRUNCATE public.organizations  CASCADE;
TRUNCATE public.video_templates CASCADE;

-- ======================================================
-- HELPER: create a user with profile
-- ======================================================

CREATE OR REPLACE FUNCTION seed_create_user(
  p_email      TEXT,
  p_password   TEXT,
  p_full_name  TEXT,
  p_plan       TEXT    DEFAULT 'free',
  p_credits    INT     DEFAULT 3,
  p_role       TEXT    DEFAULT 'user'
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', p_full_name),
    now(),
    now(),
    '', '', '', ''
  ) RETURNING id INTO v_user_id;

  -- Profile is auto-created by handle_new_user trigger; update the fields
  UPDATE public.profiles
  SET plan    = p_plan,
      credits = p_credits,
      role    = p_role         -- added in migration 019
  WHERE id = v_user_id;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ======================================================
-- SEED USERS
-- ======================================================

-- Free tier
SELECT seed_create_user('free@example.com',   'password123', 'Free User',      'free',   3);

-- Pro tier
SELECT seed_create_user('pro@example.com',    'password123', 'Pro Creator',    'pro',    30);

-- Agency tier
SELECT seed_create_user('agency@example.com', 'password123', 'Agency Studio',  'agency', 100);

-- Admin user — for testing /api/admin/* routes (role added in migration 019)
SELECT seed_create_user('admin@example.com',  'password123', 'Admin User',     'agency', 100, 'admin');

-- Additional demo users
SELECT seed_create_user('demo1@example.com',  'password123', 'Alex Rivera',    'free',   5);
SELECT seed_create_user('demo2@example.com',  'password123', 'Jordan Taylor',  'pro',    25);
SELECT seed_create_user('demo3@example.com',  'password123', 'Casey Morgan',   'agency', 150);

-- ======================================================
-- SEED CREDIT PACKS
-- FIX: ON CONFLICT (name) → ON CONFLICT DO NOTHING
-- 'name' is not a unique column; only 'credits' (migration 010) and
-- 'stripe_price_id' (migration 002) have unique constraints.
-- ======================================================

INSERT INTO public.credit_packs (name, credits, price_amount, active)
VALUES
  ('10 Credits',  10, 900,  true),
  ('25 Credits',  25, 1900, true),
  ('50 Credits',  50, 2900, true)
ON CONFLICT DO NOTHING;

-- ======================================================
-- SEED VIDEOS FOR EACH USER
-- ======================================================

DO $$
DECLARE
  v_user     RECORD;
  v_video_id UUID;
BEGIN
  FOR v_user IN
    SELECT id FROM auth.users WHERE email LIKE '%@example.com'
  LOOP
    FOR i IN 1..5 LOOP
      INSERT INTO public.videos (
        user_id, title, script, status, mux_playback_id, created_at
      ) VALUES (
        v_user.id,
        CASE (i % 5)
          WHEN 1 THEN '5 Morning Habits for Productivity'
          WHEN 2 THEN 'How to Start a Successful YouTube Channel'
          WHEN 3 THEN 'The Power of Meditation in 60 Seconds'
          WHEN 4 THEN 'AI Tools That Will Change Your Workflow'
          ELSE        'Quick Tips for Better Sleep'
        END,
        'In this video, we explore practical tips and strategies to improve your daily routine...',
        CASE (i % 4)
          WHEN 0 THEN 'ready'
          WHEN 1 THEN 'processing'
          WHEN 2 THEN 'pending'
          ELSE        'ready'
        END,
        CASE WHEN (i % 4) IN (0, 3)
          THEN 'mock-playback-' || gen_random_uuid()::text
          ELSE NULL
        END,
        now() - (i * INTERVAL '2 days')
      ) RETURNING id INTO v_video_id;
    END LOOP;
  END LOOP;
END $$;

-- ======================================================
-- SEED AI AVATARS
-- ======================================================

DO $$
DECLARE
  v_user RECORD;
BEGIN
  FOR v_user IN
    SELECT id FROM auth.users
    WHERE email IN ('pro@example.com','agency@example.com','demo2@example.com','demo3@example.com')
  LOOP
    INSERT INTO public.user_avatars (user_id, name, status, image_url, provider, created_at)
    VALUES
      (v_user.id, 'Professional Me', 'ready',
       'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
       'heygen', now() - INTERVAL '3 days'),
      (v_user.id, 'Casual Style',
       CASE WHEN random() > 0.5 THEN 'ready' ELSE 'processing' END,
       'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
       'heygen', now() - INTERVAL '1 day');
  END LOOP;
END $$;

-- ======================================================
-- SEED VOICE CLONES
-- ======================================================

DO $$
DECLARE
  v_user RECORD;
BEGIN
  FOR v_user IN
    SELECT id FROM auth.users
    WHERE email IN ('pro@example.com','agency@example.com','demo2@example.com','demo3@example.com')
  LOOP
    INSERT INTO public.user_voices (user_id, name, status, voice_id, created_at)
    VALUES
      (v_user.id, 'My Voice', 'ready',
       'elevenlabs-' || gen_random_uuid()::text,
       now() - INTERVAL '5 days');
  END LOOP;
END $$;

-- ======================================================
-- SEED ORGANIZATIONS
-- ======================================================

DO $$
DECLARE
  v_agency_id UUID;
  v_org_id    UUID;
BEGIN
  SELECT id INTO v_agency_id FROM auth.users WHERE email = 'agency@example.com' LIMIT 1;

  IF v_agency_id IS NOT NULL THEN
    SELECT public.create_organization('Creative Agency Inc', 'creative-agency', v_agency_id)
    INTO v_org_id;

    INSERT INTO public.organization_members (organization_id, user_id, role)
    SELECT v_org_id, id, 'member'
    FROM auth.users
    WHERE email IN ('pro@example.com','demo2@example.com')
    ON CONFLICT (organization_id, user_id) DO NOTHING;

    SELECT public.create_organization('Studio Beta', 'studio-beta', v_agency_id)
    INTO v_org_id;
  END IF;
END $$;

-- ======================================================
-- SEED MARKETPLACE TEMPLATES
-- status = 'approved' is valid — included in the CHECK constraint fixed
-- in migration 018: ('draft','published','pending','approved','rejected','archived')
-- ======================================================

DO $$
DECLARE
  v_creator_id UUID;
BEGIN
  SELECT id INTO v_creator_id FROM auth.users WHERE email = 'agency@example.com' LIMIT 1;

  INSERT INTO public.video_templates (
    creator_id, name, description, category, price,
    preview_url, downloads, rating, status, created_at
  ) VALUES
    (v_creator_id, 'Product Launch Promo',
     'High-energy template for announcing new products. Fast cuts and bold text overlays.',
     'marketing', 1900,
     'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg',
     245, 4.7, 'approved', now() - INTERVAL '30 days'),

    (v_creator_id, 'Educational Explainer',
     'Clean, professional template for tutorials and how-to videos. Includes lower thirds.',
     'educational', 900,
     'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg',
     189, 4.5, 'approved', now() - INTERVAL '20 days'),

    (v_creator_id, 'Social Media Reel',
     'Vertical format optimised for TikTok and Instagram Reels. Trendy transitions.',
     'social', 500,
     'https://images.pexels.com/photos/3184348/pexels-photo-3184348.jpeg',
     512, 4.8, 'approved', now() - INTERVAL '15 days'),

    (v_creator_id, 'Real Estate Showcase',
     'Elegant template for property tours. Smooth pans and info cards.',
     'business', 1500,
     'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
     78, 4.3, 'approved', now() - INTERVAL '10 days'),

    (v_creator_id, 'Podcast Visualizer',
     'Audio-reactive template for podcast clips. Waveforms and captions included.',
     'entertainment', 1200,
     'https://images.pexels.com/photos/3182771/pexels-photo-3182771.jpeg',
     156, 4.6, 'pending', now() - INTERVAL '2 days');
END $$;

-- ======================================================
-- SEED SOCIAL ACCOUNTS (mock connections)
-- ======================================================

DO $$
DECLARE
  v_user RECORD;
BEGIN
  FOR v_user IN
    SELECT id FROM auth.users WHERE email IN ('pro@example.com','agency@example.com')
  LOOP
    INSERT INTO public.social_accounts (user_id, platform, account_id, account_name, created_at)
    VALUES
      (v_user.id, 'youtube', 'UC' || gen_random_uuid()::text, 'My Channel', now() - INTERVAL '7 days'),
      (v_user.id, 'tiktok',  'user_' || gen_random_uuid()::text, '@creator', now() - INTERVAL '5 days')
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- ======================================================
-- SEED ANALYTICS DATA
-- ======================================================

DO $$
DECLARE
  v_video     RECORD;
  v_session_id TEXT;
  v_date      DATE;
  v_views     INT;
BEGIN
  FOR v_video IN
    SELECT id, user_id FROM public.videos WHERE status = 'ready' LIMIT 10
  LOOP
    -- 30 days of daily metrics
    FOR i IN 0..29 LOOP
      v_date  := CURRENT_DATE - (i * INTERVAL '1 day');
      v_views := floor(random() * 500 + 50)::INT;

      INSERT INTO public.video_metrics (
        video_id, user_id, date, views, unique_viewers,
        watch_time_seconds, average_view_percentage, clicks, ctr
      ) VALUES (
        v_video.id,
        v_video.user_id,
        v_date,
        v_views,
        floor(v_views * 0.7)::INT,
        v_views * 45,
        65 + floor(random() * 20)::INT,
        floor(v_views * 0.05)::INT,
        3.5 + random() * 5
      )
      ON CONFLICT (video_id, date) DO NOTHING;
    END LOOP;

    -- 50 viewer sessions over the last 7 days
    FOR i IN 1..50 LOOP
      v_session_id := gen_random_uuid()::text;
      INSERT INTO public.viewer_sessions (
        video_id, session_id, viewer_id,
        start_time, end_time,
        watch_duration, watch_percentage,
        device_type, browser, country, referrer, utm_source
      ) VALUES (
        v_video.id,
        v_session_id,
        CASE WHEN random() > 0.5 THEN gen_random_uuid()::text ELSE NULL END,
        now() - (random() * INTERVAL '7 days'),
        now() - (random() * INTERVAL '7 days') + (random() * INTERVAL '2 minutes'),
        floor(random() * 120)::INT,
        random() * 100,
        CASE WHEN random() > 0.5 THEN 'mobile' ELSE 'desktop' END,
        CASE WHEN random() > 0.7 THEN 'Chrome'  ELSE 'Safari' END,
        'US',
        CASE WHEN random() > 0.5 THEN 'https://youtube.com' ELSE 'direct' END,
        CASE WHEN random() > 0.5 THEN 'youtube' ELSE NULL END
      );
    END LOOP;
  END LOOP;
END $$;

-- ======================================================
-- CLEANUP
-- ======================================================

DROP FUNCTION IF EXISTS seed_create_user;

-- ======================================================
-- STORAGE BUCKETS
--
-- FIX: ON CONFLICT (id) DO NOTHING → DO UPDATE SET
-- Migration 001 already creates the 'videos' bucket without file_size_limit
-- or allowed_mime_types. DO NOTHING means those settings would never be
-- applied to an existing bucket. DO UPDATE ensures they are always current.
-- ======================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('videos',
   'videos',
   true,
   104857600,
   ARRAY['video/mp4','video/webm','audio/mpeg','audio/mp3','audio/wav']),
  ('voice-samples',
   'voice-samples',
   false,
   26214400,
   ARRAY['audio/mpeg','audio/mp3','audio/wav','audio/webm','audio/ogg'])
ON CONFLICT (id) DO UPDATE
  SET file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- FIX: DROP before CREATE so this block is idempotent on re-runs.
-- CREATE POLICY errors if the policy already exists.
DROP POLICY IF EXISTS "Users upload own voice samples" ON storage.objects;
DROP POLICY IF EXISTS "Users read own voice samples"   ON storage.objects;
DROP POLICY IF EXISTS "Users delete own voice samples" ON storage.objects;

CREATE POLICY "Users upload own voice samples"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'voice-samples'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users read own voice samples"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'voice-samples'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users delete own voice samples"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'voice-samples'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ======================================================
-- VERIFICATION (uncomment to debug)
-- ======================================================
-- SELECT COUNT(*) AS users       FROM auth.users        WHERE email LIKE '%@example.com';
-- SELECT COUNT(*) AS videos      FROM public.videos;
-- SELECT COUNT(*) AS avatars     FROM public.user_avatars;
-- SELECT COUNT(*) AS orgs        FROM public.organizations;
-- SELECT COUNT(*) AS templates   FROM public.video_templates;
-- SELECT email, plan, credits, role FROM public.profiles
--   JOIN auth.users ON auth.users.id = profiles.id
--   WHERE auth.users.email LIKE '%@example.com';
