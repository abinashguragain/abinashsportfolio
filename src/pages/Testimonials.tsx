import { useEffect, useState } from "react";
import { Quote, Loader2, Star } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  content: string;
  avatar_url: string | null;
  rating: number | null;
  name_link: string | null;
  company_link: string | null;
}

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (data) setTestimonials(data);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <Layout>
      <SEOHead title="Testimonials" description="What clients and collaborators say about working with me." />
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
              KIND <span className="text-gradient">WORDS</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              What clients and collaborators say about working with me.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No testimonials yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className="relative p-6 md:p-8 bg-card rounded-xl border border-border card-hover animate-fade-up opacity-0"
                  style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
                >
                  <div className="absolute top-6 right-6 text-primary/20">
                    <Quote size={32} />
                  </div>

                  <div className="space-y-4">
                    <p className="text-foreground leading-relaxed">
                      "{testimonial.content}"
                    </p>

                    {testimonial.rating && (
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < testimonial.rating! ? "fill-accent text-accent" : "text-muted"}`}
                          />
                        ))}
                      </div>
                    )}

                    <div className="pt-4 border-t border-border flex items-center gap-3">
                      {testimonial.avatar_url && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={testimonial.avatar_url} alt={testimonial.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        {testimonial.name_link ? (
                          <a
                            href={testimonial.name_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-foreground hover:text-primary transition-colors"
                          >
                            {testimonial.name}
                          </a>
                        ) : (
                          <p className="font-semibold text-foreground">{testimonial.name}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role}
                          {testimonial.company && (
                            <>
                              {testimonial.role && ", "}
                              {testimonial.company_link ? (
                                <a
                                  href={testimonial.company_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-primary transition-colors"
                                >
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
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Testimonials;
