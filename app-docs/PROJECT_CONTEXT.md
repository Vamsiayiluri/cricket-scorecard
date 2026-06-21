# CricVelo Project Context

Start here to understand the product and current architecture. This document reflects the repository state at the time of the audit and consolidates source code plus existing review docs.

## Product Overview

CricVelo is a real-time cricket scorekeeping web application for grassroots, school, corporate, and community cricket. The app supports scorers who create and score matches, authenticated viewers who browse match dashboards, and public fans who open shareable live/scorecard links.

The current product is strongest as a single-match scoring and viewing MVP. It is not yet a tournament platform: tournaments, reusable teams, season statistics, standings, organizer dashboards, and growth mechanics remain roadmap items.

## Tech Stack

- Frontend: React 18, Vite 6, JavaScript ES modules.
- Routing: `react-router-dom` v7 style routes.
- UI: MUI v6, Emotion, MUI icons, custom shared UI wrappers.
- State: React local state/hooks, Context, Redux Toolkit store.
- Backend: Firebase Auth and Cloud Firestore.
- Hosting: Firebase Hosting from `dist`.
- Tooling: ESLint 9, Vite build.

## Folder Structure

- `src/App.jsx`: route tree and lazy page loading.
- `src/main.jsx`: provider composition, Redux, theme, auth, toast.
- `src/firebase-config.js`: Firebase app and Firestore initialization.
- `src/config`: environment validation/access.
- `src/context`: auth, theme mode, toast contexts.
- `src/layout`: global application shell.
- `src/pages`: route-level screens.
- `src/components/auth`: auth loading and unauthorized states.
- `src/components/Dashboard`: dashboard cards and match lists.
- `src/components/MatchCreation`: match wizard forms and recovery UI.
- `src/components/match`: opening setup, live scoring, scorecards, sharing.
- `src/components/viewer`: public/live read-only scorecard surfaces.
- `src/components/ui`: shared button, card, dialog, input, status, loading, empty, and page containers.
- `src/hooks/firebase`: Firestore document/query subscriptions.
- `src/hooks`: scoring persistence/history hooks.
- `src/services/firebase`: Firebase service layer.
- `src/store`: Redux slices for match/user state.
- `src/utils`: validation, roles, scorecard timeline, display helpers, diagnostics.
- `src/helpers`: scoring mutation helper.
- Root Firebase files: `firebase.json`, `.firebaserc`, `firestore.rules`, `firestore.indexes.json`.

## Architecture

CricVelo is a client-rendered Firebase app. React pages call service functions and hooks, Firebase Auth supplies session/user identity, and Firestore stores match/user/team/player data. Public viewer pages subscribe directly to Firestore documents but render read-only UI. Active scoring deliberately uses a local reducer and queued persistence instead of a live subscription to avoid remote overwrites during ball entry.

## Main User Flows

- Authentication: login/register/Google sign-in through Firebase Auth, then user profile creation in `users/{uid}`.
- Dashboard: authenticated users see match buckets and stats; scorers see create actions.
- Match creation: scorer/admin completes six-step wizard, autosaved to `localStorage`, then creates a Firestore match.
- Opening setup: scorer selects striker, non-striker, and opening bowler; app creates first innings and marks match in progress.
- Live scoring: scorer records deliveries, extras, wickets, bowler changes, undo/redo, and innings completion.
- Innings transition: first innings completion leads to second innings setup with the opposite team batting.
- Match completion: second innings completion persists status/result fields.
- Public viewer: `/live/:matchId` and `/scorecard/:matchId` render read-only scoreboards for public matches.

## User Roles

- `viewer`: default user role. Can access authenticated dashboard and public/allowed scorecards. Cannot create or score matches.
- `scorer`: can create, edit scheduled matches, start/score matches, toggle visibility, and archive.
- `admin`: currently equivalent to scorer for app and rules access.
- Organizer: product role is planned but not implemented as a separate data model or route set.

## Routing Structure

- Public:
  - `/live/:matchId`
  - `/scorecard/:matchId`
  - `/login`
  - `/register`
- Authenticated:
  - `/`
  - `/dashboard`
  - `/matches/:matchId`
- Scorer/admin:
  - `/create-match`
  - `/matches/:matchId/edit`
  - `/start-match?matchId=...`
  - `/score-card?matchId=...`
  - `/start-second-innings?matchId=...`
- Fallback:
  - `*` redirects to `/dashboard`.

## Firestore Collections

- `users`: auth profile and role documents keyed by Firebase Auth UID.
- `matches`: primary match, team snapshot, toss, rules, scorecard, lifecycle, and public visibility documents.
- `teams`: available in rules/services, not a fully developed reusable team feature.
- `players`: available in rules/services, not a fully developed reusable player feature.

## Match Lifecycle

1. `scheduled`: created by match wizard, editable structurally.
2. `in-progress`: opening setup creates `scoreCard.currentInning = 1` and first innings.
3. First innings ends by max overs, all out, or manual action.
4. Second innings setup appends innings 2 and sets `currentInning = 2`.
5. Match completes when chase target is reached, second innings max overs are reached, or second innings all out.
6. `completed`: result fields are persisted by completion helpers.
7. Optional lifecycle overlays: `archivedAt`, `deletedAt`, `lifecyclePhase`.

## Scoring Lifecycle

- `StartMatch.jsx` initializes innings state.
- `ScoreCard.jsx` owns active scoring reducer and local match state.
- `ScoringActions.jsx` captures delivery input and wicket dialog flow.
- `updateScorecard.js` mutates scorecard statistics.
- `useScoringHistory.js` stores undo/redo snapshots.
- `useScoringPersistence.js` queues latest-write-wins Firestore persistence and recovers failed writes from `localStorage`.
- `scorecardTimeline.js` normalizes recent-ball and over-history storage.
- `matchDisplay.js` derives and persists completion/result summaries.

## Current Roadmap

Wave 1: stabilize MVP scoring correctness, auth/rules safety, public scorecards, and release QA.

Wave 2: improve match management, reusable teams/players, scorer convenience, result sharing, and viewer discovery.

Wave 3: add organizer/tournament primitives, fixtures, standings, NRR, brackets, and tournament public pages.

Wave 4: growth and monetization features such as profiles, leaderboards, analytics, sponsor pages, media cards, and premium organizer tools.
