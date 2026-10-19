import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Activity, ArrowUpRight, BarChart3, CreditCard,
  LayoutDashboard, LockKeyhole, Megaphone, Settings2,
  ShieldCheck, Sparkles, Store, Users, Workflow,
} from 'lucide-react';
import { isServerAdminAuthenticated } from '@/lib/auth-server';
import { getSuperAdminMerchantsAction } from '@/app/actions/admin';

const upcoming = [
  { label: 'Offer Factory', description: 'Templates, campaign drafts & publishing', icon: Sparkles },
  { label: 'Orders & Billing', description: 'Pricing, subscriptions & payments', icon: CreditCard },
  { label: 'AI Operations', description: 'Agent tools, budgets & approvals', icon: Workflow },
  { label: 'Campaign Analytics', description: 'Views, claims & verified redemptions', icon: BarChart3 },
  { label: 'Customer Privacy', description: 'Consent, access & data retention', icon: Users },
  { label: 'System Health', description: 'Queue, webhooks, logs & recovery', icon: Activity },
];

export const metadata = {
  title: 'VISMART Control Center',
  robots: { index: false, follow: false },
};

export default async function ControlCenterPage() {
  // Server-side gate; this page must not render merchant information for guests.
  if (!(await isServerAdminAuthenticated())) {
    redirect('/super-admin');
  }

  const result = await getSuperAdminMerchantsAction();
  const available = result.success;
  const merchants = available ? result.merchants : [];
  const active = merchants.filter((merchant) => merchant.status === 'active').length;
  const pending = merchants.filter((merchant) => merchant.status === 'pending').length;
  const suspended = merchants.filter((merchant) => merchant.status === 'suspended').length;

  const figures = [
    { name: 'Total merchants', value: merchants.length, icon: Store },
    { name: 'Active', value: active, icon: ShieldCheck },
    { name: 'Pending review', value: pending, icon: Settings2 },
    { name: 'Suspended', value: suspended, icon: LockKeyhole },
  ];

  return (
    <main className="min-h-screen bg-[#080b13] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-7 sm:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-7">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
              <LayoutDashboard aria-hidden="true" className="size-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">VISMART · Owner workspace</p>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Control Center</h1>
            </div>
          </div>
          <Link href="/super-admin" className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10">
            Existing merchant admin <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </header>

        <section className="mt-8" aria-labelledby="overview-heading">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="overview-heading" className="text-xl font-semibold">Merchant overview</h2>
              <p className="mt-1 text-sm text-slate-400">Live server-side records, not browser-local demo counters.</p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs ${available ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>
              {available ? 'Data source connected' : 'Merchant data unavailable'}
            </span>
          </div>

          {!available && (
            <div role="alert" className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
              The merchant database could not be verified. No placeholder totals are displayed.
              Check the server database configuration and access policies.
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {figures.map(({ name, value, icon: Icon }) => (
              <div key={name} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>{name}</span><Icon aria-hidden="true" className="size-5 text-indigo-300" />
                </div>
                <p className="mt-4 text-3xl font-semibold tabular-nums">{available ? value.toLocaleString('en-IN') : '—'}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10" aria-labelledby="modules-heading">
          <div className="mb-5">
            <h2 id="modules-heading" className="text-xl font-semibold">Business engines</h2>
            <p className="mt-1 text-sm text-slate-400">Modules appear as each integration is implemented and tested.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {upcoming.map(({ label, description, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-white/[0.07] text-slate-300">
                    <Icon aria-hidden="true" className="size-5" />
                  </div>
                  <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-slate-400">Planned · locked</span>
                </div>
                <h3 className="mt-4 font-semibold">{label}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">{description}</p>
              </div>
            ))}
          </div>
        </section>
        <footer className="mt-10 flex items-center gap-2 border-t border-white/10 pt-5 text-xs text-slate-500">
          <Megaphone aria-hidden="true" className="size-4" />
          No payments, AI messages, customer exports or campaigns are initiated by this view.
        </footer>
      </div>
    </main>
  );
}
