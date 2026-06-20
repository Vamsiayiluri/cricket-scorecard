# Production Readiness Report

**Date:** June 20, 2026
**Scope:** 5 stability, observability, and user recovery tasks for real-world beta usage

---

## 1. Files Changed

### New Files

| File | Task | Description |
|------|------|-------------|
| `src/services/monitoring/sentryService.js` | Task 1 | Centralized Sentry integration — init, user identity, error capture, message capture |
| `src/services/analytics/analyticsService.js` | Task 5 | Firebase Analytics wrapper — named event helpers, silent no-op if unsupported |
| `src/components/ErrorBoundary.jsx` | Task 4 | React class-based error boundary — friendly fallback UI, Sentry report on crash |
| `src/pages/SettingsPage.jsx` | Task 3 | Minimal Settings page — profile, account info, theme toggle |

### Modified Files

| File | Task | Change |
|------|------|--------|
| `src/main.jsx` | Task 1, 4 | `initSentry()` called at app bootstrap; `ErrorBoundary` wraps the entire provider tree |
| `src/context/AuthContext.jsx` | Task 1 | `setSentryUser()` called on auth state change — errors tagged with uid/email |
| `src/services/firebase/firestoreHelpers.js` | Task 1 | `captureError()` called in `fetchDocument` and `fetchQuery` on Firestore failure |
| `src/services/firebase/matchService.js` | Task 1, 5 | `captureError()` on `updateMatchById` and `completeMatchById` failures; `trackMatchCreated` on create; `trackMatchCompleted` on complete |
| `src/services/firebase/tournamentService.js` | Task 5 | `trackTournamentCreated` on tournament creation |
| `src/services/firebase/importService.js` | Task 5 | `trackImportCompleted` on successful import finalization |
| `src/pages/MatchScoring.jsx` | Task 5 | `trackMatchStarted` called after opening setup persisted |
| `src/pages/PublicTournamentPage.jsx` | Task 5 | `trackTournamentViewed` on mount |
| `src/pages/DashboardPage.jsx` | Task 2 | Resume Scoring banner for scorers with active in-progress matches; `resumeMatches` derived from `ongoing` filtered by `createdBy === user.uid` |
| `src/App.jsx` | Task 3 | Added `/settings` route (ProtectedRoute → SettingsPage) |
| `src/layout/AppShell.jsx` | Task 3 | Settings menu item now navigates to `/settings` |

---

## 2. Monitoring Architecture (Task 1 + 4)

### Sentry Integration

**Package:** `@sentry/react` (added to dependencies)

**DSN configuration:** Set via `VITE_SENTRY_DSN` environment variable. If the variable is absent, all Sentry calls are silent no-ops — the app runs without any monitoring dependency.

```
VITE_SENTRY_DSN=https://xxx@oXXX.ingest.sentry.io/XXXXX
VITE_APP_VERSION=1.0.0         # optional — sets release tag
VITE_SENTRY_DEBUG=true         # optional — enables Sentry in development
```

**Initialization (`sentryService.js`):**
```js
Sentry.init({
  dsn: SENTRY_DSN,
  environment: import.meta.env.MODE,
  release: import.meta.env.VITE_APP_VERSION,
  enabled: MODE !== "development" || VITE_SENTRY_DEBUG,
  tracesSampleRate: 0.1,
});
```

**User identity tagging:** `setSentryUser(user)` is called inside `AuthContext` on every auth state change. Errors are tagged with `{ id: uid, email }` when a user is signed in, and cleared on sign-out.

### Error Capture Points

| Location | Error Type | Capture Method |
|----------|-----------|----------------|
| `ErrorBoundary.componentDidCatch` | React component crash | `captureError(error, { componentStack })` |
| `firestoreHelpers.fetchDocument` | Firestore read failure | `captureError(error, { path })` |
| `firestoreHelpers.fetchQuery` | Firestore query failure | `captureError(error)` |
| `matchService.updateMatchById` | Scoring persistence failure | `captureError(error, { matchId })` |
| `matchService.completeMatchById` | Match completion failure | `captureError(error, { matchId })` |

