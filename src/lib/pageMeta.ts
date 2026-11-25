/**
 * What search engines and link previews see for each page: title, description, canonical URL,
 * preview image, whether it may be indexed, and structured data (JSON-LD). Used by the build to
 * write every prerendered page's <head>, and by the browser to update the title, description and
 * canonical link after in-app navigation. One place, so both always agree.
 */
// Logic
import { safeUrl } from './safeUrl';
import { routePath, type Route } from './routes';

// Types
import type { Texts } from './texts';
import type { FaqItem, NewsItem } from '@/api/types';

// Constants
const SITE_NAME = 'VI-MP.ro';
const DESCRIPTION_LENGTH = 160; // longer descriptions are cut off in search results anyway
const PREVIEW_IMAGE = '/og-image.png'; // 1200×630, in public/
const PREVIEW_IMAGE_SIZE = { width: 1200, height: 630 };

/** The data a page's metadata is built from (as loaded from the database, or defaults). */
export interface PageData {
  texts: Texts;
  news: readonly NewsItem[]; // published news
  faq: readonly FaqItem[]; // published FAQ entries
  discordUrl: string;
}

/** Metadata of one page. */
export interface PageMeta {
  title: string;
  description: string;
  canonicalUrl: string;
  imageUrl: string;
  /** True when the preview image is the site's default one (its size is known). */
  isDefaultImage: boolean;
  /** False for the control panel and missing pages: noindex, and left out of the sitemap. */
  isIndexable: boolean;
  type: 'website' | 'article';
  jsonLd: object[];
}

/** Metadata for a route. An article whose slug matches no news item gets the not-found metadata. */
export function pageMeta(route: Route, data: PageData, siteUrl: string): PageMeta {
  const url = (target: Route) => siteUrl + routePath(target, '/');
  const base = {
    imageUrl: siteUrl + PREVIEW_IMAGE,
    isDefaultImage: true,
    isIndexable: true,
    type: 'website' as const,
    jsonLd: [] as object[],
  };

  switch (route.page) {
    case 'home':
      return {
        ...base,
        title: data.texts['seo.homeTitle'],
        description: truncate(data.texts['seo.homeDescription']),
        canonicalUrl: url(route),
        jsonLd: homeJsonLd(data, siteUrl),
      };
    case 'news':
      return {
        ...base,
        title: data.texts['seo.newsTitle'],
        description: truncate(data.texts['seo.newsDescription']),
        canonicalUrl: url(route),
      };
    case 'article': {
      const item = data.news.find((candidate) => (candidate.slug || candidate.id) === route.slug);
      if (!item) return pageMeta({ page: 'notFound' }, data, siteUrl);
      const image = safeUrl(item.image_url);
      const description = truncate(item.summary || item.body || data.texts['seo.newsDescription']);
      return {
        ...base,
        title: `${item.title} | ${SITE_NAME}`,
        description,
        canonicalUrl: url(route),
        imageUrl: image ?? base.imageUrl,
        isDefaultImage: !image,
        type: 'article',
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: item.title,
            description,
            image: [image ?? base.imageUrl],
            datePublished: item.created_at,
            mainEntityOfPage: url(route),
            inLanguage: 'ro',
            publisher: { '@type': 'Organization', name: SITE_NAME, url: url({ page: 'home' }) },
          },
        ],
      };
    }
    case 'admin':
      return { ...base, title: `Panou de control | ${SITE_NAME}`, description: '', canonicalUrl: url(route), isIndexable: false };
    case 'notFound':
      return {
        ...base,
        title: `${data.texts['notFound.title']} | ${SITE_NAME}`,
        description: truncate(data.texts['notFound.message']),
        canonicalUrl: url({ page: 'home' }),
        isIndexable: false,
      };
  }
}

/** The <head> tags for a page, except <title> (the build replaces that element itself). */
export function headTags(meta: PageMeta): string {
  const tags = [
    meta.description && `<meta name="description" content="${escapeAttribute(meta.description)}" />`,
    meta.isIndexable
      ? `<link rel="canonical" href="${escapeAttribute(meta.canonicalUrl)}" />`
      : '<meta name="robots" content="noindex" />',
    `<meta property="og:type" content="${meta.type}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    '<meta property="og:locale" content="ro_RO" />',
    `<meta property="og:url" content="${escapeAttribute(meta.canonicalUrl)}" />`,
    `<meta property="og:title" content="${escapeAttribute(meta.title)}" />`,
    meta.description && `<meta property="og:description" content="${escapeAttribute(meta.description)}" />`,
    `<meta property="og:image" content="${escapeAttribute(meta.imageUrl)}" />`,
    meta.isDefaultImage && `<meta property="og:image:width" content="${PREVIEW_IMAGE_SIZE.width}" />`,
    meta.isDefaultImage && `<meta property="og:image:height" content="${PREVIEW_IMAGE_SIZE.height}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    ...meta.jsonLd.map((data) => `<script type="application/ld+json">${serializeJson(data)}</script>`),
  ];
  return tags.filter(Boolean).join('\n    ');
}

/** HTML-escapes text for use inside an element or a double-quoted attribute. */
export function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** JSON safe to place inside a <script> element (no "</script>" or "<!--" can appear). */
export function serializeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

// Internals

/** Structured data for the home page: the site, the community, and the FAQ when there is one. */
function homeJsonLd(data: PageData, siteUrl: string): object[] {
  const home = `${siteUrl}/`;
  const discord = safeUrl(data.discordUrl);
  const items: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: home,
      inLanguage: 'ro',
      description: data.texts['seo.homeDescription'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: home,
      logo: siteUrl + PREVIEW_IMAGE,
      ...(discord ? { sameAs: [discord] } : {}),
    },
  ];
  if (data.faq.length > 0) {
    items.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: data.faq.map((entry) => ({
        '@type': 'Question',
        name: entry.question,
        acceptedAnswer: { '@type': 'Answer', text: entry.answer },
      })),
    });
  }
  return items;
}

/** Shortens text to the description length at a word boundary, with an ellipsis. */
function truncate(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= DESCRIPTION_LENGTH) return clean;
  const cut = clean.slice(0, DESCRIPTION_LENGTH - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : cut.length)}…`;
}
