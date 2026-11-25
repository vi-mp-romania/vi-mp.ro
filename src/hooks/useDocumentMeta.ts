/** Keeps the document's title, description, canonical link and robots tag in step with the page. */
import { useEffect } from 'react';
import type { PageMeta } from '@/lib/pageMeta';

/**
 * Applies `meta` to the live document whenever it changes; null leaves the document alone (a page
 * that sets its own metadata once its data is known). The prerendered HTML already carries the
 * right tags for the first page; this keeps them right after in-app navigation (search engines that
 * run JavaScript read the updated values). Preview tags (og:*) are only read from the HTML and are
 * not touched.
 */
export function useDocumentMeta(meta: PageMeta | null): void {
  // The effect depends on these values, not on `meta`, which is a new object every render.
  const title = meta?.title;
  const description = meta?.description ?? '';
  const canonicalUrl = meta?.canonicalUrl ?? '';
  const isIndexable = meta?.isIndexable ?? true;

  useEffect(() => {
    if (title === undefined) return;
    document.title = title;
    upsert('meta[name="description"]', 'meta', { name: 'description' }).setAttribute('content', description);
    // Indexable pages get a canonical link; the others get noindex instead (as in the built HTML).
    if (isIndexable) {
      upsert('link[rel="canonical"]', 'link', { rel: 'canonical' }).setAttribute('href', canonicalUrl);
      document.head.querySelector('meta[name="robots"]')?.remove();
    } else {
      document.head.querySelector('link[rel="canonical"]')?.remove();
      upsert('meta[name="robots"]', 'meta', { name: 'robots' }).setAttribute('content', 'noindex');
    }
  }, [title, description, canonicalUrl, isIndexable]);
}

// Internals

/** The head element matching `selector`, created (with `attributes`) and appended when missing. */
function upsert(selector: string, tag: 'meta' | 'link', attributes: Record<string, string>): Element {
  const existing = document.head.querySelector(selector);
  if (existing) return existing;
  const element = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
  return document.head.appendChild(element);
}
