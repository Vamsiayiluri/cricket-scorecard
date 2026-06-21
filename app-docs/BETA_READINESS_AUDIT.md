# CricVelo Beta Readiness Audit
**Date:** June 20, 2026
**Scope:** Post-Launch Readiness Sprint state — includes Tournament Foundation (Wave 4A-D), AuctionArena Import (Wave 5A), and Launch Readiness Sprint
**Basis:** Full source audit — 20+ pages, 60+ components, all Firestore rules, service layer, hooks, utilities

---

## Executive Summary

CricVelo has matured substantially across six development waves. The core product — live scoring, public scorecards, tournament management, and team/player administration — is functionally complete and architecturally sound. The two P0 blockers from the prior audit (Firestore scoring rule and match ownership) have been fixed. The platform is visibly closer to a shippable beta than it was before the sprint.

**However, several real issues remain.** The most consequential are: tournament matches loaded via one-time fetch (standings and fixtures go stale during live scoring without a refresh), the `teamIds` array in tournament documents stores raw Firestore IDs rather than name snapshots causing silent team-name failures, the scorer self-upgrade path bypasses all identity verification, and the public tournament page's fixture tab fails for unauthenticated users due to a Firestore rule that requires `isSignedIn()` for fixture reads.

**Beta verdict: conditionally ready.** The platform can support a closed beta with known scorers and organizers. Public open beta requires fixing the five issues listed in the Top 10 that affect viewer experience and tournament correctness.

---

## Section 1 — Remaining P0 Issues

### P0-1: Tournament Standings Go Stale During Live Matches
**Location:** `src/pages/TournamentDetailsPage.jsx:456-465`, `src/pages/PublicTournamentPage.jsx:107-115`

Both the private organizer page and the new public tournament page load tournament matches via `getTournamentMatches()` — a **one-time fetch** inside a `useEffect`. When a tournament match transitions from scheduled → in-progress → completed during active scoring, the standings, fixture statuses, and statistics tabs do not update. An organizer watching their own tournament standings will see stale data until they manually refresh the page.

The fixtures tab is partially mitigated (it uses `useTournamentFixtures` which is realtime via `useRealtimeCollection`), but the derived match statuses (`deriveFixtureStatus`) depend on `matchesById` which is built from the stale `tournamentMatches` state.

**Impact:** Organizers watching a live tournament final see the wrong standings. Viewers on `/t/:tournamentId` see completed matches not reflected until refresh.

**Fix required:** Replace `getTournamentMatches()` one-time fetch with a realtime listener (subscribe to matches where `tournamentId == id`).

---

### P0-2: Tournament `teamIds` Stores Raw IDs; Team Name Resolution Silently Fails
**Location:** `src/pages/TournamentDetailsPage.jsx:469-472`

```javascript
const assignedTeams = useMemo(
  () => (tournament?.teamIds || []).map(id => teamMap.get(id)).filter(Boolean),
  [tournament?.teamIds, teamMap]
);
```

`tournament.teamIds` is an array of raw Firestore team document IDs. `teamMap` is built from `useUserTeams()` — which only loads teams belonging to the **currently logged-in organizer**. If any team was deleted, transferred, or the tournament is viewed by a different authenticated user, `teamMap.get(id)` returns `undefined` and `.filter(Boolean)` silently drops it.

**Impact:** `assignedTeams` is empty or incomplete → standings seeded with wrong team names → `allTeamNames` missing teams → standings show fewer rows than teams actually enrolled. The public tournament page has the same bug: `tournament?.teamIds?.map(t => t.name || t)` — it treats `teamIds` as either an object array OR string array, but the actual data is a string ID array, so `.name` is always undefined and it falls back to the raw Firestore ID string as the display name.

**Fix required:** Either store `{ teamId, name }` objects in `teamIds` at enrollment time, or denormalize team names into the tournament document.

---

### P0-3: Public Tournament Fixtures Require `isSignedIn()` — Fail for Unauthenticated Viewers
**Location:** `firestore.rules:107-110`

```
match /fixtures/{fixtureId} {
  allow read: if isSignedIn();
  allow create, update, delete: if isScorer();
}
```

The `/t/:tournamentId` route is fully public (no auth wrapper). However, the `useTournamentFixtures` hook reads the `fixtures` subcollection which requires authentication per Firestore rules. An unauthenticated viewer on the public tournament page sees the Fixtures tab but Firestore returns a permission-denied error, resulting in an empty fixtures list with no error message shown to the user.

