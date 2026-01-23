import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useImageUpload } from "@/hooks/use-image-upload";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AboutContent {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
}

const AboutEditor = () => {
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { uploadImage, uploading } = useImageUpload();
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase
      .from("about_content")
      .select("*")
      .single();

    if (data) {
      setAbout(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!about) return;

    setSaving(true);
    const { error } = await supabase
      .from("about_content")
      .update({
        title: about.title,
        content: about.content,
        image_url: about.image_url,
      })
      .eq("id", about.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Saved",
        description: "About section updated successfully",
      });
    }
    setSaving(false);
  };

  const handleImageUpload = async (file: File) => {
    return await uploadImage(file, "about");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!about) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No about content found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-admin-heading font-bold text-foreground">About Section</h1>
          <p className="text-muted-foreground mt-1">Edit your about content</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={about.title}
                onChange={(e) => setAbout({ ...about, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={about.content || ""}
                onChange={(e) => setAbout({ ...about, content: e.target.value })}
                rows={10}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Image</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              value={about.image_url || undefined}
              onChange={(url) => setAbout({ ...about, image_url: url })}
              onUpload={handleImageUpload}
              uploading={uploading}
              label="Upload About Image"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutEditor;
