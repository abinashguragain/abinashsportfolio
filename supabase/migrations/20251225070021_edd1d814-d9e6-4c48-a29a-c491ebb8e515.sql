-- Create navigation_settings table to store nav links and branding
CREATE TABLE public.navigation_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'YOURNAME',
  site_name_accent text DEFAULT 'NAME',
  favicon_url text,
  logo_url text,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create nav_links table
CREATE TABLE public.nav_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  href text NOT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.navigation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nav_links ENABLE ROW LEVEL SECURITY;

-- RLS policies for navigation_settings
CREATE POLICY "Admins manage navigation_settings"
ON public.navigation_settings
FOR ALL
USING (is_admin());

CREATE POLICY "Public can view navigation_settings"
ON public.navigation_settings
FOR SELECT
USING (true);

-- RLS policies for nav_links
CREATE POLICY "Admins manage nav_links"
ON public.nav_links
FOR ALL
USING (is_admin());

CREATE POLICY "Public can view nav_links"
ON public.nav_links
FOR SELECT
USING (is_active = true);

-- Insert default navigation settings
INSERT INTO public.navigation_settings (site_name, site_name_accent) 
VALUES ('YOUR', 'NAME');

-- Insert default nav links
INSERT INTO public.nav_links (label, href, sort_order) VALUES
('Home', '/', 0),
('Experience', '/experience', 1),
('Blog', '/blog', 2);