import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, TestTube2, FileSpreadsheet, CheckCircle2, XCircle } from "lucide-react";

interface GoogleSheetsConfig {
  id: string;
  spreadsheet_id: string | null;
  sheet_name: string;
  service_account_credentials: string | null;
  is_enabled: boolean;
}

const GoogleSheetsEditor = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const [config, setConfig] = useState<GoogleSheetsConfig>({
    id: "",
    spreadsheet_id: "",
    sheet_name: "Sheet1",
    service_account_credentials: "",
    is_enabled: false,
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("google_sheets_config")
        .select("*")
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setConfig({
          id: data.id,
          spreadsheet_id: data.spreadsheet_id || "",
          sheet_name: data.sheet_name || "Sheet1",
          service_account_credentials: data.service_account_credentials || "",
          is_enabled: data.is_enabled || false,
        });
      }
    } catch (error) {
      console.error("Error fetching config:", error);
      toast({
        title: "Error",
        description: "Failed to load Google Sheets configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setTestResult(null);

    try {
      // Validate JSON if credentials provided
      if (config.service_account_credentials) {
        try {
          JSON.parse(config.service_account_credentials);
        } catch {
          toast({
            title: "Invalid JSON",
            description: "Service account credentials must be valid JSON",
            variant: "destructive",
          });
          setSaving(false);
          return;
        }
      }

      const { error } = await supabase
        .from("google_sheets_config")
        .update({
          spreadsheet_id: config.spreadsheet_id || null,
          sheet_name: config.sheet_name || "Sheet1",
          service_account_credentials: config.service_account_credentials || null,
          is_enabled: config.is_enabled,
        })
        .eq("id", config.id);

      if (error) throw error;

      toast({
        title: "Saved",
        description: "Google Sheets configuration updated successfully",
      });
    } catch (error) {
      console.error("Error saving config:", error);
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      // Validate required fields
      if (!config.spreadsheet_id || !config.service_account_credentials) {
        setTestResult({
          success: false,
          message: "Please fill in spreadsheet ID and service account credentials first",
        });
        setTesting(false);
        return;
      }

      // Save config first
      await handleSave();

      // Test the connection
      const { data, error } = await supabase.functions.invoke("log-to-sheets", {
        body: {
          formData: {},
          sourceUrl: window.location.href,
          testConnection: true,
        },
      });

      if (error) throw error;

      if (data.success) {
        setTestResult({
          success: true,
          message: "Connection successful! The service account can access the spreadsheet.",
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || "Connection failed",
        });
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : "Connection test failed",
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6" />
          Google Sheets Integration
        </h1>
        <p className="text-muted-foreground mt-1">
          Log contact form submissions to a Google Sheet automatically
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            Connect your Google Sheets service account to enable form logging
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Integration</Label>
              <p className="text-sm text-muted-foreground">
                When enabled, form submissions will be logged to Google Sheets
              </p>
            </div>
            <Switch
              checked={config.is_enabled}
              onCheckedChange={(checked) => setConfig({ ...config, is_enabled: checked })}
            />
          </div>

          {/* Spreadsheet ID */}
          <div className="space-y-2">
            <Label htmlFor="spreadsheet_id">Spreadsheet ID</Label>
            <Input
              id="spreadsheet_id"
              placeholder="e.g., 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
              value={config.spreadsheet_id || ""}
              onChange={(e) => setConfig({ ...config, spreadsheet_id: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Find this in your Google Sheets URL: docs.google.com/spreadsheets/d/<strong>[SPREADSHEET_ID]</strong>/edit
            </p>
          </div>

          {/* Sheet Name */}
          <div className="space-y-2">
            <Label htmlFor="sheet_name">Sheet Name</Label>
            <Input
              id="sheet_name"
              placeholder="Sheet1"
              value={config.sheet_name}
              onChange={(e) => setConfig({ ...config, sheet_name: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              The name of the tab/sheet within the spreadsheet (default: Sheet1)
            </p>
          </div>

          {/* Service Account Credentials */}
          <div className="space-y-2">
            <Label htmlFor="credentials">Service Account Credentials (JSON)</Label>
            <Textarea
              id="credentials"
              placeholder='{"type": "service_account", "project_id": "...", ...}'
              value={config.service_account_credentials || ""}
              onChange={(e) => setConfig({ ...config, service_account_credentials: e.target.value })}
              rows={8}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Paste the entire JSON key file contents from your Google Cloud service account.
              Make sure to share your spreadsheet with the service account email.
            </p>
          </div>

          {/* Test Result */}
          {testResult && (
            <div
              className={`flex items-center gap-2 p-4 rounded-lg ${
                testResult.success ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <span className="text-sm">{testResult.message}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Configuration
            </Button>
            <Button variant="outline" onClick={handleTestConnection} disabled={testing}>
              {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <TestTube2 className="h-4 w-4 mr-2" />}
              Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
            <li>
              <strong className="text-foreground">Create a Google Cloud Project</strong>
              <p className="ml-5 mt-1">
                Go to{" "}
                <a
                  href="https://console.cloud.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Google Cloud Console
                </a>{" "}
                and create a new project or select an existing one.
              </p>
            </li>
            <li>
              <strong className="text-foreground">Enable Google Sheets API</strong>
              <p className="ml-5 mt-1">
                In your project, go to APIs & Services → Enable APIs → Search for "Google Sheets API" and enable it.
              </p>
            </li>
            <li>
              <strong className="text-foreground">Create a Service Account</strong>
              <p className="ml-5 mt-1">
                Go to IAM & Admin → Service Accounts → Create Service Account. Give it a name and create.
              </p>
            </li>
            <li>
              <strong className="text-foreground">Generate JSON Key</strong>
              <p className="ml-5 mt-1">
                Click on your service account → Keys → Add Key → Create new key → JSON. Download the file.
              </p>
            </li>
            <li>
              <strong className="text-foreground">Share Your Spreadsheet</strong>
              <p className="ml-5 mt-1">
                Open your Google Sheet, click Share, and add the service account email (found in the JSON as "client_email") with Editor access.
              </p>
            </li>
            <li>
              <strong className="text-foreground">Configure Above</strong>
              <p className="ml-5 mt-1">
                Paste the spreadsheet ID, sheet name, and the entire JSON key contents above, then test the connection.
              </p>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleSheetsEditor;
