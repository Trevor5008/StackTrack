# StackTrack app flow

High-level navigation and data flow for the MVP.

## Navigation map

```mermaid
flowchart TD
  Root["app/_layout.tsx<br/>SessionProvider + LiveSessionProvider"] --> Tabs[tabs]
  Root --> Live["Active Session<br/>live"]
  Root --> Casino["Casino screen<br/>casino/id"]

  Tabs --> Dashboard["Dashboard<br/>(tabs)/index"]
  Tabs --> Add["Add Session<br/>(tabs)/add-session"]
  Tabs --> History["History<br/>(tabs)/history"]
  Tabs --> Settings["Settings<br/>(tabs)/settings"]

  Dashboard -->|Add casino| Casino
  Dashboard -->|Tap casino| Casino
  Casino -->|Start or continue live| Live
  Live -->|End session| Casino
  Dashboard --> Detail["Session Detail<br/>session/id"]
  History --> Detail
  Detail --> Edit[Inline edit via SessionForm]
  Detail --> Delete[Confirm delete]
  Detail --> Tables[Tables overview]
```

## Startup flow

```mermaid
sequenceDiagram
  participant App as Root layout
  participant Ctx as SessionContext
  participant Store as sessionStore
  participant DB as expo-sqlite
  participant AS as AsyncStorage legacy

  App->>Ctx: mount SessionProvider
  Ctx->>Store: loadSessions() + loadSettings() + loadCasinos()
  Store->>DB: open stacktrack.db + ensure schema
  Store->>DB: check meta.async_migrated
  alt not migrated yet
    Store->>AS: read legacy envelopes
    Store->>DB: import validated rows
    Store->>AS: remove legacy keys
  end
  Store->>DB: SELECT sessions / settings / casinos
  Store-->>Ctx: Session[] + AppSettings + Casino[]
  Ctx-->>App: isLoading = false
  App-->>App: render tabs
```

## Live session flow

```mermaid
flowchart TD
  Dashboard[Dashboard casino cards] -->|Add casino| AddCasino[Name new casino]
  AddCasino --> CasinoScreen[Casino screen]
  Dashboard -->|Tap casino| CasinoScreen
  CasinoScreen -->|Start| BudgetModal["Budget + risk tolerance"]
  BudgetModal --> Live[Active session]
  Live -->|Add table| Tables[Table cards start paused]
  Tables -->|Set rules| RulesReady[RoR still unknown]
  RulesReady -->|Play| StakeModal["Betting unit + stake"]
  StakeModal --> Calc["BS RoR from units and -HE"]
  Calc -->|ror greater than tol| Bad[Not viable]
  Calc -->|ror less or equal tol| Ok[Viable]
  StakeModal --> TableTimer[Timer runs with stake out]
  TableTimer -->|Pause| ResultsModal["Ending chips"]
  ResultsModal -->|Update budget and net| Tables
  Live -->|End| Confirm["Confirm derived cash-out"]
  Confirm --> Persist["buyIn=budget cashOut=remaining"]
  Persist --> CasinoScreen
  CasinoScreen -->|Recent sessions| Detail[Session Detail]
  Detail --> TableOverview[Tables with elapsed net RoR]
  Tables -->|Edit rules| RulesModal[TableRulesForm]
  RulesModal --> Tables
```

### Bankroll → budget → stake

- **Start session**: choose session budget (`0 < budget ≤ currentBankroll`) and **risk tolerance** preset
- **Play**: choose betting unit (`≥ table min`) and stake (`≤ remaining budget`); only one table may run
- **Pause**: enter ending chips; `net = ending − stake`; chips return to remaining
- **End**: confirmation only — persist `buyIn = budget`, `cashOut = remaining`,
  `netResult = cashOut − buyIn` (updates global bankroll via existing stats)
- Block end while any table still has stake out / is playing

Helpers: `assertBudget`, `assertStake`, `computeRemainingBudget` in
`src/lib/sessionBudget.ts`.

### Risk of Ruin (basic strategy)

