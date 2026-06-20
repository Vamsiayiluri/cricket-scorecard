# Product Polish Sprint 2 — Completion Report

**Date:** 2026-06-20  
**Focus:** Stability · Validation · Mobile UX · Operational Readiness  
**Constraint:** No new features. No NRR, Knockouts, Brackets, PWA, Push Notifications, Advanced Statistics.

---

## Task 1 — Import Stability (P0 fix)

**File:** `src/services/firebase/importService.js`

**Problem:** If `executeImport` crashed after Phase 1 (teams written) but before Phase 2 completed (players not written), the import record remained in `Draft` status. Re-running created duplicate teams silently.

**Changes:**
- Immediately marks the import record `status: "Running"` (with `startedAt`) before any writes begin. A mid-run crash is now detectable on re-open.
- Wrapped all import phases in a try/catch. On failure, best-effort writes `status: "Failed"` with `errorMessage` and `failedAt`. If the secondary write also fails it is swallowed so the original error still propagates.
- Extracted all phase logic into `_executeImportPhases` (private) so the outer `executeImport` owns the status lifecycle cleanly.
- Added `assertFirestoreSafePayload` to `updateImportRecord` to block silent Firestore corruption.

**Import lifecycle after fix:** `Draft` → `Running` → `Imported` | `Failed`

---

## Task 2 — ErrorBoundary Placement

**File:** `src/main.jsx`

**Problem (from audit):** `ErrorBoundary` was the outermost wrapper, outside `<Provider store={store}>`. If a Redux-connected component threw, ErrorBoundary's fallback rendered outside Redux context — any Redux-connected code in the fallback would crash.

**Change:** Moved `ErrorBoundary` inside `<Provider>` but still outside `AppProviders`:

```jsx
<Provider store={store}>
  <ErrorBoundary>
    <AppProviders />
  </ErrorBoundary>
</Provider>
```

ErrorBoundary fallback now has full access to the Redux store. ThemeProvider/AuthProvider crashes remain caught.

---

## Task 3 — Payload Validation

**Files:** `src/services/firebase/matchService.js`, `src/services/firebase/tournamentService.js`, `src/services/firebase/importService.js`

Added `assertFirestoreSafePayload` at every Firestore write entry point that was missing it. Any `undefined` value or nested array now throws before reaching Firestore instead of silently corrupting the document.

| Function | File | Status |
|---|---|---|
| `createMatch` | matchService.js | Added |
| `patchMatchById` | matchService.js | Added |
| `updateMatchById` | matchService.js | Already present |
| `completeMatchById` | matchService.js | Already present |
| `createTournament` | tournamentService.js | Added |
| `updateTournament` | tournamentService.js | Added |
| `updateImportRecord` | importService.js | Added |

---

## Task 4 — Mobile Scoring UX

### Extra pill touch targets
**File:** `src/components/match/ScoringActions.jsx`

Increased `minHeight` on extra pill buttons from `{ xs: 38, sm: 34 }` to `{ xs: 44, sm: 38 }`. Mobile tap targets now meet the 44px minimum recommended by Apple HIG / WCAG 2.5.5.

### End Innings dialog double-tap prevention
**File:** `src/components/match/ScoreCard.jsx`

The confirm button in the End Innings dialog now:
- Adds `|| isEndingInnings` to its `disabled` prop — button is disabled for the duration of the async operation, preventing double-submission.
- Shows `"Ending…"` label while `isEndingInnings` is true, giving immediate visual feedback.

```jsx
disabled={!endInningsConfirmed || isEndingInnings}
{isEndingInnings ? "Ending…" : "End Innings"}
```

---

## Task 5 — Resume Scoring UX

**File:** `src/pages/DashboardPage.jsx`

Improved the active match banner on the Dashboard:

- **Live score in caption:** Extracts `runs/wickets (overs)` from `scoreCard.innings[currentInning-1]` and shows it inline in the banner caption (e.g., `45/2 (8.3 ov)`). Uses safe optional chaining — shows nothing if scoreCard data is missing.
- **Multiple-match handling:** When a scorer has more than one in-progress match, each gets its own banner row (`"Match 1 of 2 in progress"`, `"Match 2 of 2 in progress"`), each with its own Resume Scoring button. Previously only the first match was navigable.
- **Single-match copy:** Stays as `"Active match in progress"` when there is only one match.

---

## Build Verification

```
✓ 1501 modules transformed.
✓ built in 27.16s
```

No TypeScript or build errors. The only warning is a pre-existing chunk size advisory on `index.js` (952 kB before gzip) — unrelated to Sprint 2 changes and outside scope.

---

## Files Modified

| File | Change |
|---|---|
| `src/services/firebase/importService.js` | Running/Failed status tracking, `assertFirestoreSafePayload` on `updateImportRecord` |
| `src/main.jsx` | ErrorBoundary moved inside Redux Provider |
| `src/services/firebase/matchService.js` | `assertFirestoreSafePayload` on `createMatch`, `patchMatchById` |
| `src/services/firebase/tournamentService.js` | `assertFirestoreSafePayload` on `createTournament`, `updateTournament` |
| `src/components/match/ScoringActions.jsx` | Extra pill `minHeight` xs: 44px |
| `src/components/match/ScoreCard.jsx` | End Innings confirm button double-tap prevention + loading label |
| `src/pages/DashboardPage.jsx` | Resume banner with live score + per-match rows for multiple matches |
