# MVP_STABILIZATION_PLAN.md

## 1. Executive Summary

CricVelo has the core MVP surface in place: authentication, match creation, opening setup, live scoring, innings transition, dashboard buckets, and public scorecard views. The app is not ready for MVP launch yet because several existing workflows can produce runtime crashes, incorrect cricket statistics, invalid match lifecycle states, or misleading dashboard/public results.

The main stabilization theme is consistency. Authentication needs safe role defaults. Match setup needs runtime fixes and stronger validation. Live scoring needs cricket correctness. Innings completion needs a durable final match state. Dashboard and public viewer screens already have much of the display UI, but they depend on status/result fields that are not reliably written.

No new product features should be added until the P0 fixes are complete and validated.

## 2. Current MVP Readiness Score

Overall MVP readiness score: **49 / 100**

| Area | Readiness | Reason |
|---|---:|---|
| Authentication | 58 / 100 | Basic Firebase auth works, but role fallback and verification enforcement are unsafe |
| Match Creation | 62 / 100 | Wizard exists, but two runtime crashes block steps and persistence metadata is weak |
| Opening Setup | 55 / 100 | Setup works for happy path, but duplicate players and second-innings invalid state are serious |
| Live Scoring | 58 / 100 | Main scorer UI exists, but several cricket rules are wrong |
| Innings & Completion | 42 / 100 | First-to-second innings exists, but match completion is not persisted |
| Dashboard/Public Viewer | 50 / 100 | UI exists, but depends on completion/status propagation that is missing |

## 3. MVP Blockers

1. New Google or missing-profile users can become scorers automatically.
2. Email verification is not enforced at route-guard level.
3. Private matches are readable by every signed-in user.
4. Auth redirects can drop query strings such as `?matchId=...`.
5. `TossDetailsForm.jsx` can crash because React hooks are not imported.
6. `ScoringRulesForm.jsx` can crash because React hooks are not imported.
7. `StartMatch.jsx` can crash on malformed or legacy matches with missing `scoreCard`.
8. Second innings transition can persist `currentInning = 2` before `innings[1]` exists.
9. Duplicate striker/non-striker selection is allowed.
10. No-ball scoring corrupts batter balls and extras split.
11. Final wicket cannot be recorded cleanly when no replacement batter is available.
12. Run out can dismiss the wrong batter if out batter is not selected.
13. Invalid wicket/extras combinations can be saved.
14. Boundary counters can be incremented for bye/leg-bye boundaries.
15. Broken helper paths in `updateScorecard.js` can crash if invoked.
16. Bowler change after over completion is not persisted immediately.
17. Current-over history is corrupted by illegal deliveries.
18. Match does not complete when target is reached.
19. Match does not persist `status: "completed"` or durable result fields.
20. Result/public scorecard views have missing imports that can crash.

## 4. P0 Fix List - Must Complete Before MVP Launch

### P0-1: Safe Auth Role Defaults

Description: New Google users and missing-profile users can become scorers because missing roles default to scorer.

Impact: Unauthorized users may create, edit, or score matches.

Risk: High security and business risk.

Files affected:

- `src/context/AuthContext.jsx`
- `src/services/firebase/userService.js`
- `src/components/GoogleLoginButton.jsx`
- `firestore.rules`

Suggested validation tests:

- New Google user receives viewer role by default.
- Missing-profile user does not pass `ScorerRoute`.
- Existing scorer/admin still retains access.
- Firestore rules deny match create/update for viewer.

### P0-2: Enforce Email Verification In Route Guards

Description: Email verification is checked during login but not consistently enforced by protected routes.

Impact: Unverified users can potentially access authenticated routes after registration/session restore.

Risk: High access-control risk.

Files affected:

- `src/context/AuthContext.jsx`
- `src/pages/ProtectedRoute.jsx`
- `src/pages/ScorerRoute.jsx`
- `src/pages/LoginPage.jsx`
- `src/pages/RegisterPage.jsx`

Suggested validation tests:

- Unverified email user cannot access `/dashboard`.
- Unverified email user cannot access `/create-match`.
- Verified email user can access authorized routes.
- Google auth policy is explicitly handled.

### P0-3: Preserve Query String During Auth Redirect

Description: Protected-route redirects preserve pathname but can drop query strings.

