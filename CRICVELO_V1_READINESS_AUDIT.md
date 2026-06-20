# CricVelo v1.0 — Release Readiness Audit
**Date:** June 20, 2026  
**Auditor:** Claude Code (Sonnet 4.6)  
**Basis:** Full source audit of 18 pages, 60+ components, all implementation reports, Firestore rules, and service layer. No code was modified during this audit.

---

## EXECUTIVE SUMMARY

CricVelo has delivered a substantial amount of product in a short period. It is now a multi-feature platform covering scoring, teams, players, statistics, discovery, notifications, result sharing, and a full tournament module. The scoring core is clean, the UX is thoughtful, and the architecture is coherent.

**However, CricVelo is NOT ready for public launch.** Two P0 bugs persist from the original MVP audit and have not been fixed through four waves of development: (1) Firestore rules block all live scoring writes, and (2) match ownership is not enforced. These are deployment blockers. Every match scored in production is either writing to an unsecured database or failing silently at the rules layer.

Beyond the P0 blockers, the tournament module is entirely private (Scorer-only routes) — the most important organizer use case has no public visibility. Player statistics only count catalog-linked players, excluding the manual-entry players who dominate grassroots cricket.

---

## SECTION 1 — FEATURE COMPLETENESS

| Feature | Status | Notes |
|---------|--------|-------|
| **Authentication** | Fully Implemented | Email/Google/reset/verification all present. Role routing clean. |
| **Dashboard** | Fully Implemented | Match buckets, stats tiles, recent activity. Viewer onboarding is weak (empty state with no CTA). |
| **Teams** | Fully Implemented | Teams CRUD, roster load into match creation, ownership rules. Minor: `window.confirm()` for delete instead of dialog. |
| **Players** | Fully Implemented | Player catalog, CRUD, role/style attributes, team integration, match creation autocomplete. |
| **Player Stats** | Partially Implemented | Batting/bowling aggregation works. **Critical gap:** only catalog-linked players with `playerId` are counted. Manual-entry players (common in grassroots cricket) produce zero stats. Profile page requires a full scan of all completed matches. |
| **Match Creation** | Fully Implemented | 6-step wizard, draft recovery, tournament linking, team/player autocomplete. |
| **Opening Setup** | Fully Implemented | Striker/non-striker/bowler selection clean. No batting team confirmation banner (minor). |
| **Live Scoring** | Fully Implemented | All 6 dismissal types, fielder attribution, free-hit, undo/redo (40 deep), extras, fall of wickets, persistence queue, retry on failure. |
| **Match Completion** | Fully Implemented | Target reached, all-out, max overs all handled. POTM selection and persistence works. |
| **Public Scorecards** | Partially Implemented | `/live/:matchId` and `/scorecard/:matchId` work. POTM still shows "To be announced" in LiveScoreboard widget even after selection. Ball Timeline imported but dead in LiveScoreboard — viewers on the public live page see no ball-by-ball data. |
| **Discovery** | Fully Implemented | `/discover` page with live/results/upcoming sections and search. Public, no auth required. |
| **Notifications** | Partially Implemented | In-app only. No push (FCM), no email. Follow/unfollow works. `match_started`, `match_completed`, `potm_announced` events. Notification bell with unread count. |
| **Result Share Card** | Fully Implemented | PNG download, native Web Share, clipboard copy. html2canvas integration. Shows from completed scorecard, match details, and public scorecard. |
| **Tournaments** | Partially Implemented | Creation, team assignment, status management. **Critical gap: entirely behind `ScorerRoute` — no public visibility.** |
| **Tournament Standings** | Partially Implemented | Points table (W=2/T=1/L=0) with leader detection. No NRR. |
| **Tournament Fixtures** | Fully Implemented | Create/edit/delete fixtures, derived status from match state, "Create Match from Fixture" pre-fill. |
| **Tournament Statistics** | Partially Implemented | Batting/bowling leaderboards, overview stats. **Gap:** Name-based aggregation (not playerId) — correct for this context, but player names inconsistent across matches will split rows. No reconciliation with career stats. |

---

## SECTION 2 — USER JOURNEYS

### Viewer Journey

