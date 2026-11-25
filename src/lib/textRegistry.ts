/**
 * Every editable text on the site, with its default. This is the single source of defaults: the
 * database (public.site_texts) holds only the texts an admin changed, and the control panel builds
 * its form from this list. Adding a text is one entry here plus its use in a component.
 */

/** A group of texts, shown together in the control panel. */
export type TextSection = 'header' | 'hero' | 'status' | 'news' | 'polls' | 'forum' | 'discord' | 'footer';

/** One editable text. */
export interface TextEntry {
  /** Label in the control panel. */
  label: string;
  section: TextSection;
  /** The text shown until an admin changes it. */
  value: string;
  /** True when the panel should offer a multi-line field. */
  isLong?: boolean;
}

/** Control panel heading for each section, in display order. */
export const TEXT_SECTIONS: Readonly<Record<TextSection, string>> = {
  header: 'Antet',
  hero: 'Prima secțiune (hero)',
  status: 'Unde suntem acum',
  news: 'Noutăți',
  polls: 'Voturi',
  forum: 'Forum',
  discord: 'Discord',
  footer: 'Subsol',
};

/** Every text on the site, by key. Keys are camelCase with dots; the DB checks the same shape. */
export const TEXT_REGISTRY = {
  'header.navStatus': { section: 'header', label: 'Meniu: Status', value: 'Status' },
  'header.navNews': { section: 'header', label: 'Meniu: Noutăți', value: 'Noutăți' },
  'header.navCommunity': { section: 'header', label: 'Meniu: Comunitate', value: 'Comunitate' },
  'header.discordButton': { section: 'header', label: 'Buton Discord', value: 'Intră pe Discord' },

  'hero.eyebrow': { section: 'hero', label: 'Supratitlu', value: 'VI-MP.ro · Comunitatea română GTA VI' },
  'hero.titleLine1': { section: 'hero', label: 'Titlu, rândul 1', value: 'Welcome to' },
  'hero.titleLine2': { section: 'hero', label: 'Titlu, rândul 2 (roz)', value: 'Vice City.' },
  'hero.description': {
    section: 'hero',
    label: 'Descriere',
    value:
      'Construim de acum comunitatea pentru viitorul multiplayer GTA VI. Un loc pentru jucători, ' +
      'developeri și cei care vor să pornească un server.',
    isLong: true,
  },
  'hero.discordButton': { section: 'hero', label: 'Buton Discord', value: 'Intră pe Discord' },
  'hero.newsLink': { section: 'hero', label: 'Link către noutăți', value: 'Vezi noutățile' },

  'status.title': { section: 'status', label: 'Titlu', value: 'Unde suntem acum' },
  'status.hereMarker': { section: 'status', label: 'Eticheta „suntem aici”', value: 'Suntem aici' },
  'status.cardEyebrow': { section: 'status', label: 'Card: supratitlu', value: 'Înainte să cauți un server' },
  'status.cardTitle': {
    section: 'status',
    label: 'Card: titlu',
    value: 'Multiplayerul nu este disponibil încă.',
  },
  'status.cardMessage': {
    section: 'status',
    label: 'Card: mesaj',
    value:
      'Comunitatea este în pregătire. Aici urmărim noutățile și ne adunăm până când vom putea juca împreună.',
    isLong: true,
  },
  'status.note': { section: 'status', label: 'Notă sub card (gol = ascunsă)', value: '' },

  'news.title': { section: 'news', label: 'Titlu', value: 'Noutăți de urmărit' },
  'news.subtitle': { section: 'news', label: 'Subtitlu', value: 'Clipuri, discuții și linkuri selectate de noi.' },
  'news.seeAll': { section: 'news', label: 'Link „vezi toate”', value: 'Vezi toate' },
  'news.empty': { section: 'news', label: 'Mesaj când nu sunt noutăți', value: 'Încă nu am publicat noutăți.' },
  'news.pageTitle': { section: 'news', label: 'Pagina de noutăți: titlu', value: 'Toate noutățile' },
  'news.backHome': { section: 'news', label: 'Pagina de noutăți: înapoi', value: 'Înapoi acasă' },

  'polls.eyebrow': { section: 'polls', label: 'Supratitlu', value: 'Joacă sau construiește' },
  'polls.title': { section: 'polls', label: 'Titlu', value: 'Te bagi când apare multiplayerul?' },
  'polls.subtitle': { section: 'polls', label: 'Subtitlu', value: 'Vrem să știm câți suntem și ce ne interesează.' },
  'polls.playQuestion': { section: 'polls', label: 'Întrebare jucători', value: 'Vrei să joci pe servere GTA VI?' },
  'polls.playHint': {
    section: 'polls',
    label: 'Detaliu jucători',
    value: 'Spune-ne dacă ai vrea să te alături ca jucător.',
  },
  'polls.developQuestion': {
    section: 'polls',
    label: 'Întrebare developeri',
    value: 'Vrei să dezvolți un server sau să ajuți la unul?',
  },
  'polls.developHint': {
    section: 'polls',
    label: 'Detaliu developeri',
    value: 'Pentru developeri, fondatori și cei care vor să învețe.',
  },
  'polls.yes': { section: 'polls', label: 'Buton Da', value: 'Da' },
  'polls.no': { section: 'polls', label: 'Buton Nu', value: 'Nu' },
  'polls.note': { section: 'polls', label: 'Notă', value: 'Poți răspunde separat la fiecare întrebare.' },
  'polls.resultsButton': { section: 'polls', label: 'Buton rezultate', value: 'Vezi rezultate' },
  'polls.resultsNote': {
    section: 'polls',
    label: 'Notă rezultate',
    value: 'Interesul jucătorilor și al developerilor, într-un singur loc.',
  },
  'polls.resultsTitle': { section: 'polls', label: 'Fereastra rezultate: titlu', value: 'Rezultate' },
  'polls.thanks': { section: 'polls', label: 'Mesaj după vot', value: 'Mulțumim! Votul tău a fost salvat.' },
  'polls.error': {
    section: 'polls',
    label: 'Mesaj eroare vot',
    value: 'Votul nu a putut fi salvat. Încearcă din nou.',
  },

  'forum.eyebrow': { section: 'forum', label: 'Supratitlu', value: 'Feedback comunitate' },
  'forum.title': { section: 'forum', label: 'Titlu', value: 'Facem și un forum?' },
  'forum.description': {
    section: 'forum',
    label: 'Descriere',
    value: 'Un loc pe VI-MP.ro pentru tutoriale, proiecte și prezentări de servere. Ți-ar fi util?',
    isLong: true,
  },
  'forum.yes': { section: 'forum', label: 'Buton Da', value: 'Da, vreau un forum' },
  'forum.no': { section: 'forum', label: 'Buton Nu', value: 'Prefer doar Discord' },
  'forum.previewTitle': { section: 'forum', label: 'Previzualizare: titlu', value: 'Forum' },
  'forum.previewBadge': { section: 'forum', label: 'Previzualizare: etichetă', value: 'Concept' },
  'forum.previewTutorials': { section: 'forum', label: 'Previzualizare: rând 1', value: 'Tutoriale' },
  'forum.previewProjects': { section: 'forum', label: 'Previzualizare: rând 2', value: 'Proiecte' },
  'forum.previewServers': { section: 'forum', label: 'Previzualizare: rând 3', value: 'Servere' },

  'discord.title': { section: 'discord', label: 'Titlu', value: 'Ne găsești pe Discord.' },
  'discord.subtitle': {
    section: 'discord',
    label: 'Subtitlu',
    value: 'Intră, salută și spune-ne ce ai vrea să construim.',
  },
  'discord.button': { section: 'discord', label: 'Buton', value: 'Hai în comunitate' },

  'footer.brand': { section: 'footer', label: 'Nume', value: 'VI-MP.ro' },
  'footer.disclaimer': {
    section: 'footer',
    label: 'Mențiune',
    value: 'Comunitate independentă, neafiliată Rockstar Games.',
  },
  'footer.discordLink': { section: 'footer', label: 'Link Discord', value: 'Discord' },
} as const satisfies Record<string, TextEntry>;

/** Key of an editable text. */
export type TextKey = keyof typeof TEXT_REGISTRY;

/** Every text key, in registry order. */
export const TEXT_KEYS = Object.keys(TEXT_REGISTRY) as TextKey[];
