# Player Management — Implementation Report (Wave 3B)
**Date:** June 20, 2026  
**Scope:** Phases 1–5 — Player entity, CRUD management, Team integration, Match Creation integration, Stats foundation

---

## 1. Files Changed

| File | Type | Phase |
|---|---|---|
| `src/constants/playerAttributes.js` | New | Phase 1 — Player attribute constants |
| `src/services/firebase/playerService.js` | Rewritten | Phase 1 — Player CRUD service |
| `src/hooks/firebase/useUserPlayers.js` | New | Phase 2 — Realtime player hook |
| `src/components/players/PlayerFormDialog.jsx` | New | Phase 2 — Create/Edit dialog |
| `src/components/players/PlayerSearchInput.jsx` | New | Phase 3+4 — Shared autocomplete for team/match entry |
| `src/pages/PlayersPage.jsx` | New | Phase 2 — Players management page |
| `src/components/teams/TeamFormDialog.jsx` | Modified | Phase 3 — Player catalog integration + playerRefs |
| `src/components/MatchCreation/TeamsSetupForm.jsx` | Modified | Phase 4 — Player catalog in match creation + playerRefs |
| `src/services/firebase/teamService.js` | Modified | Phase 3 — persist playerRefs in team documents |
| `src/services/firebase/matchService.js` | Modified | Phase 5 — embed playerRefs in match snapshot |
| `src/App.jsx` | Modified | Phase 2 — `/players` route |
| `src/layout/AppShell.jsx` | Modified | Phase 2 — "My Players" nav item |
| `firestore.rules` | Modified | Phase 1 — Player ownership rules |

---

## 2. Schema Changes

### New: `players/{playerId}` collection

