import { useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Generate or retrieve session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem("analytics_session");
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("analytics_session", sessionId);
  }
  return sessionId;
};

// Get page entry time for a path
const pageEntryTimes: Record<string, number> = {};

interface TrackEventOptions {
  eventType: string;
  eventData?: Record<string, any>;
  pagePath?: string;
}

export const useAnalytics = () => {
  const location = useLocation();
  const scrollDepthRef = useRef<Set<number>>(new Set());
  const pageStartTimeRef = useRef<number>(Date.now());
  const lastPathRef = useRef<string>("");
  const isAdminRoute = location.pathname.startsWith("/admin");

  const trackEvent = useCallback(async ({ eventType, eventData = {}, pagePath }: TrackEventOptions) => {
    if (isAdminRoute) return;
    
    try {
      await supabase.from("analytics_events").insert({
        event_type: eventType,
        event_data: eventData,
        page_path: pagePath || location.pathname,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        session_id: getSessionId(),
      });
    } catch (error) {
      console.error("Analytics tracking error:", error);
    }
  }, [location.pathname, isAdminRoute]);

  // Track page views
  useEffect(() => {
    if (isAdminRoute) return;
    if (lastPathRef.current === location.pathname) return;
    
    // Track time on previous page
    if (lastPathRef.current && pageEntryTimes[lastPathRef.current]) {
      const timeOnPage = Math.round((Date.now() - pageEntryTimes[lastPathRef.current]) / 1000);
      trackEvent({
        eventType: "page_exit",
        eventData: { 
          time_on_page: timeOnPage,
          exit_to: location.pathname
        },
        pagePath: lastPathRef.current
      });
    }
    
    // Track new page view
    trackEvent({
      eventType: "page_view",
      eventData: { 
        title: document.title,
        is_blog: location.pathname.startsWith("/blog/"),
        is_experience: location.pathname === "/experience"
      }
    });
    
    pageEntryTimes[location.pathname] = Date.now();
    pageStartTimeRef.current = Date.now();
    lastPathRef.current = location.pathname;
    scrollDepthRef.current = new Set();
  }, [location.pathname, isAdminRoute, trackEvent]);

  // Track scroll depth
  useEffect(() => {
    if (isAdminRoute) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      const buckets = [25, 50, 75, 100];
      for (const bucket of buckets) {
        if (scrollPercent >= bucket && !scrollDepthRef.current.has(bucket)) {
          scrollDepthRef.current.add(bucket);
          trackEvent({
            eventType: "scroll_depth",
            eventData: { depth: bucket }
          });
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname, isAdminRoute, trackEvent]);

  // Track page exit on unmount/beforeunload
  useEffect(() => {
    if (isAdminRoute) return;

    const handleBeforeUnload = () => {
      const timeOnPage = Math.round((Date.now() - pageStartTimeRef.current) / 1000);
      // Use sendBeacon for reliable tracking on page exit
      const data = JSON.stringify({
        event_type: "page_exit",
        event_data: { time_on_page: timeOnPage, is_final: true },
        page_path: location.pathname,
        session_id: getSessionId(),
      });
      navigator.sendBeacon?.(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/analytics_events`,
        new Blob([data], { type: "application/json" })
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [location.pathname, isAdminRoute]);

  // Helper functions for specific tracking
  const trackSocialClick = useCallback((platform: string, url: string) => {
    trackEvent({
      eventType: "social_click",
      eventData: { platform, url }
    });
  }, [trackEvent]);

  const trackCtaClick = useCallback((ctaName: string, destination: string) => {
    trackEvent({
      eventType: "cta_click",
      eventData: { cta_name: ctaName, destination }
    });
  }, [trackEvent]);

  const trackBlogView = useCallback((slug: string, title: string) => {
    trackEvent({
      eventType: "blog_view",
      eventData: { slug, title }
    });
  }, [trackEvent]);

  const track404 = useCallback((attemptedPath: string) => {
    trackEvent({
      eventType: "404_hit",
      eventData: { attempted_path: attemptedPath },
      pagePath: attemptedPath
    });
  }, [trackEvent]);

  const trackSearch = useCallback((query: string, resultsCount: number) => {
    trackEvent({
      eventType: "search",
      eventData: { query, results_count: resultsCount }
    });
  }, [trackEvent]);

  const trackBrokenLink = useCallback((linkUrl: string, linkText: string) => {
    trackEvent({
      eventType: "broken_link",
      eventData: { link_url: linkUrl, link_text: linkText }
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackSocialClick,
    trackCtaClick,
    trackBlogView,
    track404,
    trackSearch,
    trackBrokenLink
  };
};