# PM YASASVI Top Class School Scholarship — 2026-27

- **Service ID:** `IN-NAT-NSP-006`
- **Research status:** NEEDS_REVIEW (partial evidence-backed discovery; NOT a production portal recipe)
- **Customer segments:** STUDENT
- **Official evidence:** [SRC-003](https://scholarships.gov.in/All-Scholarships)
- **Checked:** 2026-10-26
- **Related form cycle:** `IN-NAT-NSP-006-2026-R1`

## Confirmed observations from official source
- NSP scheme listing shows scheme opened 22 October 2026; student application closing 30 November 2026.
- Defective-application/institute verification until 15 December 2026; DNO/SNO/MNO verification until 31 December 2026.
- NSP OTR is mandatory for students, as explained on the Students page (SRC-004).

## Document checklist — current research state
- Income/category/institution requirements: official scheme-specific specification PDF review pending.
- Applicable class and school eligibility: scheme rules review pending.

## Operator process (safe high-level draft)
1. Confirm student's eligibility and current scheme specification on official NSP.
2. If eligible, ensure the student has OTR.
3. Open NSP student login and select this exact School scheme, not College scheme.
4. Review documentary evidence; submit with student approval.
5. Track institute and later departmental verification separately.

## Scenarios & failure cases to cover
- School and College PM YASASVI are different schemes.
- Student deadline is not the same as institute verification deadline.
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
