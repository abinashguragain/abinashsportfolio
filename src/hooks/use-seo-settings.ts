import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SEOSettings {
  id: string;
  site_title: string | null;
  site_description: string | null;
  default_og_image: string | null;
  updated_at: string;
}

const defaultSettings: SEOSettings = {
  id: "",
  site_title: "My Website",
  site_description: "Welcome to my website",
  default_og_image: null,
  updated_at: new Date().toISOString(),
};

export function useSEOSettings() {
  const [settings, setSettings] = useState<SEOSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("seo_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setSettings(data as SEOSettings);
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  return { settings, loading };
}
