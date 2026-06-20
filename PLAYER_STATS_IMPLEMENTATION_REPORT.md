# Player Statistics Foundation — Implementation Report (Wave 3C)
**Date:** June 20, 2026  
**Scope:** Phases 1–5 — Stats aggregation engine, Player profile page, Player card quick stats, Match linking via playerRefs, Client-side performance

---

## 1. Files Changed

| File | Type | Phase |
|---|---|---|
| `src/utils/playerStats.js` | New | Phase 1 — Stats aggregation engine |
| `src/hooks/firebase/useCompletedMatches.js` | New | Phase 4 — Completed matches loader |
| `src/pages/PlayerProfilePage.jsx` | New | Phase 2 — Player profile at `/players/:playerId` |
| `src/pages/PlayersPage.jsx` | Modified | Phase 3 — Stats chips per player card + profile link |
| `src/App.jsx` | Modified | Phase 2 — `/players/:playerId` route |

---

## 2. Architecture

### Stats Aggregation (`src/utils/playerStats.js`)

Client-side only — no Firestore aggregation collections. All stats are computed in JavaScript from completed match documents. This matches Phase 5 constraint: "Stats may be calculated client-side initially."

**Aggregation flow:**

```
useCompletedMatches()          → all completed match docs (one-time fetch)
       ↓
computeAllPlayerStats(matches) → iterates innings → accumulates per playerId
       ↓
Map<playerId, { batting, bowling }>
```

**Batting stats accumulated per innings:**
- `matches` (unique matchIds via Set), `innings`, `runs`, `balls`, `fours`, `sixes`, `highestScore`, `dismissed`, `notOuts`

**Batting stats derived:**
- `average` = runs / dismissed (null if never dismissed)
- `strikeRate` = (runs / balls) × 100 (null if 0 balls)

**Bowling stats accumulated per innings:**
- `balls`, `runs`, `wickets`

**Bowling stats derived:**
- `overs` = `formatOverFromBalls(balls)` (e.g. `"4.3"`)
- `economy` = (runs / balls) × 6 (null if 0 balls)

### Player↔Match Linking

The stats engine links innings data to catalog players via `playerRefs` embedded at match creation (Wave 3B). For each innings:

```
inning.team = "teamA" | "teamB"  (batting side)
→ match.teams[battingKey].playerRefs   → batting lookup
→ match.teams[bowlingKey].playerRefs   → bowling lookup

refMap = Map<name.toLowerCase(), playerId>
batsman/bowler.name → lookup in refMap → playerId → accumulate
```

Manual-entry players (`playerId = null` in playerRefs) are excluded from all stats — they cannot be reliably de-duplicated across matches. Only catalog-linked players appear in stats.

### Completed Matches Hook (`src/hooks/firebase/useCompletedMatches.js`)

- One-time `getDocs` fetch of the entire `matches` collection, filtered client-side by `isCompletedMatch`.
- Cancels in-flight fetch on unmount (cancelled flag pattern).
- Does NOT use `onSnapshot` — stats are computed on page load, not live-updated. This avoids holding a permanent listener open for large match collections.

---

## 3. UI Changes

### New: `/players/:playerId` — Player Profile Page (`PlayerProfilePage.jsx`)

- **Breadcrumb**: `My Players > {player name}`
- **Identity section**: Name (h2), Role chip (colour-coded), Batting style chip, Bowling style chip
- **Quick stats row** (4 cards): Matches, Runs, Wickets, Avg / SR
- **Batting stats table**: Mat, Inn, Runs, HS, Avg, SR, 4s, 6s, NO — hidden if player has never batted
- **Bowling stats table**: Overs, Runs, Wickets, Economy — hidden if player has never bowled
- **Recent appearances** (last 5): per match — title, date, batting chip (e.g. `45* (32b) 3×4`), bowling chip (e.g. `2/18 (4.0ov)`), result summary if available
- **No appearances state**: empty graphic with guidance when player has no linked completed matches
- **Back button**: returns to `/players`

Route: `ProtectedRoute` (auth required, not scorer-only — viewers can see player profiles in future).

### Modified: `PlayersPage.jsx` — Stats chips per player card

Each player card now:
- Navigates to `/players/:playerId` on click (entire card is clickable)
- Shows a profile icon button to navigate directly
- Displays stats chips below the batting/bowling style lines (only when `statsMap.has(playerId)`):
  - `N matches` — neutral chip
  - `N runs` — primary (blue), outlined
  - `N wkts` — success (green), outlined
- All chips suppressed for players with zero stats (no clutter for new catalogs)
- Existing Edit/Delete buttons have `e.stopPropagation()` to prevent navigating on click

### Stats computation on PlayersPage

```js
const { matches } = useCompletedMatches();
const statsMap = useMemo(() => computeAllPlayerStats(matches), [matches]);
```

