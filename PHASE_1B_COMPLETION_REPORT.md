# PHASE_1B_COMPLETION_REPORT.md

## Scope Approved

Implementation Phase 1B was limited to:

1. Safe auth role defaults
2. Route-level email verification
3. Query-string preservation during auth redirects
4. Match visibility UI cleanup

No scoring logic, innings logic, dashboard logic, creator ownership model, or unrelated Firestore authorization changes were implemented.

## Files Changed

- `src/context/AuthContext.jsx`
- `src/services/firebase/userService.js`
- `src/pages/ProtectedRoute.jsx`
- `src/pages/EditMatchPage.jsx`
- `firestore.rules`

Change size:

- 5 files changed
- 31 insertions
- 13 deletions

## Issue 1: Safe Auth Role Defaults

Root cause:

- `AuthContext.jsx` created missing user profiles with `USER_ROLES.SCORER`.
- `userService.resolveRole()` treated a missing profile/role as `scorer`.
- `firestore.rules` also treated missing profile documents as `scorer`.
- This meant new Google users or users with missing profiles could gain scorer/admin workflow access by default.

Fix implemented:

- Changed `AuthContext.jsx` to call `ensureUserProfile(user, USER_ROLES.VIEWER)`.
- Changed `resolveRole(profile)` fallback from `USER_ROLES.SCORER` to `USER_ROLES.VIEWER`.
- Changed Firestore `userRole()` fallback from `'scorer'` to `'viewer'`.

Files affected:

- `src/context/AuthContext.jsx`
- `src/services/firebase/userService.js`
- `firestore.rules`

Risks introduced:

- Existing users without Firestore profile documents will now be treated as viewers until their profile role is explicitly created or restored.
- This is safer for MVP but may require manually creating/updating scorer/admin profiles for legacy users.

Validation checklist:

- [x] Missing client profile role resolves to viewer.
- [x] New ensured profile defaults to viewer.
- [x] Firestore missing-profile role fallback is viewer.
- [x] Existing explicit scorer/admin roles still pass through unchanged.

## Issue 2: Route-Level Email Verification

Root cause:

- Email verification was enforced in `LoginPage.jsx`, but protected routes only checked `isAuthenticated`.
- A user with an unverified Firebase session could potentially reach protected routes after registration or session restoration.

Fix implemented:

- Added `isEmailVerified` to `AuthContext` value.
- Updated `ProtectedRoute.jsx` to block authenticated but unverified users.
- The blocked state renders `UnauthorizedState` with an email verification message.

Files affected:

- `src/context/AuthContext.jsx`
- `src/pages/ProtectedRoute.jsx`

Risks introduced:

- All authenticated users with `user.emailVerified === false` are blocked from protected routes.
- Google users should normally have verified provider emails in Firebase, but this should still be confirmed in manual auth QA.
- The current verification-blocked UI does not add resend-email controls; that remains future UX polish.

Validation checklist:

- [x] ProtectedRoute now checks `isEmailVerified`.
- [x] Unverified authenticated users do not receive protected children.
- [x] Verified authenticated users can proceed.
- [x] ScorerRoute inherits the verification guard through ProtectedRoute.

## Issue 3: Query-String Preservation During Auth Redirects

Root cause:

- `ProtectedRoute.jsx` saved only `location.pathname` in redirect state.
- Query-param routes such as `/score-card?matchId=abc` and `/start-match?matchId=abc` lost their `matchId` after login.

Fix implemented:

- Built redirect state from `location.pathname + location.search`.
- Existing `LoginPage.jsx` and `GoogleLoginButton.jsx` already consume `location.state.from` / `redirectTo`, so no extra changes were needed there.

Files affected:

- `src/pages/ProtectedRoute.jsx`

Risks introduced:

- Minimal. Redirect now preserves the same route plus query string.
- Hash fragments are still not preserved because current protected routes use query params, not hash routing.

Validation checklist:

