import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Check } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

const ContactsList = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    const { data } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setContacts(data);
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    await supabase.from("contact_submissions").update({ is_read: true }).eq("id", id);
    fetchContacts();
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-admin-heading font-bold">Messages</h1>
        <p className="text-muted-foreground mt-1">Contact form submissions</p>
      </div>

      <div className="space-y-3">
        {contacts.map((c) => (
          <Card key={c.id} className={!c.is_read ? "border-primary/50" : ""}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{c.name}</span>
                    {!c.is_read && <Badge>New</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{c.email}</p>
                  {c.subject && <p className="text-sm font-medium">{c.subject}</p>}
                  <p className="text-sm mt-2">{c.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">{new Date(c.created_at).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  {!c.is_read && (
                    <Button size="sm" variant="outline" onClick={() => markAsRead(c.id)}>
                      <Check className="h-4 w-4 mr-1" />Mark Read
                    </Button>
                  )}
                  <Button size="sm" variant="outline" asChild>
                    <a href={`mailto:${c.email}`}><Mail className="h-4 w-4" /></a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {contacts.length === 0 && <p className="text-center text-muted-foreground py-8">No messages yet</p>}
      </div>
    </div>
  );
};

export default ContactsList;
