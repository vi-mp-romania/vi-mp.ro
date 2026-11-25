# VI-MP.ro

Site-ul comunității române pentru multiplayer GTA VI. Pagină statică (Vite + React) publicată pe
GitHub Pages; conținutul, voturile și panoul de control folosesc Supabase.

- Pagina publică: `/` (status, noutăți, voturi, forum, întrebări, Discord), `/noutati/` (toate
  noutățile) și `/noutati/<link>/` (o pagină pentru fiecare noutate).
- Panoul de control: `/admin/` (status, noutăți, întrebări, texte, setări, voturi).

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

## Admini și parole

- **Setare obligatorie în Supabase** (Authentication → URL Configuration): *Site URL* = `https://vi-mp.ro`;
  la *Redirect URLs* adaugă `https://vi-mp.ro/**` (și `http://localhost:5173/**` pentru teste locale).
  Fără ele, linkurile din emailuri duc la `localhost:3000`.
- **Parolă uitată:** pe `vi-mp.ro/admin/` → „Ai uitat parola?” → linkul din email deschide panoul și
  cere o parolă nouă. Linkurile expiră (implicit într-o oră) și merg o singură dată.
- **Schimbă parola:** din panou, butonul „Schimbă parola”.
- **Admin nou:** Authentication → Users → *Invite user* (primește un email și își alege singur parola),
  apoi în SQL Editor: `insert into public.admins (user_id) select id from auth.users where email = '…';`
- Emailurile trimise de serverul implicit Supabase sunt limitate (câteva pe oră); pentru mai multe,
  configurează un SMTP propriu în Supabase.

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

## Pagini, SEO și Google

- Adrese reale: `/`, `/noutati/`, `/noutati/<link>/` (o pagină pentru fiecare noutate), `/admin/`.
  Linkurile vechi `#/noutati` redirecționează automat.
- La fiecare build (push, manual sau zilnic la 03:17 UTC) se generează din baza de date toate paginile,
  cu titlu, descriere și date structurate proprii, plus `sitemap.xml` și `robots.txt`.
- Ce scrie Google în rezultate se schimbă din panou: **Texte → Google**. Secțiunea „Întrebări
  frecvente” se editează din tabul **Întrebări**.
- Pași în afara codului (cei mai importanți pentru poziția în Google): verifică domeniul în
  [Google Search Console](https://search.google.com/search-console) și trimite
  `https://vi-mp.ro/sitemap.xml`; la fel în Bing Webmaster Tools; obține linkuri spre vi-mp.ro
  (descrierea serverului de Discord, listări Discord, Reddit, YouTube/TikTok, forumuri de gaming).

## Ce se schimbă din panou

| Tab | Ce editează |
| --- | --- |
| Status | etapele din „Unde suntem acum” și până unde sunt gata |
| Noutăți | adaugă, editează (link pagină, text pagină, imagine cu upload), publică/ascunde, ordonează |
| Întrebări | întrebările frecvente de pe prima pagină (și pentru Google) |
| Texte | orice text de pe site; „Text implicit” revine la varianta din cod |
| Setări | linkul de invitație Discord (gol = butoane ascunse), imaginea hero (cu upload), Google Analytics |
| Voturi | rezultatele și resetarea pe întrebare |

Voturile sunt anonime și unice per browser (un id păstrat în localStorage): cine își șterge datele
browserului poate vota din nou. Sunt un sondaj de interes, nu o numărătoare sigură.
