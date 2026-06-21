# CricVelo Project Overview

## Product Vision

CricVelo is a modern cricket match management and live scoring platform. The requirements document describes a sports-tech SaaS product for organizers, scorers, team managers, spectators, and future tournament administrators. The current repository implements the core match scoring slice of that vision: authentication, dashboard, guided match setup, live scoring, public live viewing, and public scorecards.

The intended long-term product includes:

- Match creation and management
- Ball-by-ball live scoring
- Professional scorecards
- Public live match pages
- Team and player administration
- Tournament fixtures and points tables
- Sports analytics and broadcast-style experiences
- Future auction or tournament operations

The current app is not yet a complete tournament or auction platform. It is a React/Firebase single-page application focused on match creation, scoring, and sharing.

## Current Tech Stack

- Frontend: React 18, Vite 6, JavaScript
- UI: Material UI v6, Emotion
- Routing: `react-router-dom` v7
- State: React context, local component state, small Redux Toolkit store
- Backend: Firebase Authentication and Cloud Firestore
- Build tooling: Vite, ESLint
- Database: Firestore collections configured through client SDK

## Repository Tree

```text
cricket-scorecard/
|-- docs/
|   |-- auth-architecture.md
|   |-- firebase-architecture.md
|   |-- firestore-security-strategy.md
|   |-- live-viewer-architecture.md
|   |-- match-lifecycle.md
|   |-- route-protection.md
|   |-- scoring-*.md
|   `-- UI/design notes
|-- public/
|   `-- vite.svg
|-- src/
|   |-- assets/
|   |-- components/
|   |   |-- auth/
|   |   |-- Dashboard/
|   |   |-- match/
|   |   |-- MatchCreation/
|   |   |-- ui/
|   |   `-- viewer/
|   |-- config/
|   |-- constants/
|   |-- context/
|   |-- helpers/
|   |-- hooks/
|   |   `-- firebase/
|   |-- layout/
|   |-- pages/
|   |-- services/
|   |   `-- firebase/
|   |-- store/
|   |   `-- slices/
|   |-- utils/
|   |-- App.jsx
|   |-- firebase-config.js
|   |-- main.jsx
|   |-- theme.js
|   |-- App.css
|   `-- index.css
|-- firestore.rules
|-- firestore.indexes.json
|-- package.json
|-- vite.config.js
`-- CricVelo_requirements.docx
```

## Folder Responsibilities

### `docs/`

Contains prior architecture, lifecycle, security, design, testing, and scoring notes. These documents are valuable project memory and show a phased roadmap. They define the intended Firebase architecture, route protection, match lifecycle, sharing model, scoring persistence strategy, and UI design direction.

Dependencies: none at runtime.

Interactions: informs implementation but is not imported by app code.

### `src/assets/`

Static Vite/React starter assets. Currently not significant to the product.

### `src/components/auth/`

Authentication status components:

- `AuthLoadingScreen.jsx`: loading state while Firebase auth/profile initializes.
- `UnauthorizedState.jsx`: permission-denied UI for viewer users attempting scorer-only routes.

Dependencies: MUI, app UI components.

Interactions: used by `ProtectedRoute` and `ScorerRoute`.

### `src/components/Dashboard/`

Dashboard cards and match list sections. They display total/ongoing/upcoming/completed stats, recent activity, and match action menus.

Dependencies: `useAuth`, `matchDisplay` utilities, shared UI components, `MatchActionsMenu`.

Interactions: composed by `DashboardPage.jsx`.

### `src/components/match/`

Core scoring and scorecard UI. This is the most business-critical folder.

Major responsibilities:

- Pre-match opening batter and bowler selection
- Ball input actions
- Extras and wicket dialog
- Over and innings transition
- Batting and bowling scorecard tables
- Full match scorecard display
- Share dialog and match actions

Dependencies: MUI, scoring helper, scoring persistence hooks, match display utilities, Firebase services.

Interactions: used by `MatchScoring`, `/score-card`, public scorecard components, and dashboard action menus.

### `src/components/MatchCreation/`

Guided six-step match creation wizard:

1. Match details
2. Teams and players
3. Toss
4. Scoring rules
5. Notes and visibility
6. Review

Dependencies: validation utilities, match creation constants, shared UI components.

Interactions: used by `MatchCreationPage.jsx` and `EditMatchPage.jsx`.

### `src/components/ui/`

Reusable app-level UI primitives:

- `AppButton`
- `AppCard`
- `AppDialog`
- `AppInput`
- `EmptyState`
- `ErrorState`
- `LoadingState`
- `PageContainer`
- `StatusBadge`

Dependencies: MUI.

Interactions: used throughout pages and feature components.

### `src/components/viewer/`

Read-only public match views:

- `LiveScoreboard.jsx`
- `PublicMatchScorecard.jsx`

Dependencies: match scorecard components, match display utilities, realtime match hook.

Interactions: used by `/live/:matchId` and `/scorecard/:matchId`.

### `src/config/`

Runtime environment config. `env.js` reads Vite env vars and supplies Firebase fallback values.

Risk: Firebase config fallbacks are committed in source. Firebase client config is usually public, but production projects should still use environment variables and restrict Firestore rules carefully.

### `src/constants/`

Match creation constants including wizard steps, match types, min/max players, min/max overs, and empty form shape.

### `src/context/`

Global React contexts:

