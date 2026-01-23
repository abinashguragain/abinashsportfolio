import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Service {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

const ServicesEditor = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const { data } = await supabase
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true });

    if (data) {
      setServices(data);
    }
    setLoading(false);
  };

  const handleSave = async (service: Service) => {
    setSaving(true);
    
    if (service.id.startsWith("new-")) {
      const { error } = await supabase.from("services").insert({
        title: service.title,
        description: service.description,
        icon: service.icon,
        sort_order: service.sort_order,
        is_active: service.is_active,
      });

      if (error) {
        toast({ title: "Error", description: "Failed to create service", variant: "destructive" });
      } else {
        toast({ title: "Created", description: "Service added successfully" });
        fetchServices();
      }
    } else {
      const { error } = await supabase
        .from("services")
        .update({
          title: service.title,
          description: service.description,
          icon: service.icon,
          is_active: service.is_active,
        })
        .eq("id", service.id);

      if (error) {
        toast({ title: "Error", description: "Failed to update service", variant: "destructive" });
      } else {
        toast({ title: "Saved", description: "Service updated successfully" });
        fetchServices();
      }
    }

    setSaving(false);
    setIsDialogOpen(false);
    setEditingService(null);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("services").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete service", variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Service removed" });
      fetchServices();
    }
  };

  const handleAddNew = () => {
    setEditingService({
      id: `new-${Date.now()}`,
      title: "",
      description: "",
      icon: "",
      sort_order: services.length,
      is_active: true,
    });
    setIsDialogOpen(true);
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
          <h1 className="text-3xl font-admin-heading font-bold text-foreground">Services</h1>
          <p className="text-muted-foreground mt-1">Manage your services/skills</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <Card key={service.id} className={!service.is_active ? "opacity-50" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{service.title}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingService(service);
                      setIsDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => handleDelete(service.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {service.description}
              </p>
              {service.icon && (
                <p className="text-xs text-muted-foreground mt-2">Icon: {service.icon}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingService?.id.startsWith("new-") ? "Add Service" : "Edit Service"}
            </DialogTitle>
          </DialogHeader>
          {editingService && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editingService.title}
                  onChange={(e) =>
                    setEditingService({ ...editingService, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingService.description || ""}
                  onChange={(e) =>
                    setEditingService({ ...editingService, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Icon (Lucide icon name)</Label>
                <Input
                  value={editingService.icon || ""}
                  onChange={(e) =>
                    setEditingService({ ...editingService, icon: e.target.value })
                  }
                  placeholder="e.g., Code, Palette, Globe"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingService.is_active}
                  onCheckedChange={(checked) =>
                    setEditingService({ ...editingService, is_active: checked })
                  }
                />
                <Label>Active</Label>
              </div>
              <Button
                onClick={() => handleSave(editingService)}
                disabled={saving || !editingService.title}
                className="w-full"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesEditor;
