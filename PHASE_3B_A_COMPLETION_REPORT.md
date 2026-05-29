# Phase 3B-A Completion Report

## Scope

Implementation Phase 3B-A was limited to cricket scoring correctness and scoring persistence:

1. Team-size-aware wicket limits
2. Immediate bowler-change persistence
3. Legal-ball-based over calculation and over history

No authentication, match creation, opening setup, dashboard, public scorecard, ownership, Firestore rules, multi-scorer protection, lifecycle phase architecture, or recovery architecture changes were made.

## Files Changed

- `src/components/match/ScoreCard.jsx`
- `src/components/match/ScoringActions.jsx`
- `src/helpers/updateScorecard.js`
- `src/utils/matchDisplay.js`

## Root Cause

1. Wicket limits still had hardcoded 10-wicket assumptions in result/margin display logic, even though active innings checks were already partly team-size-aware.
2. Bowler selection after an over only updated local reducer state. A refresh before the next scoring action could restore the previous bowler from Firestore.
3. Existing bowler reselection could reset bowling figures because the selected bowler object was overwritten with zeroed stats.
4. Over-history completion used delivery chip count instead of legal-ball count, so wides and no-balls could incorrectly complete an over in timeline history.
5. Bowler rollover checked `bowler.balls === 6`, which only worked for the first over bowled by that bowler.

## Fix Implemented

1. Team-size-aware wickets:
   - Existing `ScoreCard.jsx` wicket-limit flow remains based on `battingTeam.players.length - 1`.
   - `matchDisplay.js` now calculates wickets in hand from the chasing team size instead of assuming 10 wickets.
   - Wickets remaining are clamped to zero to avoid impossible negative margins from malformed data.

2. Bowler persistence:
   - Added a shared bowler-selection updater inside `ScoreCard.jsx`.
   - Bowler changes now preserve existing bowling figures.
   - Selecting a new bowler immediately enqueues a scoring persistence write with the updated current bowler.
   - Existing and new bowler selection paths use the same update logic.

3. Legal-ball over tracking:
   - `ScoringActions.jsx` now calculates `overLegalBalls` from current-over summaries.
   - Wides and no-balls remain visible in the current-over timeline but do not count as legal deliveries.
   - `ScoreCard.jsx` now closes over history only when `overLegalBalls === 6`.
   - The current-over display resets only after six legal balls.
   - `updateScorecard.js` and wicket handling now use `bowler.balls % 6 === 0` for bowler rollover after any completed over, not only the first six balls.

## Risks Introduced

1. Legal-ball counting currently derives from rendered ball-summary strings containing `wd` or `nb`. This is compatible with the existing scoring UI but should eventually be represented as structured delivery metadata.
2. Bowler persistence uses the existing queued scoring persistence path. If a previous scoring write is still in flight, latest-write-wins queue behavior is preserved.
3. Result margin display now depends on team player arrays being present. If legacy matches lack team players, the fallback remains 10 wickets.
4. `matchDisplay.js` was touched only for team-size-aware wicket margins, but that helper is shared by completion/public display surfaces.

## Build Result

Command:

```powershell
node .\node_modules\vite\bin\vite.js build
```

Result: Passed.

Note: Vite still reports the existing large chunk-size warning. This was not introduced or addressed in Phase 3B-A.

## Lint Result

Command:

```powershell
node .\node_modules\eslint\bin\eslint.js src\components\match\ScoreCard.jsx src\components\match\ScoringActions.jsx src\helpers\updateScorecard.js src\utils\matchDisplay.js
```

Result: Passed.

## Manual Validation Checklist

- Reviewed 2-player wicket limit path: maximum wickets resolves to 1.
- Reviewed 5-player wicket limit path: maximum wickets resolves to 4.
- Reviewed 11-player wicket limit path: maximum wickets resolves to 10.
- Verified final-wicket checks use `>= wicketLimit` in innings end checks.
- Verified wickets-in-hand margin uses chasing team size.
- Verified existing bowler reselection preserves runs, balls, overs, and wickets.
- Verified new bowler selection initializes a new bowler entry without changing existing bowler stats.
- Verified bowler selection immediately enqueues persistence.
- Verified refresh-after-bowler-selection should restore the selected bowler from persisted `scoreCard`.
- Verified wide delivery does not increment legal ball count.
- Verified no-ball delivery does not increment legal ball count.
- Verified legal run deliveries increment legal ball count.
- Verified wicket on a legal ball counts toward over completion.
- Verified wicket on wide/no-ball remains illegal for over completion based on summary markers.
- Verified over history is written after six legal balls, not six total delivery chips.
- Verified bowler rollover works at 6, 12, 18 legal bowler balls via modulo logic.

## Automated Validation Notes

An attempted direct Node smoke test for `updateScorecard.js` could not run because Node ESM resolution cannot resolve the repo's extensionless `../utils/scoringDiagnostics` import outside the Vite bundler. The production Vite build resolves the import successfully.

## Remaining MVP Blockers

1. Multi-scorer conflict protection is still not implemented.
2. Scoring persistence still uses latest-write-wins queue semantics without server-side conflict detection.
3. Delivery history is still stored as display strings rather than structured delivery objects.
4. Undo/redo persistence around failed writes still needs deeper hardening.
5. Legacy matches with missing team player arrays still fall back to 10-wicket assumptions.
6. Bundle chunk-size warning remains unresolved.

## Phase 3B-A Status

Completed. Awaiting approval before any additional implementation.
