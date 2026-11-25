-- SEO content: a page per news item (slug + optional longer body) and a FAQ section edited in the
-- control panel. Existing news get slugs generated from their titles.

-- ---------------------------------------------------------------------------------------------
-- News pages: /noutati/<slug>/
-- ---------------------------------------------------------------------------------------------

alter table public.news_items
  add column slug text,
  add column body text not null default '' check (length(body) <= 10000);

-- Slug from the title, the same rule as src/lib/slug.ts: drop Romanian diacritics, lowercase,
-- non-alphanumeric runs become one hyphen, trimmed; an empty result falls back to the id.
update public.news_items
set slug = coalesce(
  nullif(
    trim(both '-' from left(
      regexp_replace(lower(translate(title, 'ăâîșşțţĂÂÎȘŞȚŢ', 'aaissttaaisstt')), '[^a-z0-9]+', '-', 'g'),
      80)),
    ''),
  id::text);

-- Two titles giving the same slug: suffix all but the oldest with -2, -3, ...
with ranked as (
  select id, slug, row_number() over (partition by slug order by created_at) as n from public.news_items
)
update public.news_items n
set slug = left(r.slug, 76) || '-' || r.n
from ranked r
where n.id = r.id and r.n > 1;

alter table public.news_items
  alter column slug set not null,
  add constraint news_items_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 80),
  add constraint news_items_slug_unique unique (slug);

-- ---------------------------------------------------------------------------------------------
-- FAQ ("Întrebări frecvente")
-- ---------------------------------------------------------------------------------------------

create table public.faq_items (
  id uuid primary key default gen_random_uuid(),
  question text not null check (length(question) between 1 and 200),
  answer text not null check (length(answer) between 1 and 2000),
  is_published boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.faq_items enable row level security;

create policy "public reads published faq" on public.faq_items
  for select to anon, authenticated using (is_published or public.is_admin());
create policy "admins insert faq" on public.faq_items
  for insert to authenticated with check (public.is_admin());
create policy "admins update faq" on public.faq_items
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins delete faq" on public.faq_items
  for delete to authenticated using (public.is_admin());

-- Starting answers (late November 2026). They describe a changing situation: keep them current
-- from the control panel (tab "Întrebări").
insert into public.faq_items (question, answer, position) values
  ('Are GTA 6 multiplayer?',
   'GTA 6 (Grand Theft Auto VI) a apărut pe 19 noiembrie 2026 pe PS5 și Xbox Series X|S. Rockstar nu a anunțat încă un mod multiplayer online pentru GTA 6 și nici servere private. Când apar vești oficiale, le găsești aici și pe Discord-ul VI-MP.ro.',
   1),
  ('Când apare GTA 6 pe PC?',
   'Rockstar nu a anunțat o dată oficială pentru versiunea de PC. Presa de specialitate (GamesBeat) a raportat, citând surse din industrie, o lansare în primul trimestru din 2027. Până la o confirmare oficială, e doar o estimare.',
   2),
  ('Vor exista servere românești de GTA 6?',
   'Pentru asta există VI-MP.ro: adunăm de acum jucătorii, developerii și fondatorii de servere din România, ca să fim pregătiți în momentul în care GTA 6 va permite servere comunitare.',
   3),
  ('Va exista GTA 6 RP (roleplay), ca pe FiveM?',
   'Deocamdată nu există FiveM sau o altă platformă de servere pentru GTA 6 și nici un anunț oficial despre servere de roleplay. Serverele RP de azi rulează pe FiveM, pentru GTA V pe PC. Urmărim orice noutate și o anunțăm aici.',
   4),
  ('Cum mă alătur comunității VI-MP.ro?',
   'Intră pe serverul nostru de Discord (butonul de pe pagină), votează mai sus dacă vrei să joci sau să dezvolți un server și urmărește secțiunea de noutăți.',
   5),
  ('Pot ajuta la dezvoltarea unui server de GTA 6?',
   'Da. Votează „Da” la întrebarea pentru developeri și scrie-ne pe Discord: căutăm programatori, designeri, mapperi și oameni care vor să învețe.',
   6);
