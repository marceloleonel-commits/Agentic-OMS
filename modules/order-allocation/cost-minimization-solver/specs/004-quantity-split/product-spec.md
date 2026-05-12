# Product Spec — Quantity Split

## Clarifications

- **Q: What is the difference between split by line item and split by quantity?**
  A: Split by line item means a SKU that no single seller can fully cover is still partially fulfilled — the available quantity ships and the remainder is handled by the resolution rule. The solver does *not* distribute the quantity across multiple sellers; it finds the best single-seller partial match. Split by quantity means a single SKU's quantity is actively distributed across multiple sellers (e.g., 3 units from Seller A + 2 units from Seller B = 5 units ordered). Both modes use the same resolution rules for any unmatched remainder.

- **Q: Does quantity split apply when a single seller has the full quantity?**
  A: The solver always prefers single-seller fulfillment when feasible. Quantity split is evaluated as a fallback when no single seller has the full quantity, OR when a quantity split produces a lower total cost than any single-seller option — subject to merchant configuration (merchants can restrict quantity split to availability-only scenarios and disable cost-driven splits).

- **Q: Do all split legs need to deliver at the same time?**
  A: Yes. Each partial shipment must honor the original delivery promise. A split where Seller A delivers in 2 days and Seller B delivers in 5 days is invalid if the shopper selected a 2-day SLA.

- **Q: Does a quantity split leg count as a separate seller for `maxNumberOfSellersWhitelabel`?**
  A: Yes. Each seller in a quantity split counts as one seller toward the `maxNumberOfSellersWhitelabel` order-level limit.

- **Q: What is the maximum number of sellers allowed in a single quantity split?**
  A: Configurable per merchant (default: 2 sellers per SKU). Merchants can adjust this through the Order Allocation Agent. Absolute maximum is 3 sellers per SKU in GA due to solver complexity constraints.

- **Q: What happens if a quantity split would violate the minimum quantity per leg configured by the merchant?**
  A: That split combination is excluded from consideration. If no valid combination remains, the SKU is handled per the configured resolution rule (cancel, Customer Care, or backorder).

- **Q: Is quantity split evaluated per line item or across the full order?**
  A: Per line item first; then the full order combination is evaluated for total cost and `maxNumberOfSellersWhitelabel` compliance.

- **Q: Does quantity split interact with order-level splits (different SKUs to different sellers)?**
  A: Yes. A single order can have both: Seller A for SKU 1 entirely, and Sellers B + C splitting the quantity of SKU 2. Both contribute to the `maxNumberOfSellersWhitelabel` count.

- **Q: Is quantity split enabled by default?**
  A: No. Opt-in per merchant. Disabled by default to avoid unexpected multi-package deliveries for merchants who haven't reviewed the operational implications.

- **Q: Should the resolution of unmatched quantities happen in the synchronous or asynchronous flow?**
  A: Open question — to be resolved before engineering kickoff. The answer affects when the shopper receives confirmation and what order state is visible at Order Placed.

- **Q: What happens when the solver cannot find any match at all (no-match scenario)?**
  A: Merchant configures a no-match fallback rule — one of: cancel the entire order, assign the entire order to Customer Care, or assign the entire order to backorder. This is independent of the partial-match resolution rule.

---

## Example: Split by Line Item vs. Split by Quantity

**Order:**
- SKU A → Ordered: 5 units | Stock across sellers: 3 units (Seller A)
- SKU B → Ordered: 2 units | Stock: 0 units

**Split by Line Item (resolution: cancel unmatched):**
- SKU A → Ship 3 units from Seller A; cancel the missing 2 units
- SKU B → No stock available; cancel both units

**Split by Quantity across sellers (resolution: cancel unmatched):**
- SKU A → Ship 3 units from Seller A + 2 units from Seller B (if Seller B has stock within SLA); cancel any remainder if combined stock < 5
- SKU B → No stock available; cancel both units

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — B2B order fulfilled via quantity split where no single seller has the full stock (Priority: P1)

A B2B customer at Rona orders 300 units of an electrical part. Seller A (a regional warehouse) has 200 units available within the original SLA. Seller B (another regional warehouse) has 150 units. No single seller can fulfill the full quantity. With quantity split enabled and a maximum of 2 sellers per SKU configured, the solver evaluates: 200 from Seller A + 100 from Seller B = 300 units, both within the SLA, at a total cost lower than any single-seller alternative. The order is fulfilled. Without quantity split, the line item would have been unavailable.

**Why this priority:** This is the core value of the MMR — availability recovery for line items that would otherwise be undeliverable.

**Independent Test:** Place an order for a quantity that exceeds any single seller's stock but can be covered by combining two sellers within the same SLA. Confirm: with quantity split enabled, the order is fulfilled; with quantity split disabled, the line item is treated per the no-match fallback rule.

