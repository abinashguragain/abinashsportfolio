import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { getPostBySlug, getLatestPosts } from "@/data/blogs";
import { useToast } from "@/hooks/use-toast";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const post = slug ? getPostBySlug(slug) : null;
  
  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const relatedPosts = getLatestPosts(3).filter(p => p.id !== post.id).slice(0, 2);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
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

  // Simple markdown-to-HTML conversion for demo
  const renderContent = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        // Headers
        if (line.startsWith('### ')) {
          return <h3 key={index} className="font-display text-xl text-foreground mt-8 mb-4">{line.replace('### ', '')}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="font-display text-2xl text-foreground mt-10 mb-4">{line.replace('## ', '')}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={index} className="font-display text-3xl text-foreground mt-10 mb-4">{line.replace('# ', '')}</h1>;
        }
        // List items
        if (line.startsWith('- **')) {
          const boldMatch = line.match(/- \*\*(.+?)\*\*(.+)?/);
          if (boldMatch) {
            return (
              <li key={index} className="mb-2 text-muted-foreground">
                <strong className="text-foreground">{boldMatch[1]}</strong>
                {boldMatch[2]}
              </li>
            );
          }
        }
        if (line.startsWith('- ')) {
          return <li key={index} className="mb-2 text-muted-foreground">{line.replace('- ', '')}</li>;
        }
        // Numbered list
        if (/^\d+\.\s/.test(line)) {
          return <li key={index} className="mb-2 text-muted-foreground list-decimal ml-4">{line.replace(/^\d+\.\s/, '')}</li>;
        }
        // Paragraphs
        if (line.trim()) {
          // Handle inline bold
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
          {/* Back link */}
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Link>
          
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-accent px-3 py-1 rounded-full">
              {post.category}
            </span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar size={14} />
              {new Date(post.date).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock size={14} />
              {post.readTime}
            </span>
          </div>
          
          {/* Title */}
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">
            {post.title}
          </h1>
          
          {/* Excerpt */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl">
            {post.excerpt}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <article className="prose-custom">
            {renderContent(post.content)}
          </article>
          
          {/* Share */}
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
                <Link
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.slug}`}
                  className="group"
                >
                  <article className="p-6 bg-background rounded-xl border border-border card-hover">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      {relatedPost.category}
                    </span>
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
