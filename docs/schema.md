# StackTrack data schema

StackTrack is local-only for the MVP. Persistence uses **expo-sqlite**
(`stacktrack.db`) with validated domain types and no remote backend.

On first launch, sessions start **empty**. Demo data is optional via Settings
→ **Load demo data**.

A one-time migrator imports legacy AsyncStorage envelopes
(`@stacktrack/sessions`, `@stacktrack/settings`) into SQLite, then clears those
keys. `netResult` is normalized to `cashOut - buyIn` during validation.

## SQLite tables

Database file: `stacktrack.db` · schema version: `2` (stored in `meta`)

| Table | Purpose |
| --- | --- |
| `meta` | Key/value flags (`schema_version`, `async_migrated`) |
| `settings` | Singleton row (`id = 1`) for starting bankroll + currency |
| `sessions` | One row per completed blackjack sitting |
| `active_sessions` | At most one in-progress live session |
| `active_tables` | Tables for the in-progress live session |
| `session_tables` | Per-table snapshot copied onto completed sessions |

### sessions

| Column | Type | Notes |
| --- | --- | --- |
| `id` | TEXT PK | Client-generated |
| `date` | TEXT | `YYYY-MM-DD` |
| `location` | TEXT | Casino / location |
| `starting_bankroll` | REAL | Bankroll before session |
| `buy_in` | REAL | Buy-in amount |
| `cash_out` | REAL | Cash-out amount |
| `hours_played` | REAL | Hours at the table |
| `net_result` | REAL | `cash_out - buy_in` |
| `notes` | TEXT | Optional |
| `created_at` | TEXT | ISO timestamp |
| `updated_at` | TEXT | ISO timestamp |

Index: `idx_sessions_date` on `(date DESC, created_at DESC)`.

### active_sessions

At most one row. Timer fields persist so app reload recovers the live session.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | TEXT PK | Client-generated |
| `location` | TEXT | Optional until end; may be empty while live |
| `starting_bankroll` | REAL | Bankroll when the live session started |
| `buy_in` | REAL | Nullable until end form |
| `segment_started_at` | TEXT | ISO start of the current running segment |
| `accumulated_ms` | INTEGER | Frozen elapsed while paused / prior segments |
| `is_paused` | INTEGER | `0` / `1` |
| `paused_at` | TEXT | Nullable ISO timestamp |
| `created_at` | TEXT | ISO timestamp |
| `updated_at` | TEXT | ISO timestamp |

Elapsed while running = `accumulated_ms + (now - segment_started_at)`.
On pause, that sum is written into `accumulated_ms` and `is_paused = 1`.
On resume, `segment_started_at` is set to now and pause clears.

### active_tables

| Column | Type | Notes |
| --- | --- | --- |
| `id` | TEXT PK | Client-generated |
| `active_session_id` | TEXT FK | → `active_sessions.id` |
| `name` | TEXT | Display name |
| `sort_order` | INTEGER | List order |
| `net_result` | REAL | Manual / default `0` |
| `rank_placeholder` | INTEGER | Legacy nullable; ranking is computed from `rules_json` |
| `rules_json` | TEXT | Nullable JSON `TableRules` (see below) |
| `created_at` | TEXT | ISO timestamp |
| `updated_at` | TEXT | ISO timestamp |

### session_tables

Snapshot of live tables when a session is ended and saved.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | TEXT PK | Client-generated |
| `session_id` | TEXT FK | → `sessions.id` |
| `name` | TEXT | Display name |
| `sort_order` | INTEGER | List order |
| `net_result` | REAL | Table P/L |
| `rank_placeholder` | INTEGER | Legacy nullable; ranking computed from rules |
| `rules_json` | TEXT | Nullable JSON `TableRules` snapshot |
| `created_at` | TEXT | ISO timestamp |

`rules_json` shape (`src/types/tableRules.ts`):

```ts
{
  decks: 1 | 2 | 4 | 6 | 8;
  blackjackPayout: '3:2' | '6:5';
  dealer17: 'S17' | 'H17';
  doubleAfterSplit: boolean;
  lateSurrender: boolean;
}
```

Defaults when opening the editor with no saved rules: 6 decks, 3:2, S17, DAS yes, late surrender no. Invalid JSON is treated as unset.

### Ranking (derived)

House edge and favorability are **computed on read** from `rules_json` (not stored):

- Baseline ≈ 0.50% HE for 6D / 3:2 / S17 / DAS / no LS
- Additive deltas for decks, 6:5, H17, no DAS, late surrender (`src/lib/houseEdge.ts`)
- Absolute tiers: favorable (≤ 0.45), average (≤ 0.70), unfavorable (&gt; 0.70)
- Unique lowest HE among tables with rules → “Best rules” highlight only when that table is not `unfavorable`; ties → no exclusive best

### settings

| Column | Type | Notes |
| --- | --- | --- |
| `id` | INTEGER PK | Always `1` |
| `starting_bankroll` | REAL | Default `5000` |
| `currency` | TEXT | Default `USD` |

## Entities

### Session

