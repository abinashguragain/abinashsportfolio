// SEO prerender: serves the SPA index.html with route-specific <head> meta
// and JSON-LD injected so crawlers/social bots see correct previews.
// Triggered by vercel.json "has" header rule on bot user-agents.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ORIGIN = "https://abinashg.com.np";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

interface Meta {
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  type: "website" | "article";
  url: string;
  jsonLd?: unknown;
  article?: { publishedTime?: string; modifiedTime?: string; author?: string };
}

async function fetchShell(): Promise<string> {
  const res = await fetch(ORIGIN + "/", {
    headers: { "user-agent": "PrerenderFetcher/1.0 (+seo)" },
  });
  return await res.text();
}

async function getSiteSettings() {
  const { data } = await supabase.from("seo_settings").select("*").limit(1).maybeSingle();
  return {
    site_title: data?.site_title || "Abinash Guragain",
    site_description: data?.site_description || "",
    default_og_image: data?.default_og_image || "",
  };
}

async function buildMeta(path: string): Promise<Meta> {
  const settings = await getSiteSettings();
  const url = ORIGIN + path;
  const base: Meta = {
    title: settings.site_title,
    description: settings.site_description,
    image: settings.default_og_image,
    type: "website",
    url,
  };

  // Blog post route
  const blogMatch = path.match(/^\/blog\/([^\/?#]+)/);
  if (blogMatch) {
    const slug = decodeURIComponent(blogMatch[1]);
    const { data: post } = await supabase
      .from("blog_posts")
      .select(
        "title, slug, excerpt, featured_image, featured_image_alt, meta_title, meta_description, published_at, updated_at, author_id, authors(name, bio_link)",
      )
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (post) {
      const author = (post as any).authors;
      const title = post.meta_title || post.title;
      const description = post.meta_description || post.excerpt || settings.site_description;
      const image = post.featured_image || settings.default_og_image;
      return {
        title: `${title} | ${settings.site_title}`,
        description,
        image,
        imageAlt: post.featured_image_alt || post.title,
        type: "article",
        url,
        article: {
          publishedTime: post.published_at || undefined,
          modifiedTime: post.updated_at,
          author: author?.name,
        },
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt || "",
          image: image || undefined,
          datePublished: post.published_at || undefined,
          dateModified: post.updated_at,
          author: author
            ? { "@type": "Person", name: author.name, url: author.bio_link || undefined }
            : undefined,
          publisher: { "@type": "Organization", name: settings.site_title },
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
        },
      };
    }
  }

  // Static routes
  const routeTitles: Record<string, { t: string; d?: string }> = {
    "/": { t: settings.site_title },
    "/blog": { t: `Blog | ${settings.site_title}`, d: "Articles, thoughts, and notes." },
    "/experience": { t: `Experience | ${settings.site_title}` },
    "/contact": { t: `Contact | ${settings.site_title}` },
    "/testimonials": { t: `Testimonials | ${settings.site_title}` },
  };
  const r = routeTitles[path];
  if (r) {
    base.title = r.t;
    if (r.d) base.description = r.d;
  } else if (path !== "/") {
    base.title = `${settings.site_title}`;
  }

  // Site-level JSON-LD on home
  if (path === "/") {
    base.jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: settings.site_title,
      url: ORIGIN,
      description: settings.site_description,
    };
  }
  return base;
}

function injectMeta(html: string, meta: Meta): string {
  // Strip existing meta we'll replace
  const tagsToStrip = [
    /<title>[\s\S]*?<\/title>/i,
    /<meta\s+name=["']description["'][^>]*>/gi,
    /<link\s+rel=["']canonical["'][^>]*>/gi,
    /<meta\s+property=["']og:[^"']+["'][^>]*>/gi,
    /<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi,
    /<meta\s+property=["']article:[^"']+["'][^>]*>/gi,
    /<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,
  ];
  for (const re of tagsToStrip) html = html.replace(re, "");

  const t = esc(meta.title);
  const d = esc(meta.description || "");
  const img = meta.image ? esc(meta.image) : "";
  const imgAlt = meta.imageAlt ? esc(meta.imageAlt) : "";
  const u = esc(meta.url);

  const parts: string[] = [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}">`,
    `<link rel="canonical" href="${u}">`,
    `<meta property="og:title" content="${t}">`,
    `<meta property="og:description" content="${d}">`,
    `<meta property="og:type" content="${meta.type}">`,
    `<meta property="og:url" content="${u}">`,
  ];
  if (img) {
    parts.push(`<meta property="og:image" content="${img}">`);
    if (imgAlt) parts.push(`<meta property="og:image:alt" content="${imgAlt}">`);
  }
  parts.push(
    `<meta name="twitter:card" content="${img ? "summary_large_image" : "summary"}">`,
    `<meta name="twitter:title" content="${t}">`,
    `<meta name="twitter:description" content="${d}">`,
  );
  if (img) {
    parts.push(`<meta name="twitter:image" content="${img}">`);
    if (imgAlt) parts.push(`<meta name="twitter:image:alt" content="${imgAlt}">`);
  }
  if (meta.article) {
    if (meta.article.publishedTime)
      parts.push(`<meta property="article:published_time" content="${esc(meta.article.publishedTime)}">`);
    if (meta.article.modifiedTime)
      parts.push(`<meta property="article:modified_time" content="${esc(meta.article.modifiedTime)}">`);
    if (meta.article.author)
      parts.push(`<meta property="article:author" content="${esc(meta.article.author)}">`);
  }
  if (meta.jsonLd) {
    parts.push(
      `<script type="application/ld+json">${JSON.stringify(meta.jsonLd).replace(/</g, "\\u003c")}</script>`,
    );
  }

  return html.replace("</head>", parts.join("\n") + "\n</head>");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    let path = url.searchParams.get("path") || "/";
    if (!path.startsWith("/")) path = "/" + path;
    // Sanitize
    path = path.split("?")[0].split("#")[0];

    const [shell, meta] = await Promise.all([fetchShell(), buildMeta(path)]);
    const html = injectMeta(shell, meta);

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
        "X-Prerendered": "1",
      },
    });
  } catch (e) {
    return new Response(`Prerender error: ${(e as Error).message}`, {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
});
