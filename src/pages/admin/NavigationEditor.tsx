import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useImageUpload } from "@/hooks/use-image-upload";
import { Plus, Trash2, GripVertical, Save, Loader2 } from "lucide-react";

interface NavLink {
  id: string;
  label: string;
  href: string;
  sort_order: number;
  is_active: boolean;
}

interface NavigationSettings {
  id: string;
  site_name: string;
  site_name_accent: string | null;
  logo_url: string | null;
  favicon_url: string | null;
}

const NavigationEditor = () => {
  const { toast } = useToast();
  const { uploadImage, uploading } = useImageUpload();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);
  const [settings, setSettings] = useState<NavigationSettings | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [linksResult, settingsResult] = await Promise.all([
        supabase.from("nav_links").select("*").order("sort_order"),
        supabase.from("navigation_settings").select("*").single(),
      ]);

      if (linksResult.data) setNavLinks(linksResult.data);
      if (settingsResult.data) setSettings(settingsResult.data);
    } catch (error) {
      console.error("Error fetching navigation data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (field: keyof NavigationSettings, value: string) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const handleLinkChange = (id: string, field: keyof NavLink, value: string | number | boolean) => {
    setNavLinks(links =>
      links.map(link => (link.id === id ? { ...link, [field]: value } : link))
    );
  };

  const addNewLink = () => {
    const newLink: NavLink = {
      id: `temp-${Date.now()}`,
      label: "New Link",
      href: "/",
      sort_order: navLinks.length,
      is_active: true,
    };
    setNavLinks([...navLinks, newLink]);
  };

  const removeLink = async (id: string) => {
    if (id.startsWith("temp-")) {
      setNavLinks(links => links.filter(link => link.id !== id));
      return;
    }

    try {
      const { error } = await supabase.from("nav_links").delete().eq("id", id);
      if (error) throw error;
      setNavLinks(links => links.filter(link => link.id !== id));
      toast({ title: "Link deleted" });
    } catch (error) {
      console.error("Error deleting link:", error);
      toast({ title: "Error deleting link", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save settings
      if (settings) {
        const { error: settingsError } = await supabase
          .from("navigation_settings")
          .update({
            site_name: settings.site_name,
            site_name_accent: settings.site_name_accent,
            logo_url: settings.logo_url,
            favicon_url: settings.favicon_url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", settings.id);

        if (settingsError) throw settingsError;
      }

      // Save links
      for (const link of navLinks) {
        if (link.id.startsWith("temp-")) {
          const { error } = await supabase.from("nav_links").insert({
            label: link.label,
            href: link.href,
            sort_order: link.sort_order,
            is_active: link.is_active,
          });
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("nav_links")
            .update({
              label: link.label,
              href: link.href,
              sort_order: link.sort_order,
              is_active: link.is_active,
              updated_at: new Date().toISOString(),
            })
            .eq("id", link.id);
          if (error) throw error;
        }
      }

      toast({ title: "Navigation saved successfully" });
      fetchData();
    } catch (error) {
      console.error("Error saving navigation:", error);
      toast({ title: "Error saving navigation", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Navigation & Branding</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      {/* Branding Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="site_name">Site Name</Label>
              <Input
                id="site_name"
                value={settings?.site_name || ""}
                onChange={(e) => handleSettingsChange("site_name", e.target.value)}
                placeholder="YOUR"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site_name_accent">Accent Text</Label>
              <Input
                id="site_name_accent"
                value={settings?.site_name_accent || ""}
                onChange={(e) => handleSettingsChange("site_name_accent", e.target.value)}
                placeholder="NAME"
              />
              <p className="text-xs text-muted-foreground">
                This text will appear in the accent color
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Logo (Optional)</Label>
              <ImageUpload
                value={settings?.logo_url || ""}
                onChange={(url) => handleSettingsChange("logo_url", url || "")}
                onUpload={uploadImage}
                uploading={uploading}
                label="Upload Logo"
              />
              <p className="text-xs text-muted-foreground">
                If set, this will replace the text logo
              </p>
            </div>
            <div className="space-y-2">
              <Label>Favicon</Label>
              <ImageUpload
                value={settings?.favicon_url || ""}
                onChange={(url) => handleSettingsChange("favicon_url", url || "")}
                onUpload={uploadImage}
                uploading={uploading}
                label="Upload Favicon"
              />
              <p className="text-xs text-muted-foreground">
                Recommended size: 32x32 or 64x64 pixels
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Links */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Navigation Links</CardTitle>
          <Button onClick={addNewLink} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Link
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {navLinks.map((link, index) => (
              <div
                key={link.id}
                className="flex items-center gap-4 p-4 border border-border rounded-lg bg-card"
              >
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Label</Label>
                    <Input
                      value={link.label}
                      onChange={(e) => handleLinkChange(link.id, "label", e.target.value)}
                      placeholder="Home"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">URL</Label>
                    <Input
                      value={link.href}
                      onChange={(e) => handleLinkChange(link.id, "href", e.target.value)}
                      placeholder="/"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Order</Label>
                    <Input
                      type="number"
                      value={link.sort_order}
                      onChange={(e) => handleLinkChange(link.id, "sort_order", parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLink(link.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {navLinks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No navigation links. Click "Add Link" to create one.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NavigationEditor;