| Step | Status | Issue |
|------|--------|-------|
| Discover a match | ✅ `/discover` works | Requires knowing the URL — no SEO indexing |
| Open public live scorecard | ✅ Works | POTM shows "To be announced" even when set |
| See ball-by-ball timeline | ❌ Dead code | `BallTimeline` imported but never rendered in `LiveScoreboard.jsx` |
| Follow a match | ✅ Works | Only in-app notification — no push, no email |
| Get notified of events | ⚠️ Partial | In-app only; must have app open |
| Share the scorecard | ✅ Works | Result card generates fine on completed matches |
| Access a tournament | ❌ Blocked | All tournament pages require Scorer login |
| Find teams/players | ❌ Not available | No public team or player pages |

**Biggest viewer frictions:**
1. Zero public tournament visibility — grassroots fans following a tournament have no page to visit
2. No ball-by-ball feed on the public live page (dead code)
3. POTM inconsistency (hardcoded "To be announced" on live widget)
4. No SEO — `/discover` is client-rendered, invisible to search engines

---

### Scorer Journey

| Step | Status | Issue |
|------|--------|-------|
| Register and get scorer role | ⚠️ Partial | Registration creates Viewer role; no self-service path to Scorer role |
| Create a match | ✅ Works | 6-step wizard with draft recovery |
| Load a saved team | ✅ Works | Load button in Teams step |
| Score ball-by-ball | ✅ Works | Full scoring console functional |
| End innings | ⚠️ Risk | Single-confirm dialog — high accidental trigger risk on mobile |
| Complete match and select POTM | ✅ Works | |
| Share result card | ✅ Works | |
| Link match to tournament | ✅ Works | Via Notes step tournament selector |
| Resume a match after navigating away | ❌ Dead end | No "resume" banner or session guard — manual URL manipulation needed |
| Export scorecard as PDF | ❌ Missing | No PDF export |

**Biggest scorer frictions:**
1. No self-service Scorer role upgrade — new signups land as Viewer with no CTA
2. No "resume scoring" prompt if scorer navigates away from `/score-card`
3. End Innings single-confirm is dangerous on small screens
4. No cross-team player deduplication (same player can appear on both sides)
5. Team max is 15 — should be stated in the wizard for format-aware squads

---

### Organizer Journey

| Step | Status | Issue |
|------|--------|-------|
| Create a tournament | ✅ Works | TournamentFormDialog with format, dates, description |
| Assign teams | ✅ Works | Add team from user's saved teams |
| Create fixtures | ✅ Works | Full fixture CRUD |
| Create match from fixture | ✅ Works | Pre-fill with team names and tournament ID |
| View standings | ✅ Works | Points table auto-calculated from completed matches |
| View tournament statistics | ✅ Works | Batting/bowling leaderboards |
| Make tournament public | ⚠️ Partial | `isPublic` flag exists on tournament document, but the route is `ScorerRoute` regardless |
| Share tournament with viewers/fans | ❌ Blocked | No public URL for tournaments |
| Generate fixtures automatically | ❌ Missing | Manual fixture creation only; no round-robin generator |

**Biggest organizer gaps:**
1. Tournament pages are auth-gated — organizers cannot share a public URL with fans
2. No fixture generator — must create fixtures one by one
3. No NRR calculation in standings
4. No status transitions prompted (organizer must manually set Draft → Live → Completed)
5. Deleting a match doesn't remove it from tournament standings (standing doesn't auto-correct)

---

## SECTION 3 — TOURNAMENT REVIEW

### What Works
- Full tournament CRUD with validation (name required, format/status dropdowns)
- Team assignment from scorer's saved teams with remove
- Fixture model: teamA/teamB/scheduledDate with status derived from linked match
- "Create Match from Fixture" pre-fill (teams + tournament linking)
- Fixture status automatically reflects live match state (no Cloud Functions needed)
- Points table: correct win/tie/loss detection via `winnerTeamKey` and `isTie`
- Statistics: name-based batting/bowling leaderboards, six overview stat cards
- Dashboard strip: Teams count, Upcoming fixtures count, Completed matches, Current leader

### Missing / Broken

