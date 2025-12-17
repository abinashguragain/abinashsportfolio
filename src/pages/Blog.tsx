import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, Search } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { blogPosts, getAllCategories } from "@/data/blogs";

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const categories = getAllCategories();
  
  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      {/* Header */}
      <section className="section-padding bg-gradient-hero">
        <div className="container-narrow text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
            THE <span className="text-gradient">BLOG</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Thoughts on writing, content strategy, and the creative journey.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-background border-b border-border">
        <div className="container-wide">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !selectedCategory
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No posts found matching your criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredPosts.map((post, index) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group animate-fade-up opacity-0"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'forwards'
                  }}
                >
                  <article className="h-full p-6 bg-card rounded-xl border border-border card-hover flex flex-col">
                    {/* Category & Featured Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-accent px-3 py-1 rounded-full">
                        {post.category}
                      </span>
                      {post.featured && (
                        <span className="text-xs font-semibold uppercase tracking-wider text-secondary bg-secondary-light px-3 py-1 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    
                    {/* Title */}
                    <h2 className="font-display text-xl md:text-2xl text-foreground mb-3 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    
                    {/* Excerpt */}
                    <p className="text-muted-foreground text-sm mb-4 flex-1 line-clamp-3">
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
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
