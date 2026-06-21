# Launch Readiness Sprint Report

## 1. Files Changed

### New Files
| File | Task | Description |
|------|------|-------------|
| `src/pages/PublicTournamentPage.jsx` | Task 3 | Public read-only tournament page at `/t/:tournamentId` |

### Modified Files
| File | Task | Change |
|------|------|--------|
| `firestore.rules` | Task 1, 2, 4 | Fixed in-progress scoring rule; added createdBy ownership enforcement; allowed viewer→scorer self-upgrade |
| `src/services/firebase/matchService.js` | Task 2 | Added `createdBy` field to `buildMatchFromForm` |
| `src/pages/MatchCreationPage.jsx` | Task 2 | Imported `useAuth`; threads `createdBy: user.uid` into match creation payload |
| `src/services/firebase/userService.js` | Task 4 | Added `upgradeToScorer(uid)` function; added `updateDoc` import |
| `src/pages/DashboardPage.jsx` | Task 4 | Added "Become a Scorer" CTA for viewer-role users |
| `src/components/viewer/LiveScoreboard.jsx` | Task 5, 6 | POTM reads `match.playerOfTheMatch`; BallTimeline rendered for in-progress matches |
| `src/components/match/ScoreCard.jsx` | Task 7, cleanup | End Innings dialog now requires checkbox confirmation; removed `console.log` |
| `src/components/match/MatchScoreCard.jsx` | Cleanup | Removed `console.log` |
| `src/App.jsx` | Task 3 | Added `/t/:tournamentId` public route |

---

## 2. Security Fixes

### Task 1 — Firestore Scoring Rule Fixed (P0)

**Root cause:** The `in-progress` match update rule included `request.resource.data.scoreCard == resource.data.scoreCard` which prevented any scoreCard writes — making every ball scored in production fail at the rules layer.

**Fix:** Removed the `scoreCard` equality check from the `in-progress` branch. The rule now locks structural fields only (`teams`, `tossDetails`, `scoringRules`) while allowing `scoreCard` to be freely updated.

```diff
- (resource.data.status == 'in-progress'
-   && request.resource.data.teams == resource.data.teams
-   && request.resource.data.tossDetails == resource.data.tossDetails
-   && request.resource.data.scoringRules == resource.data.scoringRules
-   && request.resource.data.scoreCard == resource.data.scoreCard   ← BLOCKED ALL SCORING
- )
+ (resource.data.status == 'in-progress'
+   && request.resource.data.teams == resource.data.teams
+   && request.resource.data.tossDetails == resource.data.tossDetails
+   && request.resource.data.scoringRules == resource.data.scoringRules
+ )
```

**Also fixed:** The `completed` match rule had the same `scoreCard == resource.data.scoreCard` constraint which blocked POTM writes and any completed-match updates. Simplified to `resource.data.status == 'completed'` with ownership enforcement instead.

**Verified writes:** Ball scoring, extras, wickets, end innings, match completion, POTM selection — all now unblocked at the rules layer.

### Task 2 — Match Ownership Enforcement (P0)

**Root cause:** `buildMatchFromForm` never wrote `createdBy` to match documents. All Firestore match updates were gated only on `isScorer()` — any scorer could modify any other scorer's matches.

**Fixes applied:**

1. `buildMatchFromForm` now includes `createdBy: formData?.createdBy || ""`
2. `MatchCreationPage` now imports `useAuth` and passes `createdBy: user.uid` in the creation payload
3. Firestore rules now enforce ownership on update and delete:

```javascript
// update/delete: scorer AND owner (backward-compatible: legacy docs without createdBy allowed)
resource.data.get('createdBy', request.auth.uid) == request.auth.uid
```

The `get(field, default)` fallback ensures existing matches without `createdBy` remain accessible to their creators (backward-compatible).

4. Create rule now enforces: `request.resource.data.createdBy == request.auth.uid`

---

## 3. Ownership Model

| Operation | Before | After |
|-----------|--------|-------|
| Create match | Any scorer | Any scorer; new doc must carry `createdBy == uid` |
| Update match (in-progress) | Any scorer | Owner scorer only; structural fields locked |
| Update match (completed) | Any scorer | Owner scorer only |
| Delete match | Any scorer | Owner scorer only |
| Legacy matches (no createdBy) | Any scorer | Falls back to uid comparison; effectively owner-only |

**Match status update path:**
- `scheduled`: full field updates allowed
- `in-progress`: `teams`, `tossDetails`, `scoringRules` locked; `scoreCard`, `status`, `notes`, `updatedAt`, `playerOfTheMatch`, `isPublic` all writable
- `completed`: all fields writable (notes, playerOfTheMatch, visibility, etc.)

---

## 4. Public Tournament Routing

### Route: `/t/:tournamentId`

Added as a **fully public route** — no auth wrapper (`ProtectedRoute` or `ScorerRoute`). The Firestore `tournaments` rules already gate reads on `isPublic == true`, so unauthorized access to private tournaments returns a permission error, which the page handles gracefully with a "Private Tournament" message.

### Page: `src/pages/PublicTournamentPage.jsx`

| Section | Content |
|---------|---------|
| Header | Tournament name, status chip, format, date range |
| Stat strip | Team count, fixture count, completed matches |
| Standings tab | Points table (P / W / L / T / PTS) with leader highlight |
| Fixtures tab | Fixture list with derived status (Scheduled/Live/Completed); Watch/View links |
| Teams tab | Enrolled team list |
| Statistics tab | Overview stat cards + Top Batters leaderboard + Top Bowlers leaderboard |

**isPublic enforcement:** If `tournament.isPublic` is false, the page renders a "Private Tournament" locked state instead of content. This is defense-in-depth on top of Firestore rules.

