'use client';

import React, { useState } from 'react';
import {
  Copy,
  Check,
  MessageSquare,
  Share2,
  Users,
  Store,
  Sparkles,
  ArrowRight,
  Flame,
  MapPin,
  PhoneCall,
  Navigation,
} from 'lucide-react';
import { Coupon, Campaign } from '@/types';
import { getNahataWhatsAppClaimUrl, getNahataShareUrl } from '@/lib/whatsapp';

interface CouponCardProps {
  coupon: Coupon;
  campaign: Campaign;
}

export const CouponCard: React.FC<CouponCardProps> = ({ coupon, campaign }) => {
  const [copied, setCopied] = useState(false);
  const [shareCount, setShareCount] = useState<number>(0);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareClick = () => {
    setShareCount((prev) => Math.min(prev + 1, 5));
  };

  const whatsappUrl = getNahataWhatsAppClaimUrl({
    whatsappNumber: campaign.whatsapp_number || '919829012345',
    customerName: coupon.customer?.full_name || 'ग्राहक',
    customerPhone: coupon.customer?.phone || '',
    couponCode: coupon.code,
    prizeTitle: coupon.prize?.title || 'विशेष ऑफर',
    terms: coupon.prize?.terms_and_conditions,
    storeName: campaign.store_name,
  });

  const shareUrl = getNahataShareUrl(
    campaign.title,
    coupon.prize?.title,
    typeof window !== 'undefined' ? window.location.origin : undefined
  );

  const formattedExpiry = new Date(coupon.expires_at).toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedClaimDate = coupon.created_at
    ? new Date(coupon.created_at).toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'आज';

  return (
    <div className="w-full max-w-md mx-auto space-y-3.5 animate-in fade-in zoom-in-95 duration-300 select-none">
      {/* 1. Digital Coupon Ticket */}
      <div className="relative rounded-3xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-1 shadow-2xl">
        <div className="bg-[#FFFDF7] rounded-[22px] p-4 sm:p-5 overflow-hidden relative border border-amber-300/40">
          
          {/* Ticket Notch Cutouts */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-amber-500 shadow-inner" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-amber-500 shadow-inner" />

          {/* Store Brand Header */}
          <div className="text-center pb-3 border-b border-dashed border-amber-300/80">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-950 mb-1 border border-amber-300">
              <Store className="w-3.5 h-3.5 text-amber-700" />
              <span>{campaign.store_name}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              {coupon.prize?.title}
            </h3>
            <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
              {coupon.prize?.terms_and_conditions}
            </p>
          </div>

          {/* Unique Coupon Code Display */}
          <div className="my-3.5 p-3 rounded-2xl bg-amber-50/90 border-2 border-dashed border-amber-400 text-center relative">
            <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest block mb-1">
              आपका प्रमाणित कूपन कोड (COUPON CODE)
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl sm:text-2xl font-mono font-black text-[#86152B] tracking-wider selection:bg-amber-300">
                {coupon.code}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 px-2 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 transition-colors flex items-center gap-1 text-[11px] font-bold"
                title="कूपन कॉपी करें"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'कॉपी हुआ' : 'कॉपी'}</span>
              </button>
            </div>
            {copied && (
              <span className="text-[10px] text-emerald-700 font-bold mt-1 block">
                ✓ कोड क्लिपबोर्ड पर कॉपी हो गया है!
              </span>
            )}
          </div>

          {/* Meta Details: Holder, Issue Date, Expiry, Status */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 bg-amber-100/40 p-2.5 rounded-xl border border-amber-200">
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-bold">कूपन धारक</span>
              <span className="font-bold text-slate-900 truncate block">
                {coupon.customer?.full_name || 'मान्य ग्राहक'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[9px] uppercase font-bold">कूपन स्थिति</span>
              <span className="font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block text-[10px]">
                ● सक्रिय (VALID)
              </span>
            </div>
            <div className="pt-1 border-t border-amber-200/60">
              <span className="text-slate-500 block text-[9px] uppercase font-bold">जारी तिथि</span>
              <span className="font-semibold text-slate-800">{formattedClaimDate}</span>
            </div>
            <div className="text-right pt-1 border-t border-amber-200/60">
              <span className="text-slate-500 block text-[9px] uppercase font-bold">वैधता (EXPIRY)</span>
              <span className="font-bold text-[#86152B]">{formattedExpiry}</span>
            </div>
          </div>

          {/* Barcode Graphic */}
          <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-col items-center">
            <div className="h-6 w-44 flex items-center justify-between opacity-80">
              {[5, 2, 4, 1, 5, 2, 6, 3, 2, 5, 1, 4, 6, 2, 5, 3, 5, 2, 4, 1, 3, 5, 2, 4].map((h, i) => (
                <div
                  key={i}
                  className="bg-slate-800"
                  style={{ width: `${(i % 3) + 1}px`, height: `${12 + h * 1.5}px` }}
                />
              ))}
            </div>
            <span className="text-[9px] text-slate-500 font-mono tracking-widest mt-0.5">
              {coupon.code}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Primary WhatsApp Confirmation Action */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all text-center"
      >
        <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
        <span>व्हाट्सएप पर मनोज जी को कूपन भेजें & सेव करें</span>
      </a>

      {/* 3. Verified Store Visit & Call Actions */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#3b0811] via-[#240308] to-black border border-amber-500/40 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>दुकान पर पधारें व कूपन भुनाएं</span>
          </span>
          <span className="text-[10px] text-amber-200/70 font-semibold">
            बस स्टैंड रोड, कुशलगढ़
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Verified Google Maps Route */}
          <a
            href="https://www.google.com/maps/search/?api=1&query=Nahata+General+Stores+Bus+Stand+Road+Kushalgarh+Banswara+Rajasthan"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-amber-950 font-black text-[11px] sm:text-xs flex items-center justify-center gap-1.5 shadow active:scale-98 transition-all text-center"
          >
            <Navigation className="w-3.5 h-3.5 text-amber-950" />
            <span>दुकान का रास्ता (Maps)</span>
          </a>

          {/* Call Manoj Ji */}
          <a
            href={`tel:${campaign.whatsapp_number?.replace(/\D/g, '').slice(-10) || '9829012345'}`}
            className="py-2.5 px-3 rounded-xl bg-emerald-900/60 hover:bg-emerald-800/70 border border-emerald-500/40 text-emerald-200 font-black text-[11px] sm:text-xs flex items-center justify-center gap-1.5 shadow active:scale-98 transition-all text-center"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
            <span>मनोज जी से बात करें</span>
          </a>
        </div>
      </div>

      {/* 4. WhatsApp Sharing Card (Transparent & Honest Mechanics) */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 via-[#1f1105] to-slate-950 border border-amber-500/40 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40">
            <Flame className="w-3 h-3 text-amber-400" /> परिवार व मित्रों के साथ शेयर करें
          </span>
          <span className="text-[11px] font-bold text-amber-300">
            {shareCount} बार शेयर किया
          </span>
        </div>

        <div>
          <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>अपने व्हाट्सएप ग्रुप्स में यह शुभ ऑफर शेयर करें</span>
          </h4>
          <p className="text-[10px] sm:text-[11px] text-amber-200/80 mt-0.5 leading-relaxed">
            आपके दोस्तों को भी लकी ड्रा का मौका मिलेगा। दुकान पर खरीदारी के समय शेयरिंग दिखाने पर विशेष उपहार!
          </p>
        </div>

        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleShareClick}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-amber-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-transform"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>व्हाट्सएप पर शेयर करें (WhatsApp Share)</span>
        </a>
      </div>

      {/* 5. VIP WhatsApp Community */}
      {campaign.whatsapp_community_link && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-950 border border-amber-500/30 shadow-lg space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-white">
                VIP WhatsApp कम्युनिटी से जुड़ें
              </h4>
              <p className="text-[10px] text-amber-200/80">
                दैनिक नए घरेलू सामान, ऑफर्स और कुशलगढ़ लोकल डिलीवरी अपडेट्स
              </p>
            </div>
          </div>

          <a
            href={campaign.whatsapp_community_link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-3 rounded-xl bg-amber-400/90 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow active:scale-98 transition-all"
          >
            <span>ग्रुप जॉइन करें (निःशुल्क)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* 6. In-Store Redemption Rules */}
      <div className="p-3 rounded-2xl bg-[#FFFDF7] border border-amber-300 text-xs text-amber-950 space-y-1 shadow-sm">
        <p className="font-black text-amber-900 flex items-center gap-1">
          <span>🏪</span> <span>दुकान पर कूपन रिडीम करने के नियम:</span>
        </p>
        <ul className="list-disc list-inside text-[10px] sm:text-[11px] text-amber-900/90 space-y-0.5 pl-1 font-medium">
          <li>बिल बनने से पूर्व काउंटर पर यह कूपन कोड दिखाएं।</li>
          <li>यह कूपन 1 ग्राहक व 1 खरीदारी पर मान्य है।</li>
          <li>{coupon.prize?.terms_and_conditions || 'न्यूनतम खरीद शर्त लागू रहेगी।'}</li>
        </ul>
      </div>
    </div>
  );
};
