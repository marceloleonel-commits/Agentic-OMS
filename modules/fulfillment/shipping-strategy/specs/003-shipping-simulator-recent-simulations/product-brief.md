# Product Brief — Shipping Simulator: Recent Simulations

| Field | Value |
|---|---|
| **Module** | Fulfillment |
| **Feature** | shipping-strategy |
| **PM** | Carol Tourinho |
| **Eng Champion** | TBD |
| **Status** | Under definition |
| **Expected Release** | TBD |
| **Availability** | TBD |
| **Mode** | B2C & B2B |
| **Depends on** | `001-shipping-simulator-shoreline-redesign` |

---

## MMR

**Title:** Shipping Simulator — Recent Simulations with 30-Day History

**Description:** With this release, logistics operators will be able to see and restore their last 5 simulations directly from the simulator interface, without re-entering parameters. Each simulation is saved automatically after execution, persisted across sessions via browser storage, scoped to the logged-in user, and expires after 30 days. The feature is available in both the classic UI (as a collapsible panel above the form) and the agentic UI (as clickable cards on the home screen).

**Availability:** TBD

**Target Audience:**
- **Tier:** All tiers
- **Merchant Profile:** Accounts with active logistics operations; operators who run multiple simulations per session (go-live validation, seasonal reconfiguration, carrier testing)
- **Persona:** Logistics Administrator / Operations Manager
- **Pain:** Operators who validate complex logistics configurations often run the same or similar simulations repeatedly — different ZIP codes for the same seller, the same SKU across different sales channels. Today, every session starts blank: there is no memory of what was run before, and re-entering all parameters (sales channel, seller, SKU, ZIP, quantity) takes 30–60 seconds per simulation.
- **Use Case:** Re-run a simulation from yesterday's validation session; continue testing from where you left off after a break; compare results between two ZIP codes using the same base parameters.

---

## Feature Delta

The current Shipping Simulator (both legacy and Shoreline redesign) has no session memory. Each time the operator opens the tool, they start with a blank form. This creates friction in workflows where the same parameters are reused frequently, such as:

- Go-live validation across multiple ZIP codes
- Comparing carrier availability between fulfillment points
- Debugging shipping configuration changes over multiple sessions

This MMR adds a lightweight history layer: auto-save on execution, user-scoped persistence via `localStorage`, 30-day TTL, and one-click restore. It does not require a backend change.

> **Why a separate MMR from the Shoreline redesign (`001`)?** The redesign (`001`) focuses on the core simulation experience — form, results, and error visibility. Recent simulations is an additive UX layer that brings session continuity. It has a distinct implementation pattern (`localStorage`), different user story, and independent delivery timeline. Bundling it would complicate the engineering contract for `001` without adding to the core value proposition.

---

## Scope

### Auto-save
- Every completed simulation is automatically saved to the recents list — no manual action required from the operator
- Saved data per entry: sales channel label, seller name, SKU name(s), ZIP code, quantity, and timestamp
- Entries are de-duplicated: if the same SKU + ZIP + seller combination is run again, the existing entry is updated with a new timestamp rather than duplicated

### Storage and persistence
- Storage mechanism: `localStorage` (browser-native, no backend required)
- Storage key format: `vtex_sim_recents_{accountName}_{userId}`
- User isolation: each operator sees only their own simulations — two operators on the same account have separate lists
- Session persistence: simulations persist across page reloads, tab switches, and browser restarts

### Expiry
- Each entry carries a `ts` (Unix timestamp) set at save time
- Entries older than **30 days** are silently discarded on load — no notification, no explicit delete action required
- The 30-day window is measured from the time the simulation was run, not from when it was last viewed

### Limit
- Maximum of 5 entries per user context
- When the limit is exceeded, the oldest entry is dropped to make room for the new one

### Classic UI surface
- Collapsible "Últimas simulações / Recent simulations" panel above the form
- Default state: collapsed
- Each entry shows: SKU name, quantity (if > 1), ZIP, seller, sales channel, relative timestamp ("há 2h", "3d ago")
- Clicking an entry pre-fills the form parameters and re-executes the simulation automatically
- A toast notification confirms the restore action

### Agentic UI surface
- Clickable cards below the suggestion cards on the home screen
- Cards are only shown when there are saved entries — section is hidden when empty
- Clicking a card pre-fills the agent state and immediately re-runs the simulation in the thread view

### Graceful degradation
- If `localStorage` is unavailable (private browsing, quota exceeded, browser restrictions), the feature degrades to in-memory operation for the current session without surfacing an error

---

## Not in scope
- Server-side persistence (simulations syncing across devices or browsers)
- Sharing saved simulations between users
- Manually naming or tagging saved simulations
- Exporting the recents list
- Notifications for expiring entries

---

## Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | What is the correct VTEX user identifier to use as the storage key? Is it the `userId` from the admin session token, or the `userEmail`? | Engineering | Open |
| 2 | Should the list reset when the operator switches accounts (multi-account environments)? | PM | Open — current assumption: yes, key includes `accountName` |
| 3 | Is 5 entries the right limit, or should it be configurable (e.g., per-account setting)? | PM | Open |
