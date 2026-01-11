import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useBlogAnalytics, BlogPostAnalytics } from "@/hooks/use-blog-analytics";
import { analyzeSEO, SEOAnalysis } from "@/hooks/use-seo-analysis";
import {
  Loader2,
  Plus,
  Trash2,
  Edit,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Link as LinkIcon,
  FileText,
  Clock,
  MousePointerClick,
  BarChart3,
  Search,
  Filter,
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  status: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

type SortField = "title" | "views" | "published_at" | "updated_at" | "seo_score";
type SortDirection = "asc" | "desc";

const BlogManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchBlogAnalytics, loading: analyticsLoading } = useBlogAnalytics();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Record<string, BlogPostAnalytics>>({});
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [seoFilter, setSeoFilter] = useState<string>("all");
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>("updated_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Fetch posts
  useEffect(() => {
    fetchPosts();
  }, []);

  // Fetch analytics when date range changes
  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, content, status, is_featured, created_at, updated_at, published_at")
      .order("updated_at", { ascending: false });

    if (data) setPosts(data);
    setLoading(false);
  };

  const loadAnalytics = async () => {
    const data = await fetchBlogAnalytics(dateRange);
    setAnalytics(data);
  };

  // Calculate SEO analysis for all posts
  const seoAnalysis = useMemo(() => {
    const allTitles = posts.map(p => p.title).filter(Boolean);
    const allExcerpts = posts.map(p => p.excerpt).filter(Boolean) as string[];
    
    return posts.reduce((acc, post) => {
      acc[post.id] = analyzeSEO(post.title, post.excerpt, post.content, post.slug, allTitles, allExcerpts);
      return acc;
    }, {} as Record<string, SEOAnalysis>);
  }, [posts]);

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.title.toLowerCase().includes(query) ||
          p.slug.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(p => p.status === statusFilter);
    }

    // SEO filter
    if (seoFilter !== "all") {
      result = result.filter(p => {
        const seo = seoAnalysis[p.id];
        if (!seo) return false;
        if (seoFilter === "issues") return seo.issues.length > 0;
        if (seoFilter === "good") return seo.score >= 80;
        if (seoFilter === "poor") return seo.score < 50;
        return true;
      });
    }

    // Sorting
    result.sort((a, b) => {
      let aVal: number | string = 0;
      let bVal: number | string = 0;

      switch (sortField) {
        case "title":
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case "views":
          aVal = analytics[a.slug]?.totalViews || 0;
          bVal = analytics[b.slug]?.totalViews || 0;
          break;
        case "published_at":
          aVal = a.published_at || "";
          bVal = b.published_at || "";
          break;
        case "updated_at":
          aVal = a.updated_at;
          bVal = b.updated_at;
          break;
        case "seo_score":
          aVal = seoAnalysis[a.id]?.score || 0;
          bVal = seoAnalysis[b.id]?.score || 0;
          break;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return result;
  }, [posts, searchQuery, statusFilter, seoFilter, sortField, sortDirection, analytics, seoAnalysis]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this post?")) return;

    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } else {
      toast({ title: "Deleted" });
      fetchPosts();
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  const SEOIndicators = ({ seo }: { seo: SEOAnalysis }) => {
    if (!seo) return null;

    const getScoreColor = (score: number) => {
      if (score >= 80) return "text-green-500";
      if (score >= 50) return "text-yellow-500";
      return "text-destructive";
    };

    const getScoreIcon = (score: number) => {
      if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-500" />;
      if (score >= 50) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      return <XCircle className="h-4 w-4 text-destructive" />;
    };

    return (
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 cursor-help">
              {getScoreIcon(seo.score)}
              <span className={`text-sm font-medium ${getScoreColor(seo.score)}`}>
                {seo.score}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-2">
              <p className="font-medium">SEO Score: {seo.score}/100</p>
              {seo.issues.length > 0 ? (
                <ul className="text-sm space-y-1">
                  {seo.issues.map((issue, i) => (
                    <li key={i} className="flex items-center gap-1">
                      {issue.severity === "error" && <XCircle className="h-3 w-3 text-destructive" />}
                      {issue.severity === "warning" && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                      {issue.severity === "info" && <FileText className="h-3 w-3 text-muted-foreground" />}
                      {issue.label}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-green-500">All checks passed!</p>
              )}
              <div className="text-xs text-muted-foreground pt-1 border-t">
                <p>{seo.wordCount} words • {seo.internalLinkCount} internal links</p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
        
        {seo.issues.length > 0 && (
          <div className="flex gap-1">
            {seo.issues.slice(0, 2).map((issue, i) => (
              <Badge
                key={i}
                variant={issue.severity === "error" ? "destructive" : "secondary"}
                className="text-xs py-0"
              >
                {issue.label}
              </Badge>
            ))}
            {seo.issues.length > 2 && (
              <Badge variant="outline" className="text-xs py-0">
                +{seo.issues.length - 2}
              </Badge>
            )}
          </div>
        )}
      </div>
    );
  };

  const AnalyticsCell = ({ postAnalytics }: { postAnalytics?: BlogPostAnalytics }) => {
    if (analyticsLoading) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }

    if (!postAnalytics || postAnalytics.totalViews === 0) {
      return <span className="text-muted-foreground text-sm">No data</span>;
    }

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-sm cursor-help">
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">{postAnalytics.totalViews}</span>
                <span className="text-muted-foreground">({postAnalytics.uniqueViews})</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{postAnalytics.totalViews} total views ({postAnalytics.uniqueViews} unique)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-sm cursor-help">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{formatTime(postAnalytics.avgTimeOnPage)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Avg. time on page</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 cursor-help">
                <BarChart3 className="h-3 w-3" />
                <span>{postAnalytics.scrollDepthCompletion}% read</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Scroll depth completion</p>
            </TooltipContent>
          </Tooltip>

          {postAnalytics.ctaClicks > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-help">
                  <MousePointerClick className="h-3 w-3" />
                  <span>{postAnalytics.ctaClicks} CTAs</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>CTA clicks from this post</p>
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <span className={`cursor-help ${postAnalytics.exitRate > 70 ? "text-destructive" : ""}`}>
                {postAnalytics.exitRate}% exit
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Exit rate</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display">Blog Management</h1>
          <p className="text-muted-foreground mt-1">
            Content command center • {posts.length} posts
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/blog/new">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            {/* SEO Filter */}
            <Select value={seoFilter} onValueChange={setSeoFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="SEO Health" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All SEO</SelectItem>
                <SelectItem value="issues">Has Issues</SelectItem>
                <SelectItem value="good">Good (80+)</SelectItem>
                <SelectItem value="poor">Poor (&lt;50)</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Range for Analytics */}
            <Select value={dateRange} onValueChange={(v: "7d" | "30d" | "90d") => setDateRange(v)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">
                  <button
                    onClick={() => handleSort("title")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Post
                    <SortIcon field="title" />
                  </button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("published_at")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Published
                    <SortIcon field="published_at" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("updated_at")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Updated
                    <SortIcon field="updated_at" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("views")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Analytics
                    <SortIcon field="views" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("seo_score")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    SEO
                    <SortIcon field="seo_score" />
                  </button>
                </TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.map((post) => (
                <TableRow
                  key={post.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/admin/blog/${post.id}`)}
                >
                  <TableCell>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium line-clamp-1">{post.title}</span>
                        {post.is_featured && (
                          <Badge variant="outline" className="text-xs py-0">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        /{post.slug}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={post.status === "published" ? "default" : "secondary"}
                    >
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(post.published_at)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(post.updated_at)}
                  </TableCell>
                  <TableCell>
                    <AnalyticsCell postAnalytics={analytics[post.slug]} />
                  </TableCell>
                  <TableCell>
                    <SEOIndicators seo={seoAnalysis[post.id]} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/blog/${post.id}`);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View live</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={(e) => handleDelete(post.id, e)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {filteredPosts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <p className="text-muted-foreground">
                      {posts.length === 0
                        ? "No posts yet. Create your first post!"
                        : "No posts match your filters."}
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Summary Stats */}
      {posts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {posts.filter(p => p.status === "published").length}
                </p>
                <p className="text-sm text-muted-foreground">Published</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {posts.filter(p => p.status === "draft").length}
                </p>
                <p className="text-sm text-muted-foreground">Drafts</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {Object.values(seoAnalysis).filter(s => s.issues.length > 0).length}
                </p>
                <p className="text-sm text-muted-foreground">SEO Issues</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {Object.values(analytics).reduce((sum, a) => sum + a.totalViews, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Views ({dateRange})</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;
