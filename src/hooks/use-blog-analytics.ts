import { useCallback, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BlogPostAnalytics {
  postId: string;
  totalViews: number;
  uniqueViews: number;
  avgTimeOnPage: number;
  scrollDepthCompletion: number;
  ctaClicks: number;
  exitRate: number;
}

export interface CachedAnalytics {
  data: Record<string, BlogPostAnalytics>;
  timestamp: number;
  dateRange: string;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let analyticsCache: CachedAnalytics | null = null;

export const useBlogAnalytics = () => {
  const [loading, setLoading] = useState(false);

  const fetchBlogAnalytics = useCallback(async (
    dateRange: "7d" | "30d" | "90d" = "30d"
  ): Promise<Record<string, BlogPostAnalytics>> => {
    // Check cache
    if (
      analyticsCache &&
      analyticsCache.dateRange === dateRange &&
      Date.now() - analyticsCache.timestamp < CACHE_DURATION
    ) {
      return analyticsCache.data;
    }

    setLoading(true);

    try {
      // Calculate date filter
      const daysAgo = new Date();
      const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
      daysAgo.setDate(daysAgo.getDate() - days);

      // Fetch all relevant analytics events
      const { data: events, error } = await supabase
        .from("analytics_events")
        .select("*")
        .gte("created_at", daysAgo.toISOString())
        .or("event_type.eq.blog_view,event_type.eq.page_view,event_type.eq.page_exit,event_type.eq.scroll_depth,event_type.eq.cta_click");

      if (error || !events) {
        setLoading(false);
        return {};
      }

      // Process events by blog post
      const analyticsMap: Record<string, BlogPostAnalytics> = {};

      // Get blog views and page views for blog posts
      const blogViewEvents = events.filter(e => 
        e.event_type === "blog_view" || 
        (e.event_type === "page_view" && e.page_path?.startsWith("/blog/"))
      );

      const exitEvents = events.filter(e => e.event_type === "page_exit");
      const scrollEvents = events.filter(e => e.event_type === "scroll_depth");
      const ctaEvents = events.filter(e => e.event_type === "cta_click");

      // Extract unique blog slugs
      const blogSlugs = new Set<string>();
      blogViewEvents.forEach(e => {
        const slug = (e.event_data as any)?.slug || e.page_path?.replace("/blog/", "") || "";
        if (slug) blogSlugs.add(slug);
      });

      // Process each blog post
      blogSlugs.forEach(slug => {
        const postPath = `/blog/${slug}`;
        
        // Views
        const postViews = blogViewEvents.filter(e => 
          (e.event_data as any)?.slug === slug || e.page_path === postPath
        );
        const totalViews = postViews.length;
        
        // Unique views (by session)
        const uniqueSessions = new Set(postViews.map(e => e.session_id)).size;
        
        // Time on page
        const postExits = exitEvents.filter(e => e.page_path === postPath);
        const times = postExits
          .map(e => (e.event_data as any)?.time_on_page)
          .filter(t => typeof t === "number" && t > 0 && t < 3600);
        const avgTimeOnPage = times.length > 0
          ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
          : 0;

        // Scroll depth completion (% who reached 100%)
        const postScrolls = scrollEvents.filter(e => e.page_path === postPath);
        const scroll100 = postScrolls.filter(e => (e.event_data as any)?.depth === 100).length;
        const scrollDepthCompletion = totalViews > 0 
          ? Math.round((scroll100 / totalViews) * 100) 
          : 0;

        // CTA clicks from this post
        const postCtaClicks = ctaEvents.filter(e => e.page_path === postPath).length;

        // Exit rate (% of final exits from this post)
        const finalExits = postExits.filter(e => (e.event_data as any)?.is_final).length;
        const exitRate = totalViews > 0 
          ? Math.round((finalExits / totalViews) * 100) 
          : 0;

        analyticsMap[slug] = {
          postId: slug,
          totalViews,
          uniqueViews: uniqueSessions,
          avgTimeOnPage,
          scrollDepthCompletion,
          ctaClicks: postCtaClicks,
          exitRate,
        };
      });

      // Cache results
      analyticsCache = {
        data: analyticsMap,
        timestamp: Date.now(),
        dateRange,
      };

      setLoading(false);
      return analyticsMap;
    } catch (error) {
      console.error("Error fetching blog analytics:", error);
      setLoading(false);
      return {};
    }
  }, []);

  const clearCache = useCallback(() => {
    analyticsCache = null;
  }, []);

  return {
    fetchBlogAnalytics,
    clearCache,
    loading,
  };
};

export default useBlogAnalytics;