Impact: Scorer links such as `/score-card?matchId=abc` or `/start-match?matchId=abc` can lose context after login.

Risk: High workflow breakage risk.

Files affected:

- `src/pages/ProtectedRoute.jsx`
- `src/pages/LoginPage.jsx`
- `src/components/GoogleLoginButton.jsx`

Suggested validation tests:

- Unauthenticated visit to `/score-card?matchId=abc` redirects to login, then returns to full URL.
- Same test for `/start-match?matchId=abc`.
- Google sign-in preserves query string too.

### P0-4: Fix Match Creation Runtime Crashes

Description: `TossDetailsForm.jsx` and `ScoringRulesForm.jsx` use `useState`/`useEffect` without importing them.

Impact: Match creation wizard can crash before match save.

Risk: Critical runtime risk.

Files affected:

- `src/components/MatchCreation/TossDetailsForm.jsx`
- `src/components/MatchCreation/ScoringRulesForm.jsx`

Suggested validation tests:

- Navigate through all six match creation steps.
- Edit toss selection and verify state persists.
- Edit scoring rules and verify validation runs.
- Run build/lint smoke check after import fixes.

### P0-5: Harden Opening Setup Scorecard Access

Description: `StartMatch.jsx` reads `matchData?.scoreCard.currentInning`, which can crash if `scoreCard` is missing.

Impact: Legacy or malformed matches can break setup.

Risk: Critical runtime risk.

Files affected:

- `src/components/match/StartMatch.jsx`
- `src/pages/MatchScoring.jsx`

Suggested validation tests:

- Open setup for new scheduled match with `scoreCard: {}`.
- Open setup for legacy match with missing `scoreCard`.
- Open setup for match with `scoreCard.currentInning` but missing innings.
- Confirm user-facing error instead of crash.

### P0-6: Make Second Innings Transition Valid

Description: The app persists `scoreCard.currentInning = 2` before the second innings object exists.

Impact: Refresh or public/dashboard reads can see an invalid current innings state.

Risk: High data integrity risk.

Files affected:

- `src/components/match/EndOfInnings.jsx`
- `src/components/match/StartMatch.jsx`
- `src/components/match/ScoreCard.jsx`
- `src/services/firebase/scoringService.js`
- `src/services/firebase/matchService.js`

Suggested validation tests:

- End first innings and refresh during transition.
- Start second innings and verify `scoreCard.innings[1]` exists when `currentInning` is 2.
- Direct visit to `/score-card` during transition does not crash.
- Direct visit to `/start-second-innings` twice does not append duplicate innings.

### P0-7: Prevent Duplicate Opening Batters

Description: The same player can be selected as striker and non-striker.

Impact: Innings starts with invalid batting state.

Risk: High cricket/data integrity risk.

Files affected:

- `src/components/match/StartMatch.jsx`

Suggested validation tests:

- Select same batter in both fields and verify submit is blocked.
- Select two different batters and verify innings starts.
- Repeat for second innings setup.

### P0-8: Fix No-Ball Scoring Correctness

Description: No-ball scoring increments batter balls and can overstate no-ball extras when bat runs are scored.

Impact: Batter stats, extras, strike rate, and scorecard breakdown become incorrect.

Risk: Critical cricket correctness risk.

Files affected:

- `src/helpers/updateScorecard.js`
- `src/components/match/ScoringActions.jsx`
- `src/components/match/ScoreCard.jsx`

Suggested validation tests:

- No-ball with no bat run adds penalty only, no legal ball, no batter ball.
- No-ball plus 1/2/3/4/6 bat runs credits batter runs but only penalty to no-ball extras.
- Bowler conceded runs match cricket rules.
- Strike behavior is correct after no-ball bat runs.

### P0-9: Fix Wicket Finalization

Description: Wicket dialog requires replacement batter for every wicket and does not handle final wicket cleanly.

Impact: Scorer may be unable to complete all-out innings.

Risk: Critical scoring workflow risk.

Files affected:

- `src/components/match/Selectbatsman.jsx`
- `src/components/match/ScoringActions.jsx`
- `src/components/match/ScoreCard.jsx`

Suggested validation tests:

- Record final wicket with no replacement batter.
- Record wicket with available replacement batter.
- Verify innings ends at correct wicket count.
- Verify dismissed batter status and dismissal text.

