import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Edit, Eye } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  is_featured: boolean;
  created_at: string;
}

const BlogList = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, status, is_featured, created_at")
      .order("created_at", { ascending: false });

    if (data) setPosts(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } else {
      toast({ title: "Deleted" });
      fetchPosts();
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-admin-heading font-bold">Blog Posts</h1>
          <p className="text-muted-foreground mt-1">Manage your articles</p>
        </div>
        <Button asChild>
          <Link to="/admin/blog/new"><Plus className="mr-2 h-4 w-4" />New Post</Link>
        </Button>
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{post.title}</h3>
                  <Badge variant={post.status === "published" ? "default" : "secondary"}>{post.status}</Badge>
                  {post.is_featured && <Badge variant="outline">Featured</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" asChild><Link to={`/admin/blog/${post.id}`}><Edit className="h-4 w-4" /></Link></Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(post.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {posts.length === 0 && <p className="text-center text-muted-foreground py-8">No posts yet</p>}
      </div>
    </div>
  );
};

export default BlogList;
