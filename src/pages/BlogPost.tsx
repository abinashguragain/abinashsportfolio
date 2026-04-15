import { useParams, Link, Navigate } from "react-router-dom";
import { Clock, Loader2, Twitter, Facebook, Linkedin, Link2, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAnalytics } from "@/hooks/use-analytics";
import { SEOHead } from "@/components/SEOHead";

interface Author {
  id: string;
  name: string;
  bio: string | null;
  bio_link: string | null;
  avatar_url: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface PostCategory {
  category_id: string;
  is_primary: boolean;
  blog_categories: Category;
}

interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  read_time: number | null;
  published_at: string | null;
  updated_at: string;
  featured_image: string | null;
  author_id: string | null;
  authors: Author | null;
  blog_post_categories: PostCategory[];
  custom_font: string | null;
  meta_title: string | null;
  meta_description: string | null;
  featured_image_alt: string | null;
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  read_time: number | null;
  published_at: string | null;
  featured_image: string | null;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const { trackBlogView } = useAnalytics();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(`
          *, 
          authors(*),
          blog_post_categories(category_id, is_primary, blog_categories(id, name, slug))
        `)
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const postData = data as unknown as BlogPostData;
      setPost(postData);
      
      // Track blog view
      trackBlogView(postData.slug, postData.title);

      // Fetch related posts
      const relatedQuery = supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, read_time, published_at, featured_image")
        .eq("status", "published")
        .neq("id", data.id)
        .order("published_at", { ascending: false })
        .limit(3);

      const { data: related } = await relatedQuery;

      if (related) setRelatedPosts(related);
      setLoading(false);
    };

    fetchPost();
  }, [slug, trackBlogView]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (notFound || !post) {
    return <Navigate to="/blog" replace />;
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = encodeURIComponent(post.title);
  const shareUrlEncoded = encodeURIComponent(shareUrl);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "The article link has been copied to your clipboard.",
      });
    } catch (error) {
      console.error("Error copying link:", error);
    }
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrlEncoded}`, '_blank');
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrlEncoded}`, '_blank');
  };

  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrlEncoded}`, '_blank');
  };

  // Check if content is HTML (from rich text editor) or plain text
  const isHtmlContent = (content: string) => {
    return /<[a-z][\s\S]*>/i.test(content);
  };

  // Generate font style for custom font
  const customFontStyle = post.custom_font ? {
    fontFamily: `"${post.custom_font}", sans-serif`
  } : {};

  return (
    <Layout>
      {/* SEO Meta Tags */}
      <SEOHead
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt || ""}
        image={post.featured_image || undefined}
        imageAlt={post.featured_image_alt || post.title}
        type="article"
        article={{
          publishedTime: post.published_at || undefined,
          modifiedTime: post.updated_at,
          author: post.authors?.name,
        }}
      />
      
      {/* JSON-LD Structured Data for Articles */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt || "",
            image: post.featured_image || undefined,
            datePublished: post.published_at || undefined,
            dateModified: post.updated_at,
            author: post.authors ? {
              "@type": "Person",
              name: post.authors.name,
              url: post.authors.bio_link || undefined,
            } : undefined,
            publisher: {
              "@type": "Organization",
              name: document.title.split(" | ").pop() || "Website",
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": window.location.href,
            },
          }),
        }}
      />
      
      {/* Load custom font if specified */}
      {post.custom_font && (
        <link
          href={`https://fonts.googleapis.com/css2?family=${post.custom_font.replace(/ /g, '+')}:wght@400;500;600;700&display=swap`}
          rel="stylesheet"
        />
      )}
      
      {/* Header */}
      <section className="py-8 md:py-12 bg-gradient-hero">
        <div className="container-narrow">
          {/* Categories */}
          {post.blog_post_categories && post.blog_post_categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.blog_post_categories
                .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
                .map((pc) => (
                  <span
                    key={pc.category_id}
                    className={`text-xs font-medium px-3 py-1 rounded-full ${
                      pc.is_primary
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {pc.blog_categories?.name}
                  </span>
                ))}
            </div>
          )}

          <h1 className="font-display text-2xl md:text-3xl lg:text-4xl text-foreground mb-2">
            {post.title}
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mb-4">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {post.authors && (
              <span>
                <span className="font-medium text-foreground">Author:</span>{" "}
                {post.authors.bio_link ? (
                  <a
                    href={post.authors.bio_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors underline"
                  >
                    {post.authors.name}
                  </a>
                ) : (
                  post.authors.name
                )}
              </span>
            )}
            {post.published_at && (
              <span>
                <span className="font-medium text-foreground">Published:</span>{" "}
                <time dateTime={post.published_at}>
                  {new Date(post.published_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </span>
            )}
            {post.updated_at && new Date(post.updated_at).getTime() > new Date(post.published_at || 0).getTime() + 60000 && (
              <span>
                <span className="font-medium text-foreground">Updated:</span>{" "}
                <time dateTime={post.updated_at}>
                  {new Date(post.updated_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {post.read_time || 5} min read
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          {/* Featured Image */}
          {post.featured_image && (
            <img
              src={post.featured_image}
              alt={post.featured_image_alt || post.title}
              title={post.featured_image_alt || post.title}
              className="w-full h-auto rounded-xl border border-border mb-8"
            />
          )}
          <article className="prose-custom" style={customFontStyle}>
            {post.content && (
              isHtmlContent(post.content) ? (
                <div 
                  className="blog-content"
                  dangerouslySetInnerHTML={{ __html: post.content }} 
                />
              ) : (
                <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  {post.content}
                </div>
              )
            )}
          </article>

          <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-muted-foreground">Enjoyed this article? Share it!</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={shareToTwitter} title="Share on X (Twitter)">
                <Twitter size={16} />
              </Button>
              <Button variant="outline" size="icon" onClick={shareToFacebook} title="Share on Facebook">
                <Facebook size={16} />
              </Button>
              <Button variant="outline" size="icon" onClick={shareToLinkedIn} title="Share on LinkedIn">
                <Linkedin size={16} />
              </Button>
              <Button variant="outline" size="icon" onClick={handleCopyLink} title="Copy link">
                <Link2 size={16} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="section-padding bg-card">
          <div className="container-wide">
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}`} className="group">
                  <article className="h-full bg-background rounded-xl border border-border card-hover overflow-hidden flex flex-col">
                    {relatedPost.featured_image && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={relatedPost.featured_image}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-display text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 flex-1">
                        {relatedPost.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                        {relatedPost.published_at && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(relatedPost.published_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {relatedPost.read_time || 5} min
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default BlogPost;