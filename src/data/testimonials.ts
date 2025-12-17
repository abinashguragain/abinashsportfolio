export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar?: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    role: "Marketing Director",
    company: "TechFlow Inc.",
    content: "Working with this writer transformed our content strategy. Our blog traffic increased by 340% in just six months. The storytelling approach made our technical content accessible and engaging.",
  },
  {
    id: "2",
    name: "James Chen",
    role: "Founder",
    company: "StartupLab",
    content: "Exceptional talent for capturing brand voice. Every piece felt authentic to our company while driving real results. Our conversion rates improved significantly after the website copy overhaul.",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    role: "Head of Content",
    company: "MediaWorks",
    content: "A rare combination of creative flair and strategic thinking. Deadlines were always met, communication was excellent, and the quality consistently exceeded expectations. Highly recommended.",
  },
];
