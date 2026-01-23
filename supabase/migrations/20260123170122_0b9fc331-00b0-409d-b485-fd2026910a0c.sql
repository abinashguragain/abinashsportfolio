-- Add start_date and end_date columns if they don't exist (they should already exist based on types)
-- Add title_link column for hyperlinked titles
ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS title_link TEXT;

-- Update any existing column comments
COMMENT ON COLUMN public.experiences.title_link IS 'Optional URL to link the job title';