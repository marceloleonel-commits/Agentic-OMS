# Subscriptions Product Strategy

| | |
|---|---|
| **Created** | 12 de fev. |
| **Status** | Discussion |
| **Updated** | 24 de mai. |
| **Authors** | Amanda Castilho |
| **Version** | 1.0 |
| **Contributors** | Vinicius Lopes, Alexandre Gusmão |

## Objective

This document aims to (1) present the analysis of our Subscription solution, its potential for revenue, GMV growth, and roadmap proposal, and (2) offer Tech and Growth leadership information to decide this product's future based on our recommendation.

> **Note:** we have an alternative version of this document in PRFAQ format: *Subscriptions Add-On PRFAQ*

## TL;DR

The Subscription product has demonstrated market fit and profitability but still needs significant evolutions to reach its potential. **The proposed solution is to evolve the product as an add-on with additional resources** to meet the demands of merchants like Cobasi, Whirlpool, My Eye Doctor, and Fast Shop while addressing the product's maintenance and potential churn by Cobasi in 2025.

## Context

### Product Timeline in VTEX

**2017-2018:** The Subscription product started in 2017 as a response to a market trend of the subscription business model. In 2018, VTEX started working on Subscription V2, an evolution of the module, sponsored by Cobasi - which means the product was tailor-made for Cobasi use cases.

**2020-2023:** The product was absorbed by the Order Management team, where evolutions stopped due to a lack of bandwidth and other priorities, such as the New Order Management Admin Interfaces, Splunk Zero, Code Pink, Change Order evolutions, and Workflow Resiliency. In the Q1/2023 Review, the Order Management team raised the yellow flag about the Subscription module since it consumes a considerable bandwidth from the team for maintenance (e.g. Splunk Zero, PII, E-mail Rectification), even if it is not prioritized. Here are the key factors that led to the discussion:

- **High ticket rate:** In 2023, 522 tickets (the second highest tickets opened to the PS team, just behind the workflow) were opened regarding subscriptions to the Product Support team (generating a support cost of 6264 USD), 60 of which were escalated tasks requiring attention from the engineering team.
- **Multiple requests from Growth:** The product does not meet the needs of our customers or optimize our resources (see more in Appendix and Product Gaps sections). Merchants can become frustrated by the lack of updates, while the ongoing maintenance of the product demands bandwidth allocation. Growth BR opened a Business Case regarding Subscriptions in Q3/2023. However, Cobasi raises requests to the Product team constantly.

**2024:** In Q1, **Cobasi** - the merchant responsible for 65% of subscription orders in VTEX - declared a possible churn at the end of their contract in 2025 if we don't offer product evolutions in Subscriptions. This increased the subject's priority and incentivized this document. In Q2, **Whirlpool**, **My Eye Doctor, Americanas** and **Fast Shop** declared interest in using the product, but have encountered product gaps that block using VTEX's native solution.

## Product Market Fit

The Subscriptions product has a proven market fit for the recurrence business model with B2C customers in the pets, health and wellness, beauty, and food and beverages segments. The product also caters to subscription models (with heavy customizations) in segments such as education, fashion and beverages (wines). The value proposition to the customers relies on (1) integration with the VTEX Commerce Platform and OMS, and (2) low cost to operate since there is no extra take rate or fixed fee.

In 2023, the product reached 269 accounts, 1.3M orders and $57M USD in GMV, with Cobasi being responsible for 64% of the product's GMV. This highlights the size of the product, but also shows the untapped potential to expand it to more merchants and increase the products relevancy in the accounts that use it. Below, we detail the results in the past years.

## Subscriptions Relevant Data

### Main KPIs (2023)

#### Subscriptions P&L

