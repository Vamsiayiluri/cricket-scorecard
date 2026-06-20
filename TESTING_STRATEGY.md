# CricVelo Testing Strategy

## Current Testing Posture

The repository has build and lint scripts but no dedicated automated test script in `package.json`. Scoring and lifecycle logic are high-risk and should receive automated coverage before public launch.

## Manual Testing Flows

### Authentication

- Register with email/password.
- Verify email gate blocks unverified users.
- Login with email/password.
- Login with Google.
- Logout.
- Confirm viewer cannot access scorer routes.
- Confirm scorer/admin can access scorer routes.
- Confirm missing/invalid profile resolves safely.

### Dashboard

- Load dashboard as viewer.
- Load dashboard as scorer.
- Confirm create button only appears for scorer/admin.
- Confirm ongoing/upcoming/completed buckets render.
- Confirm archived/deleted matches are handled as expected.
- Confirm dashboard updates after match status changes.

### Match Creation

- Complete all six wizard steps.
- Validate required fields.
- Validate duplicate team/player constraints.
- Validate min/max player and over constraints.
- Test draft autosave, restore, and discard.
- Create public and private matches.
- Confirm navigation to opening setup.

### Opening Setup

- Start match from newly created match.
- Confirm batting team from toss winner/decision.
- Select striker, non-striker, and bowler.
- Confirm same opener cannot be selected twice.
- Confirm missing selections block start.
- Start first innings and verify Firestore match status.
- Start second innings after first innings ends.

### Live Scoring

- Score 0, 1, 2, 3, 4, 5, 6.
- Confirm striker changes on odd runs.
- Confirm boundary counters for 4 and 6.
- Score wides.
- Score no-balls.
- Score byes and leg-byes.
- Score wicket with replacement batter.
- Complete an over and select next bowler.
- Use undo, redo, and correct last ball.
- Trigger failed write if possible and verify retry behavior.
- Refresh during scoring and confirm persisted state is coherent.

### Innings and Completion

- End first innings by overs.
- End first innings by all out.
- End first innings manually.
- Start second innings.
- Complete chase by reaching target.
- Complete second innings by overs.
- Complete second innings by all out.
- Test tied match.
- Confirm final result fields persist.
- Confirm dashboard displays completed match.

### Public Viewer

- Open `/live/:matchId` for public match.
- Open `/scorecard/:matchId` for public match.
- Confirm realtime updates arrive.
- Confirm private match is hidden from unauthenticated viewer.
- Confirm authenticated viewer can access allowed private flow where rules permit.
- Confirm not-found and invalid-link states.

### Match Management

- Open match details.
- Share match.
- Toggle public/private.
- Edit scheduled match.
- Confirm structural edit disabled for in-progress/completed matches.
- Archive match.
- Restore/soft-delete flows when UI exists.

## Regression Testing

Run regression whenever changing:
- `updateScorecard.js`
- `ScoreCard.jsx`
- `ScoringActions.jsx`
- `StartMatch.jsx`
- `EndOfInnings.jsx`
- `matchDisplay.js`
- `matchService.js`
- `scoringService.js`
- `firestore.rules`
- Auth/profile/route files

Minimum regression matrix:
- One scheduled match creation.
- One full two-innings match completion.
- One public viewer check.
- One scorer route access check.
- One viewer route denial check.

## MVP Acceptance Criteria

- Scorer can create a match and score both innings to completion.
- Final result is persisted and visible on dashboard and public scorecard.
- Public/private visibility behaves correctly.
- Viewer cannot create, edit, or score.
- Scorer/admin writes are allowed by Firestore rules.
- Failed scoring write recovery is understandable and retriable.
- Core cricket score totals are internally consistent.
- App builds successfully.
- Critical lint/runtime issues are resolved or explicitly waived.

## Release Checklist

- Read `MVP_GAPS.md` and confirm no open P0 launch blockers.
- Run `npm run build`.
- Run `npm run lint`.
- Execute manual authentication flow.
- Execute manual match creation flow.
- Execute full scoring flow through match completion.
- Execute public viewer flow.
- Review Firestore rules.
- Review Firebase Hosting config.
- Confirm environment variables are configured.
- Confirm no secrets are committed.
- Confirm documentation changed if routes/schema/architecture changed.
- Record known residual risks before deployment.