| Issue | Priority |
|-------|----------|
| No public tournament URL — all behind `ScorerRoute` | **P0** |
| `isPublic` tournament field exists but has no effect on route access | **P0** |
| No NRR (Net Run Rate) in standings | P1 |
| No automated fixture generation (round-robin) | P1 |
| No tournament status auto-transition prompts | P1 |
| Fixture TBD date sorts before dated fixtures (empty string < any date string) | P1 |
| Team name drift: fixture stores team name snapshot at creation — renames don't propagate | P2 |
| No "Save team from match" shortcut | P2 |
| No points customization (hardcoded 2/1/0) | P2 |
| No knockout bracket | P2 |
| No public tournament microsite (SEO) | P2 |
| Tournament matches query is one-time fetch — no live updates on TournamentDetailsPage | P2 |

---

## SECTION 4 — CRICKET REVIEW

### Scoring Engine — What Works
- All 6 dismissal types: Bowled, Caught, LBW, Run Out, Stumped, Hit Wicket
- Fielder attribution for Caught, Stumped, Run Out
- Fall of Wickets tracked and displayed
- Free Hit state machine (no-ball → free hit survives wides, consumed by legal delivery)
- Extras mutual exclusion (only one type active per delivery)
- Striker rotation on odd runs and over completion
- Wide and no-ball do not count as legal balls
- Target/required run rate / current run rate all computed
- Undo/redo 40-deep

### Missing or Incorrect

| Issue | Priority | Impact |
|-------|----------|--------|
| **Firestore in-progress rules block all scoring writes** | **P0** | If deployed, every ball fails silently |
| No console.log removal (ScoreCard.jsx line 213, MatchScoreCard.jsx line 91) | P1 | Performance and information leak |
| Retired hurt / retired out dismissal missing | P1 | Valid cricket outcome with no resolution path |
| Super over (tied T20) — no flow exists | P1 | T20 tied matches have no result path |
| Powerplay marking missing | P1 | No visual for field restriction overs 1-6 |
| Partnership records missing | P1 | Standard scorecard element absent |
| No-ball wicket edge case (wicket on last ball of over when no-ball) | P1 | May cause missed bowler-change dialog |
| Batter runs scored on a wide not tracked separately | P1 | Wide that goes to boundary shows as 5 but batter's 4 is unattributed |
| Abandoned / No Result match status | P1 | Weather scenario has no resolution |
| Penalty runs missing | P2 | Uncommon but valid cricket event |
| DLS/rain adjustment | P2 | Not expected at grassroots level |
| Format-specific logic (T20 vs ODI vs Test) — format selected but ignored | P2 | No different game logic per format |
| Over-by-over run chart (Manhattan) | P2 | Visual analytics viewers expect |
| Wagon wheel | P3 | Advanced; not blocking |

### Scoring UX Gaps
- End Innings button is single-confirm — very dangerous adjacent to Save status on mobile
- No "Ball N of over M" counter for scorer mental tracking
- No bowler spell summary (this over: X runs, Y wickets)
- No batsman strike-rate trend (only static SR in table)

---

## SECTION 5 — PERFORMANCE REVIEW

| Area | Issue | Risk |
|------|-------|------|
| **Bundle size** | 948 KB main bundle (unminified), 266 KB gzipped. No code splitting beyond lazy page loading. | High — mobile networks on cricket grounds are often 3G/4G; initial load is slow |
| **Discovery query** | Fetches up to 120 public matches on every `/discover` page load, one-time fetch, no pagination | Medium — acceptable at <1000 matches; breaks at scale |
| **Player stats aggregation** | `computeAllPlayerStats` scans ALL completed matches client-side on every profile page visit | High — O(n) scan; 500+ matches will cause visible lag |
| **Tournament stats aggregation** | Same pattern: all completed tournament matches scanned on every Stats tab open | Medium — bounded per tournament; lower risk |
| **Dashboard queries** | Three separate Firestore queries per dashboard load (live, upcoming, completed). Not paginated. | Medium |
| **Firestore `userRole()` cost** | Every match read/write triggers `get(userDocPath())` in Firestore rules. At scale, this doubles billing | High — one `get()` per rule evaluation, every authenticated request |
| **Realtime listeners on tournament stats** | Tournament matches loaded via one-time `getTournamentMatches` (not realtime). Stats don't update during live scoring without a page refresh | Low — acceptable for tournament context, unexpected for users |
| **No Firestore indexes for sorting** | `useUserTeams` and `useUserPlayers` sort client-side. If `orderBy` is added, composite indexes needed | Low now; potential 500 errors if indexes not added |