### P0-10: Require Correct Run Out Batter Selection

Description: Run out can default to wrong batter when `outBatsman` is not explicitly selected.

Impact: Wrong player can be dismissed.

Risk: Critical scorecard integrity risk.

Files affected:

- `src/components/match/Selectbatsman.jsx`
- `src/helpers/updateScorecard.js`

Suggested validation tests:

- Run out striker.
- Run out non-striker.
- Attempt run out without out batter selected and verify submit is blocked.
- Verify no bowler wicket is credited.

### P0-11: Block Invalid Wicket/Extras Combinations

Description: Invalid events like bowled on no-ball or LBW on no-ball can be saved.

Impact: Impossible cricket states enter scorecard.

Risk: High cricket correctness risk.

Files affected:

- `src/components/match/ScoringActions.jsx`
- `src/components/match/Selectbatsman.jsx`
- `src/helpers/updateScorecard.js`

Suggested validation tests:

- No-ball + bowled is blocked or converted to valid no-out state.
- No-ball + LBW is blocked.
- Valid run out on no-ball is allowed if rules support it.
- Caught, stumped, hit wicket validations match MVP rule policy.

### P0-12: Prevent Boundary Counters On Byes/Leg Byes

Description: Batter fours/sixes can increment when `runs === 4/6` even if runs are byes or leg-byes.

Impact: Batter statistics become incorrect.

Risk: High scoring integrity risk.

Files affected:

- `src/helpers/updateScorecard.js`

Suggested validation tests:

- Four byes does not increment batter fours.
- Four leg-byes does not increment batter fours.
- Six byes/leg-byes does not increment batter sixes.
- Normal 4 and 6 still increment correctly.

### P0-13: Repair Broken Scoring Helper Paths

Description: `UPDATE_OVERS` calls undefined `updateOvers`; `ADD_WICKET` references `scoreCard.bowlers` instead of innings bowlers.

Impact: Runtime crash if those helper actions are invoked.

Risk: Critical latent runtime risk.

Files affected:

- `src/helpers/updateScorecard.js`

Suggested validation tests:

- Unit/smoke test all exported update action paths.
- Confirm no undefined function calls remain.
- Confirm wicket helper targets active innings shape.

### P0-14: Persist Match Completion

Description: The match lifecycle does not persist final completed status/result after second innings.

Impact: Dashboard and public scorecard cannot reliably show completed matches.

Risk: Critical MVP lifecycle risk.

Files affected:

- `src/components/match/ScoreCard.jsx`
- `src/components/match/EndOfInnings.jsx`
- `src/services/firebase/scoringService.js`
- `src/services/firebase/matchService.js`
- `src/utils/matchDisplay.js`

Suggested validation tests:

- Chasing team wins and match status becomes `completed`.
- Defending team wins after overs/all out and status becomes `completed`.
- Tie persists as tie.
- Result fields persist and survive refresh.

### P0-15: Stop Scoring When Target Is Reached

Description: Chasing side can continue scoring after passing target.

Impact: Match totals can become invalid after result should be final.

Risk: Critical cricket lifecycle risk.

Files affected:

- `src/components/match/ScoreCard.jsx`
- `src/helpers/updateScorecard.js`
- `src/components/match/ScoringActions.jsx`

Suggested validation tests:

- Chasing team reaches target with 1 run and scoring locks.
- Chasing team reaches target with boundary and scoring locks.
- Required run text disappears or becomes result state.
- No further scoring action mutates completed match.

### P0-16: Fix Completion Scorecard Runtime Imports

Description: `MatchScoreCard.jsx` uses `Box`/`AppButton` without imports; `PublicMatchScorecard.jsx` uses `Box` without import.

Impact: Final scorecard and public scorecard can crash.

Risk: Critical post-match UX risk.

Files affected:

- `src/components/match/MatchScoreCard.jsx`
- `src/components/viewer/PublicMatchScorecard.jsx`

Suggested validation tests:

- Open full match scorecard with two innings.
- Open public scorecard with innings.
- Open completed public scorecard.
- Run build/lint smoke check.

## 5. P1 Fix List - Stabilization Improvements

### P1-1: Fix Private Match Visibility Enforcement

Description: Private matches are hidden from unauthenticated users but readable by any signed-in user.

Impact: Private match privacy does not match product expectations.

