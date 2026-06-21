# CricVelo Product Roadmap

## Wave 1: MVP Stabilization

Goal: make single-match scoring trustworthy enough for private beta.

Priorities:
- Add automated tests for scoring mutations, innings transition, and completion.
- Harden cricket correctness for no-balls, wides, byes, leg-byes, wickets, all-out, target reached, and ties.
- Add match ownership/creator metadata and update rules accordingly.
- Validate Firestore write payloads more deeply.
- Add password reset UI or remove dead "forgot password" affordances.
- Improve private/public match behavior and access messaging.
- Verify mobile scoring under live-match pressure.
- Run full manual QA checklist before any release.

Exit criteria:
- Scorer can complete a real two-innings match without data loss.
- Public viewer scorecard shows a coherent final result.
- Auth and rules do not grant unintended write access.
- Build passes and known critical lint/runtime defects are addressed.

## Wave 2: Core Growth Features

Goal: make CricVelo useful for repeat scorers and shareable match moments.

Priorities:
- Reusable teams and players.
- Player search and roster management.
- Dismissal types and richer scorecard details.
- Player of the Match.
- Result share card for WhatsApp/social sharing.
- Better match list filtering and search.
- Scorer convenience tools such as correction history and audit trail.
- Basic organizer view for many matches.

Exit criteria:
- Scorers do not need to re-enter rosters every match.
- Viewers can understand and share match outcomes easily.
- Match management scales beyond a small dashboard list.

## Wave 3: Tournament Platform

Goal: support real grassroots tournaments.

Priorities:
- Tournament collection and tournament creation flow.
- Team registration into tournaments.
- Fixture generator for league/round-robin formats.
- Points table with wins, losses, ties/no-results, NRR.
- Knockout bracket support.
- Tournament match grouping and organizer dashboard.
- Public tournament microsite.
- Team and player stats across tournament.

Exit criteria:
- Organizer can create a tournament, add teams, schedule matches, score them, and publish standings.
- Public viewers can follow a tournament without logging in.

## Wave 4: Platform Growth and Monetization

Goal: create differentiation beyond scorekeeping.

Priorities:
- Player profiles and career stats.
- Team pages and season history.
- Leaderboards.
- Notifications and follow mechanics.
- Sponsor placements on tournament/match pages.
- Premium organizer tools.
- Analytics for teams and scorers.
- Media-rich result cards and highlights.
- Role management and admin operations console.

Exit criteria:
- CricVelo supports ongoing community engagement, not just one-off scoring.
- Organizers have enough value to justify paid or sponsored tiers.
