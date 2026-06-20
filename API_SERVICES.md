# CricVelo API and Services

## Firebase Configuration

### `src/firebase-config.js`

Responsibilities:
- Initialize Firebase app from `firebaseEnv`.
- Export Firestore instance as default `db`.

Dependencies:
- `firebase/app`
- `firebase/firestore`
- `src/config/env.js`

## Auth Services

### `src/services/firebase/authService.js`

Responsibilities:
- Wrap Firebase Auth methods behind project-level function names.
- Provide auth state subscription.

Functions:
- `getFirebaseAuth()`
- `subscribeToAuthState(callback)`
- `loginWithEmail(email, password)`
- `registerWithEmail(email, password)`
- `loginWithGoogle()`
- `logout()`
- `sendVerificationEmail(user, actionCodeSettings)`
- `sendResetPasswordEmail(email, actionCodeSettings)`

Dependencies:
- `firebase/auth`

### `src/services/firebase/userService.js`

Responsibilities:
- Read, create, and subscribe to user profiles.
- Resolve effective roles.
- Ensure a profile exists after auth.

Functions:
- `resolveRole(profile)`
- `isScorerRole(role)`
- `getUserProfile(uid)`
- `createUserProfile(user, role)`
- `ensureUserProfile(user, defaultRole)`
- `subscribeToUserProfile(uid, onData, onError)`

Dependencies:
- Firestore `doc`, `setDoc`, `serverTimestamp`
- `COLLECTIONS`, `SCORER_ROLES`, `USER_ROLES`
- `fetchDocument`, `subscribeToDocument`

## Match Services

### `src/services/firebase/matchService.js`

Responsibilities:
- Build match documents from wizard data.
- Create, fetch, update, complete, archive, restore, soft-delete, and toggle visibility.
- Normalize scorecard timeline fields before persistence.

Functions:
- `buildMatchFromForm(formData)`
- `createMatch(formData)`
- `getMatchById(matchId)`
- `updateMatchById(updatedData)`
- `patchMatchById(matchId, patch)`
- `updateMatchCurrentInning(matchId, inningNumber)`
- `completeMatchById(updatedData, completionFields)`
- `archiveMatch(matchId)`
- `restoreArchivedMatch(matchId)`
- `softDeleteMatch(matchId)`
- `setMatchVisibility(matchId, isPublic)`

Dependencies:
- `uid`
- Firestore `doc`, `setDoc`, `updateDoc`
- `assertFirestoreSafePayload`
- `normalizeScoreCardTimelineStorage`

### `src/services/firebase/dashboardService.js`

Responsibilities:
- Fetch matches for dashboard buckets.
- Provide dashboard query reference for realtime dashboard hook.

Functions:
- `fetchDashboardMatches()`
- `getDashboardMatchesQuery()`

Dependencies:
- Firestore `collection`, `query`, `limit`
- `fetchQuery`
- `isCompletedMatch`

### `src/services/firebaseServices.js`

Responsibilities:
- Backward-compatible facade for older imports.
- Dispatch created match into Redux and navigate to opening setup.

Functions:
- `saveMatch(formData, dispatch, navigate)`
- `updateMatch(updatedData)`
- `updateMatchInnings(matchId, innings)`
- `getMatch(matchId)`

Dependencies:
- `matchSlice.addMatch`
- `matchService`

## Scoring Services

### `src/services/firebase/scoringService.js`

Responsibilities:
- Expose scoring-specific persistence operations.
- Wrap match service calls with diagnostics measurement.

Functions:
- `getMatchForScoring`
- `persistMatchScorecard(updatedData)`
- `persistCurrentInning(matchId, inningNumber)`
- `persistMatchCompletion(updatedData, completionFields)`

Dependencies:
- `matchService`
- `scoringMeasure`

## Firestore Helpers

### `src/services/firebase/firestoreHelpers.js`

Responsibilities:
- Normalize Firestore errors.
- Convert document/query snapshots to plain objects.
- Provide one-time and realtime read wrappers.

Functions:
- `handleFirestoreError(error, context)`
- `docToData(snapshot)`
- `queryToData(snapshot)`
- `fetchDocument(docRef)`
- `fetchQuery(queryRef)`
- `subscribeToDocument(docRef, onData, onError)`
- `subscribeToQuery(queryRef, onData, onError)`

Dependencies:
- Firestore `getDoc`, `getDocs`, `onSnapshot`

## Utility Services and Hooks

### Firebase hooks

- `useLiveMatch(matchId, options)`: realtime match document subscription.
- `useDashboardMatches({ realtime })`: realtime or one-time dashboard match buckets.
- `useFirestoreDocument(docRef, options)`: document subscription hook.
- `useRealtimeCollection(queryRef, options)`: query subscription hook.

### Scoring hooks

- `useScoringPersistence(matchId)`: latest-write-wins queue, failed write storage, retry, before-unload protection support.
- `useScoringHistory()`: undo/redo snapshots scoped by innings.

### Match creation utilities

- `matchCreationValidation.js`: step validation.
- `matchCreationDraft.js`: local draft load/save/clear.
- `constants/matchCreation.js`: steps, limits, default form shape.

### Display and scoring utilities

- `matchDisplay.js`: titles, dates, routes, status/result display, completion fields.
- `scorecardTimeline.js`: recent-ball and over-history normalization.
- `firestoreValidation.js`: Firestore-safe payload checks.
- `roles.js`: role helpers.
- `scoringDiagnostics.js`: scoring logs and measurements.
