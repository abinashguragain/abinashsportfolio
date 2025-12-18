import { Layout } from "@/components/layout/Layout";
import { Briefcase, FileSpreadsheet, GraduationCap, TrendingUp, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const experiences = [
  {
    icon: Briefcase,
    title: "Program Management",
    subtitle: "Process Architect",
    description: "Streamlining operations and building efficient workflows that scale. Expert in process optimization, cross-functional coordination, and delivering projects on time.",
    highlights: [
      "Process streamlining & optimization",
      "Workflow design & documentation",
      "Cross-team coordination",
      "Project lifecycle management"
    ],
    accent: true
  },
  {
    icon: FileSpreadsheet,
    title: "Google Sheets Automation",
    subtitle: "Automation Specialist",
    description: "Turning spreadsheets into powerful business tools. Building custom automations, scripts, and dashboards that save hours of manual work.",
    highlights: [
      "Custom Apps Script solutions",
      "Automated reporting systems",
      "Data validation & cleanup",
      "Interactive dashboards"
    ],
    accent: false
  },
  {
    icon: GraduationCap,
    title: "Course Creation",
    subtitle: "Educator & Content Creator",
    description: "Transforming complex knowledge into engaging learning experiences. Creating courses that actually stick and deliver real results.",
    highlights: [
      "Curriculum design",
      "Video & written content",
      "Learning path optimization",
      "Student engagement strategies"
    ],
    accent: false
  },
  {
    icon: TrendingUp,
    title: "Business Development",
    subtitle: "Exploring New Horizons",
    description: "Currently expanding into business development, bringing a systematic approach to growth strategies and partnership building.",
    highlights: [
      "Strategic partnership exploration",
      "Market analysis",
      "Growth strategy development",
      "Client relationship building"
    ],
    accent: false,
    isNew: true
  }
];

export default function Experience() {
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
              EXPERIENCE & <span className="text-primary">EXPERTISE</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              A blend of systematic thinking and creative problem-solving. 
              I help businesses run smoother, work smarter, and grow faster.
            </p>
          </div>
        </div>
      </section>

      {/* Experience Grid */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="grid gap-6 md:gap-8">
            {experiences.map((exp, index) => (
              <div
                key={exp.title}
                className={`group relative rounded-lg border transition-all duration-300 hover:shadow-card overflow-hidden animate-fade-up ${
                  exp.accent 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-card border-border hover:border-primary/30"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* New badge for Business Development */}
                {exp.isNew && (
                  <div className="absolute top-4 right-4 md:top-6 md:right-6">
                    <span className="inline-flex items-center px-3 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-full uppercase tracking-wider">
                      New Focus
                    </span>
                  </div>
                )}
                
                <div className="p-6 md:p-8 lg:p-10">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center ${
                      exp.accent 
                        ? "bg-primary-foreground/20" 
                        : "bg-primary/10"
                    }`}>
                      <exp.icon className={`w-7 h-7 ${exp.accent ? "text-primary-foreground" : "text-primary"}`} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="mb-4">
                        <p className={`text-sm font-medium mb-1 ${
                          exp.accent ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}>
                          {exp.subtitle}
                        </p>
                        <h2 className={`text-2xl md:text-3xl font-display ${
                          exp.accent ? "text-primary-foreground" : "text-foreground"
                        }`}>
                          {exp.title}
                        </h2>
                      </div>
                      
                      <p className={`text-base md:text-lg mb-6 leading-relaxed ${
                        exp.accent ? "text-primary-foreground/90" : "text-muted-foreground"
                      }`}>
                        {exp.description}
                      </p>
                      
                      {/* Highlights */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {exp.highlights.map((highlight) => (
                          <div 
                            key={highlight}
                            className={`flex items-center gap-2 text-sm ${
                              exp.accent ? "text-primary-foreground/80" : "text-foreground"
                            }`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              exp.accent ? "bg-primary-foreground" : "bg-accent"
                            }`} />
                            {highlight}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative bottom border on hover */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100 ${
                  exp.accent ? "bg-primary-foreground/30" : "bg-accent"
                }`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-metal">
        <div className="container-narrow text-center">
          <div className="animate-fade-up">
            <h2 className="text-3xl md:text-4xl font-display text-foreground mb-4">
              READY TO <span className="text-accent">COLLABORATE</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Whether you need process optimization, automation solutions, or just want to chat about a project idea.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/contact" className="group">
                Let's Talk
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
