# CricVelo — Cricket Match Management Platform

> Ball-by-ball scoring, tournament management, and live public scorecards for grassroots cricket.


## Overview

CricVelo is a browser-based cricket management platform that covers the full match lifecycle — from team and player setup through live ball-by-ball scoring to published public scorecards and tournament standings. It is designed for recreational, corporate, and community cricket leagues.

Built with **React + Vite + Firebase**, it requires no server to deploy and runs entirely in the browser with Firestore providing real-time data synchronisation.

---

## Features

### Implemented

| Feature | Description |
|---|---|
| **Match Creation Wizard** | 4-step guided form with draft auto-save and recovery |
| **Live Scoring** | Ball-by-ball entry with wides, no-balls, wickets, and extras |
| **Real-Time Scorecard** | Public viewer page updates within seconds of each ball |
| **Teams & Players** | Catalogue management with reusable rosters |
| **Player Profiles** | Career statistics aggregated across completed matches |
| **Tournament Management** | Create and manage League, Knockout, or Custom tournaments |
| **AuctionArena Import** | Bulk import teams and players from an Excel roster with conflict resolution and rollback |
| **Discovery** | Public match browser (no login required) |
| **In-App Notifications** | Match access approvals, rejections, and followed-match activity |
| **Collaborative Scoring** | Scorers request access to matches owned by others |
| **Match Sharing** | Copy link or generate a result share card image |
| **Role-Based Access Control** | Viewer / Scorer / Admin roles with route and service enforcement |
| **Firebase Analytics** | Key event tracking (match created, completed, tournament created, import completed) |
| **Sentry Error Monitoring** | Runtime error capture with context |

---

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm 9+
- A Firebase project with Firestore, Authentication, and Analytics enabled

### Clone the Repository

```bash
git clone https://github.com/your-org/cricket-scorecard.git
cd cricket-scorecard
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Optional — error monitoring
VITE_SENTRY_DSN=https://your_key@sentry.io/your_project
VITE_APP_VERSION=1.0.0
```

All variables are validated at startup. Missing required variables will cause the app to display a clear error before rendering.

### Run Locally

```bash
npm run dev
```

The app starts on `http://localhost:5173` with Hot Module Replacement enabled.

---

## Build & Deployment

```bash
npm run build
```

Production assets are written to `dist/`. Run `npm run preview` to serve the build locally.

### Firebase Hosting

CricVelo is designed for Firebase Hosting:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy (ensure npm run build has been run)
firebase deploy --only hosting
```

The `firebase.json` is already configured with an SPA rewrite rule.

### Firestore Indexes

The app requires composite Firestore indexes. Deploy them before first use:

```bash
firebase deploy --only firestore:indexes
```

---

## Architecture

```
Browser (React SPA)
│
├── UI: Material UI v6
├── State: Redux Toolkit + React Context
├── Routing: React Router v6
│
└── Firebase SDK v9 (modular)
    ├── Firestore (database + real-time)
    ├── Auth (email/password + Google)
    └── Analytics (event tracking)
```

See `Deliverables/TECHNICAL_ARCHITECTURE_BLUEPRINT.docx` for the full architecture document.

---

## Folder Structure

```
src/
├── components/       # Reusable UI components (by feature area)
├── config/           # Environment configuration
├── context/          # Auth, Toast, ThemeMode contexts
├── helpers/          # Scoring engine helper
├── hooks/            # Custom React hooks (Firebase + scoring)
├── pages/            # Route-level page components
├── services/         # Firebase service layer (one file per collection)
├── store/            # Redux Toolkit store
├── utils/            # Pure utility functions
└── theme.js          # MUI theme customisation
```

---

## User Roles

| Role | Capabilities |
|---|---|
| **Viewer** | Browse dashboard, follow matches, view notifications, public scorecards |
| **Scorer** | All Viewer capabilities + create/score/manage own matches, manage teams and players, run imports, create tournaments |
| **Admin** | All Scorer capabilities + approve scorer requests, manage all users' roles |

New users are assigned the **Viewer** role by default. An existing Scorer/Admin can upgrade a user's role by approving their request from the **Scorer Requests** page.

---

## Tournament Features

- Create tournaments with **League**, **Knockout**, **League+Knockout**, or **Custom** formats
- Assign teams (from your team catalogue) to a tournament
- Link any new match to a tournament at creation time
- View all linked matches on the tournament detail page
- Public tournament page accessible to anyone with the link
- Archive tournaments when the season ends

---

## Import Features

CricVelo supports bulk importing of teams and players from an AuctionArena Excel export.

### Supported Columns

| Column | Required | Notes |
|---|---|---|
| Employee ID | Yes | Used for deduplication |
| Player Name | Yes | |
| Team Name | Yes | Teams are created if they don't exist |
| Email | No | |
| Department | No | |
| Festival Team | No | |
| Sold Price | No | |
| Credits Used | No | |

### Conflict Resolution

- **Teams:** merge (default), skip, or replace existing teams
- **Players:** update (default) or skip existing players

### Rollback

Every import is tagged with an `importBatchId`. If an import produces incorrect data, the rollback function deletes all players and teams created in that batch.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| App shows "Missing environment variable" on startup | Check `.env.local` has all required `VITE_FIREBASE_*` variables |
| Google login fails | Ensure Google provider is enabled in Firebase Auth console |
| Firestore permission denied | Check Firestore Security Rules allow the operation for the user's role |
| Import fails with "Running" status stuck | Re-run the import; the "Running" status indicates a mid-run crash — rollback first |
| Tournaments not showing in UI | Run `firebase deploy --only firestore:indexes` to create required composite indexes |
| Live scorecard not updating | Check browser console for Firestore listener errors; verify network connection |
| Sentry not capturing errors | Ensure `VITE_SENTRY_DSN` is set in production environment |

---

## Future Roadmap

| Feature | Priority |
|---|---|
| Tournament points table (auto-calculated standings) | High |
| FCM push notifications | High |
| Fixture auto-generation (round-robin scheduling) | High |
| Tournament-level statistics aggregation | Medium |
| PDF scorecard export | Medium |
| Offline scoring mode | Medium |
| Native mobile apps | Low |
| Umpire assignment module | Low |

---

## Documentation

| Document | Purpose |
|---|---|
| `Deliverables/PRD.docx` | Product Requirements Document |
| `Deliverables/TECHNICAL_ARCHITECTURE_BLUEPRINT.docx` | System design and architecture |
| `Deliverables/PROJECT_PLAN.docx` | Development timeline and milestones |
| `Deliverables/REPOSITORY_GUIDE.docx` | Code structure and conventions |
| `Deliverables/AI_USAGE_AND_METRICS.docx` | AI tools used and development metrics |
| `Deliverables/TEST_REPORT.docx` | Testing strategy and results |
| `Deliverables/PRESENTATION_DECK_CONTENT.docx` | Slide deck content |
| `Deliverables/PROMPT_LIBRARY.docx` | AI prompt library used during development |

---

## License

Academic project — not licensed for commercial distribution.
