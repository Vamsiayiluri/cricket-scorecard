# Viewer Navigation Cleanup Report

Date: 2026-06-21

## Files changed

- `src/App.jsx`
- `src/layout/AppShell.jsx`
- `src/pages/BecomeScorerPage.jsx`
- `src/pages/DashboardPage.jsx`
- `VIEWER_NAVIGATION_CLEANUP_REPORT.md`

## Route changes

- Restored a valid authenticated route:
  - `/become-scorer`

The route now renders a dedicated `BecomeScorerPage`. It no longer redirects to or reuses `DashboardPage`.

## Navigation changes

- Restored `Become a Scorer` in the viewer sidebar navigation.
- `Become a Scorer` points to `/become-scorer`.
- `Become a Scorer` is styled as a primary viewer action.
- Removed the inactive old sidebar CTA block and stale sidebar navigation handler from `AppShell.jsx`.
- Preserved the viewer navigation items:
  - `Dashboard`
  - `Live Matches`
  - `Tournaments`
  - `Results`
  - `Become a Scorer`
- Preserved scorer navigation behavior, including the primary `Create Match` item.

## Dashboard upgrade flow

- The dashboard upgrade banner/CTA remains visible for eligible viewers.
- Dashboard CTA buttons now navigate to `/become-scorer` instead of submitting requests inline.
- The dedicated `/become-scorer` page handles scorer access requests when:
  - They are authenticated.
  - Their email is verified.
  - They do not already have a scorer request.
- The dedicated page also shows:
  - Email verification requirement and resend action.
  - Pending request status.
  - Rejected request status with `Request Again`.
  - Approved/already-scorer state.
- Verified `Become a Scorer` references are intentional:
  - Viewer navigation item.
  - `/become-scorer` route.
  - Dedicated `BecomeScorerPage`.
  - Email verification copy.
  - Dashboard CTA section.
  - Dashboard CTA button text.

## Mobile navigation

- Viewer mobile navigation derives from the same viewer `navItems` list in `AppShell.jsx`.
- `Become a Scorer` appears in viewer mobile navigation through the shared viewer nav list.
- The mobile navigation path is valid: `/become-scorer`.

## Validation results

- Searched `src` for `become-scorer`: matches are route, viewer navigation, and dashboard CTA navigation.
- Searched `src` for `Become a Scorer`: matches are intentional navigation, dedicated page, and dashboard CTA references.
- Dashboard upgrade CTA is active and links to the dedicated page.
- `/become-scorer` renders `BecomeScorerPage`, not `DashboardPage`.
- Changed-file ESLint passed:
  - `eslint src/App.jsx src/layout/AppShell.jsx src/pages/DashboardPage.jsx src/pages/BecomeScorerPage.jsx`

## Build result

- Passed:
  - `npm run build`
- Vite completed successfully.
- Existing warning remains:
  - Some chunks are larger than 500 kB after minification.

## Lint result

- Changed-file lint passed:
  - `eslint src/App.jsx src/layout/AppShell.jsx`
- Full repository lint still fails on existing unrelated issues:
  - `40` errors and `11` warnings.
  - Examples include unused React imports, missing prop validation, hook dependency warnings, and unused eslint-disable directives in files outside this cleanup scope.
