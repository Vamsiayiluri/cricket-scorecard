# Match Discovery — Implementation Report (Wave 2B)
**Date:** June 20, 2026  
**Scope:** Public `/discover` page for browsing cricket activity — Live, Results, Upcoming, and Search.  
**Goal:** Give viewers a place to find matches organically instead of requiring a direct link.

---

## 1. Files Changed

| File | Type | Purpose |
|---|---|---|
| `src/services/firebase/constants.js` | Modified | Added `/discover` to `PUBLIC_ROUTE_PREFIXES` |
| `src/services/firebase/discoveryService.js` | New | Firestore query + client-side partition into live/results/upcoming/all |
| `src/hooks/firebase/useDiscoverMatches.js` | New | One-time fetch hook returning `{ live, results, upcoming, all, loading, error }` |
| `src/pages/DiscoverPage.jsx` | New | Full discovery page — Live, Results, Upcoming sections + search bar |
| `src/App.jsx` | Modified | Added `/discover` route (no auth wrapper — public) |
| `src/layout/AppShell.jsx` | Modified | Added "Discover" nav item for authenticated users + Discover link in public drawer |

---

## 2. Discovery Strategy

The page has four sections:

### Live Now
- Matches with `status === "in-progress"`, sorted by `updatedAt` descending
- Shows current batting team, score (`runs/wickets`), overs, target (2nd innings)
- Pulsing red dot live badge + "Watch Live" CTA → `/live/:matchId`
- Up to 10 matches shown

### Recent Results
- Matches where `isCompletedMatch(match) === true`, sorted by `updatedAt` descending
- Shows both innings rows with winner highlighted in amber; result line; POTM
- "View Scorecard" CTA → `/scorecard/:matchId`
- Up to 20 matches shown

### Upcoming Fixtures
- Matches with `status === "scheduled"` and no `archivedAt`, sorted by `matchDetails.date` ascending
- Shows team A vs team B, date, location, overs format
- "View Details" CTA → `/scorecard/:matchId`
- Up to 10 fixtures shown

### Search
- Client-side filter over `all` (up to 120 public matches)
- Searches: `teams.teamA.name`, `teams.teamB.name`, `matchDetails.teamA`, `matchDetails.teamB`, `matchDetails.title`
- Case-insensitive substring match
- Status chip (Live / Completed / Upcoming) + "Open" button → live page or scorecard

---

## 3. Query Strategy

```js
query(
  collection(db, "matches"),
  where("isPublic", "==", true),
  limit(120)
)
```

**Why this works without auth:**  
The Firestore security rule `allow read: if isPublicMatch() || isSignedIn()` grants access when `isPublic == true`. A `where("isPublic", "==", true)` query guarantees every returned document satisfies `isPublicMatch()`, so unauthenticated users can fetch the entire result set without a permissions error.

**Why no composite index:**  
`where("isPublic", "==", true)` is a single-field equality filter. Firestore auto-generates single-field indexes for every field, so no `firestore.indexes.json` entry is needed.

**Client-side partition:**  
All sorting and category splitting is done in JS after the single query returns. This avoids needing multiple queries or composite indexes (which would require Firestore index definitions and deployment).

**Limit 120:**  
Caps the payload without paginating — enough for a meaningful discovery experience. A match that is not public is never returned, and deleted matches (`deletedAt` set) are filtered out client-side.

---

## 4. Public Route Handling

`/discover` added to `PUBLIC_ROUTE_PREFIXES`:
```js
export const PUBLIC_ROUTE_PREFIXES = ["/live/", "/scorecard/", "/discover"];
```

`isPublicPath(pathname)` in `AppShell` uses `pathname.startsWith(prefix)`, so `/discover` covers the route and any future sub-paths. The route in `App.jsx` has no `ProtectedRoute` wrapper — unauthenticated users can access it directly.

Authenticated users see "Discover" in both the sidebar drawer and the mobile bottom nav. Unauthenticated users on a public page (e.g., `/live/:matchId`, `/scorecard/:matchId`) see a "Discover" item in the drawer alongside "Sign In".

---

## 5. UI Design

**Inspired by:** Cricbuzz, Sofascore, CricHeroes sports feed patterns.

