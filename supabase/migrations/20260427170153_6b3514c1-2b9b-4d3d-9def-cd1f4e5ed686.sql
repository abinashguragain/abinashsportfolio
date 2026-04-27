CREATE TABLE IF NOT EXISTS public.tracking_snippets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('gtm', 'meta_pixel')),
  name text NOT NULL,
  code text NOT NULL,
  is_global boolean NOT NULL DEFAULT false,
  page_paths text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tracking_snippets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active tracking_snippets"
  ON public.tracking_snippets FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage tracking_snippets"
  ON public.tracking_snippets FOR ALL
  USING (is_admin());

CREATE TRIGGER tracking_snippets_updated_at
  BEFORE UPDATE ON public.tracking_snippets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();