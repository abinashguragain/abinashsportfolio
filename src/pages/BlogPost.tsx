import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Share2, Loader2, Twitter, Facebook, Linkedin, Link2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  read_time: number | null;
  published_at: string | null;
  featured_image: string | null;
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
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setPost(data);

      // Fetch related posts
      const { data: related } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, read_time, published_at, featured_image")
        .eq("status", "published")
        .neq("id", data.id)
        .order("published_at", { ascending: false })
        .limit(2);

      if (related) setRelatedPosts(related);
      setLoading(false);
    };

    fetchPost();
  }, [slug]);

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

  return (
    <Layout>
      {/* Header */}
      <section className="section-padding bg-gradient-hero">
        <div className="container-narrow">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Link>

          <div className="flex flex-wrap items-center gap-4 mb-4">
            {post.published_at && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar size={14} />
                {new Date(post.published_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock size={14} />
              {post.read_time || 5} min read
            </span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">
            {post.title}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl">
            {post.excerpt}
          </p>
        </div>
      </section>

      {/* Featured Image */}
      {post.featured_image && (
        <section className="bg-background">
          <div className="container-narrow py-8">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-auto rounded-xl border border-border"
            />
          </div>
        </section>
      )}

      {/* Content */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <article className="prose-custom">
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
              Continue Reading
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}`} className="group">
                  <article className="p-6 bg-background rounded-xl border border-border card-hover">
                    <h3 className="font-display text-xl text-foreground mt-2 mb-2 group-hover:text-primary transition-colors">
                      {relatedPost.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
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
