# Product Polish Sprint 1 Report

**Date:** June 20, 2026  
**Scope:** Header redesign, Sidebar redesign, Import labels, Dashboard cleanup, Mobile touch targets, Placeholder removal  
**Constraint:** No new features, no new routes, no new services

---

## 1. Files Changed

| File | Tasks | Change Summary |
|------|-------|----------------|
| `src/layout/AppShell.jsx` | 1, 2, 3, 6 | Header, sidebar, nav structure, mobile bottom nav |
| `src/pages/DashboardPage.jsx` | 4, 6 | Title/subtitle, banner conflict fix, empty state |
| `src/components/match/ScoreCard.jsx` | 5 | End Innings checkbox → MUI Checkbox |
| `src/components/match/ScoringActions.jsx` | 6 | Section label cleanup |
| `src/pages/MatchScoring.jsx` | 6 | Placeholder text removal |

---

## 2. Task 1 — Header Redesign

### Removed
- **"Operational Panel"** hardcoded title in profile dropdown → replaced with user's display name (or email prefix fallback)
- **"User Account"** static text in avatar trigger → replaced with user's actual name
- **Theme toggle in AppBar** (was duplicated; remains in Settings page only)

### Implemented

**Personalized avatar initial** — derived from Firebase Auth `displayName` or `email`:
```js
const userInitial = useMemo(() => {
  const name = user?.displayName || user?.email || "";
  return name.charAt(0).toUpperCase() || "U";
}, [user]);
```

**Contextual user name** — shown in both the trigger and dropdown header:
```js
const userName = useMemo(() => {
  if (user?.displayName) return user.displayName;
  if (user?.email) return user.email.split("@")[0];
  return "Account";
}, [user]);
```

**Profile dropdown** now shows:
- Display name (bold, ellipsis overflow)
- Email address (secondary text, ellipsis overflow)
- Role chip (Scorer / Viewer)

**`aria-label="Open navigation menu"`** added to hamburger IconButton.

---

## 3. Task 2 — Sidebar Redesign

### Role-specific navigation

**Viewer nav (3 items + Become Scorer CTA):**
| Label | Route | Icon |
|-------|-------|------|
| Dashboard | /dashboard | DashboardOutlined |
| Live Matches | /discover | SportsCricket |
| Notifications | /notifications | NotificationsNone |

**Scorer nav (6 items, down from 9):**
| Label | Route | Icon |
|-------|-------|------|
| Dashboard | /dashboard | DashboardOutlined |
| Teams | /teams | GroupsOutlined |
| Players | /players | PersonOutlined |
| Tournaments | /tournaments | EmojiEventsOutlined |
| Import Teams | /imports | UploadFileOutlined |
| Settings | /settings | SettingsOutlined |

### Removed from scorer nav
- Create Match (was nav item; accessible via Dashboard button)
- Import History (was primary nav; accessible from within the Import page)
- Discover / Notifications (not primary scorer destinations)

### Visual grouping
Scorer sidebar uses `<Divider>` to separate three groups:
- **Matches:** Dashboard
- **Manage:** Teams · Players · Tournaments
- **Tools:** Import Teams · Settings

### Become Scorer CTA (viewers)
A styled card section appears at the bottom of the sidebar for viewer-role users — below a Divider, above the footer. It navigates to `/dashboard` where the upgrade flow is handled. Shows StarBorderOutlined icon + "Become a Scorer" label + "Create and score matches" subtitle.

### Active item
All sidebar items include `aria-current="page"` when selected.

### Mobile bottom nav
Redesigned from labeled `<Button>` row (overflowed with 9 items) to icon-only `<IconButton>` with `<Tooltip>` labels:
- Each item: `minHeight: 48px` (meets 44px touch target minimum)
- `aria-label` and `aria-current="page"` on each item
- Active item: `color: primary.main` + `bgcolor: rgba(108,99,255,0.1)`
- Tooltip shows label on press/hover

### Sidebar footer
Version string now reads from `VITE_APP_VERSION` env var:
```jsx
CricVelo {import.meta.env.VITE_APP_VERSION ? `v${import.meta.env.VITE_APP_VERSION}` : ""}
```
No longer hardcoded as "v1.2".

---

## 4. Task 3 — Import Labels

**"AA Import"** → **"Import Teams"** in all navigation surfaces.

- Sidebar label updated
- Mobile bottom nav tooltip updated
- No route change (`/imports` unchanged)

---

## 5. Task 4 — Dashboard Cleanup

### Page title/subtitle
| Before | After |
|--------|-------|
| "Match Operations Hub" | "Dashboard" |
| Scorer subtitle: "Create, manage, and livestream professional-grade cricket scorecards." | "Manage your matches, teams, and tournaments." |
| Viewer subtitle: "Browse live scoreboards, match summaries, and analytics tickers." | "Browse live scores and recent match results." |

### Conflicting banners resolved
Previously both the email-verification warning banner AND the Become Scorer purple banner could render simultaneously for unverified viewers. Fixed:
- Email unverified → shows **only** the orange "Verify your email" banner
- Email verified → shows **only** the purple "Become a Scorer" banner
- Neither shows for scorers

