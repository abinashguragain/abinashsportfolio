-- Create seo_settings table for global SEO configuration
CREATE TABLE public.seo_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_title TEXT DEFAULT 'My Website',
  site_description TEXT DEFAULT 'Welcome to my website',
  default_og_image TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins manage seo_settings" ON public.seo_settings
  FOR ALL USING (is_admin());

CREATE POLICY "Public can view seo_settings" ON public.seo_settings
  FOR SELECT USING (true);

-- Insert default row
INSERT INTO public.seo_settings (site_title, site_description) VALUES ('My Website', 'Welcome to my website');

-- Add SEO fields to blog_posts
ALTER TABLE public.blog_posts 
  ADD COLUMN meta_title TEXT,
  ADD COLUMN meta_description TEXT,
  ADD COLUMN featured_image_alt TEXT;

-- Add update trigger for seo_settings
CREATE TRIGGER update_seo_settings_updated_at
  BEFORE UPDATE ON public.seo_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();