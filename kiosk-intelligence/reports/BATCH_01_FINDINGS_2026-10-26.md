# Research Batch 01 — 26 October 2026

## Actual deliveries
- **87** official-source-linked service discovery records, across **19** sectors (see catalog/services.csv).
- **30** official and official government-aggregator source links, captured in catalog/sources.csv. They are research links and need per-service authoritative verification; some page links require login or are reference/staging only.
- **17** stage-date records for MPESB and NSP, not 17 distinct programmes; some services have more than one stage row.
- **14** service dossiers with sourced observations, safe preliminary operator steps, missing requirements and risks.
- **Zero** fee/profit forecasts published as established local facts, because Jaora/Ratlam observed sales/cost evidence has not been collected.
- All 87 service rows intentionally have `NEEDS_REVIEW` until eligibility, required documents, legal assistance/automation scope, final URLs, current fees and SOP are reviewed. Service existence is sourced, production automation is **not** verified.

## Officially published windows needing attention (date-only; do not assume a midnight cutoff)

| Service ID | Stage | Opens | Ends | Evidence |
| --- | --- | --- | --- | --- |
| IN-MP-ESB-001 | Group-3 reopened application | 2026-10-13 | **2026-10-27** | SRC-001 |
| IN-MP-ESB-001 | correction window | 2026-10-13 *review exact correction start* | **2026-10-28** | SRC-001 |
| IN-NAT-NSP-008 | PM-USP CSSS **renewal only** | 2026-06-01 | **2026-10-31** | SRC-003 |
| IN-NAT-NSP-006 | PM YASASVI Top Class School | 2026-10-22 | **2026-11-30** | SRC-003 |
| Most other selected NSP rows | scheme-specific applications | See `form-cycles.csv` | **2026-10-31** | SRC-003 |

**Important:** the MPESB correction start date shown is a placeholder inferred from reopening, not an independently published correction start. Correct this data before marking fully VERIFIED. All NSP dates are scheme-/stage-specific and need continued checking for extensions.

## Grounded process findings

1. MPESB has separate rulebooks, re-open notices and correction dates; never treat a cycle as a permanent fixed application process (SRC-001, SRC-002).
2. NSP requires student OTR; renewal, fresh, institutional and officer verification deadlines are distinct (SRC-003, SRC-004).
3. eShram government registration is **free**; card renewal isn't required (SRC-007).
4. Udyam registration is officially **free** and the portal states that private agencies are not authorized to do the official registration (SRC-012).
5. FSSAI FoSCoS fee schedule shows **₹100 for 1 year of registration**; this is neither a general licence fee nor kiosk profit (SRC-011).
6. Passport application includes online fee/booking and in-person verification with originals (SRC-009).
7. PM-Kisan has farmer registration/eKYC/status functions; approval is not automatic from completing the form (SRC-006).
8. EPFO directs new UAN allotment and activation through UMANG face-auth rather than discontinued old direct-member-portal process (SRC-013).
9. MP Pharmacy Council fresh pharmacist profile depends on Samagra, Sthaniya Niwasi and DigiLocker, and imports identity data rather than editing them freely (SRC-022).
10. MP retail/wholesale drug sale licence is a different government service from pharmacist registration (SRC-023).
11. MP fertilizer/seed/pesticide sale licence applications are listed by government service portals; eligibility, local licences and rates require service-specific documents (SRC-025 to SRC-030).

## Business/prioritization (hypotheses, NOT local sales measurements)

- **Deadline urgency:** MPESB Group-3 and selected NSP schemes warrant near-term accurate document-preparation notices, only after verification.
- **Repeat footfall candidate:** PAN reprint, voter corrections, PM-Kisan status and general citizen updates. Volume in Jaora/Ratlam not measured.
- **Complexity-based specialist opportunity:** FSSAI, GST, pharmacist professional registration, drug retail/wholesale sales, agricultural input licences. Per-case allowed assistance fees and real net margins unverified.
- **Recurring professional compliance hypothesis:** GST return filing and licence renewals; verify local professional authorization, fee scope, and margins before promotions.
- **Potential misinformation risk:** treating free eShram/Udyam registrations as paid governmental registration, misreporting dates, claiming any licensed business will obtain approval.

## Open gaps before next batch

1. Official documents / condition-specific checklist and current rates for at least 10 flagship services.
2. Active portal stage-links and specific permitted operator actions; no simulated login/CAPTCHA/OTP bypass.
3. Separately sourced `cycle_events` for correction opens, future extensions and verification stages.
4. Local competitor/business survey and actual costs/handling time to support high-margin sorting.
5. Structured dossier YAML/DB import and change review workflow.
6. Scheduled source monitoring implementation and alerts; research snapshots are NOT live monitoring.
7. P0 security: previously exposed Supabase privileged key still requires rotation and history remediation before production merge.

## Next researched sectors

MP eDistrict certificates; university/pharmacy/nursing admission; MP council licences; CSC roles; land records; labour and pensions; agriculture schemes; business registrations and municipal services. All new evidence must be added with provenance, date and distinct service_id.
