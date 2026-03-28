import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface NavLink {
  id: string;
  label: string;
  href: string;
  sort_order: number;
}

interface NavigationSettings {
  site_name: string;
  site_name_accent: string | null;
  logo_url: string | null;
}

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);
  const [settings, setSettings] = useState<NavigationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchNavigation = async () => {
      const [linksResult, settingsResult] = await Promise.all([
        supabase.from("nav_links").select("*").order("sort_order"),
        supabase.from("navigation_settings").select("*").single(),
      ]);

      if (linksResult.data) {
        setNavLinks(linksResult.data);
      }

      if (settingsResult.data) {
        setSettings(settingsResult.data);
      }
      setIsLoading(false);
    };

    fetchNavigation();
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border shadow-sm">
      <nav className="container-wide">
        <div className="flex items-center justify-between h-12 md:h-14">
          {/* Logo */}
          <Link 
            to="/" 
            className="font-display text-2xl md:text-3xl tracking-wide text-foreground hover:text-primary transition-colors min-h-[2rem] md:min-h-[2.5rem] flex items-center"
          >
            {isLoading ? (
              <span className="h-8 md:h-10 w-24 bg-muted/50 animate-pulse rounded" />
            ) : settings?.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="h-8 md:h-10" />
            ) : (
              <>
                {settings?.site_name || ""}
                <span className="text-accent">{settings?.site_name_accent || ""}</span>
              </>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                to={link.href}
                className={`text-sm font-medium transition-colors link-underline ${
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Button variant="hero" size="sm" asChild>
              <Link to="/contact">Let's Talk</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-base font-medium py-2 transition-colors ${
                    location.pathname === link.href
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Button variant="hero" size="default" asChild className="mt-2">
                <Link to="/contact" onClick={() => setIsOpen(false)}>
                  Let's Talk
                </Link>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
