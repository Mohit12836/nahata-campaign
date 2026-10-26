# Kiosk Service Intelligence — START HERE

**Status: STRUCTURE ONLY (no verified 300–500-service dataset yet).** Research catalog, data model and retrieval rules for the AutoForm kiosk. Created 2026-10-26.

## Source-of-truth map

| Need / User question | Read / query | Primary key |
|---|---|---|
| Which services exist? | `catalog/services.csv` → future `service_master` database | `service_id` |
| Who is eligible and what documents are needed? | `service_version` and verified dossier stored in a database | `service_id + version` |
| Which official portal/link is used in each stage? | `portal_recipe` / `portal_link` | `recipe_id + step_id` |
| When does the form start/end? | `catalog/form-cycles.csv` → `form_cycles` | `cycle_id` |
| What evidence supports a claim? | `catalog/sources.csv` → `source_registry` | `source_id` |
| Which services fit students/farmers/pharmacies? | `service_audiences` relationships, not separate duplicated service tables | `service_id + audience_id` |
| Demand, fee, cost or net margin? | Time-stamped `business_metrics`, separate from official fees | `service_id + area_id + period` |
| Which citizen is in progress? | **Private** case management only, never this GitHub repository | `case_id` |
| Auto-fill implementation? | `autoform-extension/` on existing pilot feature branch | source code |

Read in order: [Data architecture](./DATA_MODEL.md) · [Research SOP](./RESEARCH_SOP.md) · [Search guide](./RETRIEVAL_GUIDE.md) · [Security/release rules](./SECURITY_AND_RELEASE.md).

## Repository boundaries

The existing repository `Mohit12836/nahata-campaign` currently has a Next.js app on `main`; AutoForm experimental code lives on `feature/kiosk-rag-pilot-v2`. This research-structure branch was created from **main**, separately, so that unfinished code and a previously detected leaked secret in older pilot history are not brought into this documentation branch. Do not merge experimental branches without a security review.

GitHub is for **code, approved public research facts, document links, schemas, templates, release records**. It is NOT a live citizen vault, CRM, source of OTPs or storage for scans/Aadhaar/phone/customer dossiers. The future private database (access controlled, backed up and encrypted) holds operational records. A private Sheet, if used, should preferably store minimal queue references, not full sensitive dossiers.

## Folder rules

```text
kiosk-intelligence/
  README.md                <-- This master navigation page
  DATA_MODEL.md            <-- IDs, entities, relationships, storage policy
  RESEARCH_SOP.md          <-- Evidence, official-source verification, freshness
  RETRIEVAL_GUIDE.md       <-- Search questions and how to answer them
  SECURITY_AND_RELEASE.md  <-- Privacy, review and version controls
  catalog/
    services.csv           <-- Public metadata only, header initially
    form-cycles.csv        <-- Time-bounded applications, header initially
    sources.csv            <-- Official sources and verification, header initially
  templates/
    service.template.yaml
    form-cycle.template.yaml
    portal-recipe.template.yaml
```

**Do not make a separate copy of a service under Student, Farmer, District and High-Margin folders.** Give the service one stable ID and join it to as many categories/audiences/areas as needed. Build filtered views for every perspective.

## Research flow

Discover → Verify official source → Save source ID → Draft version → Review → Publish approved version → Monitor → Record dated change → Re-review and republish. Unverified facts must not automatically reach live form recipes.

## Immediate next tasks

1. Security: revoke/rotate any exposed privileged credentials; clean historical exposure before production.
2. Agree core schema and confirm where encrypted private operational data will live.
3. Import **only verified** service metadata and official sources; no fictional 500 rows.
4. Prepare 30 detailed pilot dossiers and 1 supervised government form pilot.
5. Implement service search, audiences, events, source evidence, approval workflow, then automated monitoring.
