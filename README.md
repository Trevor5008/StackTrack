# StackTrack

StackTrack is a mobile-first blackjack bankroll and session tracker built with
Expo, React Native, and TypeScript.

## Table of Contents

- [Run locally](#run-locally)
- [MVP features](#mvp-features)
- [Project structure](#project-structure)
- [Docs](#docs)
- [Technologies Used](#technologies-used)

## Run locally

This project targets **Expo SDK 54**, which matches the Expo Go version currently
on the App Store / Play Store.

```bash
npm install
npx expo start --lan
```

Scan the QR code with Expo Go, or press `a`, `i`, or `w` for an Android, 
iOS, or web target. 
- _Keep the phone and computer on the same network when possible_ 
_(hotspot works if client isolation is not blocking device traffic)._

After pulling SQLite changes, restart Metro so `metro.config.js` 
- _WASM settings load (required for web)._
- _Web also needs COOP/COEP headers, which the local Metro config sets automatically._

## MVP features

- Local-only session storage with **expo-sqlite**
- Validated load/save and one-time AsyncStorage → SQLite migration
- Dashboard with lifetime bankroll statistics
- **Live session shell**: start / pause / resume / end with persistent timer
- Addable table cards with editable table rules (decks, payout, S17/H17, DAS, LS)
- Add, view, edit, and delete completed sessions (with tables overview)
- Configurable starting bankroll and default currency
- Optional demo data from Settings (no auto-seed on first launch)

> Upcoming: house-edge math → ordinal color ranking on RankBadge.

The tracking domain is kept under `src/` so future blackjack simulation and
training modules can be added independently behind the same store API.

## Project structure

```text
stacktrack/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root layout + providers
│   ├── +html.tsx
│   ├── +not-found.tsx
│   ├── live.tsx                  # Active live session
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
│   │   ├── RankBadge.tsx
│   │   ├── SessionForm.tsx
│   │   ├── SessionListItem.tsx
│   │   ├── StatCard.tsx
│   │   └── TableRulesForm.tsx
│   ├── context/
│   │   ├── LiveSessionContext.tsx
│   │   └── SessionContext.tsx    # App state + CRUD actions
│   ├── data/
│   │   └── sampleSessions.ts     # Optional demo data
│   ├── lib/
│   │   ├── format.ts             # Currency / date helpers
│   │   ├── liveTimer.ts          # Live session elapsed helpers
│   │   ├── tableRules.ts         # Parse / serialize table rules
│   │   └── stats.ts              # Derived bankroll stats
│   ├── storage/
│   │   ├── db.ts                 # SQLite open + schema
│   │   ├── liveSessionStore.ts   # Active session + table CRUD
│   │   ├── mappers.ts            # Row ↔ domain mapping
│   │   ├── migrateFromAsyncStorage.ts
│   │   ├── sessionStore.ts       # Store API (SQLite backend)
│   │   ├── validators.ts         # Schema validation
│   │   └── __tests__/            # Storage unit tests
│   ├── types/
│   │   ├── liveSession.ts        # Live session + table types
│   │   ├── session.ts            # Session + settings types
│   │   └── tableRules.ts         # Blackjack table rules shape
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

## Technologies Used

[![Expo](https://img.shields.io/badge/Expo-SDK%2054-000000?logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Expo Router](https://img.shields.io/badge/Expo%20Router-6-000000?logo=expo&logoColor=white)](https://docs.expo.dev/router/introduction/)
[![SQLite](https://img.shields.io/badge/expo--sqlite-16-003B57?logo=sqlite&logoColor=white)](https://docs.expo.dev/versions/latest/sdk/sqlite/)
[![AsyncStorage](https://img.shields.io/badge/AsyncStorage-migration-3B82F6?logo=react&logoColor=white)](https://react-native-async-storage.github.io/async-storage/)
[![Jest](https://img.shields.io/badge/Jest-29-C21325?logo=jest&logoColor=white)](https://jestjs.io/)

- **Expo SDK 54** — managed React Native toolchain and Expo Go workflow
- **React Native / React 19** — mobile UI
- **TypeScript** — typed app and storage layers
- **Expo Router** — file-based navigation (`app/`)
- **expo-sqlite** — local persistence (`stacktrack.db`)
- **AsyncStorage** — one-time legacy migration into SQLite
- **Jest + ts-jest** — unit tests for validators and row mappers

