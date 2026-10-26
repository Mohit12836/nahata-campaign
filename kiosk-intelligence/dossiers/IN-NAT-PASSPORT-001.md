# Passport Fresh Application

- **Service ID:** `IN-NAT-PASSPORT-001`
- **Research status:** NEEDS_REVIEW (partial evidence-backed discovery; NOT a production portal recipe)
- **Customer segments:** CITIZEN;TRAVELLER
- **Official evidence:** [SRC-009](https://www.passportindia.gov.in/psp/Apply)
- **Checked:** 2026-10-26

## Confirmed observations from official source
- Passport Seva outlines online application, payment/appointment scheduling and visit to PSK/POPSK/RPO.
- Original supporting documents need to be presented at appointment, according to Passport Seva process.
- Applicable documents depend on applicant category, age, employment and case type; use official document advisor.

## Document checklist — current research state
- Passport Seva official fresh passport Document Advisory must be checked for each applicant (age/Non-ECR/address).
- A fixed universal list has NOT been verified.

## Operator process (safe high-level draft)
1. Check whether this is genuinely first-time/fresh rather than re-issue.
2. Use official Passport Seva account and select correct applicant category.
3. Enter and review application.
4. Applicant authorizes fee payment and appointment booking.
5. Confirm appointment details, visit with required originals; track later status.

## Scenarios & failure cases to cover
- Tatkaal and Normal rules are different.
- Do not claim passport will be issued on form submission.
- No automatic bypass of appointment or official verification.
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
