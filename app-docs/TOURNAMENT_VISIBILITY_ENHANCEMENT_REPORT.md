# Tournament Visibility Enhancement Report

## Files Changed

- `firestore.rules`
- `src/App.jsx`
- `src/hooks/firebase/useDiscoverMatches.js`
- `src/hooks/firebase/usePublicTournaments.js`
- `src/layout/AppShell.jsx`
- `src/pages/DiscoverPage.jsx`
- `src/pages/TournamentDetailsPage.jsx`
- `src/pages/TournamentsPage.jsx`
- `src/services/firebase/constants.js`
- `src/services/firebase/discoveryService.js`
- `src/services/firebase/tournamentService.js`

## Firestore Rule Changes

- Public tournament documents remain readable by anyone when `isPublic == true`.
- Private tournament documents remain readable only by the owner or an admin.
- Tournament update/delete is restricted to the tournament owner or admin.
- Fixture create/update/delete is now restricted to the tournament owner or admin.
- Public tournament fixtures are readable by unauthenticated users, viewers, and scorers.
- Match reads now allow linked matches when `match.tournamentId` points to a public tournament, so public tournament standings, statistics, and match links can load even when match visibility was not separately set to public.

## Navigation Changes

- `/tournaments` and `/tournaments/:tournamentId` now use `ProtectedRoute` instead of `ScorerRoute`, allowing authenticated viewers to browse public tournaments.
- Viewer sidebar now includes a `Tournaments` navigation item.
- `/t/` was added to public route prefixes so unauthenticated public tournament pages render as public pages.

## Listing Changes

- Scorers see:
  - `My Tournaments`
  - `Public Tournaments`
- Viewers see:
  - `Public Tournaments`
- Scorer-only creation remains hidden from viewers.
- Tournament detail management controls remain hidden unless the current user is the tournament owner or an admin.

## Discovery Changes

- Added public tournament querying via `buildPublicTournamentsQuery`.
- Added `fetchDiscoverTournaments` to discovery services.
- Added tournament data to `useDiscoverMatches`.
- Added a `Public Tournaments` section to the Discover page with cards linking to `/t/:tournamentId`.

## Validation Results

- Standings visible: validated in public and authenticated tournament detail flows through existing `Standings` tabs backed by linked tournament match reads.
- Fixtures visible: validated in public and authenticated tournament detail flows through existing fixtures tabs and updated fixture read rules.
- Statistics visible: validated in public and authenticated tournament detail flows through existing statistics tabs backed by linked tournament match reads.
- Match links work: fixture and match rows continue to route to `/live/:matchId` for live matches and `/scorecard/:matchId` for non-live matches.
- Ownership enforcement remains intact: UI controls are owner/admin-only, and Firestore rules now enforce owner/admin-only tournament and fixture writes.

## Build Result

- `npm run build`: passed.
- Build completed with the existing Vite large chunk warning.

## Lint Result

- Changed-files ESLint check: passed.
- Full `npm run lint`: failed due existing repository-wide lint issues outside this change set, including unused React imports, missing prop validation, and existing hook warnings in unrelated files.
