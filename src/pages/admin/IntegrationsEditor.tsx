import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle, Code, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Integration {
  id: string;
  key: string;
  value: string | null;
  is_active: boolean;
}

// Sanitize and validate Google Analytics script
const sanitizeGoogleAnalytics = (input: string): string | null => {
  if (!input || !input.trim()) return null;
  
  const trimmed = input.trim();
  
  // Must contain gtag or Google Analytics patterns
  const validPatterns = [
    /googletagmanager\.com\/gtag\/js/,
    /gtag\s*\(/,
    /google-analytics\.com\/analytics\.js/,
    /G-[A-Z0-9]+/,
    /UA-\d+-\d+/,
    /GT-[A-Z0-9]+/,
  ];
  
  const hasValidPattern = validPatterns.some(pattern => pattern.test(trimmed));
  if (!hasValidPattern) return null;
  
  // Block dangerous patterns
  const dangerousPatterns = [
    /on\w+\s*=/i,
    /javascript:/i,
    /eval\s*\(/i,
    /document\.cookie/i,
    /document\.write/i,
    /innerHTML/i,
    /outerHTML/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<link/i,
    /<style/i,
  ];
  
  if (dangerousPatterns.some(pattern => pattern.test(trimmed))) {
    return null;
  }
  
  return trimmed;
};

// Sanitize and validate Google Search Console meta tag
const sanitizeSearchConsole = (input: string): string | null => {
  if (!input || !input.trim()) return null;
  
  const trimmed = input.trim();
  
  // Extract the content value from meta tag
  const metaMatch = trimmed.match(/<meta\s+name=["']google-site-verification["']\s+content=["']([^"']+)["']\s*\/?>/i);
  
  if (metaMatch && metaMatch[1]) {
    // Validate the verification code format (alphanumeric and some special chars)
    const code = metaMatch[1];
    if (/^[a-zA-Z0-9_-]+$/.test(code)) {
      return `<meta name="google-site-verification" content="${code}" />`;
    }
  }
  
  // Also accept just the verification code
  if (/^[a-zA-Z0-9_-]{20,60}$/.test(trimmed)) {
    return `<meta name="google-site-verification" content="${trimmed}" />`;
  }
  
  return null;
};

const IntegrationsEditor = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gaCode, setGaCode] = useState("");
  const [gscCode, setGscCode] = useState("");
  const [gaActive, setGaActive] = useState(true);
  const [gscActive, setGscActive] = useState(true);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState("");
  const [validationErrors, setValidationErrors] = useState<{ ga?: string; gsc?: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    const [integrationsResult, siteSettingsResult] = await Promise.all([
      supabase.from("third_party_integrations").select("*"),
      supabase.from("site_settings").select("*").eq("key", "turnstile_site_key").single(),
    ]);

    if (integrationsResult.data) {
      setIntegrations(integrationsResult.data);
      const ga = integrationsResult.data.find(i => i.key === "google_analytics");
      const gsc = integrationsResult.data.find(i => i.key === "google_search_console");
      
      if (ga) {
        setGaCode(ga.value || "");
        setGaActive(ga.is_active);
      }
      if (gsc) {
        setGscCode(gsc.value || "");
        setGscActive(gsc.is_active);
      }
    }

    if (siteSettingsResult.data?.value) {
      setTurnstileSiteKey(siteSettingsResult.data.value);
    }

    setLoading(false);
  };

  const validateInputs = () => {
    const errors: { ga?: string; gsc?: string } = {};
    
    if (gaCode.trim()) {
      const sanitized = sanitizeGoogleAnalytics(gaCode);
      if (!sanitized) {
        errors.ga = "Invalid Google Analytics code. Please paste the complete GA4 script tag.";
      }
    }
    
    if (gscCode.trim()) {
      const sanitized = sanitizeSearchConsole(gscCode);
      if (!sanitized) {
        errors.gsc = "Invalid Search Console code. Please paste the meta tag or verification code.";
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateInputs()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    
    const gaIntegration = integrations.find(i => i.key === "google_analytics");
    const gscIntegration = integrations.find(i => i.key === "google_search_console");
    
    const sanitizedGa = gaCode.trim() ? sanitizeGoogleAnalytics(gaCode) : null;
    const sanitizedGsc = gscCode.trim() ? sanitizeSearchConsole(gscCode) : null;
    
    const updates = [];
    
    if (gaIntegration) {
      updates.push(
        supabase
          .from("third_party_integrations")
          .update({ value: sanitizedGa, is_active: gaActive })
          .eq("id", gaIntegration.id)
      );
    }
    
    if (gscIntegration) {
      updates.push(
        supabase
          .from("third_party_integrations")
          .update({ value: sanitizedGsc, is_active: gscActive })
          .eq("id", gscIntegration.id)
      );
    }

    // Save Turnstile site key
    updates.push(
      supabase
        .from("site_settings")
        .update({ value: turnstileSiteKey.trim() || null })
        .eq("key", "turnstile_site_key")
    );
    
    const results = await Promise.all(updates);
    const hasError = results.some(r => r.error);
    
    if (hasError) {
      toast({
        title: "Error",
        description: "Failed to save some integrations",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Saved & Activated",
        description: "Integration settings updated successfully.",
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-foreground">Analytics & SEO</h1>
          <p className="text-muted-foreground mt-1">Manage third-party integrations</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save & Activate
        </Button>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Changes may take a few minutes to reflect on your website. Scripts are only injected on public pages, not in the admin panel.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Code className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Google Analytics</CardTitle>
                  <CardDescription>Track website visitors and user behavior</CardDescription>
                </div>
              </div>
              <Switch
                checked={gaActive}
                onCheckedChange={setGaActive}
                aria-label="Enable Google Analytics"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ga_code">Google Analytics Code</Label>
              <Textarea
                id="ga_code"
                value={gaCode}
                onChange={(e) => {
                  setGaCode(e.target.value);
                  setValidationErrors(prev => ({ ...prev, ga: undefined }));
                }}
                rows={8}
                placeholder={`<!-- Example GA4 Code -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>`}
                className="font-mono text-sm"
              />
              {validationErrors.ga && (
                <p className="text-sm text-destructive">{validationErrors.ga}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Paste your complete Google Analytics 4 (GA4) tracking code including script tags.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Code className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Google Search Console</CardTitle>
                  <CardDescription>Verify site ownership for Google Search</CardDescription>
                </div>
              </div>
              <Switch
                checked={gscActive}
                onCheckedChange={setGscActive}
                aria-label="Enable Search Console Verification"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gsc_code">Search Console Verification Code</Label>
              <Textarea
                id="gsc_code"
                value={gscCode}
                onChange={(e) => {
                  setGscCode(e.target.value);
                  setValidationErrors(prev => ({ ...prev, gsc: undefined }));
                }}
                rows={3}
                placeholder={`<meta name="google-site-verification" content="your-verification-code" />`}
                className="font-mono text-sm"
              />
              {validationErrors.gsc && (
                <p className="text-sm text-destructive">{validationErrors.gsc}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Paste the meta tag from Google Search Console, or just the verification code.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Cloudflare Turnstile (CAPTCHA)</CardTitle>
                <CardDescription>Protect forms from spam with invisible CAPTCHA</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="turnstile_key">Site Key</Label>
              <Input
                id="turnstile_key"
                value={turnstileSiteKey}
                onChange={(e) => setTurnstileSiteKey(e.target.value)}
                placeholder="0x4AAAAAAA..."
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Get your site key from the{" "}
                <a
                  href="https://dash.cloudflare.com/?to=/:account/turnstile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Cloudflare Turnstile dashboard
                </a>
                . Leave empty to disable CAPTCHA on forms.
              </p>
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                The Secret Key must be configured separately in backend secrets. The Site Key (public) is stored here.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntegrationsEditor;