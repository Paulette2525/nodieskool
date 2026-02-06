-- Fix: Replace SECURITY DEFINER view with SECURITY INVOKER
-- Drop and recreate the view with explicit security invoker
DROP VIEW IF EXISTS public.quiz_questions_public;

CREATE VIEW public.quiz_questions_public 
WITH (security_invoker = true)
AS
SELECT 
  id,
  quiz_id,
  question,
  order_index,
  points,
  created_at,
  -- Strip isCorrect from options array
  (
    SELECT jsonb_agg(
      jsonb_build_object('text', opt->>'text')
    )
    FROM jsonb_array_elements(options) AS opt
  ) AS options
FROM public.quiz_questions;

-- Grant access to the view
GRANT SELECT ON public.quiz_questions_public TO authenticated;