**Impact:** The core value of the public tournament page — showing fans the fixture schedule — is broken for unauthenticated users.

**Fix required:** Update Firestore rules to allow fixture reads when parent tournament `isPublic == true`, or allow unconditional fixture reads (fixtures contain no sensitive data).

---

## Section 2 — Remaining P1 Issues

### P1-1: Scorer Self-Upgrade Has No Identity Gate
**Location:** `src/services/firebase/userService.js:63-66`, `firestore.rules:37-43`

Any authenticated user can call `upgradeToScorer(uid)` and immediately gain scorer privileges. There is no email verification requirement, no captcha, no approval flow, and no rate limiting. Since scorer role enables match creation, public match publication, and tournament creation, a spam account could flood the `/discover` page with fake matches or pollute the public scorecard index.

**Risk:** On open beta launch, automated bots or bad actors can register, self-upgrade to scorer, and spam public content.

**Fix required:** Gate `upgradeToScorer` behind email verification (`user.emailVerified === true`) in both the service layer and Firestore rules.

---

### P1-2: `patchMatchById` Has No Payload Validation
**Location:** `src/services/firebase/matchService.js:119-124`

```javascript
export const patchMatchById = async (matchId, patch) => {
  if (!matchId) throw new Error("matchId is required");
  await updateDoc(matchDoc(matchId), { ...patch, updatedAt: new Date() });
};
```

`patchMatchById` accepts an arbitrary `patch` object and writes it directly to Firestore. Unlike `updateMatchById` and `completeMatchById`, it does not call `assertFirestoreSafePayload()`. This is the function used for `setMatchVisibility`, `archiveMatch`, `softDeleteMatch`, and `setPlayerOfMatch`. While the callers are all internal, any future misuse could write unexpected fields or overwrite protected fields.

**Risk:** Low in current codebase (all callers are trusted); medium risk as the codebase grows and new developers add calls.

---

### P1-3: Match Resumption Has No Safety Net
**Location:** `src/pages/MatchScoring.jsx`, `src/pages/LiveMatchPage.jsx`

There is no "Resume Scoring" banner or guard. If a scorer navigates away from `/score-card?matchId=X` mid-innings (browser back, accidental navigation, phone call), there is no prompt to return. The match stays in `in-progress` status indefinitely. The scorer must remember the match URL or find it in the Dashboard's "Ongoing" section.

On mobile — the primary device for grassroots cricket scoring — accidental navigation is common (notifications sliding down, back swipe gesture).

**Impact:** Scorers lose their scoring session; viewers see a frozen live scoreboard.

---

### P1-4: End Innings Double Confirmation Is Not Sufficient
**Location:** `src/components/match/ScoreCard.jsx:1085-1115`

The new double-confirmation dialog uses a native `<input type="checkbox">` styled with `accentColor`. While this is functional, it has poor mobile accessibility: the tap target for the checkbox is 18×18px (too small per WCAG 2.1 AA minimum of 44×44px). On a phone held in one hand during a match, this creates risk of the checkbox being unchecked accidentally, or the scorer tapping the "End Innings" button area before checking the box.

Additionally, the dialog uses raw `<input>` and `<label>` HTML elements rather than MUI `Checkbox` — which is inconsistent with the design system and may render differently across devices.

---

### P1-5: Tournament Matches Do Not Respect Match `createdBy` Ownership
**Location:** `src/pages/TournamentDetailsPage.jsx:588-599`

The "Create Match from Fixture" flow pre-fills the match creation wizard with fixture data. The created match correctly includes `createdBy: user.uid` (fixed in the sprint). However, the tournament page's Matches tab shows **all matches linked to the tournament** regardless of `createdBy`. This means if two scorers create matches for the same tournament (one per fixture), each scorer sees all tournament matches in the tab — but can only edit their own. The UI doesn't distinguish which matches are editable, which could confuse scorers.

This is also a Firestore rules consideration: `getTournamentMatches()` fetches by `tournamentId` but Firestore requires `isSignedIn()` for match reads — meaning any signed-in user can read all tournament matches, including private ones where `isPublic === false`.

---

### P1-6: No Error Recovery on AuctionArena Import Failure Mid-Run
**Location:** `src/services/firebase/importService.js:executeImport`

