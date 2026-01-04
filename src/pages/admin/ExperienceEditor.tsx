import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, GripVertical, X } from "lucide-react";

interface Experience {
  id: string;
  title: string;
  company: string | null;
  description: string | null;
  highlights: string[];
  icon: string;
  accent: string;
  is_active: boolean;
  is_current: boolean;
  sort_order: number;
}

interface PageContent {
  id: string;
  title: string;
  highlight_word: string | null;
  subtitle: string | null;
}

const iconOptions = [
  { value: "Briefcase", label: "Briefcase" },
  { value: "PenTool", label: "Pen Tool" },
  { value: "Target", label: "Target" },
  { value: "Lightbulb", label: "Lightbulb" },
  { value: "Users", label: "Users" },
  { value: "Zap", label: "Zap" },
];

const accentOptions = [
  { value: "primary", label: "Primary" },
  { value: "accent", label: "Accent" },
  { value: "secondary", label: "Secondary" },
];

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
        icon: "Briefcase",
        accent: "primary",
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
        company: exp.company,
        description: exp.description,
        highlights: exp.highlights,
        icon: exp.icon,
        accent: exp.accent,
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
        <h1 className="text-3xl font-display text-foreground">Experience Page</h1>
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

      {/* Experiences List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display text-foreground">Experiences</h2>
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
                      <Label className="text-sm">Current Focus</Label>
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={exp.title}
                      onChange={(e) => updateExperienceField(exp.id, "title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Company/Subtitle</Label>
                    <Input
                      value={exp.company || ""}
                      onChange={(e) => updateExperienceField(exp.id, "company", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <Select
                      value={exp.icon}
                      onValueChange={(value) => updateExperienceField(exp.id, "icon", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Accent Color</Label>
                    <Select
                      value={exp.accent}
                      onValueChange={(value) => updateExperienceField(exp.id, "accent", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {accentOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={exp.description || ""}
                    onChange={(e) => updateExperienceField(exp.id, "description", e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Highlights/Bullet Points */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Highlights (Bullet Points)</Label>
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
                          placeholder={`Highlight ${idx + 1}`}
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
            <div className="text-center py-12 text-muted-foreground">
              No experiences yet. Click "Add Experience" to create one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExperienceEditor;
