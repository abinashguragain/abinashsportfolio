import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { useImageUpload } from "@/hooks/use-image-upload";
import { Loader2, ArrowLeft, Save } from "lucide-react";

interface Author {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface SelectedCategory {
  id: string;
  isPrimary: boolean;
}

const BlogEditor = () => {
  const { uploadImage, uploading } = useImageUpload();
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<SelectedCategory[]>([]);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image: "",
    status: "draft",
    is_featured: false,
    read_time: 5,
    author_id: "",
  });

  useEffect(() => {
    fetchAuthors();
    fetchCategories();
    if (!isNew && id) {
      fetchPost();
    }
  }, [id, isNew]);

  const fetchAuthors = async () => {
    const { data } = await supabase
      .from("authors")
      .select("id, name")
      .order("name");
    if (data) setAuthors(data);
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("blog_categories")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("sort_order");
    if (data) setCategories(data);
  };

  const fetchPost = async () => {
    const [postRes, categoriesRes] = await Promise.all([
      supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("blog_post_categories")
        .select("category_id, is_primary")
        .eq("post_id", id!),
    ]);

    if (postRes.error || !postRes.data) {
      toast({ title: "Post not found", variant: "destructive" });
      navigate("/admin/blog");
      return;
    }

    setForm({
      title: postRes.data.title || "",
      slug: postRes.data.slug || "",
      excerpt: postRes.data.excerpt || "",
      content: postRes.data.content || "",
      featured_image: postRes.data.featured_image || "",
      status: postRes.data.status || "draft",
      is_featured: postRes.data.is_featured || false,
      read_time: postRes.data.read_time || 5,
      author_id: postRes.data.author_id || "",
    });

    if (categoriesRes.data) {
      setSelectedCategories(
        categoriesRes.data.map((c) => ({
          id: c.category_id,
          isPrimary: c.is_primary || false,
        }))
      );
    }
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

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const exists = prev.find((c) => c.id === categoryId);
      if (exists) {
        return prev.filter((c) => c.id !== categoryId);
      }
      return [...prev, { id: categoryId, isPrimary: false }];
    });
  };

  const togglePrimary = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId ? { ...c, isPrimary: !c.isPrimary } : c
      )
    );
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) {
      toast({ title: "Title and slug are required", variant: "destructive" });
      return;
    }

    setSaving(true);

    const postData = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      content: form.content,
      featured_image: form.featured_image,
      status: form.status,
      is_featured: form.is_featured,
      read_time: form.read_time,
      author_id: form.author_id && form.author_id.length > 0 ? form.author_id : null,
      published_at: form.status === "published" ? new Date().toISOString() : null,
    };

    let postId = id;
    let error;

    if (isNew) {
      const result = await supabase.from("blog_posts").insert(postData).select("id").single();
      error = result.error;
      if (result.data) postId = result.data.id;
    } else {
      const result = await supabase.from("blog_posts").update(postData).eq("id", id);
      error = result.error;
    }

    if (error) {
      setSaving(false);
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
      return;
    }

    // Update categories
    if (postId) {
      // Delete existing categories
      await supabase.from("blog_post_categories").delete().eq("post_id", postId);

      // Insert new categories
      if (selectedCategories.length > 0) {
        const categoryInserts = selectedCategories.map((c) => ({
          post_id: postId!,
          category_id: c.id,
          is_primary: c.isPrimary,
        }));
        await supabase.from("blog_post_categories").insert(categoryInserts);
      }
    }

    setSaving(false);
    toast({ title: "Saved!" });
    navigate("/admin/blog");
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

            {/* Author Selection */}
            <div className="space-y-2">
              <Label>Author (optional)</Label>
              <Select
                value={form.author_id}
                onValueChange={(v) => setForm({ ...form, author_id: v === "none" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an author" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No author</SelectItem>
                  {authors.map((author) => (
                    <SelectItem key={author.id} value={author.id}>
                      {author.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3">
                {categories.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No categories yet. Add some in the Categories section.
                  </p>
                ) : (
                  categories.map((category) => {
                    const selected = selectedCategories.find((c) => c.id === category.id);
                    return (
                      <div key={category.id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`cat-${category.id}`}
                            checked={!!selected}
                            onCheckedChange={() => toggleCategory(category.id)}
                          />
                          <label
                            htmlFor={`cat-${category.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {category.name}
                          </label>
                        </div>
                        {selected && (
                          <button
                            type="button"
                            onClick={() => togglePrimary(category.id)}
                            className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                              selected.isPrimary
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            {selected.isPrimary ? "Primary" : "Secondary"}
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Check categories to assign. Click Primary/Secondary to toggle.
              </p>
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
