import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import ThirdPartyScripts from "./components/ThirdPartyScripts";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import Experience from "./pages/Experience";
import NotFound from "./pages/NotFound";
import AdminAuth from "./pages/AdminAuth";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import HeroEditor from "./pages/admin/HeroEditor";
import AboutEditor from "./pages/admin/AboutEditor";
import ServicesEditor from "./pages/admin/ServicesEditor";
import ExperienceEditor from "./pages/admin/ExperienceEditor";
import TestimonialsEditor from "./pages/admin/TestimonialsEditor";
import BlogManagement from "./pages/admin/BlogManagement";
import BlogEditor from "./pages/admin/BlogEditor";
import AuthorsEditor from "./pages/admin/AuthorsEditor";
import ContactsList from "./pages/admin/ContactsList";
import NavigationEditor from "./pages/admin/NavigationEditor";
import CTAEditor from "./pages/admin/CTAEditor";
import FooterEditor from "./pages/admin/FooterEditor";
import CategoriesEditor from "./pages/admin/CategoriesEditor";
import IntegrationsEditor from "./pages/admin/IntegrationsEditor";
import GoogleSheetsEditor from "./pages/admin/GoogleSheetsEditor";
import ActivityLogs from "./pages/admin/ActivityLogs";
import SEOEditor from "./pages/admin/SEOEditor";

const queryClient = new QueryClient();

const SitemapRedirect = () => {
  window.location.href = `https://hzmljxtklixcisasjqwg.supabase.co/functions/v1/sitemap?baseUrl=${window.location.origin}`;
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ThirdPartyScripts />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/experience" element={<Experience />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminAuth />} />
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="navigation" element={<NavigationEditor />} />
              <Route path="hero" element={<HeroEditor />} />
              <Route path="about" element={<AboutEditor />} />
              <Route path="experience" element={<ExperienceEditor />} />
              <Route path="services" element={<ServicesEditor />} />
              <Route path="cta" element={<CTAEditor />} />
              <Route path="footer" element={<FooterEditor />} />
              <Route path="testimonials" element={<TestimonialsEditor />} />
              <Route path="blog" element={<BlogManagement />} />
              <Route path="blog/:id" element={<BlogEditor />} />
              <Route path="categories" element={<CategoriesEditor />} />
              <Route path="authors" element={<AuthorsEditor />} />
              <Route path="contacts" element={<ContactsList />} />
              <Route path="integrations" element={<IntegrationsEditor />} />
              <Route path="google-sheets" element={<GoogleSheetsEditor />} />
              <Route path="activity-logs" element={<ActivityLogs />} />
              <Route path="seo" element={<SEOEditor />} />
            </Route>
            
            
            <Route path="/sitemap.xml" element={<SitemapRedirect />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
