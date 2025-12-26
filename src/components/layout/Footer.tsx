import { Link } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import type { LucideProps } from "lucide-react";

interface FooterContent {
  brand_description: string | null;
  copyright_text: string | null;
  bottom_tagline: string | null;
}

interface FooterLink {
  id: string;
  label: string;
  href: string;
  sort_order: number | null;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  sort_order: number | null;
}

interface NavSettings {
  site_name: string;
  site_name_accent: string | null;
}

// Dynamic icon component
interface IconProps extends Omit<LucideProps, 'ref'> {
  name: string;
}

const Icon = ({ name, ...props }: IconProps) => {
  const iconName = name.toLowerCase() as keyof typeof dynamicIconImports;
  
  if (!dynamicIconImports[iconName]) {
    const FallbackIcon = lazy(dynamicIconImports['link']);
    return (
      <Suspense fallback={<div className="w-5 h-5" />}>
        <FallbackIcon {...props} />
      </Suspense>
    );
  }
  
  const LucideIcon = lazy(dynamicIconImports[iconName]);
  
  return (
    <Suspense fallback={<div className="w-5 h-5" />}>
      <LucideIcon {...props} />
    </Suspense>
  );
};

export const Footer = () => {
  const [footerContent, setFooterContent] = useState<FooterContent | null>(null);
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [navSettings, setNavSettings] = useState<NavSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [contentRes, linksRes, socialRes, navRes] = await Promise.all([
        supabase.from("footer_content").select("*").maybeSingle(),
        supabase.from("footer_links").select("*").eq("is_active", true).order("sort_order"),
        supabase.from("social_links").select("*").eq("is_active", true).order("sort_order"),
        supabase.from("navigation_settings").select("site_name, site_name_accent").maybeSingle(),
      ]);

      setFooterContent(contentRes.data);
      setFooterLinks(linksRes.data || []);
      setSocialLinks(socialRes.data || []);
      setNavSettings(navRes.data);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <footer className="bg-card border-t border-border py-12 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </footer>
    );
  }

  const brandDescription = footerContent?.brand_description || "Content writer & storyteller. Crafting words that connect, engage, and inspire action.";
  const copyrightText = (footerContent?.copyright_text || "© {year} Your Name. All rights reserved.")
    .replace("{year}", new Date().getFullYear().toString());
  const bottomTagline = footerContent?.bottom_tagline || "Built with passion & coffee ☕";
  const siteName = navSettings?.site_name || "YOUR";
  const siteNameAccent = navSettings?.site_name_accent || "NAME";

  return (
    <footer className="bg-card border-t border-border">
      <div className="container-wide py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link 
              to="/" 
              className="font-display text-2xl tracking-wide text-foreground"
            >
              {siteName}<span className="text-primary">{siteNameAccent}</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs">
              {brandDescription}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display text-lg text-foreground">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.id}
                  to={link.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h4 className="font-display text-lg text-foreground">Connect</h4>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  aria-label={social.platform}
                >
                  <Icon name={social.icon} size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {copyrightText}
          </p>
          <p className="text-sm text-muted-foreground">
            {bottomTagline}
          </p>
        </div>
      </div>
    </footer>
  );
};
