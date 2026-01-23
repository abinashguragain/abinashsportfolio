import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useImageUpload } from "@/hooks/use-image-upload";
import { Loader2, Plus, Pencil, Trash2, Save, X, User } from "lucide-react";

interface Author {
  id: string;
  name: string;
  bio: string | null;
  bio_link: string | null;
  avatar_url: string | null;
}

const AuthorsEditor = () => {
  const { uploadImage, uploading } = useImageUpload();
  const { toast } = useToast();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    bio_link: "",
    avatar_url: "",
  });

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    const { data } = await supabase
      .from("authors")
      .select("*")
      .order("name");
    if (data) setAuthors(data);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ name: "", bio: "", bio_link: "", avatar_url: "" });
    setEditingId(null);
  };

  const handleEdit = (author: Author) => {
    setForm({
      name: author.name,
      bio: author.bio || "",
      bio_link: author.bio_link || "",
      avatar_url: author.avatar_url || "",
    });
    setEditingId(author.id);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }

    const authorData = {
      name: form.name.trim(),
      bio: form.bio.trim() || null,
      bio_link: form.bio_link.trim() || null,
      avatar_url: form.avatar_url || null,
    };

    let error;
    if (editingId) {
      const result = await supabase
        .from("authors")
        .update(authorData)
        .eq("id", editingId);
      error = result.error;
    } else {
      const result = await supabase.from("authors").insert(authorData);
      error = result.error;
    }

    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved!" });
      resetForm();
      fetchAuthors();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this author?")) return;

    const { error } = await supabase.from("authors").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted!" });
      fetchAuthors();
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-admin-heading font-bold">Authors</h1>
        <p className="text-muted-foreground">Manage blog post authors</p>
      </div>

      {/* Form */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold">
            {editingId ? "Edit Author" : "Add New Author"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Author name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio / Description</Label>
                <Textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="A short description about the author"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio_link">Bio Link (optional)</Label>
                <Input
                  id="bio_link"
                  value={form.bio_link}
                  onChange={(e) => setForm({ ...form, bio_link: e.target.value })}
                  placeholder="https://example.com/about"
                />
                <p className="text-xs text-muted-foreground">
                  The bio text will become a clickable link if provided
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Avatar</Label>
              <ImageUpload
                value={form.avatar_url}
                onChange={(url) => setForm({ ...form, avatar_url: url || "" })}
                onUpload={(file) => uploadImage(file, "authors")}
                uploading={uploading}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {editingId ? "Update" : "Add Author"}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={resetForm}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Authors List */}
      <div className="grid gap-4">
        {authors.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No authors yet. Add one above.
          </p>
        ) : (
          authors.map((author) => (
            <Card key={author.id}>
              <CardContent className="p-4 flex items-center gap-4">
                {author.avatar_url ? (
                  <img
                    src={author.avatar_url}
                    alt={author.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium">{author.name}</p>
                  {author.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {author.bio}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(author)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(author.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AuthorsEditor;
