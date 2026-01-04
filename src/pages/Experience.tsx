import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Briefcase, FileSpreadsheet, GraduationCap, TrendingUp, ArrowRight, Zap, PenTool, Target, Lightbulb, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase,
  FileSpreadsheet,
  GraduationCap,
  TrendingUp,
  PenTool,
  Target,
  Lightbulb,
  Users,
  Zap,
};

interface Experience {
  id: string;
  title: string;
  company: string | null;
  description: string | null;
  highlights: string[];
  icon: string;
  accent: string;
  is_current: boolean;
}

interface PageContent {
  id: string;
  title: string;
  highlight_word: string | null;
  subtitle: string | null;
  cta_title: string | null;
  cta_highlight_word: string | null;
  cta_description: string | null;
  cta_button_text: string | null;
  cta_button_link: string | null;
  cta_visible: boolean;
}

export default function Experience() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [expRes, contentRes] = await Promise.all([
        supabase
          .from("experiences")
          .select("*")
          .eq("is_active", true)
          .order("sort_order"),
        supabase
          .from("experience_page_content")
          .select("*")
          .single(),
      ]);

      if (expRes.data) {
        setExperiences(expRes.data as Experience[]);
      }
      if (contentRes.data) {
        setPageContent(contentRes.data);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const renderTitle = () => {
    if (!pageContent) return <>EXPERIENCE & <span className="text-primary">EXPERTISE</span></>;
    
    const { title, highlight_word } = pageContent;
    if (!highlight_word) return title;

    const parts = title.split(highlight_word);
    if (parts.length === 1) return title;

    return (
      <>
        {parts[0]}
        <span className="text-primary">{highlight_word}</span>
        {parts[1]}
      </>
    );
  };

  const renderCtaTitle = () => {
    if (!pageContent?.cta_title) return <>READY TO <span className="text-accent">COLLABORATE</span>?</>;
    
    const { cta_title, cta_highlight_word } = pageContent;
    if (!cta_highlight_word) return cta_title;

    const parts = cta_title.split(cta_highlight_word);
    if (parts.length === 1) return cta_title;

    return (
      <>
        {parts[0]}
        <span className="text-accent">{cta_highlight_word}</span>
        {parts[1]}
      </>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-gradient-hero relative overflow-hidden">
        {/* Metal-inspired background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            hsl(var(--foreground)) 0px,
            hsl(var(--foreground)) 1px,
            transparent 1px,
            transparent 40px
          )`
        }} />
        
        <div className="container-wide relative">
          <div className="max-w-3xl animate-fade-up">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              What I Bring to the Table
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display text-foreground mb-6 leading-tight">
              {renderTitle()}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {pageContent?.subtitle || "A blend of systematic thinking and creative problem-solving. I help businesses run smoother, work smarter, and grow faster."}
            </p>
          </div>
        </div>
      </section>

      {/* Experience Grid */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="grid gap-6 md:gap-8">
            {experiences.map((exp, index) => {
              const IconComponent = iconMap[exp.icon] || Briefcase;
              const isAccent = exp.accent === "primary";

              return (
                <div
                  key={exp.id}
                  className={`group relative rounded-lg border transition-all duration-300 hover:shadow-card overflow-hidden animate-fade-up ${
                    isAccent 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-card border-border hover:border-primary/30"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Current Focus badge */}
                  {exp.is_current && (
                    <div className="absolute top-4 right-4 md:top-6 md:right-6">
                      <span className="inline-flex items-center px-3 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-full uppercase tracking-wider">
                        Current Focus
                      </span>
                    </div>
                  )}
                  
                  <div className="p-6 md:p-8 lg:p-10">
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center ${
                        isAccent 
                          ? "bg-primary-foreground/20" 
                          : "bg-primary/10"
                      }`}>
                        <IconComponent className={`w-7 h-7 ${isAccent ? "text-primary-foreground" : "text-primary"}`} />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="mb-4">
                          {exp.company && (
                            <p className={`text-sm font-medium mb-1 ${
                              isAccent ? "text-primary-foreground/70" : "text-muted-foreground"
                            }`}>
                              {exp.company}
                            </p>
                          )}
                          <h2 className={`text-2xl md:text-3xl font-display ${
                            isAccent ? "text-primary-foreground" : "text-foreground"
                          }`}>
                            {exp.title}
                          </h2>
                        </div>
                        
                        {exp.description && (
                          <p className={`text-base md:text-lg mb-6 leading-relaxed ${
                            isAccent ? "text-primary-foreground/90" : "text-muted-foreground"
                          }`}>
                            {exp.description}
                          </p>
                        )}
                        
                        {/* Highlights */}
                        {exp.highlights && exp.highlights.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {exp.highlights.map((highlight, idx) => (
                              <div 
                                key={idx}
                                className={`flex items-center gap-2 text-sm ${
                                  isAccent ? "text-primary-foreground/80" : "text-foreground"
                                }`}
                              >
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                  isAccent ? "bg-primary-foreground" : "bg-accent"
                                }`} />
                                {highlight}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative bottom border on hover */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100 ${
                    isAccent ? "bg-primary-foreground/30" : "bg-accent"
                  }`} />
                </div>
              );
            })}

            {experiences.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No experiences to display yet.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {pageContent?.cta_visible !== false && (
        <section className="section-padding bg-gradient-metal">
          <div className="container-narrow text-center">
            <div className="animate-fade-up">
              <h2 className="text-3xl md:text-4xl font-display text-foreground mb-4">
                {renderCtaTitle()}
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                {pageContent?.cta_description || "Whether you need process optimization, automation solutions, or just want to chat about a project idea."}
              </p>
              <Button variant="hero" size="lg" asChild>
                <Link to={pageContent?.cta_button_link || "/contact"} className="group">
                  {pageContent?.cta_button_text || "Let's Talk"}
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
