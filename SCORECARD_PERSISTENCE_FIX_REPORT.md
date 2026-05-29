# Scorecard Persistence Fix Report

## Files Changed

- `src/components/match/ScoreCard.jsx`
- `src/components/viewer/LiveScoreboard.jsx`
- `src/components/viewer/PublicMatchScorecard.jsx`
- `src/hooks/useScoringPersistence.js`
- `src/services/firebase/matchService.js`
- `src/utils/scorecardTimeline.js`
- `src/utils/firestoreValidation.js`

## Root Cause

Scorecard persistence was failing because timeline fields stored arrays containing arrays:

```js
recentBallsByInnings = [
  ["1", "4", "W"]
]

overHistoryByInnings = [
  [
    ["1", "1", "4", "W"]
  ]
]
```

Firestore does not support arrays that directly contain arrays, so `updateDoc(matches/{matchId})` failed with:

```text
Nested arrays are not supported
```

The queue had also been temporarily masked by debug write handling in `updateMatchById`, where errors were logged but not rethrown. That could incorrectly make failed writes look successful.

## New Firestore-Safe Structure

Recent balls now persist as a map of inning keys to delivery arrays:

```js
recentBallsByInnings = {
  inning1: ["1", "4", "W"],
  inning2: ["1", "2"]
}
```

Over history now persists as a map of inning keys to over maps:

```js
overHistoryByInnings = {
  inning1: {
    over1: ["1", "1", "4", "W"]
  },
  inning2: {
    over1: ["0", "2"]
  }
}
```

This avoids arrays directly containing arrays while preserving the existing UI shape through reader helpers.

## Fix Implemented

1. Added `scorecardTimeline.js` helpers:
   - `getRecentBallsForInning`
   - `getOverHistoryForInning`
   - `setTimelineForInning`
   - `normalizeScoreCardTimelineStorage`

2. Updated `ScoreCard.jsx`:
   - `applyTimelineMeta()` now writes timeline data as Firestore-safe maps.
   - Current innings timeline reads use helper accessors.
   - Removed the temporary `debugger` from scoring update flow.

3. Updated public/viewer timeline reads:
   - `LiveScoreboard.jsx`
   - `PublicMatchScorecard.jsx`

4. Added `firestoreValidation.js`:
   - `findFirestoreInvalidValues()`
   - `assertFirestoreSafePayload()`

5. Updated `matchService.js`:
   - Normalizes scorecard timeline storage before scoring and completion writes.
   - Validates payloads before `updateDoc`.
   - Rethrows Firestore errors after logging so the queue correctly enters failed state.

6. Updated `useScoringPersistence.js`:
   - Removed temporary debug logs.
   - Preserved failed-write queue behavior.

## Validation Results

Local helper validation passed:

- Legacy array timeline shape normalizes into map/object shape.
- First innings recent balls are preserved.
- Second innings recent balls are preserved.
- First innings over history is preserved.
- Second innings over history is preserved.
- `findFirestoreInvalidValues()` returns no issues for the normalized payload.

Validated sample output:

```json
{
  "recent1": ["1", "4"],
  "recent2": ["2", "6"],
  "overs1": [["1", "1", "4", "W"]],
  "overs2": [["0", "2"], ["1", "1", "1", "1", "1", "1"]],
  "issues": []
}
```

Static validation:

- No direct `recentBallsByInnings[index]` reads remain in touched scoring/viewer files.
- No direct `overHistoryByInnings[index]` reads remain in touched scoring/viewer files.
- No temporary `console.log` or `debugger` calls remain in touched persistence files.

Manual Firestore-console validation was not executed in this environment.

## Build Result

Command:

```powershell
node .\node_modules\vite\bin\vite.js build
```

Result: Passed.

Note: Existing Vite large chunk-size warning remains.

## Lint Result

Command:

```powershell
node .\node_modules\eslint\bin\eslint.js src\components\match\ScoreCard.jsx src\components\viewer\LiveScoreboard.jsx src\components\viewer\PublicMatchScorecard.jsx src\services\firebase\matchService.js src\hooks\useScoringPersistence.js src\utils\scorecardTimeline.js src\utils\firestoreValidation.js
```

Result: Passed.

## Remaining Persistence Risks

1. Firestore rules must still allow legitimate scorer writes for live scoring.
2. Existing localStorage pending payloads are normalized before write, but very old malformed payloads with unrelated invalid fields may still fail validation.
3. Delivery timelines are still stored as display strings, not structured delivery objects.
4. Multi-scorer conflict handling is still not implemented.
5. Manual Firebase validation is still required for:
   - first innings scoring
   - second innings scoring
   - refresh during innings
   - refresh after over completion
   - end innings
   - match completion
   - public viewer updates

## Status

Completed. Awaiting further approval before any additional implementation.