Risk: High privacy risk.

Files affected:

- `firestore.rules`
- `src/services/firebase/matchService.js`
- `src/services/firebase/dashboardService.js`
- `src/pages/PublicScorecardPage.jsx`

Suggested validation tests:

- Public match readable anonymously.
- Private match not readable anonymously.
- Viewer cannot read unrelated private match if policy requires ownership.
- Authorized scorer/admin can read assigned private match.

### P1-2: Fix Edit Visibility UI Conflict

Description: Edit page has a real visibility switch and an unwired `NotesForm` visibility switch.

Impact: Users can misunderstand public/private state.

Risk: Medium data privacy UX risk.

Files affected:

- `src/pages/EditMatchPage.jsx`
- `src/components/MatchCreation/NotesForm.jsx`

Suggested validation tests:

- Edit scheduled private match and verify one visibility control.
- Save private/public change and reload.
- Verify review/edit UI reflects true persisted state.

### P1-3: Store Creator/Ownership Metadata

Description: New matches do not store `createdBy`, `createdByEmail`, or scorer ownership.

Impact: Future rules cannot enforce match-specific permissions.

Risk: High authorization scalability risk.

Files affected:

- `src/services/firebase/matchService.js`
- `src/services/firebaseServices.js`
- `src/pages/MatchCreationPage.jsx`
- `firestore.rules`

Suggested validation tests:

- New match stores creator UID.
- Dashboard only shows matches allowed by policy.
- Creator can edit/start own match.
- Viewer cannot mutate match.

### P1-4: Fix Undefined Innings Metadata

Description: `StartMatch.jsx` writes `battingTeam` and `bowlingTeam` from non-existent `matchData.teams.battingTeam`.

Impact: Innings metadata is malformed.

Risk: Medium data integrity risk.

Files affected:

- `src/components/match/StartMatch.jsx`

Suggested validation tests:

- Start first innings and inspect stored batting/bowling team metadata.
- Start second innings and inspect metadata.
- Public scorecard uses expected team names.

### P1-5: Add Match Status Guards To Setup/Scoring

Description: Setup routes can render for in-progress/completed matches; completed matches can remain scoreable.

Impact: Users can mutate matches in the wrong lifecycle state.

Risk: High lifecycle integrity risk.

Files affected:

- `src/pages/MatchScoring.jsx`
- `src/components/match/StartMatch.jsx`
- `src/components/match/ScoreCard.jsx`
- `src/utils/matchDisplay.js`

Suggested validation tests:

- Scheduled match opens setup.
- In-progress match opens scoring.
- Completed match opens read-only scorecard/result.
- Direct URL attempts are redirected or blocked safely.

### P1-6: Add Submit/Click Pending Guards

Description: Opening setup and scoring flows can allow duplicate clicks or race with persistence.

Impact: Duplicate writes or out-of-order state changes are possible.

Risk: Medium stability risk.

Files affected:

- `src/components/match/StartMatch.jsx`
- `src/components/match/ScoringActions.jsx`
- `src/components/match/ScoreCard.jsx`

Suggested validation tests:

- Double-click Start Match creates one innings.
- Rapid score clicks commit in correct order or are blocked.
- Buttons disable while critical write is pending.

### P1-7: Persist Bowler Selection Immediately

Description: New bowler selection after an over updates local reducer state but is not saved until next scoring action.

Impact: Refresh before next ball can lose current bowler.

Risk: High scoring continuity risk.

Files affected:

- `src/components/match/ScoreCard.jsx`
- `src/components/match/SelectBowler.jsx`
- `src/hooks/useScoringPersistence.js`

Suggested validation tests:

- Complete over, select bowler, refresh, verify selected bowler remains current.
- Select existing bowler and verify stats preserved.
- Select new bowler and verify stats initialized.

### P1-8: Use Legal-Ball-Based Over Timeline

Description: Current over history uses delivery count, so wides/no-balls can corrupt over grouping.

Impact: Timeline and current over display can be wrong.

Risk: High score presentation integrity risk.

Files affected:

- `src/components/match/ScoreCard.jsx`
- `src/components/match/CurrentOver.jsx`
- `src/components/match/BallTimeline.jsx`
- `src/components/match/ScoringActions.jsx`

Suggested validation tests:

