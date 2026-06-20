# CricVelo User Flows

## Viewer Flow

1. User registers or logs in.
2. `AuthContext` ensures a `users/{uid}` profile exists.
3. `ProtectedRoute` requires authentication and verified email.
4. User lands on `/dashboard`.
5. Dashboard loads match buckets through `useDashboardMatches`.
6. User opens match details or scorecard.
7. Viewer gets read-only access; scoring and edit controls are hidden.

## Scorer Flow

1. Scorer logs in with verified email.
2. `ScorerRoute` checks role is `scorer` or `admin`.
3. Scorer can create matches, start scheduled matches, score live matches, edit scheduled matches, toggle visibility, share, and archive.
4. Firestore rules independently require scorer/admin role for writes.

## Admin Flow

Current admin behavior is equivalent to scorer in app code and rules.

1. Admin logs in.
2. Admin passes `ScorerRoute`.
3. Admin can perform scorer-level match operations.
4. Dedicated admin dashboards, user role management UI, and audit views are not implemented.

## Match Creation Flow

1. Scorer opens `/create-match`.
2. Wizard loads any meaningful local draft.
3. Step 1: match details.
4. Step 2: teams and players.
5. Step 3: toss winner and decision.
6. Step 4: scoring rules such as overs and extras penalty values.
7. Step 5: notes and public/private visibility.
8. Step 6: preview and final validation.
9. `saveMatch` calls `createMatch`.
10. Firestore writes `matches/{matchId}` with `status: scheduled`.
11. App navigates to `/start-match?matchId=...`.

## Opening Setup Flow

1. Scorer opens `/start-match?matchId=...`.
2. `useLiveMatch` loads the scheduled match.
3. `StartMatch` resolves batting team from toss winner and decision.
4. Scorer selects striker, non-striker, and opening bowler.
5. App validates distinct openers and required bowler.
6. App creates first innings object.
7. Match is updated to `status: in-progress`.
8. App navigates to `/score-card?matchId=...`.

## Scoring Flow

1. `ScoreCard` fetches match once through `getMatchForScoring`.
2. Local reducer becomes the active scoring source of truth.
3. Scorer toggles extras if needed.
4. Scorer taps a run value.
5. `ScoringActions` creates ball summary and calls `updateScoreCard`.
6. `ScoreCard` updates local reducer and timeline metadata.
7. `useScoringPersistence` queues Firestore update.
8. At over end, scorer selects the next bowler.
9. Undo/redo snapshots allow correction.
10. Failed writes are kept locally and retried.

## Wicket Flow

1. Scorer toggles wicket and enters delivery runs.
2. Wicket dialog opens through `Selectbatsman`.
3. Scorer chooses dismissed batter and replacement batter.
4. Scorecard updates wickets, bowler wicket credit, batsman state, and current over.
5. App persists the updated match.

## Innings Flow

1. First innings ends by max overs, wickets, or manual confirmation.
2. App flushes pending scoring writes.
3. `EndOfInnings` shows innings summary and target.
4. Scorer starts second innings.
5. `persistCurrentInning(matchId, 2)` updates current innings.
6. App navigates to `/start-second-innings?matchId=...`.
7. `StartMatch` appends second innings with opposite batting team.
8. Scoring resumes in `/score-card?matchId=...`.

## Completion Flow

1. During second innings, app checks target reached, max overs, or all out.
2. Completion helper builds result fields.
3. `persistMatchCompletion` updates match with:
   - `status: completed`
   - `completedAt`
   - `resultSummary`
   - `winnerTeamKey`
   - `winnerName`
   - `margin`
   - `isTie`
4. Final scorecard view is shown.
5. Dashboard and public scorecards derive completed display from persisted or derivable fields.

## Public Viewer Flow

1. Fan opens `/live/:matchId` or `/scorecard/:matchId`.
2. Public route does not require auth.
3. Page subscribes to the match document with `useLiveMatch`.
4. If `match.isPublic === false` and viewer is not authenticated, page shows an unavailable message.
5. Otherwise, read-only live scoreboard and full scorecard render.
6. Firestore rules allow public reads only when `isPublic == true`.
