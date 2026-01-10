import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, MousePointerClick, Share2, FileText, AlertTriangle, TrendingUp, Clock, ArrowUpRight } from "lucide-react";

interface AnalyticsSummary {
  totalPageViews: number;
  uniqueSessions: number;
  blogViews: number;
  ctaClicks: number;
  socialClicks: Record<string, number>;
  topPages: { path: string; views: number }[];
  scrollDepth: Record<number, number>;
  avgTimeOnPage: number;
  exitRates: { path: string; rate: number; exits: number }[];
  zeroViewPages: string[];
  notFoundHits: number;
  brokenLinks: { url: string; count: number }[];
  searchQueries: { query: string; count: number }[];
}

const POPULAR_PAGES = ["/", "/blog", "/experience", "/contact"];

export const AnalyticsWidgets = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "all">("7d");

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    
    let query = supabase.from("analytics_events").select("*");
    
    if (dateRange === "7d") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      query = query.gte("created_at", sevenDaysAgo.toISOString());
    } else if (dateRange === "30d") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query = query.gte("created_at", thirtyDaysAgo.toISOString());
    }

    const { data: events, error } = await query;

    if (error || !events) {
      setLoading(false);
      return;
    }

    // Process events
    const pageViews = events.filter(e => e.event_type === "page_view");
    const blogViews = events.filter(e => e.event_type === "blog_view");
    const ctaClicks = events.filter(e => e.event_type === "cta_click");
    const socialClicks = events.filter(e => e.event_type === "social_click");
    const scrollEvents = events.filter(e => e.event_type === "scroll_depth");
    const exitEvents = events.filter(e => e.event_type === "page_exit");
    const notFoundEvents = events.filter(e => e.event_type === "404_hit");
    const brokenLinkEvents = events.filter(e => e.event_type === "broken_link");
    const searchEvents = events.filter(e => e.event_type === "search");

    // Unique sessions
    const uniqueSessions = new Set(events.map(e => e.session_id)).size;

    // Social clicks by platform
    const socialByPlatform: Record<string, number> = {};
    socialClicks.forEach(e => {
      const platform = (e.event_data as any)?.platform || "unknown";
      socialByPlatform[platform] = (socialByPlatform[platform] || 0) + 1;
    });

    // Top pages
    const pageViewCounts: Record<string, number> = {};
    pageViews.forEach(e => {
      const path = e.page_path || "/";
      pageViewCounts[path] = (pageViewCounts[path] || 0) + 1;
    });
    const topPages = Object.entries(pageViewCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([path, views]) => ({ path, views }));

    // Scroll depth distribution
    const scrollDepthCounts: Record<number, number> = { 25: 0, 50: 0, 75: 0, 100: 0 };
    scrollEvents.forEach(e => {
      const depth = (e.event_data as any)?.depth;
      if (depth && scrollDepthCounts[depth] !== undefined) {
        scrollDepthCounts[depth]++;
      }
    });

    // Average time on page
    const timeOnPageValues = exitEvents
      .map(e => (e.event_data as any)?.time_on_page)
      .filter(t => typeof t === "number" && t > 0 && t < 3600); // Filter outliers
    const avgTimeOnPage = timeOnPageValues.length > 0
      ? Math.round(timeOnPageValues.reduce((a, b) => a + b, 0) / timeOnPageValues.length)
      : 0;

    // Exit rates by page
    const exitCounts: Record<string, number> = {};
    exitEvents.forEach(e => {
      if ((e.event_data as any)?.is_final) {
        const path = e.page_path || "/";
        exitCounts[path] = (exitCounts[path] || 0) + 1;
      }
    });
    const exitRates = Object.entries(exitCounts)
      .map(([path, exits]) => ({
        path,
        exits,
        rate: pageViewCounts[path] ? Math.round((exits / pageViewCounts[path]) * 100) : 0
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);

    // Zero view pages (from known pages)
    const zeroViewPages = POPULAR_PAGES.filter(p => !pageViewCounts[p]);

    // 404 hits count
    const notFoundHits = notFoundEvents.length;

    // Broken links
    const brokenLinkCounts: Record<string, number> = {};
    brokenLinkEvents.forEach(e => {
      const url = (e.event_data as any)?.link_url || "unknown";
      brokenLinkCounts[url] = (brokenLinkCounts[url] || 0) + 1;
    });
    const brokenLinks = Object.entries(brokenLinkCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([url, count]) => ({ url, count }));

    // Search queries
    const searchCounts: Record<string, number> = {};
    searchEvents.forEach(e => {
      const query = (e.event_data as any)?.query || "";
      if (query) {
        searchCounts[query] = (searchCounts[query] || 0) + 1;
      }
    });
    const searchQueries = Object.entries(searchCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));

    setAnalytics({
      totalPageViews: pageViews.length,
      uniqueSessions,
      blogViews: blogViews.length,
      ctaClicks: ctaClicks.length,
      socialClicks: socialByPlatform,
      topPages,
      scrollDepth: scrollDepthCounts,
      avgTimeOnPage,
      exitRates,
      zeroViewPages,
      notFoundHits,
      brokenLinks,
      searchQueries,
    });

    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No analytics data available yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex gap-2">
        {(["7d", "30d", "all"] as const).map((range) => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              dateRange === range
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {range === "7d" ? "Last 7 days" : range === "30d" ? "Last 30 days" : "All time"}
          </button>
        ))}
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.totalPageViews}</p>
                <p className="text-sm text-muted-foreground">Page Views</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.uniqueSessions}</p>
                <p className="text-sm text-muted-foreground">Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <FileText className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.blogViews}</p>
                <p className="text-sm text-muted-foreground">Blog Views</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <MousePointerClick className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.ctaClicks}</p>
                <p className="text-sm text-muted-foreground">CTA Clicks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Social Clicks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Social Profile Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(analytics.socialClicks).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(analytics.socialClicks).map(([platform, count]) => (
                  <div key={platform} className="flex items-center justify-between">
                    <span className="capitalize">{platform}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No social clicks recorded yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Most Visited Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topPages.slice(0, 5).map(({ path, views }) => (
                <div key={path} className="flex items-center justify-between">
                  <span className="text-sm truncate max-w-[200px]">{path}</span>
                  <span className="font-semibold">{views}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Scroll Depth */}
        <Card>
          <CardHeader>
            <CardTitle>Scroll Depth</CardTitle>
            <CardDescription>How far users scroll on pages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[25, 50, 75, 100].map((depth) => (
                <div key={depth} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{depth}%</span>
                    <span>{analytics.scrollDepth[depth]} users</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{
                        width: `${
                          analytics.totalPageViews > 0
                            ? (analytics.scrollDepth[depth] / analytics.totalPageViews) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time on Page */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Engagement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-3xl font-bold">{formatTime(analytics.avgTimeOnPage)}</p>
              <p className="text-sm text-muted-foreground">Avg. Time on Page</p>
            </div>
            
            {analytics.exitRates.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">High Exit Rate Pages</p>
                <div className="space-y-2">
                  {analytics.exitRates.slice(0, 3).map(({ path, rate }) => (
                    <div key={path} className="flex items-center justify-between text-sm">
                      <span className="truncate max-w-[150px]">{path}</span>
                      <span className="text-destructive">{rate}% exit</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Issues & Errors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>404 Errors</span>
              <span className={`font-semibold ${analytics.notFoundHits > 0 ? "text-destructive" : ""}`}>
                {analytics.notFoundHits}
              </span>
            </div>
            
            {analytics.brokenLinks.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Broken Links</p>
                <div className="space-y-1">
                  {analytics.brokenLinks.map(({ url, count }) => (
                    <div key={url} className="flex items-center justify-between text-sm">
                      <span className="truncate max-w-[180px] text-destructive">{url}</span>
                      <span>{count}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analytics.zeroViewPages.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Zero View Pages</p>
                <div className="space-y-1">
                  {analytics.zeroViewPages.map((path) => (
                    <p key={path} className="text-sm text-muted-foreground">{path}</p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Queries */}
        <Card>
          <CardHeader>
            <CardTitle>Search Usage</CardTitle>
            <CardDescription>What users are searching for</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.searchQueries.length > 0 ? (
              <div className="space-y-2">
                {analytics.searchQueries.map(({ query, count }) => (
                  <div key={query} className="flex items-center justify-between text-sm">
                    <span className="truncate max-w-[180px]">"{query}"</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No search queries recorded yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsWidgets;