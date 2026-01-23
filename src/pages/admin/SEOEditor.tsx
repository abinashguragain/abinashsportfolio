import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useImageUpload } from "@/hooks/use-image-upload";
import { useAdminAction } from "@/hooks/use-admin-action";
import { Loader2, Save, Globe, Image, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SEOSettings {
  id: string;
  site_title: string;
  site_description: string;
  default_og_image: string | null;
}

const SEOEditor = () => {
  const { uploadImage, uploading } = useImageUpload();
  const { executeAction } = useAdminAction();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SEOSettings>({
    id: "",
    site_title: "",
    site_description: "",
    default_og_image: null,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("seo_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setSettings({
        id: data.id,
        site_title: data.site_title || "",
        site_description: data.site_description || "",
        default_og_image: data.default_og_image,
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    
    const result = await executeAction({
      action: "update",
      table: "seo_settings",
      recordId: settings.id,
      data: {
        site_title: settings.site_title,
        site_description: settings.site_description,
        default_og_image: settings.default_og_image,
      },
    });

    if (result.success) {
      toast({ title: "SEO settings saved!" });
    }
    setSaving(false);
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
        <div>
          <h1 className="text-2xl font-admin-heading font-bold">SEO Settings</h1>
          <p className="text-muted-foreground">
            Configure global SEO meta tags for your website
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Site Title */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Site Title
            </CardTitle>
            <CardDescription>
              The default title shown in browser tabs and search results (max 60 characters recommended)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="site_title">Site Title</Label>
              <Input
                id="site_title"
                value={settings.site_title}
                onChange={(e) =>
                  setSettings({ ...settings, site_title: e.target.value })
                }
                placeholder="My Website"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">
                {settings.site_title.length}/60 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Site Description */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Site Description
            </CardTitle>
            <CardDescription>
              The default meta description shown in search results (max 160 characters recommended)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="site_description">Site Description</Label>
              <Textarea
                id="site_description"
                value={settings.site_description}
                onChange={(e) =>
                  setSettings({ ...settings, site_description: e.target.value })
                }
                placeholder="Welcome to my website"
                rows={3}
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground">
                {settings.site_description.length}/160 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Default OG Image */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Default Social Share Image
            </CardTitle>
            <CardDescription>
              The default image shown when your pages are shared on social media (recommended: 1200x630px)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              value={settings.default_og_image || ""}
              onChange={(url) =>
                setSettings({ ...settings, default_og_image: url || null })
              }
              onUpload={(file) => uploadImage(file, "seo")}
              uploading={uploading}
            />
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Search Result Preview</CardTitle>
            <CardDescription>
              How your site might appear in Google search results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="text-sm text-green-700 mb-1">
                {typeof window !== "undefined" ? window.location.origin : "https://yoursite.com"}
              </div>
              <div className="text-xl text-blue-600 hover:underline cursor-pointer mb-1">
                {settings.site_title || "Your Site Title"}
              </div>
              <div className="text-sm text-gray-600 line-clamp-2">
                {settings.site_description || "Your site description will appear here..."}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SEOEditor;
