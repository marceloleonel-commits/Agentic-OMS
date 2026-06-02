# Product Spec — Shipping Simulator: Recent Simulations

## Clarifications

- Q: Is the recents list persisted across page reloads? → A: Yes. `localStorage` is used, so the list survives reloads, tab switches, and browser restarts within the same browser and device.
- Q: What happens if the operator runs the same simulation twice? → A: The existing entry for that SKU + ZIP + seller combination is replaced (updated timestamp, moved to the top of the list). No duplicates.
- Q: Does expiry require a cron job or backend? → A: No. Expiry is enforced client-side on load — entries older than 30 days are filtered out before rendering. No server involvement.
- Q: What if `localStorage` is not available? → A: The feature degrades gracefully to in-memory operation for the session. No error is shown to the operator.
- Q: Can the operator manually delete a saved simulation? → A: Not in scope for this MMR. Entries expire naturally after 30 days or are pushed out when the 5-entry limit is exceeded.
- Q: Are recents shared across multiple tabs? → A: Since `localStorage` is shared across tabs of the same origin, adding a simulation in one tab will be visible in another tab on next load. Real-time sync across tabs is not required for this MMR.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Operator resumes a simulation from a previous session (Priority: P1)

A logistics manager spent yesterday validating carrier coverage for ZIP codes in the Southeast region. Today she opens the simulator and sees her last 3 simulations listed in the "Últimas simulações" panel. She clicks the one for ZIP 22241-000 and the simulation runs immediately with the saved parameters.

**Why this priority:** This is the core value proposition of the feature. Without it, every session starts blank and the operator must re-enter all parameters.

**Acceptance Scenarios:**

1. **Given** the operator ran a simulation in a previous session, **When** they open the simulator again, **Then** the recents panel shows that simulation as an entry with the correct SKU, ZIP, seller, and relative timestamp.
2. **Given** a saved entry is visible in the panel, **When** the operator clicks it, **Then** all form fields are pre-filled with the saved parameters and the simulation executes automatically.
3. **Given** the operator has run 6 simulations over several sessions, **When** the panel is opened, **Then** only the 5 most recent entries are shown.

---

### User Story 2 — Operator's recents are isolated from other users (Priority: P1)

Two logistics managers, Ana and Bruno, share the same VTEX account. Each uses the shipping simulator. Ana should see only her own simulations; Bruno should see only his.

**Why this priority:** Without user isolation, the recents list becomes noisy and potentially exposes one operator's work context to another.

**Acceptance Scenarios:**

1. **Given** Ana runs a simulation and Bruno opens the simulator on the same account, **When** Bruno views the recents panel, **Then** Ana's simulation is not visible in his list.
2. **Given** both operators have simulations saved, **When** each opens the simulator, **Then** each sees only their own entries.

---

### User Story 3 — Expired simulations are removed silently (Priority: P1)

A logistics operator ran a simulation 31 days ago. Today she opens the simulator and that simulation is no longer in the recents panel — it expired without any notification or error.

**Acceptance Scenarios:**

1. **Given** a saved simulation has a timestamp older than 30 days, **When** the operator opens the simulator, **Then** that entry is not shown in the recents panel.
2. **Given** all saved simulations are older than 30 days, **When** the panel is shown, **Then** it displays the empty state ("No simulations saved yet") without any error or expiry notice.
3. **Given** a simulation was saved exactly 29 days ago, **When** the panel is shown, **Then** it is still visible.

---

### User Story 4 — Feature degrades gracefully in private browsing (Priority: P2)

An operator opens the simulator in a private/incognito browser window where `localStorage` is restricted. The recents panel still appears, but shows the empty state. The operator can still run simulations normally — they are saved in memory for the duration of the session only.

**Acceptance Scenarios:**

1. **Given** `localStorage` throws on access, **When** the simulator loads, **Then** no error is shown and the recents panel renders in its empty state.
2. **Given** `localStorage` is unavailable, **When** the operator runs a simulation, **Then** the simulation is saved in-memory and visible in the panel for the current session.
3. **Given** `localStorage` is unavailable and the operator reloads the page, **When** the simulator loads, **Then** the recents panel is empty (in-memory state was lost).

---

## Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-001 | The system MUST automatically save each completed simulation to the recents list immediately after the simulation returns results | P1 |
| FR-002 | Saved entries MUST be stored in `localStorage` using the key format `vtex_sim_recents_{accountName}_{userId}` | P1 |
| FR-003 | Each entry MUST contain: sales channel label, seller name, SKU name(s), ZIP code, quantity, and Unix timestamp (`ts`) | P1 |
| FR-004 | Entries MUST be de-duplicated by SKU + ZIP + seller. A repeated combination replaces the existing entry with a new timestamp | P1 |
| FR-005 | The list MUST be capped at 5 entries. When the limit is exceeded, the oldest entry is removed | P1 |
| FR-006 | On load, the system MUST filter out entries where `Date.now() - ts > 30 * 24 * 60 * 60 * 1000` (30 days in ms) | P1 |
| FR-007 | Expiry MUST be silent — no notification, toast, or warning is shown when entries expire | P1 |
| FR-008 | The storage key MUST include both `accountName` and `userId` to ensure isolation between users on the same account | P1 |
| FR-009 | Clicking a saved entry MUST pre-fill all available form fields and re-execute the simulation without additional user input | P1 |
| FR-010 | If `localStorage` throws or is unavailable, the system MUST fall back to in-memory storage for the current session without surfacing an error | P2 |
| FR-011 | The Admin UI panel MUST be collapsible, defaulting to collapsed | P2 |
| FR-012 | Each entry MUST display a relative timestamp (e.g., "há 2h", "3d ago") based on the saved `ts` | P2 |
| FR-013 | The agentic UI MUST show saved simulations as clickable cards on the home screen, hidden entirely when the list is empty | P2 |
| FR-014 | When the operator switches account context (prototype: client toggle), the recents list MUST reset to the entries for the new context | P2 |

---

## Technical Notes

### Storage key

```
vtex_sim_recents_{accountName}_{userId}
```

In the prototype, `accountName` = `DATA[client].account` and `userId` = `"demo_user"`.

In production, both values must come from the admin session context:
- `accountName` — available from the VTEX admin global context object
- `userId` — available from the authenticated user's session token (e.g., `VtexIdclientAutCookie` decoded, or the admin identity API)

### TTL check (client-side, on load)

```javascript
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const valid = entries.filter(e => (Date.now() - e.ts) < TTL_MS);
```

No cron job or server-side cleanup is needed.

### Graceful degradation pattern

```javascript
function loadRecents() {
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return [];
    return JSON.parse(raw).filter(e => (Date.now() - e.ts) < TTL_MS);
  } catch (e) {
    return []; // localStorage unavailable — silent fallback
  }
}
```

---

## Non-functional Requirements

| Requirement | Detail |
|---|---|
| **No backend dependency** | The entire feature runs client-side. No new API calls, no server-side storage. |
| **Storage size** | 5 entries × ~300 bytes each = ~1.5 KB per user context. Well within `localStorage` limits (~5 MB). |
| **Performance** | Load and save operations are synchronous but negligible in size. No impact on simulation latency. |
| **Language parity** | PT-BR and EN must have identical feature coverage and translated UI strings. |
