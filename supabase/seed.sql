-- ======================================================
-- SEED DATA FOR DEVELOPMENT & TESTING
-- ======================================================

-- Clean existing seed data (optional – comment out if you want to preserve)
TRUNCATE public.profiles CASCADE;
TRUNCATE public.videos CASCADE;
TRUNCATE public.user_avatars CASCADE;
TRUNCATE public.user_voices CASCADE;
TRUNCATE public.organizations CASCADE;
TRUNCATE public.video_templates CASCADE;

-- ======================================================
-- CREATE TEST USERS (via auth.users)
-- Note: In production seed, you'd use Supabase dashboard or API.
-- For local development with supabase seed, we use the auth.users table directly.
-- ======================================================

-- Helper function to create a user with profile
CREATE OR REPLACE FUNCTION seed_create_user(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_plan TEXT DEFAULT 'free',
  p_credits INT DEFAULT 3
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Insert into auth.users
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
    '',
    '',
    '',
    ''
  ) RETURNING id INTO v_user_id;

  -- Profile is created automatically by trigger
  -- Update profile with custom plan/credits
  UPDATE public.profiles
  SET plan = p_plan,
      credits = p_credits
  WHERE id = v_user_id;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ======================================================
-- SEED USERS
-- ======================================================

-- Free tier user
SELECT seed_create_user('free@example.com', 'password123', 'Free User', 'free', 3);

-- Pro tier user
SELECT seed_create_user('pro@example.com', 'password123', 'Pro Creator', 'pro', 30);

-- Agency tier user
SELECT seed_create_user('agency@example.com', 'password123', 'Agency Studio', 'agency', 100);

-- Additional demo users
SELECT seed_create_user('demo1@example.com', 'password123', 'Alex Rivera', 'free', 5);
SELECT seed_create_user('demo2@example.com', 'password123', 'Jordan Taylor', 'pro', 25);
SELECT seed_create_user('demo3@example.com', 'password123', 'Casey Morgan', 'agency', 150);

-- ======================================================
-- SEED CREDIT PACKS (if not already present)
-- ======================================================
INSERT INTO public.credit_packs (name, credits, price_amount, active)
VALUES
  ('10 Credits', 10, 900, true),
  ('25 Credits', 25, 1900, true),
  ('50 Credits', 50, 2900, true)
ON CONFLICT (name) DO NOTHING;

-- ======================================================
-- SEED VIDEOS FOR EACH USER
-- ======================================================

DO $$
DECLARE
  v_user RECORD;
  v_video_id UUID;
