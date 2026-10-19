import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { loadPublicStore } from '@/lib/public-store-server';

const currency = (value: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
}).format(value);

export default async function StoreCampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection(); // Next 16 Cache Components: defer server read to request-time.
  const { slug } = await params;
  const page = await loadPublicStore(slug);
  if (!page) notFound();

  const { merchant, campaign, offers } = page;
  return (
    <main className="min-h-dvh bg-[#0b1020] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[450px] bg-gradient-to-b from-[#263e78] via-[#151f3e] to-transparent" aria-hidden="true" />
      <div className="relative mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-8">
        <header className="flex items-center justify-between gap-3 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl border border-amber-300/30 bg-amber-200/10 text-2xl font-bold text-amber-200" aria-hidden="true">
              {merchant.name.slice(0, 1)}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-amber-200">Store Offers</p>
              <h1 className="text-lg font-bold leading-snug">{merchant.name}</h1>
            </div>
          </div>
          <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-200">Campaign live</span>
        </header>

        <section className="py-12 sm:py-16" aria-labelledby="campaign-title">
          <p className="mb-4 inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-1.5 text-xs font-semibold text-amber-200">विशेष ऑफर • {merchant.category || 'लोकल स्टोर'}</p>
          <h2 id="campaign-title" className="max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">{campaign.headline}</h2>
          {campaign.subheadline && <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300">{campaign.subheadline}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span className="rounded-lg bg-white/10 px-3 py-2">📍 {merchant.location}</span>
            <span className="rounded-lg bg-white/10 px-3 py-2">अंतिम तिथि: {new Date(campaign.expiresAt).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}</span>
          </div>
        </section>

        <section aria-labelledby="offers-title">
          <div className="mb-5 flex items-end justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-amber-200">Available now</p>
              <h3 id="offers-title" className="mt-1 text-2xl font-bold">दुकान के ऑफर</h3>
            </div>
            <span className="text-sm text-slate-300">{offers.length} विकल्प</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {offers.map((offer, index) => (
              <article key={offer.id} className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/[.06] p-5 shadow-xl shadow-black/10 transition hover:border-amber-300/50">
                <div className="mb-4 flex items-start justify-between">
                  <span className="rounded-lg bg-amber-300/15 px-3 py-1 text-xs font-bold text-amber-200">Offer {String(index + 1).padStart(2, '0')}</span>
                  <span className="text-2xl" aria-hidden="true">🎁</span>
                </div>
                <h4 className="text-lg font-bold leading-snug">{offer.title}</h4>
                {offer.minimumBill > 0 && <p className="mt-2 text-sm text-amber-200">न्यूनतम खरीदारी {currency(offer.minimumBill)}</p>}
                {offer.terms && <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{offer.terms}</p>}
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-amber-300/20 bg-gradient-to-br from-[#1c3056] to-[#101a32] p-6">
          <h3 className="text-xl font-bold">ऑफर की जानकारी चाहिए?</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">उपलब्धता, पात्रता और अंतिम बिल पर लागू नियम दुकान से सत्यापित करें।</p>
          {merchant.whatsappUrl ? (
            <a href={merchant.whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-400">WhatsApp पर दुकान से पूछें ↗</a>
          ) : (
            <p className="mt-4 text-sm text-amber-200">दुकान से सीधे संपर्क करें।</p>
          )}
          <p className="mt-4 text-xs text-slate-400">यह read-only offer preview है। कूपन claim/redeem सुविधा सुरक्षित verification के बाद शुरू होगी।</p>
        </section>

        <footer className="pt-10 text-center text-xs text-slate-400">
          {merchant.name}{merchant.shopNumber ? ` • ${merchant.shopNumber}` : ''} • {merchant.location}
        </footer>
      </div>
    </main>
  );
}
