# CricVelo UI Design System

## Design Direction

CricVelo is an operational cricket scoring product. The UI should feel fast, focused, and professional, especially during live scoring. Avoid decorative landing-page patterns inside the app. Prioritize dense but readable information, clear hierarchy, and reliable mobile controls.

## Theme

Theme factory: `src/theme.js` via `createAppTheme(mode)`.

Default mode:
- App starts in dark mode from `src/main.jsx`.
- `ThemeModeContext` provides mode and toggle.

Primary UI framework:
- MUI v6.
- Emotion styling.
- MUI icons.

## Colors

Core palette:
- Primary: `#6C63FF`
- Primary dark: `#5b53e6`
- Primary light: `#8b84ff`
- Secondary: `#8B5CF6`
- Success: `#22C55E`
- Warning: `#F59E0B`
- Error: `#EF4444`
- Info: `#38BDF8`

Dark mode:
- Background default: `#08111f`
- Background paper: `#101827`
- Text primary: `#F8FAFC`
- Text secondary: `#A3AEC2`
- Divider: `rgba(255, 255, 255, 0.08)`

Light mode:
- Background default: `#f6f7fb`
- Background paper: `#ffffff`
- Text primary: `#111827`
- Text secondary: `#64748b`
- Divider: `rgba(15, 23, 42, 0.09)`

Usage guidance:
- Use success for live/saved/positive statuses.
- Use warning for pending/saving/caution states.
- Use error for destructive or failed states.
- Use primary/secondary gradients sparingly for primary actions and score emphasis.

## Typography

Font family:
- `'Plus Jakarta Sans', 'Inter', 'Roboto', 'Helvetica', sans-serif`

Scale:
- `h1`: 2.0rem, 800, line-height 1.12.
- `h2`: 1.5rem, 800.
- `h3`: 1.18rem, 750.
- `h4`: 1.05rem, 750.
- `subtitle1`: 0.925rem, 600.
- `body1`: 0.9rem.
- `body2`: 0.84rem.
- `caption`: 0.73rem, 550.

Guidance:
- Use hero-scale type only for page-level titles and live score numbers.
- Keep card/panel headings compact.
- Avoid negative letter spacing for new compact UI.

## Spacing

Base spacing unit:
- MUI spacing `8px`.

Common patterns:
- Page sections: 16-24px gaps.
- Cards/papers: 12-24px padding depending on density.
- Live scoring controls: stable fixed dimensions to avoid layout shift.
- Mobile: use stacked controls and full-width primary actions where appropriate.

## Border Radius

Theme default:
- `shape.borderRadius = 12`.

Common usage:
- Cards/papers/buttons/inputs/chips: 12px by theme.
- Dense scoring panels often use `borderRadius: 1`, which maps to 8px.
- Avoid overly rounded rectangular text controls unless the component is already standardized.

## Shadows

Default card shadows are subtle.

Dark mode:
- `0 10px 28px -20px rgba(0, 0, 0, 0.65)`

Light mode:
- `0 10px 28px -22px rgba(15, 23, 42, 0.25)`

Guidance:
- Prefer borders and spacing over heavy shadows.
- Live scoring panels should prioritize clarity over decoration.

## Components

Shared UI components:
- `AppButton`
- `AppCard`
- `AppDialog`
- `AppInput`
- `EmptyState`
- `ErrorState`
- `LoadingState`
- `PageContainer`
- `StatusBadge`

Feature components:
- Dashboard cards in `src/components/Dashboard`.
- Match creation forms in `src/components/MatchCreation`.
- Live scoring and scorecards in `src/components/match`.
- Public viewer components in `src/components/viewer`.

Guidance:
- Use `PageContainer` for route pages.
- Use `AppButton` for project-standard actions.
- Use `AppDialog` for confirmations and selection modals.
- Use `StatusBadge` for match lifecycle state.
- Use `ErrorState`, `EmptyState`, and `LoadingState` consistently instead of ad hoc messages.

## Light Mode

Light mode should use white papers on soft gray backgrounds, subdued dividers, and minimal shadows. Ensure public scorecards remain readable in outdoor/mobile conditions.

## Dark Mode

Dark mode is the current default. Use dark navy surfaces, high-contrast text, and restrained purple/green accents. Avoid making every section a heavy gradient or nested card.

## Accessibility

Minimum expectations:
- Buttons and clickable boxes need keyboard support or native button semantics.
- Score updates should expose status text where relevant.
- Disabled states must remain understandable.
- Public viewer pages must show clear loading, error, private, and not-found states.
- Mobile tap targets in scoring should be large enough for live use.
