import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";

interface FooterContent {
  id: string;
  brand_description: string | null;
  copyright_text: string | null;
  bottom_tagline: string | null;
}

interface FooterLink {
  id: string;
  label: string;
  href: string;
  sort_order: number | null;
  is_active: boolean | null;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  sort_order: number | null;
  is_active: boolean | null;
}

const ICON_OPTIONS = [
  "twitter", "linkedin", "github", "mail", "instagram", "facebook", 
  "youtube", "twitch", "discord", "globe", "phone", "link"
];

const FooterEditor = () => {
  const [content, setContent] = useState<FooterContent | null>(null);
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const [contentRes, linksRes, socialRes] = await Promise.all([
      supabase.from("footer_content").select("*").maybeSingle(),
      supabase.from("footer_links").select("*").order("sort_order"),
      supabase.from("social_links").select("*").order("sort_order"),
    ]);

    setContent(contentRes.data);
    setFooterLinks(linksRes.data || []);
    setSocialLinks(socialRes.data || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!content) return;

    setSaving(true);

    // Update footer content
    const { error: contentError } = await supabase
      .from("footer_content")
      .update({
        brand_description: content.brand_description,
        copyright_text: content.copyright_text,
        bottom_tagline: content.bottom_tagline,
      })
      .eq("id", content.id);

    if (contentError) {
      toast({ title: "Error", description: "Failed to save footer content", variant: "destructive" });
      setSaving(false);
      return;
    }

    // Update footer links
    for (const link of footerLinks) {
      await supabase
        .from("footer_links")
        .update({
          label: link.label,
          href: link.href,
          sort_order: link.sort_order,
          is_active: link.is_active,
        })
        .eq("id", link.id);
    }

    // Update social links
    for (const social of socialLinks) {
      await supabase
        .from("social_links")
        .update({
          platform: social.platform,
          url: social.url,
          icon: social.icon,
          sort_order: social.sort_order,
          is_active: social.is_active,
        })
        .eq("id", social.id);
    }

    toast({ title: "Saved", description: "Footer updated successfully" });
    setSaving(false);
  };

  const addFooterLink = async () => {
    const { data, error } = await supabase
      .from("footer_links")
      .insert({ label: "New Link", href: "/", sort_order: footerLinks.length })
      .select()
      .single();

    if (data) {
      setFooterLinks([...footerLinks, data]);
    }
  };

  const deleteFooterLink = async (id: string) => {
    await supabase.from("footer_links").delete().eq("id", id);
    setFooterLinks(footerLinks.filter((l) => l.id !== id));
  };

  const addSocialLink = async () => {
    const { data, error } = await supabase
      .from("social_links")
      .insert({ platform: "New Platform", url: "https://", icon: "link", sort_order: socialLinks.length })
      .select()
      .single();

    if (data) {
      setSocialLinks([...socialLinks, data]);
    }
  };

  const deleteSocialLink = async (id: string) => {
    await supabase.from("social_links").delete().eq("id", id);
    setSocialLinks(socialLinks.filter((s) => s.id !== id));
  };

  const updateFooterLink = (id: string, field: keyof FooterLink, value: any) => {
    setFooterLinks(footerLinks.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const updateSocialLink = (id: string, field: keyof SocialLink, value: any) => {
    setSocialLinks(socialLinks.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
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
        <p className="text-muted-foreground">No footer content found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-admin-heading font-bold text-foreground">Footer</h1>
          <p className="text-muted-foreground mt-1">Edit footer content, links, and social icons</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brand Section */}
        <Card>
          <CardHeader>
            <CardTitle>Brand Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brand_description">Description</Label>
              <Textarea
                id="brand_description"
                value={content.brand_description || ""}
                onChange={(e) => setContent({ ...content, brand_description: e.target.value })}
                rows={3}
                placeholder="Short description about you/your brand"
              />
            </div>
          </CardContent>
        </Card>

        {/* Copyright Section */}
        <Card>
          <CardHeader>
            <CardTitle>Copyright & Tagline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="copyright_text">Copyright Text</Label>
              <Input
                id="copyright_text"
                value={content.copyright_text || ""}
                onChange={(e) => setContent({ ...content, copyright_text: e.target.value })}
                placeholder="Use {year} for current year"
              />
              <p className="text-xs text-muted-foreground">Use {"{year}"} to auto-insert current year</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bottom_tagline">Bottom Tagline</Label>
              <Input
                id="bottom_tagline"
                value={content.bottom_tagline || ""}
                onChange={(e) => setContent({ ...content, bottom_tagline: e.target.value })}
                placeholder="e.g., Built with passion & coffee ☕"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Quick Links</CardTitle>
            <Button size="sm" variant="outline" onClick={addFooterLink}>
              <Plus size={16} className="mr-1" /> Add Link
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {footerLinks.map((link, index) => (
              <div key={link.id} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <GripVertical size={16} className="text-muted-foreground" />
                <Input
                  value={link.label}
                  onChange={(e) => updateFooterLink(link.id, "label", e.target.value)}
                  placeholder="Label"
                  className="flex-1"
                />
                <Input
                  value={link.href}
                  onChange={(e) => updateFooterLink(link.id, "href", e.target.value)}
                  placeholder="Link"
                  className="flex-1"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteFooterLink(link.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            {footerLinks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No quick links yet</p>
            )}
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Social Links</CardTitle>
            <Button size="sm" variant="outline" onClick={addSocialLink}>
              <Plus size={16} className="mr-1" /> Add Social
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {socialLinks.map((social) => (
              <div key={social.id} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <GripVertical size={16} className="text-muted-foreground" />
                <Input
                  value={social.platform}
                  onChange={(e) => updateSocialLink(social.id, "platform", e.target.value)}
                  placeholder="Platform"
                  className="w-28"
                />
                <select
                  value={social.icon}
                  onChange={(e) => updateSocialLink(social.id, "icon", e.target.value)}
                  className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {ICON_OPTIONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
                <Input
                  value={social.url}
                  onChange={(e) => updateSocialLink(social.id, "url", e.target.value)}
                  placeholder="URL"
                  className="flex-1"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteSocialLink(social.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            {socialLinks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No social links yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FooterEditor;
