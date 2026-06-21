# Scorecard Persistence Root Cause

## Issue Investigated

Scorecard updates are not being persisted to Firestore.

Observed symptoms:

- Scoring UI updates locally.
- Firestore match document does not receive updated `scoreCard`.
- Refresh can lose scoring progress.
- End innings can fail because the latest scorecard is not durably available.

## Exact Root Cause

Firestore security rules reject scorecard updates after a match becomes `in-progress`.

The scoring UI correctly mutates local state and correctly enqueues a Firestore write. The write reaches `updateDoc(matches/{matchId})`, but Firestore rules block it because the `in-progress` update rule requires the incoming `scoreCard` to equal the existing `scoreCard`.

Current rule:

```js
(resource.data.status == 'in-progress'
  && request.resource.data.teams == resource.data.teams
  && request.resource.data.tossDetails == resource.data.tossDetails
  && request.resource.data.scoringRules == resource.data.scoringRules
  && request.resource.data.scoreCard == resource.data.scoreCard
)
```

Every ball-by-ball scoring update changes `scoreCard`, so this condition becomes false. The update is denied by Firestore and the existing document remains unchanged.

This is not a document path problem. The write path is correct: `matches/{matchId}`.

This is not a local reducer problem. The local reducer is updating `matchData.scoreCard`.

This is not an overwrite problem. The writes are not succeeding and then being overwritten; they are rejected.

## Files Involved

### Local Scoring State

- `src/components/match/ScoreCard.jsx`
- `src/components/match/ScoringActions.jsx`
- `src/helpers/updateScorecard.js`

### Persistence Queue

- `src/hooks/useScoringPersistence.js`

### Firestore Write Layer

- `src/services/firebase/scoringService.js`
- `src/services/firebase/matchService.js`
- `src/services/firebase/firestoreHelpers.js`

### Firestore Authorization

- `firestore.rules`

## Complete Persistence Flow

1. A scorer enters a delivery in `ScoringActions.jsx`.
2. `updateScoreCard()` mutates the scorecard object in `updateScorecard.js`.
3. `ScoringActions.jsx` calls `updateMatchData(scoreCard, commitMeta)`.
4. `ScoreCard.jsx` dispatches `UPDATE_SCORECARD`, so the UI updates locally.
5. `ScoreCard.jsx` builds `nextMatchData` and calls `enqueuePersist(nextMatchData)`.
6. `useScoringPersistence.js` stores the latest payload in `queuedPayloadRef`.
7. `processQueue()` calls `persistMatchScorecard(payload)`.
8. `scoringService.js` calls `updateMatchById(updatedData)`.
9. `matchService.js` calls `updateDoc(matchDoc(updatedData.matchId), payload)`.
10. Firestore evaluates `firestore.rules`.
11. Because the match is `in-progress` and `scoreCard` changed, the write is denied.
12. `useScoringPersistence.js` catches the error, sets status to `failed`, stores the payload in localStorage, and keeps `hasPendingWrites` true.

## Where Scoring State Changes

Scoring state changes in:

- `updateScorecard.js`: applies runs, extras, wickets, overs, batter stats, bowler stats.
- `ScoringActions.jsx`: builds delivery metadata and calls `updateMatchData`.
- `ScoreCard.jsx`: dispatches `UPDATE_SCORECARD` into the local reducer.

Local state is updated before Firestore persistence succeeds.

## Where Save Is Triggered

Save is triggered in `ScoreCard.jsx`:

- Normal scoring path: `enqueuePersist(nextMatchData)`
- Undo/redo path: `enqueuePersist(nextMatchData)`
- Bowler change path: `enqueuePersist({ ...matchData, scoreCard: nextScoreCard })`
- End innings path: `enqueuePersist(payload)` then `await flushPending()`

Normal delivery saves are queued, not awaited by the UI interaction.

## Where Firestore Write Occurs

The actual Firestore write occurs in `matchService.js`:

```js
await updateDoc(matchDoc(updatedData.matchId), payload);
```

`matchDoc(updatedData.matchId)` resolves to:

```js
doc(db, "matches", matchId)
```

