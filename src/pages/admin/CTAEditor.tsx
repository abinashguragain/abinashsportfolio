import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface CTAContent {
  id: string;
  title: string;
  highlight_word: string | null;
  description: string | null;
  button_text: string | null;
  button_link: string | null;
}

const CTAEditor = () => {
  const [content, setContent] = useState<CTAContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data, error } = await supabase
      .from("cta_content")
      .select("*")
      .eq("is_active", true)
      .maybeSingle();

    if (data) {
      setContent(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!content) return;

    setSaving(true);
    const { error } = await supabase
      .from("cta_content")
      .update({
        title: content.title,
        highlight_word: content.highlight_word,
        description: content.description,
        button_text: content.button_text,
        button_link: content.button_link,
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
        description: "CTA section updated successfully",
      });
    }
    setSaving(false);
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
        <p className="text-muted-foreground">No CTA content found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-foreground">CTA Section</h1>
          <p className="text-muted-foreground mt-1">Edit "Let's Create Together" section</p>
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
                placeholder="e.g., LET'S CREATE TOGETHER"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="highlight_word">Highlight Word</Label>
              <Input
                id="highlight_word"
                value={content.highlight_word || ""}
                onChange={(e) => setContent({ ...content, highlight_word: e.target.value })}
                placeholder="e.g., TOGETHER (will have gradient effect)"
              />
              <p className="text-xs text-muted-foreground">
                This word will be highlighted with a gradient effect
              </p>
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
            <CardTitle>Call to Action Button</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="button_text">Button Text</Label>
              <Input
                id="button_text"
                value={content.button_text || ""}
                onChange={(e) => setContent({ ...content, button_text: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="button_link">Button Link</Label>
              <Input
                id="button_link"
                value={content.button_link || ""}
                onChange={(e) => setContent({ ...content, button_link: e.target.value })}
                placeholder="e.g., /contact"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CTAEditor;
