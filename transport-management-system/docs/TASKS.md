# TASKS & MILESTONE ROADMAP: NextGen TMS

## Milestone 0: Workspace & Documentation Foundation
- [x] Create isolated workspace folder `transport-management-system/`
- [x] Author living documentation system in `docs/` (`PROJECT_BRIEF.md`, `REQUIREMENTS.md`, `REFERENCE_AUDIT.md`, `SCREEN_INVENTORY.md`, `WORKFLOW_CATALOG.md`, `GITHUB_RESEARCH.md`, `LICENSE_COMPLIANCE.md`, `SYSTEM_ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, `API_SPECIFICATION.md`, `UI_UX_SPECIFICATION.md`, `SECURITY_PLAN.md`, `TEST_STRATEGY.md`, `DEPLOYMENT_GUIDE.md`, `BACKUP_RECOVERY.md`, `ARCHITECTURE_DECISIONS.md`)
- [x] Establish `AGENTS.md` rules for TMS development

## Milestone 1: Discovery & Architecture Review
- [x] Audit reference demo `https://tms.zdctech.in/` across all 6 roles
- [x] Evaluate open source alternatives (Fleetbase, Frappe, Traccar)
- [x] Author database schema and REST API contracts
- [x] Deliver comprehensive Phase 1 discovery and audit report

## Milestone 2: Foundation & Functional LR Prototype
- [x] Set up isolated Next.js application foundation in `transport-management-system/` with clear separation of Demo Mode vs Production Mode (`isDemoMode: true`)
- [x] Implement multi-role simulation hub with distinct perspectives for Super Admin, Owner, Manager, Accountant, Driver, and Vendor (strictly labeled as client-side simulation without exposing privileged secrets)
- [x] Build functional Consignment Booking & LR / Bilty Generator with pure validation engine (`validateLRConsignment`) and live freight & tax calculations
- [x] Build authentic Three-Copy Printable LR Document (`ThreeCopyLRPrint`) from a single shared source record with CRC checksum verification, print-optimized CSS, and demo watermark
- [x] Author reviewed PostgreSQL database migration `migrations/001_initial_schema.sql` matching normalized multi-tenant schema
- [x] Implement automated test suite (`tests/lr-validation.test.mjs`, `tests/three-copy-consistency.test.mjs`) with 100% passing tests (9/9 pass)
- [x] Run type-check (`tsc --noEmit`) with 0 errors

## Milestone 3: Core Operations & Dashboards
- [ ] Build Role-Specific Operational Dashboards (Owner P&L, Manager Dispatch, Accountant Billing)
- [ ] Implement Vehicle Roster, Driver KYC & Compliance Expiry tracker
- [ ] Implement Trip Dispatch Board with milestone state transitions

## Milestone 4: Financial Engine & Driver App
- [ ] Implement Driver Advance & Settlement reconciliation calculator
- [ ] Implement Customer GST Invoice generator with PDF export
- [ ] Implement Mobile-First Driver Portal with camera POD upload & diesel slip submission
- [ ] Implement Vendor & Broker freight settlement with TDS ledger

## Milestone 5: Testing, Security & Deployment
- [ ] Automated financial calculation test suite (GST, Driver settlements, TDS)
- [ ] Multi-tenant isolation verification and security audit
- [ ] Production build verification and deployment configuration