**Acceptance Scenarios:**

1. **Given** no single seller has the full quantity, **When** quantity split is enabled and a valid combination exists within the configured seller cap, **Then** the solver allocates across sellers and the order is fulfilled.
2. **Given** a valid quantity split exists, **When** the solver evaluates it, **Then** each leg's delivery time must match the original SLA; legs that deviate are excluded.
3. **Given** a merchant has configured max 2 sellers per SKU, **When** only a 3-seller combination covers the full quantity, **Then** that combination is excluded and the unmatched remainder is handled by the resolution rule.
4. **Given** a merchant has configured minimum 10 units per split leg, **When** the only valid split produces a leg with 7 units, **Then** that combination is excluded.
5. **Given** a quantity split is used, **When** seller counts are evaluated, **Then** each seller counts toward `maxNumberOfSellersWhitelabel`; splits that would exceed the limit are excluded.
6. **Given** a single seller has the full quantity AND a quantity split across two sellers is cheaper, **When** the merchant has not configured a single-seller preference, **Then** the solver selects the lowest-cost option — which may be the quantity split.
7. **Given** a merchant has configured "prefer single-seller even if split is cheaper," **When** a single seller has the full quantity, **Then** single-seller is selected regardless of cost comparison.

---

### User Story 2 — Partial fulfillment with unmatched quantities handled by resolution rule (Priority: P1)

An Auchan operations manager has configured: split by quantity, cancel unmatched quantities. A grocery order includes 8 units of a SKU. Seller A has 5 units, Seller B has 2 units — combined 7, short of the 8 ordered. The solver allocates 5 from Seller A + 2 from Seller B = 7 units shipped. The remaining 1 unit is automatically cancelled. The order is confirmed and shipped as a partial fulfillment rather than failing entirely.

**Why this priority:** This is the partial fulfillment scenario that unlocks availability recovery without requiring merchants to handle gaps manually. It's the most operationally simple resolution path.

**Acceptance Scenarios:**

1. **Given** the combined available quantity across sellers is less than the ordered quantity, **When** resolution rule is "cancel unmatched," **Then** available quantities are allocated and shipped; the unmatched remainder is cancelled automatically.
2. **Given** resolution rule is "assign to Customer Care," **When** unmatched quantities exist after allocation, **Then** they are forwarded to Customer Care without blocking shipment of fulfilled quantities.
3. **Given** resolution rule is "backorder," **When** unmatched quantities exist after allocation, **Then** they are placed on backorder and held until restocked, without blocking shipment of fulfilled quantities.
4. **Given** the shopper places an order with a partial fulfillment outcome, **When** the order is confirmed, **Then** the shopper's confirmation reflects the fulfilled quantities and the status of the unmatched remainder per the resolution rule.

---

### User Story 3 — No-match scenario: entire order routed per fallback rule (Priority: P1)

A C&A logistics manager has configured: no-match fallback = assign to Customer Care. A B2B order comes in for a uniform SKU, but no eligible seller has any stock within the delivery SLA. The solver finds no valid allocation for any quantity. The entire order is assigned to Customer Care for manual intervention, rather than being cancelled silently.

**Why this priority:** Merchants need explicit control over what happens when Order Allocation cannot match anything — silent cancellation is not acceptable for B2B customers.

**Acceptance Scenarios:**

1. **Given** no seller has any stock for any item in the order, **When** no-match fallback is "cancel entire order," **Then** the order is cancelled automatically.
2. **Given** no-match fallback is "assign to Customer Care," **When** no valid allocation exists, **Then** the entire order is forwarded to Customer Care.
3. **Given** no-match fallback is "backorder entire order," **When** no valid allocation exists, **Then** the entire order is held on backorder until restock.
4. **Given** a partial allocation is possible (some SKUs can be matched, others cannot), **When** no-match fallback applies, **Then** the partial-match resolution rule governs the unmatched SKUs — the no-match fallback only applies when zero items in the order can be allocated.

---

### User Story 4 — Merchant enables and configures quantity split through the Order Allocation Agent (Priority: P1)

An Omnichannel Manager at C&A opens the Order Allocation Agent and types: *"Allow splitting quantities across sellers, but never create a split with fewer than 5 units per seller and use at most 2 sellers per SKU. If quantities are still unmatched after splitting, cancel them automatically."* The agent interprets this as four settings, presents them for review, and saves them as active configuration.

**Acceptance Scenarios:**

