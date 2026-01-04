-- Create experience page content table for header/intro section
CREATE TABLE public.experience_page_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL DEFAULT 'WHAT I BRING TO THE TABLE',
  highlight_word text DEFAULT 'TABLE',
  subtitle text DEFAULT 'Combining creativity, strategy, and technical know-how to deliver content that works.',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.experience_page_content ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins manage experience_page_content" ON public.experience_page_content
  FOR ALL USING (is_admin());

CREATE POLICY "Public can view experience_page_content" ON public.experience_page_content
  FOR SELECT USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_experience_page_content_updated_at
  BEFORE UPDATE ON public.experience_page_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Insert default content
INSERT INTO public.experience_page_content (title, highlight_word, subtitle)
VALUES ('WHAT I BRING TO THE TABLE', 'TABLE', 'Combining creativity, strategy, and technical know-how to deliver content that works.');

-- Add highlights column to experiences table for bullet points (stored as JSON array)
ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS highlights text[] DEFAULT '{}';

-- Add icon column if not exists
ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS icon text DEFAULT 'Briefcase';

-- Add accent color column
ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS accent text DEFAULT 'primary';