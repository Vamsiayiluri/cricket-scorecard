# CricVelo Feature Status

This document consolidates implemented, partial, and missing functionality from source audit and existing product reviews.

## Implemented

| Feature | Priority | Status | Dependencies |
| --- | --- | --- | --- |
| Firebase Auth login/register | P0 | Implemented | Firebase Auth, `AuthContext` |
| Google sign-in wrapper | P1 | Implemented | Firebase Auth popup |
| Email verification gate | P0 | Implemented | `ProtectedRoute` |
| User profile creation | P0 | Implemented | `userService`, `users/{uid}` |
| Role-based protected routes | P0 | Implemented | `ScorerRoute`, Firestore rules |
| Dashboard match buckets | P0 | Implemented | `useDashboardMatches`, `dashboardService` |
| Match creation wizard | P0 | Implemented | Match creation components, validation |
| Match creation draft recovery | P1 | Implemented | `localStorage`, draft utils |
| Public/private match toggle | P1 | Implemented | `isPublic`, details/edit pages |
| Scheduled match edit flow | P1 | Implemented | `EditMatchPage`, `patchMatchById` |
| Opening batter/bowler setup | P0 | Implemented | `StartMatch` |
| Live run input | P0 | Implemented | `ScoringActions`, `updateScorecard` |
| Extras input | P0 | Implemented | `ScoringActions`, scoring rules |
| Wicket dialog flow | P0 | Implemented | `Selectbatsman` |
| Bowler rotation | P0 | Implemented | `SelectBowler`, `ScoreCard` |
| Undo/redo scoring snapshots | P1 | Implemented | `useScoringHistory` |
| Queued score persistence | P0 | Implemented | `useScoringPersistence`, Firestore |
| Failed-write local recovery | P0 | Implemented | `localStorage`, retry |
| Innings transition UI | P0 | Implemented | `EndOfInnings`, `StartMatch` |
| Match completion persistence | P0 | Implemented | `persistMatchCompletion`, `matchDisplay` |
| Public live match page | P0 | Implemented | `/live/:matchId`, `useLiveMatch` |
| Public scorecard page | P0 | Implemented | `/scorecard/:matchId` |
| Share match dialog | P1 | Implemented | Public routes |
| Theme mode context | P1 | Implemented | MUI theme factory |
| Shared UI components | P1 | Implemented | `src/components/ui` |

## Partially Implemented

| Feature | Priority | Status | Dependencies |
| --- | --- | --- | --- |
| Cricket scoring correctness | P0 | Partial | More rule validation and tests needed |
| No-ball/wide/byes/leg-byes edge cases | P0 | Partial | `updateScorecard.js` |
| Wicket types and dismissal attribution | P0 | Partial | Wicket dialog lacks dismissal type depth |
| Team-size-aware all-out logic | P0 | Partial | Some helper logic exists, more validation needed |
| Match lifecycle phases | P1 | Partial | `lifecyclePhase` exists but transition model is thin |
| Archive/soft delete | P1 | Partial | Fields and service functions exist, UI coverage limited |
| Admin role | P1 | Partial | Role exists; admin product UI missing |
| Reusable teams/players | P1 | Partial | Collections/services exist; match creation embeds snapshots |
| Public viewer UX | P1 | Partial | Live/scorecard exist; discovery and sharing depth missing |
| Mobile scoring ergonomics | P1 | Partial | Responsive UI exists; needs field testing |
| Automated testing | P0 | Partial/Missing | No dedicated test suite observed in package scripts |
| Firestore security validation | P0 | Partial | Rules exist; schema/ownership constraints missing |

## Missing

| Feature | Priority | Status | Dependencies |
| --- | --- | --- | --- |
| Match ownership/creator model | P0 | Missing | Schema, rules, services |
| Multi-scorer conflict protection | P0 | Missing | Transactions/versioning/locks |
| Comprehensive scoring tests | P0 | Missing | Test setup and fixtures |
| Password reset UI flow | P1 | Missing | `sendResetPasswordEmail` exists |
| Dismissal types | P1 | Missing | Scoring schema and UI |
| Free hit/no-ball advanced rules | P1 | Missing | Cricket rules engine |
| Powerplay support | P1 | Missing | Rules schema and UI |
| Player of the Match | P1 | Missing | Completion workflow |
| Result share image/card | P1 | Missing | Share asset generation |
| Reusable team management | P1 | Missing | Teams module |
| Reusable player profiles | P1 | Missing | Players module |
| Organizer dashboard | P1 | Missing | New role/product module |
| Tournament entity | P1 | Missing | Tournament schema/routes |
| Fixtures and scheduling | P1 | Missing | Tournament engine |
| Points table and NRR | P1 | Missing | Tournament/stat calculations |
| Knockout bracket | P2 | Missing | Tournament UI/data model |
| Public tournament page | P2 | Missing | Public routes and schema |
| Player/team stats across matches | P2 | Missing | Aggregations |
| Search/discovery | P2 | Missing | Query/index design |
| Notifications | P2 | Missing | Messaging/subscriptions |
| Payments/monetization | P2 | Missing | Product platform |