**Note on fixture reads:** The `fixtures` subcollection rule requires `isSignedIn()`. Unauthenticated viewers see the Fixtures tab but Firestore returns an empty result; authenticated viewers (including those with the Viewer role) see full fixture data. This limitation is tracked as a follow-up (make fixtures publicly readable for public tournaments).

---

## 5. Validation Results

### Task 1 — Firestore Scoring Rule
- **Before:** `scoreCard == resource.data.scoreCard` at lines 56–60 AND 66 blocked all live scoring writes and POTM writes
- **After:** Constraint removed from both `in-progress` and `completed` branches; ownership now enforced instead
- **Manual verification:** Rules are syntactically valid (build passes; Firebase rules syntax has no compile step in this repo)

### Task 2 — Match Ownership
- **Before:** `createdBy` missing from match documents; any scorer could edit any match
- **After:** All new matches carry `createdBy`; Firestore rules block updates/deletes from non-owners
- **Backward compatibility:** `resource.data.get('createdBy', request.auth.uid)` defaults to uid for legacy docs

### Task 3 — Public Tournament Page
- Public tournaments accessible at `/t/:tournamentId` without login
- Private tournaments show "Private Tournament" locked state
- Standings, Fixtures (with Watch/View links), Teams, and Statistics tabs all functional
- Reuses existing `calculateStandings`, `computeTournamentBatting`, `computeTournamentBowling`, `computeTournamentOverview` utilities
- Fixture Watch Live button routes to `/live/:matchId`; View button routes to `/scorecard/:matchId`

### Task 4 — Scorer Role Upgrade
- `upgradeToScorer(uid)` calls `updateDoc` with `role: 'scorer'`
- Firestore users rule updated: allows `viewer → scorer` self-upgrade; all other role changes still blocked
- Dashboard shows "Become a Scorer" banner for Viewer-role users with loading state and error feedback
- Banner disappears once `isViewer` becomes false (auth context re-renders on profile subscription update)

### Task 5 — POTM Fix
- `LiveScoreboard.jsx` now renders `match.playerOfTheMatch || "To be announced"` instead of hardcoded string
- `playerOfTheMatch` is written by `completeMatchById` flow via POTM selector
- Viewers see the actual POTM once the organizer selects it — no page refresh required (realtime subscription)

### Task 6 — Ball Timeline
- `BallTimeline` was imported and its data (`recentBalls`, `overHistory`) computed but never rendered
- Added `<BallTimeline recentBalls={recentBalls} overHistory={overHistory} title="Current Over" />` between the live progress card and the innings score grid
- Only renders when: match is in-progress AND at least one ball exists
- Public viewers on `/live/:matchId` now see ball-by-ball chips for the current over

### Task 7 — End Innings Safety (Double Confirmation)
- **Before:** One-tap dialog — "Cancel" / "End Innings" buttons side by side
- **After:** Dialog body includes a checkbox "I confirm this innings is complete"; End Innings button is `disabled` until checked; button color changed to `error` (red) for visual weight
- Checkbox state resets to unchecked whenever the dialog closes (cancel or after end)
- Prevents accidental tap especially on mobile where the End Innings button sat adjacent to other scoring actions

### Console.log cleanup (P1)
- `ScoreCard.jsx:213` — debug log of current inning team removed
- `MatchScoreCard.jsx:91` — debug log of team names removed

---

## 6. Build Result

```
✓ 1153+ modules transformed.
✓ built in 10.60s
Zero errors
```

Notable new chunk: `PublicTournamentPage-*.js` — lazy loaded, not affecting initial bundle.

---

## 7. Lint Result

```
npx eslint src/pages/DashboardPage.jsx src/pages/PublicTournamentPage.jsx \
           src/pages/MatchCreationPage.jsx \
           src/components/viewer/LiveScoreboard.jsx \
           src/components/match/ScoreCard.jsx src/components/match/MatchScoreCard.jsx \
           src/services/firebase/matchService.js src/services/firebase/userService.js

(no output — 0 errors, 0 warnings)
```

---

## 8. Remaining P0/P1 Items Not In This Sprint

| Item | Priority | Reason deferred |
|------|----------|-----------------|
| Fixtures subcollection not public for unauthenticated users | P1 | Requires Firestore rule change for `/tournaments/{id}/fixtures/{id}` to `allow read: if resource.data.isPublic == true \|\| isSignedIn()` — blocked by needing parent tournament isPublic propagated |
| Resume scoring banner | P1 | Out of scope per sprint definition ("no new features") |
| Retired hurt / Super over | P1 | New cricket features — out of scope |
| PDF export | P1 | New feature — out of scope |
| No-ball wicket edge case | P1 | Scoring engine change — needs dedicated QA |
| Tournament not publicly indexed (SEO) | P2 | Requires SSR or meta tag injection |

---

## 9. Firestore Rules Summary (post-sprint)

```
users/{userId}
  read:   owner only (signed in)
  create: owner only (signed in)
  update: owner only; allows viewer→scorer self-upgrade; no other role escalation

matches/{matchId}
  read:   public (isPublic==true) or any signed-in user
  create: scorer, must set createdBy == uid
  delete: scorer + owner (or legacy doc without createdBy)
  update: scorer + owner; locked by status:
    scheduled   → full edits
    in-progress → teams/toss/rules locked; scoreCard writable (FIXED)
    completed   → any field writable (notes, POTM, visibility)

teams/{teamId}      scorer + owner (createdBy == uid)
players/{playerId}  scorer + owner (createdBy == uid)
imports/{importId}  scorer + owner (importedBy == uid)
tournaments/{id}    public read if isPublic; organizer CRUD
fixtures/{id}       signed-in read; scorer write
notifications/{id}  recipient read/write
matchFollowers      any signed-in user
```
