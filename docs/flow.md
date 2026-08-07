# StackTrack app flow

High-level navigation and data flow for the MVP.

## Navigation map

```mermaid
flowchart TD
  Root["app/_layout.tsx<br/>SessionProvider + LiveSessionProvider"] --> Tabs[tabs]
  Root --> Live["Active Session<br/>live"]

  Tabs --> Dashboard["Dashboard<br/>(tabs)/index"]
  Tabs --> Add["Add Session<br/>(tabs)/add-session"]
  Tabs --> History["History<br/>(tabs)/history"]
  Tabs --> Settings["Settings<br/>(tabs)/settings"]

  Dashboard -->|Start or continue| Live
  Live -->|End session| Dashboard
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
  Ctx->>Store: loadSessions() + loadSettings()
  Store->>DB: open stacktrack.db + ensure schema
  Store->>DB: check meta.async_migrated
  alt not migrated yet
    Store->>AS: read legacy envelopes
    Store->>DB: import validated rows
    Store->>AS: remove legacy keys
  end
  Store->>DB: SELECT sessions / settings
  Store-->>Ctx: Session[] + AppSettings
  Ctx-->>App: isLoading = false
  App-->>App: render tabs
```

## Live session flow

```mermaid
flowchart TD
  Dashboard[Dashboard] -->|Start live session| Live[Active Session screen]
  Live -->|Add table| Tables[Table cards list]
  Live -->|Pause / Resume| Timer[Accumulated elapsed time]
  Live -->|End session| EndForm["Confirm location buy-in cash-out"]
  EndForm --> Persist["Save Session + SessionTables"]
  Persist --> Dashboard
  Dashboard -->|Tap history item| Detail[Session Detail]
  Detail --> TableOverview[Tables overview]
  Tables -->|Edit rules| RulesModal[TableRulesForm]
  RulesModal -->|Save rules_json| Tables
  Tables --> Rank[rankTables house edge]
  Rank --> Badge[RankBadge absolute tier]
  Rank -->|unique lowest HE| BestFrame[Best rules frame]
  TableOverview -->|Read-only summary| RulesSummary[formatTableRulesSummary]
  TableOverview --> Rank
```

Timer state is persisted in `active_sessions`. On end, `hoursPlayed` comes from
elapsed ms; active rows are cleared after `session_tables` are copied.

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
  B --> C{"Validate date<br/>location, amounts"}
  C -->|invalid| B
  C -->|valid| D[SessionContext.addSession]
  D --> E["Compute netResult<br/>cashOut - buyIn"]
  E --> F["Persist Session[]<br/>via sessionStore"]
  F --> G[Navigate to History]
  F --> H["Dashboard stats refresh<br/>on next focus/render"]
```

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
  Stats --> Cards[StatCard values]
  Stats --> Trend[BankrollTrend]
  Sessions --> List[SessionListItem]
```

Dashboard does not store aggregates. It reads `sessions` + `settings` from
context and recalculates on each render.

## Layered architecture

```mermaid
flowchart TB
  UI["app screens + TableRulesForm"]
  Ctx[SessionContext + LiveSessionContext]
  Lib[src/lib/stats + format + liveTimer + tableRules + houseEdge]
  Types[src/types/session + liveSession + tableRules]
  Persist[sessionStore + liveSessionStore]
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
