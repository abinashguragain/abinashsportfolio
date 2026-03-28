import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const DynamicFavicon = () => {
  useEffect(() => {
    const setFavicon = async () => {
      const { data } = await supabase
        .from("navigation_settings")
        .select("favicon_url")
        .single();

      if (data?.favicon_url) {
        // Remove any existing favicon links
        document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').forEach(el => el.remove());

        const link = document.createElement("link");
        link.rel = "icon";
        link.href = data.favicon_url;
        link.type = data.favicon_url.endsWith(".png") ? "image/png" : "image/x-icon";
        document.head.appendChild(link);
      }
    };

    setFavicon();
  }, []);

  return null;
};
