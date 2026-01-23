import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, Search, Loader2, User, Filter, ChevronDown } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { SEOHead } from "@/components/SEOHead";

interface Author {
  id: string;
  name: string;
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

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  read_time: number | null;
  published_at: string | null;
  is_featured: boolean | null;
  featured_image: string | null;
  featured_image_alt: string | null;
  authors: Author | null;
  blog_post_categories: PostCategory[];
}

type TimeFilter = "all" | "week" | "month" | "year";

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [postsRes, categoriesRes] = await Promise.all([
      supabase
        .from("blog_posts")
        .select(`
          id, title, slug, excerpt, read_time, published_at, is_featured, featured_image, featured_image_alt,
          authors(id, name),
          blog_post_categories(category_id, is_primary, blog_categories(id, name, slug))
        `)
        .eq("status", "published")
        .order("published_at", { ascending: false }),
      supabase.from("blog_categories").select("*").eq("is_active", true).order("sort_order"),
    ]);

    if (postsRes.data) setPosts(postsRes.data as unknown as BlogPost[]);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    setLoading(false);
  };

  const getTimeFilterDate = (filter: TimeFilter): Date | null => {
    const now = new Date();
    switch (filter) {
      case "week":
        return new Date(now.setDate(now.getDate() - 7));
      case "month":
        return new Date(now.setMonth(now.getMonth() - 1));
      case "year":
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return null;
    }
  };

  const filteredPosts = posts.filter((post) => {
    // Search filter
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.excerpt || "").toLowerCase().includes(searchQuery.toLowerCase());

    // Time filter
    const filterDate = getTimeFilterDate(timeFilter);
    const matchesTime =
      !filterDate || (post.published_at && new Date(post.published_at) >= filterDate);

    // Category filter
    const matchesCategory =
      selectedCategories.length === 0 ||
      post.blog_post_categories?.some((pc) =>
        selectedCategories.includes(pc.category_id)
      );

    return matchesSearch && matchesTime && matchesCategory;
  });

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const timeFilterLabels: Record<TimeFilter, string> = {
    all: "All Time",
    week: "Past Week",
    month: "Past Month",
    year: "Past Year",
  };

  const activeFiltersCount =
    selectedCategories.length + (timeFilter !== "all" ? 1 : 0);

  return (
    <Layout>
      <SEOHead 
        title="Blog" 
        description="Read the latest articles and insights"
      />
      {/* Filters */}
      <section className="py-4 bg-background">
        <div className="container-wide">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
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

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2">
              {/* Time Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Calendar size={14} />
                    {timeFilterLabels[timeFilter]}
                    <ChevronDown size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Time Period</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(Object.keys(timeFilterLabels) as TimeFilter[]).map((key) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={timeFilter === key}
                      onCheckedChange={() => setTimeFilter(key)}
                    >
                      {timeFilterLabels[key]}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Category Filter */}
              {categories.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter size={14} />
                      Categories
                      {selectedCategories.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                          {selectedCategories.length}
                        </span>
                      )}
                      <ChevronDown size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Categories</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {categories.map((category) => (
                      <DropdownMenuCheckboxItem
                        key={category.id}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      >
                        {category.name}
                      </DropdownMenuCheckboxItem>
                    ))}
                    {selectedCategories.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-muted-foreground"
                          onClick={() => setSelectedCategories([])}
                        >
                          Clear all
                        </Button>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Clear All Filters */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCategories([]);
                    setTimeFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-8 bg-background">
        <div className="container-wide">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No posts found matching your criteria.</p>
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
                    animationFillMode: "forwards",
                  }}
                >
                  <article className="h-full bg-card rounded-xl border border-border card-hover flex flex-col overflow-hidden">
                    {/* Thumbnail */}
                    {post.featured_image && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={post.featured_image}
                          alt={post.featured_image_alt || post.title}
                          title={post.featured_image_alt || post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    
                    <div className="p-6 flex flex-col flex-1">
                      {/* Categories */}
                      {post.blog_post_categories && post.blog_post_categories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {post.blog_post_categories
                            .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
                            .slice(0, 3)
                            .map((pc) => (
                              <span
                                key={pc.category_id}
                                className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
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

                      {/* Featured Badge */}
                      {post.is_featured && (
                        <div className="mb-3">
                          <span className="text-xs font-semibold uppercase tracking-wider text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                            Featured
                          </span>
                        </div>
                      )}

                      {/* Title */}
                      <h2 className="font-display text-xl md:text-2xl text-foreground mb-3 group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-muted-foreground text-sm mb-4 flex-1 line-clamp-3">{post.excerpt}</p>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-4 border-t border-border">
                        {post.authors && (
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {post.authors.name}
                          </span>
                        )}
                        {post.published_at && (
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(post.published_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {post.read_time || 5} min read
                        </span>
                      </div>
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
