-- Add Turnstile site key to site_settings (public key can be stored in DB)
INSERT INTO public.site_settings (key, value)
VALUES ('turnstile_site_key', NULL)
ON CONFLICT (key) DO NOTHING;