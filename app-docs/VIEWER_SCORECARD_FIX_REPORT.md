# Viewer Scorecard Access Fix Report

## Scope

P0 fix for allowing `viewer` users to access read-only scorecards while preserving scorer-only mutation permissions.

## Files Changed

- `src/App.jsx`
- `src/pages/LiveMatchPage.jsx`
- `src/pages/PublicScorecardPage.jsx`
- `src/pages/MatchDetailsPage.jsx`
- `src/pages/ScorerRoute.jsx`
- `src/utils/matchDisplay.js`

Reviewed but not changed for this fix:

- `src/pages/ProtectedRoute.jsx`
- `src/components/Dashboard/MatchListSection.jsx`
- `firestore.rules`

## Root Cause

Viewer users were blocked by frontend route and visibility checks even though Firestore read rules already allow signed-in users to read match documents.

Specific causes:

1. `/matches/:matchId` was wrapped in `ScorerRoute`, so viewers could not open match details.
2. Dashboard read-only navigation sent non-scorers to public viewer routes, but those routes treated all private matches as unavailable.
3. `LiveMatchPage` and `PublicScorecardPage` only checked `match.isPublic === false`, without considering whether the user was authenticated.
4. Read-only scorecard access was mixed with public unauthenticated access, causing authenticated viewers to be denied private match scorecards.

Firestore read rules were not the blocker:

```js
allow read: if isPublicMatch() || isSignedIn();
```

## Fix Implemented

### Route Access

- Changed `/matches/:matchId` from `ScorerRoute` to `ProtectedRoute`.
- This allows authenticated viewers to open match details.
- Scorer-only routes remain protected by `ScorerRoute`:
  - `/create-match`
  - `/start-match/:matchId`
  - `/score-card/:matchId`
  - `/start-second-innings/:matchId`
  - `/matches/:matchId/edit`

### Private Scorecard Viewing

- Updated `LiveMatchPage` to allow private matches when the user is authenticated.
- Updated `PublicScorecardPage` to allow private scorecards when the user is authenticated.
- Unauthenticated users are still blocked from private matches and private scorecards.

### Dashboard and Details Navigation

- Updated non-scorer match routing so viewers land on read-only viewer pages:
  - Scheduled or completed match: `/scorecard/:matchId`
  - Live/in-progress match: `/live/:matchId`
- Added a read-only `View Scorecard` action on match details.
- Edit, archive, visibility changes, scoring, and start-match actions remain scorer-only.

### Lint Cleanup

- Removed unused React imports from touched files.
- Added the existing project-style prop-types lint suppression to `ScorerRoute.jsx`.

## Permission Matrix After Fix

| User Type | Dashboard | Match Details | Live Scorecard | Completed Scorecard | Public Scorecard | Start Match | Score Match | Edit Match |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Unauthenticated | No | No | Public only | Public only | Public only | No | No | No |
| Viewer | Yes | Yes | Yes, read-only | Yes, read-only | Yes, read-only | No | No | No |
| Scorer/Admin | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |

## Build Result

Passed.

Command:

```powershell
node .\node_modules\vite\bin\vite.js build
```

Result:

- Production build completed successfully.
- Existing Vite chunk-size warning remains and is unrelated to this fix.

## Lint Result

Passed.

Command:

```powershell
node .\node_modules\eslint\bin\eslint.js src\App.jsx src\utils\matchDisplay.js src\pages\LiveMatchPage.jsx src\pages\PublicScorecardPage.jsx src\pages\MatchDetailsPage.jsx src\pages\ProtectedRoute.jsx src\pages\ScorerRoute.jsx src\components\Dashboard\MatchListSection.jsx
```

Result:

- No lint errors for the reviewed/touched route and viewer-access files.

## Validation Performed

Static route validation:

- Confirmed viewer can access dashboard through `ProtectedRoute`.
- Confirmed viewer can access `/matches/:matchId` through `ProtectedRoute`.
- Confirmed viewer can access `/live/:matchId` for private matches when authenticated.
- Confirmed viewer can access `/scorecard/:matchId` for private matches when authenticated.
- Confirmed unauthenticated users are still blocked from private matches.
- Confirmed scorer-only mutation routes still use `ScorerRoute`.

Read-only control validation:

- `LiveMatchPage` uses `LiveScoreboard`, which has no scoring controls.
- `PublicScorecardPage` uses `LiveScoreboard` and `PublicMatchScorecard`, both read-only viewer components.
- `MatchDetailsPage` only shows edit/archive/visibility actions inside the existing `isScorer` condition.

Firestore rule validation:

- Reviewed `firestore.rules`.
- Existing match read rule allows signed-in viewer reads.
- No Firestore rule changes were required.

## Risks Introduced

- Authenticated viewers can now open private match read-only pages. This is intended for this P0 fix and relies on the current Firestore read model.
- If the product later requires per-match viewer membership, Firestore rules and route guards will need a stricter ownership/membership model.
- Manual browser validation with real viewer and scorer accounts is still recommended before RC sign-off.

## Remaining Items

- Verify deployed Firestore rules match the local rules.
- Manually test with a real viewer account:
  - Dashboard opens.
  - Private live match opens read-only.
  - Private completed match opens read-only.
  - Start, score, edit, archive, and visibility actions are unavailable.
- Manually test with an unauthenticated browser session:
  - Public matches open.
  - Private matches remain blocked.

## Follow-Up Fix: Full Scorecard Visibility

After initial viewer route access was restored, viewer users could still land on `/live/:matchId`, which displayed only the live summary, innings cards, and recent over progression. The complete batting and bowling scorecard tables were only rendered by `PublicScorecardPage`.

Additional changes:

- `src/pages/LiveMatchPage.jsx`
  - Added the existing read-only `PublicMatchScorecard` component below the live scoreboard.
  - This keeps the live summary visible while also showing the complete scorecard tables.
- `src/utils/matchDisplay.js`
  - Updated non-scorer routing to always open `/scorecard/:matchId`.
  - Viewer dashboard navigation now prefers the full read-only scorecard page for scheduled, live, and completed matches.

Additional validation:

```powershell
node .\node_modules\eslint\bin\eslint.js src\pages\LiveMatchPage.jsx src\utils\matchDisplay.js src\pages\PublicScorecardPage.jsx src\components\viewer\PublicMatchScorecard.jsx
```

Result:

- Passed.

```powershell
node .\node_modules\vite\bin\vite.js build
```

Result:

- Passed.
- Existing Vite chunk-size warning remains unrelated.
