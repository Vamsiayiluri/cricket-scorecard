# Wave 1 Batch 1 Completion Report

## 1. Files Changed

- `src/components/match/Selectbatsman.jsx`
- `src/components/match/BattingScoreCard.jsx`
- `src/components/match/ScoreCard.jsx`
- `src/components/match/EndOfInnings.jsx`
- `src/components/match/MatchScoreCard.jsx`
- `src/components/match/FallOfWickets.jsx`
- `src/components/viewer/PublicMatchScorecard.jsx`
- `src/utils/cricketScorecard.js`

## 2. Schema Changes

Backward-compatible fields added to each dismissed batter object:

```js
{
  dismissalType: "Bowled" | "Caught" | "LBW" | "Run Out" | "Stumped" | "Hit Wicket",
  fielder: string,
  dismissalBowler: string,
  dismissal: string
}
```

Backward-compatible field added to each innings object:

```js
fallOfWickets: [
  {
    wicket: number,
    score: number,
    over: string,
    batter: string
  }
]
```

No Firestore rules, indexes, auth schema, match creation schema, tournament schema, or team management schema were changed.

## 3. Root Cause

The existing wicket flow collected a basic wicket type but only stored partial display strings on the batter. It did not persist structured dismissal metadata, did not consistently format real cricket dismissal notation, and did not record fall-of-wickets data at the innings level.

## 4. Fix Implemented

- Added shared cricket scorecard utilities for dismissal constants, fielder-required dismissal types, over formatting, and dismissal display formatting.
- Updated wicket confirmation to persist structured dismissal metadata.
- Required fielder selection for caught, run out, and stumped.
- Used fielding XI players from the bowling team for fielder selection.
- Added fall-of-wickets persistence when a wicket is confirmed.
- Added reusable `FallOfWickets` component.
- Displayed dismissal text in live, public, and completed scorecards through `BattingScoreCard`.
- Displayed fall of wickets in live scoring, innings summary, public scorecard, and completed scorecard views.
- Preserved the existing wicket dialog, replacement batter flow, persistence queue, and undo/redo snapshot model.

Dismissal display examples now produced by the shared formatter:

- `b Kumar`
- `c Ajay b Kumar`
- `lbw b Kumar`
- `run out (Ajay)`
- `st Rahul b Kumar`
- `hit wicket b Kumar`

## 5. Build Result

Result: Passed.

Command:

```powershell
& 'C:\nvm\v22.22.2\node.exe' 'C:\nvm\v22.22.2\node_modules\npm\bin\npm-cli.js' run build
```

Vite completed production build successfully. Existing chunk-size warning remains for the large app bundle.

## 6. Lint Result

Result: Failed due existing project lint debt.

Command:

```powershell
& 'C:\nvm\v22.22.2\node.exe' 'C:\nvm\v22.22.2\node_modules\npm\bin\npm-cli.js' run lint
```

Observed result:

- 51 total problems.
- 45 errors.
- 6 warnings.

Failures are in pre-existing files such as `GoogleLoginButton.jsx`, `DraftRecoveryBanner.jsx`, `AuthLoadingScreen.jsx`, `UnauthorizedState.jsx`, `MatchActionsMenu.jsx`, `ScorecardTwo.jsx`, `StatusBadge.jsx`, `LiveScoreboard.jsx`, `ThemeModeContext.jsx`, `ToastContext.jsx`, `AppShell.jsx`, `RegisterPage.jsx`, `firebaseServices.js`, and `scoringDiagnostics.js`.

No lint errors were reported for the new `FallOfWickets.jsx` or `cricketScorecard.js` files.

## 7. Validation Checklist

Code/build validation:

- Bowled: Implemented through dismissal type and formatter.
- Caught + Fielder: Implemented with fielding XI selector and formatter.
- LBW: Implemented through dismissal type and formatter.
- Run Out + Fielder: Implemented with fielding XI selector and dismissed-batter selector.
- Stumped + Fielder: Implemented with fielding XI selector and formatter.
- Hit Wicket: Implemented through dismissal type and formatter.
- Undo: Preserved through existing scorecard snapshot model.
- Redo: Preserved through existing scorecard snapshot model.
- Public Scorecard: Updated via `PublicMatchScorecard` and shared batting/FOW components.
- Completed Scorecard: Updated via `MatchScoreCard` and shared batting/FOW components.
- Firestore Persistence: Uses existing scorecard persistence path; new fields are stored inside existing `scoreCard.innings`.
- Build: Passed.
- Lint: Failed due existing lint debt listed above.

Manual browser/Firebase validation was not executed in this session.

Additional attempted validation:

- A standalone formatter smoke check was attempted, but this PowerShell session did not expose `node` directly even though the npm build command succeeded through the configured npm executable.

## 8. Remaining Wave 1 Items

- Add automated scoring tests for dismissal handling and fall of wickets.
- Verify all six dismissal types in browser against Firestore writes.
- Add Free Hit support.
- Add richer extras breakdown.
- Add Player of the Match.
- Harden no-ball/wide edge cases.
- Improve wicket attribution for advanced run-out/crossing scenarios.
- Add scorer audit/correction history.
- Add multi-scorer conflict protection.