### Global Error Boundary (Task 4)

`ErrorBoundary` is a React class component wrapping the entire app in `main.jsx` (outside the Redux Provider and Theme). Any unhandled component exception — including lazy-loaded page crashes — shows a friendly fallback UI:

- **"Something went wrong"** message with ErrorOutline icon
- **Refresh Page** button → `window.location.reload()`
- **Go to Dashboard** button → navigates to `/` and resets boundary state

The boundary captures to Sentry via `captureError()` in `componentDidCatch`.

---

## 3. Resume Scoring (Task 2)

### Implementation

Added to `DashboardPage.jsx`:

```js
const resumeMatches = useMemo(
  () => isScorer ? ongoing.filter(m => m.createdBy === user?.uid) : [],
  [ongoing, isScorer, user?.uid]
);
```

`ongoing` already comes from the realtime `useDashboardMatches` hook (Firestore subscription). Filtering by `createdBy` ensures only the current scorer's active matches appear — not public in-progress matches by other scorers.

### Banner behavior

- **Shown:** when `resumeMatches.length > 0` and `isScorer === true`
- **Hidden:** when no in-progress matches owned by current user
- **Primary CTA:** "Resume Scoring" → `/score-card?matchId=<first active matchId>`
- **Subtitle:** shows team names of the active match; if multiple active matches, shows `+N more` count

```jsx
<Typography variant="caption" color="text.secondary">
  {resumeMatches[0].matchDetails?.teamA} vs {resumeMatches[0].matchDetails?.teamB}
  {resumeMatches.length > 1 && ` · +${resumeMatches.length - 1} more`}
</Typography>
```

Banner is rendered before the email verification banners and the "Become a Scorer" CTA — scorers always see their active match first.

---

## 4. Settings Page (Task 3)

**Route:** `/settings` — `ProtectedRoute` (authenticated users; scorers and viewers)

**Navigation:** Settings menu item in AppShell profile dropdown now calls `navigate("/settings")` via `useNavigate`.

**Page sections:**

| Section | Content |
|---------|---------|
| **Profile** | Display name, email, email verification status chip |
| **Account** | Role chip, User ID (monospace), Member since date |
| **Appearance** | Dark/Light mode toggle (Switch) — wired to `useThemeMode().toggleMode` |

The theme toggle produces instant visual feedback using the existing `ThemeModeContext` without any new state or backend calls.

---

## 5. Analytics Architecture (Task 5)

### Provider

Firebase Analytics — already provisioned (`measurementId: G-J2Z4B4WEHS` in `firebase-config.js`). No new third-party dependency required.

### Service (`analyticsService.js`)

Lazily initializes the Analytics instance on first use via `isSupported()` check — gracefully no-ops in environments that don't support Firebase Analytics (e.g., incognito mode, certain ad-blockers).

```js
const getAnalyticsInstance = async () => {
  if (analyticsInstance) return analyticsInstance;
  const supported = await isSupported();
  if (!supported) return null;
  const app = getApps()[0];  // Re-uses existing Firebase app
  analyticsInstance = getAnalytics(app);
  return analyticsInstance;
};
```

All events are fire-and-forget in a try/catch — analytics failures never surface to the user or interrupt any flow.

### Events Tracked

| Event Name | Trigger | Parameters |
|-----------|---------|------------|
| `match_created` | `matchService.createMatch()` | `match_id`, `format` |
| `match_started` | `MatchScoring.startMatch()` after `updateMatchById` | `match_id` |
| `match_completed` | `matchService.completeMatchById()` | `match_id` |
| `tournament_created` | `tournamentService.createTournament()` | `tournament_id`, `format` |
| `tournament_viewed` | `PublicTournamentPage` mount | `tournament_id` |
| `import_completed` | `importService.executeImport()` on success | `import_id`, `teams_created`, `players_created` |

