# Founding-customer pilot: draft terms for founder review

Status: drafted 2026-09-21, published on `/pricing#pilot` and `/start` on the
`site/trial-and-pilot` branch, **not yet approved for the live site**. Every number below is
sourced from `assets/offers.json` and checked by `scripts/check_offers.py`.

## The offer as written

| Term | Value |
|---|---|
| Price | $750, one time |
| Length | 30 days |
| Scope | one product family |
| Manuals | up to 3, subject to scope review before acceptance |
| Users | up to 3 participating users |
| Evaluation | 30 agreed historical support questions from the customer's desk |
| Included | guided onboarding; one end-of-pilot review |
| Credit | the $750 is credited toward the Knowledge Map setup fee if the customer proceeds |
| Continuation | no automatic subscription, no automatic charge |
| Invoicing | after scope and timing are confirmed in writing |

What the pilot measures: answer usefulness, source correctness, lookup time, repeated use.
What it does not promise: a savings percentage, or guaranteed correctness.

## Operational fit with the product

- **Plan limits.** `app/plans.py` in the web app has three plans: starter (10 people, 1
  product line, 250 docs, 2 ingests a year), standard, scale. A pilot of 3 users, 1 product
  family, and 3 manuals fits inside `starter` without a new plan. The instance config would
  set `client.plan: starter`. The "2 manual ingests a year" cap is the one to watch: 3
  manuals is 3 ingests, so either the pilot instance is provisioned as `standard` for the
  30 days, or the cap is raised by hand. Decide before the first pilot.
- **Provisioning.** Each pilot is a private Render instance, per the vault runbook
  "New Client Instance and First Admin". That is real work per pilot and the $750 should be
  sanity-checked against it.
- **Manuals ingested by a person.** The site says a person checks every doc before the
  customer sees it. That matches the app's current posture (unattended ingestion is listed as
  not built).
- **The 30 questions.** There is no scoring tool in the product. The end-of-pilot review is a
  spreadsheet the founder fills in with the customer. `evals/` in the template repo has the
  eval format if a lighter-weight scoring sheet is wanted.
- **No billing infrastructure exists**, which is consistent with "no automatic charge": the
  invoice is a person sending one.

## Open questions for the founder

1. **Refund wording. Resolved 2026-09-21.** The old sentence ("If the map concludes
   Answerlore won't help you...") left open who concludes and what happens when the customer
   disagrees. `/pricing` now says the map ends with a written recommendation from Answerlore:
   recommend against, fee refunded and map kept; recommend for and the customer declines, map
   kept and fee not refunded. No new refund right was created; the existing one now has a
   named trigger. The pilot's commitment is different (a credit, not a refund) and the copy
   keeps them separate.
2. **Does the pilot replace the Knowledge Map for a founding customer, or precede it?** The
   copy says "precede": credit toward the map. If the intent is "replace", the credit line
   and the map section need to say so.
3. **Is $750 the right price against a per-pilot Render instance plus the hand-checking
   time?** The number came from the brief; it was not modeled here.
4. **How many pilots at once?** The copy deliberately does not print a limited-places number.
   If there is a real cap, it can be stated as a fact, but not as a scarcity device.
