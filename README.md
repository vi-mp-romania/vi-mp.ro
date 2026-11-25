# VI-MP.ro

Site-ul comunității române pentru multiplayer GTA VI. Pagină statică (Vite + React) publicată pe
GitHub Pages; conținutul, voturile și panoul de control folosesc Supabase.

- Pagina publică: `#/` (status, noutăți, voturi, forum, Discord) și `#/noutati` (toate noutățile).
- Panoul de control: `#/admin` (status, noutăți, texte, link Discord, imagine hero, voturi).

## Configurare Supabase (o singură dată)

1. Creează un proiect pe [supabase.com](https://supabase.com).
2. În **SQL Editor** rulează, în ordine, `supabase/migrations/0001_schema.sql` și
   `supabase/migrations/0002_seed.sql` (sau `supabase db push` dacă folosești Supabase CLI).
3. **Authentication → Sign In / Providers → Email**: dezactivează *Allow new users to sign up*.
   Altfel oricine își poate face cont (deși nu ar avea drepturi de admin).
4. **Authentication → Users → Add user**: creează contul de admin (email + parolă).
5. Dă-i drepturi de admin, în SQL Editor:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'adresa@ta.ro';
   ```
6. Din **Project Settings → API** copiază *Project URL* și cheia *anon / publishable*.
   Cheia `service_role` nu se pune niciodată în acest proiect.

## Dezvoltare locală

```sh
cp .env.example .env   # completează VITE_SUPABASE_URL și VITE_SUPABASE_ANON_KEY
npm install
npm run dev            # http://localhost:5173
npm run typecheck && npm test && npm run build
```

Fără `.env` site-ul pornește cu textele implicite și arată că nu e conectat la baza de date.

## Publicare pe GitHub Pages

1. **Settings → Pages → Source: GitHub Actions**.
2. **Settings → Secrets and variables → Actions → Variables**: adaugă `VITE_SUPABASE_URL`,
   `VITE_SUPABASE_ANON_KEY` și, doar pentru o adresă `user.github.io/<repo>/`, `VITE_BASE_PATH=/<repo>/`
   și `VITE_SITE_URL=https://<user>.github.io/<repo>` (implicit `https://vi-mp.ro`).
3. Pentru domeniul `vi-mp.ro`: **Settings → Pages → Custom domain** și înregistrările DNS indicate de GitHub.
4. Fiecare push pe `main` rulează testele, construiește și publică (`.github/workflows/deploy.yml`).

## SEO și previzualizări de link

- `npm run build` scrie în `dist/index.html` prima pagină deja randată (cu textele implicite), ca
  motoarele de căutare și Discord/Facebook să vadă conținutul fără JavaScript. În browser, pagina
  live o înlocuiește imediat cu textele din baza de date.
- Titlul, descrierea, tag-urile Open Graph și datele structurate sunt în `index.html`; adresa site-ului
  vine din `VITE_SITE_URL`. `robots.txt` și `sitemap.xml` sunt generate la build (`vite.config.ts`).
- Imaginea de previzualizare este `public/og-image.png` (1200×630): o captură a începutului paginii.
  Pentru a o reface după o schimbare de design:
  `chromium --headless --hide-scrollbars --window-size=1200,630 --screenshot=public/og-image.png http://localhost:5173/`
- Textele schimbate din panou nu ajung în titlul/descrierea din `index.html`; acelea se schimbă în cod.

## Google Analytics

1. Rulează `supabase/migrations/0003_analytics.sql` în SQL Editor (adaugă setarea).
2. În Google Analytics creează o proprietate GA4 cu un *Web data stream* pentru `https://vi-mp.ro`
   și copiază *Measurement ID* (`G-XXXXXXXXXX`).
3. Panou → **Setări → Google Analytics**: lipește ID-ul și salvează.

Vizitatorii văd un banner „Accept / Refuz”; Google Analytics se încarcă doar după „Accept”. Linkul
„Cookie-uri” din subsol îi lasă să se răzgândească. Se trimit vizualizări de pagină (`/` și
`/noutati`, niciodată panoul) și evenimentele `discord_click`, `poll_vote`, `poll_results_open`,
`news_video_play`, `news_link_click`. ID gol = fără analytics și fără banner.

## Ce se schimbă din panou

| Tab | Ce editează |
| --- | --- |
| Status | etapele din „Unde suntem acum” și până unde sunt gata |
| Noutăți | adaugă, editează, publică/ascunde, șterge, ordonează |
| Texte | orice text de pe site; „Text implicit” revine la varianta din cod |
| Setări | linkul de invitație Discord (gol = butoane ascunse) și imaginea hero |
| Voturi | rezultatele și resetarea pe întrebare |

Voturile sunt anonime și unice per browser (un id păstrat în localStorage): cine își șterge datele
browserului poate vota din nou. Sunt un sondaj de interes, nu o numărătoare sigură.
