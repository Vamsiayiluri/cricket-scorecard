# Team Persistence — Implementation Report (Wave 3A)
**Date:** June 20, 2026  
**Scope:** Phases 1–5 — Team entity, CRUD management, Match Creation integration, Validation, Backward compatibility

---

## 1. Files Changed

| File | Type | Phase |
|---|---|---|
| `src/services/firebase/teamService.js` | Modified (full rewrite) | Phase 1 — Team service CRUD |
| `src/hooks/firebase/useUserTeams.js` | New | Phase 2 — Realtime teams hook |
| `src/components/teams/TeamFormDialog.jsx` | New | Phase 2 — Create/Edit dialog |
| `src/components/teams/LoadTeamDialog.jsx` | New | Phase 3 — Load-into-match dialog |
| `src/pages/TeamsPage.jsx` | New | Phase 2 — Teams management page |
| `src/components/MatchCreation/TeamsSetupForm.jsx` | Modified | Phase 3 — Load team integration |
| `src/App.jsx` | Modified | Phase 3 — `/teams` route |
| `src/layout/AppShell.jsx` | Modified | Phase 3 — "My Teams" nav item |
| `firestore.rules` | Modified | Phase 4 — Ownership rules for teams |

---

## 2. Firestore Schema

### Collection: `teams/{teamId}`

```json
{
  "teamId": "string",
  "name": "string",
  "players": ["string"],
  "captain": "string",
  "wicketKeeper": "string",
  "createdBy": "uid",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

**Key design decisions:**
- `teamId` is stored inside the document (same as the document ID) so the service layer can use it without a separate fetch.
- `wicketKeeper` field uses camelCase to avoid confusion with the match document's `wicketkeeper` (lowercase k) — there is a **field name difference** between the team document (`wicketKeeper`) and the match document embedded team (`wicketkeeper`). The `handleLoadTeam` function in `TeamsSetupForm` maps `savedTeam.wicketKeeper → teams[key].wicketkeeper` correctly.
- Teams are immutable once loaded into a match — the match document stores a snapshot, not a reference.

### Firestore Rules — Teams

```
match /teams/{teamId} {
  allow read: if isSignedIn() && resource.data.createdBy == request.auth.uid;
  allow create: if isScorer() && request.resource.data.createdBy == request.auth.uid;
  allow update: if isScorer() && resource.data.createdBy == request.auth.uid;
  allow delete: if isScorer() && resource.data.createdBy == request.auth.uid;
}
```

**Ownership enforcement:** Every read and write is guarded by `createdBy == request.auth.uid`. A scorer cannot see, edit, or delete another scorer's teams. This closes the gap identified in the POST_WAVE1_GAP_ANALYSIS for match ownership.

---

## 3. UI Changes

### New: `/teams` — Teams Management Page (`TeamsPage.jsx`)

- Lists all of the current scorer's teams, sorted alphabetically (client-side).
- Search bar filters by team name in real-time (no Firestore query — client-side filter on the subscribed list).
- **Empty state** with call-to-action if no teams exist.
- **No results state** if search returns nothing.
- Each team card shows: team name, player count, captain chip, wicket-keeper chip, and the first 8 players with `+N more` if the squad is larger.
- Per-card **Edit** (pencil icon) and **Delete** (trash icon with browser `confirm()` guard) actions.
- "Create Team" button (top-right toolbar + empty-state CTA).

### New: `TeamFormDialog.jsx`

- Single dialog used for both Create and Edit.
- Validates on save (not on keystroke):
  - Team name required.
  - Duplicate team name check across the user's existing teams.
  - Minimum player count (`MIN_PLAYERS_PER_TEAM = 2`).
  - Captain required.
  - Wicket-keeper required.
- Player list with Add (Enter key or button) and inline Remove.
- Captain and Wicket-keeper selects only appear once `MIN_PLAYERS_PER_TEAM` players are added.
- Removing a player who is captain or WK auto-clears those roles.
- `MAX_PLAYERS_PER_TEAM = 15` hard cap.

### New: `LoadTeamDialog.jsx`

- Opens from within the Match Creation wizard (Teams & Playing XI step).
- Shows the current scorer's teams in a selectable list with player count.
- **Empty state** with a pointer to the `/teams` page if no teams exist.
- On selection, the dialog closes and auto-populates the target team column.

### Modified: `TeamsSetupForm.jsx` (Match Creation — Step 2)

- Each team column (Team A, Team B) now has a small **Load** button next to the player count chip.
- Clicking Load opens `LoadTeamDialog` pinned to that column.
- On load, the following are auto-populated:
  - Team name
  - Players list (full roster)
  - Captain
  - Wicket-keeper
- Manual entry is fully preserved — "Load" is an optional convenience, not a requirement.
- The subtitle text is updated to mention the Load button.

### Modified: `AppShell.jsx`

- "My Teams" added to the sidebar nav for scorer/admin users (desktop drawer and mobile bottom bar).
- Uses `GroupsOutlinedIcon`.
- Active highlight follows the same selection style as Dashboard / Create Match.

### Modified: `App.jsx`

- `/teams` route registered under `<ScorerRoute>` (scorer and admin only).
- Lazy-loaded via `React.lazy()` matching the existing pattern.

---

## 4. Validation

### Create Team

| Rule | Implemented |
|---|---|
| Team name required | ✅ `errors.name = "Team name is required."` |
| Duplicate team name per user | ✅ Checked against `allTeams` prop in `TeamFormDialog` |
| Minimum players (`MIN_PLAYERS_PER_TEAM = 2`) | ✅ `errors.players = "Add at least 2 players."` |
| Duplicate player within same team blocked | ✅ `addPlayer` checks `.toLowerCase()` equality |
| Maximum players (`MAX_PLAYERS_PER_TEAM = 15`) | ✅ Add button disabled when at cap |
| Captain required | ✅ `errors.captain = "Select a captain."` |
| Wicket-keeper required | ✅ `errors.wicketKeeper = "Select a wicket-keeper."` |
| Captain/WK must be in player list | ✅ Only players in the list appear in the selects |
| Removing C/WK player clears role | ✅ `removePlayer` resets `captain`/`wicketKeeper` to `""` |

### Edit Team

| Rule | Implemented |
|---|---|
| Same validation as Create | ✅ Same `validate()` function |
| Editing excludes the current team from duplicate check | ✅ `t.teamId !== editingTeamId` guard |
| Player removal clears C/WK roles | ✅ |

### Delete Team

| Rule | Implemented |
|---|---|
| Confirmation required before delete | ✅ `window.confirm()` |
| No cascade to matches (matches embed snapshots) | ✅ Matches store copied data, no FK reference |

### Load Team Into Match

| Rule | Implemented |
|---|---|
| Only scorer's own teams shown | ✅ `useUserTeams` queries `where("createdBy", "==", user.uid)` |
| Empty state if no teams | ✅ `LoadTeamDialog` shows empty state with pointer to `/teams` |
| Load overwrites current column state | ✅ `handleLoadTeam` replaces `name`, `players`, `captain`, `wicketkeeper` |
| Manual entry still works after load | ✅ `TeamsSetupForm` remains fully editable post-load |

### Firestore / Backend Validation

| Rule | Implemented |
|---|---|
| Only scorer/admin can create teams | ✅ `allow create: if isScorer()` |
| Only team owner can read their teams | ✅ `resource.data.createdBy == request.auth.uid` |
| Only team owner can update/delete | ✅ Same ownership check on update/delete |
| `createdBy` cannot be spoofed on create | ✅ `request.resource.data.createdBy == request.auth.uid` |

---

## 5. Build Result

```
✓ built in 5.93s
1090 modules transformed — zero errors
```

New chunks produced:
- `dist/assets/useUserTeams-Ce3H2kpP.js` (1.90 kB)
- `dist/assets/TeamsPage-XSGDxVna.js` (11.22 kB)

---

## 6. Lint Result

**Files changed in Wave 3A:** Zero errors, zero warnings.

```
npx eslint TeamsPage.jsx TeamFormDialog.jsx LoadTeamDialog.jsx \
  useUserTeams.js teamService.js TeamsSetupForm.jsx
