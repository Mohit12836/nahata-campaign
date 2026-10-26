# FSSAI New Food Business Registration

- **Service ID:** `IN-NAT-FSSAI-001`
- **Research status:** NEEDS_REVIEW (partial evidence-backed discovery; NOT a production portal recipe)
- **Customer segments:** BUSINESS;FOOD
- **Official evidence:** [SRC-011](https://foscos.fssai.gov.in/fee/Reg)
- **Checked:** 2026-10-26

## Confirmed observations from official source
- FoSCoS fee schedule displays ₹100 for one year of registration (new registration and renewal rows).
- FoSCoS distinguishes Registration, State License and Central License; selection depends on the food business and eligibility.
- FoSCoS provides separate pages for new registration documents and licensing documents.

## Document checklist — current research state
- For a specific food-business KOB/category, retrieve latest 'NEW REGISTRATION' document rules; do not reuse licence requirements.

## Operator process (safe high-level draft)
1. Identify kind of food business, locations, turnover/category and responsible operator.
2. Check correct eligibility for FSSAI Registration vs State/Central License.
3. Open approved FoSCoS route, upload verified required documents.
4. Review fee and applicant declarations; pay only with authorization.
5. Save reference number and subsequently verify registration issuance.

## Scenarios & failure cases to cover
- ₹100 is registration fee per one-year schedule, not a universal fee for every FSSAI license.
- State and Central licence fees differ and must be separately looked up.
- FSSAI official fee is not kiosk's net margin.
- Portal session timeout: save current applicant information locally/privately but reauthenticate where official portal requires; saved URL cannot restore an expired server session.
- If applicant details are missing or conflicting: HOLD for review; never guess.

## Still required before a VERIFIED AutoForm recipe
- Confirm per-field sequence from authorized, real current portal or official manual.
- Official eligibility and all conditional required document specifications.
- Correct stage-specific official action URLs (not guessed browser paths).
- Portal access/automation permissions and operator authorization.
- Portal-specific checkpoint, PDF/upload format, amount, confirmation and recovery evidence.
- Human review and end-to-end supervised test with test/synthetic data where permitted.

**Never publish this draft directly to live automation.**
