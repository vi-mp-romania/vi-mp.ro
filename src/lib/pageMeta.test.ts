/** Tests for pageMeta and headTags. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_TEXTS } from './texts';
import { headTags, pageMeta, serializeJson, type PageData } from './pageMeta';

const SITE = 'https://vi-mp.ro';
const NEWS = {
  id: '6f1c2c1e-0000-4000-8000-000000000001',
  source: 'youtube' as const,
  kind_label: 'Video',
  title: 'GTA VI — Trailer 2 "oficial"',
  summary: 'Jason și Lucia.',
  url: 'https://www.youtube.com/watch?v=VQRLujxTm3c',
  image_url: 'https://i.ytimg.com/vi/VQRLujxTm3c/maxresdefault.jpg',
  cta_label: '',
  is_published: true,
  position: 1,
  created_at: '2026-11-25T10:00:00Z',
  slug: 'gta-vi-trailer-2',
  body: '',
};
const DATA: PageData = {
  texts: DEFAULT_TEXTS,
  news: [NEWS],
  faq: [{ id: 'f1', question: 'Are GTA 6 multiplayer?', answer: 'Nu încă.', is_published: true, position: 1 }],
  discordUrl: 'https://discord.gg/abc',
};

test('home: SEO texts, canonical with trailing slash, site + organization + FAQ structured data', () => {
  const meta = pageMeta({ page: 'home' }, DATA, SITE);
  assert.equal(meta.title, DEFAULT_TEXTS['seo.homeTitle']);
  assert.equal(meta.canonicalUrl, 'https://vi-mp.ro/');
  assert.ok(meta.isIndexable);
  assert.deepEqual(meta.jsonLd.map((item) => (item as { '@type': string })['@type']), ['WebSite', 'Organization', 'FAQPage']);
  assert.deepEqual((meta.jsonLd[1] as { sameAs: string[] }).sameAs, ['https://discord.gg/abc']);
});

test('article: its own title, description, image and NewsArticle data; unknown slug is not found', () => {
  const meta = pageMeta({ page: 'article', slug: 'gta-vi-trailer-2' }, DATA, SITE);
  assert.equal(meta.title, 'GTA VI — Trailer 2 "oficial" | VI-MP.ro');
  assert.equal(meta.canonicalUrl, 'https://vi-mp.ro/noutati/gta-vi-trailer-2/');
  assert.equal(meta.imageUrl, NEWS.image_url);
  assert.equal(meta.type, 'article');
  assert.equal((meta.jsonLd[0] as { '@type': string })['@type'], 'NewsArticle');
  assert.equal(pageMeta({ page: 'article', slug: 'missing' }, DATA, SITE).isIndexable, false);
});

test('control panel and missing pages are noindex without a canonical link', () => {
  for (const page of ['admin', 'notFound'] as const) {
    const tags = headTags(pageMeta({ page }, DATA, SITE));
    assert.match(tags, /<meta name="robots" content="noindex" \/>/);
    assert.doesNotMatch(tags, /rel="canonical"/);
  }
});

test('head tags escape attribute values and keep JSON-LD inside its script element', () => {
  const tags = headTags(pageMeta({ page: 'article', slug: 'gta-vi-trailer-2' }, DATA, SITE));
  assert.match(tags, /content="GTA VI — Trailer 2 &quot;oficial&quot; \| VI-MP\.ro"/);
  assert.equal(serializeJson({ text: '</script><!--' }), '{"text":"\\u003c/script>\\u003c!--"}');
});

test('long descriptions are cut at a word boundary', () => {
  const meta = pageMeta({ page: 'home' }, { ...DATA, texts: { ...DEFAULT_TEXTS, 'seo.homeDescription': 'cuvânt '.repeat(60) } }, SITE);
  assert.ok(meta.description.length <= 160 && meta.description.endsWith('…'));
});
