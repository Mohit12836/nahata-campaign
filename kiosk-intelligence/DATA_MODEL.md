# Data Model & Storage Contract

## Principle: one canonical record, many linked views

A *service* (e.g. an examination/application category) has one permanent `service_id`. A specific year's application window is a *cycle* and receives its own `cycle_id`; each cycle may contain several stages (apply, correction, admit card, result). A portal can host multiple services and a service can involve multiple portals.

**IDs:** `service_id` (e.g. `IN-MP-EXAM-0001`), `recipe_id`, `recipe_version`, `cycle_id` (e.g. `IN-MP-EXAM-0001-2026-R1`), `stage_id`, `source_id`, `audience_id`, `area_id`, `case_id`. These are illustrative ID patterns, not actual verified services.

## Proposed normalized entities

- `service_master`: id, name_hi, name_en, aliases, authority, scope, sector_id, status, official_home_url, owner, created_at, last_verified_at.
- `service_versions`: service_id, version, eligibility_rules_json, prerequisites_json, notes, verification_status, reviewer, published_at; immutable approved versions.
- `service_audiences`: service_id, audience_id, applicability_rule, evidence_source_id. One service belongs to many sectors/customer groups.
- `service_areas`: service_id, area_id, legal_applicability, source_id. No invented locality.
- `service_document_rules`: service_id, version, document_code, required_if, alternatives, accepted_format, size_rule, validity, evidence_source_id.
- `portals`: portal_id, verified official domain, department, access policy.
- `portal_recipes`: recipe_id, service_id, version, portal_id, status, review_date, applicability_condition.
- `portal_steps`: recipe_id, recipe_version, step_id, position, action_type, field_rules_json, checkpoint, confirmation_needed, recovery_strategy.
- `portal_links`: portal_id, step_id, official_url, purpose, valid_from, last_checked_at, source_id, link_status. Never persist expired session URLs as canonical links.
- `form_cycles`: cycle_id, service_id, official_notice_id, year, intake_name, jurisdiction, status, source_id.
- `cycle_events`: event_id, cycle_id, stage_type, start_at, end_at, time_zone, fee_due_at, correction_end_at, verified_at, source_id, is_extension, supersedes_event_id.
- `source_registry`: source_id, canonical_url, publisher, source_type, published_at, fetched_at, content_hash, snapshot_pointer, authoritative_for, trust_tier.
- `service_facts`: fact_id, subject_id, property_name, value_json, source_id, effective_from, effective_until, captured_at, confidence, verification_status; supports changing and disputed facts.
- `business_metrics`: service_id, area_id, period, evidence_type, observed_demand, fee_official, assistance_fee_permitted, direct_cost, labor_minutes, net_profit_estimate, confidence. **Never mix official fee with our income.**
- `case_records`, `citizen_profiles`, `case_documents`, `consent_records`, `audit_logs`: **private operational database**, never in public repo.
- `change_requests`: object_ref, proposed_diff, evidence_source_ids, risk, reviewer, decision, reviewed_at.

## Four-layer separation

1. **GitHub**: schemas, public templates, approved public service metadata, documented recipes and implementation code. Git tracks human-reviewed changes.
2. **Private structured database**: live service facts, dates, monitoring job state, per-case progress, authorization records and event history; access with roles and backups.
3. **Private encrypted object storage**: citizen documents and any licensed source material requiring restricted access; store only pointers in DB.
4. **Search index**: full text for exact names/IDs and optional embeddings over **public service documents**; never expose sensitive citizen data by default.

Google Sheets can be a controlled intake/export interface, not a substitute for secure identity storage or an authenticated transactional queue at scale.

## Retrieval contract

Resolve query → `service_id` → join by `cycle_id`/stage/area/audience → select currently approved version → attach `source_id`, verification date and exact official link → return clear uncertainty labels.

Priority when facts conflict: **current official notice > official portal update > archived official publication > recognized authorized provider > secondary blog/video**. Keep both conflicting claims and their dates until a human resolves them; do not silently overwrite.

## Data quality

Unique IDs, foreign keys, no duplicate canonical services, non-null evidence for VERIFIED status, ISO 8601 dates with India time zone context, source fingerprints, last-verified timestamps, status enums `CANDIDATE | DRAFT | NEEDS_REVIEW | VERIFIED | RETIRED`. Unknown values must be null, never fabricated defaults.

## Backups

Database daily encrypted backups with periodically tested restore; maintain immutable audit log for published versions and source checksums. Git alone is not a backup for personal data or an operational queue.