| | 2021 | 2022 (GMV ⬆️ 120%) | 2023 (GMV ⬆️ 88%) | 2024 (projection) |
|---|---|---|---|---|
| # Accounts | 145 | 229 | 269 | TBD |
| Orders | 494,989 | 893,241 | 1,381,941 | 2,072,912 |
| GMV | $13,739,568.09 | $30,262,801.68 | $57,126,779.13 | $85,690,168.70 |
| Average TR | 0.50% | 0.50% | 0.50% | 0.50% |
| Revenue | $68,697.84 | $151,314.01 | $285,633.90 | $428,450.84 |
| Infra Costs/Order | $0.0012 | $0.0012 | $0.0012 | $0.0012 |
| Infra Costs | $593.99 | $1,071.89 | $1,658.33 | $2,487.49 |
| Eng Costs | $28,800.00 | $28,800.00 | $28,800.00 | $28,800.00 |
| Tickets | - | 341 | 261 | 197 |
| Support Costs | - | $8,184.00 | $6,264.00 | $4,728.00 |
| **Total Costs** | **$29,393.99** | **$38,055.89** | **$36,722.33** | **$36,015.49** |
| **Results** | **$39,303.85** | **$113,258.12** | **$248,911.57** | **$392,435.35** |

## Prospects and Analysts' Perspective

The Gartner and Forrester reports emphasize the importance of subscription capabilities for digital commerce platforms. Kibo received high scores for its robust subscription management, while Adobe Commerce and Infosys Equinox scored poorly. VTEX was praised for scalability but not specifically noted for subscriptions. Loop.io's RFP insights show the demand for subscription capabilities, with VTEX securing multiple deals. For a more detailed analysis, check out the Appendix.

It's crucial for an e-commerce platform and OMS solution to offer strong subscription features to enhance our marketing positioning.

## Benchmarks

| | | Recurrence Orders | Subscription Orders | Editing an existing subscription | Analytical and Insights | Card Auto Updater | Pricing Model |
|---|---|---|---|---|---|---|---|
| **Ecommerce Platforms** | VTEX | Yes, with limitations | Yes, with customizations | Yes | No, our dashboards are not reliable | No | No take rate or fixed price |
| | Shopify | Yes, with limitations | Yes, with limitations | No | Basic dashboards | Yes, using Shopify Payments | No take rate or fixed price |
| | Kibo | Yes | Yes | Yes | Yes | No | |
| **OMS** | Manhattan | No | No | No | No | No | N/A |
| **Subscription Players** | OrderGroove | Yes | Yes | Yes | Yes | | Fixed pricing |
| | Recurly | Yes | Yes | Yes | Yes | Yes | Fixed pricing and take rate |
| | Vindi | Yes, but only handles transactions - the order is created directly on the ERP | Yes, but only handles transactions - the order is created directly on the ERP | No | No | Yes | Fixed pricing |

## Product Gaps

The current native solution is named Subscriptions. However, it is more of a *recurrence* order engine. Use cases that require actual subscription capabilities are not fully met and require multiple customizations or are not placed in VTEX, with an external solution. We are separating the product gaps considering the two business models we know:

### Recurrency (or Replenishment)
*Allows consumers to automate the purchase of essential items in a defined frequency:*

- Improve cycle creation error messages: the current messages are not intuitive and actionable
- Improve analytical reports: The information in the reports is not trustworthy and the data is not clear - there are opportunities to show more relevant information
- Offer scheduled delivery (for grocery customers and service providers)
- Allow installment payments in subscription cycles
- Separate Attachments per item in recurrent orders
- Improve the alarms and payment retries - most of the errors in Cobasi are related to expired cards and transaction problems. How can we make the process easier for the shopper? Use other cards that are saved in the account? Notify an external endpoint to automate the reprocessing of cycles? Improve communication with shoppers, with clearer CTAs?
- Visibility of the next cycles to help operations plan accordingly to demand
- Subscriptions for line items: separate subscriptions that have different cycles to allow skipping a single item and not editing the whole subscription
- Hard to migrate subscriptions from external solutions. Merchants that already use third-party subscriptions have a lot of trouble to migrate to VTEX (this is what caused Hearst to use another solution)
- Allow more payment methods, such as PIX, Paypal, Klarna
- Define a date to *receive* the order, not only close the purchase

