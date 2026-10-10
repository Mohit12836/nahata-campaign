'use client';

import React, { useState } from 'react';
import { Copy, Check, MessageSquare, Share2, Users, Calendar, MapPin, Sparkles, Store } from 'lucide-react';
import { Coupon, Campaign } from '@/types';
import { getNahataWhatsAppClaimUrl, getNahataShareUrl } from '@/lib/whatsapp';

interface CouponCardProps {
  coupon: Coupon;
  campaign: Campaign;
}

export const CouponCard: React.FC<CouponCardProps> = ({ coupon, campaign }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappUrl = getNahataWhatsAppClaimUrl({
    whatsappNumber: campaign.whatsapp_number,
    customerName: coupon.customer?.full_name || 'ग्राहक',
    customerPhone: coupon.customer?.phone || '',
    couponCode: coupon.code,
    prizeTitle: coupon.prize?.title || 'विशेष ऑफर',
    terms: coupon.prize?.terms_and_conditions,
    storeName: campaign.store_name,
  });

  const shareUrl = getNahataShareUrl(campaign.title);
  const formattedExpiry = new Date(coupon.expires_at).toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="w-full max-w-md mx-auto space-y-4 animate-in fade-in zoom-in-95 duration-300 select-none">
      {/* Coupon Ticket Body */}
      <div className="relative rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 p-1 shadow-2xl">
        <div className="bg-white rounded-[22px] p-5 sm:p-6 overflow-hidden relative">
          
          {/* Top Notch Circles */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-amber-500 shadow-inner" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-amber-500 shadow-inner" />

          {/* Store Brand Header */}
          <div className="text-center pb-3 border-b border-dashed border-amber-200">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 mb-1">
              <Store className="w-3.5 h-3.5 text-amber-600" /> {campaign.store_name}
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              {coupon.prize?.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {coupon.prize?.terms_and_conditions}
            </p>
          </div>

          {/* Unique Coupon Code Box */}
          <div className="my-4 p-3 rounded-2xl bg-amber-50 border-2 border-dashed border-amber-400 text-center">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest block mb-1">
              आपका यूनिक कूपन कोड
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl sm:text-2xl font-mono font-black text-rose-700 tracking-wider">
                {coupon.code}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 transition-colors"
                title="कूपन कॉपी करें"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copied && (
              <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
                ✓ कोड कॉपी हो गया!
              </span>
            )}
          </div>

          {/* Meta Information: Customer Name & Expiry */}
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
            <div>
              <span className="text-slate-400 block text-[10px]">धारक का नाम</span>
              <span className="font-bold text-slate-800">{coupon.customer?.full_name}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">वैधता (Expiry)</span>
              <span className="font-bold text-rose-600">{formattedExpiry}</span>
            </div>
          </div>

          {/* Barcode Simulator Graphic */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col items-center">
            <div className="h-9 w-48 flex items-center justify-between opacity-80">
              {[6, 2, 4, 1, 5, 2, 8, 3, 2, 6, 1, 4, 7, 2, 5, 3, 6, 2, 4, 1, 3, 6, 2, 4].map((h, i) => (
                <div
                  key={i}
                  className="bg-slate-800"
                  style={{ width: `${(i % 3) + 1}px`, height: `${18 + h * 1.5}px` }}
                />
              ))}
            </div>
            <span className="text-[9px] text-slate-400 font-mono tracking-widest mt-1">
              {coupon.code}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action: Direct WhatsApp Confirmation */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-center"
      >
        <MessageSquare className="w-5 h-5 fill-current" />
        <span>व्हाट्सएप पर मनोज जी को भेजें & कन्फर्म करें</span>
      </a>

      {/* Secondary Actions: Share & Community */}
      <div className="grid grid-cols-2 gap-2.5">
        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 shadow"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>दोस्तों को शेयर करें</span>
        </a>

        {campaign.whatsapp_community_link && (
          <a
            href={campaign.whatsapp_community_link}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold flex items-center justify-center gap-1.5 border border-amber-300"
          >
            <Users className="w-3.5 h-3.5 text-amber-700" />
            <span>VIP ग्रुप में जुड़ें</span>
          </a>
        )}
      </div>

      {/* Store instructions */}
      <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-center text-xs text-amber-900">
        <p className="font-semibold">
          📍 नाहटा जनरल स्टोर्स पर खरीदारी के समय यह कूपन कोड बिल काउंटर पर दिखाकर तुरंत छूट प्राप्त करें।
        </p>
      </div>
    </div>
  );
};
