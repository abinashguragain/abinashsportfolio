-- Create table for Google Sheets integration configuration
CREATE TABLE public.google_sheets_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  spreadsheet_id TEXT,
  sheet_name TEXT DEFAULT 'Sheet1',
  service_account_credentials TEXT, -- JSON string of service account credentials
  is_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.google_sheets_config ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write config
CREATE POLICY "Admins can read Google Sheets config"
  ON public.google_sheets_config
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can insert Google Sheets config"
  ON public.google_sheets_config
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update Google Sheets config"
  ON public.google_sheets_config
  FOR UPDATE
  USING (public.is_admin());

-- Add updated_at trigger
CREATE TRIGGER update_google_sheets_config_updated_at
  BEFORE UPDATE ON public.google_sheets_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Insert default row
INSERT INTO public.google_sheets_config (spreadsheet_id, sheet_name, is_enabled)
VALUES (NULL, 'Sheet1', false);