- Over with one wide and six legal balls displays seven deliveries grouped into one over.
- Over history pushes only after six legal balls.
- Current over resets after legal over completion.

### P1-9: Team-Size-Aware All-Out Logic

Description: Completion logic assumes `10` wickets.

Impact: Matches with fewer or more players complete incorrectly.

Risk: High correctness risk for custom formats.

Files affected:

- `src/components/match/ScoreCard.jsx`
- `src/components/match/Selectbatsman.jsx`
- `src/utils/matchDisplay.js`

Suggested validation tests:

- Two-player team ends after one wicket.
- Eleven-player team ends after ten wickets.
- Wickets-in-hand result margin matches team size.

### P1-10: Add Conflict Protection For Scoring Writes

Description: Full-document latest-write-wins persistence can overwrite concurrent scorer updates.

Impact: Multi-scorer sessions can lose balls or lifecycle changes.

Risk: High data loss risk.

Files affected:

- `src/hooks/useScoringPersistence.js`
- `src/services/firebase/scoringService.js`
- `src/services/firebase/matchService.js`
- `src/components/match/ScoreCard.jsx`

Suggested validation tests:

- Two clients scoring same match produce conflict warning or deterministic rejection.
- Failed retry does not overwrite newer remote state.
- Version/sequence increments as expected.

### P1-11: Persist Lifecycle Phases

Description: There is no durable phase for first innings complete, second innings setup, or completed.

Impact: Refresh/recovery during transitions is ambiguous.

Risk: High lifecycle recovery risk.

Files affected:

- `src/components/match/EndOfInnings.jsx`
- `src/components/match/ScoreCard.jsx`
- `src/services/firebase/matchService.js`
- `src/services/firebase/scoringService.js`

Suggested validation tests:

- End first innings persists `firstInningsComplete` or equivalent.
- Second innings setup phase survives refresh.
- Completion phase routes to final result.

## 6. P2 Fix List - MVP Polish

### P2-1: Auth UX Polish

Description: Forgot password links to register, remember device is not wired, errors are generic, and auth buttons lack strong loading states.

Impact: Auth feels unreliable and confusing.

Risk: Medium UX risk.

Files affected:

- `src/pages/LoginPage.jsx`
- `src/pages/RegisterPage.jsx`
- `src/components/GoogleLoginButton.jsx`
- `src/layout/AppShell.jsx`

Suggested validation tests:

- Forgot password sends reset email or is hidden.
- Remember device is removed or works with Firebase persistence.
- Loading states prevent duplicate auth requests.
- Firebase errors map to safe user messages.

### P2-2: Review And Draft Polish

Description: Review step omits visibility, duplicate player add is silent, drafts are browser-global, and strings are not consistently trimmed.

Impact: Users can create matches with unintended visibility or messy data.

Risk: Medium product polish risk.

Files affected:

- `src/pages/MatchCreationPage.jsx`
- `src/components/MatchCreation/PreviewMatch.jsx`
- `src/components/MatchCreation/TeamsSetupForm.jsx`
- `src/utils/matchCreationDraft.js`
- `src/services/firebase/matchService.js`

Suggested validation tests:

- Review shows public/private state.
- Duplicate player add shows feedback.
- Saved strings are trimmed.
- Draft restore/discard works per intended policy.

### P2-3: Scoring Save Error UX

Description: Save failures are not explained strongly enough during live scoring and transition.

Impact: Scorers may not know whether data is safe.

Risk: Medium live-ops risk.

Files affected:

- `src/components/match/ScoreCard.jsx`
- `src/hooks/useScoringPersistence.js`
- `src/components/match/EndOfInnings.jsx`

Suggested validation tests:

- Simulated failed save shows clear status and retry.
- End innings is blocked or warned when save failed.
- Retry succeeds and clears failed state.

### P2-4: Team Labels And Display Polish

Description: Some live scorecard headings can render team objects as `[object Object]`.

Impact: Visible UI defect during scoring.

Risk: Low-medium polish risk.

Files affected:

- `src/components/match/ScoreCard.jsx`
- `src/components/match/BattingScoreCard.jsx`
- `src/components/match/BowlingScoreCard.jsx`

Suggested validation tests:

- Batting scorecard heading shows team name.
- Bowling scorecard heading shows team name.
- Public scorecard headings remain correct.

