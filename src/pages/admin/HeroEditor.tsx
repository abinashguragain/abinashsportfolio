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

interface HeroContent {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  cta_text: string | null;
  cta_link: string | null;
  image_url: string | null;
}

const HeroEditor = () => {
  const [content, setContent] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { uploadImage, uploading } = useImageUpload();
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data, error } = await supabase
      .from("hero_content")
      .select("*")
      .eq("is_active", true)
      .single();

    if (data) {
      setContent(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!content) return;

    setSaving(true);
    const { error } = await supabase
      .from("hero_content")
      .update({
        title: content.title,
        subtitle: content.subtitle,
        description: content.description,
        cta_text: content.cta_text,
        cta_link: content.cta_link,
        image_url: content.image_url,
      })
      .eq("id", content.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Saved",
        description: "Hero section updated successfully",
      });
    }
    setSaving(false);
  };

  const handleImageUpload = async (file: File) => {
    return await uploadImage(file, "hero");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hero content found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-foreground">Hero Section</h1>
          <p className="text-muted-foreground mt-1">Edit your homepage hero</p>
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
                value={content.title}
                onChange={(e) => setContent({ ...content, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={content.subtitle || ""}
                onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={content.description || ""}
                onChange={(e) => setContent({ ...content, description: e.target.value })}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Call to Action</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cta_text">Button Text</Label>
              <Input
                id="cta_text"
                value={content.cta_text || ""}
                onChange={(e) => setContent({ ...content, cta_text: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta_link">Button Link</Label>
              <Input
                id="cta_link"
                value={content.cta_link || ""}
                onChange={(e) => setContent({ ...content, cta_link: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Hero Image</Label>
              <ImageUpload
                value={content.image_url || undefined}
                onChange={(url) => setContent({ ...content, image_url: url })}
                onUpload={handleImageUpload}
                uploading={uploading}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HeroEditor;