The `executeImport` function uses chunked `Promise.all` to write teams and players. If the function throws mid-way (network drop, Firestore quota exceeded), the import record stays in `Draft` status and some entities may have been written while others were not. There is no atomic rollback triggered on error — the user is shown an error message but the `importBatchId` is never marked as `Imported`, so the Rollback button is never shown in Import History.

**Impact:** Partial import state with no recovery path. User must manually delete orphaned teams/players.

---

### P1-7: BallTimeline Shows in LiveScoreboard but Not Synced for New Over
**Location:** `src/components/viewer/LiveScoreboard.jsx:188-190`

```jsx
{match.status === MATCH_STATUS.IN_PROGRESS && !completed && (recentBalls.length > 0 || overHistory.length > 0) && (
  <BallTimeline recentBalls={recentBalls} overHistory={overHistory} title="Current Over" />
)}
```

`recentBalls` is derived from `getRecentBallsForInning(match?.scoreCard, currentInningIndex)`. At the start of a new over (0 balls bowled), `recentBalls` is empty and `overHistory` may not yet reflect the new over. The BallTimeline disappears entirely at the start of each over and only reappears once the first ball of the new over is delivered. This creates a confusing viewer experience — "Where did the ball feed go?" — for 30–60 seconds between overs.

---

### P1-8: No "Share Tournament" CTA on Tournament Details Page
**Location:** `src/pages/TournamentDetailsPage.jsx:641-650`

The TournamentDetailsPage has an Edit button and Archive button for the organizer, but no "Share" or "Copy Public Link" button. The public URL is `/t/:tournamentId`, which organizers have no in-product way to discover or share. They must manually construct the URL or know the pattern.

---

### P1-9: Player Stats Only Count Catalog-Linked Players
**Location:** `src/pages/PlayersPage.jsx:42-43`

```javascript
const statsMap = useMemo(() => computeAllPlayerStats(matches), [matches]);
```

`computeAllPlayerStats` aggregates by `playerId` — only players in the scorer's catalog with catalog IDs are counted. Manual-entry players (entered ad-hoc during match creation without linking to the player catalog) contribute zero stats regardless of how many runs they score. This is the documented design (tournament stats use name-based aggregation instead), but it creates a confusing experience when a scorer's player catalog has full stats in the Players page but those stats are zero for commonly-occurring ad-hoc names.

---

### P1-10: Settings Menu Item Has No Route
**Location:** `src/layout/AppShell.jsx` (profile dropdown), `src/App.jsx`

The profile dropdown in `AppShell` includes a Settings menu item (observed in nav structure). There is no `/settings` route in `App.jsx` and no `SettingsPage` component. Clicking Settings either throws a navigation error or silently does nothing.

---

## Section 3 — Security Risks

| Risk | Severity | Location | Detail |
|------|----------|----------|--------|
| **Scorer self-upgrade without email verification** | High | `userService.js`, `firestore.rules` | Any registered account can instantly become scorer; no identity gate |
| **Tournament fixtures readable by all signed-in users** | Medium | `firestore.rules:107-110` | A signed-in viewer can read the fixture plans of any tournament, including private draft tournaments |
| **`patchMatchById` accepts arbitrary payload** | Medium | `matchService.js:119` | No schema validation; caller trust assumption only |
| **Private match content exposed to any signed-in user** | Medium | `firestore.rules:43` | `allow read: if isPublicMatch() \|\| isSignedIn()` — private matches readable by all authenticated users, not just the owner |
| **Notification creation type-only validation** | Low | `firestore.rules:126-133` | Any authenticated user can create a notification of any type pointing to any match for any user; no match ownership check |
| **Import rollback deletes by `createdBy` filter** | Low | `importService.js` | Rollback queries all players where `createdBy == uid` then filters `importBatchId` client-side — large player catalogs slow this query |
| **No CSRF protection** | Info | All pages | Client-rendered SPA; Firebase Auth uses JWT tokens which are CSRF-resistant by nature. Not a practical risk for this architecture |
| **xlsx library 0.18.5** | Info | `package.json` | SheetJS XLSX has had security advisories in older versions. Confirm `0.18.5` does not have active CVEs; consider pinning |

### Critical: Private Matches Visible to All Signed-In Users
The current rule `allow read: if isPublicMatch() || isSignedIn()` means any signed-in viewer — including those who self-upgraded from viewer — can read private matches (where `isPublic === false`) created by any scorer. This was likely intentional for the "Discover" use case but should be `isPublicMatch() || (isSignedIn() && resource.data.createdBy == request.auth.uid)` for private matches, with a broader read for public ones.

