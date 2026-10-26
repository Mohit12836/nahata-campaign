# Research, Verification & Live Monitoring SOP

## Per-service ingestion

1. **Identify** candidate service, ministry/authority and applicability (national/state/district).
2. **Disambiguate** names and stage (registration vs correction vs download). Check existing `service_id` before creating.
3. **Collect official evidence**: main notice, rulebook PDF, portal instruction, fee chart, dates, document requirement, contact/helpdesk. Prefer stable URLs and capture content hash/time.
4. **Record facts with provenance**: each consequential fact needs `source_id`, exact source section/page when possible, verification date, jurisdiction, and effective period.
5. **Separate cycle from service**: upcoming application is a `form_cycle`; stage dates are `cycle_events`. Do not overwrite historic windows.
6. **Draft a versioned SOP**: conditions, required-if documents, fields, stage links, checkpoints, operator scenarios, costs and completion proof.
7. **Quality gate**: reviewer verifies URLs, rules, prices, and whether portal automation is permitted. Unverified stays `DRAFT`/`NEEDS_REVIEW`.
8. **Publish** approved public metadata to the catalog/DB and only approved recipe versions to the extension.
9. **Monitor** for new official notices and changes, record diff and change request; *never silently auto-publish*.
10. **Retire** superseded recipes without deleting history; maintain safe fallback/manual path.

## Source hierarchy

T1 — authority's official website, gazette, signed/official notice and application portal.
T2 — official university, government-affiliated board or licensed/authorized provider for their remit.
T3 — reputable reporting/news only for discovery; may trigger research.
T4 — YouTube tutorials, blogs/community/operator anecdotes; useful for operator pain points, NEVER sole authority for deadline/eligibility/fee.

## Monitoring cadence proposal (not an active automation yet)

- Open forms and imminent deadlines: daily; urgent windows require extra checks where allowed.
- Examination, admission, scholarship notices during active periods: daily.
- Ordinary portals/services: weekly.
- Long-lived document rules: monthly and upon official trigger.
- Margin and local demand: monthly from timestamped, permissioned data.
- Stale source: flag for review; show last verified date and stop marketing incorrect deadlines.

## Fields mandatory before `VERIFIED`

`service_id`, canonical names, official owner, jurisdiction, source URL, source ID, last checked, applicable stage, date status or `NOT_ANNOUNCED`, document-rule status, human review record. A plausible link is not enough.

## Safety and ethics

Do not bypass CAPTCHA, OTP, biometric/identity flows or access controls. Do not make claims that fee, count of OTPs, success or resume recovery is guaranteed. Government "free" services must not be represented as paid government charges. Verify that private facilitation/assistance is lawful before displaying a charge. Personal data must not be embedded in evidence URLs or public version history.

## Example job output

```json
{
  "service_id": "DEMO-SERVICE-001",
  "cycle_id": "DEMO-SERVICE-001-2026-R1",
  "detected": "deadline_changed",
  "previous_value": null,
  "candidate_value": null,
  "source_id": "SRC-DEMO-001",
  "verification_status": "NEEDS_REVIEW",
  "approved_for_live_use": false
}
```

This is a **structure example**, not a live notification.
