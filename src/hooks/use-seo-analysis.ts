import { useMemo } from "react";

export interface SEOIssue {
  type: "missing_meta_title" | "missing_meta_description" | "missing_h1" | "low_word_count" | "duplicate_content" | "missing_canonical" | "low_internal_links";
  label: string;
  severity: "error" | "warning" | "info";
}

export interface SEOAnalysis {
  issues: SEOIssue[];
  wordCount: number;
  internalLinkCount: number;
  hasMetaTitle: boolean;
  hasMetaDescription: boolean;
  hasH1: boolean;
  hasCanonical: boolean;
  score: number; // 0-100
}

const SEO_WORD_THRESHOLD = 300;
const MIN_INTERNAL_LINKS = 2;

export const analyzeSEO = (
  title: string | null,
  excerpt: string | null,
  content: string | null,
  slug: string | null,
  allTitles: string[],
  allExcerpts: string[]
): SEOAnalysis => {
  const issues: SEOIssue[] = [];
  
  // Extract text content from HTML
  const textContent = content?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || "";
  const wordCount = textContent ? textContent.split(/\s+/).filter(w => w.length > 0).length : 0;
  
  // Count internal links in content
  const internalLinkMatches = content?.match(/<a[^>]*href=["']\/[^"']*["'][^>]*>/gi) || [];
  const internalLinkCount = internalLinkMatches.length;
  
  // Check for H1 in content
  const hasH1InContent = /<h1[^>]*>/.test(content || "");
  
  // Meta title check (using post title)
  const hasMetaTitle = !!title && title.trim().length > 0;
  if (!hasMetaTitle) {
    issues.push({
      type: "missing_meta_title",
      label: "Missing title",
      severity: "error",
    });
  }
  
  // Meta description check (using excerpt)
  const hasMetaDescription = !!excerpt && excerpt.trim().length > 0;
  if (!hasMetaDescription) {
    issues.push({
      type: "missing_meta_description",
      label: "Missing excerpt",
      severity: "error",
    });
  }
  
  // H1 check
  const hasH1 = hasH1InContent || !!title; // Title serves as H1 on blog post page
  if (!hasH1InContent && !title) {
    issues.push({
      type: "missing_h1",
      label: "Missing H1",
      severity: "error",
    });
  }
  
  // Word count check
  if (wordCount < SEO_WORD_THRESHOLD) {
    issues.push({
      type: "low_word_count",
      label: `${wordCount}/${SEO_WORD_THRESHOLD} words`,
      severity: "warning",
    });
  }
  
  // Duplicate title check
  const titleOccurrences = allTitles.filter(t => t === title).length;
  if (titleOccurrences > 1) {
    issues.push({
      type: "duplicate_content",
      label: "Duplicate title",
      severity: "warning",
    });
  }
  
  // Duplicate excerpt check
  if (excerpt) {
    const excerptOccurrences = allExcerpts.filter(e => e === excerpt).length;
    if (excerptOccurrences > 1) {
      issues.push({
        type: "duplicate_content",
        label: "Duplicate excerpt",
        severity: "warning",
      });
    }
  }
  
  // Canonical URL check (slug present)
  const hasCanonical = !!slug && slug.trim().length > 0;
  if (!hasCanonical) {
    issues.push({
      type: "missing_canonical",
      label: "Missing slug",
      severity: "error",
    });
  }
  
  // Internal links check
  if (internalLinkCount < MIN_INTERNAL_LINKS && wordCount >= SEO_WORD_THRESHOLD) {
    issues.push({
      type: "low_internal_links",
      label: `${internalLinkCount} links`,
      severity: "info",
    });
  }
  
  // Calculate SEO score
  let score = 100;
  issues.forEach(issue => {
    if (issue.severity === "error") score -= 20;
    else if (issue.severity === "warning") score -= 10;
    else score -= 5;
  });
  score = Math.max(0, Math.min(100, score));
  
  return {
    issues,
    wordCount,
    internalLinkCount,
    hasMetaTitle,
    hasMetaDescription,
    hasH1,
    hasCanonical,
    score,
  };
};

export const useSEOAnalysis = (posts: Array<{
  title: string | null;
  excerpt: string | null;
  content: string | null;
  slug: string | null;
}>) => {
  return useMemo(() => {
    const allTitles = posts.map(p => p.title).filter(Boolean) as string[];
    const allExcerpts = posts.map(p => p.excerpt).filter(Boolean) as string[];
    
    return posts.map(post => 
      analyzeSEO(post.title, post.excerpt, post.content, post.slug, allTitles, allExcerpts)
    );
  }, [posts]);
};

export default useSEOAnalysis;
