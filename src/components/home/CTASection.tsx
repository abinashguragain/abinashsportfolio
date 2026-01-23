import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { renderTextWithLinks } from "@/lib/parseLinks";

interface CTAContent {
  title: string;
  highlight_word: string | null;
  description: string | null;
  button_text: string | null;
  button_link: string | null;
  is_active: boolean | null;
}

export const CTASection = () => {
  const [content, setContent] = useState<CTAContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCTA = async () => {
      const { data } = await supabase
        .from("cta_content")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();

      setContent(data);
      setLoading(false);
    };
    fetchCTA();
  }, []);

  if (loading) {
    return null;
  }

  // Hide section if not active
  if (!content?.is_active) {
    return null;
  }

  const title = content?.title || "LET'S CREATE TOGETHER";
  const highlightWord = content?.highlight_word || "TOGETHER";
  const description = content?.description || "Have a project in mind? I'd love to hear about it. Let's discuss how we can bring your content vision to life.";
  const buttonText = content?.button_text || "Start a Conversation";
  const buttonLink = content?.button_link || "/contact";

  // Split title by highlight word to render it with gradient
  const renderTitle = () => {
    if (highlightWord && title.includes(highlightWord)) {
      const parts = title.split(highlightWord);
      return (
        <>
          {parts[0]}<span className="text-gradient">{highlightWord}</span>{parts[1] || ""}
        </>
      );
    }
    return title;
  };

  return (
    <section className="section-padding bg-gradient-hero relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="container-narrow relative text-center">
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
          {renderTitle()}
        </h2>
        <p 
          className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-8"
          dangerouslySetInnerHTML={renderTextWithLinks(description)}
        />
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero" size="lg" asChild>
            <Link to={buttonLink}>
              {buttonText}
              <ArrowRight size={20} />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
