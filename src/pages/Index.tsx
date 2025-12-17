import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { AboutSection } from "@/components/home/AboutSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { LatestBlogsSection } from "@/components/home/LatestBlogsSection";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <AboutSection />
      <TestimonialsSection />
      <LatestBlogsSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
