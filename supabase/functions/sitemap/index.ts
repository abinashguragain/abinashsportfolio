import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the site URL from the request or use a default
    const url = new URL(req.url);
    const siteUrl = url.searchParams.get("baseUrl") || "https://abinashg.com.np";

    // Fetch all published blog posts with their updated_at timestamps
    const { data: posts, error: postsError } = await supabase
      .from("blog_posts")
      .select("slug, updated_at, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (postsError) {
      console.error("Error fetching posts:", postsError);
    }

    // Fetch latest update times for static content sections
    const [heroRes, ctaRes, servicesRes, experiencesRes, testimonialsRes] = await Promise.all([
      supabase.from("hero_content").select("updated_at").eq("is_active", true).limit(1).maybeSingle(),
      supabase.from("cta_content").select("updated_at").eq("is_active", true).limit(1).maybeSingle(),
      supabase.from("services").select("updated_at").eq("is_active", true).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("experiences").select("updated_at").eq("is_active", true).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("testimonials").select("updated_at").eq("is_active", true).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    ]);

    // Helper: if a date is older than 10 days, use today's date instead
    const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const freshDate = (dateStr: string | null | undefined): string => {
      if (!dateStr) return new Date().toISOString().split("T")[0];
      const ts = new Date(dateStr).getTime();
      if (now - ts > TEN_DAYS_MS) {
        return new Date().toISOString().split("T")[0];
      }
      return new Date(ts).toISOString().split("T")[0];
    };

    // Calculate lastmod for homepage (most recent of all homepage content)
    const homepageUpdates = [
      heroRes.data?.updated_at,
      ctaRes.data?.updated_at,
      servicesRes.data?.updated_at,
      testimonialsRes.data?.updated_at,
    ].filter(Boolean).map(d => new Date(d!).getTime());
    
    const rawHomepageLastmod = homepageUpdates.length > 0 
      ? new Date(Math.max(...homepageUpdates)).toISOString()
      : null;
    const homepageLastmod = freshDate(rawHomepageLastmod);

    // Calculate lastmod for experience page
    const experienceLastmod = freshDate(experiencesRes.data?.updated_at);

    // Calculate lastmod for blog listing (most recent post update)
    const rawBlogListingLastmod = posts && posts.length > 0
      ? new Date(Math.max(...posts.map(p => new Date(p.updated_at).getTime()))).toISOString()
      : null;
    const blogListingLastmod = freshDate(rawBlogListingLastmod);

    // Contact page: always refresh every 10 days
    const contactLastmod = new Date().toISOString().split("T")[0];

    // Build sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Pages -->
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${homepageLastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/experience</loc>
    <lastmod>${experienceLastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${siteUrl}/blog</loc>
    <lastmod>${blogListingLastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${siteUrl}/contact</loc>
    <lastmod>${contactLastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;

    // Add blog post URLs
    if (posts && posts.length > 0) {
      sitemap += `
  <!-- Blog Posts -->`;
      for (const post of posts) {
        const lastmod = new Date(post.updated_at).toISOString().split("T")[0];
        sitemap += `
  <url>
    <loc>${siteUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }
    }

    sitemap += `
</urlset>`;

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate sitemap" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
