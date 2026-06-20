import * as Sentry from "@sentry/react";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || "";

export const initSentry = () => {
  if (!SENTRY_DSN) return;

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE || "production",
    release: import.meta.env.VITE_APP_VERSION || "1.0.0",
    // Only send errors in production-like environments
    enabled: import.meta.env.MODE !== "development" || Boolean(import.meta.env.VITE_SENTRY_DEBUG),
    tracesSampleRate: 0.1,
    beforeSend(event) {
      // Strip any PII from breadcrumbs
      return event;
    },
  });
};

export const setSentryUser = (user) => {
  if (!SENTRY_DSN) return;
  if (user) {
    Sentry.setUser({ id: user.uid, email: user.email });
  } else {
    Sentry.setUser(null);
  }
};

export const captureError = (error, context = {}) => {
  if (!SENTRY_DSN) {
    return;
  }
  Sentry.withScope((scope) => {
    Object.entries(context).forEach(([k, v]) => scope.setExtra(k, v));
    Sentry.captureException(error);
  });
};

export const captureMessage = (message, level = "info", context = {}) => {
  if (!SENTRY_DSN) return;
  Sentry.withScope((scope) => {
    scope.setLevel(level);
    Object.entries(context).forEach(([k, v]) => scope.setExtra(k, v));
    Sentry.captureMessage(message);
  });
};

export { Sentry };