---

## SECTION 6 — SECURITY REVIEW

### Critical

| Issue | Location | Detail |
|-------|----------|--------|
| **Firestore in-progress rule blocks all scoring** | `firestore.rules` lines 55–59, 66 | `request.resource.data.scoreCard == resource.data.scoreCard` deep-equality check rejects every ball write. If deployed, live scoring silently fails. If NOT deployed, the app runs with default permissive rules (open to anyone). |
| **No match ownership enforcement** | `matchService.js` `buildMatchFromForm` | `createdBy` field is never written to match documents. Firestore rules grant any `scorer` full edit/delete rights to any other scorer's match. One bad actor can archive all matches. |

### High

| Issue | Location | Detail |
|-------|----------|--------|
| **Tournament pages auth-gated regardless of `isPublic`** | `App.jsx`, `ScorerRoute` | `isPublic` flag on tournament documents exists in the schema but the route `/tournaments/:tournamentId` is wrapped in `ScorerRoute`. Even a public tournament is inaccessible to viewers. |
| **Tournament Firestore read rule requires `isSignedIn`** | `firestore.rules` lines 99–103 | `allow read: if resource.data.isPublic == true OR (isSignedIn() AND organizerId == uid)`. This is correct for DB access but the UI route still requires Scorer role. Mismatch between rules and route protection. |
| **Player catalog is scorer-only** | `firestore.rules` + `ScorerRoute` | Player profiles at `/players/:playerId` use `ProtectedRoute` (any auth), but the underlying player data rule requires `createdBy == uid`. A viewer navigating to a player profile will get a Firestore permission error if they're not the player's creator. |
| **POTM `patchMatchById` on completed matches** | `firestore.rules` lines 61–69 | Completed match update rule requires `scoreCard`, `teams`, `tossDetails`, `scoringRules`, `matchDetails`, and `status` all unchanged. `patchMatchById` only sends the POTM field, not all other fields. Firestore's `updateDoc` with partial fields may still fail this rule because `request.resource.data` reconstructs a full document object. Needs explicit testing. |

### Medium

| Issue | Location | Detail |
|-------|----------|--------|
| `userRole()` called on every rule evaluation | `firestore.rules` | Every match read/write triggers a `get()` to fetch the user profile. Expensive and exposes user document on every evaluation. Use `request.auth.token.role` (custom claims) at scale instead. |
| No rate limiting on notification writes | `firestore.rules` | Any authenticated user can write to `notifications/{notifId}` with any `userId`, `matchId`, and `type` value. Type is validated, but `userId` can point to any user — a scorer could fan-out spam notifications. |
| Discovery fetches private match data | `discoveryService.js` | Query uses `where("isPublic", "==", true)` — correct. But if Firestore rules are misconfigured (no auth check on public read), private matches with `isPublic: false` could be readable too. Rules appear correct but the dependency is fragile. |

### Low

| Issue | Location | Detail |
|-------|----------|--------|
| `window.confirm()` for team delete | `TeamsPage.jsx` | Browser native confirm dialogs have been blocked in some contexts (iframes, PWAs). Should use AppDialog. |
| No CSRF protection | Entire app | Client-side Firebase SDK authenticates with tokens; not applicable to Firestore. Acceptable risk. |
| Match soft-delete via `archivedAt` field | `matchService.js` | Discovery filters `!m.archivedAt` client-side. A server-side filter would be more robust, but risk is low since public discovery is read-only. |

---

## SECTION 7 — MOBILE REVIEW