The document path is correct.

## Whether Writes Are Awaited

Partially.

- `updateDoc` is awaited inside `matchService.js`.
- `persistMatchScorecard` is awaited inside `useScoringPersistence.js`.
- Normal ball scoring does not await `enqueuePersist`, because the persistence hook is intentionally queue-based.
- End innings does call `await flushPending()`, so it waits for the queue to settle.

The queue does attempt the write. The write fails at Firestore rules.

## Whether Errors Are Swallowed

Errors are caught and converted into UI state, but they do not stop local scoring.

In `useScoringPersistence.js`, failed writes:

- set `failedPayloadRef.current`
- set `status` to `failed`
- set an error message
- write the failed payload to localStorage
- log `queue.write.failed`

In `ScoreCard.jsx`, end-innings persistence failures are caught and logged with `scoringWarn`, but the user-facing behavior is limited to the save status/error UI.

This means the scorer can continue seeing local score updates while Firestore remains unchanged.

## Whether Retries Are Stuck

Yes, retries are effectively stuck until the Firestore rule is changed.

`retryFailed()` correctly requeues `failedPayloadRef.current`, but the same denied write is attempted again. Because the rule still rejects any changed `scoreCard` for `in-progress` matches, retry cannot succeed.

Network recovery does not help because this is an authorization failure, not a connectivity failure.

## Whether Writes Succeed But Are Overwritten

No evidence of successful writes being overwritten.

The active scoring page intentionally uses one-time fetch plus local reducer, not a live listener, so remote listener overwrite is not the primary issue.

The failure occurs before persistence because Firestore denies the write.

## Firestore State Impact

Firestore remains at the last successfully persisted state.

Typical sequence:

1. Match creation succeeds as `scheduled`.
2. Start match succeeds because scheduled matches allow broad scorer updates.
3. Match becomes `in-progress`.
4. Ball scoring updates local UI.
5. Firestore rejects scorecard update because `scoreCard` changed while status is `in-progress`.
6. Refresh reloads stale Firestore data, losing local-only progress unless the local pending queue replays successfully.
7. Replay still fails because the rule rejects it.

## Impact Assessment

### End Innings

Affected.

End innings calls `enqueuePersist(payload)` and `await flushPending()`. Since the queued write is denied, `flushPending()` throws `Pending scoring write failed`. `handleEndOfInnings()` catches and logs it, so innings transition can fail or appear stuck.

### Match Completion

Affected.

`persistMatchCompletion()` calls `completeMatchById()`, which updates the match document with final `scoreCard`, result fields, and `status: completed`. If the current Firestore resource is `in-progress`, the in-progress rule still requires `request.resource.data.scoreCard == resource.data.scoreCard`, so completion with an updated scorecard is also denied.

### Public Viewer

Affected.

Public viewer reads Firestore through live match hooks. Since Firestore does not receive scoring updates, public scorecards and live scoreboards remain stale.

## Recommended Fix

Update Firestore rules to explicitly allow scorers/admins to update scoring fields while a match is `in-progress`, while continuing to block structural match edits.

Recommended direction:

- Allow `scoreCard` changes for `in-progress` matches.
- Continue requiring immutable structural fields during scoring:
  - `teams`
  - `tossDetails`
  - `scoringRules`
  - core match identity fields
- Optionally restrict allowed changed keys to scoring-safe fields:
  - `scoreCard`
  - `updatedAt`
  - `status` when transitioning through approved completion paths
  - result fields only for completion

Do not fix by bypassing the persistence queue. The queue is reaching Firestore correctly; authorization is the blocker.

## Risk Level

Critical.

Reason:

- Ball-by-ball scoring is the core product workflow.
- Refresh can lose visible progress.
- Public scorecards cannot reflect live scoring.
- End innings and match completion can fail.
- Retry cannot recover until authorization rules are corrected.

## Summary

The scoring persistence pipeline is wired and attempts Firestore writes, but Firestore rules prohibit `scoreCard` changes for `in-progress` matches. This makes every live scoring update fail after match start. The fix should be in Firestore authorization rules, not in the scoring reducer or persistence queue.
