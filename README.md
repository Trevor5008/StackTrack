# StackTrack

StackTrack is a mobile-first blackjack bankroll and session tracker built with
Expo, React Native, and TypeScript.

## Run locally

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `a`, `i`, or `w` for an Android,
iOS, or web target.

## MVP features

- Local-only session storage with AsyncStorage
- Dashboard with lifetime bankroll statistics
- Add, view, edit, and delete sessions
- Configurable starting bankroll and default currency
- Seed sessions on first launch

The tracking domain is kept under `src/` so future blackjack simulation and
training modules can be added independently.
