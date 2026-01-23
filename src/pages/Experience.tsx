import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Experience {
  id: string;
  title: string;
  title_link: string | null;
  company: string | null;
  description: string | null;
  highlights: string[];
  start_date: string | null;
  end_date: string | null;
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

// Parse markdown-style links: [text](url) -> <a href="url">text</a>
const parseLinks = (text: string): React.ReactNode => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    // Add the link
    parts.push(
      <a
        key={match.index}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        {match[1]}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

// Format date to "Feb 2024" format
const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

// Get date range string
const getDateRange = (startDate: string | null, endDate: string | null, isCurrent: boolean): string => {
  const start = formatDate(startDate);
  const end = isCurrent ? "Present" : formatDate(endDate);
  
  if (!start && !end) return "";
  if (!start) return end;
  if (!end) return start;
  
  return `${start} – ${end}`;
};

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

      {/* Experience Cards */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="grid gap-6 md:gap-8">
            {experiences.map((exp, index) => {
              const dateRange = getDateRange(exp.start_date, exp.end_date, exp.is_current);

              return (
                <div
                  key={exp.id}
                  className="group bg-card rounded-xl border border-border p-6 md:p-8 lg:p-10 shadow-sm hover:shadow-card transition-shadow duration-300 animate-fade-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-6 md:gap-10">
                    {/* Left Column - Date, Title, Company */}
                    <div className="space-y-2">
                      {dateRange && (
                        <p className="text-sm text-muted-foreground">
                          {dateRange}
                        </p>
                      )}
                      <h2 className="text-2xl md:text-3xl font-display text-foreground leading-tight">
                        {exp.title_link ? (
                          <a
                            href={exp.title_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors"
                          >
                            {exp.title}
                          </a>
                        ) : (
                          exp.title
                        )}
                      </h2>
                      {exp.company && (
                        <p className="text-base text-muted-foreground">
                          {exp.company}
                        </p>
                      )}
                    </div>

                    {/* Right Column - Bullet Points */}
                    <div className="space-y-4">
                      {exp.highlights && exp.highlights.length > 0 && (
                        <ul className="space-y-3">
                          {exp.highlights.map((highlight, idx) => (
                            <li 
                              key={idx}
                              className="flex items-start gap-3 text-foreground"
                            >
                              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                              <span className="text-base leading-relaxed">
                                {parseLinks(highlight)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                      
                      {exp.description && !exp.highlights?.length && (
                        <p className="text-base text-muted-foreground leading-relaxed">
                          {parseLinks(exp.description)}
                        </p>
                      )}
                    </div>
                  </div>
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
