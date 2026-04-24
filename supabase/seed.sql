-- ======================================================
-- EXTENSIONS (REQUIRED)
-- ======================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ======================================================
-- CLEAN EXISTING DATA
-- ======================================================
TRUNCATE public.profiles CASCADE;
TRUNCATE public.videos CASCADE;
TRUNCATE public.user_avatars CASCADE;
TRUNCATE public.user_voices CASCADE;
TRUNCATE public.organizations CASCADE;
TRUNCATE public.video_templates CASCADE;

-- ======================================================
-- HELPER FUNCTION: CREATE USER SAFELY
-- ======================================================
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
  -- Avoid duplicates
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;

  IF v_user_id IS NOT NULL THEN
    RETURN v_user_id;
  END IF;

  -- Insert user
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

  -- Update profile (trigger must exist)
  UPDATE public.profiles
  SET plan = p_plan,
      credits = p_credits
  WHERE id = v_user_id;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ======================================================
-- CREATE USERS (SAFE EXECUTION BLOCK)
-- ======================================================
DO $$
BEGIN
  PERFORM seed_create_user('free@example.com', 'password123', 'Free User', 'free', 3);
  PERFORM seed_create_user('pro@example.com', 'password123', 'Pro Creator', 'pro', 30);
  PERFORM seed_create_user('agency@example.com', 'password123', 'Agency Studio', 'agency', 100);
  PERFORM seed_create_user('demo1@example.com', 'password123', 'Alex Rivera', 'free', 5);
  PERFORM seed_create_user('demo2@example.com', 'password123', 'Jordan Taylor', 'pro', 25);
  PERFORM seed_create_user('demo3@example.com', 'password123', 'Casey Morgan', 'agency', 150);
END $$;

-- ======================================================
-- CREDIT PACKS
-- ======================================================
INSERT INTO public.credit_packs (name, credits, price_amount, active)
VALUES
  ('10 Credits', 10, 900, true),
  ('25 Credits', 25, 1900, true),
  ('50 Credits', 50, 2900, true)
ON CONFLICT (name) DO NOTHING;

-- ======================================================
-- VIDEOS
-- ======================================================
DO $$
DECLARE
  v_user RECORD;
BEGIN
  FOR v_user IN SELECT id FROM auth.users WHERE email LIKE '%@example.com' LOOP
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
        'Demo Video ' || i,
        'Sample script content...',
        CASE WHEN i % 2 = 0 THEN 'ready' ELSE 'processing' END,
        CASE WHEN i % 2 = 0 THEN 'mock-' || gen_random_uuid()::text ELSE NULL END,
        now() - (i * INTERVAL '2 days')
      );
    END LOOP;
  END LOOP;
END $$;

-- ======================================================
-- AVATARS
-- ======================================================
INSERT INTO public.user_avatars (user_id, name, status, image_url, provider)
SELECT id, 'Default Avatar', 'ready',
'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
'heygen'
FROM auth.users WHERE email LIKE '%@example.com';

-- ======================================================
-- VOICES
-- ======================================================
INSERT INTO public.user_voices (user_id, name, status, voice_id)
SELECT id, 'Default Voice', 'ready',
'voice-' || gen_random_uuid()::text
FROM auth.users WHERE email LIKE '%@example.com';

-- ======================================================
-- STORAGE BUCKETS
-- ======================================================
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('videos', 'videos', true),
  ('voice-samples', 'voice-samples', false)
ON CONFLICT (id) DO NOTHING;

-- ======================================================
-- STORAGE POLICIES
-- ======================================================
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

-- ======================================================
-- CLEANUP
-- ======================================================
DROP FUNCTION IF EXISTS seed_create_user;