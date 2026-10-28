/**
 * Typography Sanitizer & Cleaner utility for Rich Text Editor
 * 
 * Sanitizes pasted or existing HTML by:
 * - Stripping foreign fonts, hardcoded font sizes, background colors, and style attributes
 * - Keeping clean semantic tags: <p>, <h2>, <h3>, <b>, <strong>, <i>, <em>, <a>, <ul>, <ol>, <li>, <blockquote>, <figure>, <img>, <figcaption>, <br>
 * - Normalizing text formatting and unwrapping unnecessary spans/divs
 */

const ALLOWED_TAGS = new Set([
  'P', 'H2', 'H3', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE',
  'A', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'FIGURE', 'IMG', 'FIGCAPTION', 'BR'
]);

export function cleanArticleHtml(html: string): string {
  if (!html || !html.trim()) return '';

  if (typeof window === 'undefined') {
    return html;
  }

  // Parse using browser DOMParser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Helper to sanitize nodes recursively
  function cleanNode(node: Node) {
    const childNodes = Array.from(node.childNodes);

    for (const child of childNodes) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        const tagName = el.tagName.toUpperCase();

        // Recursively clean children first
        cleanNode(el);

        // Remove unwanted interactive/script tags completely
        if (['SCRIPT', 'STYLE', 'IFRAME', 'META', 'LINK', 'SVG'].includes(tagName)) {
          el.remove();
          continue;
        }

        // Convert H1, H4, H5, H6 to H2 or H3
        if (['H1', 'H4', 'H5', 'H6'].includes(tagName)) {
          const targetHeading = tagName === 'H1' ? 'h2' : 'h3';
          const newHeading = doc.createElement(targetHeading);
          while (el.firstChild) {
            newHeading.appendChild(el.firstChild);
          }
          el.replaceWith(newHeading);
          continue;
        }

        if (ALLOWED_TAGS.has(tagName)) {
          // Remove foreign inline styles, classes, fonts, bg-colors
          if (tagName === 'IMG') {
            const src = el.getAttribute('src') || '';
            const alt = el.getAttribute('alt') || '';
            const title = el.getAttribute('title') || '';
            el.getAttributeNames().forEach((attr) => el.removeAttribute(attr));
            if (src) el.setAttribute('src', src);
            if (alt) el.setAttribute('alt', alt);
            if (title) el.setAttribute('title', title);
            el.setAttribute('class', 'rounded-md max-w-full h-auto mx-auto block shadow-xs');
          } else if (tagName === 'A') {
            const href = el.getAttribute('href') || '#';
            const title = el.getAttribute('title') || '';
            el.getAttributeNames().forEach((attr) => el.removeAttribute(attr));
            el.setAttribute('href', href);
            if (title) el.setAttribute('title', title);
            el.setAttribute('target', '_blank');
            el.setAttribute('rel', 'noopener noreferrer');
          } else if (tagName === 'FIGURE' || tagName === 'FIGCAPTION') {
            // Keep clean figure / figcaption
            el.removeAttribute('style');
          } else {
            // For P, H2, H3, B, STRONG, UL, OL, LI, BLOCKQUOTE, etc.
            // Strip out style, font, color, background-color, class
            el.removeAttribute('style');
            el.removeAttribute('class');
            el.removeAttribute('face');
            el.removeAttribute('color');
            el.removeAttribute('size');
          }
        } else {
          // Unwrap tags not in allowed list (e.g. <div>, <span>, <font>, <section>, <article>)
          // If it's a div containing text, replace with <p> if appropriate, or unwrap
          if (tagName === 'DIV' || tagName === 'SECTION' || tagName === 'ARTICLE') {
            const p = doc.createElement('p');
            while (el.firstChild) {
              p.appendChild(el.firstChild);
            }
            el.replaceWith(p);
          } else {
            // Unwrap inner content
            while (el.firstChild) {
              el.parentNode?.insertBefore(el.firstChild, el);
            }
            el.remove();
          }
        }
      }
    }
  }

  cleanNode(doc.body);

  // Normalize paragraphs: ensure text chunks outside paragraphs are wrapped in <p>
  const finalNodes = Array.from(doc.body.childNodes);
  for (const node of finalNodes) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      const p = doc.createElement('p');
      p.textContent = node.textContent;
      node.replaceWith(p);
    }
  }

  // Remove empty paragraphs unless they contain an img or non-breaking space
  const paragraphs = doc.body.querySelectorAll('p');
  paragraphs.forEach((p) => {
    if (!p.querySelector('img') && !p.textContent?.trim()) {
      p.remove();
    }
  });

  return doc.body.innerHTML.trim();
}