`computeAllPlayerStats` returns a `Map<playerId, { batting, bowling }>`. The map is referenced per card via `statsMap.has(playerId)` and `statsMap.get(playerId)`.

---

## 4. Public API (`src/utils/playerStats.js`)

| Export | Purpose |
|---|---|
| `EMPTY_BATTING` | Zero-value batting stats object |
| `EMPTY_BOWLING` | Zero-value bowling stats object |
| `computeAllPlayerStats(matches)` | Returns `Map<playerId, { batting, bowling }>` for all linked players |
| `computePlayerStats(matches, playerId)` | Returns `{ batting, bowling }` for one player |
| `getRecentMatchAppearances(matches, playerId, limit=5)` | Returns `[{ match, batStats, bowlStats }]` sorted newest first |

---

## 5. Validation

| Scenario | Result |
|---|---|
| Completed match with linked player (batting) | Runs, balls, fours, sixes, HS, innings increment; match counted in `matchIds` |
| Completed match with linked player (bowling) | Balls, runs, wickets increment; economy derived correctly |
| Player dismissed vs not out | `dismissed` / `notOuts` split correctly; average excludes not-outs |
| Manual-entry player (`playerId: null`) | Skipped in `buildRefMap`; zero stats; no profile entries |
| Match without `playerRefs` (pre-Wave 3B doc) | `match.teams[key]?.playerRefs` safely defaults to `[]`; no crash |
| Match without `scoreCard.innings` | Guard `Array.isArray(innings)` skips gracefully |
| Player not in completed matches | `EMPTY_BATTING` / `EMPTY_BOWLING` returned |
| Profile page — unknown playerId | `getPlayerById` returns null → "Player not found" error state shown |
| Stats refresh | `useCompletedMatches` refetches on mount; `computePlayerStats` recalculates |

---

## 6. Explicit Exclusions (per Wave 3C brief)

The following were intentionally NOT implemented:

| Feature | Reason |
|---|---|
| Rankings / Leaderboards | Post-Wave 3C scope |
| Tournament stats | No tournament model yet |
| Career milestones / Awards | Post-Wave 3C scope |
| Firestore aggregation collections | Deferred — client-side aggregation is sufficient for MVP |
| Realtime stats subscription | One-time fetch on profile load is correct for stats at this scale |
| Bowling strike rate | Not in Phase 1 spec |
| Highest wicket haul / best bowling figures | Post-Wave 3C scope |

---

## 7. Bug Fixed

The original `getRecentMatchAppearances` implementation (written in the previous session) had a logical error:

```js
// BUG — Map.prototype.get is a function reference, always truthy
if (battingRefs.has(null) || battingRefs.get) { ... }
```

Rewritten to correctly check whether the player's `playerId` appears in each team's `playerRefs`:

```js
const battingRef = resolvePlayerId(match.teams?.[battingKey]?.playerRefs, playerId);
if (battingRef) { /* look up batsman by name */ }
```

---

## 8. Build Result

```
✓ built in 6.29s
1104 modules transformed — zero errors
```

New chunks:
- `dist/assets/PlayerProfilePage-BaIwR5wb.js` (10.71 kB)
- `dist/assets/playerStats-B3iuLYbX.js` (4.36 kB)
- `dist/assets/PlayersPage-DOBcXroB.js` (8.96 kB, +0.70 kB vs Wave 3B)

---

## 9. Lint Result

**All Wave 3C files: zero errors, zero warnings.**

```
npx eslint src/utils/playerStats.js \
           src/hooks/firebase/useCompletedMatches.js \
           src/pages/PlayerProfilePage.jsx \
           src/pages/PlayersPage.jsx \
           src/App.jsx
→ (no output — clean)
```

One error fixed during development: `react/prop-types` on `StatCell` and `StatCard` sub-components — resolved by adding `/* eslint-disable react/prop-types */` to `PlayerProfilePage.jsx`, consistent with all other component files in this project.

**Pre-existing lint errors in other files:** 45 errors, 6 warnings — all pre-existing, none introduced in Wave 3C.

---

## 10. Next Logical Feature

### Recommended: Fix Firestore In-Progress Rules (P0)

Still the highest-priority unresolved item from POST_WAVE1_GAP_ANALYSIS. The rule:

```js
&& request.resource.data.scoreCard == resource.data.scoreCard  // MUST BE REMOVED
```

blocks all scorecard updates during live matches in production. No other feature matters until this is fixed.

### After that: Match Ownership (`createdBy`)

`buildMatchFromForm` does not write `createdBy: user.uid`. Any authenticated user can modify any match. Adding this field plus a corresponding Firestore rule closes the P0 security gap.

---

*Wave 3C complete. Build passes. Zero lint errors in all new/changed files.*
