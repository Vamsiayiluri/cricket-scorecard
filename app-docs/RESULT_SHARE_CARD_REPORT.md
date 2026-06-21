# Result Share Card — Implementation Report (Wave 2A)
**Date:** June 20, 2026  
**Scope:** Client-side result card generation with Download PNG, Share (native), and Copy Image.  
**Goal:** Increase organic sharing and user acquisition by turning every completed match into a shareable moment.

---

## 1. Files Changed

| File | Type | Purpose |
|---|---|---|
| `src/components/match/ResultShareCard.jsx` | New | Self-contained share card component (inline CSS for html2canvas) |
| `src/components/match/ResultShareDialog.jsx` | New | Dialog with preview, Download PNG, Share, Copy Image actions |
| `src/utils/shareCard.js` | New | html2canvas capture + download/share/copy utilities |
| `src/components/match/MatchScoreCard.jsx` | Modified | "Share Result Card" button on completed scorecard |
| `src/pages/MatchDetailsPage.jsx` | Modified | "Share Result Card" button on match details page (completed only) |
| `src/pages/PublicScorecardPage.jsx` | Modified | "Share Result Card" button on public scorecard (completed only) |

**Dependency added:** `html2canvas` (v1.x) — dynamically imported via `await import("html2canvas")` so it only loads on first capture, not on page load.

---

## 2. Sharing Flow

```
User opens completed match (any of 3 locations)
    ↓
Clicks "Share Result Card" button
    ↓
ResultShareDialog opens
    ↓
Live card preview shown (scaled to fit dialog)
    ↓
User selects action:
    ├── Download PNG  → html2canvas captures hidden full-size card → .png download
    ├── Share (native) → html2canvas → Web Share API with image file
    │       └── Fallback: URL-only share if file sharing unsupported
    └── Copy Image   → html2canvas → Clipboard API (image/png blob)
```

The dialog renders two instances of `ResultShareCard`:
1. **Visible preview** — scaled via `transform: scale(0.82/0.92)` inside the dialog body
2. **Hidden full-size card** — fixed at `left: -9999px`, captured by html2canvas at 2× scale (800px effective width)

Capturing the hidden off-screen element (instead of the visible MUI-wrapped preview) avoids any dialog overlay, transform, or backdrop interference that could distort the output.

---

## 3. Card Content

| Section | Data Source |
|---|---|
| CricVelo brand logo + "Cricket Scorecard" label | Static (hardcoded brand identity) |
| "Match Result" chip (top right) | Static label |
| Match title (optional) | `match.matchDetails.title` |
| Venue | `match.matchDetails.location` |
| Date | `match.matchDetails.date` → `formatMatchDate()` |
| Team 1 name + score | `match.scoreCard.innings[0].team` → `match.teams[key].name`, runs/wickets/overs |
| Team 2 name + score | `match.scoreCard.innings[1].team` → same |
| Winner highlighted | `getMatchOutcome(match)` — amber stripe on winning team row |
| Result line | `match.resultSummary` or derived via `getMatchOutcome()` |
| Player of the Match | `match.playerOfTheMatch` — shown with trophy emoji if set |
| Footer | `cricvelo.app · Score every moment.` |

Tie matches are supported: both teams show in neutral grey, result displays "Match Tied" instead of a winner name.

---

## 4. Generation Strategy

### Why inline CSS?

html2canvas reads computed styles from the DOM. MUI Emotion-generated class names can be unreliable to capture (class names are hashed, transitions may not render, pseudo-elements may be skipped). `ResultShareCard` uses **exclusively inline styles** — the simplest and most reliable DOM structure html2canvas supports.

### Capture settings

```js
html2canvas(element, {
  scale: 2,           // 2× → 800px effective width at 400px card
  useCORS: true,      // allow cross-origin images if any
  logging: false,     // suppress console noise
  backgroundColor: null,  // respect card's own background
  allowTaint: true,   // don't block on tainted canvas
})
```

### Dynamic import

```js
const { default: html2canvas } = await import("html2canvas");
```

This keeps html2canvas out of the main bundle entirely. The `html2canvas.esm-*.js` chunk (201 KB / 48 KB gzipped) only downloads when the user first clicks a capture action.

### Card dimensions

