/** Asks for and applies the visitor's analytics consent, and sends page views once allowed. */
// Libs
import { useCallback, useEffect, useState } from 'react';

// Logic
import { useAnalytics } from './useAnalytics';
import { isMeasurementId } from '@/lib/analytics';
import { deleteAnalyticsCookies, readConsent, writeConsent, type AnalyticsConsent } from '@/lib/analyticsConsent';

// Types
import type { Route } from '@/lib/routes';

/** Consent state for the banner and the footer link. */
export interface AnalyticsConsentState {
  /** True when a measurement id is configured, so there is something to ask about. */
  isAvailable: boolean;
  /** True while the visitor has not answered (and analytics is available). */
  isBannerVisible: boolean;
  accept: () => void;
  refuse: () => void;
  /** Forgets the answer so the banner asks again (footer link). */
  reopen: () => void;
}

/**
 * Loads Google Analytics only when a valid measurement id is configured and the visitor accepted;
 * then reports a page view for every public route. Refusing after accepting deletes GA's cookies
 * and reloads the page, because a loaded tag cannot be unloaded.
 */
export function useAnalyticsConsent(measurementId: string | undefined, route: Route): AnalyticsConsentState {
  const analytics = useAnalytics();

  // State
  const [consent, setConsent] = useState<AnalyticsConsent>(() => (typeof window === 'undefined' ? null : readConsent()));
  const isAvailable = isMeasurementId(measurementId ?? '');
  const isActive = isAvailable && consent === 'granted';

  // Lifecycle: load the tag once allowed, then count the page the visitor is on and every later one.
  useEffect(() => {
    if (!isActive || !measurementId) return;
    analytics.enable(measurementId);
    analytics.pageView(route);
  }, [analytics, isActive, measurementId, route]);

  // Actions
  const accept = useCallback(() => {
    writeConsent('granted');
    setConsent('granted');
  }, []);
  const refuse = useCallback(() => {
    const wasEnabled = analytics.isEnabled;
    writeConsent('denied');
    setConsent('denied');
    if (wasEnabled) {
      deleteAnalyticsCookies();
      window.location.reload();
    }
  }, [analytics]);
  const reopen = useCallback(() => {
    writeConsent(null);
    setConsent(null);
  }, []);

  return { isAvailable, isBannerVisible: isAvailable && consent === null, accept, refuse, reopen };
}
