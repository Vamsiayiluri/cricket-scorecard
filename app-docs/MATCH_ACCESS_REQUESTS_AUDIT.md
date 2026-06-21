# Match Access Requests Audit

## Current Architecture

The match access request feature is partially implemented in the React/Firebase client.

Entry points:
- Non-owner scorers can request access from:
  - `src/pages/MatchDetailsPage.jsx`
  - `src/pages/EditMatchPage.jsx`
  - `src/components/match/ScoreCard.jsx`
- Match owners can review requests from:
  - The per-match panel in `src/pages/MatchDetailsPage.jsx`
  - The global `Match Access Requests` tab in `src/pages/ScorerRequestsPage.jsx`

Routing:
- `/scorer-requests` is registered in `src/App.jsx`.
- The route uses `ScorerRoute`, so any scorer/admin can open the page.
- The sidebar exposes this page as `Scorer Requests` for scorers in `src/layout/AppShell.jsx`.

Client-side access model:
- `canAccessMatch(match, uid)` grants access if `uid === match.createdBy` or `uid` is in `match.collaboratorUids`.
- New matches initialize `collaboratorUids: []` in `src/services/firebase/matchService.js`.

## Collections Used

Declared collection constants:
- `scorer_requests`
- `match_access_requests`
- `matches`
- `users`

Match access request documents are written to:
- `match_access_requests/{requestId}`

Expected match access request document shape:
- `requestId`
- `matchId`
- `matchTitle`
- `matchOwnerUid`
- `requestedBy`
- `requestedByName`
- `requestedByEmail`
- `status`: `pending`, `approved`, or `rejected`
- `requestedAt`
- `resolvedAt`
- `resolvedBy`

Approval also updates:
- `matches/{matchId}.collaboratorUids`

## Firestore Rules Involved

Current `firestore.rules` has rules for:
- `users`
- `matches`
- `teams`
- `players`
- `matchFollowers`
- `tournaments`
- `imports`
- `notifications`

Current `firestore.rules` does not define rules for:
- `match_access_requests`
- `scorer_requests`
- `scorer_requests` is also used by the first tab on the same page.

Because Firestore denies by default, all direct client reads/writes to `match_access_requests` are blocked unless deployed rules differ from this local file.

Relevant current match update rule:
- `matches/{matchId}` update is allowed only when the authenticated scorer is the match owner via `resource.data.createdBy == request.auth.uid`.
- The rule does not recognize `collaboratorUids`.

## Queries

Request creation:
- `requestMatchAccess(...)` uses `setDoc()` on `match_access_requests/{requestId}`.
- Blocked by current local rules because no `match_access_requests` create rule exists.

Requester lookup:
- `getUserMatchAccessRequest(matchId, userId)` queries:
  - `where("matchId", "==", matchId)`
  - `where("requestedBy", "==", userId)`
- The query shape is reasonable and should not require a composite index because it only uses equality filters and no server-side ordering.
- Blocked by current local rules.

Per-match owner lookup:
- `getMatchAccessRequests(matchId)` queries:
  - `where("matchId", "==", matchId)`
- Used in `MatchDetailsPage`.
- Query shape is reasonable.
- Blocked by current local rules.

Global owner lookup:
- `getMatchAccessRequestsForOwner(ownerUid)` queries:
  - `where("matchOwnerUid", "==", ownerUid)`
- Used by the `Match Access Requests` tab in `ScorerRequestsPage`.
- Query shape is reasonable.
- Blocked by current local rules.

Approval:
- `approveMatchAccess(requestId, matchId, targetUid, resolvedByUid)` performs two separate writes:
  - Adds `targetUid` to `matches/{matchId}.collaboratorUids`
  - Updates `match_access_requests/{requestId}` to `approved`
- The match update can succeed for the owner under current match rules.
- The request update is blocked by current local rules.
- Because this is not a batch/transaction, approval can partially grant collaborator access and still show an error if the match update succeeds but the request update fails.

Rejection:
- `rejectMatchAccess(requestId, resolvedByUid)` updates `match_access_requests/{requestId}`.
- Blocked by current local rules.

## Root Cause Of The Error

The message `Could not load match access requests` is caused by the catch block in `MatchAccessRequests` inside `src/pages/ScorerRequestsPage.jsx`.

The failing call is:
- `getMatchAccessRequestsForOwner(user.uid)`

That call reads `match_access_requests` with:
- `where("matchOwnerUid", "==", user.uid)`

The local Firestore rules have no `match /match_access_requests/{requestId}` block, so Firestore denies the read. The feature page is visible, but the backing collection is not readable by the client.

## Answers

1. Is the feature fully implemented?
   - No.

2. Is it partially implemented?
   - Yes. UI, route wiring, client services, document shapes, and request/approval/rejection calls exist.

3. Is it using a collection that does not exist?
   - It uses `match_access_requests`. Firestore collections are created lazily, but current rules block client writes, so the collection may not exist in production unless documents were seeded or created with elevated privileges.

4. Is Firestore blocking reads?
   - Yes. Local rules do not allow reads from `match_access_requests`.

5. Is the query incorrect?
   - The owner-page query is structurally reasonable: `where("matchOwnerUid", "==", ownerUid)`.
   - The more likely failure is security rules, not query shape or indexing.

6. Is the page visible but not functional?
   - Yes. `/scorer-requests` is visible to scorers, and the `Match Access Requests` tab renders, but its Firestore read is blocked by missing rules.

## Required Fixes

Do not implement yet. Required fixes are:

- Add Firestore rules for `match_access_requests`.
- Allow a scorer to create a request only for themself.
- Allow a requester to read their own request documents.
- Allow a match owner to read requests where `matchOwnerUid == request.auth.uid`.
- Allow a match owner to approve/reject requests for their own matches.
- Consider admin read/write handling if admins should moderate these requests.
- Update `matches/{matchId}` rules so approved collaborators can persist allowed match edits/scoring, not just pass client-side `canAccessMatch`.
- Make `approveMatchAccess` atomic with a write batch or transaction to avoid partial collaborator grants.
- Decide whether `/scorer-requests` should be admin-only for scorer role requests, while match access requests remain owner-scoped.
- Add rules for `scorer_requests` too, because the first tab on the same page also uses a collection with no local rule block.

## Missing Implementation Pieces

- Firestore rules for `match_access_requests`.
- Firestore rules for `scorer_requests`.
- Server-enforced collaborator write permissions on `matches`.
- Atomic approval/rejection behavior.
- A clear security distinction between global scorer role approvals and owner-scoped match access approvals.
- Error visibility in `MatchDetailsPage` owner panel; it silently ignores request load failures with `.catch(() => {})`.
- Duplicate request prevention. The client checks existing requests in some flows, but `requestMatchAccess` always creates a new request ID and does not enforce uniqueness.
- Tests or emulator rule coverage for:
  - Requester creates request.
  - Requester reads own request.
  - Match owner lists requests.
  - Non-owner cannot list another owner’s requests.
  - Owner approves/rejects.
  - Approved collaborator can persist permitted scoring/edit operations.
  - Rejected/non-approved scorer cannot persist match writes.
