-- ============================================================
-- Migration 012: delete_user_account RPC (called from DangerZone)
-- ============================================================

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Cascade deletes are handled by FK ON DELETE CASCADE on all child tables.
  -- Deleting from auth.users will remove the profile and all related rows.
  DELETE FROM auth.users WHERE id = v_user_id;
END;
$$;
