# CHANGELOG: NextGen Transport Management System

## [1.1.0-milestone2] - 2026-10-10
### Added
- Functional isolated application foundation inside `transport-management-system/`.
- `src/types/tms.ts`: Complete TypeScript models for Multi-Tenant Organizations, Branches, Vehicles, Drivers, Customers, Consignments, Trips, and Invoices.
- `src/lib/validators.ts`: Pure functional validation engine for LR Consignment data (GSTIN regex, 12-digit e-Way bill check, weight limits).
- `src/lib/lr-math.ts`: Strict mathematical calculation engine for freight, GST, and 3-copy LR document generation with CRC checksum and anti-tamper verification.
- `src/components/layout/DemoModeBanner.tsx`: Persistent banner explicitly separating simulation mode from production authentication.
- `src/components/layout/Navbar.tsx`: Modern top bar with active role badge and quick action triggers.
- `src/components/roles/RoleSwitcher.tsx`: 6-role interactive persona switcher for Super Admin, Owner, Manager, Accountant, Driver, and Vendor.
- `src/components/roles/`: Dedicated role views (`SuperAdminView.tsx`, `OwnerView.tsx`, `ManagerView.tsx`, `AccountantView.tsx`, `DriverView.tsx`, `VendorView.tsx`).
- `src/components/lr/LRBookingForm.tsx`: Interactive LR generator with live freight computation and error envelope.
- `src/components/lr/ThreeCopyLRPrint.tsx`: Original 3-copy printable LR view (Consignor, Consignee, Office/Driver) with print CSS (`@media print`) and demo watermark.
- `migrations/001_initial_schema.sql`: Full normalized PostgreSQL DDL migration script.
- `tests/lr-validation.test.mjs` and `tests/three-copy-consistency.test.mjs`: Automated unit test suite with 9 passing assertions.

## [1.0.0-discovery] - 2026-10-10
### Added
- Created dedicated workspace folder `transport-management-system/` to ensure 100% clean isolation from existing projects.
- Initialized comprehensive documentation hierarchy in `docs/`:
  - `PROJECT_BRIEF.md`: Vision, business problems, and persona mappings.
  - `REFERENCE_AUDIT.md`: Deep technical audit of `https://tms.zdctech.in/` (ZDC Tech Global Solutions Demo).
  - `SCREEN_INVENTORY.md`: 22 core screens mapped by route, module, and RBAC permissions.
  - `WORKFLOW_CATALOG.md`: Complete Mermaid lifecycle diagrams for Consignment/LR, Trip Dispatch, Driver Advance Settlement, and Compliance Expirations.
  - `GITHUB_RESEARCH.md`: Systematic evaluation of Fleetbase, Frappe Fleet Management, Kaporeal, and Traccar with decision matrix.
  - `LICENSE_COMPLIANCE.md`: IP protection and open-source license audit.
  - `SYSTEM_ARCHITECTURE.md`: Next.js 16 + PostgreSQL multi-tenant architecture with Row-Level Security.
  - `DATABASE_SCHEMA.md`: Complete production-ready PostgreSQL / Supabase SQL schema.
  - `API_SPECIFICATION.md`: REST API route catalog and request/response envelopes.
  - `UI_UX_SPECIFICATION.md`: Fluid clamp typography, motion physics, and interactive 6-role demo design.
  - `SECURITY_PLAN.md`: RBAC, tenant isolation, immutable financial ledgers, and upload protections.
  - `TEST_STRATEGY.md`: Test pyramid, financial math assertions, and security test cases.
  - `DEPLOYMENT_GUIDE.md`: Environment variables and production build instructions.
  - `BACKUP_RECOVERY.md`: PITR and disaster recovery specifications.
  - `ARCHITECTURE_DECISIONS.md`: ADR-001 through ADR-003.
  - `CURRENT_STATE.md`, `TASKS.md`, `HANDOVER.md`.
