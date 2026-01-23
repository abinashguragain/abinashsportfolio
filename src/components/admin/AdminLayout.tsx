import { useState, useEffect } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  LayoutDashboard,
  FileText,
  Image,
  Users,
  LogOut,
  Menu,
  X,
  MessageSquare,
  Briefcase,
  Navigation,
  MousePointerClick,
  PanelBottom,
  UserPen,
  FolderOpen,
  BarChart3,
  FileSpreadsheet,
  ChevronDown,
  Shield,
  Search,
  Globe,
} from "lucide-react";

import { LucideIcon } from "lucide-react";

interface MenuGroup {
  label: string;
  items: {
    href: string;
    label: string;
    icon: LucideIcon;
    badge?: number;
  }[];
}

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Content", "Blog", "Engagement", "Settings"]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const { signOut, user } = useAuth();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from("contact_submissions")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false);
      setUnreadCount(count || 0);
    };
    fetchUnreadCount();
  }, []);

  const menuGroups: MenuGroup[] = [
    {
      label: "Content",
      items: [
        { href: "/admin/hero", label: "Hero Section", icon: Image },
        { href: "/admin/about", label: "About", icon: Users },
        { href: "/admin/experience", label: "Experience", icon: Briefcase },
        { href: "/admin/services", label: "Services", icon: Briefcase },
        { href: "/admin/cta", label: "CTA Section", icon: MousePointerClick },
        { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquare },
        { href: "/admin/footer", label: "Footer", icon: PanelBottom },
      ],
    },
    {
      label: "Blog",
      items: [
        { href: "/admin/blog", label: "Posts", icon: FileText },
        { href: "/admin/categories", label: "Categories", icon: FolderOpen },
        { href: "/admin/authors", label: "Authors", icon: UserPen },
      ],
    },
    {
      label: "Engagement",
      items: [
        { href: "/admin/contacts", label: "Messages", icon: MessageSquare, badge: unreadCount },
        { href: "/admin/google-sheets", label: "Google Sheets", icon: FileSpreadsheet },
      ],
    },
    {
      label: "Settings",
      items: [
        { href: "/admin/seo", label: "SEO Settings", icon: Globe },
        { href: "/admin/integrations", label: "Analytics", icon: BarChart3 },
        { href: "/admin/activity-logs", label: "Activity Logs", icon: Shield },
      ],
    },
  ];

  const standaloneLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/navigation", label: "Navigation", icon: Navigation },
  ];

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background font-admin-sans">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <span className="font-admin-display text-xl font-semibold">Admin</span>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-foreground"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-40 transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-border">
            <Link to="/" className="font-admin-display text-xl font-semibold text-foreground">
              Admin Panel
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 overflow-y-auto">
            {/* Standalone links */}
            {standaloneLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}

            {/* Grouped links */}
            {menuGroups.map((group) => (
              <Collapsible
                key={group.label}
                open={expandedGroups.includes(group.label)}
                onOpenChange={() => toggleGroup(group.label)}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full px-6 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <span>{group.label}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      expandedGroups.includes(group.label) ? "rotate-180" : ""
                    }`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {group.items.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center justify-between gap-3 pl-10 pr-6 py-2.5 text-sm transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary border-r-2 border-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon size={16} />
                          {link.label}
                        </span>
                        {link.badge !== undefined && link.badge > 0 && (
                          <Badge variant="destructive" className="text-xs h-5 min-w-5 flex items-center justify-center">
                            {link.badge}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="text-xs text-muted-foreground mb-3 truncate">
              {user?.email}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="w-full justify-start gap-2"
            >
              <LogOut size={16} />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
