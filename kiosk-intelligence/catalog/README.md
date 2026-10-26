# Public catalog staging area

On research branch `research/services-batch-01-20261026`, these catalogs now contain **87 official-source-linked service discovery records, 30 source links and 17 dated form-stage records** as of 2026-10-26. **All 87 service records are NEEDS_REVIEW**, so an indexed service name is NOT a verified operational workflow. The original docs-only branch intentionally retains empty CSV templates.

- `services.csv` — unique permanent service IDs; never duplicate a service because it targets multiple customer groups.
- `form-cycles.csv` — time-bounded stages (apply, correction, result) and their currently verified windows. Historical cycles should remain separately addressable.
- `sources.csv` — evidence URLs and dates. Every VERIFIED fact must point to a real source record.

These CSVs are **public research snapshots**, not production databases. The future authoritative database must enforce foreign keys, safe concurrency, version history and access permissions.

## Publication rule

Candidate → DRAFT → source checked → reviewer-approved VERIFIED → exported snapshot. No secret, API key, customer PII, OTP, scan, private URL or private business ledger in these files. If important facts change, create a new dated, sourced record/event and supersede, not erase history.

## Research batch protocol

Work in small batches (e.g. 25–50 verified service names or 5–10 fully verified dossiers), verify sources and references, run duplicate and schema checks, then submit an auditable pull request.

Do not add placeholder/fake service rows just to hit a count.
