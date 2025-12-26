import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { useImageUpload } from "@/hooks/use-image-upload";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const BlogEditor = () => {
  const { uploadImage, uploading } = useImageUpload();
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image: "",
    status: "draft",
    is_featured: false,
    read_time: 5,
  });

  useEffect(() => {
    if (!isNew && id) {
      fetchPost();
    }
  }, [id, isNew]);

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      toast({ title: "Post not found", variant: "destructive" });
      navigate("/admin/blog");
      return;
    }

    setForm({
      title: data.title || "",
      slug: data.slug || "",
      excerpt: data.excerpt || "",
      content: data.content || "",
      featured_image: data.featured_image || "",
      status: data.status || "draft",
      is_featured: data.is_featured || false,
      read_time: data.read_time || 5,
    });
    setLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: prev.slug || generateSlug(value),
    }));
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) {
      toast({ title: "Title and slug are required", variant: "destructive" });
      return;
    }

    setSaving(true);

    const postData = {
      ...form,
      author_id: user?.id,
      published_at: form.status === "published" ? new Date().toISOString() : null,
    };

    let error;
    if (isNew) {
      const result = await supabase.from("blog_posts").insert(postData);
      error = result.error;
    } else {
      const result = await supabase.from("blog_posts").update(postData).eq("id", id);
      error = result.error;
    }

    setSaving(false);

    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved!" });
      navigate("/admin/blog");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm py-4 z-20 border-b border-border -mx-6 px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/admin/blog")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-display">{isNew ? "New Post" : "Edit Post"}</h1>
        </div>
        <div className="flex items-center gap-4">
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Title - Large like Google Docs */}
        <div>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled"
            className="text-4xl font-display border-0 border-b border-transparent hover:border-border focus:border-primary rounded-none px-0 py-3 h-auto bg-transparent focus-visible:ring-0 transition-colors"
          />
        </div>

        {/* Slug */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>URL:</span>
          <Input
            id="slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="post-url-slug"
            className="w-auto flex-1 h-8 text-sm"
          />
        </div>

        {/* Rich Text Editor */}
        <RichTextEditor
          content={form.content}
          onChange={(content) => setForm({ ...form, content })}
          placeholder="Start writing your blog post..."
        />

        {/* Sidebar Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-muted/30 rounded-lg border border-border">
          <div className="space-y-4">
            <h3 className="font-semibold">Post Settings</h3>
            
            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="Brief summary of the post"
                rows={3}
              />
            </div>

            {/* Read Time */}
            <div className="space-y-2">
              <Label htmlFor="read_time">Read Time (minutes)</Label>
              <Input
                id="read_time"
                type="number"
                value={form.read_time}
                onChange={(e) => setForm({ ...form, read_time: parseInt(e.target.value) || 5 })}
                min={1}
              />
            </div>

            {/* Featured Toggle */}
            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_featured}
                onCheckedChange={(checked) => setForm({ ...form, is_featured: checked })}
              />
              <Label>Featured Post</Label>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Featured Image</h3>
            <ImageUpload
              value={form.featured_image}
              onChange={(url) => setForm({ ...form, featured_image: url || "" })}
              onUpload={(file) => uploadImage(file, "blog")}
              uploading={uploading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
