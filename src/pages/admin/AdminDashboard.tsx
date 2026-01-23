import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MessageSquare, Eye, Users } from "lucide-react";
import { Link } from "react-router-dom";
import AnalyticsWidgets from "@/components/admin/AnalyticsWidgets";

interface Stats {
  posts: number;
  contacts: number;
  testimonials: number;
  services: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    posts: 0,
    contacts: 0,
    testimonials: 0,
    services: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [posts, contacts, testimonials, services] = await Promise.all([
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
        supabase.from("contact_submissions").select("id", { count: "exact", head: true }).eq("is_read", false),
        supabase.from("testimonials").select("id", { count: "exact", head: true }),
        supabase.from("services").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        posts: posts.count || 0,
        contacts: contacts.count || 0,
        testimonials: testimonials.count || 0,
        services: services.count || 0,
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Blog Posts",
      value: stats.posts,
      icon: FileText,
      href: "/admin/blog",
      color: "text-primary",
    },
    {
      title: "Unread Messages",
      value: stats.contacts,
      icon: MessageSquare,
      href: "/admin/contacts",
      color: "text-accent",
    },
    {
      title: "Testimonials",
      value: stats.testimonials,
      icon: Users,
      href: "/admin/testimonials",
      color: "text-secondary",
    },
    {
      title: "Services",
      value: stats.services,
      icon: Eye,
      href: "/admin/services",
      color: "text-primary",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-admin-heading font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to your admin panel</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} to={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? "..." : stat.value}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Analytics Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-admin-heading font-bold text-foreground">Site Analytics</h2>
        <AnalyticsWidgets />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              to="/admin/blog/new"
              className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              <span className="font-medium">Create New Blog Post</span>
              <p className="text-sm text-muted-foreground">Write and publish a new article</p>
            </Link>
            <Link
              to="/admin/hero"
              className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              <span className="font-medium">Edit Hero Section</span>
              <p className="text-sm text-muted-foreground">Update your homepage headline</p>
            </Link>
            <Link
              to="/admin/contacts"
              className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              <span className="font-medium">View Messages</span>
              <p className="text-sm text-muted-foreground">Check contact form submissions</p>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Website Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              <span className="font-medium">View Homepage</span>
              <p className="text-sm text-muted-foreground">See your live website</p>
            </a>
            <a
              href="/blog"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              <span className="font-medium">View Blog</span>
              <p className="text-sm text-muted-foreground">Browse published articles</p>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