### P2-5: Result And Public Viewer Polish

Description: Result helpers are not team-size-aware and completed result sharing is not guided.

Impact: Completed match presentation can be incomplete.

Risk: Medium polish risk.

Files affected:

- `src/utils/matchDisplay.js`
- `src/components/viewer/LiveScoreboard.jsx`
- `src/components/viewer/PublicMatchScorecard.jsx`
- `src/components/Dashboard/CompletedMatchesCard.jsx`

Suggested validation tests:

- Win by wickets margin is correct for custom team size.
- Tie display is clear.
- Completed public scorecard shows final result.
- Dashboard completed card shows result line.

### P2-6: Test And Lint Stabilization

Description: Existing lint noise and missing regression tests make stabilization harder to trust.

Impact: Bugs can regress silently.

Risk: Medium engineering risk.

Files affected:

- Auth, match creation, setup, scoring, lifecycle files
- Test configuration if present

Suggested validation tests:

- Add focused tests for auth roles, creation validation, setup, scoring, lifecycle.
- Run build.
- Run lint and reduce high-signal errors around touched files.

## 7. Recommended Implementation Order

### Phase 1: Authentication + Match Creation Runtime Fixes

Goal: Make the app safe to enter and make match creation stop crashing.

Issues:

1. Safe auth role defaults.
   - Impact: prevents unintended scorer access.
   - Risk: security-critical.
   - Files: `AuthContext.jsx`, `userService.js`, `GoogleLoginButton.jsx`, `firestore.rules`.
   - Tests: new Google user is viewer; viewer blocked from scorer routes.

2. Route-level email verification.
   - Impact: prevents unverified account access.
   - Risk: access-control gap.
   - Files: `AuthContext.jsx`, `ProtectedRoute.jsx`, `ScorerRoute.jsx`.
   - Tests: unverified email user cannot access protected routes.

3. Query-string redirect preservation.
   - Impact: keeps scorer workflow links usable after login.
   - Risk: workflow breakage.
   - Files: `ProtectedRoute.jsx`, `LoginPage.jsx`, `GoogleLoginButton.jsx`.
   - Tests: login returns to `/score-card?matchId=...`.

4. Match creation hook imports.
   - Impact: fixes toss/rules step crashes.
   - Risk: runtime-blocking.
   - Files: `TossDetailsForm.jsx`, `ScoringRulesForm.jsx`.
   - Tests: complete all six wizard steps.

5. Edit visibility UI conflict.
   - Impact: prevents visibility misunderstanding.
   - Risk: privacy UX.
   - Files: `EditMatchPage.jsx`, `NotesForm.jsx`.
   - Tests: edit private/public match and verify one source of truth.

### Phase 2: Opening Setup Stabilization

Goal: Ensure every innings starts with valid teams, players, and scorecard shape.

Issues:

1. Safe `scoreCard` access.
   - Impact: prevents legacy/malformed match crashes.
   - Risk: runtime-blocking.
   - Files: `StartMatch.jsx`, `MatchScoring.jsx`.
   - Tests: missing scoreCard shows safe recovery/error.

2. Duplicate striker/non-striker prevention.
   - Impact: prevents invalid innings from ball one.
   - Risk: data integrity.
   - Files: `StartMatch.jsx`.
   - Tests: same batter blocked; different batters allowed.

3. Correct innings metadata.
   - Impact: reliable batting/bowling team fields.
   - Risk: downstream display/data quality.
   - Files: `StartMatch.jsx`.
   - Tests: persisted innings metadata matches selected teams.

4. Status guards and duplicate-submit protection.
   - Impact: prevents wrong lifecycle setup and repeated writes.
   - Risk: lifecycle corruption.
   - Files: `MatchScoring.jsx`, `StartMatch.jsx`, `matchDisplay.js`.
   - Tests: completed match cannot enter setup; double click creates one innings.

5. Atomic or self-healing second innings setup.
   - Impact: avoids `currentInning` pointing to missing innings.
   - Risk: high transition integrity.
   - Files: `EndOfInnings.jsx`, `StartMatch.jsx`, `scoringService.js`, `matchService.js`.
   - Tests: refresh during transition does not crash or duplicate innings.

### Phase 3: Live Scoring Correctness

Goal: Make every ball, extra, wicket, over, and bowler change cricket-correct.

