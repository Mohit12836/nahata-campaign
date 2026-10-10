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
  Truck,
  Trophy,
  CheckCircle2,
  ArrowRight,
  Flame,
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
    whatsappNumber: campaign.whatsapp_number,
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

  const isUnlockedBonus = shareCount >= 5;

  return (
    <div className="w-full max-w-md mx-auto space-y-4 animate-in fade-in zoom-in-95 duration-300 select-none">
      {/* 1. Coupon Ticket Body */}
      <div className="relative rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 p-1 shadow-2xl">
        <div className="bg-white rounded-[22px] p-5 sm:p-6 overflow-hidden relative">
          
          {/* Notch Circles */}
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
            <div className="h-8 w-48 flex items-center justify-between opacity-80">
              {[6, 2, 4, 1, 5, 2, 8, 3, 2, 6, 1, 4, 7, 2, 5, 3, 6, 2, 4, 1, 3, 6, 2, 4].map((h, i) => (
                <div
                  key={i}
                  className="bg-slate-800"
                  style={{ width: `${(i % 3) + 1}px`, height: `${16 + h * 1.5}px` }}
                />
              ))}
            </div>
            <span className="text-[9px] text-slate-400 font-mono tracking-widest mt-1">
              {coupon.code}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Primary WhatsApp Claim Action */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-center"
      >
        <MessageSquare className="w-5 h-5 fill-current" />
        <span>व्हाट्सएप पर मनोज जी को भेजें & कन्फर्म करें</span>
      </a>

      {/* 3. VIRAL 5-SHARE GAMIFIED ENGINE (मनोविज्ञान: एक्स्ट्रा लकी टोकन व बोनस अनलॉक) */}
      <div className="p-4 rounded-3xl bg-gradient-to-b from-slate-900 via-[#1f1105] to-slate-950 border-2 border-amber-500/50 shadow-xl space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/40">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> वायरल बोनस मिशन
          </span>
          <span className="text-xs font-black text-amber-300">
            {shareCount} / 5 शेयर पूरे
          </span>
        </div>

        <div>
          <h4 className="text-sm font-black text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            5 दोस्तों / ग्रुप्स में शेयर करें & एक्स्ट्रा VIP बोनस पाएं!
          </h4>
          <p className="text-[11px] text-amber-200/80 mt-1 leading-relaxed">
            हर शेयर पर दोस्तों को फ्री लकी ड्रा मिलेगा और 5 शेयर पूरे होते ही आपका <strong>₹50 एक्स्ट्रा कैश वाउचर / गोल्ड टोकन</strong> अनलॉक होगा!
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-3 p-0.5 overflow-hidden border border-amber-500/30">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500 ease-out"
            style={{ width: `${(shareCount / 5) * 100}%` }}
          />
        </div>

        {/* Share CTA Button */}
        {!isUnlockedBonus ? (
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleShareClick}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-amber-950 font-black text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
          >
            <Share2 className="w-4 h-4" />
            <span>व्हाट्सएप पर शेयर करें ({5 - shareCount} बाकी)</span>
          </a>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
            <Trophy className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-emerald-300 font-black">🏆 बधाई हो! ₹50 VIP बोनस अनलॉक हो गया!</p>
              <p className="text-[10px] text-emerald-400 font-normal">
                बिलिंग के समय काउंटर पर यह स्क्रीन दिखाएं और ₹50 की अतिरिक्त छूट पाएं।
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 4. DISTANT / OUT-OF-TOWN CUSTOMER HOOK (दूर-दराज के ग्राहकों के लिए कम्युनिटी इंजन) */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-950/90 via-slate-900 to-slate-950 border border-amber-500/40 shadow-xl space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex-shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-white flex items-center gap-1.5">
              <span>दुकान दूर है या कुशलगढ़ से बाहर रहते हैं?</span>
            </h4>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              चिंता न करें! नाहाटा जनरल स्टोर्स के <strong>VIP WhatsApp ग्रुप</strong> से जुड़ें और घर बैठे ऑर्डर करें।
            </p>
          </div>
        </div>

        {/* Value Bullets for WhatsApp VIP Group */}
        <div className="grid grid-cols-1 gap-1.5 text-[11px] text-slate-300 bg-black/40 p-2.5 rounded-xl border border-white/5">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>📸 <strong>रोजाना नए घरेलू सामान व क्रॉकरी</strong> के फोटो व वीडियो</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>🏷️ <strong>बाजार से 20-30% कम होलसेल रेट</strong> (सीधा नाहाटा डिस्काउंट)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>🚚 <strong>कुशलगढ़, बांसवाड़ा व नजदीकी गांवों में</strong> सुरक्षित डिलीवरी</span>
          </div>
        </div>

        {/* Group Join CTA */}
        {campaign.whatsapp_community_link && (
          <a
            href={campaign.whatsapp_community_link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
          >
            <Users className="w-4 h-4 text-slate-950" />
            <span>VIP व्हाट्सएप कम्युनिटी से जुड़ें (फ्री)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* 5. Store Counter Instructions */}
      <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-300 text-xs text-amber-950 space-y-1.5 shadow-sm">
        <p className="font-bold text-amber-900 flex items-center gap-1.5">
          <span>🏪</span> <span>दुकान पर कूपन भुनाने के 3 आसान नियम:</span>
        </p>
        <ul className="list-disc list-inside text-[11px] text-amber-900/90 space-y-1 pl-1">
          <li>बिल बनने से पहले काउंटर पर यह कूपन कोड दिखाएं।</li>
          <li>यह कूपन 1 ग्राहक व 1 खरीदारी पर ही मान्य है।</li>
          <li>{coupon.prize?.terms_and_conditions || 'ऑफर की न्यूनतम खरीद शर्त लागू रहेगी।'}</li>
        </ul>
      </div>
    </div>
  );
};

