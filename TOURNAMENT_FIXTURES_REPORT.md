# Wave 4C — Tournament Fixtures Report

## 1. Files Changed

### New Files
| File | Description |
|------|-------------|
| `src/services/firebase/fixtureService.js` | Fixture CRUD, realtime query, derived status helper |
| `src/hooks/firebase/useTournamentFixtures.js` | Realtime fixtures hook via `useRealtimeCollection` |
| `src/components/tournament/FixtureFormDialog.jsx` | Create / Edit fixture dialog (team selects + date) |

### Modified Files
| File | Change |
|------|--------|
| `src/pages/TournamentDetailsPage.jsx` | Added Fixtures tab (index 1), fixture list grouped by status, fixture CRUD, dashboard strip Upcoming stat |
| `src/pages/MatchCreationPage.jsx` | Pre-fill from `location.state.fixturePreFill`; link fixture to match after creation |
| `src/services/firebaseServices.js` | `saveMatch` now returns `matchData` (removed useless try/catch) |
| `firestore.rules` | Added `tournaments/{tournamentId}/fixtures/{fixtureId}` subcollection rules |

---

## 2. Fixture Model

### Firestore Path
`tournaments/{tournamentId}/fixtures/{fixtureId}`

### Schema
```
{
  fixtureId:     string,      // uid() generated at create
  tournamentId:  string,      // denormalized parent id
  teamAName:     string,      // team name snapshot (required)
  teamBName:     string,      // team name snapshot (required)
  scheduledDate: string,      // "YYYY-MM-DD" or "" if TBD
  status:        string,      // stored cache: "Scheduled" | "Live" | "Completed"
  matchId:       string|null, // linked match id; null until "Create Match" is used
  createdAt:     Date,
  updatedAt:     Date,
}
```

### Key design decisions
- **Subcollection** of tournament — naturally scoped, no composite index needed for basic listing
- **Team names denormalized** — avoids a join at render time; drift risk is low (team renames are rare)
- **`matchId` nullable** — fixtures start unlinked; `linkFixtureToMatch()` writes this after match creation
- **`status` stored as cache** — display status is always derived from the linked match's live `status` field (`deriveFixtureStatus`); stored value is only written at creation

---

## 3. Status Flow

```
[Fixture created] ──────────────────────────────────→ status: Scheduled
                                                         matchId: null

[Organizer clicks "Create Match"] → navigate to /create-match
   After wizard completes → linkFixtureToMatch(tournamentId, fixtureId, matchId)
                                                         matchId: <matchId>
                                                         status: Scheduled (stored)

DERIVED STATUS (computed at render, not stored):
   matchId === null                            → Scheduled
   match.status === "scheduled"                → Scheduled
   match.status === "in-progress"              → Live
   match.status === "completed"                → Completed
```

### `deriveFixtureStatus(fixture, matchesById)`
```js
if (!fixture.matchId)                      → SCHEDULED
match not found in map                     → fallback to stored fixture.status
match.status === "completed"               → COMPLETED
match.status === "in-progress"             → LIVE
else                                       → SCHEDULED
```

Status updates automatically on every render — no polling, no Cloud Functions. The `matchesById` map is rebuilt from `tournamentMatches` whenever the match list refreshes.

---

## 4. Validation

### Phase 1 — Fixtures (Create / Edit / Delete)
- `FixtureFormDialog` validates: both Team A and Team B required; Team A ≠ Team B
- Teams are selected from the tournament's `assignedTeams` list — only teams already in the tournament appear
- "Add Fixture" button is hidden when `assignedTeams.length < 2` (empty state shows a hint)
- `createFixture` writes to `tournaments/{id}/fixtures/{id}` subcollection
- `updateFixture` patches teamA, teamB, scheduledDate
- `deleteFixture` hard-deletes the document (only allowed before a match is linked — edit/delete buttons hidden for fixtures with `matchId`)

