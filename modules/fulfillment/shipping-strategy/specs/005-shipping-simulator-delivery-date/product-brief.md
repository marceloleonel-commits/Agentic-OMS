# Product Brief — Shipping Simulator: Delivery Date Display

| Field | Value |
|---|---|
| **Module** | Fulfillment |
| **Feature** | shipping-strategy |
| **PM** | Carolina Tourinho |
| **Eng Champion** | TBD |
| **Status** | Under definition |
| **Expected Release** | TBD |
| **Availability** | TBD |
| **Priority** | P2 |

---

## MMR

**Title:** Shipping Simulator — Delivery Date Display

**Description:** The shipping simulator currently shows estimated lead time in days (e.g., "3 dias"). This MMR adds the estimated delivery date as a calendar date (e.g., "Arrives June 5"), computed from the lead time, business days, and shipping policy cutoff hours — giving operators a more actionable and realistic picture of what the shopper will see at checkout.

---

## Problem

Lead time expressed in days is ambiguous: "3 dias" means different things depending on the day of the week, the cutoff hour of the carrier, and the account's business day calendar. Operators currently have to mentally calculate the delivery date, which is error-prone and does not match what the shopper sees at checkout.

---

## Goals

- Display the estimated delivery date alongside (or instead of) the lead time in days for each freight option
- Compute the date using the same logic applied at checkout: base date + lead time in business days, respecting cutoff hours per shipping policy

---

## Open Questions

- Is the delivery date calculation available as a reusable function/service, or does it need to be implemented specifically for this simulator?
- How should weekends and holidays be handled — is there a business calendar API?
- Should the date be shown as absolute ("June 5") or relative ("in 3 business days, arrives June 5")?
