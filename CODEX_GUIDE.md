# Codex Guide for CricVelo

Future Codex sessions should start here.

## How to Understand the Project

1. Read `PROJECT_CONTEXT.md`.
2. Read `ARCHITECTURE.md`.
3. Read `DATABASE.md`.
4. For feature work, read the relevant flow in `USER_FLOWS.md`.
5. For UI work, read `UI_DESIGN_SYSTEM.md`.
6. For scoring work, read `MVP_GAPS.md`, `TESTING_STRATEGY.md`, and source files under `src/components/match`, `src/helpers`, and `src/utils`.

## Required Documents by Task Type

- Product planning: `PROJECT_CONTEXT.md`, `FEATURE_STATUS.md`, `PRODUCT_ROADMAP.md`, `MVP_GAPS.md`.
- Architecture changes: `ARCHITECTURE.md`, `DATABASE.md`, `API_SERVICES.md`.
- Firebase/rules changes: `DATABASE.md`, `API_SERVICES.md`, `firestore.rules`.
- UI changes: `UI_DESIGN_SYSTEM.md`, `UI_UX_AUDIT.md`.
- Scoring changes: `USER_FLOWS.md`, `TESTING_STRATEGY.md`, `LIVE_SCORING_REVIEW.md`, `INNINGS_AND_MATCH_COMPLETION_REVIEW.md`.
- Release work: `TESTING_STRATEGY.md`, `QA_CHECKLIST.md`, `RC1_RELEASE_CANDIDATE_CHECKLIST.md`.

## Development Rules

- Do not change business logic during documentation-only tasks.
- Preserve existing service and hook patterns.
- Prefer shared UI components from `src/components/ui`.
- Keep match document shape backward-compatible.
- Do not introduce schema changes without updating `DATABASE.md` and Firestore rules review.
- Treat active scoring as high-risk; use tests and manual QA.
- Do not rely only on client-side route hiding for security.
- Do not overwrite unrelated dirty worktree changes.

## Validation Rules

Run validation appropriate to the change:

- `npm run build` for production build.
- `npm run lint` for static checks.
- Manual QA from `TESTING_STRATEGY.md` for user flows.
- For scoring logic, test at minimum:
  - normal runs
  - boundaries
  - wides
  - no-balls
  - byes/leg-byes
  - wickets
  - over completion
  - innings transition
  - target reached
  - tie
  - failed persistence/retry

If tests cannot be run, state that clearly in the final response.

## Coding Standards

- JavaScript ES modules.
- React functional components and hooks.
- MUI components and theme tokens.
- Keep comments concise and only where they clarify non-obvious logic.
- Avoid new abstractions unless they reduce real complexity.
- Use existing Firebase service wrappers instead of direct Firestore calls in pages when possible.
- Keep public pages read-only.
- Keep role checks in both UI routes and Firestore rules.

## Release Process

1. Confirm scope against `FEATURE_STATUS.md` and `MVP_GAPS.md`.
2. Implement narrowly.
3. Update affected docs if architecture, schema, routes, or user flows change.
4. Run build/lint and targeted tests.
5. Execute manual QA for changed flows.
6. Review security rules for any data access changes.
7. Update release checklist.
8. Deploy only after validation results are recorded.

## Feature Implementation Workflow

1. Identify owning agents from `AGENTS.md`.
2. Read relevant source and docs.
3. Map data model impact.
4. Define acceptance criteria.
5. Implement the smallest coherent change.
6. Add or update tests where risk warrants.
7. Run validation.
8. Summarize changed files, behavior, tests, and residual risks.

Recommended entry point for every session: `CODEX_GUIDE.md`, then `PROJECT_CONTEXT.md`.
