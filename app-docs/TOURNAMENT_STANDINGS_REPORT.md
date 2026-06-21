# Wave 4B — Tournament Standings Report

## 1. Files Changed

### New Files
| File | Description |
|------|-------------|
| `src/utils/tournamentStandings.js` | Pure standings calculation — no Firestore, no React |

### Modified Files
| File | Change |
|------|--------|
| `src/pages/TournamentDetailsPage.jsx` | Full rewrite — added tabs (Overview/Standings/Teams/Matches), dashboard stats strip, standings table, all empty states |

---

## 2. Calculation Logic

### Location
`src/utils/tournamentStandings.js`

### Inputs
```js
calculateStandings(completedMatches: Match[], allTeamNames: string[]) → StandingRow[]
```

- `completedMatches` — already filtered to `status === 'completed'` in the component using `isCompletedMatch()`
- `allTeamNames` — names of all teams assigned to the tournament; seeds zeroed rows so teams with no games played still appear in the table

### Points
| Result | Points |
|--------|--------|
| Win    | 2      |
| Tie    | 1      |
| Loss   | 0      |

### Winner Detection (in priority order)
1. `match.isTie === true` → both teams get 1 point
2. `match.winnerTeamKey === "teamA"` → teamA wins 2 pts, teamB 0
3. `match.winnerTeamKey === "teamB"` → teamB wins 2 pts, teamA 0
4. Fallback: `match.winnerName` string compared against `match.teams.teamA.name` / `match.teams.teamB.name`
5. If none of the above resolves → `played` is still incremented for both teams, but no points are awarded

### Sort Order
```
Points desc → Wins desc → team name asc (locale alphabetical tiebreak)
```

### Leader
`getLeader(standings)` returns the first row where `played > 0`, or `null` if no matches have been completed.

### Example
```
Teams: Alpha CC, Bravo XI, Charlie XI
Completed matches:
  Alpha CC vs Bravo XI → Alpha CC wins (winnerTeamKey: "teamA")
  Alpha CC vs Charlie XI → Tie (isTie: true)

Result table:
  #  TEAM         P  W  L  T  PTS
  1  Alpha CC     2  1  0  1   3
  2  Charlie XI   1  0  0  1   1
  3  Bravo XI     1  0  1  0   0
```

---

## 3. Validation

### Phase 1 — Standings Engine
- `calculateStandings([], [])` returns `[]`
- Teams seeded from `allTeamNames` appear with all-zero stats even before any matches
- Win correctly awards 2 pts to winner, 0 to loser
- Tie correctly awards 1 pt to each team
- Sort: higher points appear first; wins tiebreak points equality; alphabetical tiebreaks wins equality
- Matches with unresolvable winner are counted as `played` but award no points (safe default)

### Phase 2 — Standings Table
- `StandingsTable` renders skeleton when `loading === true`
- Empty state "No teams added" shown when `standings.length === 0`
- "No completed matches yet" shown when all rows have `played === 0` — zeroed table still visible below so teams are registered
- Leader row (index 0 with `played > 0`) highlighted in primary color with trophy icon
- Points column bold/accent for leader row
- Columns: # · TEAM · P · W · L · T · PTS

### Phase 3 — Match Linking
- `getTournamentMatches(tournamentId)` already fetches all matches with `tournamentId == id`
- `completedMatches` is derived in the component via `useMemo` + `isCompletedMatch()`
- Only completed matches feed `calculateStandings()`; scheduled/in-progress matches are excluded

### Phase 4 — Dashboard Strip
Four stat cards displayed above the tabs:
- **Teams** — `assignedTeams.length`
- **Matches** — `tournamentMatches.length` (shows "—" while loading)
- **Completed** — `completedMatches.length`
- **Leader** — `leader.teamName` with `pts · W` sub-label; shows "—" / "No results yet" when no results

### Phase 5 — Empty States
| State | Shown in |
|-------|----------|
| No teams in tournament | Standings tab (seed list empty), Teams tab |
| No matches linked | Matches tab |
| No completed matches (teams exist) | Standings tab — zeroed table with banner |
| Loading state | Matches tab (2 skeletons), Standings tab (3 skeletons) |

---

## 4. Build Result

```
✓ 1135 modules transformed.
✓ built in 12.81s
Zero errors
```

---

## 5. Lint Result

```
npx eslint src/utils/tournamentStandings.js src/pages/TournamentDetailsPage.jsx
(no output — zero errors, zero warnings)
```

---

## 6. Remaining Tournament Gaps

| Gap | Priority | Notes |
|-----|----------|-------|
| **Fixtures / Schedule** | High | Auto-generate round-robin or knockout fixtures from assigned teams; show fixture list in Matches tab with dates |
| **NRR (Net Run Rate)** | Medium | Requires total runs scored/conceded + total overs faced across all tournament matches — not implemented per spec |
| **Knockout Bracket** | Medium | Visual bracket UI for elimination rounds — not in scope for Wave 4B |
| **Public Tournament Page** | Medium | Unauthenticated viewers currently cannot see the standings; tournament page is under `ScorerRoute` |
| **Team name snapshot drift** | Low | Standings match team names from match snapshots (`match.teams.teamA.name`). If a team is renamed after matches are scored, the name in standings will differ from the current team name in `teamIds`. Consider denormalizing team name into the tournament's `teamIds` structure or re-resolving by teamId. |
| **Points customization** | Low | Win/Tie/Loss points are hardcoded (2/1/0). Some tournaments use 3/1/0 or custom rules. |
| **Tournament-level player stats** | Low | Top scorers, most wickets across tournament matches — requires aggregation across all scorecard innings |
