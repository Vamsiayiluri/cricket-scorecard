# CricVelo Project Agents

This file defines the specialized agents future Codex sessions should use when changing or reviewing CricVelo. Invoke agents by responsibility, not by job title alone. Agents may overlap; for risky changes, use the owning agent plus QA and Security.

## Product Manager Agent

Responsibilities:
- Preserve the product direction for grassroots cricket scoring, public viewing, and organizer workflows.
- Translate roadmap and MVP gaps into scoped implementation tasks.
- Decide whether a request belongs in MVP stabilization, growth, or future platform work.

Files they own:
- `PROJECT_CONTEXT.md`
- `FEATURE_STATUS.md`
- `PRODUCT_ROADMAP.md`
- `MVP_GAPS.md`
- Existing product review docs in the repository root.

Areas they review:
- User roles and permissions from a product perspective.
- Match lifecycle completeness.
- Viewer, scorer, admin, and future organizer journeys.
- Priority ranking and launch readiness.

When to invoke:
- Before implementing a new feature.
- When changing role behavior, match lifecycle, or public sharing.
- When updating roadmap, MVP scope, or acceptance criteria.

## UI/UX Agent

Responsibilities:
- Keep the app consistent with the CricVelo design system and MUI-based component language.
- Review responsive layouts, dense scoring workflows, public scorecards, and accessibility.
- Ensure UI changes use existing shared components where practical.

Files they own:
- `UI_DESIGN_SYSTEM.md`
- `src/theme.js`
- `src/index.css`
- `src/App.css`
- `src/components/ui/*`
- `src/layout/AppShell.jsx`

Areas they review:
- Dashboard cards.
- Match creation wizard.
- Opening setup.
- Live scoring controls.
- Public viewer pages.
- Empty, loading, error, and unauthorized states.

When to invoke:
- Any visible UI change.
- Any page layout, theme, typography, spacing, or component API change.
- Before shipping a workflow used on mobile during live scoring.

## Frontend Agent

Responsibilities:
- Own React routing, pages, components, hooks, local state, and Redux integration.
- Keep code aligned with current Vite React, React Router, MUI, and existing service patterns.
- Avoid business logic changes unless explicitly required by the task.

Files they own:
- `src/App.jsx`
- `src/main.jsx`
- `src/pages/*`
- `src/components/*`
- `src/hooks/*`
- `src/store/*`
- `src/utils/*`
- `src/helpers/*`

Areas they review:
- Route protection.
- Component hierarchy.
- State ownership.
- Data loading and realtime subscriptions.
- Form validation and draft persistence.

When to invoke:
- Any React code change.
- Route additions or changes.
- Hook, utility, component, or page modifications.

## Firebase Agent

Responsibilities:
- Own Firebase initialization, Firestore reads/writes, realtime listeners, rules, indexes, and deployment config.
- Preserve backward compatibility with existing match documents.
- Review permissions against the role model and public viewer requirements.

Files they own:
- `firebase.json`
- `.firebaserc`
- `firestore.rules`
- `firestore.indexes.json`
- `src/firebase-config.js`
- `src/config/env.js`
- `src/services/firebase/*`
- `src/hooks/firebase/*`

Areas they review:
- Firestore document schemas.
- Security rules.
- Query patterns and index needs.
- Realtime listener usage.
- Persistence and failed-write recovery.

When to invoke:
- Any Firestore schema, query, service, rules, or index change.
- Any public/private match behavior change.
- Any auth profile or role change.

## Cricket Rules Agent

Responsibilities:
- Validate cricket scoring correctness, innings transitions, legal-ball rules, wickets, targets, and result calculations.
- Identify rule gaps before product or UI polish work hides correctness risks.

Files they own:
- `src/helpers/updateScorecard.js`
- `src/components/match/ScoringActions.jsx`
- `src/components/match/ScoreCard.jsx`
- `src/components/match/StartMatch.jsx`
- `src/components/match/EndOfInnings.jsx`
- `src/utils/matchDisplay.js`
- `src/utils/scorecardTimeline.js`

Areas they review:
- Runs, boundaries, wides, no-balls, byes, leg-byes.
- Wickets and replacement batter selection.
- Bowler overs and current bowler rotation.
- Team-size-aware all-out logic.
- Target reached, tie, winner, and margin calculation.

When to invoke:
- Any scoring, innings, completion, or scorecard display change.
- Any bug fix involving cricket statistics.
- Any test design for scoring rules.

## QA Agent

Responsibilities:
- Maintain manual test flows, regression coverage, and release acceptance criteria.
- Review whether a change needs unit, integration, or manual verification.
- Track known gaps where automated tests are missing.

Files they own:
- `TESTING_STRATEGY.md`
- `QA_CHECKLIST.md`
- `RC1_RELEASE_CANDIDATE_CHECKLIST.md`
- Any future `test/*` files.

Areas they review:
- Auth and role-based routing.
- Match creation validation.
- Opening setup.
- Live scoring edge cases.
- Innings completion.
- Public viewer behavior.
- Build and lint status.

When to invoke:
- Before finalizing any code change.
- Before release or deployment.
- When regressions are suspected or a feature touches scoring data.

## Security Agent

Responsibilities:
- Review auth, role access, public data exposure, Firestore rules, and unsafe client assumptions.
- Verify that scorer/admin privileges cannot be gained accidentally.
- Flag gaps in ownership, auditability, and destructive actions.

Files they own:
- `firestore.rules`
- `src/context/AuthContext.jsx`
- `src/pages/ProtectedRoute.jsx`
- `src/pages/ScorerRoute.jsx`
- `src/services/firebase/authService.js`
- `src/services/firebase/userService.js`
- `src/utils/roles.js`

Areas they review:
- Email verification enforcement.
- User profile creation and role resolution.
- Scorer/admin route access.
- Public/private match reads.
- Match edit, archive, delete, and visibility permissions.

When to invoke:
- Any auth, route protection, role, rules, or visibility change.
- Before exposing new public pages.
- Before adding admin or organizer features.
