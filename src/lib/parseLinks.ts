/**
 * Parses [text](url) markdown-style links and converts them to HTML anchors.
 * Only processes links in non-blog text content.
 */
export function parseLinks(text: string | null | undefined): string {
  if (!text) return '';
  
  // Match [text](url) pattern
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  
  return text.replace(linkRegex, (_, linkText, url) => {
    // Sanitize URL - only allow http, https, mailto, tel protocols
    const sanitizedUrl = sanitizeUrl(url);
    if (!sanitizedUrl) return linkText;
    
    // Determine if external link
    const isExternal = sanitizedUrl.startsWith('http') && !sanitizedUrl.includes(window.location.hostname);
    const targetAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
    
    return `<a href="${sanitizedUrl}" class="text-primary hover:underline transition-colors"${targetAttr}>${escapeHtml(linkText)}</a>`;
  });
}

/**
 * Sanitizes a URL to prevent XSS attacks.
 * Returns null if the URL is not safe.
 */
function sanitizeUrl(url: string): string | null {
  const trimmedUrl = url.trim();
  
  // Allow relative URLs
  if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('#')) {
    return trimmedUrl;
  }
  
  // Allow safe protocols
  const safeProtocols = ['http://', 'https://', 'mailto:', 'tel:'];
  const lowerUrl = trimmedUrl.toLowerCase();
  
  for (const protocol of safeProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return trimmedUrl;
    }
  }
  
  // Block javascript: and data: URLs
  if (lowerUrl.startsWith('javascript:') || lowerUrl.startsWith('data:')) {
    return null;
  }
  
  // Assume https for URLs without protocol
  return `https://${trimmedUrl}`;
}

/**
 * Escapes HTML special characters to prevent XSS.
 */
function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
}

/**
 * React component helper - renders text with parsed links.
 * Use dangerouslySetInnerHTML with this output.
 */
export function renderTextWithLinks(text: string | null | undefined): { __html: string } {
  return { __html: parseLinks(text) };
}
