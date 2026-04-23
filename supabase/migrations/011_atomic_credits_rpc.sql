-- ============================================================
-- Migration 011: Atomic credit RPCs
-- ============================================================

-- deduct_credits: Atomically deduct N credits, returning true on success
CREATE OR REPLACE FUNCTION public.deduct_credits
(p_user_id UUID, p_credits INT DEFAULT 1)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current INT;
BEGIN
  SELECT credits
  INTO v_current
  FROM public.profiles
  WHERE id = p_user_id
  FOR
  UPDATE;
  -- row-level lock prevents races

  IF v_current IS NULL OR v_current < p_credits THEN
  RETURN FALSE;
END
IF;

  UPDATE public.profiles
  SET credits    = credits - p_credits,
      updated_at = now()
  WHERE id = p_user_id;

RETURN TRUE;
END;
$$;

-- add_credits: Atomically add N credits
CREATE OR REPLACE FUNCTION public.add_credits
(p_user_id UUID, p_credits INT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET credits    = credits + p_credits,
      updated_at = now()
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user %', p_user_id;
END
IF;
END;
$$;
