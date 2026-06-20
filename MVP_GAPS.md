# CricVelo MVP Gaps

## P0: Blocks Trustworthy MVP

| Gap | Area | Impact |
| --- | --- | --- |
| Scoring logic lacks automated coverage | Testing | Regressions can corrupt real match data |
| No match ownership/creator model | Security | Any scorer/admin can operate on any match |
| Multi-scorer conflict protection missing | Scoring/Firebase | Concurrent scorers can overwrite each other |
| Firestore rules do not deeply validate match schema | Security/Data | Invalid match states can be persisted |
| Advanced wicket validation incomplete | Cricket | Incorrect dismissals and all-out states are possible |
| No-ball and extras edge cases need hardening | Cricket | Score, bowler, and batter stats can drift |
| Innings transition can be partially persisted on failure | Persistence | Refresh/network errors can leave inconsistent state |
| Private/public sharing model is minimal | Security/Viewer | No granular access model for private scorecards |
| Full release QA is not automated | QA | Launch confidence depends on manual testing |

## P1: Required for Strong MVP

| Gap | Area | Impact |
| --- | --- | --- |
| Password reset UI missing | Auth | Users can get locked out |
| Dismissal types missing | Cricket | Scorecard is incomplete for real cricket |
| Free hit and advanced no-ball rules missing | Cricket | Common formats cannot be scored fully |
| Powerplay support missing | Cricket | Limited match-format realism |
| Player of the Match missing | Completion | Common post-match ceremony absent |
| Result share image/card missing | Growth | Weak viral sharing after match completion |
| Reusable teams missing | Organizer/Scorer | Repeated manual roster entry |
| Reusable players missing | Organizer/Scorer | No player history or stats foundation |
| Audit trail missing | Security/QA | Cannot inspect who changed scoring data |
| Better correction workflow missing | Scoring | Undo/redo is coarse for real scorer operations |
| Match search/filtering limited | Dashboard | Dashboard will not scale |

## P2: Growth and Platform Gaps

| Gap | Area | Impact |
| --- | --- | --- |
| Tournament entity missing | Organizer | Cannot run events |
| Fixtures/scheduler missing | Organizer | Manual coordination required |
| Points table and NRR missing | Tournament | Not tournament-ready |
| Knockout brackets missing | Tournament | No playoff support |
| Public tournament pages missing | Viewer/Growth | Fans cannot follow events |
| Player/team stats across matches missing | Growth | No long-term engagement loop |
| Notifications/following missing | Growth | Fans must manually check links |
| Sponsor/monetization surfaces missing | Business | No revenue path |
| Role management UI missing | Admin | Admin role is not operationally useful |

## Missing Cricket Features

- Dismissal type selection.
- Run-out attribution.
- Retired hurt/retired out.
- Free hit handling.
- Powerplay markers.
- Penalty runs.
- Super over.
- DLS/rain adjustment.
- Player of the Match.
- Innings break notes.
- Detailed scorecard exports.

## Missing Viewer Features

- Public match discovery.
- Shareable result card.
- Follow team/player.
- Notifications.
- Commentary feed.
- Wagon wheel/manhattan/progression charts.
- Public tournament pages.

## Missing Organizer Features

- Tournaments.
- Reusable teams and players.
- Registrations.
- Fixture generation.
- Standings and NRR.
- Brackets.
- Multi-scorer assignment.
- Ground/time scheduling.
- Organizer dashboard.

## Missing Growth Features

- Profiles.
- Leaderboards.
- Social sharing assets.
- SEO-friendly public pages.
- Sponsor inventory.
- Analytics.
- Premium plans.
