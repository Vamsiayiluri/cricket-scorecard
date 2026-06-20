import { getAnalytics, logEvent, isSupported } from "firebase/analytics";
import { getApps } from "firebase/app";

// Lazy-initialized analytics instance (not all browsers support it)
let analyticsInstance = null;

const getAnalyticsInstance = async () => {
  if (analyticsInstance) return analyticsInstance;
  try {
    const supported = await isSupported();
    if (!supported) return null;
    // Re-use the existing Firebase app (already initialized in firebase-config.js)
    const app = getApps()[0];
    if (!app) return null;
    analyticsInstance = getAnalytics(app);
    return analyticsInstance;
  } catch {
    return null;
  }
};

/**
 * Track a named analytics event with optional properties.
 * Silently no-ops if Firebase Analytics is not supported or not configured.
 */
export const trackEvent = async (eventName, params = {}) => {
  try {
    const analytics = await getAnalyticsInstance();
    if (!analytics) return;
    logEvent(analytics, eventName, {
      ...params,
      timestamp: Date.now(),
    });
  } catch {
    // Analytics failures must never surface to the user
  }
};

// ── Named event helpers ────────────────────────────────────────────────────────

export const ANALYTICS_EVENTS = {
  MATCH_CREATED: "match_created",
  MATCH_STARTED: "match_started",
  MATCH_COMPLETED: "match_completed",
  TOURNAMENT_CREATED: "tournament_created",
  TOURNAMENT_VIEWED: "tournament_viewed",
  IMPORT_COMPLETED: "import_completed",
};

export const trackMatchCreated = (params = {}) =>
  trackEvent(ANALYTICS_EVENTS.MATCH_CREATED, params);

export const trackMatchStarted = (params = {}) =>
  trackEvent(ANALYTICS_EVENTS.MATCH_STARTED, params);

export const trackMatchCompleted = (params = {}) =>
  trackEvent(ANALYTICS_EVENTS.MATCH_COMPLETED, params);

export const trackTournamentCreated = (params = {}) =>
  trackEvent(ANALYTICS_EVENTS.TOURNAMENT_CREATED, params);

export const trackTournamentViewed = (params = {}) =>
  trackEvent(ANALYTICS_EVENTS.TOURNAMENT_VIEWED, params);

export const trackImportCompleted = (params = {}) =>
  trackEvent(ANALYTICS_EVENTS.IMPORT_COMPLETED, params);
