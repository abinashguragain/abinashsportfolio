import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Integration {
  key: string;
  value: string | null;
  is_active: boolean;
}

// Extract GA measurement ID from script
const extractGAMeasurementId = (script: string): string | null => {
  const match = script.match(/(?:G-[A-Z0-9]+|UA-\d+-\d+|GT-[A-Z0-9]+)/);
  return match ? match[0] : null;
};

// Extract content from Search Console meta tag
const extractVerificationCode = (metaTag: string): string | null => {
  const match = metaTag.match(/content=["']([^"']+)["']/);
  return match ? match[1] : null;
};

export const ThirdPartyScripts = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loaded, setLoaded] = useState(false);
  const location = useLocation();
  const injectedRef = useRef(false);
  const previousPathRef = useRef<string>("");

  // Don't run on admin routes
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdminRoute) return;
    
    const fetchIntegrations = async () => {
      const { data } = await supabase
        .from("third_party_integrations")
        .select("key, value, is_active")
        .eq("is_active", true);
      
      if (data) {
        setIntegrations(data);
      }
      setLoaded(true);
    };

    fetchIntegrations();
  }, [isAdminRoute]);

  useEffect(() => {
    if (!loaded || isAdminRoute || injectedRef.current) return;

    const gaIntegration = integrations.find(i => i.key === "google_analytics");
    const gscIntegration = integrations.find(i => i.key === "google_search_console");

    // Inject Search Console meta tag
    if (gscIntegration?.value) {
      const existingMeta = document.querySelector('meta[name="google-site-verification"]');
      if (!existingMeta) {
        const verificationCode = extractVerificationCode(gscIntegration.value);
        if (verificationCode) {
          const meta = document.createElement("meta");
          meta.name = "google-site-verification";
          meta.content = verificationCode;
          document.head.appendChild(meta);
        }
      }
    }

    // Inject Google Analytics
    if (gaIntegration?.value) {
      const measurementId = extractGAMeasurementId(gaIntegration.value);
      
      if (measurementId) {
        const existingScript = document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`);
        
        if (!existingScript) {
          // Add the gtag.js script
          const script = document.createElement("script");
          script.async = true;
          script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
          document.head.appendChild(script);

          // Add the inline config script
          const inlineScript = document.createElement("script");
          inlineScript.textContent = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}');
          `;
          document.head.appendChild(inlineScript);
        }
      }
    }

    injectedRef.current = true;
  }, [integrations, loaded, isAdminRoute]);

  // Track page views on route change (SPA navigation)
  useEffect(() => {
    if (isAdminRoute || !loaded) return;
    
    const gaIntegration = integrations.find(i => i.key === "google_analytics");
    if (!gaIntegration?.value) return;
    
    const measurementId = extractGAMeasurementId(gaIntegration.value);
    if (!measurementId) return;

    // Only send page view if path actually changed
    if (previousPathRef.current !== location.pathname) {
      previousPathRef.current = location.pathname;
      
      // Send page view to GA
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("config", measurementId, {
          page_path: location.pathname,
        });
      }
    }
  }, [location.pathname, integrations, loaded, isAdminRoute]);

  // This component doesn't render anything visible
  return null;
};

export default ThirdPartyScripts;