1. **Given** the merchant describes quantity split settings in natural language, **When** the agent interprets the input, **Then** it identifies: enable/disable, max sellers per SKU, min quantity per leg, resolution rule for unmatched quantities — and presents them for review before saving.
2. **Given** the merchant approves the configuration, **When** it is saved, **Then** the solver applies the new settings immediately to subsequent orders.
3. **Given** quantity split is enabled, **When** the merchant runs a simulation, **Then** the simulation applies quantity split settings and the KPI report includes: number of line items recovered via quantity split, cost impact of split vs. single-seller, and volume of orders routed to each resolution path (cancel / Customer Care / backorder).

---

### User Story 5 — Quantity split does not apply when a single seller covers the full quantity (Priority: P2)

An OBI logistics manager has quantity split enabled. A B2C order contains 2 units of a SKU, and Seller A has 10 in stock. The solver allocates both units to Seller A without splitting.

**Acceptance Scenarios:**

1. **Given** a single seller has the full quantity, **When** the solver evaluates the line item, **Then** it prefers single-seller fulfillment unless a quantity split produces strictly lower total cost and the merchant hasn't configured a single-seller preference.
2. **Given** quantity split is disabled, **When** no single seller has the full quantity, **Then** the line item is handled per the no-match fallback rule — same behavior as before this MMR.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST evaluate quantity split combinations for line items where no single seller has the full ordered quantity, when quantity split is enabled for the merchant account.
- **FR-002**: The system MUST support split by line item as a distinct mode: allocate the available quantity to the best single-seller match; handle the unmatched remainder per the configured resolution rule.
- **FR-003**: The system MUST support the following resolution rules for unmatched quantities: (a) cancel automatically, (b) assign to Customer Care, (c) assign to backorder.
- **FR-004**: The system MUST support a separate no-match fallback rule for when zero quantities in the order can be allocated: (a) cancel entire order, (b) assign entire order to Customer Care, (c) assign entire order to backorder.
- **FR-005**: The system MUST exclude any quantity split combination where any leg's delivery time deviates from the original SLA.
- **FR-006**: The system MUST enforce the merchant-configured maximum sellers per SKU (default: 2; absolute GA max: 3); combinations exceeding this limit MUST be excluded.
- **FR-007**: The system MUST enforce the merchant-configured minimum quantity per split leg; combinations with any leg below the minimum MUST be excluded.
- **FR-008**: Each seller in a quantity split MUST count toward the order-level `maxNumberOfSellersWhitelabel` limit; combinations that would exceed this limit MUST be excluded.
- **FR-009**: The system MUST prefer single-seller fulfillment when a merchant has configured this preference, even if a quantity split produces lower total cost — unless no single seller has the full quantity.
- **FR-010**: Quantity split MUST be disabled by default; opt-in is required per merchant account.
- **FR-011**: All quantity split and resolution settings (enabled/disabled, max sellers per SKU, min quantity per leg, single-seller preference, partial-match resolution rule, no-match fallback rule) MUST be configurable through the Order Allocation Agent using natural language input (MMR 011 of the agent).
- **FR-012**: Simulation reports MUST include: number of line items recovered via quantity split, cost comparison of split vs. single-seller outcomes, and volume of orders per resolution path (cancel / Customer Care / backorder).
- **FR-013**: The system MUST apply quantity split within the same technical limits as the base solver: orders with up to 5 line items; progressive seller caps apply at the order level.

---

## Assumptions

- The solver's combination enumeration is extended to support quantity distribution across sellers per line item; the underlying optimization algorithm can incorporate this additional search dimension within existing performance constraints.
- Each split leg is evaluated independently for SLA — every leg must independently honor the original delivery promise, not just the earliest-arriving leg.
- The existing multi-package delivery experience in VTEX handles orders where the same line item arrives in multiple shipments; no new shopper-facing UI is required for this MMR.
- Backorder routing and Customer Care assignment are handled by downstream systems (Order Management); this MMR covers the signal and routing handoff, not the resolution workflow itself.
- Quantity split configuration is versioned alongside cost weights and constraint rules as part of the merchant's active strategy.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 1 GA merchant enables quantity split and shows measurable availability recovery — line items previously unavailable due to stock fragmentation are fulfilled.
- **SC-002**: 0 quantity split allocations where any leg's delivery time deviates from the original SLA.
- **SC-003**: 0 quantity split allocations that exceed `maxNumberOfSellersWhitelabel` or the merchant's configured maximum sellers per SKU.
- **SC-004**: Solver performance with quantity split enabled remains within P95 < 60s for standard orders — the expanded combination space does not breach the performance SLA.
- **SC-005**: All unmatched quantities are routed to the configured resolution path (cancel / Customer Care / backorder) with 0 unaccounted drops.
- **SC-006**: Merchants who enable quantity split report measurable reduction in line-item unavailability rates on high-volume orders within 30 days of activation.
