# Navigation Improvement Report

**Date:** 2026-06-20  
**Scope:** Scorer navigation only — viewer navigation unchanged.

---

## Files Changed

| File | Change |
|---|---|
| `src/layout/AppShell.jsx` | Added Create Match to scorer nav items, sidebar render, mobile nav |

---

## Sidebar Changes

### New nav item — Create Match (scorer only)

Added at index 1, directly below Dashboard:

```
[0] Dashboard
[1] Create Match   ← NEW (primary action)
── divider ──
[2] Teams
[3] Players
[4] Tournaments
── divider ──
[5] Import Teams
── divider ──
[6] Settings
```

`scorerDividers` updated from `new Set([1, 4, 5])` → `new Set([2, 5, 6])` to preserve the existing section grouping after the insertion.

### Visual treatment

Create Match uses a dedicated gradient button instead of the standard `navItemSx` style:

- **Background:** `linear-gradient(135deg, #6C63FF → #8B5CF6)` (brand purple)
- **Text/icon color:** `#fff` (always white regardless of selection state)
- **Box shadow:** `0 2px 10px rgba(108, 99, 255, 0.35)` — gives a lifted, prominent feel
- **Hover:** darkens gradient to `#5A52E8 → #7C3AED`
- **Icon:** `AddCircleOutlinedIcon`

Regular nav items remain unchanged in appearance.

---

## Mobile Navigation Changes

### Scorer mobile bottom nav — 5-item priority subset

The full scorer sidebar has 7 items, which would be too cramped in the mobile bottom bar. A `mobileNavItems` computed value filters to the 5 most important routes:

```
Dashboard | Create Match | Teams | Tournaments | Settings
```

Players and Import Teams remain accessible via the hamburger menu (mobile drawer). Viewer mobile nav is unaffected — it continues to use the full `navItems` array.

### Create Match visual treatment in mobile nav

The Create Match `IconButton` in the mobile bar receives the same gradient styling:

- `background: linear-gradient(135deg, #6C63FF → #8B5CF6)`
- `color: #fff`
- `boxShadow: 0 2px 8px rgba(108, 99, 255, 0.4)`
- Slight horizontal margin (`mx: 0.5`) to visually separate it from adjacent icons

All other mobile nav icons use the existing selected/unselected colour logic.

---

## Build Result

```
✓ 1501 modules transformed.
✓ built in 7.40s
```

No errors. Pre-existing chunk-size advisory on `index.js` (~953 kB before gzip) is unrelated to these changes.

---

## Lint Result

```
npx eslint src/layout/AppShell.jsx --max-warnings=0
(no output — zero warnings, zero errors)
```
