-- VI-MP.ro schema: site settings, status timeline, text overrides, news, anonymous votes, admins.
--
-- Security model: the browser uses the public anon key, so row level security is the only boundary.
-- Anonymous visitors may read published content and may vote only through cast_vote(). Everything
-- else is written by signed-in users listed in public.admins. Public sign-up must be disabled in
-- the Supabase dashboard (Authentication -> Sign In / Providers) so nobody can create an account.

-- ---------------------------------------------------------------------------------------------
-- Admins
-- ---------------------------------------------------------------------------------------------

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

/* True when the current request is made by a signed-in admin. Security definer so policies can
   consult public.admins without granting anyone read access to it. */
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- An admin may see the admin list (the panel uses it to confirm access); nobody writes it from
-- the browser: add admins in the SQL editor.
create policy "admins read admins" on public.admins
  for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------------------------
-- Site settings (one row)
-- ---------------------------------------------------------------------------------------------

create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  discord_url text not null default '' check (discord_url = '' or discord_url ~* '^https?://'),
  hero_image_url text not null default '' check (hero_image_url = '' or hero_image_url ~* '^https?://'),
  current_stage smallint not null default 0 check (current_stage >= 0),
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "public reads settings" on public.site_settings
  for select to anon, authenticated using (true);
create policy "admins update settings" on public.site_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------------------------
-- Status timeline ("Unde suntem acum")
-- ---------------------------------------------------------------------------------------------

create table public.status_stages (
  position smallint primary key check (position > 0),
  title text not null check (length(title) between 1 and 80),
  caption text not null default '' check (length(caption) <= 80)
);

alter table public.status_stages enable row level security;

create policy "public reads stages" on public.status_stages
  for select to anon, authenticated using (true);
create policy "admins write stages" on public.status_stages
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------------------------
-- Text overrides. Defaults live in src/lib/textRegistry.ts; a row exists only for an edited text.
-- ---------------------------------------------------------------------------------------------

create table public.site_texts (
  key text primary key check (key ~ '^[a-z][a-zA-Z0-9.]*$' and length(key) <= 64),
  value text not null check (length(value) <= 2000),
  updated_at timestamptz not null default now()
);

alter table public.site_texts enable row level security;

create policy "public reads texts" on public.site_texts
  for select to anon, authenticated using (true);
create policy "admins write texts" on public.site_texts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------------------------
-- News
-- ---------------------------------------------------------------------------------------------

create table public.news_items (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'link' check (source in ('youtube', 'reddit', 'discord', 'link')),
  kind_label text not null default '' check (length(kind_label) <= 40),
  title text not null check (length(title) between 1 and 160),
  summary text not null default '' check (length(summary) <= 500),
  url text not null default '' check (url = '' or url ~* '^https?://'),
  image_url text not null default '' check (image_url = '' or image_url ~* '^https?://'),
  cta_label text not null default '' check (length(cta_label) <= 40),
  is_published boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index news_items_order on public.news_items (position, created_at desc);

alter table public.news_items enable row level security;

create policy "public reads published news" on public.news_items
  for select to anon, authenticated using (is_published or public.is_admin());
create policy "admins insert news" on public.news_items
  for insert to authenticated with check (public.is_admin());
create policy "admins update news" on public.news_items
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins delete news" on public.news_items
  for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------------------------
-- Votes. No table access for anyone: voting and reading results go through the functions below,
-- so individual voter ids are never readable from the browser.
-- ---------------------------------------------------------------------------------------------

create table public.votes (
  voter_id uuid not null,
  poll text not null check (poll in ('play', 'develop', 'forum')),
  answer text not null check (answer in ('yes', 'no')),
  updated_at timestamptz not null default now(),
  primary key (voter_id, poll)
);

alter table public.votes enable row level security;

/* Records or changes one browser's answer to one poll. Deduplication is per voter id, which the
   browser keeps in localStorage: a visitor who clears storage can vote again. That is accepted for
   an interest poll and must not be presented as a secure count. */
create function public.cast_vote(p_voter_id uuid, p_poll text, p_answer text)
returns void
language sql
volatile
security definer
set search_path = ''
as $$
  insert into public.votes (voter_id, poll, answer)
  values (p_voter_id, p_poll, p_answer)
  on conflict (voter_id, poll) do update
    set answer = excluded.answer, updated_at = now();
$$;

/* Public totals per poll and answer. Returns counts only, never voter ids. */
create function public.vote_results()
returns table (poll text, answer text, total bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select v.poll, v.answer, count(*) from public.votes v group by v.poll, v.answer;
$$;

/* Deletes every vote of one poll. Admins only; raises for anyone else. */
create function public.reset_votes(p_poll text)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  delete from public.votes where poll = p_poll;
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- Status workflow
-- ---------------------------------------------------------------------------------------------

/* Replaces the whole timeline and the current stage in one transaction, so visitors never see a
   half-saved status. p_stages is a JSON array of {title, caption}; positions follow array order.
   Admins only; raises for anyone else. */
create function public.save_status(p_stages jsonb, p_current_stage smallint)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  if jsonb_typeof(p_stages) is distinct from 'array' or jsonb_array_length(p_stages) = 0 then
    raise exception 'at least one stage is required' using errcode = '22023';
  end if;
  if p_current_stage < 0 or p_current_stage > jsonb_array_length(p_stages) then
    raise exception 'current stage out of range' using errcode = '22023';
  end if;

  delete from public.status_stages where true;
  insert into public.status_stages (position, title, caption)
  select s.ordinality, s.value ->> 'title', coalesce(s.value ->> 'caption', '')
  from jsonb_array_elements(p_stages) with ordinality as s(value, ordinality);

  update public.site_settings set current_stage = p_current_stage, updated_at = now() where id = 1;
end;
$$;

-- Functions are executable by PUBLIC by default; grant exactly what the site needs.
revoke all on function public.cast_vote(uuid, text, text) from public;
revoke all on function public.vote_results() from public;
revoke all on function public.reset_votes(text) from public;
revoke all on function public.save_status(jsonb, smallint) from public;
grant execute on function public.cast_vote(uuid, text, text) to anon, authenticated;
grant execute on function public.vote_results() to anon, authenticated;
grant execute on function public.reset_votes(text) to authenticated;
grant execute on function public.save_status(jsonb, smallint) to authenticated;
