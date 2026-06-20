# Notifications Foundation — Implementation Report (Wave 2C)
**Date:** June 20, 2026  
**Scope:** In-app viewer notifications with follow/unfollow mechanics. No FCM, no push, no email.  
**Goal:** First retention feature for CricVelo — keep viewers engaged with matches they care about.

---

## 1. Files Changed

| File | Type | Purpose |
|---|---|---|
| `src/services/firebase/notificationService.js` | New | Follow/unfollow, follower queries, notification CRUD, batch fan-out |
| `src/hooks/firebase/useNotifications.js` | New | Real-time subscription to user's notifications, unread count |
| `src/hooks/firebase/useFollowMatch.js` | New | Per-match follow state, toggle action |
| `src/pages/NotificationsPage.jsx` | New | Notification center — list, mark read, dismiss, mark all read |
| `src/components/ui/NotificationBell.jsx` | New | AppBar bell icon with live unread badge |
| `src/App.jsx` | Modified | Added `/notifications` route (ProtectedRoute) |
| `src/layout/AppShell.jsx` | Modified | Replaced static bell with `NotificationBell`; added "Notifications" nav item |
| `src/pages/LiveMatchPage.jsx` | Modified | Follow/Unfollow chip for authenticated viewers |
| `src/pages/PublicScorecardPage.jsx` | Modified | Follow/Unfollow chip for authenticated viewers |
| `src/pages/MatchScoring.jsx` | Modified | `match_started` notification fan-out after match begins |
| `src/components/match/MatchScoreCard.jsx` | Modified | `match_completed` notification on mount; `potm_announced` after POTM save |
| `firestore.rules` | Modified | Added rules for `matchFollowers` subcollection and `notifications` collection |

---

## 2. Data Model

### `matchFollowers/{matchId}/followers/{uid}`

```
{
  uid: string,         // follower's Firebase Auth UID
  followedAt: Timestamp
}
```

- One document per (match, user) pair.
- Any authenticated user can create/delete their own document (CRUD by owner).
- Any authenticated user can read the followers list — scorers need this to fan out notifications.

### `notifications/{notifId}`

```
{
  userId: string,       // recipient uid — read/update/delete by this user only
  matchId: string,      // referenced match
  matchTitle: string,   // denormalized for display without a join
  type: 'match_started' | 'match_completed' | 'potm_announced',
  title: string,        // short display title
  body: string,         // longer description
  read: boolean,        // false on creation
  readAt?: Timestamp,   // set when marked read
  createdAt: Timestamp  // ordering field
}
```

- Auto-generated doc ID.
- Top-level collection (not subcollection) — allows scorer to write notifications for multiple recipients in one `writeBatch`.
- No soft-delete: `dismissNotification` is a hard Firestore delete.

---

## 3. Notification Flow

### Follow a Match

```
User (viewer/scorer) opens /live/:matchId or /scorecard/:matchId
    ↓
useFollowMatch(uid, matchId) — getDoc to check existing follow status
    ↓
User clicks "Follow" chip
    ↓
followMatch(uid, matchId) → setDoc matchFollowers/{matchId}/followers/{uid}
    ↓
Chip switches to "Following" (optimistic state update)
```

### Generate Notifications (Match Started)

```
Scorer completes StartMatch form → clicks "Start Match"
    ↓
MatchScoring.jsx: await updateMatchById(nextMatchData) succeeds
    ↓
createNotificationsForFollowers(matchId, title, 'match_started', actorUid)
    ↓
  getMatchFollowers(matchId) — getDocs matchFollowers/{matchId}/followers
  → filter out actorUid (no self-notification)
  → writeBatch: one notification doc per follower
    ↓
sessionStorage flag prevents duplicate generation in same session
```

### Generate Notifications (Match Completed)

```
ScoreCard.jsx completes match → MatchScoreCard renders
    ↓
MatchScoreCard useEffect (fires once via useRef guard)
    ↓
createNotificationsForFollowers(matchId, title, 'match_completed', actorUid)
    ↓
Same batch write pattern as above
```