| Area | Status | Issue |
|------|--------|-------|
| **Dashboard** | Good | Responsive layout. Match cards stack cleanly. |
| **Match Creation Wizard** | Good | 6-step wizard works on mobile. Player name entry is painful with virtual keyboard — no paste/bulk support. |
| **Live Scoring Console** | Medium | Dual-panel layout collapses on small screens. "End Innings" button is adjacent to Save status indicator — high accidental trigger risk during fast scoring. Run buttons may be too small on 5" screens. |
| **Ball Timeline** | Good | Horizontal scrollable chips work fine. |
| **Tournament Pages** | Needs Improvement | TournamentDetailsPage is long with many tabs. No tab indicator of active section on scroll. Fixture list works but long lists need pagination. |
| **Tournament Statistics** | Needs Improvement | Leaderboard tables are horizontally scrollable but have no scroll indicator. SR/AVG/ECO columns overflow on narrow screens (375px). |
| **Discovery** | Good | Card layout works on mobile. Search input is accessible. |
| **Public Scorecard** | Good | Accordion layout works. Dense scorecard tables overflow on very small screens. |
| **Share Card** | Unknown | html2canvas capture quality on mobile Retina screens untested. |
| **Bottom Nav** | Good | Bottom navigation bar on mobile shows correct items. |
| **Keyboard Avoidance** | Unknown | Forms inside dialogs on mobile may be hidden by virtual keyboard — untested. |

---

## SECTION 8 — MISSING FEATURES (TOP 25)

| Rank | Feature | Priority | Rationale |
|------|---------|----------|-----------|
| 1 | **Fix Firestore in-progress rules** | P0 | All live scoring blocked if deployed |
| 2 | **Match ownership (`createdBy`)** | P0 | Any scorer can delete any match |
| 3 | **Public tournament pages** | P0 | Core organizer promise is undeliverable |
| 4 | **Scorer role self-service path** | P0 | New registrations land as Viewer with no upgrade path |
| 5 | **Fix POTM in LiveScoreboard** | P1 | One-line fix; visible inconsistency on every public completed match |
| 6 | **Ball Timeline on public live page** | P1 | Dead code; viewers on `/live/:matchId` see no ball-by-ball |
| 7 | **Remove console.log from production** | P1 | Information leak + noise |
| 8 | **Super over handling** | P1 | T20 tied matches have no resolution |
| 9 | **Retired hurt / retired out** | P1 | Valid dismissal not supported |
| 10 | **Powerplay marking** | P1 | Field restriction overs unmarked |
| 11 | **Partnership records** | P1 | Standard scorecard element |
| 12 | **End Innings double-confirm** | P1 | Single-confirm is dangerous on mobile |
| 13 | **Match resume guard** | P1 | Scorer navigating away loses context |
| 14 | **NRR in tournament standings** | P1 | Standard tournament metric |
| 15 | **Automated fixture generation** | P1 | Manual-only fixture creation is impractical for large tournaments |
| 16 | **PWA manifest + service worker** | P1 | Scorers cannot install; no offline safety net |
| 17 | **Scorecard PDF export** | P1 | Post-match record keeping; players expect this |
| 18 | **Over-by-over run chart (Manhattan)** | P2 | Visual engagement on scorecard |
| 19 | **Abandoned / No Result match status** | P2 | Weather scenario unresolvable |
| 20 | **Tournament NRR / advanced standings** | P2 | Required for serious league management |
| 21 | **Admin panel (role management)** | P2 | No operational tooling for user management |
| 22 | **Scorecard embed widget** | P2 | External site integration |
| 23 | **Cross-team player deduplication** | P2 | Same player can appear on both teams |
| 24 | **Multi-scorer / co-scorer invitation** | P2 | Large events need shared scoring |
| 25 | **Knockout bracket** | P2 | Playoff stage not representable |

---

## SECTION 9 — TECHNICAL DEBT (TOP 20)

