import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAction } from "@/hooks/use-admin-action";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Plus,
  Trash2,
  Pencil,
  Globe,
  AlertTriangle,
  Tag,
} from "lucide-react";

type SnippetType = "gtm" | "meta_pixel";

interface Snippet {
  id: string;
  type: SnippetType;
  name: string;
  code: string;
  is_global: boolean;
  page_paths: string[];
  is_active: boolean;
  sort_order: number;
}

// Static list of known public routes. Admin can also type custom paths.
const KNOWN_ROUTES = [
  { path: "/", label: "Home" },
  { path: "/blog", label: "Blog list" },
  { path: "/blog/*", label: "All blog posts" },
  { path: "/contact", label: "Contact" },
  { path: "/experience", label: "Experience" },
  { path: "/testimonials", label: "Testimonials" },
];

const emptyForm = (type: SnippetType): Omit<Snippet, "id"> => ({
  type,
  name: "",
  code: "",
  is_global: type === "gtm",
  page_paths: [],
  is_active: true,
  sort_order: 0,
});

const TrackingEditor = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Snippet | null>(null);
  const [form, setForm] = useState<Omit<Snippet, "id">>(emptyForm("gtm"));
  const [customPath, setCustomPath] = useState("");
  const [saving, setSaving] = useState(false);
  const { executeAction } = useAdminAction();
  const { toast } = useToast();

  const fetchSnippets = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("tracking_snippets")
      .select("*")
      .order("type")
      .order("sort_order");
    if (data) setSnippets(data as Snippet[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchSnippets();
  }, []);

  const openNew = (type: SnippetType) => {
    setEditing(null);
    setForm(emptyForm(type));
    setCustomPath("");
    setDialogOpen(true);
  };

  const openEdit = (s: Snippet) => {
    setEditing(s);
    setForm({
      type: s.type,
      name: s.name,
      code: s.code,
      is_global: s.is_global,
      page_paths: s.page_paths || [],
      is_active: s.is_active,
      sort_order: s.sort_order,
    });
    setCustomPath("");
    setDialogOpen(true);
  };

  const togglePath = (path: string) => {
    setForm((f) => ({
      ...f,
      page_paths: f.page_paths.includes(path)
        ? f.page_paths.filter((p) => p !== path)
        : [...f.page_paths, path],
    }));
  };

  const addCustomPath = () => {
    const p = customPath.trim();
    if (!p) return;
    if (!p.startsWith("/")) {
      toast({
        title: "Invalid path",
        description: "Path must start with /",
        variant: "destructive",
      });
      return;
    }
    if (!form.page_paths.includes(p)) {
      setForm((f) => ({ ...f, page_paths: [...f.page_paths, p] }));
    }
    setCustomPath("");
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      toast({
        title: "Missing fields",
        description: "Name and code are required.",
        variant: "destructive",
      });
      return;
    }
    if (!form.is_global && form.page_paths.length === 0) {
      toast({
        title: "No pages selected",
        description:
          "Either enable 'Load on all pages' or pick at least one page.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const payload = {
      type: form.type,
      name: form.name.trim(),
      code: form.code,
      is_global: form.is_global,
      page_paths: form.is_global ? [] : form.page_paths,
      is_active: form.is_active,
      sort_order: form.sort_order,
    };

    const result = editing
      ? await executeAction({
          action: "update",
          table: "tracking_snippets",
          recordId: editing.id,
          data: payload,
        })
      : await executeAction({
          action: "insert",
          table: "tracking_snippets",
          data: payload,
        });

    setSaving(false);
    if (result.success) {
      toast({
        title: "Saved",
        description: `${form.type === "gtm" ? "GTM" : "Meta Pixel"} snippet saved.`,
      });
      setDialogOpen(false);
      fetchSnippets();
    }
  };

  const handleDelete = async (s: Snippet) => {
    if (!confirm(`Delete "${s.name}"?`)) return;
    const result = await executeAction({
      action: "delete",
      table: "tracking_snippets",
      recordId: s.id,
    });
    if (result.success) {
      toast({ title: "Deleted", description: `${s.name} removed.` });
      fetchSnippets();
    }
  };

  const handleToggleActive = async (s: Snippet) => {
    const result = await executeAction({
      action: "update",
      table: "tracking_snippets",
      recordId: s.id,
      data: { is_active: !s.is_active },
    });
    if (result.success) fetchSnippets();
  };

  const gtmSnippets = snippets.filter((s) => s.type === "gtm");
  const pixelSnippets = snippets.filter((s) => s.type === "meta_pixel");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderList = (
    items: Snippet[],
    type: SnippetType,
    title: string,
    description: string,
    placeholder: string
  ) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button onClick={() => openNew(type)} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No {title.toLowerCase()} configured yet. Click "Add" to paste{" "}
            {placeholder}.
          </p>
        ) : (
          items.map((s) => (
            <div
              key={s.id}
              className="border border-border rounded-lg p-4 flex items-start justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{s.name}</span>
                  {s.is_global ? (
                    <Badge variant="secondary" className="gap-1">
                      <Globe className="h-3 w-3" /> All pages
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <Tag className="h-3 w-3" /> {s.page_paths.length} page(s)
                    </Badge>
                  )}
                  {!s.is_active && <Badge variant="destructive">Disabled</Badge>}
                </div>
                {!s.is_global && s.page_paths.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {s.page_paths.join(", ")}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  checked={s.is_active}
                  onCheckedChange={() => handleToggleActive(s)}
                />
                <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(s)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-admin-heading font-bold text-foreground">
          Tag Manager & Pixels
        </h1>
        <p className="text-muted-foreground mt-1">
          Add Google Tag Manager containers and Meta Pixel snippets. Assign each
          to all pages or specific pages.
        </p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Snippets only load on public pages, never inside the admin panel. Any
          new page you create later will automatically inherit "all pages"
          snippets — no extra setup required.
        </AlertDescription>
      </Alert>

      {renderList(
        gtmSnippets,
        "gtm",
        "Google Tag Manager",
        "Paste your full GTM container snippet (both <script> and <noscript> blocks).",
        "your GTM container code"
      )}

      {renderList(
        pixelSnippets,
        "meta_pixel",
        "Meta Pixel",
        "Paste each Meta Pixel base code snippet. Multiple pixels can target different pages.",
        "your Meta Pixel base code"
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit" : "Add"}{" "}
              {form.type === "gtm" ? "GTM Container" : "Meta Pixel"}
            </DialogTitle>
            <DialogDescription>
              Paste the full snippet provided by{" "}
              {form.type === "gtm"
                ? "Google Tag Manager"
                : "Meta Events Manager"}
              .
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v: SnippetType) =>
                  setForm((f) => ({ ...f, type: v }))
                }
                disabled={!!editing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gtm">Google Tag Manager</SelectItem>
                  <SelectItem value="meta_pixel">Meta Pixel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder={
                  form.type === "gtm"
                    ? "Main GTM (GTM-XXXXXX)"
                    : "Marketing Pixel"
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Code Snippet</Label>
              <Textarea
                id="code"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                rows={10}
                className="font-mono text-xs"
                placeholder={
                  form.type === "gtm"
                    ? `<!-- Google Tag Manager -->\n<script>(function(w,d,s,l,i){...})(window,document,'script','dataLayer','GTM-XXXXXX');</script>\n<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXX" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`
                    : `<!-- Meta Pixel Code -->\n<script>!function(f,b,e,v,n,t,s)...fbq('init', 'YOUR_PIXEL_ID');fbq('track', 'PageView');</script>\n<noscript><img height="1" width="1" src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"/></noscript>`
                }
              />
            </div>

            <div className="flex items-center justify-between border border-border rounded-lg p-3">
              <div>
                <Label className="text-sm font-medium">Load on all pages</Label>
                <p className="text-xs text-muted-foreground">
                  Includes any future pages automatically.
                </p>
              </div>
              <Switch
                checked={form.is_global}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, is_global: v }))
                }
              />
            </div>

            {!form.is_global && (
              <div className="space-y-3 border border-border rounded-lg p-3">
                <Label className="text-sm font-medium">Assign to pages</Label>
                <div className="grid grid-cols-2 gap-2">
                  {KNOWN_ROUTES.map((r) => (
                    <label
                      key={r.path}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={form.page_paths.includes(r.path)}
                        onChange={() => togglePath(r.path)}
                      />
                      <span>
                        {r.label}{" "}
                        <span className="text-xs text-muted-foreground">
                          {r.path}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={customPath}
                    onChange={(e) => setCustomPath(e.target.value)}
                    placeholder="/custom-path or /section/*"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomPath();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addCustomPath}>
                    Add
                  </Button>
                </div>

                {form.page_paths.filter(
                  (p) => !KNOWN_ROUTES.some((r) => r.path === p)
                ).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {form.page_paths
                      .filter((p) => !KNOWN_ROUTES.some((r) => r.path === p))
                      .map((p) => (
                        <Badge
                          key={p}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => togglePath(p)}
                        >
                          {p} ✕
                        </Badge>
                      ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Use <code>/section/*</code> to match any sub-page (e.g.{" "}
                  <code>/blog/*</code> targets every blog post).
                </p>
              </div>
            )}

            <div className="flex items-center justify-between border border-border rounded-lg p-3">
              <div>
                <Label className="text-sm font-medium">Active</Label>
                <p className="text-xs text-muted-foreground">
                  Disable to keep configuration but stop loading.
                </p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, is_active: v }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrackingEditor;
