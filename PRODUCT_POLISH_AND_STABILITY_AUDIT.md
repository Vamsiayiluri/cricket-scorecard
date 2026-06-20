# Product Polish & Stability Audit

**Date:** June 20, 2026  
**Scope:** Navigation, Header, Sidebar, Dashboard, Mobile UX, Stability Gaps, Quick Wins  
**Method:** Read-only code review across 25+ source files  
**Note:** This is an audit document only. No code was changed.

---

## 1. Navigation Audit

### Current Structure

**Authenticated Scorer (9 nav items):**
Dashboard → Discover → Notifications → Create Match → Tournaments → My Teams → My Players → AA Import → Import History

**Authenticated Viewer (3 nav items):**
Dashboard → Discover → Notifications

**Public (no nav):**
AppShell hides sidebar and bottom nav on public pages (`isPublicPage` flag).

### Observed Problems

**1.1 Bottom mobile nav overflows for scorers**  
9 items rendered with `flex: 1` each inside a horizontal row. On a 375px screen this gives each button ~41px — enough for an icon but not a label. The current implementation renders both icon and label for each item. The result is severe horizontal overflow and illegible text. Viewers (3 items) are fine.

**1.2 No active-item highlight on mobile bottom nav**  
Desktop sidebar uses MUI `selected` prop on ListItemButton for active state. Mobile bottom nav uses `Button` components with no active/selected state — the user cannot tell which section they are in.

**1.3 Import History appears in primary nav**  
"Import History" is a utility page, not a primary destination. Placing it in the sidebar and bottom nav at the same level as "Dashboard" and "Tournaments" inflates the scorer nav unnecessarily.

**1.4 "AA Import" label is cryptic**  
Users unfamiliar with the product won't know what "AA" means. Sidebar label should be "Import Teams" or "Bulk Import."

**1.5 Discover page is shown to scorers but is viewer-oriented**  
The Discover page surfaces public matches and tournaments. For a scorer who primarily creates and manages matches, this page is low value. Consider de-emphasizing or re-labeling to "Explore."

**1.6 No keyboard navigation on desktop sidebar**  
ListItemButton elements are focusable but there's no `aria-current="page"` attribute, and focus ring visibility depends on the theme's MUI defaults.

**1.7 "Notifications" nav item exists but the page has no real-time push**  
Notification count badge is static. Users who click Notifications see a page with no live content, creating confusion about whether the feature works.

---

## 2. Header Redesign Recommendations

### Current State (AppShell.jsx, lines 90–250)

- AppBar with hardcoded title **"Operational Panel"**
- Left: hamburger (mobile) + "Live Match Center" chip (public only)
- Right: theme toggle + notifications bell + avatar with dropdown
- Avatar always shows **"U"** (hardcoded, never personalized)
- Profile dropdown shows **"User Account"** / **"Operational Panel"** as static strings
- Settings nav link in dropdown previously went nowhere (now fixed)

### Gaps

**2.1 "Operational Panel" is a placeholder title**  
This string appears in both the AppBar title and the profile dropdown header. It was never replaced with the product name. Replace with "CricVelo" or a contextual page title derived from the current route.

**2.2 Avatar shows "U" for every user**  
Firebase Auth provides `user.displayName`. Use the first character of `displayName` (or `email` fallback) to generate the avatar initial. This is a 5-minute fix that makes the app feel personal.

**2.3 Profile dropdown hardcodes "User Account"**  
Should show `user.displayName` or `user.email` so users can confirm which account they're in.

**2.4 Notifications bell has no unread count**  
The bell icon renders without a badge. If the notification system sends alerts, the bell should show a count. If it doesn't yet, consider hiding the bell until the feature is real — a bell that never shows a count trains users to ignore it.

**2.5 No page title in header on mobile**  
On mobile the header shows "CricVelo" (logo area) but no indication of which section is open. Users rely entirely on page content to know where they are.

**2.6 Theme toggle in header is non-standard placement**  
Most apps put theme toggle in Settings. It's currently duplicated: in the header (AppShell) AND in the Settings page. Having it in both places is inconsistent — remove from header, keep in Settings.

---

