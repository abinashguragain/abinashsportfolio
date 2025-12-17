import { Quote } from "lucide-react";
import { testimonials } from "@/data/testimonials";

export const TestimonialsSection = () => {
  return (
    <section className="section-padding bg-card">
      <div className="container-wide">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
            KIND <span className="text-gradient">WORDS</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            What clients and collaborators say about working with me.
          </p>
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
                <p className="text-foreground leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                <div className="pt-4 border-t border-border">
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
