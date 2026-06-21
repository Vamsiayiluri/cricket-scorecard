# CricVelo QA Checklist

## Build and Static Validation

- Run production build.
- Run lint.
- Confirm no console errors on initial app load.
- Confirm no route-level chunk loading failures.
- Confirm Firestore rules match deployed environment.

Current validation:

- Build passes.
- Lint fails with 583 problems.

## Authentication

- Valid email/password login.
- Invalid email/password login.
- Empty email.
- Empty password.
- Unverified email login sends verification email.
- Verified email redirects to intended route.
- Google login success.
- Google login failure.
- Registration with matching passwords.
- Registration with mismatched passwords.
- Registration with existing email.
- Registration with weak password.
- Viewer profile created on registration.
- Logout clears session.
- Direct authenticated route restores session after refresh.
- Unauthenticated protected route redirects to login.
- Viewer cannot access scorer route.
- Scorer/admin can access scorer route.

## Dashboard

- Dashboard loads with zero matches.
- Dashboard loading state displays.
- Dashboard error state displays on permission/network failure.
- Ongoing matches appear for `in-progress`.
- Scheduled matches appear in upcoming.
- Completed matches appear in completed.
- Archived matches hidden from default scheduled/completed lists.
- Deleted matches hidden.
- Recent activity sorted by updated time.
- Create match button visible for scorer/admin.
- Create match button hidden for viewer.
- Match list click routes correctly for scorer.
- Match list click routes correctly for viewer.
- Match actions menu opens.
- Share action opens share dialog.
- Visibility toggle works.
- Archive action works.

## Match Creation

### Step 1: Match Details

- Empty Team A blocked.
- Empty Team B blocked.
- Same team names blocked.
- Empty date/time blocked.
- Invalid date/time blocked.
- Empty venue blocked.
- Optional title accepted.
- Match type defaults to T20.
- Team names sync into team setup step.

### Step 2: Teams and Players

- Empty player name ignored or shown.
- Add player to Team A.
- Add player to Team B.
- Duplicate player in same team blocked.
- Minimum player count enforced.
- Maximum player count enforced.
- Remove player updates list.
- Removing captain clears captain.
- Removing wicketkeeper clears wicketkeeper.
- Captain must be in player list.
- Wicketkeeper must be in player list.

### Step 3: Toss

- Toss winner required.
- Toss winner must be one of the two teams.
- Decision required.
- Bat decision accepted.
- Bowl decision accepted.

### Step 4: Scoring Rules

- Overs required.
- Overs below minimum blocked.
- Overs above maximum blocked.
- Wide runs required.
- No-ball runs required.
- Negative extra runs blocked.
- Zero extra runs accepted if intended.

### Step 5: Notes and Visibility

- Notes optional.
- Public/private toggle persists into preview.
- Long notes remain usable on mobile.

### Step 6: Review

- Review displays all match data.
- Edit links return to correct step.
- Invalid sections show warning.
- Create match disabled or blocked when invalid.
- Successful create writes Firestore doc.
- Successful create clears draft.
- Failed create shows toast.

### Draft Recovery

- Draft saved after meaningful input.
- Draft restored.
- Draft discarded.
- Old draft version ignored.
- Corrupt localStorage draft ignored.

## Opening Match Setup

- Batting team determined correctly when toss winner bats.
- Batting team determined correctly when toss winner bowls.
- Select striker.
- Select non-striker.
- Prevent same player as both openers.
- Select bowler from bowling team.
- Empty selections blocked.
- Start match writes `status = in-progress`.
- First innings object created correctly.
- Opening bowler marked current.
- Redirect to scoring route.

## Live Scoring

### Runs

- Dot ball increments balls.
- 1 run increments batter, team, bowler, ball, and rotates strike.
- 2 runs increments correctly without strike rotation.
- 3 runs rotates strike.
- 4 increments fours.
- 6 increments sixes.
- Strike rotates at legal over end.
- Bowler balls and overs update correctly.
- Team overs display correctly.

### Extras

- Wide adds configured penalty and does not count legal ball.
- Wide plus runs handled.
- No-ball adds configured penalty and does not count legal ball if intended.
- No-ball plus bat runs handled.
- Bye counts legal ball and team runs, not batter runs.
- Leg bye counts legal ball and team runs, not batter runs.
- Mutually exclusive extras toggle correctly.
- Extras total equals sum of components.

### Wickets

- Bowled wicket.
- Caught wicket with fielder.
- LBW wicket.
- Stumped wicket with fielder.
- Hit wicket.
- Run out striker.
- Run out non-striker.
- Run out strike selection after wicket.
- Wicket plus runs.
- Wicket on final ball of over.
- Wicket at 10 wickets ends innings.
- New batter cannot be an already out/current batter.

### Over Management

- Next bowler dialog opens after 6 legal balls.
- Current bowler cannot continue if rules require change.
- Existing bowler can be reselected later.
- Current over resets after bowler change.
- Over timeline stores completed over.

### Undo/Redo/Correction

- Undo last normal ball.
- Undo wicket as one atomic action.
- Redo after undo.
- Correct last ball confirmation.
- Undo blocked across innings boundary.
- Undo disabled while saving.
- Redo stack clears after new ball.

### Persistence

- Ball write queued.
- Rapid clicks do not duplicate within debounce window.
- Save status changes to saving/saved.
- Failed write shows retry.
- Retry writes latest payload.
- Pending write warns before unload.
- Pending localStorage payload recovers on reload.
- Public viewer sees updates after persistence.

## Innings and Result

- Manual end innings confirmation.
- End innings flushes pending writes.
- First innings summary shows score and target.
- Start second innings patches current innings.
- Second innings setup chooses opposite batting team.
- Target displayed correctly.
- Chase win detected.
- Defending team win detected.
- Tie detected.
- Match status changes to completed after match end.
- Completed match appears in completed dashboard list.

## Public Viewer

- Public live route loads public match without auth.
- Public scorecard route loads public match without auth.
- Private match public route shows unavailable message.
- Invalid match id shows error.
- Missing match shows not found.
- Scheduled match shows scheduled state.
- In-progress match shows live state.
- Completed match shows result state.
- Realtime updates arrive.
- Page works on mobile.

## Match Management

- Details page loads.
- Share dialog opens from details.
- Live link correct.
- Scorecard link correct.
- Visibility toggle persists.
- Edit enabled only for scheduled match.
- Edit structural fields for scheduled match.
- Edit safe fields for in-progress/completed match.
- Archive match hides from default lists.
- Restore archived match when UI exists.
- Soft delete when UI exists.

## Firestore Security

- Unauthenticated public match read allowed.
- Unauthenticated private match read denied.
- Unauthenticated match create denied.
- Viewer create denied.
- Scorer create allowed.
- Viewer score update denied.
- Scorer score update allowed.
- User cannot change own role through client.
- Missing user profile fallback behavior tested.

## Responsive QA

- Login mobile.
- Register mobile.
- Dashboard mobile.
- Match creation wizard mobile.
- Fixed wizard footer does not cover content.
- Opening setup mobile.
- Scoring mobile portrait.
- Scoring mobile landscape.
- Public live mobile.
- Public scorecard mobile.