## 3. Sidebar Redesign Recommendations

### Current State

- Permanent Drawer (260px) on desktop
- Groups: no explicit grouping, all 9 items in a flat list
- Footer: "CricVelo Match Center v1.2" static version string
- Icons: descriptive and correct

### Gaps

**3.1 No visual grouping**  
The scorer sidebar has 9 items in a flat list with no section separators. A natural grouping:
- **Main:** Dashboard, Discover, Notifications
- **Match:** Create Match, Tournaments
- **Roster:** My Teams, My Players
- **Data:** AA Import, Import History

Dividers between groups would reduce cognitive load without changing routes.

**3.2 Version string is hardcoded as "v1.2"**  
Version is not derived from `package.json` or an env var. It will diverge from the real version. Either read from `VITE_APP_VERSION` or remove it.

**3.3 Sidebar has no collapse affordance**  
Desktop users with small screens (13" laptops) lose 260px of horizontal space permanently. A collapse-to-icon-rail mode is a meaningful ergonomic improvement for power users.

**3.4 "Import History" is listed as a primary nav item**  
This should be accessible from within the Import page (as a tab or link), not from the primary nav. Remove from the sidebar; surface it from the AA Import page.

**3.5 No indication of match-in-progress in sidebar**  
Scorers with an active in-progress match have no visual reminder in the sidebar. A subtle chip or dot next to "Dashboard" or a dedicated "Active Match" entry would serve as a persistent nudge.

---

## 4. Dashboard Redesign Recommendations

### Current State (DashboardPage.jsx)

Four main sections:
1. **Banners** — Resume Scoring (red), email unverified (orange), Become Scorer (purple)
2. **Live Scoreboard** — realtime ongoing matches
3. **Ongoing Matches** — card list of in-progress matches
4. **Recent Activity** — last 5 completed matches
5. **Completed Matches** — paginated list

### Gaps

**4.1 Duplicate "Ongoing" sections**  
The Live Scoreboard shows ongoing match scores, and Ongoing Matches (below it) shows the same matches as cards. First-time users see the same data twice with different presentation and no explanation of why. Merge into one section: a "Live" section with score tiles and a "View Scorecard" action.

**4.2 Dashboard is scorer-only in practice but viewers see it too**  
Viewer dashboard is empty (no Create Match, no managing matches). After role promotion viewers should see a congratulations state; before promotion the dashboard should surface Discover as the primary action instead of showing an empty state.

**4.3 Banner ordering could be clearer**  
Three banners can stack at once: Resume Scoring → email unverified → Become Scorer. The email-unverified orange banner and the Become Scorer purple banner are logically linked — if email is unverified, the Become Scorer banner shouldn't show (the user can't act on it). Currently both can appear simultaneously.

**4.4 No empty state for fresh accounts**  
A newly registered scorer with no matches sees an empty Ongoing section, empty Recent Activity, and empty Completed Matches — three empty boxes stacked. There is a `<EmptyState>` component in the codebase; it should be used here with a "Create your first match" CTA.

**4.5 MatchOverviewCard fetches match details on every render**  
`MatchOverviewCard.jsx` calls `getMatchById` inside a `useEffect` on mount. When the dashboard renders 5–10 ongoing matches, this fires 5–10 parallel Firestore reads. The dashboard already has realtime match data; the card should receive the full match object as a prop instead of re-fetching.

**4.6 "Recent Activity" section shows completed matches, not activity**  
The section header says "Recent Activity" but displays only completed matches. Activity should include match creation, team imports, and player additions — not just completions. Either rename to "Recently Completed" or broaden the feed.

**4.7 Completed Matches has no search or filter**  
A scorer with 50+ completed matches has no way to find a specific one. A simple text search on team names or date filter would significantly improve usability at scale.

---

## 5. Mobile UX Review

### Dashboard (375px viewport)

- Live Scoreboard renders as a horizontal scroll container — works but no indicator that it's scrollable (no scroll shadows, no arrow buttons)
- Banner stack can consume 40%+ of the viewport height when all three appear simultaneously
- Card actions (overflow menu) use `IconButton` at 40px — adequate tap target

