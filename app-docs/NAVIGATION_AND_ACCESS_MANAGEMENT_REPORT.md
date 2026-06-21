# Navigation And Access Management Report

## Files Changed

- `firestore.rules`
- `src/App.jsx`
- `src/layout/AppShell.jsx`
- `src/pages/ScorerRequestsPage.jsx`
- `src/services/firebase/constants.js`
- `src/services/firebase/matchAccessService.js`

Note: `PRODUCT_POLISH_SPRINT_1_REPORT.md`, `PROJECT_CONTEXT.md`, and `CODEX_GUIDE.md` were already deleted in the working tree and could not be read. They were not restored or modified.

## Navigation Changes

- Authenticated users now keep the AppShell sidebar on public-style routes:
  - `/live/:matchId`
  - `/scorecard/:matchId`
  - `/t/:tournamentId`
  - `/discover`
  - `/results`
- Unauthenticated users still get public chrome on public routes.
- Added `/results` route using the existing discover/results surface.
- Added `/become-scorer` route to the dashboard/scorer-request flow.
- Scorer sidebar keeps `Create Match` directly below `Dashboard`.
- `Create Match` is styled as a primary sidebar/mobile action.
- Viewer sidebar now contains:
  - Dashboard
  - Live Matches
  - Tournaments
  - Results
  - Become a Scorer
- Removed viewer `Notifications` from sidebar navigation.

## Firestore Rule Changes

- Added `match_access_requests` rules:
  - Scorers can create requests for themselves.
  - Request creation must reference a real match whose `createdBy` matches `matchOwnerUid`.
  - Requesters can read their own requests.
  - Match owners can read requests for their matches.
  - Match owners can approve/reject by changing only `status`, `resolvedAt`, and `resolvedBy`.
  - Admins can read/update requests.
- Added `scorer_requests` rules:
  - Users can create their own pending scorer request.
  - Users can read their own scorer request.
  - Admins can read and resolve scorer requests.
- Updated `users` rules:
  - Admins can update user profiles for scorer approval.
  - Self role escalation is no longer allowed by the rule expression.
- Updated `matches` rules:
  - Match collaborators can read private matches where they are listed in `collaboratorUids`.
  - Approved collaborators can perform scoring-safe updates while management fields remain unchanged.
  - Owners/admins retain full allowed match management permissions.

## Collaborator Model

- Approval adds the requester UID to `matches.collaboratorUids`.
- Client access remains based on `canAccessMatch(match, uid)`.
- Firestore now enforces collaborator access server-side.
- Collaborators can update score/status/result-style match data without changing protected management fields:
  - `createdBy`
  - `collaboratorUids`
  - `isPublic`
  - `archivedAt`
  - `deletedAt`
  - `matchDetails`
  - `teams`
  - `tossDetails`
  - `scoringRules`

## Access Workflow Changes

- `approveMatchAccess()` now uses a Firestore batch.
- Approval no longer risks adding a collaborator without resolving the request document.
- `requestMatchAccess()` checks for an existing pending request for the same match/user before creating a new request.
- Regular scorers now see only match access requests on the requests page.
- Admins see scorer role requests and match access requests.

## Validation Results

- Owner sees requests: code path restored by `match_access_requests` owner read rules.
- Requester sees status: code path restored by requester read rules.
- Approve flow: atomic batch updates request status and `matches.collaboratorUids`.
- Reject flow: owner/admin can update request status to rejected.
- Collaborator can score: match rules now allow collaborator scoring-safe updates.
- Non-approved scorer cannot score: match update rules require owner/admin or existing collaborator UID.
- Sidebar visible on authenticated public and protected pages by setting `showSidebar = isAuthenticated`.
- Create Match visible in scorer desktop and mobile navigation.
- Desktop/mobile navigation paths are valid for scorer and viewer nav items.

Validation was performed by code inspection, targeted ESLint, and production build. Firestore emulator tests were not present in the repo and were not run.

## Build Result

- `npm run build`: passed.
- Existing Vite large chunk warning remains.

## Lint Result

- Changed-files ESLint check: passed.
- Full `npm run lint`: failed due pre-existing unrelated lint issues in files outside this sprint, including unused React imports, missing prop validation, and existing hook warnings.
