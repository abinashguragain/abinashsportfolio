import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, GripVertical, X, Info } from "lucide-react";

interface Experience {
  id: string;
  title: string;
  title_link: string | null;
  company: string | null;
  description: string | null;
  highlights: string[];
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  is_current: boolean;
  sort_order: number;
}

interface PageContent {
  id: string;
  title: string;
  highlight_word: string | null;
  subtitle: string | null;
  cta_title: string | null;
  cta_highlight_word: string | null;
  cta_description: string | null;
  cta_button_text: string | null;
  cta_button_link: string | null;
  cta_visible: boolean;
}

const ExperienceEditor = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [expRes, contentRes] = await Promise.all([
      supabase.from("experiences").select("*").order("sort_order"),
      supabase.from("experience_page_content").select("*").single(),
    ]);

    if (expRes.data) {
      setExperiences(expRes.data as Experience[]);
    }
    if (contentRes.data) {
      setPageContent(contentRes.data);
    }
    setLoading(false);
  };

  const handleSavePageContent = async () => {
    if (!pageContent) return;
    setSaving(true);

    const { error } = await supabase
      .from("experience_page_content")
      .update({
        title: pageContent.title,
        highlight_word: pageContent.highlight_word,
        subtitle: pageContent.subtitle,
        cta_title: pageContent.cta_title,
        cta_highlight_word: pageContent.cta_highlight_word,
        cta_description: pageContent.cta_description,
        cta_button_text: pageContent.cta_button_text,
        cta_button_link: pageContent.cta_button_link,
        cta_visible: pageContent.cta_visible,
      })
      .eq("id", pageContent.id);

    if (error) {
      toast({ title: "Error", description: "Failed to save page content", variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Page content updated" });
    }
    setSaving(false);
  };

  const handleAddExperience = async () => {
    const newOrder = experiences.length > 0 ? Math.max(...experiences.map((e) => e.sort_order)) + 1 : 0;
    
    const { data, error } = await supabase
      .from("experiences")
      .insert({
        title: "New Experience",
        sort_order: newOrder,
        highlights: [],
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Failed to add experience", variant: "destructive" });
    } else if (data) {
      setExperiences([...experiences, data as Experience]);
      toast({ title: "Added", description: "New experience added" });
    }
  };

  const handleUpdateExperience = async (exp: Experience) => {
    const { error } = await supabase
      .from("experiences")
      .update({
        title: exp.title,
        title_link: exp.title_link,
        company: exp.company,
        description: exp.description,
        highlights: exp.highlights,
        start_date: exp.start_date,
        end_date: exp.end_date,
        is_active: exp.is_active,
        is_current: exp.is_current,
        sort_order: exp.sort_order,
      })
      .eq("id", exp.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update experience", variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Experience updated" });
    }
  };

  const handleDeleteExperience = async (id: string) => {
    const { error } = await supabase.from("experiences").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete experience", variant: "destructive" });
    } else {
      setExperiences(experiences.filter((e) => e.id !== id));
      toast({ title: "Deleted", description: "Experience removed" });
    }
  };

  const updateExperienceField = (id: string, field: keyof Experience, value: any) => {
    setExperiences(
      experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const addHighlight = (id: string) => {
    setExperiences(
      experiences.map((e) =>
        e.id === id ? { ...e, highlights: [...(e.highlights || []), ""] } : e
      )
    );
  };

  const updateHighlight = (expId: string, index: number, value: string) => {
    setExperiences(
      experiences.map((e) => {
        if (e.id !== expId) return e;
        const newHighlights = [...(e.highlights || [])];
        newHighlights[index] = value;
        return { ...e, highlights: newHighlights };
      })
    );
  };

  const removeHighlight = (expId: string, index: number) => {
    setExperiences(
      experiences.map((e) => {
        if (e.id !== expId) return e;
        const newHighlights = (e.highlights || []).filter((_, i) => i !== index);
        return { ...e, highlights: newHighlights };
      })
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-admin-heading font-bold text-foreground">Experience Page</h1>
        <p className="text-muted-foreground mt-1">Manage your experience page content</p>
      </div>

      {/* Page Header Content */}
      <Card>
        <CardHeader>
          <CardTitle>Page Header</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="page_title">Title</Label>
              <Input
                id="page_title"
                value={pageContent?.title || ""}
                onChange={(e) =>
                  setPageContent((prev) => prev && { ...prev, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="highlight_word">Highlight Word</Label>
              <Input
                id="highlight_word"
                value={pageContent?.highlight_word || ""}
                onChange={(e) =>
                  setPageContent((prev) => prev && { ...prev, highlight_word: e.target.value })
                }
                placeholder="Word to highlight in title"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="page_subtitle">Subtitle</Label>
            <Textarea
              id="page_subtitle"
              value={pageContent?.subtitle || ""}
              onChange={(e) =>
                setPageContent((prev) => prev && { ...prev, subtitle: e.target.value })
              }
              rows={2}
            />
          </div>
          <Button onClick={handleSavePageContent} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Header
          </Button>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Call to Action Section</CardTitle>
            <div className="flex items-center gap-2">
              <Switch
                checked={pageContent?.cta_visible ?? true}
                onCheckedChange={(checked) =>
                  setPageContent((prev) => prev && { ...prev, cta_visible: checked })
                }
              />
              <Label className="text-sm">Visible</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cta_title">CTA Title</Label>
              <Input
                id="cta_title"
                value={pageContent?.cta_title || ""}
                onChange={(e) =>
                  setPageContent((prev) => prev && { ...prev, cta_title: e.target.value })
                }
                placeholder="e.g., READY TO COLLABORATE?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cta_highlight_word">Highlight Word</Label>
              <Input
                id="cta_highlight_word"
                value={pageContent?.cta_highlight_word || ""}
                onChange={(e) =>
                  setPageContent((prev) => prev && { ...prev, cta_highlight_word: e.target.value })
                }
                placeholder="Word to highlight in title"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cta_description">Description</Label>
            <Textarea
              id="cta_description"
              value={pageContent?.cta_description || ""}
              onChange={(e) =>
                setPageContent((prev) => prev && { ...prev, cta_description: e.target.value })
              }
              rows={2}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cta_button_text">Button Text</Label>
              <Input
                id="cta_button_text"
                value={pageContent?.cta_button_text || ""}
                onChange={(e) =>
                  setPageContent((prev) => prev && { ...prev, cta_button_text: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cta_button_link">Button Link</Label>
              <Input
                id="cta_button_link"
                value={pageContent?.cta_button_link || ""}
                onChange={(e) =>
                  setPageContent((prev) => prev && { ...prev, cta_button_link: e.target.value })
                }
              />
            </div>
          </div>
          <Button onClick={handleSavePageContent} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save CTA Section
          </Button>
        </CardContent>
      </Card>

      {/* Experiences List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-admin-heading font-bold text-foreground">Experiences</h2>
          <Button onClick={handleAddExperience} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Experience
          </Button>
        </div>

        <div className="space-y-4">
          {experiences.map((exp) => (
            <Card key={exp.id}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GripVertical className="h-5 w-5" />
                    <span className="text-sm">Order: {exp.sort_order}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={exp.is_active}
                        onCheckedChange={(checked) =>
                          updateExperienceField(exp.id, "is_active", checked)
                        }
                      />
                      <Label className="text-sm">Active</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={exp.is_current}
                        onCheckedChange={(checked) =>
                          updateExperienceField(exp.id, "is_current", checked)
                        }
                      />
                      <Label className="text-sm">Current Position</Label>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteExperience(exp.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Date Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={exp.start_date || ""}
                      onChange={(e) => updateExperienceField(exp.id, "start_date", e.target.value || null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date {exp.is_current && <span className="text-muted-foreground">(ignored if Current)</span>}</Label>
                    <Input
                      type="date"
                      value={exp.end_date || ""}
                      onChange={(e) => updateExperienceField(exp.id, "end_date", e.target.value || null)}
                      disabled={exp.is_current}
                    />
                  </div>
                </div>

                {/* Title and Company */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Job Title</Label>
                    <Input
                      value={exp.title}
                      onChange={(e) => updateExperienceField(exp.id, "title", e.target.value)}
                      placeholder="e.g., Software Engineer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title Link (optional)</Label>
                    <Input
                      value={exp.title_link || ""}
                      onChange={(e) => updateExperienceField(exp.id, "title_link", e.target.value || null)}
                      placeholder="https://company.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    value={exp.company || ""}
                    onChange={(e) => updateExperienceField(exp.id, "company", e.target.value)}
                    placeholder="e.g., Acme Corp"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description (optional, shown if no highlights)</Label>
                  <Textarea
                    value={exp.description || ""}
                    onChange={(e) => updateExperienceField(exp.id, "description", e.target.value)}
                    rows={2}
                    placeholder="Brief description of the role..."
                  />
                </div>

                {/* Highlights/Bullet Points */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Bullet Points</Label>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        Use [text](url) for links. e.g., Built [Retack AI](https://retack.ai)
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => addHighlight(exp.id)}>
                      <Plus className="mr-1 h-3 w-3" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(exp.highlights || []).map((highlight, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          value={highlight}
                          onChange={(e) => updateHighlight(exp.id, idx, e.target.value)}
                          placeholder={`Bullet point ${idx + 1}`}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeHighlight(exp.id, idx)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleUpdateExperience(exp)}>
                    Save Experience
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {experiences.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No experiences yet. Click "Add Experience" to create one.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExperienceEditor;
