# StackTrack

StackTrack is a mobile-first blackjack bankroll and session tracker built with
Expo, React Native, and TypeScript.

## Run locally

This project targets **Expo SDK 54**, which matches the Expo Go version currently
on the App Store / Play Store.

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `a`, `i`, or `w` for an Android,
iOS, or web target. Keep the phone and computer on the same network when
possible (hotspot works if client isolation is not blocking device traffic).

## MVP features

- Local-only session storage with AsyncStorage
- Dashboard with lifetime bankroll statistics
- Add, view, edit, and delete sessions
- Configurable starting bankroll and default currency
- Seed sessions on first launch

The tracking domain is kept under `src/` so future blackjack simulation and
training modules can be added independently.

## Project structure

```text
stacktrack/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root layout + SessionProvider
│   ├── +html.tsx
│   ├── +not-found.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab navigation
│   │   ├── index.tsx             # Dashboard
│   │   ├── add-session.tsx       # Create session
│   │   ├── history.tsx           # Session list
│   │   └── settings.tsx          # Bankroll + currency
│   └── session/
│       └── [id].tsx              # Session detail / edit / delete
├── src/
│   ├── components/               # Shared UI
│   │   ├── BankrollTrend.tsx
│   │   ├── SessionForm.tsx
│   │   ├── SessionListItem.tsx
│   │   └── StatCard.tsx
│   ├── context/
│   │   └── SessionContext.tsx    # App state + CRUD actions
│   ├── data/
│   │   └── sampleSessions.ts     # First-launch seed data
│   ├── lib/
│   │   ├── format.ts             # Currency / date helpers
│   │   └── stats.ts              # Derived bankroll stats
│   ├── storage/
│   │   └── sessionStore.ts       # AsyncStorage persistence
│   ├── types/
│   │   └── session.ts            # Session + settings types
│   └── theme.ts                  # Colors, spacing, radius
├── docs/
│   ├── schema.md                 # Data model
│   └── flow.md                   # App flow diagrams
├── assets/
├── app.json
├── package.json
└── README.md
```

## Docs

- [Data schema](docs/schema.md)
- [App flow](docs/flow.md)
