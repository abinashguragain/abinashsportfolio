import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  read_time: number | null;
  published_at: string | null;
}

export const LatestBlogsSection = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, read_time, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(3);

      if (data) setPosts(data);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <section className="section-padding bg-background">
        <div className="container-wide flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="section-padding bg-background">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 md:mb-16">
          <div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
              LATEST <span className="text-gradient">THOUGHTS</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              Insights on writing, content strategy, and the creative process.
            </p>
          </div>
          <Button variant="outline" asChild className="w-fit">
            <Link to="/blog">
              View All Posts
              <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {posts.map((post, index) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <article className="h-full p-6 bg-card rounded-xl border border-border card-hover flex flex-col">
                <h3 className="font-display text-xl md:text-2xl text-foreground mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                
                <p className="text-muted-foreground text-sm mb-4 flex-1">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border">
                  {post.published_at && (
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(post.published_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {post.read_time || 5} min read
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
