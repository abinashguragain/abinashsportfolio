import { useEffect, useState } from "react";
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

export const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (data && data.length > 0) {
        setTestimonials(data);
      } else {
        setTestimonials(defaultTestimonials);
      }
      setLoading(false);
    };
    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <section className="section-padding bg-card">
        <div className="container-wide flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="relative p-6 md:p-8 bg-background rounded-xl border border-border card-hover"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Quote icon */}
              <div className="absolute top-6 right-6 text-primary/20">
                <Quote size={32} />
              </div>
              
              {/* Content */}
              <div className="space-y-4">
                <p 
                  className="text-foreground leading-relaxed"
                  dangerouslySetInnerHTML={renderTextWithLinks(`"${testimonial.content}"`)}
                />
                
                <div className="pt-4 border-t border-border flex items-center gap-3">
                  {testimonial.avatar_url && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={testimonial.avatar_url} alt={testimonial.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}{testimonial.company && `, ${testimonial.company}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
