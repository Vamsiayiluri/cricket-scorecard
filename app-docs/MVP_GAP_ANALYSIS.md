# CricVelo MVP Gap Analysis

## Current Project Maturity Score

**62 / 100**

Rationale: CricVelo has a real app structure, clear product direction, working Firebase integration, match setup, scoring, and public viewing. It also has meaningful architecture docs. Maturity is reduced by missing tests, incomplete lifecycle completion, undeveloped tournament/team/admin modules, lint debt, and scoring correctness risks.

## MVP Readiness Score

**54 / 100**

Rationale: A narrow MVP for "create a match, score it live, share a public scorecard" is within reach. A broader MVP matching the full requirements document is not ready because tournaments, team management, player records, admin, and auction are absent.

## Working Features

- Firebase authentication integration
- Email login and registration
- Google sign-in
- Role-aware protected routes
- Dashboard match buckets
- Match creation wizard
- Draft autosave and recovery
- Firestore match persistence
- Opening batter/bowler setup
- Ball-by-ball scoring controls
- Extras and wicket dialogs
- Batting and bowling scorecards
- Undo/redo/correct last ball
- Scoring persistence queue
- Public live and scorecard routes
- Public/private visibility
- Match details and pre-match edit
- Archive service and archive action

## Partially Working Features

- Email verification: sends email, but UX is basic.
- Match lifecycle: scheduled and in-progress work, completed flow is incomplete.
- Match management: archive exists, restore/delete incomplete.
- Viewer role: route restrictions exist, but signed-in private match read rules are broad.
- Team/player management: only embedded in match setup.
- Admin: role exists, no admin UI.
- Public scorecard: useful but not complete professional scorecard.
- Search/notifications/settings: visible placeholders only.

## Broken or High-Risk Features

- ESLint fails with 583 problems.
- `updateScorecard.js` has undefined `updateOvers` for `UPDATE_OVERS`.
- `ADD_WICKET` helper path references `scoreCard.bowlers`, likely wrong shape.
- Missing hook imports in `TossDetailsForm.jsx` and `ScoringRulesForm.jsx` are lint errors, although production build currently succeeds due classic JSX transform/import behavior.
- `PublicMatchScorecard.jsx` uses `Box` without import.
- Match can show result but does not reliably update `status` to `completed`.
- Firestore signed-in read access is broader than private-match expectations.
- No automated tests for scoring rules.

## Missing Features From Product Vision

- Forgot password
- Profile management
- Admin panel
- Role management
- First-class teams
- First-class players
- Player statistics
- Team statistics
- Tournament creation
- Fixtures
- Points table
- Tournament dashboard
- Auction system
- Bid history
- Purse tracking
- Scorecard export
- Advanced analytics
- Partnership tracking
- Fall of wickets
- Maiden overs
- Audit logs

## Top 20 Issues Blocking MVP Launch

1. Final match completion is incomplete; `completed` status is not reliably set after second innings.
2. Scoring correctness lacks automated tests for runs, extras, wickets, strike rotation, and innings transitions.
3. ESLint is failing with 583 problems, hiding real issues among style noise.
4. `updateScorecard.js` references undefined `updateOvers`.
5. `updateScorecard.js` `ADD_WICKET` path appears incompatible with current nested scorecard shape.
6. Public/private access model is incomplete because signed-in users can read all matches.
7. No ownership or assigned scorer model exists for match writes.
8. Multi-tab or multi-scorer conflict handling is not defined.
9. Same opening batter can likely be selected as striker and non-striker.
10. Password reset is missing while UI says "Forgot password?"
11. Search, notifications, and settings are visible but nonfunctional.
12. Team and player data are embedded strings, preventing player stats and reusable squads.
13. Tournament features from requirements are absent.
14. Admin tooling is absent.
15. Firestore timestamps use client `Date` in several writes instead of consistent server timestamps.
16. Match archive has no restore UI.
17. Public scorecard lacks professional cricket sections such as fall of wickets and partnerships.
18. Scoring UI uses non-semantic clickable boxes for run pads, reducing accessibility.
19. No CI, test suite, or deployment validation is present.
20. Encoding artifacts in UI copy reduce polish and trust.

## Technical Debt

- Large `ScoreCard.jsx` component combines reducer, data fetch, scoring state, persistence, dialogs, and layout.
- Core scoring helper mutates nested state directly.
- Redux store is mostly redundant with context and Firestore hooks.
- Legacy `firebaseServices.js` facade remains in use.
- Several placeholder services/components exist without product integration.
- Many unused imports and prop-types lint failures.
- No formal data migration/versioning strategy for match docs beyond docs.

## High Priority Fixes

- Add scoring unit tests before changing scoring logic.
- Complete match lifecycle to set `completed`.
- Fix lint errors that are real runtime risks.
- Add opening batter uniqueness validation.
- Tighten Firestore private match read rules and ownership model.
- Add password reset or remove the link.
- Remove or disable placeholder UI.

## Medium Priority Fixes

- Add first-class teams and players.
- Add match restore/delete management.
- Improve public scorecard completeness.
- Add keyboard/accessibility improvements for scoring.
- Add route consistency with path params instead of query-only scoring routes.
- Add server timestamp usage.

## Low Priority Fixes

- Persist theme mode.
- Improve avatar/profile display.
- Reduce bundle size through chunk strategy.
- Normalize visual copy and remove encoding artifacts.
- Replace native confirms with app dialogs.

## Recommended Execution Order

1. Establish a safety net: add unit tests for scoring helper and smoke tests for major routes.
2. Fix real lint/runtime issues and separate lint style rules from correctness rules.
3. Complete match lifecycle and final result persistence.
4. Harden scoring edge cases and opening setup validation.
5. Tighten Firestore authorization around private matches and match ownership.
6. Remove or implement placeholder UI: forgot password, search, notifications, settings.
7. Improve public scorecard detail and share UX.
8. Add match restore/delete operational tools.
9. Introduce first-class teams and players.
10. Add tournament module only after match scoring MVP is stable.

