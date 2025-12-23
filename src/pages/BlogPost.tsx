import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Share2, Loader2 } from "lucide-react";
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

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt || "",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "The article link has been copied to your clipboard.",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // Simple markdown-to-HTML conversion
  const renderContent = (content: string) => {
    return content
      .split("\n")
      .map((line, index) => {
        if (line.startsWith("### ")) {
          return <h3 key={index} className="font-display text-xl text-foreground mt-8 mb-4">{line.replace("### ", "")}</h3>;
        }
        if (line.startsWith("## ")) {
          return <h2 key={index} className="font-display text-2xl text-foreground mt-10 mb-4">{line.replace("## ", "")}</h2>;
        }
        if (line.startsWith("# ")) {
          return <h1 key={index} className="font-display text-3xl text-foreground mt-10 mb-4">{line.replace("# ", "")}</h1>;
        }
        if (line.startsWith("> ")) {
          return <blockquote key={index} className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">{line.replace("> ", "")}</blockquote>;
        }
        if (line.startsWith("- ")) {
          return <li key={index} className="mb-2 text-muted-foreground">{line.replace("- ", "")}</li>;
        }
        if (line.trim()) {
          const parts = line.split(/\*\*(.+?)\*\*/g);
          return (
            <p key={index} className="text-muted-foreground leading-relaxed mb-4">
              {parts.map((part, i) =>
                i % 2 === 1 ? <strong key={i} className="text-foreground">{part}</strong> : part
              )}
            </p>
          );
        }
        return null;
      })
      .filter(Boolean);
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
            {post.content && renderContent(post.content)}
          </article>

          <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
            <p className="text-muted-foreground">Enjoyed this article? Share it!</p>
            <Button variant="outline" onClick={handleShare}>
              <Share2 size={16} />
              Share
            </Button>
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