Primary record for one blackjack sitting (TypeScript shape in
`src/types/session.ts`).

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `string` | yes | Generated client-side |
| `date` | `string` | yes | `YYYY-MM-DD` |
| `location` | `string` | yes | Casino / location name |
| `startingBankroll` | `number` | yes | Bankroll before this session |
| `buyIn` | `number` | yes | Amount bought in |
| `cashOut` | `number` | yes | Amount cashed out |
| `hoursPlayed` | `number` | yes | Hours at the table |
| `netResult` | `number` | yes | Derived: `cashOut - buyIn` |
| `notes` | `string` | no | Free-form notes |
| `createdAt` | `string` | yes | ISO timestamp |
| `updatedAt` | `string` | yes | ISO timestamp |

`SessionInput` is the create/update payload:

```ts
Omit<Session, 'id' | 'netResult' | 'createdAt' | 'updatedAt'>
```

`id`, `netResult`, `createdAt`, and `updatedAt` are owned by `SessionContext`.

### AppSettings

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `startingBankroll` | `number` | `5000` | Baseline before any sessions |
| `currency` | `string` | `"USD"` | Display currency |

### WinLossRecord

Derived stats shape (not persisted).

| Field | Type | Rule |
| --- | --- | --- |
| `wins` | `number` | `netResult > 0` |
| `losses` | `number` | `netResult < 0` |
| `pushes` | `number` | `netResult === 0` |

### ActiveSession / ActiveTable / SessionTable

TypeScript shapes live in `src/types/liveSession.ts`. Managed by
`liveSessionStore` + `LiveSessionContext`. Completing a live session calls
`SessionContext.addSession`, copies tables into `session_tables`, then clears
`active_*` rows. `hoursPlayed` is derived from the timer
(`round(elapsedMs / 3_600_000, 2)`, floored to at least `0.01`).

## Derived stats

Computed in `src/lib/stats.ts` from settings + sessions:

| Function | Formula |
| --- | --- |
| `lifetimeProfitLoss(sessions)` | `sum(netResult)` |
| `currentBankroll(starting, sessions)` | `starting + lifetimeProfitLoss` |
| `totalSessions(sessions)` | `sessions.length` |
| `totalHours(sessions)` | `sum(hoursPlayed)` |
| `hourlyRate(sessions)` | `lifetimeProfitLoss / totalHours` (0 if no hours) |
| `winLossRecord(sessions)` | wins / losses / pushes |
| `biggestWin(sessions)` | `max(netResult)` (0 if empty) |
| `biggestLoss(sessions)` | `min(netResult)` (0 if empty) |

## Entity relationship

```mermaid
erDiagram
  AppSettings ||--o{ Session : "baseline for bankroll"
  ActiveSession ||--o{ ActiveTable : "has"
  Session ||--o{ SessionTable : "snapshot"
  ActiveTable ||--o| TableRules : "rules_json"
  SessionTable ||--o| TableRules : "rules_json snapshot"
  Session {
    string id PK
    string date
    string location
    number startingBankroll
    number buyIn
    number cashOut
    number hoursPlayed
    number netResult
    string notes
    string createdAt
    string updatedAt
  }
  ActiveSession {
    string id PK
    string location
    number startingBankroll
    number accumulatedMs
    boolean isPaused
  }
  ActiveTable {
    string id PK
    string activeSessionId FK
    string name
    number netResult
    string rulesJson
  }
  SessionTable {
    string id PK
    string sessionId FK
    string name
    number netResult
    string rulesJson
  }
  TableRules {
    number decks
    string blackjackPayout
    string dealer17
    boolean doubleAfterSplit
    boolean lateSurrender
  }
  AppSettings {
    number startingBankroll
    string currency
  }
  WinLossRecord {
    number wins
    number losses
    number pushes
  }
  Session ||--o| WinLossRecord : "aggregates into"
```

`TableRules` is not a separate SQLite table — it is JSON stored in
`active_tables.rules_json` / `session_tables.rules_json`.

`AppSettings` is not a foreign key relationship. Sessions do not store a
settings id; settings is a singleton row used when deriving current bankroll
and formatting money.

## Storage layout

```mermaid
flowchart LR
  subgraph SQLite["stacktrack.db"]
    Meta[meta]
    SettingsTbl[settings]
    SessionsTbl[sessions]
    ActiveSessions[active_sessions]
    ActiveTables["active_tables<br/>rules_json"]
    SessionTables["session_tables<br/>rules_json"]
  end

  Store["sessionStore + liveSessionStore"] --> SQLite
  RulesLib["tableRules.ts<br/>parse serialize"] --> Store
  Store -.->|"one-time import"| Legacy[AsyncStorage legacy keys]
  SessionCtx[SessionContext] --> Store
  LiveCtx[LiveSessionContext] --> Store
  Screens[App screens] --> SessionCtx
  Screens --> LiveCtx
  Screens --> RulesLib
  Stats[stats.ts] --> SessionCtx
```

## Future extension points

Keep simulation/training data out of the session tracker schema. Suggested
later additions without rewriting the MVP model:

- Approximate house-edge ranking on `RankBadge` (done) → deeper combinatorial sim later
- `SimulationRun` / `TrainingDrill` tables behind `meta.schema_version` bumps
- Optional cloud sync behind the same `sessionStore` API