Issues:

1. No-ball scoring correction.
   - Impact: correct batter balls, extras, bowler runs.
   - Risk: core scoring correctness.
   - Files: `updateScorecard.js`, `ScoringActions.jsx`.
   - Tests: no-ball variants with 0/1/2/3/4/6 bat runs.

2. Wicket finalization and run out validation.
   - Impact: correct dismissals and all-out handling.
   - Risk: core scoring correctness.
   - Files: `Selectbatsman.jsx`, `ScoringActions.jsx`, `ScoreCard.jsx`.
   - Tests: final wicket, striker run out, non-striker run out.

3. Invalid wicket/extras prevention.
   - Impact: blocks impossible cricket events.
   - Risk: data integrity.
   - Files: `Selectbatsman.jsx`, `ScoringActions.jsx`, `updateScorecard.js`.
   - Tests: no-ball + invalid wicket combinations blocked.

4. Boundary counters on extras.
   - Impact: batter stats remain correct.
   - Risk: stats corruption.
   - Files: `updateScorecard.js`.
   - Tests: byes/leg-byes boundaries do not credit batter boundaries.

5. Broken helper paths.
   - Impact: removes runtime crash paths.
   - Risk: latent runtime crash.
   - Files: `updateScorecard.js`.
   - Tests: all action paths smoke-tested.

6. Persist bowler selection and legal-ball timeline.
   - Impact: bowler/current over survive refresh and illegal deliveries.
   - Risk: scoring continuity.
   - Files: `ScoreCard.jsx`, `SelectBowler.jsx`, `BallTimeline.jsx`, `CurrentOver.jsx`.
   - Tests: wide/no-ball overs and bowler refresh cases.

### Phase 4: Innings & Match Completion

Goal: Turn innings ending into a reliable match lifecycle.

Issues:

1. Target reached completion.
   - Impact: match stops when chase is won.
   - Risk: core cricket lifecycle.
   - Files: `ScoreCard.jsx`, `ScoringActions.jsx`, `updateScorecard.js`.
   - Tests: chase completed by single/boundary, no further scoring.

2. Overs/all-out completion for second innings.
   - Impact: match completes for defended wins and ties.
   - Risk: core lifecycle.
   - Files: `ScoreCard.jsx`, `EndOfInnings.jsx`, `matchService.js`.
   - Tests: defended win, tie, all out.

3. Persist result fields.
   - Impact: durable result for all consumers.
   - Risk: dashboard/public inconsistency.
   - Files: `ScoreCard.jsx`, `scoringService.js`, `matchService.js`, `matchDisplay.js`.
   - Tests: result survives refresh and appears in Firestore.

4. Replace second-innings end UI.
   - Impact: scorer sees final result, not "Start 2nd Innings".
   - Risk: severe UX/lifecycle confusion.
   - Files: `EndOfInnings.jsx`, `MatchScoreCard.jsx`.
   - Tests: second innings end shows completed result flow.

5. Team-size-aware all-out/result margins.
   - Impact: supports MVP custom player counts.
   - Risk: correctness.
   - Files: `ScoreCard.jsx`, `Selectbatsman.jsx`, `matchDisplay.js`.
   - Tests: 2-player and 11-player match completion.

### Phase 5: Dashboard + Public Viewer Propagation

Goal: Make completed state visible everywhere it matters.

Issues:

1. Dashboard completed bucket propagation.
   - Impact: finished matches move out of ongoing list.
   - Risk: product trust.
   - Files: `dashboardService.js`, `useDashboardMatches.js`, `CompletedMatchesCard.jsx`, `OngoingMatchesCard.jsx`.
   - Tests: completed match appears in completed list and stats update.

2. Public viewer completed state.
   - Impact: public links show final result.
   - Risk: public trust.
   - Files: `PublicScorecardPage.jsx`, `PublicMatchScorecard.jsx`, `LiveScoreboard.jsx`.
   - Tests: public completed match shows result and full scorecard.

3. Runtime imports in result views.
   - Impact: final scorecard/public scorecard does not crash.
   - Risk: runtime-blocking.
   - Files: `MatchScoreCard.jsx`, `PublicMatchScorecard.jsx`.
   - Tests: open both views after two innings.

