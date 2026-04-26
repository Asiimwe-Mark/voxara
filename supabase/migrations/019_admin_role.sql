-- ============================================================
-- 019_admin_role.sql
--
-- Adds 'role' column to profiles to support admin access control.
-- Fixes: /api/admin/check-access route which queries profile.role
-- ============================================================

BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
    CHECK (role IN ('user', 'admin', 'moderator'));

-- Create an index for fast admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role)
  WHERE role != 'user';

COMMIT;
