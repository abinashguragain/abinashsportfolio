import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useImageUpload } from "@/hooks/use-image-upload";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Star, Home } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  content: string;
  avatar_url: string | null;
  rating: number;
  is_active: boolean;
  sort_order: number;
  name_link: string | null;
  company_link: string | null;
  show_on_homepage: boolean;
}

const TestimonialsEditor = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { uploadImage, uploading } = useImageUpload();
  const { toast } = useToast();

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true });

    if (data) {
      setTestimonials(data);
    }
    setLoading(false);
  };

  const handleSave = async (item: Testimonial) => {
    setSaving(true);
    
    if (item.id.startsWith("new-")) {
      const { error } = await supabase.from("testimonials").insert({
        name: item.name,
        role: item.role,
        company: item.company,
        content: item.content,
        avatar_url: item.avatar_url,
        rating: item.rating,
        is_active: item.is_active,
        sort_order: item.sort_order,
        name_link: item.name_link,
        company_link: item.company_link,
        show_on_homepage: item.show_on_homepage,
      });

      if (error) {
        toast({ title: "Error", description: "Failed to create testimonial", variant: "destructive" });
      } else {
        toast({ title: "Created", description: "Testimonial added successfully" });
        fetchTestimonials();
      }
    } else {
      const { error } = await supabase
        .from("testimonials")
        .update({
          name: item.name,
          role: item.role,
          company: item.company,
          content: item.content,
          avatar_url: item.avatar_url,
          rating: item.rating,
          is_active: item.is_active,
          name_link: item.name_link,
          company_link: item.company_link,
          show_on_homepage: item.show_on_homepage,
        })
        .eq("id", item.id);

      if (error) {
        toast({ title: "Error", description: "Failed to update testimonial", variant: "destructive" });
      } else {
        toast({ title: "Saved", description: "Testimonial updated successfully" });
        fetchTestimonials();
      }
    }

    setSaving(false);
    setIsDialogOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("testimonials").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete testimonial", variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Testimonial removed" });
      fetchTestimonials();
    }
  };

  const handleAddNew = () => {
    setEditingItem({
      id: `new-${Date.now()}`,
      name: "",
      role: "",
      company: "",
      content: "",
      avatar_url: null,
      rating: 5,
      is_active: true,
      sort_order: testimonials.length,
      name_link: null,
      company_link: null,
      show_on_homepage: false,
    });
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (file: File) => {
    return await uploadImage(file, "testimonials");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-admin-heading font-bold text-foreground">Testimonials</h1>
          <p className="text-muted-foreground mt-1">Manage client testimonials</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add Testimonial
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.map((item) => (
          <Card key={item.id} className={!item.is_active ? "opacity-50" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {item.avatar_url ? (
                    <img
                      src={item.avatar_url}
                      alt={item.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      {item.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-base">{item.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {item.role} {item.company && `@ ${item.company}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingItem(item);
                      setIsDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">{item.content}</p>
              <div className="flex items-center gap-1 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < item.rating ? "fill-accent text-accent" : "text-muted"}`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem?.id.startsWith("new-") ? "Add Testimonial" : "Edit Testimonial"}
            </DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input
                    value={editingItem.role || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  value={editingItem.company || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, company: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name Link (optional)</Label>
                  <Input
                    placeholder="https://..."
                    value={editingItem.name_link || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, name_link: e.target.value || null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company Link (optional)</Label>
                  <Input
                    placeholder="https://..."
                    value={editingItem.company_link || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, company_link: e.target.value || null })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Testimonial</Label>
                <Textarea
                  value={editingItem.content}
                  onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setEditingItem({ ...editingItem, rating: i + 1 })}
                    >
                      <Star
                        className={`h-6 w-6 ${
                          i < editingItem.rating ? "fill-accent text-accent" : "text-muted"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Avatar</Label>
                <ImageUpload
                  value={editingItem.avatar_url || undefined}
                  onChange={(url) => setEditingItem({ ...editingItem, avatar_url: url })}
                  onUpload={handleImageUpload}
                  uploading={uploading}
                  label="Upload Avatar"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingItem.is_active}
                  onCheckedChange={(checked) => setEditingItem({ ...editingItem, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
              <Button
                onClick={() => handleSave(editingItem)}
                disabled={saving || !editingItem.name || !editingItem.content}
                className="w-full"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestimonialsEditor;
