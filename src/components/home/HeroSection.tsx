import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import avatarImage from "@/assets/avatar.png";

interface HeroContent {
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  badge_title: string | null;
  badge_subtitle: string | null;
}

export const HeroSection = () => {
  const [content, setContent] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHero = async () => {
      const { data } = await supabase
        .from("hero_content")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();

      setContent(data);
      setLoading(false);
    };
    fetchHero();
  }, []);

  if (loading) {
    return (
      <section className="relative section-padding bg-gradient-hero overflow-hidden min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </section>
    );
  }

  // Fallback to default content if no database content
  const title = content?.title || "WORDS THAT MOVE PEOPLE";
  const subtitle = content?.subtitle || "Content Writer & Storyteller";
  const description = content?.description || "I craft compelling content that connects with audiences, drives engagement, and tells stories worth sharing. Let's create something memorable together.";
  const ctaText = content?.cta_text || "Get in Touch";
  const ctaLink = content?.cta_link || "/contact";
  const imageUrl = content?.image_url || avatarImage;
  const badgeTitle = content?.badge_title || "5+ Years";
  const badgeSubtitle = content?.badge_subtitle || "Writing Experience";

  return (
    <section className="relative section-padding bg-gradient-hero overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="container-wide relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1 space-y-6 md:space-y-8">
            <div className="space-y-4">
              <p className="text-sm md:text-base font-semibold text-secondary uppercase tracking-wider animate-fade-up opacity-0" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
                {subtitle}
              </p>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground leading-[0.95] animate-fade-up opacity-0" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
                {title.includes("MOVE") ? (
                  <>
                    {title.split("MOVE")[0]}
                    <br />
                    <span className="text-gradient">MOVE{title.split("MOVE")[1]}</span>
                  </>
                ) : (
                  <span className="text-gradient">{title}</span>
                )}
              </h1>
            </div>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg animate-fade-up opacity-0" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
              {description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-up opacity-0" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
              <Button variant="hero" size="lg" asChild>
                <Link to={ctaLink}>
                  {ctaText}
                  <ArrowRight size={20} />
                </Link>
              </Button>
              <Button variant="heroOutline" size="lg" asChild>
                <Link to="/blog">Read My Blog</Link>
              </Button>
            </div>
          </div>
          
          {/* Avatar */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end animate-fade-up opacity-0" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            <div className="relative">
              {/* Decorative borders */}
              <div className="absolute -inset-4 border-2 border-primary/20 rounded-full" />
              <div className="absolute -inset-8 border border-secondary/10 rounded-full" />
              
              {/* Image container */}
              <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-4 border-primary/30">
                <img
                  src={imageUrl}
                  alt="Content Writer - Professional Avatar"
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 bg-card shadow-card rounded-lg px-4 py-2 border border-border animate-float">
                <p className="text-sm font-semibold text-foreground">{badgeTitle}</p>
                <p className="text-xs text-muted-foreground">{badgeSubtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
