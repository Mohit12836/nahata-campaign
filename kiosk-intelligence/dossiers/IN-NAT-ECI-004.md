# ECI Form 8 — Shifting / Correction / Replacement

- **Service ID:** `IN-NAT-ECI-004`
- **Research status:** NEEDS_REVIEW (partial evidence-backed discovery; NOT a production portal recipe)
- **Customer segments:** CITIZEN
- **Official evidence:** [SRC-008](https://voters.eci.gov.in/home/forms)
- **Checked:** 2026-10-26

## Confirmed observations from official source
- ECI official forms list Form 8 for shifting of residence, correction, replacement of EPIC and marking PwD.
- The form requires selecting the correct type of request; this is distinct from new-voter Form 6.

## Document checklist — current research state
- Proofs required depend on correction/shifting/replacement type; latest ECI Form 8 instructions need detailed verification.

## Operator process (safe high-level draft)
1. Ask whether citizen needs address change, correction, replacement or PwD marking.
2. Route to ECI Form 8 in official voter service portal.
3. Review relevant supporting documents for selected request.
4. Applicant completes necessary identification and declaration.
5. Save official tracking reference; follow verification/result.

## Scenarios & failure cases to cover
- Do not confuse Form 7 deletion with Form 8 correction.
- Do not mark approved until ECI updates electoral roll.
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