### Live Scoring (MatchScoring / ScoringActions)

- `ScoringActions.jsx` renders run buttons (0, 1, 2, 3, 4, 6, W, Nb, Wd) as a grid — adequate on most screens
- "End Innings" uses a native `<input type="checkbox">` (18×18px) — below the 44px minimum tap target guideline. This is a P1 usability bug on mobile.
- Score summary header is text-dense; on screens below 360px wide, team names can overlap

### Tournament Pages

- `TournamentDetailsPage` renders standings as an MUI Table — horizontally scrolls on mobile but has no visual affordance
- Tab navigation (Fixtures / Standings / Stats) works correctly on mobile
- "Add Team" dialog is a full-screen overlay on mobile — correct pattern

### Imports (AA Import)

- File drop zone renders at full width — adequate
- Column mapping step shows two column pickers side-by-side on mobile — too cramped below 400px; should stack vertically

### Statistics / Players / Teams

- PlayersPage and TeamsPage both use DataGrid or similar tables — these are inherently problematic on mobile without column pinning or row detail view
- No mobile-optimized card view for player/team lists

### Notifications Page

- Renders as a simple list — adequate on mobile
- No pull-to-refresh (standard mobile expectation for a notifications feed)

---

## 6. Stability Gaps (Top 20)

Ranked by potential to cause data loss, crashes, or silent failures.

| # | Gap | Severity | Location |
|---|-----|----------|----------|
| 1 | **Import fails mid-run with no recovery** — if the network drops after Phase 1 (teams created) but before Phase 2 (players), the import record stays `Draft`. Re-running creates duplicate teams. | P0 | `importService.js` |
| 2 | **"End Innings" checkbox 18×18px tap target** — easily mis-tapped on mobile, causing accidental innings end with no undo | P1 | `ScoringActions.jsx` |
| 3 | **`updateMatchById` has no payload validation** — any caller can pass arbitrary keys to a Firestore `updateDoc`. A typo creates a silent no-op that diverges the local and Firestore state. | P1 | `matchService.js` |
| 4 | **Scorer email verification is client-side only** — Firestore rules cannot check `emailVerified`. A user can bypass the client guard (e.g., manipulate state) and create matches without a verified email. Requires Firebase custom claims via Cloud Function for server-side enforcement. | P1 | `firestore.rules`, `DashboardPage.jsx` |
| 5 | **`MatchOverviewCard` re-fetches match on every mount** — N dashboard cards = N parallel Firestore reads, each returning the same data the dashboard realtime hook already holds | P2 | `MatchOverviewCard.jsx` |
| 6 | **No optimistic update on ball recording** — scoring a ball waits for Firestore round-trip before UI updates. On poor connections this feels unresponsive and scorers may double-tap. | P2 | `updateScorecard.js`, `ScoringActions.jsx` |
| 7 | **Tournament `teamIds` migration gap** — legacy string IDs fall back to `{ teamId: id, name: id }` stub. Stub `name` is the Firestore ID (opaque string), not a human-readable team name. Old tournaments will display ID strings instead of names until re-saved. | P2 | `TournamentDetailsPage.jsx`, `PublicTournamentPage.jsx` |
| 8 | **No "match not found" state on `LiveMatchPage`** — if `matchId` query param is missing or invalid, the page likely renders a blank loading state indefinitely | P2 | `LiveMatchPage.jsx` |
| 9 | **`PublicScorecardPage` has no 404 state** — same issue: invalid `matchId` in the URL renders blank forever | P2 | `PublicScorecardPage.jsx` |
| 10 | **`rollbackImport` heuristic is fragile** — deletes a team only if "all playerRefs belong to this batch." A team with pre-existing players AND batch players will not be deleted, but its batch-tagged players won't be removed cleanly either. | P2 | `importService.js` |
| 11 | **`getImportHistory` uses one-time fetch, not realtime** — if an import runs in one tab, history in another tab doesn't update | P2 | `importService.js`, `ImportHistoryPage.jsx` |
| 12 | **`DiscoverPage` (775 lines) — monolithic component** — no sub-components, no custom hooks, all state in one 775-line render function. A single user action can re-run the entire component. No correctness impact yet, but maintenance risk grows with each feature. | P2 | `DiscoverPage.jsx` |
| 13 | **Missing `aria-label` on icon-only buttons** — hamburger menu, theme toggle, notification bell, and avatar all lack `aria-label`. Screen readers announce "button" with no context. | P2 | `AppShell.jsx` |
| 14 | **`ErrorBoundary` wraps outside Redux Provider** — if a Redux-connected component throws, the fallback UI will try to render inside a context that may not exist, potentially causing a secondary crash in the fallback itself | P2 | `main.jsx` |
| 15 | **No `React.Suspense` fallback on lazy-loaded pages** — `React.lazy` is used for all page imports but no `<Suspense>` wrapper is present. A slow network load will show a blank screen instead of a skeleton/spinner. | P2 | `App.jsx` |
| 16 | **`firestore.rules` private match rule uses `get()` with ownership field** — `resource.data.get('createdBy', request.auth.uid)` defaults to the requesting user's UID if the field is absent. This means documents without `createdBy` are readable by any authenticated user. | P2 | `firestore.rules` |
| 17 | **No rate limiting on scoring actions** — a scorer can click "4 runs" 20 times in 1 second. Each click fires a Firestore transaction. No debounce or disable-while-pending guard exists. | P2 | `ScoringActions.jsx` |
| 18 | **`BallTimeline` re-renders on every scoring action** — no memoization on the ball list. With 100+ balls in an innings, each scoring action re-renders the entire timeline. | P3 | `BallTimeline.jsx` |
| 19 | **`EndOfInnings` modal has no loading state after confirming** — user clicks "Confirm," `updateDoc` fires, but the button doesn't disable or show a spinner. Double-click risk. | P3 | `EndOfInnings.jsx` |
| 20 | **Match sharing URL is not surfaced in the UI** — the public scorecard URL exists (`/match/:matchId`) but there's no "Share" or "Copy Link" button on `MatchDetailsPage` or `ScoringActions`. Users who want to share a live score have no obvious path. | P3 | `MatchDetailsPage.jsx` |

