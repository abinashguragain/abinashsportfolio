import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Snippet {
  id: string;
  type: "gtm" | "meta_pixel";
  name: string;
  code: string;
  is_global: boolean;
  page_paths: string[];
  is_active: boolean;
}

const matchesPath = (currentPath: string, patterns: string[]): boolean => {
  return patterns.some((pattern) => {
    const p = pattern.trim();
    if (!p) return false;
    if (p === currentPath) return true;
    // Wildcard support: "/blog/*" matches "/blog/anything"
    if (p.endsWith("/*")) {
      const base = p.slice(0, -2);
      return currentPath === base || currentPath.startsWith(base + "/");
    }
    return false;
  });
};

/**
 * Injects a snippet's <script>/<noscript>/<img> tags into <head>/<body>.
 * Each tag is tagged with data-snippet-id so we can remove it on route change.
 */
const injectSnippet = (snippet: Snippet) => {
  const container = document.createElement("div");
  container.innerHTML = snippet.code;

  const injected: Element[] = [];

  Array.from(container.childNodes).forEach((node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    if (tag === "script") {
      const src = el as HTMLScriptElement;
      const newScript = document.createElement("script");
      // Copy attributes
      Array.from(src.attributes).forEach((a) => newScript.setAttribute(a.name, a.value));
      if (src.textContent) newScript.textContent = src.textContent;
      newScript.setAttribute("data-snippet-id", snippet.id);
      document.head.appendChild(newScript);
      injected.push(newScript);
    } else if (tag === "noscript") {
      const ns = document.createElement("noscript");
      ns.innerHTML = (el as HTMLElement).innerHTML;
      ns.setAttribute("data-snippet-id", snippet.id);
      document.body.appendChild(ns);
      injected.push(ns);
    } else if (tag === "img") {
      const img = document.createElement("img");
      Array.from(el.attributes).forEach((a) => img.setAttribute(a.name, a.value));
      img.setAttribute("data-snippet-id", snippet.id);
      document.body.appendChild(img);
      injected.push(img);
    }
  });

  return injected;
};

const removeSnippet = (snippetId: string) => {
  document
    .querySelectorAll(`[data-snippet-id="${snippetId}"]`)
    .forEach((el) => el.remove());
};

export const TrackingSnippets = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loaded, setLoaded] = useState(false);
  const location = useLocation();
  const activeRef = useRef<Set<string>>(new Set());

  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdminRoute) return;

    supabase
      .from("tracking_snippets")
      .select("*")
      .eq("is_active", true)
      .then(({ data }) => {
        if (data) setSnippets(data as Snippet[]);
        setLoaded(true);
      });
  }, [isAdminRoute]);

  useEffect(() => {
    if (!loaded) return;

    // Always clean snippets on admin routes
    if (isAdminRoute) {
      activeRef.current.forEach((id) => removeSnippet(id));
      activeRef.current.clear();
      return;
    }

    const shouldBeActive = new Set<string>();
    snippets.forEach((s) => {
      if (s.is_global || matchesPath(location.pathname, s.page_paths)) {
        shouldBeActive.add(s.id);
      }
    });

    // Remove ones no longer active
    activeRef.current.forEach((id) => {
      if (!shouldBeActive.has(id)) {
        removeSnippet(id);
        activeRef.current.delete(id);
      }
    });

    // Inject new ones
    shouldBeActive.forEach((id) => {
      if (!activeRef.current.has(id)) {
        const snippet = snippets.find((s) => s.id === id);
        if (snippet) {
          injectSnippet(snippet);
          activeRef.current.add(id);
        }
      }
    });

    // For Meta Pixel, fire PageView on SPA route change (after script is loaded)
    if (typeof window !== "undefined" && (window as any).fbq) {
      try {
        (window as any).fbq("track", "PageView");
      } catch {
        // ignore
      }
    }
  }, [location.pathname, snippets, loaded, isAdminRoute]);

  return null;
};

export default TrackingSnippets;
