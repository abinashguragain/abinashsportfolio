-- Add CTA section fields to experience_page_content
ALTER TABLE public.experience_page_content 
ADD COLUMN IF NOT EXISTS cta_title text DEFAULT 'READY TO COLLABORATE?',
ADD COLUMN IF NOT EXISTS cta_highlight_word text DEFAULT 'COLLABORATE',
ADD COLUMN IF NOT EXISTS cta_description text DEFAULT 'Whether you need process optimization, automation solutions, or just want to chat about a project idea.',
ADD COLUMN IF NOT EXISTS cta_button_text text DEFAULT 'Let''s Talk',
ADD COLUMN IF NOT EXISTS cta_button_link text DEFAULT '/contact',
ADD COLUMN IF NOT EXISTS cta_visible boolean DEFAULT true;

-- Update existing row with defaults
UPDATE public.experience_page_content SET
  cta_title = 'READY TO COLLABORATE?',
  cta_highlight_word = 'COLLABORATE',
  cta_description = 'Whether you need process optimization, automation solutions, or just want to chat about a project idea.',
  cta_button_text = 'Let''s Talk',
  cta_button_link = '/contact',
  cta_visible = true
WHERE cta_title IS NULL;