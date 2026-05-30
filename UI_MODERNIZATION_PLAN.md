# CricVelo UI Modernization Plan

## Objective

Modernize CricVelo into a clean, premium, mobile-friendly cricket scoring SaaS while preserving all existing product behavior, scoring logic, match lifecycle, authentication behavior, and Firestore interactions.

## Design Direction

CricVelo should feel like a focused sports operations product: fast to scan, calm under pressure, polished enough to share publicly, and ergonomic enough for one-handed mobile scoring.

Reference qualities:

- Sofascore and Cricbuzz for sports density and live-match clarity.
- Linear, Vercel, Notion, Stripe Dashboard, Figma, Discord, and Arc for calm product surfaces, hierarchy, spacing, and navigation polish.

Avoid:

- Heavy glassmorphism.
- Excessive blur and shadows.
- Oversized rounded corners.
- Overuse of gradients.
- Cluttered card stacks.
- Dark-mode-only color decisions.

## Design System Principles

- Use 8px spacing rhythm.
- Use 10px to 14px radius for cards, dialogs, inputs, and buttons.
- Prefer subtle surfaces over glow effects.
- Use theme-aware colors for dark and light modes.
- Use accent color intentionally for live status, primary actions, and cricket state.
- Keep mobile touch targets at least 44px.
- Prioritize information hierarchy over decorative styling.

## Phase 1: Design System

Scope:

- Theme palette.
- Typography scale.
- Card, paper, button, input, chip, dialog, table, and loading styles.
- Global CSS utilities.
- Light/dark contrast consistency.

Deliverable:

- `PHASE_1_DESIGN_SYSTEM_COMPLETION_REPORT.md`

Validation:

- Build passes.
- Lint touched files.
- Manual scan of dark/light shell, dashboard, forms, and scorecard surfaces.

## Phase 2: Authentication Screens

Scope:

- Login.
- Register.
- Forgot password dialog.
- Auth error/success states.
- Mobile auth layout.

Goals:

- Softer SaaS onboarding.
- Better contrast in light and dark modes.
- Cleaner copy hierarchy.
- Less heavy visual treatment.

Deliverable:

- `PHASE_2_AUTH_UI_COMPLETION_REPORT.md`

## Phase 3: Dashboard

Scope:

- Summary cards.
- Match cards.
- Statistics cards.
- Empty states.
- Loading states.
- Header/sidebar integration.

Goals:

- Modern sports analytics dashboard.
- Faster scanning of live, scheduled, and completed matches.
- Better mobile card density.

Deliverable:

- `PHASE_3_DASHBOARD_UI_COMPLETION_REPORT.md`

## Phase 4: Match Creation

Scope:

- Stepper.
- Form layout.
- Validation presentation.
- Review screen.
- Draft recovery presentation.

Goals:

- Easier match setup.
- Stronger hierarchy.
- Mobile-friendly data entry.

Deliverable:

- `PHASE_4_MATCH_CREATION_UI_COMPLETION_REPORT.md`

## Phase 5: Live Scoring

Scope:

- Score display.
- Batter and bowler panels.
- Current over.
- Run buttons.
- Extras and wicket controls.
- Save/retry status treatment.

Goals:

- Fast one-handed scoring.
- Larger touch targets.
- Clear current state.
- Minimal distractions.

Deliverable:

- `PHASE_5_LIVE_SCORING_UI_COMPLETION_REPORT.md`

## Phase 6: Public Scorecard

Scope:

- Match summary.
- Result banner.
- Batting table.
- Bowling table.
- Timeline.
- Mobile scorecard readability.

Goals:

- Share-worthy scorecard.
- Better public viewing on mobile.
- Stronger match-result clarity.

Deliverable:

- `PHASE_6_PUBLIC_SCORECARD_UI_COMPLETION_REPORT.md`

## Phase 7: Mobile Optimization

Scope:

- Header/sidebar mobile behavior.
- Mobile navigation.
- Scoring touch targets.
- Match cards.
- Forms and dialogs.
- Tables and scorecard overflow.

Goals:

- Excellent phone experience.
- No overlapping controls.
- Readable tables and cards.
- One-handed scoring ergonomics.

Deliverable:

- `PHASE_7_MOBILE_UI_COMPLETION_REPORT.md`

## Non-Goals

- No scoring logic changes.
- No match lifecycle changes.
- No Firestore schema or persistence changes.
- No authentication behavior changes.
- No ownership or authorization model changes.

## Final Validation

- Production build.
- Lint touched files.
- Dark mode visual pass.
- Light mode visual pass.
- Desktop layout pass.
- Mobile layout pass.
- Authentication smoke check.
- Dashboard smoke check.
- Match creation smoke check.
- Live scoring UI smoke check without altering scoring rules.
- Public scorecard smoke check.