### Generate Notifications (POTM Announced)

```
Scorer selects Player of the Match in MatchScoreCard
    ↓
handleSavePotm: await setPlayerOfMatch(matchId, playerName) succeeds
    ↓
createNotificationsForFollowers(matchId, title, 'potm_announced', actorUid, { playerName })
    ↓
body: "${playerName} has been named Player of the Match in ${matchTitle}."
```

### Receive and Read Notifications

```
User opens any authenticated page
    ↓
NotificationBell subscribes via useNotifications(uid) → onSnapshot
    ↓
Badge shows unread count in real time
    ↓
User clicks bell → navigates to /notifications
    ↓
NotificationsPage lists all notifications newest-first
    ↓
Clicking a row: marks read + navigates to match page (live or scorecard)
    ↓
Dismiss (✕): hard deletes the notification
    ↓
"Mark all read": batch update all unread → read: true
```

---

## 4. Firestore Rules

```js
// Follow mechanics
match /matchFollowers/{matchId}/followers/{userId} {
  allow read: if isSignedIn();
  allow create: if isSignedIn() && request.auth.uid == userId
    && request.resource.data.uid == userId;
  allow delete: if isSignedIn() && request.auth.uid == userId;
}

// In-app notifications
match /notifications/{notifId} {
  allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
  allow create: if isSignedIn()
    && request.resource.data.userId is string
    && request.resource.data.matchId is string
    && request.resource.data.type in ['match_started', 'match_completed', 'potm_announced'];
  allow update: if isSignedIn() && resource.data.userId == request.auth.uid
    && request.resource.data.userId == resource.data.userId;
  allow delete: if isSignedIn() && resource.data.userId == request.auth.uid;
}
```

**Security notes:**
- A user can only read/update/delete notifications addressed to themselves (`userId == request.auth.uid`).
- Any authenticated user can create notifications — this is required so scorers can fan out to followers. The `type` allowlist prevents abuse of the creation path for arbitrary types.
- Follow documents are owner-only write: `request.auth.uid == userId` on both create and delete.
- Followers list is readable by all authenticated users — required for the fan-out query.

---

## 5. Validation

| Scenario | Expected Result |
|---|---|
| Follow match (authenticated) | `matchFollowers/{matchId}/followers/{uid}` doc created; chip shows "Following" |
| Follow match (unauthenticated) | Chip not shown; no follow affordance rendered |
| Unfollow match | Doc deleted; chip returns to "Follow" |
| Refresh page after follow | `useFollowMatch` re-reads Firestore; chip shows "Following" |
| Match starts (followers exist) | `match_started` notifications batch-written for each follower |
| Match starts (no followers) | No notifications written; sessionStorage flag still set |
| Match starts (scorer is only follower) | actorUid filtered out; no self-notification |
| Match completes | `match_completed` notifications written once per MatchScoreCard mount (useRef guard) |
| POTM selected | `potm_announced` notification with player name written for followers |
| NotificationBell badge | Shows live unread count via `onSnapshot`; updates without page refresh |
| Click bell | Navigates to `/notifications` |
| Notification row click | Marks as read + navigates to live or scorecard page |
| Dismiss notification | Hard-deletes from Firestore; removed from list in real time |
| Mark all read | Batch update; all badges reset to 0 |
| Empty state | "No notifications yet" with link to /discover |
| Duplicate prevention | `sessionStorage` key `notif_sent_{matchId}_{type}` blocks same-session re-fire |

---

## 6. Build Result

```
✓ built in 7.29s
1125 modules transformed — zero errors

New lazy chunks:
  dist/assets/NotificationsPage-B9A1kaDP.js    5.36 kB │ gzip: 2.01 kB
  dist/assets/useFollowMatch-BFrc2jtH.js      10.38 kB │ gzip: 3.46 kB
  dist/assets/NotificationsActive-Bdc_nSp1.js  0.48 kB │ gzip: 0.34 kB

Modified chunks:
  LiveMatchPage (+0.6 kB follow chip + hook)
  PublicScorecardPage (+0.6 kB follow chip + hook)
  MatchScoring (+0.3 kB match_started notification call)
  ScoreCard chunk (+0.2 kB match_completed + potm_announced calls in MatchScoreCard)
```

