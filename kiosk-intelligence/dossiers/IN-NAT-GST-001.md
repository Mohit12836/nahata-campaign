# GST Amendment of Registration — Non-Core Fields

- **Service ID:** `IN-NAT-GST-001`
- **Research status:** NEEDS_REVIEW (partial evidence-backed discovery; NOT a production portal recipe)
- **Customer segments:** BUSINESS
- **Official evidence:** [SRC-017](https://tutorial.gst.gov.in/userguide/registration/Non-Core_Fields.htm)
- **Checked:** 2026-10-26

## Confirmed observations from official source
- Official GST tutorial describes Services → Registration → Amendment of Registration Non-Core Fields.
- Non-core amendment generally auto-approved once successfully filed, while core details have a separate approval workflow.
- Submission involves legal verification and DSC/EVC as applicable, including OTP in EVC workflows.

## Document checklist — current research state
- Required evidence and specific field editability depend on taxpayer/field; inspect official tutorial for each case.

## Operator process (safe high-level draft)
1. Identify taxpayer and check whether requested field is truly Non-Core rather than Core.
2. Use authenticated GST portal, navigate the indicated registration amendment path.
3. Edit only the permitted data; review legal name and authorized signatory.
4. Taxpayer or duly authorized professional signs via DSC/EVC.
5. Verify acknowledgement ARN and update taxpayer record only after portal confirmation.

## Scenarios & failure cases to cover
- Tax compliance advice requires properly authorized professional review where applicable.
- Do not store GST passwords or EVC OTP; non-core and core are not interchangeable.
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