---

## Section 4 — Firestore Risks

| Risk | Severity | Detail |
|------|----------|--------|
| **Tournament matches use one-time fetch** | High | `getTournamentMatches()` in both TournamentDetailsPage and PublicTournamentPage — no realtime listener means stale standings |
| **`userRole()` function in rules triggers extra document read** | High | Every authenticated Firestore operation calls `get(userDocPath())` — at scale this doubles billing. Each match read = 2 document reads |
| **No composite indexes declared** | Medium | `useUserTeams` and `useUserPlayers` sort client-side. Adding `orderBy` to those queries without composite indexes causes a Firestore 500 error |
| **Tournament `teamIds` stores raw IDs** | Medium | Name resolution requires loading the full teams collection; fails if teams are deleted or owned by other users |
| **Player stats scan all completed matches** | Medium | `computeAllPlayerStats` in PlayersPage scans ALL completed matches the scorer ever created — O(n) with no limit |
| **AuctionArena import does 2 writes per player** | Low | `createPlayer()` + `updateDoc()` for extra fields — could be merged into 1 write using `setDoc` with full payload |
| **Import rollback reads full players/teams collection** | Low | Rollback queries `where("createdBy", "==", uid)` and filters `importBatchId` client-side — for scorers with large catalogs this reads every player document |
| **`overHistoryByInnings` grows unbounded per match** | Low | Every ball appended to the over history array; very long matches or T20s with full over history may approach Firestore 1MB document limit |
| **No TTL or cleanup on soft-deleted matches** | Low | `archiveMatch` and `softDeleteMatch` set flags but never delete documents; over time this grows the matches collection unboundedly |

---

## Section 5 — Mobile UX Issues

| Issue | Impact | Location |
|-------|--------|----------|
| **End Innings checkbox 18×18px tap target** | High | `ScoreCard.jsx:1107` — too small for reliable mobile tap |
| **Scoring console buttons on xs screens** | High | `ScoringActions.jsx` — run buttons (0,1,2,3,4,5,6) are rendered in a Grid; on very small screens (360px width) buttons may overlap or truncate |
| **Ball by ball chips in BallTimeline** | Medium | `BallTimeline.jsx` — `flexWrap` chips in a horizontal stack may overflow on narrow screens without ellipsis |
| **Tournament tabs require horizontal scroll** | Medium | 6 tabs (Overview/Standings/Fixtures/Teams/Matches/Statistics) — on mobile with `scrollButtons="auto"` the active tab may not be visible on initial render |
| **Profile dropdown avatar shows "U" hardcoded** | Low | `AppShell.jsx` — avatar should show user initial from email or displayName |
| **`window.location.href` in share section** | Low | `LiveMatchPage.jsx:107` — on mobile, long URLs are not tappable/selectable easily; should use a "Copy Link" button instead |
| **No swipe navigation between scoring tabs** | Low | Scorer must tap tabs to navigate between scoring views; swipe would be natural on mobile |
| **Wizard stepper in ImportsPage overflows on mobile** | Low | 5-step `Stepper` with `alternativeLabel` on xs screens — labels may wrap or truncate |

---

## Section 6 — Public Viewer Experience

### What Works Well
- `/live/:matchId` and `/scorecard/:matchId` load without auth and show full live scorecard
- BallTimeline now renders during in-progress matches (fixed in sprint)
- POTM now reads from actual match data (fixed in sprint)
- `/discover` page is fully public with live/upcoming/completed sections
- `/t/:tournamentId` public tournament page with standings and statistics
- Result share card (PNG download, clipboard, Web Share API)
- Follow/notifications for authenticated viewers

### Gaps

| Gap | Priority |
|-----|----------|
| `/t/:tournamentId` fixtures blank for unauthenticated users | P0 |
| No "share tournament" link discoverable from the organizer UI | P1 |
| Tournament standings stale during live matches | P0 |
| No SEO metadata (`<title>`, `og:*` tags) on public pages — all client-rendered | P2 |
| No fallback for browsers with JavaScript disabled | P3 |
| "Share this page: {window.location.href}" in LiveMatchPage is not interactive | P1 |
| No paginated discovery — `/discover` loads up to 120 matches at once | P2 |
| Public viewers cannot see teams or player profiles | P2 |
| No tournament share/embed widget | P2 |

