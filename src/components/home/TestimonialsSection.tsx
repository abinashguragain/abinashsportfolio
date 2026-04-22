import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Quote, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { renderTextWithLinks } from "@/lib/parseLinks";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  content: string;
  avatar_url: string | null;
  name_link: string | null;
  company_link: string | null;
}

const defaultTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    role: "Marketing Director",
    company: "TechFlow Inc.",
    content: "Working with this writer transformed our content strategy. Our blog traffic increased by 340% in just six months. The storytelling approach made our technical content accessible and engaging.",
    avatar_url: null,
    name_link: null,
    company_link: null,
  },
  {
    id: "2",
    name: "James Chen",
    role: "Founder",
    company: "StartupLab",
    content: "Exceptional talent for capturing brand voice. Every piece felt authentic to our company while driving real results. Our conversion rates improved significantly after the website copy overhaul.",
    avatar_url: null,
    name_link: null,
    company_link: null,
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    role: "Head of Content",
    company: "MediaWorks",
    content: "A rare combination of creative flair and strategic thinking. Deadlines were always met, communication was excellent, and the quality consistently exceeded expectations. Highly recommended.",
    avatar_url: null,
    name_link: null,
    company_link: null,
  },
];

const LINE_CLAMP = 15;

// Render text into paragraphs by splitting on blank lines, falling back to
// sentence groups so long single-blob testimonials still get paragraph breaks.
const toParagraphs = (text: string): string[] => {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const explicit = trimmed.split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean);
  if (explicit.length > 1) return explicit;

  const sentences = trimmed.match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g) ?? [trimmed];
  const groups: string[] = [];
  for (let i = 0; i < sentences.length; i += 3) {
    groups.push(sentences.slice(i, i + 3).join(" ").trim());
  }
  return groups;
};

export const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data: homepageData } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .eq("show_on_homepage", true)
        .order("sort_order", { ascending: true })
        .limit(3);

      if (homepageData && homepageData.length > 0) {
        setTestimonials(homepageData.slice(0, 3));
      } else {
        const { data: latestData } = await supabase
          .from("testimonials")
          .select("*")
          .eq("is_active", true)
          .order("updated_at", { ascending: false })
          .limit(3);

        if (latestData && latestData.length > 0) {
          setTestimonials(latestData);
        } else {
          setTestimonials(defaultTestimonials);
        }
      }
      setLoading(false);
    };
    fetchTestimonials();
  }, []);

  // Collapse when clicking outside the testimonials grid
  useEffect(() => {
    if (!expandedId) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpandedId(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [expandedId]);

  if (loading) {
    return (
      <section className="section-padding bg-card">
        <div className="container-wide flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  const anyExpanded = expandedId !== null;

  return (
    <section className="section-padding bg-card">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 md:mb-16">
          <div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
              KIND <span className="text-gradient">WORDS</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              What clients and collaborators say about working with me.
            </p>
          </div>
          <Button variant="outline" asChild className="w-fit">
            <Link to="/testimonials">
              View All Testimonials
              <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
        
        <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {testimonials.map((testimonial, index) => {
            const paragraphs = toParagraphs(testimonial.content);
            const isExpanded = expandedId === testimonial.id;
            // When any card in the row is expanded, show full content for all cards in that row
            const showFull = anyExpanded;
            // Heuristic: ~15 lines * ~55 chars/line ≈ 800 chars before clamping kicks in
            const isLong = testimonial.content.length > 800;

            return (
              <div
                key={testimonial.id}
                className="relative p-6 md:p-8 bg-background rounded-xl border border-border card-hover transition-all flex flex-col h-full"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-1 flex flex-col">
                  <div className={`text-foreground text-sm leading-relaxed space-y-3 ${showFull ? "" : "testimonial-clamp"}`}>
                    {paragraphs.map((para, i) => {
                      const isFirst = i === 0;
                      const isLast = i === paragraphs.length - 1;
                      const text = `${isFirst ? `"` : ""}${para}${isLast ? `"` : ""}`;
                      return (
                        <p key={i}>
                          {isFirst && (
                            <span
                              aria-hidden="true"
                              className="float-right ml-3 mb-1 text-primary/20 inline-flex items-start"
                            >
                              <Quote size={32} />
                            </span>
                          )}
                          <span dangerouslySetInnerHTML={renderTextWithLinks(text)} />
                        </p>
                      );
                    })}
                  </div>
                  {isLong && !anyExpanded && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedId(testimonial.id);
                      }}
                      className="text-primary hover:underline font-medium text-sm mt-2 self-start"
                    >
                      ...more
                    </button>
                  )}

                  <div className="mt-auto pt-4 border-t border-border flex items-center gap-3">
                    {testimonial.avatar_url && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={testimonial.avatar_url} alt={testimonial.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      {testimonial.name_link ? (
                        <a href={testimonial.name_link} target="_blank" rel="noopener noreferrer" className="font-semibold text-sm text-foreground hover:text-primary transition-colors">
                          {testimonial.name}
                        </a>
                      ) : (
                        <p className="font-semibold text-sm text-foreground">{testimonial.name}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {testimonial.role}
                        {testimonial.company && (
                          <>
                            {testimonial.role && ", "}
                            {testimonial.company_link ? (
                              <a href={testimonial.company_link} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                {testimonial.company}
                              </a>
                            ) : (
                              testimonial.company
                            )}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
