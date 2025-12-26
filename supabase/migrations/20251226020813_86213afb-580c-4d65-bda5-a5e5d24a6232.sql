-- Add badge fields to hero_content for the experience badge
ALTER TABLE public.hero_content
ADD COLUMN badge_title TEXT DEFAULT '5+ Years',
ADD COLUMN badge_subtitle TEXT DEFAULT 'Writing Experience';

-- Create CTA content table
CREATE TABLE public.cta_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'LET''S CREATE TOGETHER',
  highlight_word TEXT DEFAULT 'TOGETHER',
  description TEXT DEFAULT 'Have a project in mind? I''d love to hear about it. Let''s discuss how we can bring your content vision to life.',
  button_text TEXT DEFAULT 'Start a Conversation',
  button_link TEXT DEFAULT '/contact',
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for CTA
ALTER TABLE public.cta_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage cta" ON public.cta_content FOR ALL USING (is_admin());
CREATE POLICY "Public can view cta" ON public.cta_content FOR SELECT USING (is_active = true);

-- Create footer content table
CREATE TABLE public.footer_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_description TEXT DEFAULT 'Content writer & storyteller. Crafting words that connect, engage, and inspire action.',
  copyright_text TEXT DEFAULT '© {year} Your Name. All rights reserved.',
  bottom_tagline TEXT DEFAULT 'Built with passion & coffee ☕',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for footer content
ALTER TABLE public.footer_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage footer" ON public.footer_content FOR ALL USING (is_admin());
CREATE POLICY "Public can view footer" ON public.footer_content FOR SELECT USING (true);

-- Create footer quick links table
CREATE TABLE public.footer_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for footer links
ALTER TABLE public.footer_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage footer_links" ON public.footer_links FOR ALL USING (is_admin());
CREATE POLICY "Public can view footer_links" ON public.footer_links FOR SELECT USING (is_active = true);

-- Create social links table
CREATE TABLE public.social_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'link',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for social links
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage social_links" ON public.social_links FOR ALL USING (is_admin());
CREATE POLICY "Public can view social_links" ON public.social_links FOR SELECT USING (is_active = true);

-- Insert default data
INSERT INTO public.cta_content (title, highlight_word, description, button_text, button_link)
VALUES ('LET''S CREATE TOGETHER', 'TOGETHER', 'Have a project in mind? I''d love to hear about it. Let''s discuss how we can bring your content vision to life.', 'Start a Conversation', '/contact');

INSERT INTO public.footer_content (brand_description, copyright_text, bottom_tagline)
VALUES ('Content writer & storyteller. Crafting words that connect, engage, and inspire action.', '© {year} Your Name. All rights reserved.', 'Built with passion & coffee ☕');

INSERT INTO public.footer_links (label, href, sort_order) VALUES
('Home', '/', 0),
('Blog', '/blog', 1),
('Contact', '/contact', 2);

INSERT INTO public.social_links (platform, url, icon, sort_order) VALUES
('Twitter', 'https://twitter.com', 'twitter', 0),
('LinkedIn', 'https://linkedin.com', 'linkedin', 1),
('GitHub', 'https://github.com', 'github', 2),
('Email', 'mailto:hello@example.com', 'mail', 3);

-- Create triggers for updated_at
CREATE TRIGGER update_cta_content_updated_at BEFORE UPDATE ON public.cta_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_footer_content_updated_at BEFORE UPDATE ON public.footer_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_footer_links_updated_at BEFORE UPDATE ON public.footer_links FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_social_links_updated_at BEFORE UPDATE ON public.social_links FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();