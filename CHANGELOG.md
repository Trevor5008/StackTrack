# Changelog

All notable changes to StackTrack are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

App version is kept in sync in:

- `package.json` → `version`
- `app.json` → `expo.version`

## [Unreleased]

### Added

- Per-table Play/Pause timers on live sessions (one running at a time; new tables start paused)
- Session banner elapsed and `hoursPlayed` from the sum of table timers; per-table `elapsed_ms` snapshot on end
- Swipe left on session cards (History / casino recent) to reveal delete
- Swipe left on dashboard casino cards to delete (cascades sessions; discards live session there)
- Shared `TextField` with a trailing × to dismiss the keyboard while focused
- Table minimum bet on table rules (default `$25`); table cards title with the minimum

### Changed

- Schema v4: timer columns on `active_tables`; `elapsed_ms` on `session_tables` (legacy session-level timer unused for hours)
- Live session no longer auto-starts a clock; Play on a table starts time
- Root layout wraps the app in `GestureHandlerRootView` for swipe gestures
- Casino stack header shows the casino name
- Session list cards title with date/time; casino name only in History meta
- Long-press casino name on the casino screen to rename inline
- Docs (`README`, `docs/schema.md`, `docs/flow.md`) for casino-first + per-table timers

## [1.0.0] - 2026-08-07

### Added

- Local-first blackjack bankroll tracker (Expo SDK 54, React Native, TypeScript)
- SQLite persistence (`expo-sqlite`) with AsyncStorage → SQLite migration
- Casino entity (schema v3): sessions are children of casinos
- Dashboard casino cards + Add casino; casino screen with scoped stats
- Live session shell: start / pause / resume / end with persistent timer
- Table cards with editable rules and absolute house-edge rank badges
- Manual add / edit / delete sessions; casino picker on forms
- Settings: starting bankroll, currency, demo data, clear controls
- Docs: `docs/schema.md`, `docs/flow.md`, README structure

### Fixed

- Add-casino race so newly created casinos open reliably after save
- Session detail header back button reliability
- Table rules form no longer resets decks while the live timer ticks

[Unreleased]: https://github.com/Trevor5008/StackTrack/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Trevor5008/StackTrack/releases/tag/v1.0.0
