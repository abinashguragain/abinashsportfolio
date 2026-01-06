-- Create authors table
CREATE TABLE public.authors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  bio_link TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins manage authors" 
ON public.authors 
FOR ALL 
USING (is_admin());

CREATE POLICY "Public can view authors" 
ON public.authors 
FOR SELECT 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_authors_updated_at
BEFORE UPDATE ON public.authors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Update blog_posts to reference authors table instead of auth.users
ALTER TABLE public.blog_posts 
DROP COLUMN IF EXISTS author_id;

ALTER TABLE public.blog_posts 
ADD COLUMN author_id UUID REFERENCES public.authors(id) ON DELETE SET NULL;