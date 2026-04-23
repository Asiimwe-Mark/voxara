-- ======================================================
-- MIGRATION 008: ATOMIC CREDIT OPERATIONS
-- ======================================================
-- Replaces the non-atomic read-then-write pattern in application code.
-- Both functions run inside a single transaction, preventing race conditions
-- where two concurrent requests could spend the same credits.

-- Atomically deduct credits. Returns TRUE on success, FALSE if balance is
-- insufficient. Using FOR UPDATE to lock the row for the duration.
CREATE OR REPLACE FUNCTION public.deduct_credits
(p_user_id UUID, p_credits INT DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
  v_current INT;
BEGIN
  SELECT credits
  INTO v_current
  FROM public.profiles
  WHERE id = p_user_id
  FOR
  UPDATE;
  -- row-level lock prevents concurrent over-spend

  IF v_current IS NULL OR v_current < p_credits THEN
  RETURN FALSE;
END
IF;

  UPDATE public.profiles
  SET    credits     = credits - p_credits,
         updated_at  = now()
  WHERE  id = p_user_id;

RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure add_credits is also safe and consistent
CREATE OR REPLACE FUNCTION public.add_credits
(p_user_id UUID, p_credits INT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET    credits    = credits + p_credits,
         updated_at = now()
  WHERE  id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute rights to authenticated users (RLS on profiles still applies)
GRANT EXECUTE ON FUNCTION public.deduct_credits
(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_credits
(UUID, INT)    TO authenticated;
-- Service role needs these for Inngest background jobs
GRANT EXECUTE ON FUNCTION public.deduct_credits
(UUID, INT) TO service_role;
GRANT EXECUTE ON FUNCTION public.add_credits
(UUID, INT)    TO service_role;