- [x] Redirect path includes pathname.
- [x] Redirect path includes search/query string.
- [x] Login continues to navigate to `location.state.from`.
- [x] Google login continues to use the same `redirectTo` prop.

## Issue 4: Match Visibility UI Cleanup

Root cause:

- `EditMatchPage.jsx` displayed a top-level visibility switch using real edit state.
- It also rendered `NotesForm` without `isPublic` or `onUpdateVisibility`, so `NotesForm` defaulted to public and displayed a second, misleading visibility switch.

Fix implemented:

- Wired `NotesForm` in edit mode with:
  - `isPublic={formState.isPublic}`
  - `onUpdateVisibility={(isPublic) => setFormState((p) => ({ ...p, isPublic }))}`
- This makes the existing `NotesForm` switch reflect and update the same edit state as the top-level switch.

Files affected:

- `src/pages/EditMatchPage.jsx`

Risks introduced:

- The edit page still shows two visibility controls, but they now share one source of truth and no longer conflict.
- A future polish pass may remove one control entirely if desired; Phase 1B only cleaned up the misleading state.

Validation checklist:

- [x] `NotesForm` receives current `formState.isPublic`.
- [x] `NotesForm` visibility toggle updates `formState.isPublic`.
- [x] Save patch still writes `isPublic: formState.isPublic`.
- [x] No match creation `NotesForm` behavior was changed.

## Build Result

Command:

```powershell
node .\node_modules\vite\bin\vite.js build
```

Result:

- Passed.
- Vite transformed 1075 modules and completed production build.
- Existing warning remains: one chunk is larger than 500 kB after minification.

Build status:

```text
PASS
```

## Lint Result For Touched Files

Command:

```powershell
node .\node_modules\eslint\bin\eslint.js src/context/AuthContext.jsx src/services/firebase/userService.js src/pages/ProtectedRoute.jsx src/pages/EditMatchPage.jsx
```

Result:

```text
PASS
```

Notes:

- Removed unused imports in touched files.
- Added narrow file-level ESLint disables for `react/prop-types` where the repo does not use the `prop-types` package.
- Added a narrow `react-refresh/only-export-components` disable in `AuthContext.jsx`, because that file intentionally exports both provider and hook.

## Additional Static Validation

Command:

```powershell
git diff --check -- src/context/AuthContext.jsx src/services/firebase/userService.js src/pages/ProtectedRoute.jsx src/pages/EditMatchPage.jsx firestore.rules
```

Result:

- Passed.
- No whitespace errors detected.
- Git reported normal LF-to-CRLF working-copy warnings.

## Manual Validation Checklist Executed

Code-level checklist:

- [x] Confirmed `AuthContext` creates missing profiles as viewer.
- [x] Confirmed client role fallback is viewer.
- [x] Confirmed Firestore missing-profile fallback is viewer.
- [x] Confirmed `AuthContext` exposes `isEmailVerified`.
- [x] Confirmed `ProtectedRoute` blocks unverified authenticated users.
- [x] Confirmed `ProtectedRoute` preserves `pathname + search`.
- [x] Confirmed login and Google sign-in still consume the preserved redirect value.
- [x] Confirmed edit page visibility state is shared with `NotesForm`.
- [x] Confirmed production build passes.
- [x] Confirmed touched-file ESLint passes.

Not executed:

- Browser-based Firebase auth QA was not run in this phase.
- Firestore emulator rules tests were not run in this phase.

## Remaining Phase 1B Issues

Approved Phase 1B scope:

- None remaining from the four approved items at code level.

Known remaining issues outside Phase 1B scope:

- Forgot password still routes to registration.
- Remember device is still UI-only.
- Registration can still leave users signed in while asking them to verify email.
- Private match visibility is still broader than the final ownership model should be because creator ownership is intentionally not implemented yet.
- Edit match still shows two visibility switches, though they now share the same state.
- Browser/manual Firebase QA remains required.
- Firestore rules should be tested in emulator before deployment.

## Stop Point

Phase 1B implementation is complete. Awaiting approval before Phase 2.