- RoR is **unknown** until table rules and betting unit are set
- Estimate uses session bankroll (`remaining + open stakes`) ÷ unit and approximate house edge (BS only; no counting)
- If estimated RoR **>** session risk tolerance → **Not viable** visual (soft warn on Play)
- Helpers: `estimateBasicStrategyRoR`, `isTableViable` in `src/lib/riskOfRuin.ts`

### Per-table timers

Timers live on `active_tables` (`accumulated_ms`, `segment_started_at`,
`is_paused`, `paused_at`). Product rules:

- Starting a live session does **not** start time; Play starts the table timer
- New tables start **paused** at `0`
- Only **one** table may run; Play on another is blocked until pause + results
- Banner elapsed and end-session `hoursPlayed` are the **sum** of table elapsed times
- On end, snapshot each table’s elapsed to `session_tables.elapsed_ms`

Helpers: `sumTableElapsedMs`, `assertCanPlayTable`, `computeElapsedMs` in `src/lib/liveTimer.ts`.

## Table rules flow

```mermaid
sequenceDiagram
  participant Live as live.tsx
  participant Form as TableRulesForm
  participant Ctx as LiveSessionContext
  participant Lib as tableRules.ts
  participant Store as liveSessionStore
  participant DB as expo-sqlite

  Live->>Form: open sheet with parse or defaults
  Form->>Live: onSave TableRules
  Live->>Lib: serializeTableRules
  Live->>Ctx: updateTable rulesJson
  Ctx->>Store: updateActiveTable
  Store->>DB: UPDATE active_tables.rules_json
  Note over Live,DB: End session copies rules_json into session_tables
  Live->>DB: session detail reads snapshot read-only
```

## Add session flow

```mermaid
flowchart LR
  A[Add Session screen] --> B[SessionForm]
  B --> C{"Validate date<br/>casinoId, amounts"}
  C -->|invalid| B
  C -->|valid| D[SessionContext.addSession]
  D --> E["Compute netResult<br/>cashOut - buyIn"]
  E --> F["Persist Session[]<br/>via sessionStore"]
  F --> G[Navigate to History]
  F --> H["Dashboard / casino stats refresh"]
```

Manual add/edit uses a casino picker (select existing or create) so every
session stays a child of a casino.

## Edit / delete flow

```mermaid
flowchart TD
  Detail[Session Detail] -->|Edit| Form[SessionForm with initialValues]
  Form --> Update[updateSession]
  Update --> Persist[saveSessions]
  Persist --> Detail

  Detail -->|Delete| Confirm[Alert confirm]
  Confirm -->|Cancel| Detail
  Confirm -->|Delete| Remove[deleteSession]
  Remove --> Persist2[saveSessions]
  Persist2 --> History[History]
```

## Stats derivation flow

```mermaid
flowchart LR
  Settings[AppSettings.startingBankroll] --> Stats["src/lib/stats.ts"]
  Sessions["Session[]"] --> Stats
  Stats --> Cards[StatCard / CasinoCard values]
  Stats --> Trend[BankrollTrend]
  Sessions --> List[SessionListItem]
  CasinoId[casinoId filter] --> Stats
```

Dashboard lists casinos with scoped aggregates. Casino screen filters sessions
by `casinoId` then reuses the same stats helpers. Hourly rate on the casino
screen uses that filtered list and `ceil(totalHours)` so brief sits do not
show extreme $/hr.

## Layered architecture

```mermaid
flowchart TB
  UI["app screens + CasinoCard + TableRulesForm"]
  Ctx[SessionContext + LiveSessionContext]
  Lib[src/lib/stats + format + liveTimer + sessionBudget + riskOfRuin + tableRules + houseEdge]
  Types[src/types/session + casino + liveSession + tableRules]
  Persist[sessionStore + casinoStore + liveSessionStore]
  Device[expo-sqlite]

  UI --> Ctx
  UI --> Lib
  Ctx --> Persist
  Ctx --> Types
  Lib --> Types
  Persist --> Types
  Persist --> Device
```

Business logic stays in `src/lib` and `src/storage`. Screens stay thin and
mostly compose forms, lists, and derived values.
