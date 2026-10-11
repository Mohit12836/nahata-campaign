'use client';

import React from 'react';
import { Gift, Lock, Sparkles, TicketCheck } from 'lucide-react';
import { Prize } from '@/types';

/**
 * Front-end presentation configuration.
 * Later these settings can be loaded from the campaign/admin database without
 * redesigning the customer page. Do not display a live participant count until
 * it comes from verified server-side records.
 */
export const CAMPAIGN_DISPLAY_CONFIG = {
  showFeaturedOffers: true,
  showMilestoneTeasers: true,
  milestoneUnlockMode: 'verified_customers' as 'manual' | 'verified_customers' | 'never',
  milestones: [
    { threshold: 100, label: 'पहला सरप्राइज़ रिवील' },
    { threshold: 200, label: 'दूसरा मेगा रिवील' },
    { threshold: 500, label: 'ग्रैंड मेगा रिवील' },
  ],
};

function formatRupees(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function OfferShowcase({ prizes }: { prizes: Prize[] }) {
  const visiblePrizes = prizes.filter((prize) => prize.is_active).slice(0, 4);

  return (
    <section className="space-y-4" aria-labelledby="offer-showcase-title">
      {CAMPAIGN_DISPLAY_CONFIG.showFeaturedOffers && (
        <div className="overflow-hidden rounded-3xl border border-amber-300/40 bg-gradient-to-br from-amber-300 via-yellow-500 to-orange-500 p-1 shadow-[0_16px_45px_rgba(245,158,11,0.18)]">
          <div className="rounded-[22px] bg-[#240707] p-4 sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-amber-200">
                  <Sparkles className="h-3.5 w-3.5" /> FESTIVAL DEALS
                </span>
                <h2 id="offer-showcase-title" className="mt-2 text-xl font-black leading-tight text-white sm:text-2xl">
                  इस कैंपेन में मिलने वाले ऑफर
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-amber-100/75">
                  हर ऑफर की न्यूनतम खरीदारी और शर्तें पहले देखें।
                </p>
              </div>
              <div className="rounded-2xl bg-amber-400/15 p-3 text-amber-300">
                <Gift className="h-7 w-7" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {visiblePrizes.map((prize, index) => (
                <article
                  key={prize.id}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-3.5"
                >
                  <div className="absolute right-0 top-0 rounded-bl-xl bg-amber-400 px-2 py-1 text-[9px] font-black text-[#2b0909]">
                    OFFER {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="pr-14">
                    <h3 className="text-sm font-extrabold leading-snug text-white">{prize.title}</h3>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-amber-100/80">
                    {prize.terms_and_conditions || 'लागू नियमों के अनुसार।'}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-2.5">
                    <span className="text-[10px] font-semibold text-slate-300">न्यूनतम बिल</span>
                    <span className="text-sm font-black text-amber-300">{formatRupees(prize.min_order_value || 0)}+</span>
                  </div>
                </article>
              ))}
            </div>
            <p className="mt-3 text-[10px] leading-relaxed text-amber-100/60">
              ऑफर की उपलब्धता, स्टॉक और पात्रता की अंतिम पुष्टि कूपन/काउंटर पर लागू नियमों के अनुसार होगी।
            </p>
          </div>
        </div>
      )}

      {CAMPAIGN_DISPLAY_CONFIG.showMilestoneTeasers && (
        <div className="rounded-3xl border border-violet-300/25 bg-gradient-to-br from-slate-950 via-[#1d1235] to-slate-950 p-4 shadow-xl sm:p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl border border-violet-300/20 bg-violet-400/10 p-3 text-violet-200">
              <Lock className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-violet-200/80">Community unlocks</span>
              <h2 className="mt-1 text-lg font-black text-white">मेगा सरप्राइज़ अभी लॉक हैं</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                विशेष इनाम तभी सामने आएँगे जब कैंपेन के तय नियम पूरे होंगे। इनाम का नाम अभी छिपा रहेगा।
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {CAMPAIGN_DISPLAY_CONFIG.milestones.map((milestone, index) => {
              const isManual = CAMPAIGN_DISPLAY_CONFIG.milestoneUnlockMode === 'manual';
              const neverUnlocks = CAMPAIGN_DISPLAY_CONFIG.milestoneUnlockMode === 'never';
              return (
                <div key={milestone.threshold} className="rounded-2xl border border-violet-200/15 bg-white/[0.04] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-violet-100/70">MILESTONE {index + 1}</span>
                    <Lock className="h-3.5 w-3.5 text-violet-200/70" />
                  </div>
                  <p className="mt-2 text-xl font-black text-white">{milestone.threshold} <span className="text-xs font-semibold text-violet-100/70">verified customers</span></p>
                  <p className="mt-1 text-xs font-bold text-violet-200">{milestone.label}</p>
                  <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
                    {neverUnlocks ? 'ऑटो-अनलॉक बंद' : isManual ? 'एडमिन की मंज़ूरी के बाद' : 'सत्यापित ग्राहक संख्या पूरी होने पर'}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-300/15 bg-amber-300/[0.06] p-2.5 text-[10px] leading-relaxed text-amber-100/75">
            <TicketCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <span>यह अभी डिस्प्ले प्रीव्यू है। लाइव अनलॉक तभी सक्रिय होगा जब verified customer count और admin controls backend से जुड़ेंगे।</span>
          </div>
        </div>
      )}
    </section>
  );
}