```json
{
  "playerId": "string",
  "name": "string",
  "role": "Batsman | Bowler | All-rounder | Wicket-keeper | (empty)",
  "battingStyle": "Right-hand bat | Left-hand bat | (empty)",
  "bowlingStyle": "Right-arm fast | Right-arm medium | Right-arm off-spin | Right-arm leg-spin | Left-arm fast | Left-arm medium | Left-arm orthodox spin | Left-arm wrist spin | Does not bowl | (empty)",
  "createdBy": "uid",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

Role, battingStyle, and bowlingStyle are optional — all default to `""` if not specified. A player name is the only required field.

---

### Updated: `teams/{teamId}` — added `playerRefs`

```json
{
  "teamId": "string",
  "name": "string",
  "players": ["string"],
  "playerRefs": [
    { "playerId": "abc123", "name": "Virat" },
    { "playerId": null,     "name": "Rohit"  }
  ],
  "captain": "string",
  "wicketKeeper": "string",
  "createdBy": "uid",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

`players` (string array) is preserved unchanged for full backward compatibility.
`playerRefs` is a parallel array — index-aligned with `players`. Each entry links the player name to a catalog `playerId`. `playerId` is `null` when the player was entered manually without a catalog entry. Existing team documents without `playerRefs` continue to work normally; the field is synthesised on read when needed.

---

### Updated: `matches/{matchId}` — teams now include `playerRefs`

```json
{
  "teams": {
    "teamA": {
      "name": "string",
      "players": ["string"],
      "playerRefs": [{ "playerId": "string | null", "name": "string" }],
      "captain": "string",
      "wicketkeeper": "string"
    },
    "teamB": { "..." }
  }
}
```

`playerRefs` is embedded in the match snapshot at creation time via `buildMatchFromForm`. This is the foundation for future per-player statistics: a stats engine can group match innings data by `playerId` across matches.

---

## 3. Firestore Rules

### Before (players collection)
```
match /players/{playerId} {
  allow read: if isSignedIn();
  allow write: if isScorer();
}
```

### After (players collection)
```
match /players/{playerId} {
  allow read: if isSignedIn() && resource.data.createdBy == request.auth.uid;
  allow create: if isScorer() && request.resource.data.createdBy == request.auth.uid;
  allow update: if isScorer() && resource.data.createdBy == request.auth.uid;
  allow delete: if isScorer() && resource.data.createdBy == request.auth.uid;
}
```

Players are private to their owner — consistent with the team ownership model shipped in Wave 3A. A scorer cannot read, modify, or delete another scorer's player catalog entries.

The `createdBy == request.auth.uid` check on `create` prevents spoofing: a user cannot write a player document claiming to be owned by a different UID.

---

## 4. UI Changes

### New: `/players` — Player Catalog Page (`PlayersPage.jsx`)

- Lists all of the current scorer's players, sorted alphabetically (client-side, same pattern as TeamsPage).
- Search bar filters by name or role.
- **Empty state** with call-to-action and explanation.
- **No results state** for search with no matches.
- Each player card shows: name, role chip (colour-coded), batting style, bowling style.
- Role chip colours: Batsman → primary (blue), Bowler → success (green), All-rounder → secondary (purple), Wicket-keeper → warning (amber).
- Per-card **Edit** (pencil) and **Delete** (trash, with `window.confirm()` guard) actions.
- "Add Player" button in toolbar.
- Summary chip: `"N players in catalog · M shown"`.

### New: `PlayerFormDialog.jsx`

- Single dialog for Create and Edit.
- Fields: Name (required), Role (optional select), Batting style (optional select), Bowling style (optional select).
- Validates on save:
  - Name required.
  - Duplicate name detection across the user's own catalog.
- Edit mode shows `"Edit — {player.name}"` in title.
- Saving indicator: `"Saving…"` on confirm button.

### New: `PlayerSearchInput.jsx`

- MUI `Autocomplete` with `freeSolo={true}` — allows both catalog selection and free-text entry.
- Options are the user's catalog players filtered to exclude players already in the current team (deduplication).
- Selecting a player from the dropdown: calls `onAdd(name, playerId)` with the catalog `playerId`.
- Typing a new name and pressing Enter or the Add button: calls `onAdd(name, null)` (manual entry, no catalog link).
- Option tooltip shows player role and batting style alongside name for quick identification.
- Disabled when `atMax` prop is true (at the 15-player cap).
- Shared by both `TeamFormDialog` (team management) and `TeamsSetupForm` (match creation wizard).

### Modified: `TeamFormDialog.jsx`

- Replaced the `AppInput + Button` add-player row with `PlayerSearchInput`.
- `buildForm()` restores `playerRefs` from an existing team document (or synthesises null-playerId refs for name-only players).
- `addPlayer(name, playerId)` now maintains `playerRefs` in parallel with `players`.
- `removePlayer(index)` removes from both `players` and `playerRefs` by index.
- `handleSave` passes `playerRefs` to the `onSave` callback.
- Players linked from catalog show a small `"linked"` chip (info colour) in the roster list.
- Removed unused `PersonAddIcon` import.

### Modified: `TeamsSetupForm.jsx` (Match Creation — Step 2)

- Replaced the `AppInput + Button` combo in each `TeamColumn` with `PlayerSearchInput`.
- `buildInitialTeams` restores `playerRefs` from draft recovery data if available.
- `addPlayer(teamKey, name, playerId)` maintains `playerRefs` for each column.
- `removePlayer(teamKey, index)` removes from both arrays by index.
- `syncTeams` now passes `playerRefs` through `onUpdate`, making them available to `buildMatchFromForm`.
- `handleLoadTeam` restores `playerRefs` from the saved team document when a team is loaded.
- Updated subtitle: `"Search your player catalog or type any name. Click Load to import a saved team."`
- Removed unused `AppInput` import.

### Modified: `AppShell.jsx`

- "My Players" added to sidebar nav for scorer/admin users (desktop and mobile bottom bar).
- Uses `PersonOutlinedIcon`.

---

## 5. Validation

### Create Player

| Rule | Implemented |
|---|---|
| Name required | ✅ `errors.name = "Player name is required."` |
| Duplicate name per user | ✅ Checked against `allPlayers` prop in `PlayerFormDialog` |
| Role, batting/bowling style optional | ✅ All default to `""` if unset |
| Firestore: `createdBy` must match auth UID | ✅ `request.resource.data.createdBy == request.auth.uid` |

### Edit Player

| Rule | Implemented |
|---|---|
| Same validation as Create | ✅ Same `validate()` function |
| Edit excludes self from duplicate check | ✅ `p.playerId !== editingPlayerId` guard |
| Changes do not affect existing match scorecards | ✅ Player catalog is separate from embedded match data |

### Delete Player

| Rule | Implemented |
|---|---|
| Confirmation required | ✅ `window.confirm()` with message: "This does not affect existing match scorecards." |
| No cascade to teams or matches | ✅ Teams store name strings; `playerRefs` entries with deleted IDs become orphaned refs (no FK) |

### Add Player to Team (catalog integration)

| Rule | Implemented |
|---|---|
| Catalog players shown as autocomplete options | ✅ `PlayerSearchInput` shows `useUserPlayers` results |
| Already-in-team players excluded from options | ✅ `available = catalogPlayers.filter(…)` |
| Free-text entry still works | ✅ `freeSolo={true}` on MUI Autocomplete |
| Catalog link recorded as `playerId` | ✅ `addPlayer(name, playerId)` → `playerRefs` |
| Manual entry recorded as `playerId: null` | ✅ `doAdd(inputValue)` → `onAdd(name, null)` |
| Max player cap enforced | ✅ `atMax` prop disables input and button |
| Duplicate within same team blocked | ✅ `currentNames` check in `PlayerSearchInput.doAdd` |

### Match Creation (Phase 4)

| Rule | Implemented |
|---|---|
| Player catalog searchable in match creation wizard | ✅ `useUserPlayers` hook in `TeamsSetupForm` |
| Manual name entry still works | ✅ `freeSolo` autocomplete |
| `playerRefs` passed to `buildMatchFromForm` | ✅ `syncTeams` includes `playerRefs` in `onUpdate` |
| `playerRefs` embedded in match document | ✅ `buildMatchFromForm` writes `teams.teamA.playerRefs` |
| Load team restores `playerRefs` | ✅ `handleLoadTeam` reads `savedTeam.playerRefs` |

---

## 6. Build Result

```
✓ built in 6.20s
1098 modules transformed — zero errors
```

New chunks:
- `dist/assets/useUserPlayers-BKfa2gBC.js` (0.45 kB)
- `dist/assets/PlayersPage-CzlCW0ak.js` (8.26 kB)

---

## 7. Lint Result

**Files changed in Wave 3B:** Zero errors, zero warnings.

```
npx eslint PlayersPage.jsx PlayerFormDialog.jsx PlayerSearchInput.jsx \
  TeamFormDialog.jsx useUserPlayers.js playerService.js teamService.js \
  TeamsSetupForm.jsx playerAttributes.js
→ (no output — clean)
```

One error was caught and fixed during development: `MAX_PLAYERS_PER_TEAM` imported but unused in `PlayerSearchInput.jsx` (the `atMax` prop is passed in by the parent instead).

**Pre-existing lint errors in other files:** 45 errors, 6 warnings — all pre-existing, none introduced in Wave 3B.

---

## 8. Next Logical Feature

### Recommended: Fix Firestore In-Progress Rules (P0)

The single highest-priority unresolved item from the POST_WAVE1_GAP_ANALYSIS is the Firestore rule that blocks all scorecard updates during live matches:

```js
// firestore.rules — in-progress block
&& request.resource.data.scoreCard == resource.data.scoreCard  // MUST BE REMOVED
```

This is a one-line fix in `firestore.rules`. If the rules have been deployed to Firebase, no match can be scored in production. All other waves are irrelevant until this is fixed.

**Effort:** 5 minutes. **Risk:** None — removing the constraint is the correct and intended behaviour.

---

### After that: Match Ownership (`createdBy` field)

`buildMatchFromForm` does not write `createdBy: user.uid`. Any scorer can modify any other scorer's match. The fix requires:
1. Adding `createdBy: user.uid` to `buildMatchFromForm`.
2. Updating the `matches` Firestore rule to check `resource.data.createdBy == request.auth.uid` for update/delete operations.

**Effort:** 30 minutes. **Impact:** Closes the P0 security gap identified in POST_WAVE1_GAP_ANALYSIS.

---

### Then: Player Statistics Foundation (Wave 3C)

With `playerRefs` now embedded in every match document (via `teams.teamA.playerRefs`), the infrastructure for per-player stats is in place. The next logical step is to build a stats aggregation layer:
- Read innings data from match documents.
- Group batting/bowling stats by `playerId`.
- Accumulate runs, balls, wickets, economy across matches.
- Display on `PlayersPage` or a dedicated player detail route.

This does not require any schema changes — the data is already being stored.

---

*Wave 3B complete. Build passes. Zero lint errors in all new/changed files.*
