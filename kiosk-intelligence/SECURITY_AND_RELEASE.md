# Security, Ownership & Release Boundaries

## GitHub: allowed

Code, parser tests with **synthetic** applicant data, schema/migrations, schema examples, public agency notices/URLs, researched public metadata with official citations, reviewed SOPs, docs and release notes. No unnecessary copies of copyrighted manuals/PDFs; prefer lawful source links and permitted snapshots.

## GitHub: prohibited

Real names with Aadhaar/phone, raw WhatsApp conversations, citizen IDs/marksheets, scans, licences, financial/account details, medical information, real user profiles, OTPs, cookies/sessions, passwords, API keys, service-role tokens, webhook signing secrets, full live customer Sheets, or private company pricing contracts.

A GitHub private repository is **not** a compliant substitute for a controlled encrypted citizen database.

## Prior incident

The pilot feature history contained an exposed Supabase privileged key in `scripts/check_supabase.py`; file was deleted from the pilot branch HEAD, but **old commits may still expose it**. Treat the credential as compromised: **rotate/revoke, inspect access logs and affected data, remediate all branches/history, check forks/clones, enforce secret scanning, and validate** before any production merge. This docs branch is based on `main` rather than contaminated pilot feature history; it does not repair older refs by itself.

## Branch & review policy

- `main`: deployed app, do not push unreviewed research or risky experimental code.
- `docs/kiosk-service-intelligence-v1`: docs/templates only. Merge via reviewed PR.
- `feature/kiosk-rag-pilot-v2`: experimental extension code. No direct production merge until security, data handling and live form test gates pass.
- Future research branches: `research/services-YYYYMMDD`.
- Future adapter branches: `feature/portal-{id}-{scope}`.
- A change request must state **what changed / why / source / tests / reviewer / rollback**.

## Change ownership

Researcher proposes public evidence → verifier approves → data manager publishes `service_version` or `cycle_event` → recipe reviewer promotes `recipe_version` → employee sees approved release. AI must not push speculative facts automatically.

## Completion definition

The extension may suggest/fill values, but it cannot claim successful submission unless a human has verified an official portal-generated acknowledgement. Payments, declarations, OTP and sensitive identity actions require informed user/operator involvement and authorized portal workflows.

## Never do

- Do not silently choose fictional defaults for date of birth, district, service type, category, marks, income or licences.
- Do not mark a form as completed using generated reference IDs.
- Do not auto-merge or auto-publish unverified links/rules.
- Do not persist session/OTP to GitHub or marketing databases.
