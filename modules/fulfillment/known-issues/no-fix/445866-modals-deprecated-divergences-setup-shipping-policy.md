# KI 445866 — Modals Deprecated Divergences Setup - Shipping Policy

| Field | Value |
|---|---|
| **Area** | Logistics |
| **Status** | No Fix |

**Description:** There is a scenario involving a mismatch between used and deprecated modals. The shipping policies do not show the correct deprecated modals in the UI, which causes confusion during simulations because the shipping policy cannot handle the modal type. While the UI looks normal, checking the API reveals the mismatch.

**Workaround:** Two options: (1) Change the modal on the SKU to one supported by the Shipping Policy, or (2) Include the deprecated modal on the Shipping Policy via API.

**Links:**
- Help Center: https://help.vtex.com/known-issues/modals-deprecated-divergences-setup-shipping-policy--445866
- Zendesk: https://vtexhelp.zendesk.com/agent/tickets/445866
