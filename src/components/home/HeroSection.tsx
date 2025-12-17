import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import avatarImage from "@/assets/avatar.png";

export const HeroSection = () => {
  return (
    <section className="relative section-padding bg-gradient-hero overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="container-wide relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1 space-y-6 md:space-y-8">
            <div className="space-y-4">
              <p className="text-sm md:text-base font-semibold text-secondary uppercase tracking-wider animate-fade-up opacity-0" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
                Content Writer & Storyteller
              </p>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground leading-[0.95] animate-fade-up opacity-0" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
                WORDS THAT<br />
                <span className="text-gradient">MOVE PEOPLE</span>
              </h1>
            </div>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg animate-fade-up opacity-0" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
              I craft compelling content that connects with audiences, drives engagement, and tells stories worth sharing. Let's create something memorable together.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-up opacity-0" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
              <Button variant="hero" size="lg" asChild>
                <Link to="/contact">
                  Get in Touch
                  <ArrowRight size={20} />
                </Link>
              </Button>
              <Button variant="heroOutline" size="lg" asChild>
                <Link to="/blog">Read My Blog</Link>
              </Button>
            </div>
          </div>
          
          {/* Avatar */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end animate-fade-up opacity-0" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-2xl blur-2xl transform scale-95" />
              
              {/* Image container */}
              <div className="relative bg-gradient-to-br from-primary/20 to-secondary/20 p-2 rounded-2xl">
                <img
                  src={avatarImage}
                  alt="Content Writer - Professional Avatar"
                  className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-xl object-cover"
                />
              </div>
              
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 bg-card shadow-card rounded-lg px-4 py-2 border border-border animate-float">
                <p className="text-sm font-semibold text-foreground">5+ Years</p>
                <p className="text-xs text-muted-foreground">Writing Experience</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