| Rank | Severity | Issue | Location |
|------|----------|-------|----------|
| 1 | **Critical** | Firestore in-progress rule `scoreCard == resource.data.scoreCard` blocks all live scoring | `firestore.rules` lines 55–59 AND 66 |
| 2 | **Critical** | `buildMatchFromForm` never writes `createdBy` — no match ownership | `src/services/firebase/matchService.js` |
| 3 | **Critical** | Zero automated tests on the scoring engine | Entire codebase |
| 4 | **High** | POTM hardcoded "To be announced" in `LiveScoreboard.jsx` line 164 | `src/components/viewer/LiveScoreboard.jsx` |
| 5 | **High** | `BallTimeline` imported but never rendered in `LiveScoreboard.jsx` (dead import + dead computations) | `LiveScoreboard.jsx` lines 15, 37–38 |
| 6 | **High** | `console.log` in production scoring path | `ScoreCard.jsx` line 213, `MatchScoreCard.jsx` line 91 |
| 7 | **High** | Main bundle 948KB — no code splitting beyond lazy pages | Vite config |
| 8 | **High** | Pre-existing 45+ lint errors across orphaned and production files | `ScorecardTwo.jsx`, `MatchActionsMenu.jsx`, `LiveScoreboard.jsx`, others |
| 9 | **High** | `ScorecardTwo.jsx` — orphaned file with lint errors, no route or import | `src/components/match/ScorecardTwo.jsx` |
| 10 | **High** | `MatchActionsMenu.jsx` — orphaned file with unclear wiring | `src/components/match/MatchActionsMenu.jsx` |
| 11 | **High** | `userRole()` calls `get(userDocPath())` on every Firestore rule evaluation — doubles billing at scale | `firestore.rules` |
| 12 | **Medium** | No multi-scorer conflict protection — latest-write-wins with no versioning | `useScoringPersistence.js` |
| 13 | **Medium** | `lifecyclePhase` field drifts — set on create/archive, not updated on start/complete/innings transitions | `matchService.js` |
| 14 | **Medium** | Player stats only count `playerId`-linked players; manual-entry players excluded from career and tournament stats | `playerStats.js` |
| 15 | **Medium** | `inning.extras[0]` — extras stored as a single-element array; plain object would be cleaner and safer | `updateScorecard.js`, `ScoreCard.jsx` |
| 16 | **Medium** | Innings transition partial failure: no rollback if `flushPending()` throws mid-transition | `ScoreCard.jsx` → `handleEndOfInnings` |
| 17 | **Medium** | `InputBase` and `SearchIcon` imported but unused in `AppShell.jsx` | `src/layout/AppShell.jsx` |
| 18 | **Medium** | Discovery fetches 120 matches on every load — no pagination, no caching | `discoveryService.js` |
| 19 | **Low** | `matchDetails.date` stored as raw string — not a Firestore Timestamp; inconsistent sort behavior | `matchService.js` |
| 20 | **Low** | `getMatchTitle` reads both `matchDetails.teamA` and `teams.teamA.name` — can diverge if one is edited | `matchDisplay.js` |

---

## SECTION 10 — RELEASE READINESS SCORES

### Engineering: 52 / 100
Two P0 security/correctness bugs remain unresolved through four waves of development. The scoring engine is functionally solid but has zero test coverage. The bundle is too large. Lint debt is unresolved. These issues prevent a responsible public launch.

### UX: 68 / 100
The core scoring console is genuinely good — clean layout, responsive, clear actions. The tournament UI is well-structured. Discovery and notifications add meaningful depth. Gaps: no Scorer role self-service path, no PDF export, no resume guard, POTM inconsistency, End Innings is too easy to trigger accidentally.

### Mobile: 62 / 100
Responsive layout is in place. Scoring console works on mobile. Tournament stats tables overflow on narrow screens. No PWA manifest — scorers cannot install the app and have no offline safety net. The End Innings adjacent to Save Status is a real risk on small touchscreens.

### Performance: 44 / 100
948KB main bundle is heavy. Player stats and tournament stats both do client-side full-table scans. Discovery loads 120 matches on every page visit. Firestore rules call `get()` on every evaluation. These are acceptable at current scale (likely <100 users) but will cause real problems at 10,000+ matches.

### Security: 35 / 100
Two critical vulnerabilities: scoring blocked at DB layer (or DB is open), and any scorer can modify any other scorer's match. These are not theoretical — they are confirmed bugs from source analysis. The notification rules allow spam fan-out. Tournament public access is architecturally inconsistent (DB rules vs. UI routes).

### Growth: 55 / 100
Discovery, notifications, and result sharing are real growth infrastructure. The tournament module adds organizer value. But tournaments have no public URL — the most viral moment (sharing a tournament leaderboard) is impossible. No SEO, no PWA, no push notifications. Player stats are gated to catalog-linked players.

### Tournament Platform: 58 / 100
Foundation is solid: create, teams, fixtures, standings, stats all exist. But the platform is invisible to the public, has no fixture generation, no NRR, no knockout bracket, and no status workflow. Organizers cannot share anything with fans.

---

### Overall Score: **53 / 100**

