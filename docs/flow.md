# StackTrack app flow

High-level navigation and data flow for the MVP.

## Navigation map

```mermaid
flowchart TD
  Root["app/_layout.tsx<br/>SessionProvider"] --> Tabs[tabs]

  Tabs --> Dashboard["Dashboard<br/>(tabs)/index"]
  Tabs --> Add["Add Session<br/>(tabs)/add-session"]
  Tabs --> History["History<br/>(tabs)/history"]
  Tabs --> Settings["Settings<br/>(tabs)/settings"]

  Dashboard --> Detail["Session Detail<br/>session/id"]
  History --> Detail
  Detail --> Edit[Inline edit via SessionForm]
  Detail --> Delete[Confirm delete]
```

## Startup flow

```mermaid
sequenceDiagram
  participant App as Root layout
  participant Ctx as SessionContext
  participant Store as sessionStore
  participant AS as AsyncStorage

  App->>Ctx: mount SessionProvider
  Ctx->>Store: loadSessions() + loadSettings()
  Store->>AS: getItem(@stacktrack/sessions)
  alt no sessions saved
    Store->>AS: setItem(sampleSessions)
    Store-->>Ctx: sampleSessions
  else sessions exist
    Store-->>Ctx: stored Session[]
  end
  Store->>AS: getItem(@stacktrack/settings)
  Store-->>Ctx: AppSettings (or defaults)
  Ctx-->>App: isLoading = false
  App-->>App: render tabs
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
  UI[app screens + src/components]
  Ctx[src/context/SessionContext]
  Lib[src/lib/stats + format]
  Types[src/types/session]
  Persist[src/storage/sessionStore]
  Device[AsyncStorage]

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
