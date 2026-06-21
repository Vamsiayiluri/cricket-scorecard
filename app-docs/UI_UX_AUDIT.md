# CricVelo UI/UX Audit

## Overall UI Direction

The app uses a dark, premium sports-tech theme with compact cards, gradients, live badges, and broadcast-style labels. The design intent is clear and consistent with the CricVelo vision.

Strengths:

- Strong product identity and visual language.
- Reusable UI primitives exist.
- Dashboard and scoring pages feel domain-specific.
- Public live views are readable and modern.
- Wizard reduces match creation complexity.

Weaknesses:

- Heavy dark/purple gradient usage can become visually repetitive.
- Some UI controls are placeholders without behavior.
- Several strings contain encoding artifacts such as `â€”`, `Â·`, and `â€¦`.
- Some pages use instructional/marketing copy inside the application surface.
- Accessibility is incomplete, especially around icon-only controls, color contrast in subtle text, and keyboard scoring flows.

## Login Page

Strengths:

- Strong first impression and clear sports-tech positioning.
- Password visibility toggle exists.
- Google sign-in available.
- Error and toast feedback exist.

Weaknesses:

- Forgot password link routes to registration.
- Remember device checkbox has no behavior.
- Long marketing text may distract returning scorers.

Accessibility:

- Good labels through inputs.
- Decorative visual panel could be hidden from screen readers if audited.

Mobile:

- Desktop visual panel hides on mobile, which is appropriate.

Recommended improvements:

- Implement actual password reset.
- Remove or implement remember device.
- Simplify operational login copy for scorers.

## Register Page

Strengths:

- Clear viewer account positioning.
- Confirm password and password visibility controls.
- Creates Firestore user profile.

Weaknesses:

- No password strength meter.
- No redirect after successful verification prompt.
- Uses viewer-only language while Google login defaults legacy users to scorer elsewhere.

Accessibility:

- Needs clearer success next step and focus management after errors.

Recommended improvements:

- Add password requirements and reset focus to first invalid field.
- Add sign-in CTA after account created.

## App Shell

Strengths:

- Persistent navigation and role display.
- Mobile drawer exists.
- Theme toggle exists.
- Scorer-only create-match nav is role-aware.

Weaknesses:

- Search bar has no behavior.
- Notifications icon has no behavior.
- Settings menu item has no behavior.
- Avatar always shows `U`.

Mobile:

- Drawer pattern is suitable.
- Header may become crowded on small screens.

Recommended improvements:

- Hide or disable placeholder features until implemented.
- Use real user display name or email initial.

## Dashboard

Strengths:

- Good summary of match buckets.
- Empty/loading/error states are present.
- Match action menus give useful shortcuts.
- Realtime updates are used.

Weaknesses:

- Client-side buckets are limited to first 50 documents.
- No true search, filters, pagination, or archived view.
- Ongoing status icon logic checks `ongoing` and `in_progress`, but actual status is `in-progress`.

Mobile:

- Card grid should adapt reasonably, but dense match lines may truncate important score context.

Recommended improvements:

- Implement filters/search or remove visual search.
- Add archived/deleted management view.
- Fix status label normalization.

## Match Creation Wizard

Strengths:

- Six-step flow is understandable.
- Autosave draft is a strong UX feature.
- Validation messages are centralized.
- Review step reduces mistakes.
- Public/private visibility is included.

Weaknesses:

- Team/player entry is manual and repetitive.
- Add-player duplicate prevention silently ignores duplicates instead of explaining.
- Minimum players is 2, useful for testing but not realistic cricket MVP defaults.
- Fixed bottom action bar could overlap content on smaller screens.

Accessibility:

- Stepper and errors need focus movement and ARIA review.
- Buttons and form fields are mostly labeled.

Recommended improvements:

- Add visible feedback for duplicate player attempts.
- Consider roster import or paste multiple players.
- Add focus to first invalid field on validation failure.

## Match Details Page

Strengths:

- Clear control center for share, edit, visibility, archive.
- Edit disabled for non-scheduled matches.
- Status and visibility chips are clear.

Weaknesses:

- Archive uses native `window.confirm`, inconsistent with app dialogs.
- Restore archive is not exposed.
- No delete/soft-delete UI despite service support.

Recommended improvements:

- Use `AppDialog` for destructive confirmation.
- Add archived management and restore.

## Edit Match Page

Strengths:

- Reuses creation forms.
- Restricts structural edits once match starts.
- Visibility and notes can be safely edited.

Weaknesses:

- Disabled blocks via opacity and pointer events can be confusing without per-section explanation.
- Validation errors may not be visible before save.

Recommended improvements:

- Add per-section locked reason.
- Add sticky save summary and error count.

## Opening Setup Page

Strengths:

- Simple, focused setup before innings.
- Shows match, venue, toss, decision chips.
- Separates batting and bowling selections.

Weaknesses:

- No prevention for same opening player in both batting fields.
- `battingTeam` is fixed in state from initial calculation and will not respond if match data changes.
- Text uses "batsman" instead of more inclusive "batter".

Recommended improvements:

- Filter selected striker from non-striker list.
- Use "batter" terminology.

## Live Scoring Page

Strengths:

- Purpose-built scoring console.
- Run pads are large and fast.
- Save status and retry state are visible.
- Undo, redo, and correct-last-ball exist.
- Current over and timeline help scorer confidence.
- End innings has confirmation.

Weaknesses:

- Component is very dense and large.
- Some duplicate controls exist for viewing scorecard in second innings.
- No keyboard shortcuts.
- No explicit lock for multi-tab/multi-scorer collision.
- Some cricket edge cases are not represented.

Accessibility:

- Circular run pads are clickable `Box` elements rather than semantic buttons.
- Color is heavily used to encode status.
- Wicket/extras toggles need keyboard and screen-reader audit.

Mobile:

- The scoring console may be difficult on small phones due to dense grids and fixed/large panels.

Recommended improvements:

- Convert run pads to buttons.
- Add compact mobile scorer mode.
- Add scorer lock or active scorer indicator.
- Add keyboard shortcuts later, with visible control hints only where appropriate.

## Public Live Page

Strengths:

- Clear live status.
- Read-only by design.
- Realtime updates.
- Scheduled, live, and completed states.

Weaknesses:

- Public page still uses app shell chrome; may be heavier than needed for spectators.
- Share URL is plain text, not a copy action.

Recommended improvements:

- Add copy link button.
- Consider spectator-optimized lightweight layout.

## Public Scorecard Page

Strengths:

- Shows live scoreboard plus full innings scorecard.
- Uses accordions for innings.
- Read-only.

Weaknesses:

- Full scorecard lacks fall-of-wicket, partnerships, and innings notes.
- `PublicMatchScorecard.jsx` references `Box` without importing it, flagged by lint.

Recommended improvements:

- Add detailed cricket scorecard sections.
- Add export/share image later.

## Visual Consistency Issues

- Some components use high border radius values while the design target prefers compact 8px.
- Encoding artifacts appear throughout UI copy.
- Some old components remain (`ScorecardTwo.jsx`) and do not match the current system.
- `Paper`, `Card`, and `AppCard` are mixed heavily, sometimes creating nested-card feel.

## Accessibility Checklist Needed

- Keyboard-only scoring operation
- Visible focus states on custom clickable elements
- Screen reader labels for live score updates
- Dialog focus trap and restore validation
- Color contrast for secondary text on dark backgrounds
- Reduced motion option for pulses/flashes

