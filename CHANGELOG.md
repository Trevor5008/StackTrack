# Changelog

All notable changes to StackTrack are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

App version is kept in sync in:

- `package.json` → `version`
- `app.json` → `expo.version`

## [Unreleased]

### Added

- Swipe left on session cards (History / casino recent) to reveal delete
- Shared `TextField` with a trailing × to dismiss the keyboard while focused

### Changed

- Root layout wraps the app in `GestureHandlerRootView` for swipe gestures

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