> **Not ready for public launch.** Ready for private beta with trusted scorers who understand the system.

---

## FINAL DELIVERABLE

---

### 1. WHAT IS COMPLETE

| Category | Delivered |
|----------|-----------|
| **Auth** | Email, Google, verification, password reset, role routing |
| **Scoring engine** | All 6 dismissal types, fielder attribution, FOW, free hit, extras, undo/redo, persistence, retry |
| **Match creation** | 6-step wizard, draft recovery, tournament linking, team/player autocomplete |
| **Teams** | Full CRUD, roster load into match, ownership enforcement |
| **Players** | Catalog CRUD, profiles, role/style attributes, stats foundation |
| **Player Stats** | Batting/bowling aggregation, profile page with recent appearances |
| **Public scorecards** | Live + completed public pages with real-time sync |
| **Discovery** | `/discover` with live/results/upcoming + search |
| **Notifications** | In-app, follow/unfollow, bell badge, notification center |
| **Result Share Card** | PNG download, native share, clipboard — from 3 surfaces |
| **Tournaments** | Full CRUD, team assignment, fixtures, standings, statistics |
| **Tournament Fixtures** | Create/edit/delete, derived status, match pre-fill |
| **Tournament Standings** | Points table, leader detection, dashboard strip |
| **Tournament Statistics** | Batting/bowling leaderboards, tournament overview |

---

### 2. WHAT IS INCOMPLETE

| Category | Gap |
|----------|-----|
| **Security** | Firestore in-progress rule blocks all scoring writes |
| **Security** | Match ownership not enforced — any scorer can modify any match |
| **Tournament access** | Tournaments are entirely private — no public viewer URL |
| **Scorer onboarding** | New registrations land as Viewer with no upgrade path |
| **Cricket completeness** | Super over, retired hurt, powerplay, partnership records missing |
| **Public live page** | Ball timeline on `/live/:matchId` is dead code |
| **POTM consistency** | `LiveScoreboard` hardcodes "To be announced" regardless of POTM state |
| **Player stats coverage** | Manual-entry players excluded from career and tournament stats |
| **Mobile reliability** | No PWA, no offline safety net for scorers |
| **Testing** | Zero automated tests on the scoring engine |
| **Tournament UX** | No fixture generator, no NRR, no bracket, no status workflow |

---

### 3. BIGGEST RISKS

| Risk | Severity | Description |
|------|----------|-------------|
| **Firestore scoring rules bug** | Critical | `scoreCard == resource.data.scoreCard` in in-progress rules rejects every ball. If deployed, all scoring writes fail silently. If not deployed, DB is wide open. |
| **Match ownership absent** | Critical | Any scorer can archive, toggle visibility, or corrupt any other scorer's match data. |
| **Zero test coverage** | High | Scoring engine regressions go undetected. Any change to `updateScorecard.js` can silently break real match data. |
| **No public tournament URL** | High | The most important organizer promise — "run a tournament and share it" — cannot be fulfilled. Organizer acquisition is blocked. |
| **No Scorer self-service role** | High | New users who register to score matches land as Viewer. There is no in-app path to become a Scorer. Word-of-mouth growth is blocked at the registration step. |
| **Player stats exclusion** | Medium | Manual-entry players (majority of grassroots cricket) produce zero career stats. The player statistics feature is effectively invisible to most users. |

---

### 4. BIGGEST OPPORTUNITIES

| Opportunity | Impact |
|-------------|--------|
| **Public tournament pages** | Opens organizer acquisition entirely. A shared tournament leaderboard URL is the most viral moment in grassroots cricket. |
| **PWA manifest** | Scorers install on home screen, get offline safety net. Retention driver for the highest-value users. |
| **Push notifications (FCM)** | In-app notifications exist. Upgrading to push would dramatically improve viewer re-engagement without building a new feature. |
| **Fixture generator (round-robin)** | Organizers create 10-team leagues manually today — 45 fixtures by hand. Auto-generation would be a decisive competitive advantage. |
| **Scorer role self-service** | Add a "Become a Scorer" flow (or change default registration to Scorer) and unblock organic word-of-mouth growth. |
| **Name-based player stats bridge** | `computeTournamentBatting/Bowling` already works name-based. Applying same logic to career stats would include all manual-entry players and dramatically expand stats coverage. |
| **Ball timeline on public live page** | The code is 90% there (imported, computed, not rendered). One JSX render call adds a premium live experience. |