---

## Section 7 — Tournament Experience

### Organizer

| Feature | Status | Gap |
|---------|--------|-----|
| Tournament CRUD | ✅ Complete | — |
| Team assignment | ⚠️ Broken | `teamIds` stores raw IDs; team names fail to resolve in public page |
| Fixture management | ✅ Complete | Manual only; no round-robin generator |
| Create match from fixture | ✅ Complete | — |
| Standings (auto-calculated) | ✅ Complete | Stale during live matches |
| Statistics tab (batting/bowling) | ✅ Complete | Stale during live matches |
| Make tournament public | ⚠️ Broken | `isPublic` toggle exists in edit form but fixtures still fail for public viewers |
| Share public URL | ❌ Missing | No CTA; `/t/:tournamentId` not surfaced in organizer UI |
| Auto-fixture generation (round-robin) | ❌ Missing | Manual only |
| Tournament status auto-transition | ❌ Missing | Draft → Live → Completed must be set manually |
| NRR in standings | ❌ Missing | Not in spec for current waves |
| Match archival cleanup from tournament | ❌ Missing | Deleting a linked match doesn't update tournament standings |

### Viewer

| Feature | Status | Gap |
|---------|--------|-----|
| Public tournament page | ✅ Present | Fixtures blank without auth |
| Live fixture status | ✅ Works | Requires signed-in user to see |
| Standings table | ✅ Works | Stale without page refresh during live matches |
| Statistics leaderboards | ✅ Works | Stale without page refresh |
| Team roster view | ❌ Missing | Teams tab shows team names only; no roster |
| Tournament share | ❌ Missing | No discoverable URL from within the app |

---

## Section 8 — Scorer Experience

### Core Scoring Flow

| Step | Status | Gap |
|------|--------|-----|
| Create match (6-step wizard) | ✅ Complete | — |
| Load saved team | ✅ Complete | — |
| Score ball-by-ball | ✅ Complete | All 6 dismissal types, extras, free hit, FOW |
| Undo/redo (40-deep) | ✅ Complete | — |
| End innings (now double-confirm) | ✅ Complete | Checkbox tap target too small on mobile |
| Select POTM | ✅ Complete | — |
| Complete match | ✅ Complete | — |
| Share result card | ✅ Complete | — |
| Resume if navigated away | ❌ Missing | No resume banner, no session guard |
| In-progress match persisted on Firestore | ✅ Complete | But scorer has no explicit "you have an open match" dashboard indicator |

### Team/Player Management

| Feature | Status | Gap |
|---------|--------|-----|
| Team CRUD | ✅ Complete | — |
| Player CRUD | ✅ Complete | — |
| Player stats aggregation | ⚠️ Partial | Only catalog-linked players; manual-entry players excluded |
| AuctionArena import | ✅ Complete | No error recovery on partial import failure |
| Import history + rollback | ✅ Complete | Rollback button not shown if import fails mid-run |

### Tournament Management

| Feature | Status | Gap |
|---------|--------|-----|
| Create tournament | ✅ Complete | — |
| Assign teams | ✅ Complete | Name resolution silently broken in public page |
| Create fixtures | ✅ Complete | Manual only |
| Link match to tournament | ✅ Complete | Via Notes step |
| View standings | ✅ Complete | Stale during live games |
| Share public tournament URL | ❌ Missing | Not surfaced |

---

## Section 9 — Performance Risks

| Risk | Current Scale | Breaks At | Mitigation |
|------|--------------|-----------|------------|
| **Player stats full-scan** | O(n) matches per scorer | ~200+ matches | Add date-range filter; cache stats in player doc |
| **Tournament stats full-scan** | O(n) completed tournament matches | ~50+ matches | Bounded per tournament; acceptable short-term |
| **Discovery query (120 matches)** | 120 docs per page load | ~500+ public matches | Add cursor-based pagination |
| **`userRole()` billing double-dip** | 1 extra read per auth'd operation | At scale: 2× Firestore billing | Cache role in Firebase Auth custom claims |
| **xlsx bundle (429KB gzipped)** | Loaded dynamically | N/A (dynamic import) | Already mitigated — not in initial bundle |
| **Main bundle 950KB (266KB gz)** | Current | Mobile 3G: 4–8s load | Split MUI + Firebase into separate chunks |
| **Over history unbounded growth** | ~120 balls per T20 | ~8000 balls (Test match) | Compress or archive old over history |
| **Import rollback full-catalog read** | ~500 players max per import | ~5000 player catalog | Use Firestore `importBatchId` index instead of client-side filter |
| **Tournament matches one-time fetch** | Instant stale | Immediate during live | Convert to realtime subscription |
| **No Firestore read limits on public pages** | Unbounded | At traffic spike | Add `limit()` to discovery queries |