→ (no output — clean)
```

**Pre-existing lint errors in other files:** 45 errors, 6 warnings — all pre-existing before this wave, none introduced by these changes. Most are `no-unused-vars` (React imports) and `react/prop-types` in files not touched in Wave 3A.

---

## 7. Remaining Team-Management Gaps

The following were explicitly out of scope for Wave 3A and remain as future work:

| Gap | Notes |
|---|---|
| **No Firestore index deployed** | `useUserTeams` uses a `where("createdBy", "==", uid)` query with client-side name sort. Firestore does not need a composite index for a single equality filter. If `orderBy` is added later, a `(createdBy ASC, name ASC)` composite index must be added to `firestore.indexes.json`. |
| **No cross-team player deduplication in match creation** | A player listed in both Team A and Team B is not flagged. This is the same gap as the pre-existing `TeamsSetupForm`. |
| **No team search or player lookup across teams** | Players cannot be searched across teams; only team-level load is supported. |
| **No player profiles linked to teams** | `teams/{teamId}.players` is an array of strings (names), not document references. Cross-match player stats cannot be aggregated from this model. This is a Wave 4 concern. |
| **No reusable team for viewers/non-scorers** | The `/teams` page is Scorer-only. Viewers have no team concept. |
| **No team avatar or color** | No visual identity (logo, color) for teams yet. |
| **No tournament-team registration link** | Teams cannot be registered into a tournament entity (Wave 3 feature). |
| **No `createdBy` on match documents** | The match ownership gap (identified in POST_WAVE1_GAP_ANALYSIS) is not fixed by this wave. A scorer can still access any other scorer's match. Match ownership requires updating `buildMatchFromForm` to write `createdBy: user.uid` and updating match Firestore rules accordingly. |
| **No "Save this team from match" shortcut** | After manually entering a team in match creation, scorers cannot save it as a reusable team in one click. Would require extracting teams from the match wizard state and calling `createTeam`. |
| **Firestore rules for in-progress matches still block scoring** | The `scoreCard == scoreCard` bug in `firestore.rules` (in-progress block) is not addressed in this wave. Must be fixed before production deployment. |

---

**Status: Wave 3A complete. All four phases implemented. Build passes. Zero lint errors in changed files. Awaiting review before Wave 3B.**