### Subscription Clubs or Access
*Highly personalized and curated products to subscribers on a regular, recurring basis. Subscribers can also pay a monthly fee to obtain lower prices or members-only perks:*

- Offer more robust plan options:
  - Date to begin and end the plan, with multiple renewal options
  - Option to offer fixed prices (configured on a plan level, not a subscription level)
- Subscription Clubs:
  - Choose which items will be allocated in the club, without the need to edit each subscription
  - Renewal Date and Payment processing can be different than the subscription cycle (for clubs, it is important to send out the subscriptions the same day)
- Different Promotions and Benefits for club members, create the MD Cluster with the subscribers automatically

## Conclusion

Based on the proven product market fit, including current GMV, customer base (269 merchants across all regions), and analysts' reports (Forrester and Gartner), we conclude that **VTEX must have and keep an internal Subscriptions product**. The current product offering doesn't justify charging for it, but we see potential selling it as an add-on product with additional features.

## Proposal

Considering the above we have mapped the following alternatives:

- **Freeze - Keep the product without evolution:**
  - Trade-offs:
    - Not meet the needs of key customers and possible churn from Cobasi by 2025
    - Lose new deals, including Whirlpool
    - Lose potential GMV of 57M USD and revenue of 285K USD

- **Evolve internally with the current product offering without additional resources:**
  - Trade-offs:
    - Maintain the free product, with manual activation. Only focusing on how to unlock critical capabilities for Cobasi, My Eye Doctor, and Fast Shop, starting on H2 2024.
    - Unprioritize core initiatives such as Change Order and Change Seller evolutions

- **Evolve internally as an add-on w/ additional resources to meet key customer needs:**
  - Our vision would be to turn the product into an add-on with freemium and paid versions.
  - Trade-offs:
    - Allocation of extra resources to the Order Management team (1 back-end engineer, 1 front-end engineer, and 1 associate product manager)

### Recommended Strategy Proposal

Based on the product market positioning, the customer risk, and the revenue opportunity, **the proposal is to evolve the product as an add-on**. The Order Management team cannot evolve the product with its current capacity since it is already understaffed and focusing on core capabilities such as Change Order and Seller evolutions, and the new Workflow.

In order to turn Subscriptions into an add-on, we must request two engineers and an associate product manager to work on product evolutions to handle immediate customer requests (Cobasi, Whirlpool, My Eye Doctor, and Fast Shop) and future evolutions to monetize the product further. The engineers and APM would be allocated to the Order Management team to leverage the Engineer Manager, Staff Engineer, Designer, and On-Call structure. We ask for leadership to consider this proposal.

## Next Steps

[TBD]

---

## Appendix

### Cobasi's Case Study

Cobasi is the biggest customer for subscriptions, accounting for 64% of the product's GMV in 2023. Additionally, subscription orders make up 16% of the company's total ecommerce GMV.

The merchant has stated that it will only renew its contract with VTEX if the product evolves by 2025. Cobasi's main concerns are related to KIs causing errors in the subscription cycle creation. However, a recent study by the Senior FSE Team revealed that their main issues stem from errors in payment processing, largely due to expired cards or unauthorized transactions. Focusing efforts on solving KIs wouldn't significantly impact their business.

To address Cobasi's needs, the product must improve error messages to make them more understandable for the operations team and enhance customer communication through email and My Account to address payment issues.

**Cobasi's Numbers:**

- Total GMV (2023): 226,932,961.52 USD
- Total Orders (2023): 6,549,853
- Subscriptions GMV (2023): 36,550,047.83 USD (16% of product total GMV)
- Subscriptions Orders (2023): 919,421
- Cycle creation error (Jan/2024): 32.6%
  - Payment Error: 23.1%
  - Order Error: 9.5%

### Whirlpool and Fast Shop Case Study

In Q2/2024, Whirlpool and Fast Shop presented Business Cases outlining gaps in the subscription modules that would prevent them from using our native product. One significant update is that Whirlpool expressed willingness to sponsor the product's development, offering to pay an additional fixed value or take rate (TBD). This investment could fund the product's evolution. The gaps they mentioned include:

