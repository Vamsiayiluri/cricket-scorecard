# Wave 4A — Tournament Foundation Report

## 1. Files Changed

### New Files
| File | Description |
|------|-------------|
| `src/services/firebase/tournamentService.js` | Service layer — CRUD, team add/remove, query builders |
| `src/hooks/firebase/useUserTournaments.js` | Realtime hook for organizer's tournament list |
| `src/hooks/firebase/useTournament.js` | Realtime single-doc subscription hook |
| `src/components/tournament/TournamentFormDialog.jsx` | Create/Edit dialog with validation |
| `src/pages/TournamentsPage.jsx` | `/tournaments` — list, search, create |
| `src/pages/TournamentDetailsPage.jsx` | `/tournaments/:id` — info, teams, matches, stats placeholder |

### Modified Files
| File | Change |
|------|--------|
| `src/services/firebase/constants.js` | Added `TOURNAMENTS: "tournaments"` to COLLECTIONS |
| `src/services/firebase/matchService.js` | Added `tournamentId: formData?.tournamentId \|\| null` to `buildMatchFromForm` |
| `src/constants/matchCreation.js` | Added `tournamentId: ""` to `EMPTY_MATCH_FORM` |
| `src/components/MatchCreation/NotesForm.jsx` | Added optional Tournament Select (shown only when user has tournaments) |
| `src/pages/MatchCreationPage.jsx` | Fetches user tournaments, passes to NotesForm |
| `src/App.jsx` | Added `/tournaments` and `/tournaments/:tournamentId` routes under `ScorerRoute` |
| `src/layout/AppShell.jsx` | Added "Tournaments" nav item for scorers with `EmojiEventsOutlinedIcon` |
| `firestore.rules` | Added `tournaments/{tournamentId}` collection rules |

---

## 2. Firestore Schema

### `tournaments/{tournamentId}`
```
{
  tournamentId: string,       // uid() generated
  name: string,               // required
  description: string,        // optional
  format: "League" | "Knockout" | "League+Knockout" | "Custom",
  status: "Draft" | "Upcoming" | "Live" | "Completed",
  organizerId: string,        // Firebase Auth UID
  startDate: string,          // ISO date (YYYY-MM-DD)
  endDate: string,            // ISO date (YYYY-MM-DD)
  isPublic: boolean,
  teamIds: string[],          // Array of teamId references
  createdAt: Timestamp,
  updatedAt: Timestamp,
  archivedAt: Timestamp | null
}
```

### `matches/{matchId}` (updated field)
```
{
  ...existing fields...,
  tournamentId: string | null   // links match to tournament
}
```

---

## 3. Tournament Model

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `tournamentId` | string | yes | uid() at creation |
| `name` | string | yes | validated in form |
| `description` | string | no | optional |
| `format` | enum | yes | default "League" |
| `status` | enum | yes | default "Draft" |
| `organizerId` | string | yes | set from `user.uid` at create |
| `startDate` | string | no | date input |
| `endDate` | string | no | must be >= startDate |
| `isPublic` | boolean | yes | default true |
| `teamIds` | string[] | no | managed via arrayUnion/arrayRemove |
| `createdAt` | Timestamp | yes | serverTimestamp() |
| `updatedAt` | Timestamp | yes | serverTimestamp() |
| `archivedAt` | Timestamp\|null | yes | null until archived |

### Status Values
- **Draft** — tournament being set up, not yet announced
- **Upcoming** — scheduled, accepting teams
- **Live** — matches currently being played
- **Completed** — all matches done

### Format Values
- **League** — Round Robin, all teams play each other
- **Knockout** — Single elimination
- **League+Knockout** — Group stage + playoffs
- **Custom** — Freeform

---

## 4. Team Integration

Teams are assigned using the existing `teams` collection (Wave 3A). The flow:

1. Scorer navigates to `/tournaments/:id`
2. Clicks "Add Team" — `AddTeamDialog` shows teams from `useUserTeams()` that are **not yet assigned**
3. On add: `addTeamToTournament(tournamentId, teamId)` uses `arrayUnion` on `teamIds`
4. On remove: `removeTeamFromTournament(tournamentId, teamId)` uses `arrayRemove`
5. TournamentDetailsPage resolves team names/details from `teamMap` (built from `useUserTeams`)

No structural changes to the `teams` collection — tournament assignment is a one-way reference stored on the tournament doc.

---

## 5. Match Integration

Matches link to tournaments via an optional `tournamentId` field:

1. During match creation, Step 4 (Notes & Settings) shows a "Link to Tournament" Select — **only visible if the user has at least one tournament**
2. Selecting a tournament sets `formData.tournamentId`
3. `buildMatchFromForm` writes `tournamentId: formData?.tournamentId || null` to Firestore
4. `getTournamentMatches(tournamentId)` queries `where("tournamentId", "==", tournamentId)` to load matches in the details page

No changes to match scoring flow — `tournamentId` is metadata only.

---

## 6. Validation

### Form Validation (`TournamentFormDialog`)
- Tournament name is required (non-empty after trim)
- End date must be on or after start date (when both provided)

### Firestore Rules Validation
- `create`: caller must be signed in + have scorer/admin role + `organizerId == request.auth.uid`
- `read`: public tournaments readable by all; private only by organizer
- `update/delete`: organizer only

### Route Guard
- `/tournaments` and `/tournaments/:id` wrapped in `ScorerRoute` — viewers cannot access

---

## 7. Build Result

```
✓ 1134 modules transformed.
✓ built in 8.72s
Zero errors
```

---

## 8. Lint Result

```
npx eslint [all Wave 4A files]
(no output — zero errors, zero warnings)
```

---

## 9. Recommended Next Tournament Feature

**Wave 4B — Fixtures & Schedule**

Generate a fixture list (round-robin schedule or knockout bracket) from the assigned teams. This is the natural next step after teams are in place:

- Auto-generate scheduled matches for the tournament with pre-filled team names
- Display a fixtures tab on the Tournament Details page
- Allow scorers to set match dates/times per fixture
- Show fixture status (Scheduled → Live → Completed) as matches are scored

This avoids building the statistics/standings layer (Wave 4C) before there is actual scored match data to aggregate.
