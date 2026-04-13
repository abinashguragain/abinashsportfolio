import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PenTool, Target, Sparkles, Users, Loader2, LucideIcon } from "lucide-react";
import { renderTextWithLinks } from "@/lib/parseLinks";

interface Service {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  icon_url: string | null;
}

const iconMap: Record<string, LucideIcon> = {
  PenTool,
  Target,
  Sparkles,
  Users,
};

const defaultServices = [
  { id: "1", title: "Content Writing", description: "Blog posts, articles, and long-form content that educates and engages your audience.", icon: "PenTool", icon_url: null },
  { id: "2", title: "SEO Copywriting", description: "Search-optimized content that ranks and converts, without sacrificing readability.", icon: "Target", icon_url: null },
  { id: "3", title: "Brand Storytelling", description: "Compelling narratives that communicate your brand's unique value and vision.", icon: "Sparkles", icon_url: null },
  { id: "4", title: "Social Content", description: "Engaging posts and threads designed for maximum reach and audience connection.", icon: "Users", icon_url: null },
];

const ServiceCard = ({ service }: { service: Service }) => {
  const IconComponent = iconMap[service.icon || "PenTool"] || PenTool;
  return (
    <div className="group flex-shrink-0 w-72 p-6 bg-card rounded-xl border border-border card-hover">
      <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors duration-300 overflow-hidden">
        {service.icon_url ? (
          <img src={service.icon_url} alt={service.title} className="w-full h-full object-cover" />
        ) : (
          <IconComponent size={24} className="text-accent-foreground" />
        )}
      </div>
      <h3 className="font-display text-xl text-foreground mb-2">{service.title}</h3>
      <p
        className="text-muted-foreground text-sm"
        dangerouslySetInnerHTML={renderTextWithLinks(service.description)}
      />
    </div>
  );
};

export const AboutSection = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (data && data.length > 0) {
        setServices(data);
      } else {
        setServices(defaultServices);
      }
      setLoading(false);
    };
    fetchServices();
  }, []);

  if (loading) {
    return (
      <section className="section-padding bg-background">
        <div className="container-wide flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-background overflow-hidden">
      <div className="container-wide">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
            WHAT I <span className="text-gradient">DO</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            From strategy to execution, I help brands and businesses communicate with clarity, creativity, and impact.
          </p>
        </div>
      </div>

      <div className="relative w-full">
        <div className="flex animate-marquee gap-6 w-max">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
          {services.map((service) => (
            <ServiceCard key={`dup-${service.id}`} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
};