- **Card-per-match** layout in a responsive MUI Grid (1 column mobile → 2 sm → 3 md)
- **Status chips** use semantic colors: Live = red, Completed = green, Upcoming = sky blue
- **Live cards** have a red top accent bar + pulsing red dot
- **Result cards** have a green top accent bar; winner row highlighted amber
- **Skeleton loaders** shown during fetch — avoids layout shift
- **Empty states** per section with a cricket icon + contextual message
- **Search** replaces all three sections with a flat list of `SearchResultCard`s — no re-fetch, instant filtering
- Mobile-first: all cards stack to full width on xs

---

## 6. Validation

| Scenario | Expected Result |
|---|---|
| Live match exists and is public | Appears in "Live Now" with current score and "Watch Live" button |
| Completed match is public | Appears in "Recent Results" with both innings, result, POTM (if set) |
| Scheduled match is public | Appears in "Upcoming Fixtures" with date and teams |
| Non-public match | Never returned by Firestore query — does not appear anywhere |
| Search by team name | Instant filter; shows matching matches across all statuses |
| Search by match title | Matches against `matchDetails.title` |
| No results for search query | "No public matches found for …" empty state |
| Navigate → Watch Live | Navigates to `/live/:matchId` |
| Navigate → View Scorecard | Navigates to `/scorecard/:matchId` |
| Unauthenticated access to `/discover` | Page loads; no auth required; Firestore query succeeds |
| Authenticated user opens sidebar | "Discover" nav item present between "Dashboard" and "Create Match" |
| Mobile layout | Cards stack to 1-column; bottom nav includes Discover |
| Loading state | Skeleton cards shown per section until fetch resolves |
| Error state | Single error banner shown; sections not rendered |

---

## 7. Build Result

```
✓ built in 5.80s
1118 modules transformed — zero errors

New chunk:
  dist/assets/DiscoverPage-BnpwP1hf.js   19.17 kB │ gzip: 5.77 kB  (lazy-loaded)

New files (created before this build):
  dist/assets/discoveryService bundled into DiscoverPage chunk
  dist/assets/useDiscoverMatches bundled into DiscoverPage chunk
```

`DiscoverPage` is a separate lazy chunk — only loaded when a user navigates to `/discover`. The initial bundle is unaffected.

---

## 8. Lint Result

**All Wave 2B files: zero errors, zero warnings.**

```
npx eslint \
  src/pages/DiscoverPage.jsx \
  src/services/firebase/discoveryService.js \
  src/hooks/firebase/useDiscoverMatches.js \
  src/services/firebase/constants.js \
  src/App.jsx \
  src/layout/AppShell.jsx
→ (no output — clean)
```

**Bonus fix:** Removed pre-existing unused `InputBase` and `SearchIcon` imports from `AppShell.jsx` (2 pre-existing lint errors eliminated).

Pre-existing lint errors in other files: 43 errors, 6 warnings — all pre-existing (down 2 from Wave 2A's 45 due to AppShell cleanup), none introduced in Wave 2B.

---

## 9. Future Enhancements

| Enhancement | Notes |
|---|---|
| **Realtime live score updates** | Replace one-time fetch with `onSnapshot` for the live section only — scores update without page refresh |
| **Infinite scroll / pagination** | Load more results beyond the 120-match limit; "Load more" button per section |
| **Filter by match type** | Chip filters: T20, ODI, Test, Custom — narrows all three sections |
| **Filter by date range** | Date picker for "upcoming in the next 7 days" or "results from last month" |
| **Featured/pinned match** | Admin-pinnable "featured" match shown in a hero card at the top of the page |
| **Share discovery link** | Copy link to a specific section anchor (`/discover#live`, `#results`) |
| **Venue-based discovery** | Group or filter matches by location/city |
| **Team-based discovery** | "See all matches for [Team Name]" — filter by team in search |
| **Push notifications** | "Notify me when [Team] goes live" — requires FCM integration |
| **Match preview** | Hover/tap a card to see a quick pop-up with last over details before clicking through |

---

*Wave 2B complete. Build passes. Zero lint errors in all new/changed files.*