BEGIN
  FOR v_user IN SELECT id, email FROM auth.users WHERE email LIKE '%@example.com' LOOP
    -- Create 3-5 videos per user with various statuses
    FOR i IN 1..5 LOOP
      INSERT INTO public.videos (
        user_id,
        title,
        script,
        status,
        mux_playback_id,
        created_at
      ) VALUES (
        v_user.id,
        CASE (i % 5)
          WHEN 1 THEN '5 Morning Habits for Productivity'
          WHEN 2 THEN 'How to Start a Successful YouTube Channel'
          WHEN 3 THEN 'The Power of Meditation in 60 Seconds'
          WHEN 4 THEN 'AI Tools That Will Change Your Workflow'
          ELSE 'Quick Tips for Better Sleep'
        END,
        'In this video, we explore practical tips and strategies to improve your daily routine...',
        CASE (i % 4)
          WHEN 0 THEN 'ready'
          WHEN 1 THEN 'processing'
          WHEN 2 THEN 'pending'
          ELSE 'ready'
        END,
        CASE WHEN (i % 4) = 0 OR (i % 4) = 3 THEN 'mock-playback-' || gen_random_uuid()::text ELSE NULL END,
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
  FOR v_user IN SELECT id FROM auth.users WHERE email IN ('pro@example.com', 'agency@example.com', 'demo2@example.com', 'demo3@example.com') LOOP
    -- Create 1-2 avatars per eligible user
    INSERT INTO public.user_avatars (user_id, name, status, image_url, provider, created_at)
    VALUES
      (v_user.id, 'Professional Me', 'ready', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg', 'heygen', now() - INTERVAL '3 days'),
      (v_user.id, 'Casual Style', CASE WHEN random() > 0.5 THEN 'ready' ELSE 'processing' END, 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg', 'heygen', now() - INTERVAL '1 day');
  END LOOP;
END $$;

-- ======================================================
-- SEED VOICE CLONES
-- ======================================================

DO $$
DECLARE
  v_user RECORD;
BEGIN
  FOR v_user IN SELECT id FROM auth.users WHERE email IN ('pro@example.com', 'agency@example.com', 'demo2@example.com', 'demo3@example.com') LOOP
    INSERT INTO public.user_voices (user_id, name, status, voice_id, created_at)
    VALUES
      (v_user.id, 'My Voice', 'ready', 'elevenlabs-' || gen_random_uuid()::text, now() - INTERVAL '5 days');
  END LOOP;
END $$;

-- ======================================================
-- SEED ORGANIZATIONS (TEAMS)
-- ======================================================

DO $$
DECLARE
  v_agency_user_id UUID;
  v_org_id UUID;
BEGIN
  SELECT id INTO v_agency_user_id FROM auth.users WHERE email = 'agency@example.com' LIMIT 1;
  
  IF v_agency_user_id IS NOT NULL THEN
    -- Create organization using the helper function
    SELECT public.create_organization('Creative Agency Inc', 'creative-agency', v_agency_user_id) INTO v_org_id;
    
    -- Add additional members to the organization
    INSERT INTO public.organization_members (organization_id, user_id, role)
    SELECT v_org_id, id, 'member'
    FROM auth.users
    WHERE email IN ('pro@example.com', 'demo2@example.com')
    AND NOT EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = v_org_id AND user_id = auth.users.id
    );
    
    -- Create another organization
    SELECT public.create_organization('Studio Beta', 'studio-beta', v_agency_user_id) INTO v_org_id;
  END IF;
END $$;

-- ======================================================
-- SEED MARKETPLACE TEMPLATES
-- ======================================================

DO $$
DECLARE
  v_creator_id UUID;
BEGIN
  SELECT id INTO v_creator_id FROM auth.users WHERE email = 'agency@example.com' LIMIT 1;
  
  INSERT INTO public.video_templates (
    creator_id,
    name,
    description,
    category,
    price,
    preview_url,
    downloads,
    rating,
    status,
    created_at
  ) VALUES
    (v_creator_id, 'Product Launch Promo', 'High-energy template for announcing new products. Fast cuts and bold text overlays.', 'marketing', 1900, 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg', 245, 4.7, 'approved', now() - INTERVAL '30 days'),
    (v_creator_id, 'Educational Explainer', 'Clean, professional template for tutorials and how-to videos. Includes lower thirds and chapter markers.', 'educational', 900, 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg', 189, 4.5, 'approved', now() - INTERVAL '20 days'),
    (v_creator_id, 'Social Media Reel', 'Vertical format optimized for TikTok and Instagram Reels. Trendy transitions and music sync.', 'social', 500, 'https://images.pexels.com/photos/3184348/pexels-photo-3184348.jpeg', 512, 4.8, 'approved', now() - INTERVAL '15 days'),
    (v_creator_id, 'Real Estate Showcase', 'Elegant template for property tours. Smooth pans and info cards.', 'business', 1500, 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg', 78, 4.3, 'approved', now() - INTERVAL '10 days'),
    (v_creator_id, 'Podcast Visualizer', 'Audio-reactive template for podcast clips. Waveforms and captions included.', 'entertainment', 1200, 'https://images.pexels.com/photos/3182771/pexels-photo-3182771.jpeg', 156, 4.6, 'pending', now() - INTERVAL '2 days');
END $$;

-- ======================================================
-- SEED SOCIAL ACCOUNTS (mock connections)
-- ======================================================

DO $$
DECLARE
  v_user RECORD;
BEGIN
  FOR v_user IN SELECT id FROM auth.users WHERE email IN ('pro@example.com', 'agency@example.com') LOOP
    INSERT INTO public.social_accounts (user_id, platform, account_id, account_name, created_at)
    VALUES
      (v_user.id, 'youtube', 'UC' || gen_random_uuid()::text, 'My Channel', now() - INTERVAL '7 days'),
      (v_user.id, 'tiktok', 'user_' || gen_random_uuid()::text, '@creator', now() - INTERVAL '5 days');
  END LOOP;
END $$;

-- ======================================================
-- SEED ANALYTICS DATA (viewer sessions and metrics)
-- ======================================================

DO $$
DECLARE
  v_video RECORD;
  v_session_id TEXT;
  v_date DATE;
  v_views INT;
BEGIN
  FOR v_video IN SELECT id, user_id FROM public.videos WHERE status = 'ready' LIMIT 10 LOOP
    -- Generate 30 days of metrics
    FOR i IN 0..29 LOOP
      v_date := CURRENT_DATE - (i * INTERVAL '1 day');
      v_views := floor(random() * 500 + 50)::INT;
      
      INSERT INTO public.video_metrics (video_id, user_id, date, views, unique_viewers, watch_time_seconds, average_view_percentage, clicks, ctr)
      VALUES (
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
    
    -- Create some viewer sessions for the last 7 days
    FOR i IN 1..50 LOOP
      v_session_id := gen_random_uuid()::text;
      INSERT INTO public.viewer_sessions (
        video_id,
        session_id,
        viewer_id,
        start_time,
        end_time,
        watch_duration,
        watch_percentage,
        device_type,
        browser,
        country,
        referrer,
        utm_source
      ) VALUES (
        v_video.id,
        v_session_id,
        CASE WHEN random() > 0.5 THEN gen_random_uuid()::text ELSE NULL END,
        now() - (random() * INTERVAL '7 days'),
        now() - (random() * INTERVAL '7 days') + (random() * INTERVAL '2 minutes'),
        floor(random() * 120)::INT,
        random() * 100,
        CASE WHEN random() > 0.5 THEN 'mobile' ELSE 'desktop' END,
        CASE WHEN random() > 0.7 THEN 'Chrome' ELSE 'Safari' END,
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
-- VERIFICATION QUERIES (for debugging)
-- ======================================================
-- SELECT COUNT(*) FROM auth.users WHERE email LIKE '%@example.com';
-- SELECT COUNT(*) FROM public.videos;
-- SELECT COUNT(*) FROM public.user_avatars;
-- SELECT COUNT(*) FROM public.organizations;
-- ── Storage buckets ──────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('videos',        'videos',        true,  104857600, ARRAY['video/mp4','video/webm','audio/mpeg','audio/mp3','audio/wav']),
  ('voice-samples', 'voice-samples', false, 26214400,  ARRAY['audio/mpeg','audio/mp3','audio/wav','audio/webm','audio/ogg'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS for voice-samples bucket
CREATE POLICY "Users upload own voice samples"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'voice-samples' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users read own voice samples"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'voice-samples' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own voice samples"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'voice-samples' AND (storage.foldername(name))[1] = auth.uid()::text);