---

## Section 10 — Missing Beta Features

| Feature | Priority | Rationale |
|---------|----------|-----------|
| **Email verification before scorer upgrade** | P0 | Prevents spam on public beta |
| **"Share Tournament" CTA in organizer UI** | P1 | Organizers need to discover `/t/:tournamentId` |
| **Resume scoring banner on dashboard** | P1 | Prevents lost scoring sessions on mobile |
| **Public fixture reads (Firestore rule fix)** | P0 | Core viewer value prop broken for unauthenticated |
| **Tournament matches realtime subscription** | P0 | Standings stale during live games — core tournament use case |
| **Fix `teamIds` name resolution** | P0 | Public tournament page team names show raw Firestore IDs |
| **Settings page (or remove from nav)** | P1 | Dead nav link is a beta quality signal |
| **Error telemetry (Sentry or Firebase Crashlytics)** | P1 | No visibility into production failures |
| **Match access audit: private matches readable by all signed-in users** | P1 | Security posture for private matches |
| **AuctionArena import error recovery** | P1 | Partial import leaves orphaned data |

---

## Scoring

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Product** | 68/100 | Core scoring flow is complete and polished. Tournament feature set is broad but has broken data flows (teamIds, stale matches). Viewer experience has visible gaps (fixtures fail without auth, no share CTA). Scorer workflow is functional but no resume path. |
| **Engineering** | 72/100 | Architecture is clean and consistent (hooks, services, Firestore helpers). Two critical data model bugs (teamIds stores IDs not names, tournament matches not realtime). `patchMatchById` lacks validation. Import error recovery missing. Otherwise, the patterns are solid. |
| **Security** | 55/100 | P0 Firestore scoring rule fixed — significant improvement. Scorer self-upgrade is a spam risk for public beta. Private matches visible to all signed-in users is a confidentiality concern. Fixture reads too broad. `patchMatchById` unvalidated. No email verification gate. |
| **Mobile** | 61/100 | Responsive layout with MUI works. Scoring console functional. End-innings checkbox too small. 6 tournament tabs hard to navigate on mobile. No swipe support. "Share this page" plain text unusable on mobile. |
| **Growth** | 44/100 | Discovery page is the only public surface. No SEO. No push notifications. No shareable tournament URL discoverable from within the app. No public team/player pages. Scorer upgrade path exists but unverified. No referral or social mechanics. |
| **Tournament Platform** | 58/100 | Creation, fixtures, standings, statistics all present. Three blocking bugs: stale live data, teamIds name resolution, public fixture reads. No auto-fixture generation. No NRR. No tournament sharing from the app. Organizer experience is otherwise good. |

**Overall Beta Readiness: 60/100**

---

## Top 10 Required Before Public Beta Launch

These are listed in priority order. Items 1–5 must be fixed before any public users access the platform. Items 6–10 should be fixed before marketing the platform publicly.

---

### 1. Fix Public Tournament Fixture Reads (Firestore Rule)
**Why:** The primary value of the `/t/:tournamentId` public page — fixture schedule — is invisible to the intended audience (unauthenticated fans). The page silently shows an empty Fixtures tab.

**Fix:** `allow read: if resource.data.isPublic == true || isSignedIn()` on the fixtures subcollection. Requires the parent tournament's `isPublic` to be accessible — use `get()` to read it in the rule, or relax to unconditional read (fixtures contain no sensitive data).

---

### 2. Convert Tournament Match Fetch to Realtime Subscription
**Why:** Standings, fixture statuses, and statistics on both the organizer page and the public tournament page go stale immediately when a tournament match transitions state. This is the core tournament use case — watching standings update as games finish.

**Fix:** Replace `getTournamentMatches()` with a realtime Firestore listener in both `TournamentDetailsPage` and `PublicTournamentPage`. Use `useRealtimeCollection` with the same query (`where("tournamentId", "==", id)`).

---

