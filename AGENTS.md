<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-execution-protocol -->
## Strict Local Execution & Efficiency Protocol

1. **Discovery Radar & Scoped Inspection:**
   - For multi-file, unfamiliar, or architecture-level tasks: Run `python C:\Users\hp\.gemini\antigravity\tools\code_map.py "src"` to locate relevant files and symbol line numbers without blind scanning.
   - For simple, obvious single-file tasks: `code_map.py` is NOT mandatory; jump straight to the target file.
   - Never dump entire files (> 50 lines) into context. Always supply tight `StartLine` and `EndLine` in `view_file` (window: 25–60 lines).

2. **Batched Read-Only Commands:**
   - Combine inspection and git commands into single invocations (e.g. `git status -s; git log -n 1 --oneline`).
   - Avoid unbounded recursive scans over `node_modules` or `.next`.

3. **Network & Background Command Discipline:**
   - Add explicit timeouts to network/server requests (e.g. `curl -m 10` or `Invoke-WebRequest -TimeoutSec 10`).
   - For commands taking up to 10s, pass `WaitMsBeforeAsync: 10000` to allow synchronous completion.
   - When a command goes to the background, do NOT poll `manage_task status`; wait for reactive system notifications.

4. **Tiered Verification (Task-Appropriate Testing):**
   - Choose verification suited to the task: targeted unit/component checks first, `npx tsc --noEmit` (~10s) for type/syntax integrity, and full `npm run build` only for significant integration or pre-deployment milestones. Never skip required tests.
   - Bound auto-fix retries to a maximum of 2 attempts before pausing to report the exact failure to the user.

5. **Mandatory 5-Line Task Summary:**
   - Conclude each task with: Task Scope, Files Inspected/Changed, Verification Exit Code & Duration, and Measured Elapsed Breakdown.
<!-- END:project-execution-protocol -->

<!-- BEGIN:retail-campaign-funnel-rules -->
## Retail Campaign & Funnel UX Invariants

1. **Strict Single-Viewport Mobile Ergonomics:**
   - Every funnel step (Intro -> Greeting -> Prize Showcase -> Game -> Claim Form -> Viral Gate -> Coupon Ticket) must comfortably fit mobile viewports (`max-w-sm`, tight vertical padding `py-1` to `py-3`, `max-h-[100dvh]`).
   - Never let modal cards or coupon tickets exceed the viewport or require awkward scrolling on standard mobile screens (360px–414px width).

2. **Viral Verification & Channel Gating Architecture:**
   - When mandatory social shares are specified (e.g. 5 WhatsApp shares), show clear progress (`0/5`, `1/5` ... `5/5`) with visual progress bars.
   - Gated steps (Coupon Code, Next CTA) must stay strictly locked with haptic/visual feedback until both share count and community channel follow requirements are fulfilled.
   - Persist share progress and channel clicks in `localStorage` keyed by coupon code to prevent customer frustration on refresh.

3. **Direct Merchant WhatsApp Routing & Dashboard Continuity:**
   - The primary CTA on unlocked coupons must directly generate an encoded `wa.me/<merchant_phone>?text=...` message containing:
     - Customer name & phone number
     - Verified unique coupon code
     - Prize title and store location
   - Always provide a secondary path leading to the customer's permanent wallet/dashboard.

4. **Production Fail-Safe Authentication & Config:**
   - Never hardcode blocking fail-closed checks that reject users when optional third-party cloud database variables are unset on deployment platforms (e.g. Vercel). Always provide graceful fallback handling to in-memory CRM + Google Sheets auto-sync.
<!-- END:retail-campaign-funnel-rules -->
