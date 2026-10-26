# PM-Kisan New Farmer Registration

- **Service ID:** `IN-NAT-PMKISAN-001`
- **Research status:** NEEDS_REVIEW (partial evidence-backed discovery; NOT a production portal recipe)
- **Customer segments:** FARMER
- **Official evidence:** [SRC-006](https://pmkisan.gov.in/)
- **Checked:** 2026-10-26

## Confirmed observations from official source
- Official Farmers Corner lists New Farmer Registration, registration edit/status, mobile updates and beneficiaries.
- The official registration screen requests Aadhaar number, mobile number and state, followed by CAPTCHA/UIDAI authentication.
- PM-Kisan portal states eKYC is mandatory for registered beneficiaries.

## Document checklist — current research state
- Aadhaar number, mobile, state are shown on entry screen; complete land/ownership and exclusion documents need current scheme verification.

## Operator process (safe high-level draft)
1. Confirm farmer's eligibility and possible exclusion conditions before intake.
2. Go through official PM-Kisan Farmers Corner New Farmer Registration.
3. Applicant consents to UIDAI authentication; enter fields and CAPTCHA manually.
4. Collect additional information only as required by live government process.
5. Verify registration acknowledgement and monitor status/eKYC separately.

## Scenarios & failure cases to cover
- A new registration is not automatic benefit approval.
- Registered farmer eKYC and new registration are distinct service actions.
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
