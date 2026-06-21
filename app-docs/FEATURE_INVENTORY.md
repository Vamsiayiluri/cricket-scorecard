# CricVelo Feature Inventory

## Implemented Features

### Authentication

- Email/password login
- Email/password registration
- Google sign-in
- Email verification send on register/login
- Firebase auth session persistence
- Auth loading screen
- Protected authenticated routes
- Scorer/admin-only route guard
- Viewer role on normal registration
- Legacy no-profile users default to scorer
- Logout from profile menu

Not implemented or incomplete:

- Forgot password flow
- Profile management page
- Admin role management UI
- Remember device behavior
- Account deletion

### Dashboard

- Realtime match dashboard
- Total match count
- Ongoing match count
- Upcoming match count
- Completed match count
- Ongoing matches list
- Upcoming matches list
- Completed matches list
- Recent activity list
- Empty/loading/error states
- Scorer quick action to create match
- Match action menu integration

Incomplete:

- Search bar is visual only
- Notifications are visual only
- No pagination or filtering beyond client-side buckets
- No tournament stats despite product vision

### Match Creation

- Six-step wizard
- Match title
- Team A and Team B names
- Match type selection
- Date/time
- Venue
- Team/player setup
- Captain selection
- Wicketkeeper selection
- Duplicate player prevention per team
- Minimum and maximum player validation
- Toss winner selection
- Toss bat/bowl decision
- Overs per side
- Wide and no-ball run values
- Notes
- Public/private visibility flag
- Review page
- Local draft autosave
- Draft restore/discard banner
- Validation per step and all steps
- Firestore match creation
- Redirect to opening setup after creation

Incomplete:

- No team templates or saved squads
- No import roster feature
- No player identity beyond strings
- No tournament association

### Match Management

- Match details page
- Match public/private toggle
- Share dialog entry points
- Pre-match edit
- Archive match
- Safe edit restrictions for live/completed matches

Incomplete:

- Restore archived match UI exists in service only
- Soft delete service exists but no UI
- No hard delete confirmation flow
- No ownership or assignment of scorer
- No audit log

### Opening Setup

- Determines batting team from toss winner and decision
- Select striker
- Select non-striker
- Select opening bowler
- Starts first innings
- Starts second innings setup after first innings

Potential issue:

- Opening batter selections do not prevent the same player being selected as both striker and non-striker.

### Live Scoring

- Runs 0 through 6
- Wide
- No-ball
- Byes
- Leg byes
- Wicket flag
- Wicket dialog
- Wicket types: Bowled, Caught, Run Out, LBW, Stumped, Hit Wicket
- Fielder selection for caught/run out/stumped
- Next batter selection
- Run-out striker selection
- Batting scorecard
- Bowling scorecard
- Current over display
- Recent ball timeline
- Over history
- Next bowler dialog
- End innings dialog
- Undo
- Redo
- Correct last ball
- Save status indicator
- Retry failed save
- Pending-write unload warning
- LocalStorage recovery for failed scoring writes

Incomplete or risky:

- No maiden over tracking
- No partnership tracking
- No fall-of-wicket table
- No target completion auto-finish
- No match completed status update after second innings
- Multi-scorer conflict handling is not defined
- Some cricket edge cases are incomplete

### Scorecards

- Live current score display
- Batting table
- Bowling table
- Full innings accordion scorecard
- Public read-only scorecard
- Completed match outcome helper
- Player of the match placeholder
- Extras summary
- Strike rate and economy calculations

Incomplete:

- No PDF/export/share image
- No detailed fall-of-wicket
- No partnership chart
- No wagon wheel or advanced analytics

### Public Live Viewer

- `/live/:matchId`
- `/scorecard/:matchId`
- Public/private visibility enforcement in UI
- Realtime Firestore subscription
- Live progress bar
- Recent ball timeline
- Scheduled state
- Completed state

Security note:

- Firestore rules allow public reads for public matches, but signed-in users can read all matches.

### Roles and Permissions

- `admin`
- `scorer`
- `viewer`
- Scorer/admin can create, edit, score, archive, toggle visibility.
- Viewer can access dashboard and public/live scorecard style surfaces.

Incomplete:

- No admin panel
- No role promotion UI
- No match ownership or team-specific authorization

### Team and Player Management

Current:

- Teams and players are embedded in each match.
- Captains and wicketkeepers are selected inside match setup.

Not implemented:

- Team creation page
- Global squad management
- Player records
- Player statistics database
- Team statistics database

### Tournament Management

Present in vision only. No active tournament routes, components, services, or database collections were found.

Missing:

- Tournament creation
- Teams in tournament
- Fixtures
- Match schedules
- Points table
- Standings
- Tournament dashboard

### Auction Flow

No auction implementation found.

Missing:

- Player auction
- Team purse tracking
- Bid history
- Sold/unsold workflows
- Auction dashboard

### Admin Features

Partial:

- `admin` role constant
- Admin treated as scorer in role checks

Missing:

- Admin dashboard
- User management
- Role management
- Match moderation
- Data repair tools
- Audit trail

## Feature Maturity

| Area | Maturity |
|---|---|
| Auth | Medium |
| Dashboard | Medium |
| Match creation | Medium-high |
| Live scoring | Medium |
| Public viewing | Medium |
| Match management | Medium-low |
| Team/player modules | Low |
| Tournament | Not implemented |
| Auction | Not implemented |
| Admin | Low |
| QA automation | Very low |

