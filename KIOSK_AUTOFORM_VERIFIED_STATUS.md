# Kiosk AutoForm — Requirements, Implementation & Release Audit
**Verified:** 2026-10-26  
**Repository:** `Mohit12836/nahata-campaign`  
**Working branch:** `feature/kiosk-autoform-pilot`  
**Status:** GitHub branch pushed; pilot code exists; **NOT production-certified**.

## 1. Operator's real-world requirements
1. **High-volume, multiple government forms:** Intake from rough text, WhatsApp or Excel/Google Sheets; target is up to ~1,000 applicants and many distinct portal processes.
2. **No link-hunting:** Employee selects a service/applicant and starts the correct official workflow with one click.
3. **Form-aware recipes:** Each supported form needs its verified entry URL, prerequisites, known steps, required documents, photo upload, OTP, CAPTCHA, biometric, fees, payment, and recovery paths.
4. **Data persistence:** Client intake and filled form values must survive local tab/navigation disruptions; server-side portal session expiry still requires authentication/replay where permitted.
5. **Hold & Next / Resume:** An applicant waiting for OTP/biometrics can be held while another proceeds; resume must safely restore the *client data and progress*, not claim to restore an expired portal session.
6. **WhatsApp status alerts:** Generate an applicant-specific notification without sending OTP values or private details unnecessarily; actual automatic delivery requires authorized WhatsApp API integration.
7. **External data source:** Sheets/Excel should be the record of applicants; extension is mainly a controlled execution interface, not a separate customer database.
8. **Privacy and approvals:** Never silently submit, pay, solve CAPTCHA, bypass identity verification, or certify success without a portal-issued acknowledgement.

## 2. Verified source files and implemented scope
| Function | Source file(s) | Code-level finding |
| --- | --- | --- |
| Chrome MV3 extension & dual UI | `autoform-extension/manifest.json`, `popup.*`, `sidepanel.*` | Popup and persistent side panel exist. Context-menu permission corrected on this branch. |
| Rough text parsing and sequential field match/fill | `smart-parser.js`, `content.js` | Field scanning, sequential fill, checkpoint heuristics, and review flow are present. Official portals were not tested here. |
| Portal SOP definitions | `kiosk-recipes.js` | Five portal recipe groups and declared expected OTPs. Links and counts require per-workflow official verification. |
| Applicant queue, hold and resume | `kiosk-pilot-engine.js` | Queue, paused step number/URL, browser-local storage and resume navigation implemented. Exact server session restoration **is not implemented**. |
| CSV / Google Sheets bridge | `google-sheet-sync.js` | CSV parsing and configurable webhook POST present. A working authorized 2-way Google Sheet deployment is **not verified**. Without webhook, status update is local/mock only. |
| WhatsApp notification | `kiosk-pilot-engine.js` and UI | Creates a `wa.me` prefilled message and opens it. **Does not automatically send** a WhatsApp message. |
| OTP, biometric, CAPTCHA & completion detection | `content.js` | DOM/text heuristics; manual and portal-specific validation still required. |
| Automated test code | `scripts/run_15_scenarios_test.js`, `scripts/run_mponline_test_suite.js`, `scripts/test_kiosk_pilot_lifecycle.js` | Prior development transcript reports **15 + 34 + 34 = 83 passed**. Tests were **not rerun** during this audit; mock tests do not certify live portal compatibility. |

## 3. Accurate pilot workflow
```text
WhatsApp / intake / Sheet CSV
              ↓
      Applicant queue
              ↓
  Choose verified portal recipe
              ↓
  Open official portal + scan page
              ↓
  Preview & confirm field mapping
              ↓
  Fill known fields step-by-step
              ↓
OTP / CAPTCHA / biometric / payment?
     ├─ yes → manual checkpoint or Hold & Next
     │                   ↓
     │         restore saved client data,
     │         re-authenticate / replay as needed
     └─ no ────────────────────────┐
                                  ↓
                human-approved final submission
                                  ↓
                 verify official application ID
                                  ↓
               sync verified status to Sheet
```

## 4. Must-fix issues before real citizens' submissions

**P0 — Security and correctness**
- Rotate any leaked privileged credentials; remove them from accessible history and deployment configuration. Removing a file from branch HEAD does **not** revoke a credential or erase Git history.
- Minimize extension access scope; protect sensitive applicant/Aadhaar data, obtain consent, enforce retention/deletion and avoid publishing citizen data in public Sheets.
- Remove sample applicant autofill in normal operator mode, and remove fabricated fallback values for district, board, year or unspecified service.
- Require real official acknowledgement before marking `COMPLETED`; never generate a fake application number.

**P1 — Reliability**
- Restore active applicant after extension restart; await initialization and persist per-case progress without cross-applicant leakage.
- Use validated service selection; never silently default an unknown service to MPESB.
- Implement per-portal state machines and robust pause/retry/re-login/replay; saved URL alone is insufficient for an expired server session.
- Confirm each checkpoint, document/photo upload, final preview, user authorization and payment separately.
- Treat Google Sheet sync failures as failures; add authenticated integration, retries, concurrency control and idempotent updates.

**P2 — Portal integrations & validation**
- Reverify official URLs, OTP counts and permissible automation workflows with current portal behavior; do not hardcode counts as universally guaranteed.
- Run automated tests, Chrome install smoke test, staging rehearsals and approved portal-specific manual tests; maintain evidence for each supported government service.
- Use approved WhatsApp Business API for automatic delivery, with opt-in and provider authorization; `wa.me` alone is a manual-send interface.

## 5. Release decision
**Branch pushed ≠ production launch.**  
Treat this as a development pilot until P0 and P1 gates pass and each targeted portal has live acceptance evidence. Production use must be human supervised, privacy compliant and transparent about failures.
