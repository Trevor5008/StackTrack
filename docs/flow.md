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
  Tables -.->|stub| RulesModal[Rules modal later]
```

Timer state is persisted in `active_sessions`. On end, `hoursPlayed` comes from
elapsed ms; active rows are cleared after `session_tables` are copied.

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
  UI[app screens + src/components]
  Ctx[SessionContext + LiveSessionContext]
  Lib[src/lib/stats + format + liveTimer]
  Types[src/types/session + liveSession]
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
