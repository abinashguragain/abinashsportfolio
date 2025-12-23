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
import { useImageUpload } from "@/hooks/use-image-upload";
import { Loader2, ArrowLeft, Save, Bold, Italic, Heading1, Heading2, List, Quote } from "lucide-react";
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

  const insertTextFormat = (format: string) => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = form.content.substring(start, end);

    let newText = "";
    switch (format) {
      case "bold":
        newText = `**${selectedText || "bold text"}**`;
        break;
      case "italic":
        newText = `*${selectedText || "italic text"}*`;
        break;
      case "h1":
        newText = `\n# ${selectedText || "Heading 1"}\n`;
        break;
      case "h2":
        newText = `\n## ${selectedText || "Heading 2"}\n`;
        break;
      case "list":
        newText = `\n- ${selectedText || "List item"}\n`;
        break;
      case "quote":
        newText = `\n> ${selectedText || "Quote"}\n`;
        break;
      default:
        return;
    }

    const newContent = form.content.substring(0, start) + newText + form.content.substring(end);
    setForm((prev) => ({ ...prev, content: newContent }));
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
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/admin/blog")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-display">{isNew ? "New Post" : "Edit Post"}</h1>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Post title"
          />
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="post-url-slug"
          />
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            placeholder="Brief summary of the post"
            rows={2}
          />
        </div>

        {/* Featured Image */}
        <div className="space-y-2">
          <Label>Featured Image</Label>
          <ImageUpload
            value={form.featured_image}
            onChange={(url) => setForm({ ...form, featured_image: url || "" })}
            onUpload={(file) => uploadImage(file, "blog")}
            uploading={uploading}
          />
        </div>

        {/* Rich Text Toolbar */}
        <div className="space-y-2">
          <Label htmlFor="content">Content (Markdown)</Label>
          <div className="flex gap-1 p-2 border border-border rounded-t-md bg-muted/50">
            <Button type="button" variant="ghost" size="sm" onClick={() => insertTextFormat("bold")}>
              <Bold className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => insertTextFormat("italic")}>
              <Italic className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => insertTextFormat("h1")}>
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => insertTextFormat("h2")}>
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => insertTextFormat("list")}>
              <List className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => insertTextFormat("quote")}>
              <Quote className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            id="content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Write your content in Markdown..."
            rows={15}
            className="rounded-t-none font-mono text-sm"
          />
        </div>

        {/* Settings Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="read_time">Read Time (min)</Label>
            <Input
              id="read_time"
              type="number"
              value={form.read_time}
              onChange={(e) => setForm({ ...form, read_time: parseInt(e.target.value) || 5 })}
              min={1}
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <Switch
              checked={form.is_featured}
              onCheckedChange={(checked) => setForm({ ...form, is_featured: checked })}
            />
            <Label>Featured Post</Label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
