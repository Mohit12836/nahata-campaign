# Udyam MSME Self-Registration

- **Service ID:** `IN-NAT-UDYAM-001`
- **Research status:** NEEDS_REVIEW (partial evidence-backed discovery; NOT a production portal recipe)
- **Customer segments:** BUSINESS
- **Official evidence:** [SRC-012](https://www.udyamregistration.gov.in/Important.aspx)
- **Checked:** 2026-10-26

## Confirmed observations from official source
- Official Udyam portal says government MSME registration is totally free and paperless.
- Self-declaration; no documents or proof are to be uploaded for registration.
- Aadhaar is necessary; PAN/GSTIN apply as prescribed for enterprise type and relevant rules.
- The official notice states that no private agency/person is entitled or authorized to undertake MSME registration on behalf of the portal.

## Document checklist — current research state
- Aadhaar of authorized person; PAN/GSTIN as applicable. No upload of paper proof in standard registration.

## Operator process (safe high-level draft)
1. Direct the entrepreneur to the official Udyam portal and explain no government registration charge.
2. Provide informational guidance, without representing kiosk as government-authorized Udyam registration agent.
3. Entrepreneur follows self-registration and Aadhaar verification.
4. Entrepreneur reviews and confirms enterprise declarations.
5. Verify issued registration only through official verify/print options.

## Scenarios & failure cases to cover
- Avoid presenting this as paid third-party government registration service.
- Do not invent fees or request sensitive OTP for storage.
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
