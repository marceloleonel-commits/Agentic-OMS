# MMR: Enable Independent Bidirectional Threshold Configuration for Picker Order Changes

---

## 1. Slack Announcement Draft

```
✨ *Improvement:* Pick and Pack — Threshold Configuration for Order Changes

> Previously, store managers could only configure a single directional threshold
> for weight, quantity, and price changes — and weight and quantity shared a single
> control. This forced grocery merchants to either absorb order variance costs or
> charge shoppers incorrectly when pickers adjusted weighable items.
>
> Store managers can now configure independent positive and negative thresholds
> for weight changes, quantity changes, price changes, and total order value changes
> — separately per dimension — in a single Admin session. Pickers operate within
> those defined bounds across all relevant steps of the picking flow.

• *Product Team:* [PM INPUT NEEDED: team name as seen in vai.vtex.com/tech-org]
• *Availability:* Generally Available
• *ETA for Public Release:* [TBD]
• *More Details on Roadmap Hub:* [TBD]
```

---

## 2. MMR Definition

**MMR name**
Enable independent bidirectional threshold configuration for picker order changes

**Client outcome**
Store managers at grocery merchants can configure separate positive and negative thresholds for weight, quantity, price, and total order value changes — independently per dimension — in a single Admin session. Pickers operate within those defined limits across the picking flow. Merchants stop absorbing order variance costs or charging shoppers incorrectly due to threshold configuration constraints.

---

### Scope — what will be built

**1. Bidirectional weight threshold configuration**
A store manager can set a positive limit and a negative limit for weight changes independently in a single Admin session, without one value overwriting the other. The picker flow enforces both limits during the weight change step.

**2. Bidirectional quantity threshold configuration**
A store manager can set a positive limit and a negative limit for quantity changes independently in a single Admin session. The picker flow enforces both limits during the quantity change step.

**3. Bidirectional price threshold configuration**
A store manager can set a positive limit and a negative limit for price changes independently in a single Admin session. The picker flow enforces both limits during the price change step.

**4. Bidirectional total order value threshold configuration**
A store manager can set a positive limit and a negative limit for total order value changes independently in a single Admin session. The picker flow enforces both limits when pickers add, replace, or remove items that affect the total order value.

> **Development note:** These four capabilities can be developed and tested independently by threshold dimension. The release to merchants ships all four as a single unit — partial availability is not a valid release state.

---

### Explicit out of scope

- **Category-level threshold configuration** — thresholds are global per merchant; no per-category or per-SKU granularity in this release
- **Threshold breach visibility and audit trail** — observability of when and how often pickers hit threshold limits is a separate initiative
- **Per-store threshold configuration** — global per merchant only; store-level overrides are out of scope
- **New threshold dimensions** — only weight, quantity, price, and total order value are in scope; any additional picker action types (e.g., item substitution limits) are not
- **Data model changes** — all four dimensions are already stored as separate values in the backend; this is a UI-only change to the Admin configuration experience

---

### Success metrics

- **Adoption:** All active grocery merchants (Hiperideal, Flora y Fauna, Grupo Ramos) have configured bidirectional thresholds for all four dimensions within 30 days of release
- **Quality:** Zero support tickets citing threshold configuration confusion or one-directional behavior in the 60 days following release
- **Value:** Hiperideal and Flora y Fauna confirm no cost absorption from weight variance on weighable items within 60 days post-release; Grupo Ramos onboards with correct threshold governance in place from day one

---

### Open decisions

**Blocking:** None. Backend model is confirmed as separate fields for all dimensions. No data model work required.

**Non-blocking:**
- UX design for the new threshold input component — dual numeric fields (one positive, one negative) vs. a range input with two handles. Can be resolved during development without blocking scope.

---

### Dependencies

None external. This is a self-contained Admin UI change against an existing backend data model. No dependency on other teams or platform services.

---

### Strategic reference

This MMR is not explicitly named in the Vision phasing, but it is a prerequisite for grocery merchants operating Pick and Pack correctly at scale — and specifically for Grupo Ramos (highest ACV account at $200,000 USD) launching with correct threshold governance. It supports the grocery-first operational correctness goal that underpins Phase 2 and Phase 3 of the Pick and Pack Vision.
