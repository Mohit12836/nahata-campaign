# Ready-Made Component Qualification Register (2026-10-19)
All entries are CANDIDATE only. Adoption requires legal/technical verification and an implementation PR.

| Scope | Candidate | Repository | Decision and integration gate |
| --- | --- | --- | --- |
| Dashboard components | shadcn/ui | https://github.com/shadcn-ui/ui | MIT; good fit with React/Next and Tailwind. Integrate individual components after dependency compatibility test. |
| Existing offer UI | local Nahata components | src/components | Reuse visual Spin/Scratch/Coupon; first decouple merchant-specific copy and localStorage. |
| Workflows | Trigger.dev | https://github.com/triggerdotdev/trigger.dev | Candidate for durable background runs. Check hosted/self-hosted terms, limits, and current Next compatibility. |
| Visual workflow automations | Activepieces | https://github.com/activepieces/activepieces | Core MIT; enterprise features commercial. Do not install alongside another workflow engine until roles are distinct. |
| AI telemetry | Langfuse | https://github.com/langfuse/langfuse | Candidate; compare privacy, deployment cost and license before adoption. |
| Authorization | Existing PostgreSQL RLS + Supabase Auth | https://github.com/supabase/supabase | Prefer native claims/policies initially, test Auth/RLS and upgrade plan; OpenFGA only if permissions require graph ACL complexity. |
| Payment | Razorpay API adapter | https://razorpay.com/docs/ | Managed service, not a self-hosted repository; signed webhooks, ledger and compliance needed. |
| Messaging | WhatsApp Cloud API adapter | https://developers.facebook.com/docs/whatsapp | Separate subsystem with explicit opt-in and message delivery audits. |

## Avoid
- Blind merging of entire starter kits into existing Next app.
- Automatic DB switch to the active WACRM project's DB.
- Installing both visual orchestration and several durable queue engines for a trivial workload.
- Giving AI code-writing or publish permissions by default.
