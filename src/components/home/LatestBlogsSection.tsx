import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLatestPosts } from "@/data/blogs";

export const LatestBlogsSection = () => {
  const latestPosts = getLatestPosts(3);

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
          {latestPosts.map((post, index) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <article className="h-full p-6 bg-card rounded-xl border border-border card-hover flex flex-col">
                {/* Category */}
                <span className="inline-block w-fit text-xs font-semibold uppercase tracking-wider text-primary bg-accent px-3 py-1 rounded-full mb-4">
                  {post.category}
                </span>
                
                {/* Title */}
                <h3 className="font-display text-xl md:text-2xl text-foreground mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                
                {/* Excerpt */}
                <p className="text-muted-foreground text-sm mb-4 flex-1">
                  {post.excerpt}
                </p>
                
                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(post.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {post.readTime}
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