1. Scheduled delivery (which could also attract grocery customers)
2. Installment payments (Whirlpool and Fast Shop)
3. Improved error messages to provide more autonomy to the operations team
4. Visibility on upcoming subscription orders for demand reports - alerts or inventory reservations would be a plus

**WHP and FS Numbers:**

- Whirlpool expected subscriptions GMV: TBD
- Fast Shop Expected subscriptions GMV: 25M BRL annually

### Analysts and Prospects Analysis

#### Gartner - Critical Capabilities for Digital Commerce 2023

The report includes a "Business Model Scalability" critical capability. This measures a platform's ability to scale and support emerging digital commerce business models such as digital marketplace, subscriptions, and B2B2X. Vendors are given scores from 1 to 5 on this capability, with definitions like:

- **5** = The platform natively supports end customers creating subscription orders. It can configure substitutions and pause/cancel subscriptions through the UI
- **3** = The platform enables some subscription order creation and management capabilities
- **1** = The platform requires integration with external solutions to enable subscriptions

Vendor highlights:

- **Adobe Commerce** lacks native subscription and usage-based billing capabilities. Scored low on business model scalability.
- **HCL Commerce Cloud** bundles in a subscription application at no extra cost. Scored high on business model scalability.
- **Infosys Equinox** supports the subscription business model but scored low on business model scalability.
- **Kibo** offers a packaged subscription commerce solution. Scored highly on business model scalability.
- **VTEX** scored highly on business model scalability. However, there was no mention of the subscription product in the profile.

#### Forrester - The Forrester Wave: Order Management Systems 2023

The report includes a "Subscription Management" criteria inside the "Current Offering" evaluation (Y-Axis on the graph). This measures the platform's ability to create and manage subscription orders of consumer goods with ease, including autonomous subscription management, support for ongoing continuity orders, and mitigate unintended churn. Vendors are given scores from 1 to 5 on this criteria, with definitions like:

- **5** = Superior relative to others in this evaluation. The vendor natively supports end customers creating subscription orders and enables non-technical practitioners to configure substitutions in the UI and to pause, cancel, and adjust subscriptions on behalf of customers in the UI.
- **3** = On par relative to others in this evaluation. The vendor enables customer service representatives to create and manage subscription orders in the UI.
- **1** = Below par relative to others in this evaluation. The vendor requires integration with external solutions to generate subscription orders and does not support the configuration of substitutions in the UI.

Vendor highlights:

- **Manhattan** is weaker in subscriptions management. Scored 1 in the subscription criteria.
- **Kibo's OMS** is strong in subscriptions management, which highlights the benefit of its unified commerce functionality. It was the only platform to score 5 in the subscription criteria.
- **VTEX** was not evaluated in the report, but the score could be 3 or 5 considering the definitions above.

#### RFPs - Loop.io Projects

Loop.io serves as our platform for handling RFI/RFPs from prospective clients outlining their requirements for ecommerce vendors. The RFP process is instrumental in comprehending potential customers' needs and business models.

Within the platform, 24 RFPs have cited subscriptions and recurrent orders as requirements. Out of these opportunities, VTEX successfully secured 6 deals and is actively engaged in 2 ongoing negotiations. Unfortunately, Salesforce's limited insights into lost deals prevent us from precisely identifying whether the absence of subscription features influenced our prospects' decisions.

We hypothesize that the lost deals won't be motivated by a lack of features. As discussed in the Product Gaps section, it becomes apparent that the Subscription is marketed as a comprehensive subscription solution, even though its functionality leans more towards serving as a recurrent order engine. This semantic difference can convert leads that face implementation challenges and customer frustration, as evidenced by clients such as Cruzeiro do Sul and in Brazil.

---

**References:**
- https://recurly.com/research/benchmarks-for-subscription-ecommerce/
- https://recurly.com/press/recurly-releases-its-2024-state-of-subscriptions-report/
- https://go.recurly.com/2024-state-of-subscriptions-pdf
