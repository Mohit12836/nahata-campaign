# EPFO UAN Allotment via UMANG

- **Service ID:** `IN-NAT-EPFO-001`
- **Research status:** NEEDS_REVIEW (partial evidence-backed discovery; NOT a production portal recipe)
- **Customer segments:** EMPLOYEE
- **Official evidence:** [SRC-013](https://unifiedportal-mem.epfindia.gov.in/memberinterface/)
- **Checked:** 2026-10-26

## Confirmed observations from official source
- EPFO official member portal says direct UAN allotment through that portal has been discontinued.
- EPFO directs new UAN allotment to the official UMANG app using Aadhaar-based face authentication.
- EPFO member portal retains different functions such as Know Your UAN and pension tracking.

## Document checklist — current research state
- Exact eligibility and identity steps follow UMANG / EPFO current instructions; face verification requires the actual authorized individual.

## Operator process (safe high-level draft)
1. Determine whether applicant needs new UAN allotment, activation or merely knows/recovers existing UAN.
2. If new allotment, direct to official UMANG UAN allotment/activation service.
3. Applicant completes Aadhaar face authentication himself/herself.
4. Confirm generated UAN securely.

## Scenarios & failure cases to cover
- Do NOT automate the discontinued portal allotment link.
- Face authentication is a manual authorization checkpoint.
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
