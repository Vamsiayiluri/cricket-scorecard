# CricVelo — Feature Status Matrix
**Date:** June 19, 2026

---

## SECTION 1 — FULLY IMPLEMENTED

| # | Feature | Location |
|---|---|---|
| 1 | Email / password authentication | LoginPage, authService |
| 2 | Google OAuth login | LoginPage, authService |
| 3 | Email verification requirement | LoginPage, authService |
| 4 | Password reset via email | LoginPage, authService |
| 5 | User registration (Viewer role default) | RegisterPage, authService |
| 6 | Role-based routing (Viewer / Scorer) | ProtectedRoute, ScorerRoute |
| 7 | Dashboard overview tiles (Total / Live / Upcoming / Completed) | MatchOverviewCard |
| 8 | Dashboard — Ongoing matches list | OngoingMatchesCard |
| 9 | Dashboard — Upcoming matches list | UpcomingMatchesCard |
| 10 | Dashboard — Completed matches list | CompletedMatchesCard |
| 11 | Dashboard — Recent activity | RecentActivityCard |
| 12 | Match creation wizard (6-step) | MatchCreationPage, all MatchCreation/* |
| 13 | Match details form (title, teams, type, date, venue) | MatchDetailsForm |
| 14 | Playing XI entry with Add / Delete | TeamsSetupForm |
| 15 | Captain designation per team | TeamsSetupForm |
| 16 | Wicketkeeper designation per team | TeamsSetupForm |
| 17 | Duplicate player detection | TeamsSetupForm |
| 18 | Toss winner + decision entry | TossDetailsForm |
| 19 | Scoring rules (overs, wide runs, no-ball runs) | ScoringRulesForm |
| 20 | Match notes field | NotesForm |
| 21 | Public / Private visibility toggle | NotesForm |
| 22 | Preview step with validation summary | PreviewMatch |
| 23 | Wizard step validation (per step) | matchCreationValidation.js |
| 24 | Draft auto-save to localStorage | MatchCreationPage |
| 25 | Draft recovery banner on reload | MatchCreationPage |
| 26 | Opening batsmen selection (Striker / Non-striker) | StartMatch |
| 27 | Opening bowler selection | StartMatch |
| 28 | Live ball-by-ball scoring console | ScoreCard / MatchScoring |
| 29 | Run input buttons (0–6) | ScoreCard |
| 30 | Boundary flash animation (4 = cyan, 6 = purple) | ScoreCard |
| 31 | Extras toggle (Wide, No-ball, Bye, Leg-bye) | ScoreCard |
| 32 | Wicket flag with batsman replacement dialog | ScoreCard, SelectBatsman |
| 33 | Extras mutual exclusion logic | updateScorecard.js |
| 34 | Striker rotation on odd runs | updateScorecard.js |
| 35 | Striker rotation on over completion | updateScorecard.js |
| 36 | Over progression counter | updateScorecard.js |
| 37 | Bowler change dialog at end of over | SelectBowler |
| 38 | Undo stack (per-inning snapshots) | useScoringPersistence.js |
| 39 | Redo stack | useScoringPersistence.js |
| 40 | Correct Last Ball button with confirmation | ScoreCard |
| 41 | Current Run Rate display | ScoreCard |
| 42 | Required Run Rate display (2nd innings) | ScoreCard |
| 43 | Target display (2nd innings) | ScoreCard |
| 44 | Current over delivery pills | CurrentOver |
| 45 | Ball timeline (over history) | BallTimeline |
| 46 | Batting scorecard table (R, B, 4s, 6s, SR) | BattingScoreCard |
| 47 | Bowling scorecard table (O, R, W, Eco) | BowlingScoreCard |
| 48 | Striker / Current bowler visual marking | BattingScoreCard, BowlingScoreCard |
| 49 | Live scoreboard overlay panel | ScoreCard left panel |
| 50 | Extras summary in live console (W, Nb, B, Lb) | ScoreCard |
| 51 | Save status indicator (Saving / Saved / Failed) | ScoreCard |
| 52 | Retry Save on failed writes | ScoreCard, useScoringPersistence.js |
| 53 | Beware-on-unload (pending writes guard) | useScoringPersistence.js |
| 54 | End of innings screen with target | EndOfInnings |
| 55 | Match completion detection (target, all out, max overs) | updateScorecard.js |
| 56 | Final scorecard (accordion innings view) | BattingScoreCard, BowlingScoreCard |
| 57 | Match Details page (status, visibility, archive) | MatchDetailsPage |
| 58 | Archive match (soft delete) | MatchDetailsPage, matchService |
| 59 | Toggle public / private from Match Details | MatchDetailsPage, matchService |
| 60 | Edit match page (pre-match only) | EditMatchPage |
| 61 | Public live match page (/live/:matchId) | LiveMatchPage |
| 62 | Public scorecard page (/scorecard/:matchId) | PublicScorecardPage |
| 63 | Real-time live scoreboard (auto-refresh) | LiveScoreboard |
| 64 | Public match scorecard accordion | PublicMatchScorecard |
| 65 | Share match dialog (live + scorecard links) | ShareMatchDialog |
| 66 | Copy link to clipboard | ShareMatchDialog |
| 67 | Native Web Share API | ShareMatchDialog |
| 68 | Firestore real-time sync | Firebase services |
| 69 | Firestore security rules (role-aware) | firestore.rules |
| 70 | Dark / Light mode | Theme system |
| 71 | Mobile-responsive layout | All components |
| 72 | Toast notifications | All user actions |

---

## SECTION 2 — PARTIALLY IMPLEMENTED

| # | Feature | What Works | What's Missing |
|---|---|---|---|
| 1 | Admin role | Role defined in constants + Firestore rules | No admin panel, no user management UI, functionally identical to Scorer |
| 2 | Player of the Match | End of match screen exists | Hardcoded "To be announced" — no selection flow |
| 3 | Match types (T20 / ODI / Test / T10) | Dropdown in creation wizard | No format-specific game logic differences |
| 4 | Extras: Byes / Leg-byes | Scored and counted | No separate bowler-run exclusion display for byes/leg-byes |
| 5 | Dismissal entry | SelectBatsman dialog exists | No dismissal type (Bowled, LBW, Caught, Run Out, Stumped) tracked |
| 6 | Match notes | Entry form exists | Notes never displayed in scorecard, public view, or match details |
| 7 | Ball-by-ball extra detail (runs on wide/nb) | Wide and no-ball counted | Batter runs on wide hit for four not individually tracked |
| 8 | Match editing | Form exists on EditMatchPage | Fully locked when in-progress; no safe partial-field editing |

---

## SECTION 3 — NOT IMPLEMENTED

### Critical Missing (Blocks Quality Launch)

| # | Feature |
|---|---|
| 1 | Dismissal type selection (Bowled, Caught, LBW, Run Out, Stumped, Hit Wicket) |
| 2 | Fielder name capture (Caught by / Run Out by) |
| 3 | Player of the Match selection flow |
| 4 | Fall of Wickets table in scorecard |
| 5 | Free hit indicator after no-ball |
| 6 | End Innings protection (double-confirm or text entry) |
| 7 | Result share card (image export for WhatsApp / social) |
| 8 | Extras breakdown in public/completed scorecard |
| 9 | Match notes display in scorecard/public view |
| 10 | PWA manifest + service worker |

### High Priority Missing (Required for Growth)

| # | Feature |
|---|---|
| 11 | Team persistence (save team, reuse across matches) |
| 12 | Tournament creation and management |
| 13 | Points table / league standings |
| 14 | Knockout bracket support |
| 15 | Match discovery (public feed, search) |
| 16 | Push notifications (match start, milestones) |
| 17 | Scorecard PDF export |
| 18 | Powerplay over marking |
| 19 | Partnership records |
| 20 | Over-by-over run chart |
| 21 | Admin panel (user management) |
| 22 | Player profiles with career statistics |

### Medium Priority Missing

| # | Feature |
|---|---|
| 23 | Wagon wheel / scoring chart |
| 24 | Net Run Rate calculation |
| 25 | Super-over handling |
| 26 | Strategic timeout / drinks break tracking |
| 27 | Scorecard embed widget |
| 28 | Live commentary text input |
| 29 | Multiple scorers per match (co-scorer) |
| 30 | Scorer invitation and handover |
| 31 | Venue database (reusable grounds) |
| 32 | Match categories / tags / event labels |
| 33 | Team leaderboards (top scorer, top wicket-taker) |
| 34 | Social reactions on scorecard (likes, claps) |
| 35 | Spectator / view count on public matches |

### Low Priority / Future Platform

| # | Feature |
|---|---|
| 36 | Team logos and colors |
| 37 | User profile pictures |
| 38 | Live stream integration (YouTube overlay) |
| 39 | D/L method for rain-affected matches |
| 40 | Abandoned / No Result match status |
| 41 | Match chat / commentary thread |
| 42 | DRS / review system |
| 43 | API / webhooks for external integrations |
| 44 | Multi-language support |
| 45 | WhatsApp bot integration |
| 46 | CricVelo Pro subscription tier |
| 47 | Organizer branding (logo, colors, tournament page) |
| 48 | Public tournament microsites |
| 49 | Advanced analytics dashboard |
| 50 | Ball speed / pitch map |

---

## SECTION 4 — FEATURES USERS MAY NEVER DISCOVER

| Feature | Discovery Problem | Fix |
|---|---|---|
| Public/Private toggle | Buried in Step 4 (Notes) of wizard | Surface on Match Details page more prominently |
| Share button | Only in Match Details — not on dashboard | Add share icon directly to dashboard match cards |
| Archive matches | No "Archived" section on dashboard | Add archive tab to dashboard |
| Correct Last Ball | Unclear label vs. Undo | Rename with tooltip explaining difference |
| Draft recovery | Only shown if draft exists | Add subtle "drafts" indicator to navbar |
| Match notes | Never shown after creation | Display in match details and scorecard |
| Match editing | No edit button from dashboard | Add pencil icon to scheduled match cards |
| Admin role | No path to elevate account | Needs admin panel to assign roles |

---

*Matrix generated June 19, 2026 for CricVelo pre-launch review.*