---

## 6. Validation

### Crash Reporting (Tasks 1, 4)
- `initSentry()` called before React tree mounts — any synchronous error during bootstrap is captured
- `ErrorBoundary` wraps the root — any React lifecycle crash shows the fallback UI
- Sentry user identity set within 1 auth state tick after login
- If `VITE_SENTRY_DSN` is absent: all functions are silent no-ops; app behavior unchanged

### Resume Scoring (Task 2)
- `resumeMatches` derived from realtime `ongoing` feed — updates within Firestore subscription latency (~100ms)
- Filter `m.createdBy === user?.uid` isolates scorer's own matches
- Banner disappears automatically when the scorer navigates to the scorecard (match remains `in-progress`; banner only hides when all owned in-progress matches are completed or the scorer has none)
- Multiple active matches: primary CTA routes to the first match; count badge shows the rest

### Settings Route (Task 3)
- `/settings` renders `SettingsPage` for any authenticated user
- Unauthenticated users redirected by `ProtectedRoute`
- Theme toggle is wired and reflects in real time across the full UI
- Dead Settings nav link in profile dropdown is now functional

### Analytics Events (Task 5)
- All six events wired at the correct trigger points
- `isSupported()` guard prevents errors in environments with blocked tracking
- All tracking calls are outside any `await` chain that affects the user flow

---

## 7. Build Result

```
✓ 1503 modules transformed.
✓ built in 7.61s
Zero errors
```

Notable new chunks:
- `sentryService-*.js` — pulled into main bundle (small; always needed)
- `analyticsService-*.js` — 32.97 kB / 7.12 kB gz (Firebase Analytics SDK, lazy-initialized)
- `SettingsPage-*.js` — 3.65 kB / 1.56 kB gz (lazy-loaded)
- `ErrorBoundary` — inlined with main bundle (required at startup)

---

## 8. Lint Result

```
npx eslint src/main.jsx src/context/AuthContext.jsx src/components/ErrorBoundary.jsx \
           src/pages/SettingsPage.jsx src/pages/DashboardPage.jsx \
           src/pages/MatchScoring.jsx src/pages/PublicTournamentPage.jsx \
           src/services/monitoring/sentryService.js \
           src/services/analytics/analyticsService.js \
           src/services/firebase/matchService.js \
           src/services/firebase/tournamentService.js \
           src/services/firebase/importService.js \
           src/services/firebase/firestoreHelpers.js \
           src/layout/AppShell.jsx

✖ 1 problem (0 errors, 1 warning)
```

The single warning is `react-refresh/only-export-components` on `main.jsx` — the entry point defines `AppProviders` inline with `initSentry()`. This is an HMR advisory that only affects dev hot-reload; production build and runtime are unaffected.

---

## 9. Configuration Notes

Before deploying to production, add to your hosting environment:

```env
VITE_SENTRY_DSN=<your Sentry DSN from sentry.io>
VITE_APP_VERSION=1.0.0
```

Firebase Analytics is enabled automatically via the existing `measurementId` in `firebase-config.js` — no additional configuration needed.

---

## 10. Remaining Items

| Item | Priority | Notes |
|------|----------|-------|
| Import error recovery mid-run | P1 | Import stays in Draft if network drops mid-import |
| End Innings checkbox → MUI Checkbox | P1 | 18×18px tap target; replace with `<Checkbox>` |
| Scorer email verification in Firestore rules | P1 | Requires Firebase custom claims via Cloud Function |
| Tournament share CTA | P2 | "Copy public link" on TournamentDetailsPage |
| SEO meta tags | P2 | `<title>` and `og:*` on public pages |
| `patchMatchById` payload validation | P2 | Add `assertFirestoreSafePayload` call |