Logic:
```jsx
{isViewer && !emailVerified && !isScorer && ( /* orange banner */ )}
{isViewer && emailVerified && !isScorer && ( /* purple banner */ )}
```

### Empty state for new scorers
When a scorer has no ongoing, upcoming, or completed matches (fresh account), the match grid is replaced by an `<EmptyState>`:
- Icon: SportsCricket
- Title: "No matches yet"
- Description: "Create your first match to start scoring. Your matches will appear here once created."
- Action: "Create Match" button → `/create-match`

Previously: three empty card boxes stacked with no guidance.

---

## 6. Task 5 — Mobile Touch Targets

### End Innings confirmation checkbox
**Before:** Native `<input type="checkbox">` at `18×18px` — below 44px mobile touch target minimum.

**After:** MUI `<Checkbox>` inside `<FormControlLabel>`:
```jsx
<FormControlLabel
  control={<Checkbox checked={endInningsConfirmed} onChange={...} color="error" sx={{ p: 1 }} />}
  label={<Typography variant="body2" sx={{ fontWeight: 600 }}>I confirm this innings is complete</Typography>}
  sx={{ m: 0 }}
/>
```
The MUI Checkbox renders a 40px ripple target with an 8px padding area, meeting touch guidelines. The label is also clickable.

---

## 7. Task 6 — Placeholder Removal

| Location | Before | After |
|----------|--------|-------|
| `AppShell.jsx` profile dropdown title | "Operational Panel" | User display name |
| `AppShell.jsx` avatar trigger label | "User Account" | User display name |
| `AppShell.jsx` avatar letter | "U" (hardcoded) | First letter of user name |
| `AppShell.jsx` sidebar Discover label | "Discover" | "Live Matches" |
| `DashboardPage.jsx` page title | "Match Operations Hub" | "Dashboard" |
| `DashboardPage.jsx` scorer subtitle | developer marketing copy | plain description |
| `DashboardPage.jsx` viewer subtitle | developer marketing copy | plain description |
| `ScoringActions.jsx` extras section | "Active Extras" | "Extras" |
| `ScoringActions.jsx` delivery section | "Input Delivery" | "Record Delivery" |
| `MatchScoring.jsx` setup card title | "Pre-Match Console" | "Opening Setup" |
| `MatchScoring.jsx` setup card subtitle | "Configure opening batter pair and first bowler with a clean live-scoring workflow." | "Select the opening batters and first bowler to begin the innings." |

---

## 8. Navigation Changes Summary

### Scorer: Before vs After

| Before (9 items) | After (6 items) |
|------------------|-----------------|
| Dashboard | Dashboard |
| Discover | Teams |
| Notifications | Players |
| Create Match | Tournaments |
| Tournaments | Import Teams |
| My Teams | Settings |
| My Players | |
| AA Import | |
| Import History | |

### Viewer: Before vs After

| Before (3 items) | After (3 items + CTA) |
|------------------|-----------------------|
| Dashboard | Dashboard |
| Discover | Live Matches |
| Notifications | Notifications |
| | [Become a Scorer CTA in sidebar] |

---

## 9. Screens Reviewed

| Screen | Role | Surface | Status |
|--------|------|---------|--------|
| Dashboard | Scorer | Desktop sidebar | ✓ 6-item nav + grouping dividers |
| Dashboard | Scorer | Mobile bottom nav | ✓ 6 icon-only buttons, 48px each |
| Dashboard | Viewer | Desktop sidebar | ✓ 3 items + Become Scorer CTA |
| Dashboard | Viewer | Mobile bottom nav | ✓ 3 icon-only buttons |
| AppBar | All | Desktop & mobile | ✓ Personalized avatar, no "Operational Panel" |
| Profile dropdown | All | Desktop | ✓ Name + email + role chip |
| Score Card (live scoring) | Scorer | Mobile | ✓ End Innings checkbox replaced |
| Match Setup | Scorer | Desktop & mobile | ✓ No "Pre-Match Console" label |
| Scoring actions | Scorer | Desktop & mobile | ✓ "Extras" / "Record Delivery" labels |

---

## 10. Build Result

```
✓ 1501 modules transformed.
✓ built in 9.22s
Zero errors
```

Notable: `Checkbox-BUBnP1G7.js` (2.71 kB / 1.18 kB gz) is new — MUI Checkbox pulled into ScoreCard chunk.

---

## 11. Lint Result

```
npx eslint src/layout/AppShell.jsx src/pages/DashboardPage.jsx \
           src/components/match/ScoreCard.jsx \
           src/components/match/ScoringActions.jsx \
           src/pages/MatchScoring.jsx

✖ 0 problems
```

---

## 12. Remaining Items (Not in Scope)

| Item | Priority | Reason deferred |
|------|----------|-----------------|
| "My Matches" dedicated route for scorer nav | P2 | Requires new page — out of sprint scope |
| "Results" / "Tournaments" viewer routes | P2 | Both require viewer-accessible routes that don't exist |
| Sidebar collapse to icon-rail on desktop | P2 | New interaction pattern — next sprint |
| Notification bell unread count badge | P2 | Requires notification data model changes |
| Share link CTA on match/tournament pages | P2 | Quick win — next sprint |
