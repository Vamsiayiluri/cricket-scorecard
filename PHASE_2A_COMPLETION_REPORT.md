# PHASE_2A_COMPLETION_REPORT.md

## Scope Approved

Implementation Phase 2A was limited to:

1. Safe `scoreCard` access and recovery handling
2. Duplicate striker/non-striker prevention
3. Correct innings metadata generation
4. Duplicate submit protection during match start

No scoring logic, wicket logic, innings completion logic, dashboard behavior, lifecycle phases, or second-innings transition redesign were implemented.

## Files Changed

- `src/components/match/StartMatch.jsx`
- `src/pages/MatchScoring.jsx`

Change size:

- 2 files changed
- 64 insertions
- 26 deletions

## Issue 1: Safe scoreCard Access And Recovery Handling

Root cause:

- `StartMatch.jsx` directly accessed nested match data such as `matchData.scoreCard.currentInning`, `matchData.scoreCard.innings[0].team`, `matchData.teams[battingTeam].players`, and match details fields.
- Legacy or malformed match documents could crash opening setup if `scoreCard`, `innings`, `teams`, `players`, `matchDetails`, or `tossDetails` were missing.

Fix implemented:

- Added safe local fallbacks:
  - `teams = matchData?.teams || {}`
  - `matchDetails = matchData?.matchDetails || {}`
  - `tossDetails = matchData?.tossDetails || {}`
- Safely read first innings team using optional chaining.
- Derived batting/bowling team data through guarded lookups.
- Derived player arrays with empty-array fallbacks.
- Added a submit-time recovery error if batting/bowling teams cannot be resolved.
- Updated display chips and headings to use safe fallback text instead of direct nested reads.

Files affected:

- `src/components/match/StartMatch.jsx`

Risks introduced:

- Low. Missing data now produces safe fallback UI or an explicit setup error instead of crashing.
- This does not repair malformed match documents; it only prevents setup crashes and blocks start when teams cannot be resolved.

Validation checklist:

- [x] No direct unsafe `scoreCard.currentInning` access remains in `StartMatch`.
- [x] Missing `scoreCard.innings[0]` no longer crashes the first batting-team branch.
- [x] Missing team/player arrays fall back safely.
- [x] Unresolved teams produce a form error instead of a thrown exception.

## Issue 2: Duplicate Striker/Non-Striker Prevention

Root cause:

- The striker and non-striker dropdowns listed the same batting team players and submit validation only checked that both fields were filled.
- The same player could be selected as both opener roles.

Fix implemented:

- Added submit validation:

```js
if (players.batsman1 === players.batsman2) {
  const message = "Striker and non-striker must be different players.";
  setFormError(message);
  showToast(message, "warning");
  return;
}
```

Files affected:

- `src/components/match/StartMatch.jsx`

Risks introduced:

- Minimal. This only blocks invalid duplicate opener selection.
- The dropdown options are unchanged; the validation occurs at submit.

Validation checklist:

- [x] Same striker/non-striker selection is blocked.
- [x] User receives warning toast and inline error.
- [x] Different striker/non-striker selections can proceed.

## Issue 3: Correct Innings Metadata Generation

Root cause:

- `StartMatch.jsx` wrote:

```js
battingTeam: matchData.teams.battingTeam?.name
bowlingTeam: matchData.teams.bowlingTeam?.name
```

- The persisted match shape uses `teams.teamA` and `teams.teamB`, so these fields were undefined.

Fix implemented:

- Derived team data from the actual selected team keys:

```js
const battingTeamData = battingTeam ? teams[battingTeam] : null;
const bowlingTeamData = bowlingTeam ? teams[bowlingTeam] : null;
```

- Wrote innings metadata from the resolved teams:

```js
battingTeam: battingTeamData.name
bowlingTeam: bowlingTeamData.name
```

Files affected:

- `src/components/match/StartMatch.jsx`

Risks introduced:

- Low. Metadata now matches existing team-key model.
- If a team object exists without a name, the field can still be undefined; deeper schema repair is outside Phase 2A.

Validation checklist:

- [x] First innings metadata uses selected batting team name.
- [x] First innings metadata uses selected bowling team name.
- [x] Second innings metadata uses derived opposite team names through the same path.

## Issue 4: Duplicate Submit Protection During Match Start

Root cause:

- `StartMatch.jsx` did not disable the Start Match button while the parent Firestore save was pending.
- Rapid clicks could trigger duplicate start attempts.

Fix implemented:

- Added `isStarting` state in `MatchScoring.jsx`.
- Guarded `startMatch()` in `MatchScoring.jsx` when a start is already pending.
- Passed `isStarting` into `StartMatch`.
- Added local `isSubmitting` state in `StartMatch` to block rapid same-render double clicks.
- Disabled the Start Match button while either lock is active.
- Changed button text to `Starting...` while pending.

Files affected:

- `src/pages/MatchScoring.jsx`
- `src/components/match/StartMatch.jsx`

Risks introduced:

- Low. The button is now temporarily disabled during the async save.
- If the save fails, the lock is released in `finally`, preserving retry behavior.

Validation checklist:

- [x] Parent start handler exits early while already starting.
- [x] Child submit handler exits early while starting/submitting.
- [x] Button disables during pending start.
- [x] Failed save releases the pending state for retry.

## Build Result

Command:

```powershell
node .\node_modules\vite\bin\vite.js build
```

Result:

- Passed.
- Vite transformed 1075 modules and completed production build.
- Existing warning remains: one chunk is larger than 500 kB after minification.

Build status:

```text
PASS
```

## Lint Result For Touched Files

Command:

```powershell
node .\node_modules\eslint\bin\eslint.js src/components/match/StartMatch.jsx src/pages/MatchScoring.jsx
```

Result:

```text
PASS
```

Notes:

- Added a narrow `react/prop-types` disable to `StartMatch.jsx` because the repo does not use the `prop-types` package and this component already follows that pattern.
- Removed unused `React` import from `MatchScoring.jsx`.

## Additional Static Validation

Command:

```powershell
git diff --check -- src/components/match/StartMatch.jsx src/pages/MatchScoring.jsx
```

Result:

- Passed.
- No whitespace errors detected.
- Git reported normal LF-to-CRLF working-copy warnings.

## Manual Validation Checklist Executed

Code-level checklist:

- [x] Confirmed setup no longer directly assumes `matchData.scoreCard.currentInning`.
- [x] Confirmed first innings team lookup is optional-chain safe.
- [x] Confirmed missing team/player arrays cannot crash dropdown rendering.
- [x] Confirmed submit blocks missing selections.
- [x] Confirmed submit blocks duplicate opener selection.
- [x] Confirmed innings metadata uses resolved `teamA`/`teamB` names.
- [x] Confirmed parent and child duplicate-submit locks exist.
- [x] Confirmed pending start state resets after save failure.
- [x] Confirmed production build passes.
- [x] Confirmed touched-file ESLint passes.

Not executed:

- Browser-based Firebase start-match QA was not run in this phase.
- Firestore document inspection after a real start-match save was not run in this phase.

## Remaining Phase 2A Issues

Approved Phase 2A scope:

- None remaining at code level.

Known remaining issues outside Phase 2A scope:

- The second innings transition is still not atomic.
- Setup routes still need stronger lifecycle/status guards.
- Toss winner is still based on team name rather than stable team key.
- Dropdowns still allow selecting the duplicate opener visually until submit.
- No `startedAt`, `startedBy`, or innings setup audit metadata was added.
- No creator ownership or assigned-scorer enforcement was added.
- Browser/manual QA remains required.

## Stop Point

Phase 2A implementation is complete. Awaiting approval before Phase 2B.
