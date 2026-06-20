# Wave 4D — Tournament Statistics Report

## 1. Files Changed

### New Files
| File | Description |
|------|-------------|
| `src/utils/tournamentStats.js` | Pure functions: batting/bowling leaderboards + tournament overview from scorecard data |

### Modified Files
| File | Change |
|------|--------|
| `src/pages/TournamentDetailsPage.jsx` | Added Statistics tab (index 5); reordered tabs (Standings before Fixtures); added leaderboard sub-components; added three `useMemo` computations |

---

## 2. Statistics Engine (`tournamentStats.js`)

### Design decision: name-based aggregation
The existing `computeAllPlayerStats` in `playerStats.js` uses `playerId` as the grouping key and excludes manual-entry players (those without a catalog `playerId`). Tournament grassroots cricket commonly uses manual-entry players who lack catalog IDs. For tournament leaderboards, aggregation by **player name + team name** is more appropriate.

This is NOT a duplicate of the career stats system — it is a complementary, tournament-scoped leaderboard that includes all players regardless of catalog linkage.

### `computeTournamentBatting(completedMatches)` → top 10 batters
- Groups by `name + teamName` (case-insensitive key)
- Reads `inning.batsmen[]`: `name`, `runs`, `balls`, `isOut`
- Derives: `average` (runs/dismissals or "N/O"), `strikeRate` (runs/balls × 100)
- Sort: runs desc → average desc
- Returns top 10

### `computeTournamentBowling(completedMatches)` → top 10 bowlers
- Groups by `name + bowlingTeamName` (bowling team = opposing inning's team)
- Reads `inning.bowlers[]`: `name`, `balls`, `runs`, `wickets`
- Derives: `overs` via `formatOverFromBalls`, `economy` (runs/balls × 6)
- Sort: wickets desc → economy asc (lower is better)
- Returns top 10

### `computeTournamentOverview(completedMatches)` → tournament summary
| Stat | Source |
|------|--------|
| Total Matches | `completedMatches.length` |
| Total Runs | Sum of `inning.runs` across all innings |
| Total Wickets | Sum of `inning.wickets` across all innings |
| Highest Team Score | Max `inning.runs` across all innings |
| Highest Individual | Max `batsman.runs` across all batsmen |
| Best Bowling | Max wickets in a single innings (ties broken by fewest runs) |

---

## 3. Tab Structure (updated)

| Index | Tab | Change |
|-------|-----|--------|
| 0 | Overview | Unchanged |
| 1 | Standings | Was index 2 — moved forward |
| 2 | Fixtures | Was index 1 — moved back |
| 3 | Teams | Unchanged |
| 4 | Matches | Unchanged |
| 5 | Statistics | **New** |

---

## 4. Statistics Tab UI

### Empty state
When `completedMatches.length === 0`: shows `BarChartIcon` + "No completed matches yet" message.

### Overview section
Six `OverviewCard` components in a wrapping flex row:
- Matches Played
- Total Runs
- Total Wickets
- Highest Team Score (shows `runs/wickets`, sub-label: `teamName vs opponent`)
- Highest Individual (shows `runs*` for not-out, sub-label: `name (team)`)
- Best Bowling (shows `wickets/runs`, sub-label: `name (team)`)

Highest team/individual/best bowling cards only render when data exists.

### Top Batters leaderboard
Columns: `#` | `Player / Team` | `INN` | `RUNS` | `HS` | `AVG` | `SR`
- RUNS highlighted in primary color
- Player name truncates on overflow; team name shown as caption below

### Top Bowlers leaderboard
Columns: `#` | `Player / Team` | `OVR` | `WKTS` | `RUNS` | `ECO`
- WKTS highlighted in primary color
- Same overflow handling as Batters

Both leaderboards match the visual style of StandingsTable (outlined Paper, header row with dark bg, border-separated rows).

---

## 5. Validation

### PHASE 1 — Tournament match filtering
- All three functions receive `completedMatches` (already derived via `useMemo(() => tournamentMatches.filter(isCompletedMatch), ...)`)
- Only completed matches contribute to statistics — in-progress and scheduled matches are excluded

### PHASE 2 — Top Batters
- Batting stats accumulate across all innings in completed matches
- `average` = "N/O" when player was never dismissed but has runs; "—" when no balls faced
- `strikeRate` = "—" when `balls === 0`
- Sorted: runs desc → average desc

### PHASE 3 — Top Bowlers
- Players with `balls === 0` are filtered out (e.g., a bowler listed but who bowled 0 balls)
- `economy` = "—" when `balls === 0` (filtered out anyway)
- Sorted: wickets desc → economy asc

### PHASE 4 — Tournament Overview
- Highest team score: max `inning.runs` (not filtered by wickets)
- Highest individual: max `batsman.runs` across all batsmen in all innings
- Best bowling: `wickets > 0` required; ties broken by fewest runs conceded
- `not-out` indicated by `*` suffix on individual score (`isOut === false`)

### PHASE 5 — Statistics tab added
- Tab order matches spec: Overview | Standings | Fixtures | Teams | Matches | Statistics
- Tab panel uses `useMemo`-derived `tournamentBatters`, `tournamentBowlers`, `tournamentOverview` — no extra Firestore reads
- Loading state: Statistics tab uses existing `matchesLoading` / `completedMatches` — no separate loading state needed (data already fetched for Standings tab)

---

## 6. Build Result

```
✓ built in 12.99s
Zero errors
```

---

## 7. Lint Result

```
npx eslint src/utils/tournamentStats.js src/pages/TournamentDetailsPage.jsx
(no output — zero errors, zero warnings)
```

---

## 8. Remaining Tournament Gaps

| Gap | Priority | Notes |
|-----|----------|-------|
| **Public Tournament Page** | High | Tournament details behind `ScorerRoute` — public viewers cannot see standings, fixtures, or stats. A read-only `/t/:tournamentId` route would complete viewer experience |
| **NRR (Net Run Rate)** | Medium | Not in scope per spec; requires runs/overs per inning |
| **Knockout / Bracket** | Medium | Not in scope per spec |
| **Tournament name-based player deduplication** | Low | Players with same name on different teams are grouped separately (correct). Players with slightly different name spellings across matches would create duplicate rows |
| **Fixture ordering for TBD dates** | Low | Fixtures with no `scheduledDate` sort before dated ones |
| **Points customization** | Low | Win/Tie/Loss points hardcoded (2/1/0) |