---

### 5. TOP 25 ROADMAP ITEMS

| # | Item | Priority | Effort |
|---|------|----------|--------|
| 1 | Fix Firestore in-progress rule (`scoreCard ==` check) | P0 | 5 min |
| 2 | Write `createdBy: uid` in `buildMatchFromForm` + update Firestore rules | P0 | 1 hr |
| 3 | Public tournament route (read-only, no auth) | P0 | 1 day |
| 4 | Scorer role self-service (change default or add upgrade path) | P0 | 4 hr |
| 5 | Fix POTM in `LiveScoreboard.jsx` (read `match.playerOfTheMatch`) | P1 | 30 min |
| 6 | Render `BallTimeline` on public live page | P1 | 1 hr |
| 7 | Remove `console.log` from production scoring | P1 | 5 min |
| 8 | End Innings double-confirm (text or second dialog) | P1 | 2 hr |
| 9 | Match resume guard on `/score-card` | P1 | 4 hr |
| 10 | PWA manifest + service worker | P1 | 4 hr |
| 11 | Super over flow | P1 | 2 days |
| 12 | Powerplay marking (visual highlight for overs 1-6) | P1 | 4 hr |
| 13 | Partnership records in batting scorecard | P1 | 1 day |
| 14 | NRR in tournament standings | P1 | 1 day |
| 15 | Automated fixture generator (round-robin algorithm) | P1 | 2 days |
| 16 | Retired hurt / retired out dismissal type | P1 | 4 hr |
| 17 | Delete orphaned files: `ScorecardTwo.jsx`, `MatchActionsMenu.jsx` | P1 | 30 min |
| 18 | Resolve 45+ pre-existing lint errors | P1 | 4 hr |
| 19 | Push notifications (FCM integration) | P2 | 3 days |
| 20 | Scorecard PDF export | P2 | 2 days |
| 21 | Name-based career stats (include manual-entry players) | P2 | 1 day |
| 22 | Knockout bracket | P2 | 3 days |
| 23 | Over-by-over run chart (Manhattan) | P2 | 2 days |
| 24 | Admin panel (role assignment) | P2 | 2 days |
| 25 | Abandoned / No Result match status | P2 | 4 hr |

---

### 6. LAUNCH RECOMMENDATION

**Do NOT launch publicly today.**

**Minimum viable fix list before any public deployment (in order):**

1. **Fix Firestore in-progress rule** — Remove `&& request.resource.data.scoreCard == resource.data.scoreCard` from the in-progress match update clause. This is a 5-minute change with critical impact. Deploy rules to Firebase.

2. **Add `createdBy` to match documents** — Write `createdBy: user.uid` in `buildMatchFromForm`. Update Firestore match rules to check `resource.data.createdBy == request.auth.uid` for all non-read operations. One hour of work.

3. **Add Scorer role path** — Either change default registration to Scorer, or add a "Become a Scorer" CTA on the dashboard for Viewer accounts. Without this, organic growth is impossible.

4. **Make tournaments publicly accessible** — Add a `/t/:tournamentId` route (ProtectedRoute or fully public) that renders tournament standings/fixtures read-only. The Firestore rules already support `isPublic: true` — the route just needs to be un-gated.

**After these 4 fixes: ready for private beta with real organizers.**

**Before public launch add:**
- Fix POTM in LiveScoreboard (30 minutes)
- Render BallTimeline on public live page (1 hour)
- Remove console.logs (5 minutes)
- End Innings double-confirm (2 hours)
- Delete orphaned files, resolve lint errors (4 hours)

**Total pre-launch blockers: approximately 2 days of focused engineering.**

The product is functionally rich. The scoring engine is best-in-class for grassroots cricket. The tournament module is well-architected. The two critical bugs are small fixes that were never prioritized through four waves of feature development. Fix them, open tournaments publicly, unblock Scorer registration, and CricVelo is ready to acquire its first real users.

---

*Audit completed June 20, 2026. Source files examined: 28+ pages, 60+ components, all service layer, Firestore rules, all 24 implementation reports. No code was modified during this audit.*
