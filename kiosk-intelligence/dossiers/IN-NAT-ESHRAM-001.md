# e-Shram New Worker Registration

- **Service ID:** `IN-NAT-ESHRAM-001`
- **Research status:** NEEDS_REVIEW (partial evidence-backed discovery; NOT a production portal recipe)
- **Customer segments:** LABOUR
- **Official evidence:** [SRC-007](https://eshram.gov.in/faqs)
- **Checked:** 2026-10-26

## Confirmed observations from official source
- Official FAQ: unorganised workers aged 16–59 may qualify, subject to exclusions and scheme rules.
- Required for registration: Aadhaar number and Aadhaar-linked mobile number.
- If no linked mobile, FAQ describes CSC/State Seva Kendra assisted biometric route.
- Registration is free; a worker must not pay registration charges to any registering entity.
- e-Shram card does not require renewal.

## Document checklist — current research state
- Aadhaar and Aadhaar-linked mobile; if unavailable, examine permitted biometric-assisted CSC route.

## Operator process (safe high-level draft)
1. Explain eligibility, consent and that government registration is free.
2. Check age and unorganised worker criteria from current official FAQ.
3. Use official eShram registration flow or authorized CSC flow.
4. Applicant completes OTP or authorized biometric verification.
5. Confirm UAN/card issuance and provide safely.

## Scenarios & failure cases to cover
- Do not list 'e-Shram renewal' as a real service.
- Do not charge for free registration; do not retain Aadhaar/OTP in public data.
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
