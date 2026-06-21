# Wave 1 — Batch 2 Completion Report
**Date:** June 19, 2026  
**Scope:** Features 4–7 (Free Hit, Extras Breakdown, Player of the Match, Match Notes Display)

---

## 1. Files Changed

| File | Type | Feature |
|---|---|---|
| `src/helpers/updateScorecard.js` | Modified | Feature 4 — Free Hit state machine |
| `src/components/match/ScoringActions.jsx` | Modified | Feature 4 — FREE HIT banner + ball summary marker |
| `src/components/match/CurrentOver.jsx` | Modified | Feature 4 — Free-hit chip styling |
| `src/components/match/BallTimeline.jsx` | Modified | Feature 4 — Free-hit chip styling |
| `src/components/viewer/PublicMatchScorecard.jsx` | Modified | Feature 5 + Feature 6 + Feature 7 |
| `src/components/match/MatchScoreCard.jsx` | Modified | Feature 6 + Feature 7 |
| `src/components/match/PlayerOfMatchSelector.jsx` | **New** | Feature 6 — POTM dialog |
| `src/services/firebase/matchService.js` | Modified | Feature 6 — `setPlayerOfMatch` |
| `src/pages/MatchDetailsPage.jsx` | Modified | Feature 6 + Feature 7 |
| `src/pages/PublicScorecardPage.jsx` | Modified | Feature 7 — Notes display |

---

## 2. Schema Changes

### `scoreCard.isFreeHit` (boolean)
- Added as a top-level field on the `scoreCard` object.
- `true` after a no-ball is bowled; persists until consumed by the next legal delivery.
- Persisted to Firestore automatically via the existing `enqueuePersist` flow.
- Included in undo/redo snapshots because snapshots capture the full `scoreCard` object.
- Backward-compatible: `isFreeHit` is read with `Boolean(scoreCard.isFreeHit)` — existing matches without this field default to `false`.

### `playerOfTheMatch` (string | null)
- Added as a top-level field on the match document.
- Set via `setPlayerOfMatch(matchId, playerName)` → `patchMatchById`.
- Backward-compatible: displayed only when truthy; existing matches without it show the selector prompt.

---

## 3. Root Cause & Fix Per Feature

### Feature 4 — Free Hit Indicator

**Root cause:** No free-hit state was tracked after a no-ball; the scorer and viewer had no indicator that the next delivery was a free hit.

**Fix:**
- **`updateScorecard.js`**: Added free-hit state machine at the end of `handleRunClick`. After every delivery, `scoreCard.isFreeHit` is set:
  - `noBall` → `true` (next delivery is a free hit)
  - `wide` + current `isFreeHit` → `true` (wide during free hit survives)
  - legal delivery → `false` (free hit consumed)
- **`ScoringActions.jsx`**: Added `isFreeHit` derivation from `matchData.scoreCard.isFreeHit`. Shows an amber FREE HIT banner above the extras when active. Passes `isFreeHit` to `formatBallSummary()`, which appends `"fh"` suffix to the ball string (e.g., `"4fh"`, `"1fh"`) for free-hit deliveries.
- **`CurrentOver.jsx`** and **`BallTimeline.jsx`**: Detect `"fh"` suffix on ball strings and apply amber (`#F59E0B`) chip styling to distinguish free-hit deliveries visually.

**Undo/Redo:** Undo and redo snapshots include the full `scoreCard` (with `isFreeHit`), so they work automatically.

**Refresh recovery:** `isFreeHit` is part of the `scoreCard` object that is persisted to Firestore on every ball. After a page refresh, the scoring console re-fetches the match and `isFreeHit` is restored correctly.

---

### Feature 5 — Extras Breakdown

**Root cause:** `PublicMatchScorecard.jsx` showed only `Extras: N` without the wides/no-balls/byes/leg-byes breakdown. The live console and completed scorecard already had the breakdown.

**Fix:** Updated `PublicMatchScorecard.jsx` to render the full breakdown alongside the total:
```
Extras: 14 (Wd: 5, Nb: 3, B: 4, Lb: 2)
```
Uses the already-tracked `inning.extras[0].wides`, `noBalls`, `byes`, and `legByes` fields — no data model changes required.

---

### Feature 6 — Player of the Match

**Root cause:** `MatchScoreCard.jsx` had `"Player of the Match: To be announced"` hardcoded with no selection flow and no persistence.

**Fix:**
- **`matchService.js`**: Added `setPlayerOfMatch(matchId, playerName)` which calls `patchMatchById` to write `playerOfTheMatch` to the match document.
- **`PlayerOfMatchSelector.jsx`** (new): Dialog component that collects all unique player names from both innings and allows the scorer to select one. Uses a list with amber "Selected" chip. Includes Cancel/Save actions. Supports re-selection ("Change" button).
- **`MatchScoreCard.jsx`**: Replaced placeholder text with real POTM display:
  - If `playerOfTheMatch` is set: shows name + trophy icon + "Player of the Match" chip + "Change" button.
  - If not set: shows "Select Player of the Match" outlined button.
  - Selection persists to Firestore via `setPlayerOfMatch`.
