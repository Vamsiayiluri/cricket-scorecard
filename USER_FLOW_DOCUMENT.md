# CricVelo User Flow Document

## Primary Roles

- Scorer: creates matches and performs live scoring.
- Viewer: signs in and follows matches.
- Public spectator: opens shared live or scorecard links without signing in.
- Admin: defined as a role but has no separate UI yet.

## Authentication Flow

```mermaid
flowchart TD
  Open["Open app"] --> AuthCheck["Firebase auth check"]
  AuthCheck -->|No user| Login["Login page"]
  Login --> Email["Email/password login"]
  Login --> Google["Google login"]
  Email --> Verified{"Email verified?"}
  Verified -->|Yes| Dashboard["Dashboard"]
  Verified -->|No| SendVerify["Send verification email"]
  Google --> Dashboard
  Login --> Register["Register"]
  Register --> CreateViewer["Create viewer profile"]
  CreateViewer --> SendEmail["Send verification email"]
```

Issues:

- Forgot password link points to registration, not a password reset.
- Google sign-in creates scorer profiles by default through legacy profile behavior.

## Scorer Match Creation Flow

```mermaid
flowchart TD
  Dashboard["Dashboard"] --> Create["Create Match"]
  Create --> Details["Step 1: Match Details"]
  Details --> Teams["Step 2: Teams and Players"]
  Teams --> Toss["Step 3: Toss"]
  Toss --> Rules["Step 4: Scoring Rules"]
  Rules --> Notes["Step 5: Notes and Visibility"]
  Notes --> Review["Step 6: Review"]
  Review --> Save["Create Firestore Match"]
  Save --> Opening["Opening Players and Bowler"]
  Opening --> Score["Live Scoring Console"]
```

Draft behavior:

- Meaningful wizard input is autosaved to localStorage.
- Returning users can restore or discard the draft.

## Opening Setup Flow

```mermaid
flowchart TD
  MatchCreated["Scheduled match"] --> Determine["Determine batting team from toss"]
  Determine --> SelectStriker["Select striker"]
  SelectStriker --> SelectNonStriker["Select non-striker"]
  SelectNonStriker --> SelectBowler["Select opening bowler"]
  SelectBowler --> Start["Start match"]
  Start --> InProgress["status = in-progress"]
  InProgress --> ScoreCard["/score-card?matchId"]
```

Issues:

- Same player can potentially be selected for both batting slots.
- Opening setup does not appear to validate unavailable bowlers beyond team selection.

## Ball-by-Ball Scoring Flow

```mermaid
flowchart TD
  Score["Scoring console"] --> Extras["Optional extras toggle"]
  Extras --> Runs["Select runs 0-6"]
  Runs --> Wicket{"Wicket selected?"}
  Wicket -->|No| Apply["Apply score mutation"]
  Wicket -->|Yes| WicketDialog["Resolve wicket dialog"]
  WicketDialog --> Apply
  Apply --> History["Push undo snapshot"]
  Apply --> Local["Update local reducer"]
  Local --> Persist["Queue Firestore write"]
  Persist --> Viewer["Public viewer updates"]
  Local --> Over{"Over complete?"}
  Over -->|Yes| Bowler["Select next bowler"]
  Local --> Innings{"Max overs or 10 wickets?"}
  Innings -->|Yes| End["End innings"]
```

## End of First Innings Flow

```mermaid
flowchart TD
  End["End innings"] --> Flush["Flush pending writes"]
  Flush --> Summary["Show innings summary"]
  Summary --> ViewCard["View scorecard"]
  ViewCard --> StartSecond["Start 2nd innings"]
  StartSecond --> Patch["Patch scoreCard.currentInning = 2"]
  Patch --> Opening2["Opening setup for second innings"]
```

Issue:

- The first innings flow exists, but final match completion after second innings is not robustly represented.

## Second Innings and Result Flow

Current intended path:

```mermaid
flowchart TD
  Setup2["Second innings setup"] --> Score2["Score second innings"]
  Score2 --> Target["Target calculation shown"]
  Score2 --> End2["End innings or view scorecard"]
  End2 --> Result["Outcome helper displays winner or tie"]
```

Observed gap:

- The code can display a final scorecard outcome helper, but no reliable status transition to `completed` was found in the active scoring path.

## Public Spectator Flow

```mermaid
flowchart TD
  Link["Shared link"] --> Route{"Route type"}
  Route --> Live["/live/:matchId"]
  Route --> Scorecard["/scorecard/:matchId"]
  Live --> Public{"isPublic?"}
  Scorecard --> Public
  Public -->|No| Error["Not publicly available"]
  Public -->|Yes| Subscribe["Firestore realtime document listener"]
  Subscribe --> ReadOnly["Read-only live display"]
```

## Match Management Flow

```mermaid
flowchart TD
  Dashboard["Dashboard match item"] --> Actions["Actions menu or details"]
  Actions --> Details["Match details"]
  Details --> Share["Open share links"]
  Details --> Visibility["Toggle public/private"]
  Details --> Edit{"Scheduled?"}
  Edit -->|Yes| EditPage["Edit match structure"]
  Edit -->|No| SafeOnly["Only safe fields"]
  Details --> Archive["Archive match"]
```

## Viewer Authenticated Flow

```mermaid
flowchart TD
  Register["Register"] --> ViewerRole["role = viewer"]
  ViewerRole --> Login["Login"]
  Login --> Dashboard["Dashboard"]
  Dashboard --> Match["Open match"]
  Match --> PublicRoute["Live or scorecard route"]
```

Viewer restrictions:

- Cannot create matches.
- Cannot score.
- Cannot edit.

## Missing Flows

- Tournament creation to fixtures to points table
- Team manager squad administration
- Player profile and statistics
- Auction setup to bidding to sold players
- Admin user role promotion
- Password reset
- Match restore/delete
- Export scorecard