---

## 7. Quick Wins (Top 30)

All items estimated under 2 hours. Ranked High / Medium / Low impact.

| # | Item | Impact | Effort | File(s) |
|---|------|--------|--------|---------|
| 1 | **Replace hardcoded "U" avatar with user initial** — use `user.displayName?.[0] \|\| user.email?.[0] \|\| "U"` | High | 5 min | `AppShell.jsx` |
| 2 | **Replace "Operational Panel" title with "CricVelo"** — both AppBar and profile dropdown | High | 5 min | `AppShell.jsx` |
| 3 | **Replace "User Account" in dropdown with `user.displayName \|\| user.email`** | High | 5 min | `AppShell.jsx` |
| 4 | **Replace "End Innings" native `<input type="checkbox">` with MUI `<Checkbox>`** — fixes 18px tap target | High | 15 min | `ScoringActions.jsx` |
| 5 | **Add `<React.Suspense fallback={<LoadingState />}>` around lazy routes in App.jsx** — fixes blank screen on slow loads | High | 10 min | `App.jsx` |
| 6 | **Move `ErrorBoundary` inside `<Provider>` in `main.jsx`** — prevents secondary crash if Redux-connected component throws | High | 5 min | `main.jsx` |
| 7 | **Add empty state to Dashboard when scorer has no matches** — reuse existing `<EmptyState>` component with "Create your first match" CTA | High | 20 min | `DashboardPage.jsx` |
| 8 | **Disable scoring button while Firestore write is in-flight** — add `loading` state to prevent double-tap duplicates | High | 30 min | `ScoringActions.jsx`, `updateScorecard.js` |
| 9 | **Add `aria-label` to all icon-only buttons in AppShell** — hamburger, theme toggle, notifications bell, avatar | High | 15 min | `AppShell.jsx` |
| 10 | **Add loading spinner to "Confirm" button in `EndOfInnings` modal** | High | 20 min | `EndOfInnings.jsx` |
| 11 | **Add `aria-current="page"` to active sidebar item** | Medium | 10 min | `AppShell.jsx` |
| 12 | **Add active-state highlight to mobile bottom nav buttons** — use `color="primary"` when route matches | Medium | 20 min | `AppShell.jsx` |
| 13 | **Rename "AA Import" to "Import Teams" in sidebar/nav** | Medium | 5 min | `AppShell.jsx` |
| 14 | **Add sidebar section dividers** (Main / Match / Roster / Data groups) — use MUI `<Divider>` | Medium | 15 min | `AppShell.jsx` |
| 15 | **Add "Copy Public Link" button on `MatchDetailsPage`** — `navigator.clipboard.writeText(window.location.origin + '/match/' + matchId)` | Medium | 30 min | `MatchDetailsPage.jsx` |
| 16 | **Add "Copy Tournament Link" button on `TournamentDetailsPage`** — same pattern | Medium | 20 min | `TournamentDetailsPage.jsx` |
| 17 | **Rename "Recent Activity" section to "Recently Completed"** — label matches actual content | Medium | 2 min | `DashboardPage.jsx` |
| 18 | **Remove theme toggle from AppShell header** — it's already in Settings; duplicating it is inconsistent | Medium | 5 min | `AppShell.jsx` |
| 19 | **Add "not found" fallback to `LiveMatchPage`** — show `<ErrorState>` when `matchId` is missing or document doesn't exist | Medium | 20 min | `LiveMatchPage.jsx` |
| 20 | **Add "not found" fallback to `PublicScorecardPage`** — same pattern | Medium | 20 min | `PublicScorecardPage.jsx` |
| 21 | **Read version from `VITE_APP_VERSION` env var in sidebar footer** instead of hardcoded "v1.2" | Medium | 5 min | `AppShell.jsx` |
| 22 | **Suppress Become Scorer banner when email is unverified** — it's unactionable in that state; the unverified banner is enough | Medium | 5 min | `DashboardPage.jsx` |
| 23 | **Pass full match object as prop to `MatchOverviewCard`** instead of fetching inside the component | Medium | 30 min | `MatchOverviewCard.jsx`, `DashboardPage.jsx` |
| 24 | **Add `React.memo` to `BallTimeline`** to prevent full re-render on every scoring action | Medium | 10 min | `BallTimeline.jsx` |
| 25 | **Replace duplicate "Ongoing" sections on Dashboard** — merge Live Scoreboard + Ongoing Matches into one "Live Matches" section | Medium | 45 min | `DashboardPage.jsx` |
| 26 | **Add horizontal scroll shadow to mobile tables** (Standings, Players) — pure CSS `::after` pseudo-element with gradient | Low | 30 min | Global CSS or component-level `sx` |
| 27 | **Stack column-mapping pickers vertically on mobile** in the Import wizard | Low | 20 min | Import step component |
| 28 | **Add `title` attribute to sidebar icon buttons** — tooltip text on hover for desktop keyboard users | Low | 10 min | `AppShell.jsx` |
| 29 | **Show `+N more` count on bottom mobile nav when items overflow** or limit to 5 items with a "More" drawer for the rest | Low | 60 min | `AppShell.jsx` |
| 30 | **Add `og:title` and `og:description` meta tags to public scorecard and tournament pages** — enables link previews when shared on WhatsApp/Twitter | Low | 45 min | `PublicScorecardPage.jsx`, `PublicTournamentPage.jsx` |

---

## Summary

**Critical before public beta:**
- End Innings tap target (#4) — data integrity risk on mobile
- Scoring button double-tap guard (#8) — silent data corruption risk
- ErrorBoundary placement (#6) — secondary crash risk

**High-value polish (< 1 hour total for first 5):**
- Avatar personalization (#1), title fix (#2), display name in dropdown (#3) — removes placeholder feel immediately
- Suspense wrapper (#5) — eliminates blank screen on slow loads

**Architecture debt to watch:**
- `DiscoverPage.jsx` at 775 lines (#12 in gaps) will become a maintenance problem
- `MatchOverviewCard` N+1 Firestore reads (#5 in gaps) will hit Firestore read quotas at scale
- Import recovery (#1 in gaps) is a P0 data integrity issue for any import larger than one chunk