- `AuthContext`: Firebase auth session, profile, role, permissions.
- `ToastContext`: snackbar notifications.
- `ThemeModeContext`: light/dark toggle state.

Dependencies: Firebase auth/user services, role utilities, MUI.

### `src/helpers/`

Scoring mutation helpers. `updateScorecard.js` contains core in-memory cricket scoring logic for runs, extras, overs, strike rotation, bowler stats, and wicket entry support.

Risk: mutates nested objects directly, making correction/history and race debugging harder.

### `src/hooks/`

Custom hooks:

- `useScoringPersistence`: latest-write-wins persistence queue with localStorage recovery.
- `useScoringHistory`: bounded local undo/redo stack.

### `src/hooks/firebase/`

Firestore subscription hooks:

- `useRealtimeCollection`
- `useFirestoreDocument`
- `useLiveMatch`
- `useDashboardMatches`

### `src/layout/`

`AppShell.jsx` owns the top app bar, side navigation, logo, theme toggle, profile menu, and public/auth page layout decisions.

### `src/pages/`

Route-level screens:

- Auth pages
- Dashboard
- Match creation
- Match setup/scoring shell
- Match details and edit
- Public live and scorecard pages
- Protected route wrappers

### `src/services/`

Firebase service layer and a legacy facade:

- `firebaseServices.js`: backward-compatible wrapper.
- `services/firebase/*`: auth, user, match, scoring, dashboard, team, player helpers.

### `src/store/`

Redux Toolkit store with `user` and `match` slices.

Current usage is limited. Auth source of truth is `AuthContext`, and match source of truth is Firestore plus local scoring state.

### `src/utils/`

Small reusable utilities:

- Role labels and role checks
- Match display formatting
- Match creation validation
- Match creation draft persistence
- Scoring diagnostics

## Major File Inventory

| File | Purpose | Inputs | Outputs | Dependencies | Potential Issues |
|---|---|---|---|---|---|
| `src/main.jsx` | App bootstrap and provider composition | DOM root | React app | Redux, MUI theme, contexts | Theme mode is local only, not persisted |
| `src/App.jsx` | Route table and lazy loading | URL | Page component | Router, route guards | Legacy `/score-card` and `/start-match` query routes are less clean than path params |
| `src/firebase-config.js` | Firebase app and Firestore init | Env config | Firestore `db` | Firebase SDK | No Auth emulator or environment validation |
| `src/config/env.js` | Firebase env fallbacks | Vite env vars | Firebase config | Vite | Production config embedded as fallback |
| `src/theme.js` | MUI theme and component overrides | mode | MUI theme | MUI | Strong dark/purple visual dominance, negative letter spacing |
| `src/layout/AppShell.jsx` | Navigation and layout shell | route/auth context | app chrome | MUI, router, auth | Search and notifications are visual only |
| `src/context/AuthContext.jsx` | Auth session, profile, role | Firebase auth state | auth context | auth/user services | Legacy missing profiles default to scorer |
| `src/pages/LoginPage.jsx` | Email and Google login | email/password | session and redirect | auth service | "Forgot password" links to register, remember device is visual only |
| `src/pages/RegisterPage.jsx` | Viewer registration | email/password | viewer profile | auth/user services | No password strength, no redirect to login after success |
| `src/pages/DashboardPage.jsx` | Main operations dashboard | Firestore matches | dashboard cards | realtime hook | No pagination/search behavior despite search UI |
| `src/pages/MatchCreationPage.jsx` | Six-step match wizard | form state | match document | validation, draft, save service | Autosave local only, relies on old facade |
| `src/pages/EditMatchPage.jsx` | Pre-match edit and safe fields | match doc | Firestore patch | live match hook | Completed edit route available but structural fields disabled |
| `src/pages/MatchDetailsPage.jsx` | Match control center | match id | details/actions | live match hook, match service | Archive only, no restore/delete UI |
| `src/pages/MatchScoring.jsx` | Opening setup route | match id | start match write | live match hook | Uses realtime listener before scoring, then switches to local scoring page |
| `src/components/match/ScoreCard.jsx` | Active scoring console | match id, ball input | local state and Firestore writes | scoring hooks, helper | Large component, nested mutation, status never completed |
| `src/helpers/updateScorecard.js` | Scoring business logic | scoreCard/action/payload | mutated scoreCard | diagnostics | `ADD_WICKET` path references missing `scoreCard.bowlers` and `updateOvers` is undefined |
| `src/components/match/Selectbatsman.jsx` | Wicket resolution | current innings, wicket type | updated batsmen/wickets | scoring helper | Wicket type handling incomplete for all cricket dismissal edge cases |
| `src/hooks/useScoringPersistence.js` | Queue scorer writes | match payload | Firestore update | scoring service | Full-document writes and localStorage recovery need conflict policy |
| `src/services/firebase/matchService.js` | Match CRUD | form/match id | Firestore docs | Firestore SDK | Uses JS `Date` instead of server timestamps |
| `firestore.rules` | Security rules | request/auth/resource | allow/deny | Firestore | Public read function uses `resource`, which is unsafe for non-existing docs |

## Product Maturity Summary

The application has a strong foundation for a single-match scoring MVP. Authentication, role-aware routes, match creation, dashboard, live scoring, and public viewing are present. The biggest gaps are correctness hardening, tournament/team/player first-class modules, auction absence, admin tooling, automated tests, and production QA.