`NotificationBell` is bundled into the main AppShell chunk (always rendered for authenticated users) — appropriate since it holds a live subscription.

---

## 7. Lint Result

**All Wave 2C files: zero errors, zero warnings.**

```
npx eslint \
  src/services/firebase/notificationService.js \
  src/hooks/firebase/useNotifications.js \
  src/hooks/firebase/useFollowMatch.js \
  src/pages/NotificationsPage.jsx \
  src/components/ui/NotificationBell.jsx \
  src/App.jsx \
  src/layout/AppShell.jsx \
  src/pages/LiveMatchPage.jsx \
  src/pages/PublicScorecardPage.jsx \
  src/pages/MatchScoring.jsx \
  src/components/match/MatchScoreCard.jsx
→ (no output — clean)
```

Pre-existing lint errors in other files: 43 errors, 6 warnings — all pre-existing, none introduced in Wave 2C.

---

## 8. Architecture Decisions

### Why client-side fan-out instead of Cloud Functions?

The spec explicitly rules out backend infrastructure. Client-side fan-out (scorer's browser reads followers, writes batch notifications) is viable for the expected community scale (1–50 followers per match). At larger scale (100+ followers), a Cloud Function triggered by Firestore writes would be the right path.

### Why `sessionStorage` for duplicate prevention?

Cloud Functions would handle idempotency server-side. Client-side, the simplest reliable guard is `sessionStorage` — prevents the same event from being re-fired within a browser session without requiring an extra Firestore read or match doc field. On a page reload, the guard resets, but the `useRef` in `MatchScoreCard` also prevents re-fire within a component lifecycle. Acceptable for MVP.

### Why top-level `notifications` collection instead of `users/{uid}/notifications`?

A subcollection per user would have cleaner read rules (only the user's own documents would be queryable). However, it would require the scorer to know which collection path to write to for each follower — the same `writeBatch` API works, but the paths would be `users/{uid}/notifications/{id}` for each follower. A top-level collection with `userId` field keeps the write paths uniform and simplifies the batch. The `userId == request.auth.uid` read rule provides the same privacy guarantee.

### Why not store followers on the match document?

Storing `followers: { [uid]: true }` on the match doc would avoid a subcollection query when generating notifications. However, it would require viewers to have `update` permission on match documents, which conflicts with the current rule that restricts match writes to scorers. A separate `matchFollowers` collection avoids this conflict entirely.

---

## 9. Future Enhancements

| Enhancement | Notes |
|---|---|
| **Firebase Cloud Functions fan-out** | Replace client-side fan-out with a Firestore trigger: `onUpdate` of `matches/{matchId}` → detect status change → fan-out to followers. Scales to unlimited followers, removes dependency on scorer's browser being online |
| **FCM push notifications** | Add Firebase Cloud Messaging for background push. Works alongside in-app: push wakes the user, in-app is the source of truth they open |
| **Email digests** | "Your followed match completed" summary email (Firebase Extension: Trigger Email) |
| **Notification preferences** | Per-user settings: "only notify me for POTM", "mute this match", etc. |
| **Follower count display** | Show "{N} following this match" on live/scorecard pages |
| **Follow from Dashboard** | Add follow button on dashboard match cards for quick access |
| **Follow all matches from a team** | "Follow Team A" → automatically follow every public match that team plays |
| **Milestone notifications** | "50-run partnership", "Hat-trick alert", "Player just hit a century" |
| **Notification grouping** | Group same-match notifications: "3 updates for Team A vs Team B" instead of 3 rows |
| **Sound/vibration on new notification** | Optional browser Notification API sound when bell badge increments |
| **Notification retention policy** | Auto-delete notifications older than 30 days to keep the collection clean |
| **Read receipts for scorers** | Show scorer how many followers have read the result |

---

*Wave 2C complete. Build passes. Zero lint errors in all new/changed files.*
