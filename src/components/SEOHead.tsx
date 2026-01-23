import { useEffect } from "react";
import { useSEOSettings } from "@/hooks/use-seo-settings";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
  };
}

export const SEOHead = ({
  title,
  description,
  image,
  imageAlt,
  type = "website",
  article,
}: SEOHeadProps) => {
  const { settings } = useSEOSettings();

  // Resolve final values with fallbacks
  const finalTitle = title || settings.site_title || "My Website";
  const finalDescription = description || settings.site_description || "";
  const finalImage = image || settings.default_og_image || "";
  const fullTitle = title ? `${title} | ${settings.site_title}` : finalTitle;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to update or create meta tag
    const setMeta = (property: string, content: string, isName = false) => {
      if (!content) return;
      
      const attr = isName ? "name" : "property";
      let element = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, property);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Standard meta tags
    setMeta("description", finalDescription, true);

    // Open Graph tags
    setMeta("og:title", fullTitle);
    setMeta("og:description", finalDescription);
    setMeta("og:type", type);
    setMeta("og:url", window.location.href);
    
    if (finalImage) {
      setMeta("og:image", finalImage);
      if (imageAlt) {
        setMeta("og:image:alt", imageAlt);
      }
    }

    // Twitter Card tags
    setMeta("twitter:card", finalImage ? "summary_large_image" : "summary", true);
    setMeta("twitter:title", fullTitle, true);
    setMeta("twitter:description", finalDescription, true);
    
    if (finalImage) {
      setMeta("twitter:image", finalImage, true);
      if (imageAlt) {
        setMeta("twitter:image:alt", imageAlt, true);
      }
    }

    // Article-specific meta tags
    if (type === "article" && article) {
      if (article.publishedTime) {
        setMeta("article:published_time", article.publishedTime);
      }
      if (article.modifiedTime) {
        setMeta("article:modified_time", article.modifiedTime);
      }
      if (article.author) {
        setMeta("article:author", article.author);
      }
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", window.location.href);

    // Cleanup function not needed as we're updating existing tags
  }, [fullTitle, finalDescription, finalImage, imageAlt, type, article, settings]);

  return null; // This component only manages document head
};