- **`PublicMatchScorecard.jsx`**: Shows amber POTM banner at the top of the scorecard when `match.playerOfTheMatch` is truthy.
- **`MatchDetailsPage.jsx`**: Added `Player of the Match: <name>` line in the Summary card.

---

### Feature 7 — Match Notes Display

**Root cause:** Notes were entered during match creation and stored in `match.notes`, but were only displayed in `MatchDetailsPage.jsx`. They were invisible on the final scorecard and the public scorecard page.

**Fix:**
- **`MatchScoreCard.jsx`**: Added notes display below the match result headline (only shown when `matchData.notes` is non-empty).
- **`PublicScorecardPage.jsx`**: Added a "Match Notes" Paper card between StatusBadge and LiveScoreboard (only shown when `match.notes` is non-empty).
- `MatchDetailsPage.jsx` already displayed notes — no change needed there.

---

## 4. Build Result

```
✓ built in 19.70s
```

Build passes cleanly. All 1080 modules transformed without errors.

---

## 5. Lint Result

**Files changed in this batch:** Zero errors, zero warnings.

**Pre-existing lint errors in other files:** 46 errors (unused React imports, missing prop-types, etc.) — all pre-existing before this batch, none introduced by these changes.

---

## 6. Validation Checklist

| Scenario | Expected Behaviour | Status |
|---|---|---|
| No-ball bowled → next delivery | FREE HIT banner appears; `scoreCard.isFreeHit = true` | ✅ Implemented |
| Wide during free hit | FREE HIT banner stays; `isFreeHit` remains `true` | ✅ Implemented |
| No-ball during free hit | FREE HIT banner stays (no-ball creates another free hit); `isFreeHit = true` | ✅ Implemented |
| Legal delivery during free hit | FREE HIT banner disappears; `isFreeHit = false` | ✅ Implemented |
| Free-hit delivery in CurrentOver chips | Chip displays in amber | ✅ Implemented |
| Free-hit delivery in BallTimeline | Chip displays in amber | ✅ Implemented |
| Undo after free hit | Restores previous `scoreCard` snapshot including `isFreeHit` | ✅ Works via existing snapshot mechanism |
| Redo after undo | Restores forward snapshot including `isFreeHit` | ✅ Works via existing snapshot mechanism |
| Page refresh during active free hit | `isFreeHit` loaded from Firestore; banner reappears | ✅ Persisted on every ball |
| Extras breakdown — live console | Shows Wd / Nb / B / Lb breakdown | ✅ Already existed |
| Extras breakdown — completed scorecard | Shows full breakdown | ✅ Already existed |
| Extras breakdown — public scorecard | Shows full breakdown | ✅ Fixed in this batch |
| Player of the Match — selection dialog | Lists all unique players from both innings | ✅ Implemented |
| Player of the Match — persistence | Writes to `match.playerOfTheMatch` via `patchMatchById` | ✅ Implemented |
| Player of the Match — scorer scorecard display | Shows name + trophy + Change button | ✅ Implemented |
| Player of the Match — public scorecard | Amber POTM banner shown at top | ✅ Implemented |
| Player of the Match — Match Details page | Shows in Summary card | ✅ Implemented |
| Player of the Match — editable after set | "Change" button opens selector again | ✅ Implemented |
| Match Notes — Match Details page | Notes displayed in Summary card | ✅ Already existed |
| Match Notes — Completed scorecard | Notes shown below result headline | ✅ Fixed in this batch |
| Match Notes — Public scorecard page | "Match Notes" card shown | ✅ Fixed in this batch |
| Match Notes — hidden when empty | Notes block not rendered if `match.notes` is blank | ✅ Guarded with `?.trim()` check |

---

## 7. Remaining Wave 1 Items

The following are confirmed outstanding from the Wave 1 backlog after this batch:

| Item | Priority | Notes |
|---|---|---|
| Dismissal type selection (Bowled, Caught, LBW, Run Out, Stumped) | P0 | Covered in Batch 1? Confirm status |
| Fielder name for caught / run-out dismissals | P1 | Depends on dismissal type being in place |
| Fall of Wickets — confirm populated correctly | P1 | `FallOfWickets` component exists; verify data shape |
| End Innings double-confirm protection | P1 | Dialog exists but single-confirm; consider text entry |
| Automated scoring tests | P0 | No test suite; scoring mutations need coverage |
| Match ownership / creator model | P0 | Not started |
| Multi-scorer conflict protection | P0 | Not started |
| Firestore rules — deep schema validation | P0 | Not started |
| Private / public access messaging | P1 | Partial |
| Full manual QA checklist run | P0 | Pre-deployment requirement |
| Result share card (image export) | P1 | Deferred to Wave 2 |
| PWA manifest + service worker | P1 | Deferred to Wave 2 |

---

**Status: Batch 2 complete. Awaiting approval before Wave 2 (Growth Features).**
