# VI-MP.ro — agent instructions

These instructions apply throughout this repository. Follow them when adding or changing code. Apply
conventions to the work at hand; do not reformat or reorganize unrelated files.

**How this file is organised.** "Project context" is specific to VI-MP.ro. Everything under "Design
rules" is shared with the other projects (it is the same standard as Hermes' and Bindery's); the only
section adapted here is "Supabase back-ends", which takes the place of the Node.js back-end section
because this project has no server of its own. The standard in one list:

- one owner for every long-lived resource, created and closed in one place;
- thin entry points (api calls, handlers) over named workflows over domain code;
- validation at the boundary, errors that map to one message in one place;
- comments that state purpose, decisions and guarantees accurately;
- tests that run the real logic, without network or global state.

## Project context

VI-MP.ro is the landing page of the Romanian GTA VI multiplayer community: a status timeline ("Unde
suntem acum"), selected news, two interest polls (play / develop), a forum poll and a Discord call to
action, plus a control panel (`#/admin`) where admins edit all of it. It is a static single-page app
(Vite + React + TypeScript + Tailwind) published on GitHub Pages. Supabase is the back-end: Postgres
with row level security, a few SQL functions, and Supabase Auth for the admins.

There is no server process. GitHub Actions builds `dist/` on every push to `main` and publishes it
(`.github/workflows/deploy.yml`). Configuration is two public build-time values (`VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY`) plus `VITE_BASE_PATH`; they are repository variables in CI and `.env` locally.

Layout:

```
src/                 React + TypeScript + Tailwind interface, organised by page
  api/               the only code that talks to Supabase: client factory, `api` object, zod row schemas, ApiError
  lib/               plain TypeScript: settings, routes, text registry, status and vote logic, tests beside it
  hooks/             hooks used by two or more pages (site data, texts, news, vote tally, route)
  components/        shared components; layout/ (Header, Footer) and ui/ (primitives)
  pages/             home/, news/, admin/
supabase/migrations/ the schema, row level security, SQL functions and seed data, applied in order
.github/workflows/   test, build and publish to GitHub Pages
```

**Security model.** The anon key ships in the page by design; row level security is the only boundary.
Visitors may read settings, stages, texts and published news, and may vote only through `cast_vote()`;
raw votes are never readable. Every write is allowed only to users listed in `public.admins`
(`public.is_admin()`), and the database enforces that whatever the interface shows. Public sign-up is
disabled in the Supabase dashboard; admins are created by hand (README). The `service_role` key never
appears in this repository, in CI or in the build.

**Texts.** Every visible text has a key and a default in `src/lib/textRegistry.ts`, the single source of
defaults. `public.site_texts` holds only overrides an admin saved; "Text implicit" deletes the row. The
control panel builds its form from the registry, so adding a text is one registry entry plus its use.
Never seed text defaults into SQL: that would make two sources.

**Votes.** Anonymous, deduplicated per browser by a random voter id in localStorage
(`lib/voterId.ts`). Clearing storage allows a new vote. That is accepted for an interest poll; never
present the totals as a secure count. Poll keys (`lib/polls.ts`) match the check constraint on
`public.votes.poll`; changing one means a new migration and the registry together.

**Failure behaviour.** Without Supabase configured, or when it cannot be reached, the page still renders:
texts fall back to the registry defaults, status and news show a short notice, Discord buttons hide.

**No layout shift.** Anything that arrives from the database holds its space before it arrives: the
Discord buttons, the timeline and the news cards render same-sized placeholders (`components/ui/skeleton`,
`NewsCardSkeleton`) while `isPending`. The last loaded settings, stages, texts and news are cached in
localStorage (`api/siteDataCache.ts`, validated with the row schemas) so a returning visitor's first
paint is the real content; fresh data then replaces it. New data-driven blocks follow the same rule.
Check with a hard reload and the layout-shift measurement (CLS) rather than by eye.

**Scrolling and pointer.** Lenis smooths page scrolling (`hooks/useSmoothScroll.ts`, one instance owned by
`App`); it turns itself off for reduced motion and handles clicks on in-page section links. Hash routes
(`#/…`) are left to the browser. The themed cursor and scrollbar live in `style.css`; the cursor applies
only to fine pointers and text fields keep the text cursor.

**Prerender and SEO.** `npm run build` also renders the home page once in Node
(`src/prerender.tsx`, written into `dist/index.html` by `scripts/prerender.ts`) with the default texts
and no data, so crawlers that do not run JavaScript read the content. In the browser `main.tsx`
replaces it with `createRoot` (not hydration: the first client render differs, e.g. stored poll
answers). Code that runs during render must therefore work without `window`; browser APIs belong in
effects, or are guarded as in `useRoute`. Head tags (title, description, Open Graph, JSON-LD) live in
`index.html`; `%SITE_URL%` and `robots.txt`/`sitemap.xml` come from `VITE_SITE_URL` in `vite.config.ts`.
Head tags are build-time: texts edited in the panel do not change them.

Routes are hash routes in `src/lib/routes.ts` (`#/`, `#/noutati`, `#/admin`) so GitHub Pages needs no
rewrite rules. In-page anchors (`#status`, `#noutati`, `#comunitate`) resolve to the home page.
Renaming source folders never changes public URLs.

The admin session is persisted by supabase-js in localStorage; the visitor's own poll answers are
remembered through `lib/browserStorage.ts`. The site works without storage.

# Design rules

## General rules (any language)

### Engineering judgment

You are expected to make architectural decisions, not only follow instructions.

- Read the code that exists before changing it, and verify claims against it. Review feedback, older
  documentation and advice from other tools (including this file) are input, not orders: reproduce a
  concern before acting on it.
- Reject or adapt advice that adds complexity without a benefit, weakens correctness, breaks a feature
  or conflicts with how the application is actually used. Say what you rejected and why.
- Fix confirmed defects with a regression test, and state any intentional behavior change.
- Document the architecture that exists, not one you hope to build. If a rule here is wrong for a case,
  say so and propose the correction instead of working around it silently.
- Keep structural moves (renames, relocations) and behavioral changes in separate steps where practical,
  so each can be reviewed on its own.

### Organize by responsibility

- Keep each file about one responsibility, named for what it does (`statusProgress.ts`, `safeUrl.ts`),
  never for the kind of code it holds. Do not create `helpers`, `utils`, `common`, `misc` or
  `<name>.helpers` files: put the code in the file that owns the responsibility, or name a new file for
  what it does.
- Keep entry points small. `main.tsx` and `App.tsx` wire things together; the implementation lives in
  files named after it.
- Start flat. Add a folder when a group of files has a clear shared purpose and at least three members,
  or when it clearly improves navigation. No empty folders, no folder per file, no layers that only
  forward calls, and no abstraction for a hypothetical second user. Three similar lines beat a
  premature module.
- Put code in one place only. When a second file needs something, move it to the file that owns it and
  import it; never copy it. Promote code to a shared location when a second independent user exists,
  not before.
- Do not reorganize an area unless the task is about it.

### Layers and ownership (all back-ends)

A back-end has four kinds of code. Keep each in its own place and keep dependencies pointing one way.
Here the back-end is Supabase; see "Supabase back-ends" for where each kind lives.

- **Entry points** (HTTP routes, CLI, the `api` object): parse and validate input, call one workflow,
  shape the response. No business rules.
- **Workflows**: one complete use case ("save the status timeline", "cast a vote"): validate, take what
  it needs, do the change and its bookkeeping, all or nothing. Workflows know nothing about HTTP or the
  interface. Do not create a workflow that only forwards to one call.
- **Engine / domain**: the real work and the pure rules (stage states, vote tallies, text resolution).
  It knows nothing about HTTP, request context or logging, so it can be tested without a server.
- **Stateful resources** (database client, connection, caches): each is owned by one application
  context. The context creates them together and hands them out. Nothing else creates them.

Plain functions stay plain functions. Use a class only for something that has state and a lifetime
(or, as with `ApiError`, for an error type).

### Lifecycle and configuration

- Read configuration once, at startup, into one immutable settings object (`lib/settings.ts`). Nothing
  reads the environment afterwards. Tests pass their own values instead of changing the environment.
- Build the application through a factory (`createApi(createSupabaseClient(settings))` in `main.tsx`).
  Each call makes its own resources, so two instances share nothing. Do not construct resources at
  import time.
- Every resource that owns a subscription, connection or handle has an explicit release, called where
  it was created (an effect's cleanup unsubscribes the auth listener).
- State the deployment model in the code and here: how many processes may run, and what state is in
  memory. Enforce it by construction where possible.

### Concurrency and data safety

- Between "check" and "act" another request can run. Never answer "does it exist?" and then act
  separately. Make the check part of the operation (an upsert, a constraint, one SQL function).
- A change that spans several rows or tables happens in one transaction (one SQL function), so readers
  never see half of it. `save_status` replaces the timeline and the current stage together.
- In the interface, an async result can arrive after a newer request or after unmount. Ignore stale
  answers (an `isCurrent` flag in the effect) instead of letting them overwrite newer state.
- Shared state is guarded by the object that owns it. Do not justify safety with "it is atomic enough".
- Anything a client sends is checked again by the database (constraints, row level security), even
  when the interface already validated it.

### Errors and diagnostics

- User-actionable problems raise the project's error type (`ApiError` and subclasses) with a message the
  user can act on. One function (`toApiError`) turns Supabase failures into those messages; components
  show `error.message` and do not build their own from raw errors.
- Catch specific failures. A broad catch is allowed only at a boundary that must keep running (a hook
  loading optional data), and there it keeps the original error as `cause` and logs it. Never hide a
  programming error as "no data".
- Secondary effects (remembering an answer in storage) must not change the outcome of the operation they
  follow: they fail silently or log, and the real outcome is shown first.
- Log through the api layer's `console.error('[api]', …)` with the original error; no stray
  `console.log` in application code.

### Comments and documentation

- Comments state purpose, decisions and guarantees. They do not translate code into English, and they
  never claim more than the code does. Re-read a comment when the code under it changes.
- Put a doc comment on every function, class, interface, type and exported constant: a JSDoc block in
  TypeScript, a `/* … */` block above every SQL function and a `--` header above every SQL section. A
  short description fits on one line.
- Use a longer doc comment when the contract needs it: invariants, side effects, who may call it,
  failure behavior, what an "atomic" or "unique" claim actually covers. Keep such blocks as short as the
  contract allows and wrap at about 100 characters. If a function needs a long explanation because it
  does too much, split the function instead.
- For a variable, constant or one-line registration, a short trailing comment is often clearer than a
  block.
- A function body is not left silent: a short comment above each meaningful step says what it does or
  why ("Restore what was saved before; the error itself was logged by the api layer"). Do not comment
  every line.

### Naming

- Names say what a thing is or does. Avoid abbreviations except well-known ones (id, url, api).
- Booleans read as questions (`isOpen`, `isPublished`, `hasSun`). Functions start with a verb.
- One spelling per concept across the repository (a "stage" is never also a "step"; a "news item" is
  never also a "post").
- Use the shortest clear name. Prefix a name only when it is ambiguous in its scope.
- Database names are snake_case (`is_published`, `current_stage`); TypeScript names are camelCase. The
  zod schemas in `api/types.ts` keep the column names so a row needs no renaming layer.

### Order inside a file

A file reads from the top down: what it is and what it uses, then what it offers, then how it does it.
Group the code under short heading comments in this order, and use a heading only when the file has at
least two groups:

1. A comment saying what the file is for, then the imports.
2. Constants: fixed values.
3. State: only for real module-level state (a cache of pure results). State that has a lifetime belongs
   to the owner that created it, not at module level.
4. The public API: what the file offers to others, main functions first.
5. Internals: private helpers the public functions use.

### Scripts

A script (a build script, a one-off tool) stays a single file, organised in labelled sections with doc
comments on every function. Do not split a script into several files.

### Security

- Treat everything from the network, the browser, storage or the database as untrusted: validate it at
  the boundary, once, and pass clean values inward. Rows are parsed with zod in `api/`; URLs from the
  database pass `safeUrl` before they reach an `href` or `src`.
- Never put secrets in the repository. Configuration comes from environment variables or git-ignored
  files, and `.env.example` documents every variable. Publishable keys are fine; `service_role` never is.

## TypeScript and JavaScript (any runtime)

- Use strict TypeScript. Prefer `unknown` over `any`; narrow instead of casting.
- Use `.ts` for ordinary code and `.tsx` only for files that contain JSX.
- Use type-only imports (`import type`) for type-only dependencies.
- Imports sit at the top, grouped by where they come from, with a short heading comment per group:
  `// Libs` (third-party packages), `// Components`, `// Hooks`, `// Logic` (the project's non-React
  code), `// Types`. Pick the words that fit the file. Add headings when a file has about four or more
  imports or two or more groups; a file with one or two imports needs none. Never label every line.
- Within a group, order imports from shortest to longest. Preserve execution-sensitive order
  (side-effect imports, CSS) over visual sorting.
- Imports: relative inside one page or feature folder, the project alias (`@/`) across boundaries. No
  file extensions in import paths. Do not add `index.ts` barrel files.
- Use JSDoc, not repeated type annotations: describe parameters and returns only for units, constraints
  or side effects that the types do not show.
- Prefer named exports. A default export is for a framework entry that requires it.
- File names. React component files are PascalCase and match their primary export (`NewsCard.tsx`
  exports `NewsCard`). Hooks are camelCase with a `use` prefix (`useVotes.ts`). Utilities and other
  modules are descriptive camelCase (`statusProgress.ts`). Keep the lowercase names of `components/ui`
  primitives. Types and interfaces are PascalCase; true constants are UPPER_SNAKE_CASE.
- Pure logic (parsing, formatting, naming rules, sorting) lives in plain `.ts` files with no UI and no
  network, and has a `*.test.ts` beside it.

## Web apps (React)

Organise primarily by page. Code lives next to the page that uses it; it moves up to a shared folder
only when two independent pages really use it. This is the structure of this project, with the admin
page as the example of a complex page:

```
src/
  main.tsx                      reads settings, builds the api, mounts React; nothing else
  App.tsx                       the shell: loads app-wide data, picks the page for the route, renders
                                the layout components around it
  style.css                     the single stylesheet entry (Tailwind import and theme tokens)
  api/                          supabaseClient.ts, endpoints.ts (the `api` object), types.ts, errors.ts,
                                ApiContext.tsx
  hooks/                        hooks used by two or more pages
  lib/                          plain TypeScript, no React: settings, routes, registries, rules, tests
  components/                   components used by two or more pages (NewsCard, DiscordButton, ...)
    layout/                     the app frame: Header, Footer
    ui/                         primitives with no product knowledge (button, dialog, input, field)
  pages/
    news/NewsPage.tsx           a small page is just its entry component
    home/
      HomePage.tsx              route entry: owns poll state and the results dialog, composes sections
      components/               HeroSection, StatusSection, NewsSection, PollSection, ForumSection, ...
      dialogs/                  VoteResultsDialog
      hooks/                    useVotes (used only by this page)
    admin/                      a complex page keeps its parts beside it
      AdminPage.tsx             session gate and tabs
      LoginForm.tsx
      status/ news/ texts/ settings/ votes/   one folder per tab (one cohesive sub-feature each)
      components/ hooks/        PanelCard, ActionMessage; useSession, useAction
```

These are practical defaults, not a template to copy:

- `App.tsx` stays small. It owns routing and app-wide data, and renders the layout. Frame pieces such as
  the header and footer are components in `components/layout/`, each in its own file; `App.tsx` does not
  contain their markup. The logic that decides what they show stays in `App.tsx` (or a hook) and reaches
  them as props.
- A page is a route entry component under `pages/<page-name>/`, named for the product concept
  (`NewsPage`, not `ListPage`). It owns page-level state and data loading and composes the parts; it
  contains no markup another page could reuse.
- Keep related code close. Page-specific components and hooks stay in the page folder. A cohesive
  sub-feature keeps its components and its hook together (`admin/texts/TextRow.tsx` sits with the panel
  that uses it). Do not promote code to `components/` or `hooks/` on the guess that it might be reused.
- Add folders when they improve navigation. A small page stays a single file. Do not create empty
  folders, a folder per component, or layers merely to make pages look alike.
- Component names use the shortest clear name that is unambiguous where it is used. Add a
  distinguishing word when two components could be confused (`VoteResultsDialog` versus the shared
  `VoteTallyList`). Reconsider a name when its scope or responsibility changes.
- Suffixes say what a component is: `Page` (route entry), `Section` (a band of the landing page),
  `Dialog` (modal interaction), `Form` (editable form), `Panel` (a control panel tab), `Toolbar` (a set
  of related actions). Avoid vague words such as Manager or Handler unless they are accurate.
- One component per file. Small private pieces used only by their parent may stay in it.
- Split by responsibility. A page owns page-level behavior; a section draws one band; a row draws one
  item. Logic with state or effects that two or more components share, or that touches the DOM, goes
  in a hook. A few lines used by one component stay in it.
- State. Local `useState` first; lift to the nearest common parent; move shared state-with-effects to a
  hook (`useVotes`). Use context only for values nearly every component reads (texts, the api).
  Components do not call supabase-js; they use the `api` object through `useApi()`.
- Make later variation a data change. Registries drive the interface (`textRegistry.ts` builds both the
  page texts and the admin form; `polls.ts` lists the polls).
- Never use `dangerouslySetInnerHTML`. Render untrusted text as text. Anything that becomes a URL or CSS
  must be validated first.
- Browser storage is for conveniences only. Access it through `lib/browserStorage.ts` (which never
  throws) and make the page work without it.
- Order inside a component file: imports (grouped); `// Constants`; `interface Props` with a one-line
  doc and a short comment per prop; the JSDoc block saying what the component is and when it exists,
  immediately above `export function`; inside the component `// State`, derived values, `// Lifecycle`
  (useEffect), `// Actions`, then the return; private helpers below under `// Internals`.
- Styling. Tailwind utilities with theme tokens (`bg-card`, `text-muted-foreground`, `text-primary`),
  not hard-coded colors; illustrations (SVG) are the exception. The theme lives in `style.css`. A
  repeated class string that carries meaning becomes a component or a named constant (`Eyebrow`,
  `FIELD_CLASS`). Use `cn()` to merge conditional classes. Inline `style` is only for a runtime value
  (a percentage bar).
- Responsive and accessible by default. Every page works on a phone. Interactive elements are real
  buttons or links, icon-only buttons have an `aria-label` or `title`, toggles expose `aria-pressed`,
  dialogs use the dialog primitive (native `<dialog>`, focus is trapped), and state is never shown by
  color alone (done stages have a check icon, results are written as numbers).
- Dependencies. Bundle everything locally (fonts through `@fontsource`); no CDN links. Add a dependency
  only when it replaces more code than it costs.
- Tests sit beside the code they test. UI-free logic in `lib/` is tested with `node:test` through
  `tsx`; verify changed UI behavior in a browser, at phone width too.

## Supabase back-ends

For a project whose back-end is Supabase, the same standard applies, in these terms. Use the same
layers, ownership, lifecycle, concurrency and error rules from "General rules".

### Where each layer lives

```
supabase/migrations/   the schema, constraints, row level security, SQL functions: the only source of
                       truth for the database. Numbered, applied in order, never edited once applied
src/api/
  supabaseClient.ts    createSupabaseClient(settings): the one place a client is constructed
  endpoints.ts         createApi(client): the `api` object; thin calls to tables and functions
  types.ts             zod schemas for every row and function result; types inferred from them
  errors.ts            ApiError, NotConfiguredError and toApiError (the one error mapping)
  ApiContext.tsx       hands the one instance to components; useApi()
src/lib/               the domain: pure rules over the parsed data, with tests
```

- **Entry points** are the `api` methods: one query or one function call each, results parsed with zod,
  failures turned into `ApiError`. No business rules.
- **Workflows** that touch more than one row or table, or need rights beyond row level security, are SQL
  functions (`save_status`, `cast_vote`, `reset_votes`) so they run in one transaction. A plain
  single-table read or write stays a direct table call guarded by a policy.
- **Domain** rules that only shape data for display live in `src/lib/` and are unit tested.
- **The client** is a stateful resource created once in `main.tsx` from Settings and owned by
  `ApiProvider`. Do not export a ready-made client or `api` from a module.

### Rules

- Row level security is enabled on every table, with a policy per role and operation. A table without a
  policy for a role is closed to it; say so in a comment when that is the intent (`votes`).
- Admin rights come from `public.is_admin()`; every write policy and privileged function checks it.
  The interface's own check (`useSession`) is for display only.
- SQL functions are `security definer` only when they must read or write past row level security, and
  then they pin `set search_path = ''`, use fully qualified names, check rights themselves, and are
  granted explicitly (revoke from `public`, grant to the roles that need them).
- Constraints repeat the interface's validation (lengths, http(s) URLs, allowed values) so a direct API
  call cannot store what the interface would reject.
- Schema changes are a new numbered migration. Seed data (the settings row, starting stages) is a
  migration too; text defaults are not (see "Texts").
- Never use the `service_role` key in this project. If a task seems to need it, it needs a function
  with the right checks instead.
- Typing. String unions for bounded choices (`PollKey`, `NewsSource`) that match the database checks,
  zod at the boundary, and no `any`. Keep the `api` method shapes stable.
- Tests. Pure logic with `node:test`. A change to migrations is checked by applying all of them to a
  scratch Postgres (with a stub `auth` schema and the `anon`/`authenticated` roles) and exercising the
  policies and functions as each role; report it when that was not possible.

## Build and deploy (built in CI, served statically)

- GitHub Pages serves `dist/`. Nothing runs on a server; the workflow in `.github/workflows/deploy.yml`
  tests, builds and publishes on every push to `main`.
- Everything the build needs is a public `VITE_` variable, documented in `.env.example`, set as
  repository variables in CI and in a git-ignored `.env` locally. `VITE_BASE_PATH` is `/` for the
  custom domain and `/<repo>/` for a github.io project page; `VITE_SITE_URL` is the matching public
  address.
- `npm run build` is: typecheck, browser bundle, server bundle of `src/prerender.tsx` into
  `.prerender/`, then `scripts/prerender.ts` (which deletes `.prerender/`).
- Database changes are not deployed by CI: apply new migrations to the Supabase project (SQL editor or
  `supabase db push`) before merging code that depends on them, and say so in the handoff.
- Treat build output (`dist/`, `.prerender/`) as generated and git-ignored. Fix sources, not generated files.
- Commands (from the repository root): `npm run dev`, `npm run typecheck`, `npm test`, `npm run build`,
  `npm run preview`.
- Do not add automatic fixing to the check workflow. Correct the source rather than silencing errors.

## Verification and handoff

- For code changes run `npm run typecheck`, `npm test` and `npm run build` from the repository root.
- For migration changes apply them to a scratch database and exercise them as `anon`, a signed-in
  non-admin and an admin.
- Documentation-only changes need no build.
- Verify changed interface behavior in a browser when you can, on a phone-width viewport as well.
- Report the checks you actually ran, what you could not verify, and anything the user must do (for
  example applying a migration or changing a dashboard setting). Do not claim guarantees or verification
  beyond what the code and the checks support. Keep the final handoff concise: what changed, why, and
  how it was verified.