- Width: **400px fixed** (set on the root `<div>`)
- Height: **auto** (content-driven, typically 480–580px depending on whether POTM and venue are populated)
- Capture output at 2×: **800px × ~960–1160px PNG**

---

## 5. Sharing Capabilities

| Action | API Used | Fallback |
|---|---|---|
| Download PNG | `<a download>` + `canvas.toDataURL()` | None needed — universally supported |
| Share (native) | `navigator.share({ files: [File] })` | URL-only share if file-share unsupported; button hidden if `navigator.share` absent |
| Copy Image | `navigator.clipboard.write([ClipboardItem])` | Toast: "try Download" if unsupported |

The "Share" button is conditionally rendered: `{canNativeShare && <AppButton>Share</AppButton>}` so it only appears on mobile browsers that support `navigator.share`.

---

## 6. Validation

| Scenario | Expected Result |
|---|---|
| Download PNG | File saved as `team-a-vs-team-b-result.png` at 800×~960px |
| Share (mobile Chrome/Safari) | System share sheet opens with PNG attachment |
| Copy Image | Image pasted into WhatsApp/chat |
| Completed match with POTM | Trophy + player name rendered in gold section |
| Completed match without POTM | POTM section absent; card still valid |
| Tie match | Both teams neutral grey; "Match Tied" result text; no winner stripe |
| Match without venue/location | Venue line omitted; date line still shown if available |
| Match without title | Title line omitted; no empty gap |
| `Share` button on `PublicScorecardPage` | Visible only for completed matches; absent for in-progress |
| `Share Result Card` on `MatchDetailsPage` | Only rendered when `isCompletedMatch(match) === true` |
| html2canvas loading | ~48KB chunk only fetched on first capture action |

---

## 7. Build Result

```
✓ built in 10.13s
1111 modules transformed — zero errors

New chunks:
  dist/assets/ResultShareDialog-CBUgf65e.js  10.43 kB  │ gzip:  3.88 kB
  dist/assets/html2canvas.esm-CBrSDip1.js  201.42 kB   │ gzip: 48.03 kB  (lazy-loaded)

Modified chunks:
  dist/assets/ScoreCard-BgBOPstt.js       +0.44 kB  (ResultShareDialog import)
  dist/assets/MatchDetailsPage-C5xQH3U2.js +0.36 kB
  dist/assets/PublicScorecardPage-D0T5qj5F.js +0.49 kB
```

The `html2canvas.esm` chunk is **not in the initial bundle** — it is lazily fetched only on first user interaction with the capture flow.

---

## 8. Lint Result

**All Wave 2A files: zero errors, zero warnings.**

```
npx eslint \
  src/components/match/ResultShareCard.jsx \
  src/components/match/ResultShareDialog.jsx \
  src/utils/shareCard.js \
  src/components/match/MatchScoreCard.jsx \
  src/pages/MatchDetailsPage.jsx \
  src/pages/PublicScorecardPage.jsx
→ (no output — clean)
```

Pre-existing lint errors in other files: 45 errors, 6 warnings — all pre-existing, none introduced in Wave 2A.

---

## 9. Future Enhancements

| Enhancement | Notes |
|---|---|
| **Team colors** | Add optional brand color per team; shade team rows in their color |
| **Match format badge** | Show "T20 · 20 overs" above the scores |
| **Top performers line** | "Most runs: X (N runs) · Most wickets: Y (N wkts)" from innings data |
| **QR code** | Embed QR pointing to public scorecard URL so viewers can scan the image to open the full scorecard |
| **Dark/light card themes** | Currently always dark. Add a light "print" theme for users who prefer it |
| **Animated reveal (canvas)** | Cricket-themed reveal animation before export (runs counter, confetti) |
| **Server-side image generation** | Cloudflare Worker or Firebase Function using Satori/Resvg for pixel-perfect cross-browser consistency without html2canvas limitations |
| **Instagram Story format** | 9:16 portrait variant (1080×1920) with larger typography for full-bleed Stories |
| **Auto-prompt after match completion** | After POTM is selected in MatchScoreCard, auto-open the share dialog as a celebration moment |
| **WhatsApp text fallback** | If image sharing fails entirely, offer a pre-formatted WhatsApp text message with the result |

---

*Wave 2A complete. Build passes. Zero lint errors in all new/changed files.*
