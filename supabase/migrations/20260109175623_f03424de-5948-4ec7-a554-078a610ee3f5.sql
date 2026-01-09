-- Create table for third-party integrations
CREATE TABLE public.third_party_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.third_party_integrations ENABLE ROW LEVEL SECURITY;

-- Public can read active integrations (for script injection)
CREATE POLICY "Anyone can read active integrations"
ON public.third_party_integrations
FOR SELECT
USING (is_active = true);

-- Only admins can manage integrations
CREATE POLICY "Admins can manage integrations"
ON public.third_party_integrations
FOR ALL
USING (public.is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_third_party_integrations_updated_at
BEFORE UPDATE ON public.third_party_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Insert default rows
INSERT INTO public.third_party_integrations (key, value, is_active)
VALUES 
  ('google_analytics', NULL, true),
  ('google_search_console', NULL, true);