### 3. Fix `teamIds` Data Model — Store `{teamId, name}` Objects
**Why:** The public tournament page renders team names as raw Firestore IDs (`teamIds` stores string IDs; `.name` is always `undefined`). The organizer page silently drops teams not in the current scorer's team map. Both break the tournament experience.

**Fix:** Change `addTeamToTournament` to push `{ teamId, name: team.name }` objects. Migrate existing data or add a null-safe resolver. Update consumers to read `.name` from the array element.

---

### 4. Gate Scorer Self-Upgrade Behind Email Verification
**Why:** Public beta with unverified open registration + instant scorer promotion = a spam surface for fake matches on the public Discover page. One weekend of open beta could pollute the discovery feed permanently.

**Fix:** In `upgradeToScorer` check `user.emailVerified` before writing. Update the dashboard CTA to prompt email verification if not yet verified. Correspondingly, add a Firestore rule check that prevents upgrade if `emailVerified` is false (requires passing it through; alternatively handle purely client-side with Firebase Auth `.emailVerified`).

---

### 5. Fix Private Match Firestore Read Rule
**Why:** The current rule allows any signed-in user to read any match (`isSignedIn()` is sufficient). Private matches (`isPublic === false`) should be readable only by their creator.

**Fix:**
```
allow read: if isPublicMatch()
  || (isSignedIn() && resource.data.get('createdBy', request.auth.uid) == request.auth.uid)
  || isSignedIn(); // keep for backward-compat on legacy matches without createdBy — tighten post-migration
```

---

### 6. Add "Share Public Link" CTA to Tournament Details Page
**Why:** Organizers have no way to discover or share `/t/:tournamentId`. Without this, the new public tournament page has zero organic reach. Organizers will not share what they cannot find.

**Fix:** Add a "Copy Public Link" / "Share" button in the TournamentDetailsPage header (owner-only) that copies `window.location.origin + "/t/" + tournamentId` to clipboard. Show only when `isPublic === true`.

---

### 7. Remove Settings Nav Item or Implement Settings Page
**Why:** A dead navigation link on the first screen authenticated users see is a beta quality signal that erodes trust. New users clicking Settings and seeing nothing (or a broken route) will doubt the platform's maturity.

**Fix:** Either remove the Settings menu item from AppShell's profile dropdown, or implement a minimal Settings page (change email/password, account info, theme toggle).

---

### 8. Add "Resume Scoring" Banner for In-Progress Matches
**Why:** On mobile during a cricket match, accidental navigation is common. There is no in-product prompt to return to an active scoring session. Scorers lose their session silently; the live scorecard freezes for viewers.

**Fix:** On the Dashboard, check `ongoing` matches where `createdBy == user.uid` and status is `in-progress`. Show a prominent banner: "You have an active match — Resume Scoring" linking to `/score-card?matchId=X`.

---

### 9. Add Error Telemetry
**Why:** The platform has no visibility into production errors. Silent Firestore failures, component crashes, and scoring persistence errors currently surface to users as empty states or stale data with no reporting to the team.

**Fix:** Integrate Firebase Crashlytics (for mobile-style crash reporting in web) or Sentry (standard web error tracking). Add a global React error boundary in `App.jsx` that reports to telemetry before rendering the fallback UI.

---

### 10. Fix End-Innings Checkbox Tap Target for Mobile
**Why:** The double-confirmation checkbox introduced in the sprint is 18×18px — less than half the WCAG 2.1 AA minimum of 44×44px. In a high-stakes scoring moment (end of an innings), a mis-tap is likely. The checkbox may reset to unchecked if the tap lands slightly off-center, causing frustration.

**Fix:** Replace the raw `<input type="checkbox">` with MUI `<Checkbox>` component which has a 42×42px default tap area, consistent with the rest of the design system. Wrap in a `<FormControlLabel>` for accessible label association.

---

## Summary

CricVelo is a well-built product with a clear architectural vision. The scoring engine is the strongest part — complete, defensively programmed, and well-tested against edge cases. The tournament module added significant organizer value but shipped with a data model flaw (`teamIds`) and a realtime gap that undermine the live experience. Security is improved from the last audit but still has three meaningful gaps for a public launch (email verification gate, private match reads, fixture reads).

**Recommendation:** Deploy to a **closed beta** (invited scorers and organizers you know) immediately — the platform is stable enough for that. **Open public beta** after fixing Top 10 items 1–5 (the five data/security blockers). The remaining items improve quality and growth but don't block a trustworthy product.