### Phase 2 — Fixtures Tab
- Tab added at index 1 (before Standings, Teams, Matches)
- Fixtures grouped into three sections: **Live** → **Upcoming** → **Completed**
- Each section only renders when it has at least one fixture
- Loading state: 3 skeletons while `fixturesLoading`
- Empty state: CalendarMonthIcon + prompt when no fixtures exist

### Phase 3 — Create Match from Fixture
- "Create Match" button appears on each fixture that has no `matchId`
- Clicking navigates to `/create-match` with `location.state.fixturePreFill`:
  ```js
  { teamAName, teamBName, title: "TeamA vs TeamB", tournamentId, fixtureId }
  ```
- `MatchCreationPage` reads this state on mount and pre-fills:
  - `matchDetails.teamA` → teamAName
  - `matchDetails.teamB` → teamBName
  - `matchDetails.matchTitle` → "TeamA vs TeamB"
  - `tournamentId` → tournamentId
- After `saveMatch` returns `matchData`, if `fixtureId` is in the state, calls `linkFixtureToMatch(tournamentId, fixtureId, matchData.matchId)` (fire-and-forget `.catch(() => {})`)
- The wizard still runs fully — scorer sets toss, rules, players

### Phase 4 — Fixture Status (Automatic)
- Status is derived at render time from the linked match's `status` field
- Scheduled → Live: when scorer starts the match (match becomes `in-progress`), the fixture display updates on next render
- Live → Completed: when match completes, the fixture display updates on next render
- No explicit update call required — fully reactive through `matchesById` map

### Phase 5 — Tournament Dashboard (Fixtures additions)
- "Upcoming" stat card replaces the previous generic "Matches" card in the dashboard strip
  - Value: count of fixtures with derived status `Scheduled`
  - Sub-label: `Next: YYYY-MM-DD` from the first upcoming fixture with a scheduled date ≥ today
- "Completed" card now shows `completedMatches.length` (unchanged)

### Edit / Delete guards
- Edit and Delete buttons only shown for fixtures with `matchId === null`
- Once a match is linked, the fixture row shows only the "View" / "Watch" button
- This prevents orphaning or editing fixtures that are already tracked as matches

### Firestore rules
```
match /tournaments/{tournamentId}/fixtures/{fixtureId} {
  allow read: if isSignedIn();
  allow create, update, delete: if isScorer();
}
```

---

## 5. Build Result

```
✓ 1139 modules transformed.
✓ built in 24.29s
Zero errors
```

---

## 6. Lint Result

```
npx eslint [all Wave 4C files]
(no output — zero errors, zero warnings)
```

---

## 7. Remaining Tournament Gaps

| Gap | Priority | Notes |
|-----|----------|-------|
| **Public Tournament Page** | High | Tournament details page is behind `ScorerRoute` — public viewers cannot see fixtures or standings. A read-only public route `/t/:tournamentId` would complete the viewer experience |
| **Fixture index for ordering** | Medium | `buildFixturesQuery` uses `orderBy("scheduledDate")` — if `scheduledDate` is empty string, those fixtures sort to the top. Consider a secondary `createdAt` sort or null-last handling |
| **NRR (Net Run Rate)** | Medium | Not in scope per spec; would require runs/overs aggregation across all completed tournament matches |
| **Knockout / Bracket** | Medium | Not in scope per spec |
| **Points customization** | Low | Win/Tie/Loss points are hardcoded (2/1/0); some tournaments use 3/1/0 |
| **Team name drift in fixtures** | Low | Fixture stores team names as a snapshot at creation time. If organizer renames a team, existing fixture rows won't reflect the new name |
| **Tournament-level player stats** | Low | Top scorers, most wickets across all tournament matches — requires aggregation across scorecard innings |
| **Fixture ordering for TBD dates** | Low | Fixtures with no `scheduledDate` sort before dated ones (empty string < any date string). Could add a separate `sortKey` field |
