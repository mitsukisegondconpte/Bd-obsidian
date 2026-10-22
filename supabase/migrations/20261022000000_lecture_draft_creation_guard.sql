-- Document the existing draft-protection already installed in Supabase.
-- This file is intentionally idempotent and safe to re-run; it does not remove data.

ALTER TABLE public.series
  ADD COLUMN IF NOT EXISTS creation_key uuid;

CREATE UNIQUE INDEX IF NOT EXISTS idx_series_author_creation_key
  ON public.series (author_id, creation_key)
  WHERE creation_key IS NOT NULL;

CREATE OR REPLACE FUNCTION public.create_series_draft(p_creation_key uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_author_id uuid;
  v_series_id uuid;
BEGIN
  v_author_id := auth.uid();

  IF v_author_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = v_author_id
      AND p.is_lecture_author
  ) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT s.id
    INTO v_series_id
  FROM public.series s
  WHERE s.author_id = v_author_id
    AND s.creation_key = p_creation_key
  LIMIT 1;

  IF v_series_id IS NOT NULL THEN
    RETURN v_series_id;
  END IF;

  INSERT INTO public.series (
    author_id,
    creation_key,
    title,
    summary,
    status,
    update_day,
    is_published
  )
  VALUES (
    v_author_id,
    p_creation_key,
    'Brouillon sans titre',
    '',
    'ongoing',
    NULL,
    false
  )
  RETURNING id INTO v_series_id;

  RETURN v_series_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_series_draft(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.create_series_draft(uuid) TO authenticated;

