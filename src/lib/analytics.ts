/**
 * Google Analytics 4 for the public pages. Nothing from Google is loaded until `enable` is called,
 * which the app does only after the visitor accepted analytics cookies. Until then, and when no
 * measurement id is configured, every call is a no-op. Page views are sent by hand because the
 * site uses hash routes, which GA would not see as separate pages.
 */
import type { Route } from './routes';

// Constants
const MEASUREMENT_ID = /^G-[A-Z0-9]{4,20}$/; // same rule as the check on site_settings.ga_measurement_id
const TAG_URL = 'https://www.googletagmanager.com/gtag/js?id=';

/** Path reported to GA for each public page. The control panel is never tracked. */
const PAGE_PATHS: Readonly<Partial<Record<Route, string>>> = { home: '/', news: '/noutati' };

/** An event GA records, with its parameters. */
export type AnalyticsEvent =
  | { name: 'discord_click'; params: { placement: DiscordPlacement } }
  | { name: 'poll_vote'; params: { poll: string; answer: string } }
  | { name: 'poll_results_open'; params?: undefined }
  | { name: 'news_video_play'; params: { news_title: string } }
  | { name: 'news_link_click'; params: { news_title: string; link_url: string } };

/** Where a Discord button sits on the page. */
export type DiscordPlacement = 'header' | 'hero' | 'community' | 'footer';

/** The analytics resource the app owns (one per page load). */
export interface Analytics {
  /** Loads Google's tag for this id; later calls with any id do nothing. */
  enable: (measurementId: string) => void;
  /** True once `enable` has loaded the tag. */
  readonly isEnabled: boolean;
  /** Records a view of a public page; ignored for the control panel and while disabled. */
  pageView: (route: Route) => void;
  /** Records an event; ignored while disabled. */
  track: (event: AnalyticsEvent) => void;
}

/** True for a GA4 measurement id ("G-" and 4–20 capitals or digits). */
export function isMeasurementId(value: string): boolean {
  return MEASUREMENT_ID.test(value);
}

/** Creates the analytics resource for this page load, disabled until `enable`. */
export function createAnalytics(): Analytics {
  let gtag: ((...args: unknown[]) => void) | null = null; // set once the tag is loaded

  return {
    enable(measurementId) {
      if (gtag || !isMeasurementId(measurementId)) return;
      // The standard GA4 snippet: a dataLayer queue, then Google's script reads it when it loads.
      const target = window as unknown as { dataLayer?: unknown[] };
      target.dataLayer = target.dataLayer ?? [];
      const queue = target.dataLayer;
      gtag = function gtagQueue() {
        // GA requires the `arguments` object itself, not a copied array.
        queue.push(arguments);
      };
      gtag('js', new Date());
      gtag('config', measurementId, { send_page_view: false });
      const script = document.createElement('script');
      script.async = true;
      script.src = TAG_URL + encodeURIComponent(measurementId);
      document.head.append(script);
    },
    get isEnabled() {
      return gtag !== null;
    },
    pageView(route) {
      const path = PAGE_PATHS[route];
      if (!gtag || path === undefined) return;
      gtag('event', 'page_view', {
        page_path: path,
        page_location: `${window.location.origin}${path}`,
        page_title: document.title,
      });
    },
    track(event) {
      gtag?.('event', event.name, event.params ?? {});
    },
  };
}