4. Durable result display.
   - Impact: dashboard/public use persisted result fields when available.
   - Risk: display inconsistency.
   - Files: `matchDisplay.js`, `LiveScoreboard.jsx`, `CompletedMatchesCard.jsx`.
   - Tests: persisted resultSummary takes precedence and matches fallback derivation.

### Phase 6: MVP Polish

Goal: Improve user confidence after stability is achieved.

Issues:

1. Auth UX cleanup.
   - Impact: clearer login/register flows.
   - Risk: support burden.
   - Files: `LoginPage.jsx`, `RegisterPage.jsx`, `GoogleLoginButton.jsx`.
   - Tests: forgot password/remember device/loading/error states.

2. Match creation polish.
   - Impact: fewer accidental bad matches.
   - Risk: data quality.
   - Files: `PreviewMatch.jsx`, `TeamsSetupForm.jsx`, `matchCreationDraft.js`.
   - Tests: visibility shown, duplicate feedback, trim persisted values.

3. Scoring save/retry polish.
   - Impact: scorer confidence under bad network.
   - Risk: live scoring support burden.
   - Files: `ScoreCard.jsx`, `useScoringPersistence.js`, `EndOfInnings.jsx`.
   - Tests: failed save, retry, blocked transition.

4. Lint/test stabilization.
   - Impact: lower regression risk.
   - Risk: engineering speed.
   - Files: touched MVP workflow files.
   - Tests: build plus targeted regression tests.

## 8. Final MVP Launch Checklist

### Authentication

- [ ] New Google users default to viewer, not scorer.
- [ ] Missing-profile users do not receive scorer access.
- [ ] Email verification is enforced by route guards.
- [ ] Query strings survive auth redirects.
- [ ] Viewer cannot access scorer routes.
- [ ] Private match policy is enforced by Firestore rules.

### Match Creation

- [ ] All six wizard steps render without runtime errors.
- [ ] Match creation validates required fields.
- [ ] Edit visibility has one source of truth.
- [ ] Review page shows visibility.
- [ ] Match stores creator/ownership metadata if approved for MVP.
- [ ] Draft restore/discard behavior is verified.

### Opening Setup

- [ ] Setup handles missing/legacy scorecard safely.
- [ ] Striker and non-striker must be different.
- [ ] Opening bowler is valid.
- [ ] First innings initializes valid scorecard shape.
- [ ] Second innings setup cannot create invalid intermediate state.
- [ ] Duplicate setup submits are blocked.

### Live Scoring

- [ ] Runs 0/1/2/3/4/6 update stats correctly.
- [ ] Wide scoring is correct.
- [ ] No-ball scoring is correct.
- [ ] Bye/leg-bye scoring is correct.
- [ ] Wicket types are validated.
- [ ] Run out requires out batter.
- [ ] Final wicket can end innings.
- [ ] Bowler change persists immediately.
- [ ] Current over handles illegal deliveries.
- [ ] Undo/redo persists restored state.

### Innings And Completion

- [ ] First innings end persists safely.
- [ ] Target calculation is correct.
- [ ] Second innings starts with valid innings object.
- [ ] Target reached completes match.
- [ ] Overs complete in second innings completes match.
- [ ] All out completes match.
- [ ] Tie is handled and persisted.
- [ ] Result fields persist and survive refresh.
- [ ] Completed match is read-only for scoring.

### Dashboard And Public Viewer

- [ ] Ongoing match appears in ongoing dashboard list.
- [ ] Completed match moves to completed dashboard list.
- [ ] Dashboard stats update after completion.
- [ ] Public live page shows live state.
- [ ] Public scorecard shows completed result.
- [ ] Private public scorecard link is blocked when `isPublic === false`.
- [ ] Final scorecard views do not crash.

### Release Gate

- [ ] Production build succeeds.
- [ ] High-priority lint/runtime errors in touched workflow files are resolved.
- [ ] Manual QA checklist passes for auth, creation, setup, scoring, completion, dashboard, and public viewer.
- [ ] Firestore rules are tested for viewer/scorer/admin access.
- [ ] At least one full match is scored end-to-end and verified after refresh.
- [ ] At least one short-team match is scored end-to-end and verified after refresh.

## Approval Gate

Implementation should begin only after the P0 list and phase order are approved. The recommended first implementation batch is **Phase 1: Authentication + Match Creation Runtime Fixes**.
