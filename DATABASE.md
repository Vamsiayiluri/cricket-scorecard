# CricVelo Database

## Firestore Collections

### `users/{uid}`

Purpose: Firebase Auth profile and role.

Schema:

```js
{
  uid: string,
  email: string,
  displayName: string,
  role: "viewer" | "scorer" | "admin",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

Relationships:
- Document id should equal Firebase Auth UID.
- `AuthContext` subscribes to this document to resolve app permissions.

Common queries:
- Direct document read: `users/{uid}`.
- Direct document subscription: `users/{uid}`.

### `matches/{matchId}`

Purpose: Primary match document and scorecard state.

Schema:

```js
{
  id: string,             // added by snapshot mapper, not necessarily stored
  matchId: string,
  matchDetails: {
    teamA: string,
    teamB: string,
    location: string,
    date: string | Date | Timestamp,
    title?: string,
    matchType?: "T20" | "ODI" | "T10" | "Custom" | string
  },
  teams: {
    teamA: {
      name: string,
      players: string[],
      captain?: string,
      wicketkeeper?: string
    },
    teamB: {
      name: string,
      players: string[],
      captain?: string,
      wicketkeeper?: string
    }
  },
  tossDetails: {
    winner: string,
    decision: "Bat" | "Bowl" | string
  },
  scoringRules: {
    maxOvers: number,
    extras: {
      wides: number,
      noBalls: number
    }
  },
  scoreCard: {
    currentInning?: 1 | 2,
    innings?: Inning[],
    currentBowler?: {
      name: string,
      overs: number,
      runs: number,
      wickets: number
    },
    recentBallsByInnings?: {
      inning1?: string[],
      inning2?: string[]
    },
    overHistoryByInnings?: {
      inning1?: { over1?: string[], over2?: string[] },
      inning2?: { over1?: string[], over2?: string[] }
    }
  },
  notes: string,
  status: "scheduled" | "in-progress" | "completed",
  isPublic: boolean,
  lifecyclePhase: "scheduled" | "archived" | "deleted" | string,
  createdAt: Date | Timestamp,
  updatedAt: Date | Timestamp,
  archivedAt: Date | Timestamp | null,
  deletedAt: Date | Timestamp | null,
  completedAt?: Date | Timestamp,
  resultSummary?: string,
  winnerTeamKey?: "teamA" | "teamB" | null,
  winnerName?: string | null,
  margin?: string,
  isTie?: boolean
}
```

`Inning` schema:

```js
{
  team: "teamA" | "teamB",
  battingTeam: string,
  bowlingTeam: string,
  runs: number,
  wickets: number,
  overs: number,
  balls: number,
  batsmen: [{
    name: string,
    runs: number,
    balls: number,
    isOut: boolean,
    isNonStriker: boolean,
    fours: number,
    sixes: number
  }],
  bowlers: [{
    name: string,
    overs: number,
    balls: number,
    runs: number,
    wickets: number,
    currentBowler: boolean
  }],
  extras: [{
    wides: number,
    noBalls: number,
    byes: number,
    legByes: number,
    total: number
  }]
}
```

Relationships:
- Match embeds team/player snapshots. There is no enforced foreign key to `teams` or `players`.
- Public pages read a match directly by id.
- Dashboard reads a limited set of matches and partitions client-side.

Common queries:
- `doc(matches, matchId)` for details, setup, scoring, public viewer.
- `query(collection(matches), limit(50))` for dashboard.

### `teams/{teamId}`

Purpose: Reserved for reusable team data. Rules and service files exist, but product use is limited.

Expected schema:

```js
{
  name: string,
  players?: string[],
  createdAt?: Timestamp,
  updatedAt?: Timestamp
}
```

### `players/{playerId}`

Purpose: Reserved for reusable player data. Rules and service files exist, but product use is limited.

Expected schema:

```js
{
  name: string,
  teamId?: string,
  createdAt?: Timestamp,
  updatedAt?: Timestamp
}
```

## Security Rules Summary

- `users/{userId}`:
  - Users can read and create their own profile.
  - Users can update their own profile only if role does not change.
- `matches/{matchId}`:
  - Public match reads allowed when `isPublic == true`.
  - Authenticated users can read matches.
  - Create/delete require `scorer` or `admin`.
  - Scheduled updates allow scorer/admin full edits.
  - In-progress updates block structural changes to teams, toss, scoring rules, and scorecard.
  - Completed updates only allow conservative fields such as notes/visibility while preserving structure and status.
- `teams` and `players`:
  - Reads require signed-in user.
  - Writes require scorer/admin.

Important note: rules currently use role documents in `users/{uid}`. Missing profiles resolve to viewer in current rules.

## Index Requirements

`firestore.indexes.json` currently contains no composite indexes.

Current queries avoid composite indexes by:
- Reading a limited matches collection.
- Sorting and partitioning dashboard data client-side.
- Reading direct documents by id.

Future features likely requiring indexes:
- Match list by `status` and `updatedAt`.
- Public match discovery by `isPublic`, `status`, and `date`.
- Organizer/tournament match lists.
- Team/player search.
- Archived/deleted filtering at database level.

## Data Integrity Risks

- Match schema is not deeply validated in Firestore rules.
- Mixed `Date`, ISO string, and Firestore `Timestamp` values may exist.
- Match ownership/creator fields are missing.
- Reusable `teams` and `players` are not wired into match creation.
- Scoring helpers mutate nested objects before returning new references.
