import { PenTool, Target, Sparkles, Users } from "lucide-react";

const services = [
  {
    icon: PenTool,
    title: "Content Writing",
    description: "Blog posts, articles, and long-form content that educates and engages your audience.",
  },
  {
    icon: Target,
    title: "SEO Copywriting",
    description: "Search-optimized content that ranks and converts, without sacrificing readability.",
  },
  {
    icon: Sparkles,
    title: "Brand Storytelling",
    description: "Compelling narratives that communicate your brand's unique value and vision.",
  },
  {
    icon: Users,
    title: "Social Content",
    description: "Engaging posts and threads designed for maximum reach and audience connection.",
  },
];

export const AboutSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-wide">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
            WHAT I <span className="text-gradient">DO</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            From strategy to execution, I help brands and businesses communicate with clarity, creativity, and impact.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group p-6 bg-card rounded-xl border border-border card-hover"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <service.icon size={24} className="text-accent-foreground group-hover:text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl text-foreground mb-2">{service.title}</h3>
              <p className="text-muted-foreground text-sm">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
