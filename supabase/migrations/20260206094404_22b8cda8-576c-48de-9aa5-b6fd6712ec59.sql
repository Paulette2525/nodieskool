-- Create admin_sessions table for server-side session validation
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT NOT NULL UNIQUE,
  ip_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_valid BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- No policies - only edge functions with service role can access
-- This prevents client-side manipulation

-- Create index for fast lookups
CREATE INDEX idx_admin_sessions_token ON public.admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_expires ON public.admin_sessions(expires_at);

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_admin_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.admin_sessions WHERE expires_at < now() OR is_valid = false;
END;
$$;

-- Create view for quiz questions WITHOUT correct answers
CREATE OR REPLACE VIEW public.quiz_questions_public AS
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

-- Revoke direct access to quiz_questions for regular users
-- We'll create a function to check answers server-side
CREATE OR REPLACE FUNCTION public.grade_quiz_answer(
  _question_id UUID,
  _selected_index INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _options JSONB;
  _is_correct BOOLEAN;
BEGIN
  -- Get the actual options with isCorrect flags
  SELECT options INTO _options FROM public.quiz_questions WHERE id = _question_id;
  
  IF _options IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if the selected option is correct
  SELECT (_options->_selected_index->>'isCorrect')::boolean INTO _is_correct;
  
  RETURN COALESCE(_is_correct, false);
END;
$$;