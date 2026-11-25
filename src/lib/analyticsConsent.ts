/** The visitor's answer to the analytics cookie question, kept in localStorage. */
import { readStored, writeStored } from './browserStorage';

// Constants
const CONSENT_KEY = 'vimp.analyticsConsent';

/** The visitor's choice; null until they answer. */
export type AnalyticsConsent = 'granted' | 'denied' | null;

/** The stored choice, or null when there is none (or storage is unavailable). */
export function readConsent(): AnalyticsConsent {
  const stored = readStored(CONSENT_KEY);
  return stored === 'granted' || stored === 'denied' ? stored : null;
}

/** Stores the choice; null forgets it, so the banner asks again. */
export function writeConsent(consent: AnalyticsConsent): void {
  writeStored(CONSENT_KEY, consent ?? '');
}

/**
 * Deletes the cookies GA set on this site (_ga, _ga_<id>). They live on the registrable domain,
 * so each is expired for the current host and its parent domains.
 */
export function deleteAnalyticsCookies(): void {
  const names = document.cookie
    .split(';')
    .map((cookie) => cookie.split('=')[0]?.trim() ?? '')
    .filter((name) => name === '_ga' || name.startsWith('_ga_'));
  const labels = window.location.hostname.split('.');
  const domains = labels.map((_, index) => labels.slice(index).join('.')).filter((domain) => domain.includes('.'));
  for (const name of names) {
    document.cookie = `${name}=; Max-Age=0; path=/`;
    for (const domain of domains) document.cookie = `${name}=; Max-Age=0; path=/; domain=.${domain}`;
  }
}
