'use client';

import React, { useState, useEffect } from 'react';
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
  Lock,
  Unlock,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '@/lib/audio';
import { Coupon, Campaign } from '@/types';
import { getNahataWhatsAppClaimUrl, getNahataShareUrl } from '@/lib/whatsapp';

interface CouponCardProps {
  coupon: Coupon;
  campaign: Campaign;
}

export const CouponCard: React.FC<CouponCardProps> = ({ coupon, campaign }) => {
  const [copied, setCopied] = useState(false);
  const [shareCount, setShareCount] = useState<number>(0);
  const [hasShared, setHasShared] = useState<boolean>(false);
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Restore persistent share status from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isUnlocked = localStorage.getItem(`nahata_share_unlocked_${coupon.code}`) === 'true';
      if (isUnlocked) {
        setHasShared(true);
        setShareCount(1);
      }
    }
  }, [coupon.code]);

  const triggerShake = () => {
    setIsShaking(true);
    try {
      soundEngine.playTick();
    } catch {}
    setTimeout(() => setIsShaking(false), 600);
  };

  const handleCopy = () => {
    if (!hasShared) {
      setLockedNotice('🔒 कूपन कोड कॉपी करने के लिए पहले 1 WhatsApp शेयर करना अनिवार्य है!');
      triggerShake();
      return;
    }
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareClick = () => {
    setShareCount((prev) => Math.max(prev + 1, 1));
    setHasShared(true);
    setLockedNotice(null);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`nahata_share_unlocked_${coupon.code}`, 'true');
      } catch {}
    }

    try {
      soundEngine.playCelebrationChime();
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#FFC857', '#17864B', '#FFB020', '#FFFFFF', '#86152B'],
      });
    } catch {}
  };

  const handleLockedNextClick = () => {
    triggerShake();
    setLockedNotice(
      '⚠️ अगला बटन अभी लॉक है! कूपन सक्रिय करने और मनोज भैया को भेजने के लिए पहले ऊपर दिए गए "WhatsApp पर शेयर करें" बटन से 1 शेयर अनिवार्य है।'
    );
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
    coupon.customer?.full_name || campaign.title,
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
      
      {/* 0. Real-time Mandatory Share Gate Status Banner */}
      {!hasShared ? (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-red-950/90 via-amber-950/90 to-red-950/90 border-2 border-amber-400/80 shadow-lg text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-amber-950 uppercase tracking-wider">
            <Lock className="w-3 h-3 text-amber-950" />
            <span>अनिवार्य नियम (MANDATORY STEP)</span>
          </div>
          <h4 className="text-xs sm:text-sm font-black text-amber-200">
            🔒 कूपन कोड व अगला बटन अभी लॉक है!
          </h4>
          <p className="text-[10px] sm:text-[11px] text-[#FFF4D8] leading-tight">
            कूपन कोड सक्रिय करने और मनोज भैया को भेजने के लिए{' '}
            <strong className="text-amber-300 underline">पहले 1 WhatsApp शेयर</strong> करना अनिवार्य है।
          </p>
        </div>
      ) : (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-emerald-950/90 border-2 border-emerald-400 shadow-lg text-center space-y-1 animate-in zoom-in-95">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-emerald-950 uppercase tracking-wider">
            <Unlock className="w-3 h-3 text-emerald-950" />
            <span>कूपन अनलॉक हो गया (UNLOCKED)</span>
          </div>
          <h4 className="text-xs sm:text-sm font-black text-emerald-200">
            🎉 बधाई! आपका कूपन कोड सक्रिय हो चुका है
          </h4>
          <p className="text-[10px] sm:text-[11px] text-emerald-100 leading-tight">
            अब नीचे दिए गए हरे बटन से कूपन को मनोज भैया के WhatsApp पर भेजें व सुरक्षित करें।
          </p>
        </div>
      )}

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

          {/* Unique Coupon Code Display (Masked if not shared, Unmasked when shared) */}
          {hasShared ? (
            <div className="my-3.5 p-3 rounded-2xl bg-emerald-50/90 border-2 border-dashed border-emerald-500 text-center relative animate-in zoom-in-95">
              <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest block mb-1">
                आपका प्रमाणित कूपन कोड (COUPON CODE) — <span className="text-emerald-700 font-bold">🔓 सक्रिय</span>
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl sm:text-2xl font-mono font-black text-[#86152B] tracking-wider selection:bg-amber-300">
                  {coupon.code}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 px-2 rounded-lg bg-emerald-200 hover:bg-emerald-300 text-emerald-950 transition-colors flex items-center gap-1 text-[11px] font-bold"
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
          ) : (
            <div className="my-3.5 p-3 rounded-2xl bg-amber-50/90 border-2 border-dashed border-amber-400 text-center relative">
              <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest block mb-1">
                आपका कूपन कोड (COUPON CODE) — <span className="text-red-700 font-bold">🔒 लॉक है</span>
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl sm:text-2xl font-mono font-black text-slate-400 tracking-wider blur-[2.5px] select-none">
                  {coupon.code.slice(0, 7)}••••
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 px-2 rounded-lg bg-amber-200/80 text-amber-900 transition-colors flex items-center gap-1 text-[11px] font-bold"
                  title="कूपन कॉपी करें"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-800" />
                  <span>शेयर करें</span>
                </button>
              </div>
              <p className="text-[10px] text-amber-900 font-bold mt-1">
                👉 कूपन कोड देखने के लिए नीचे दिए गए बटन से 1 WhatsApp शेयर करें
              </p>
            </div>
          )}

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
              {hasShared ? (
                <span className="font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block text-[10px]">
                  ● सक्रिय (VALID)
                </span>
              ) : (
                <span className="font-black text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full inline-block text-[10px]">
                  🔒 शेयर बाकी (LOCKED)
                </span>
              )}
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
              {hasShared ? coupon.code : 'NAHATA-••••-••••'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. MANDATORY WHATSAPP SHARE GATE (Enforces viral sharing before opening next button) */}
      <div
        className={`p-4 rounded-2xl border-2 transition-all shadow-xl space-y-3 ${
          hasShared
            ? 'bg-gradient-to-br from-emerald-950/80 via-slate-900 to-black border-emerald-500/60'
            : 'bg-gradient-to-br from-[#450711] via-[#240308] to-black border-amber-400'
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              hasShared
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-400 text-amber-950 border-amber-300'
            }`}
          >
            {hasShared ? (
              <Unlock className="w-3 h-3 text-emerald-400" />
            ) : (
              <Lock className="w-3 h-3 text-amber-950" />
            )}
            <span>{hasShared ? 'चरण 1: शेयरिंग पूर्ण (COMPLETED)' : 'अनिवार्य चरण 1: पहले WhatsApp शेयर करें'}</span>
          </span>
          <span className={`text-[11px] font-black ${hasShared ? 'text-emerald-400' : 'text-amber-300'}`}>
            {hasShared ? '1 / 1 शेयर पूर्ण ✅' : '0 / 1 शेयर बाकी 🔒'}
          </span>
        </div>

        {/* Live Visual Progress Bar */}
        <div className="w-full bg-black/60 rounded-full h-2.5 p-0.5 border border-amber-500/30 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              hasShared
                ? 'w-full bg-gradient-to-r from-emerald-400 to-teal-300'
                : 'w-2 bg-gradient-to-r from-red-500 to-amber-500'
            }`}
          />
        </div>

        <div>
          <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {hasShared ? 'बधाई! आपका कूपन सक्रिय हो चुका है' : 'अपने व्हाट्सएप मित्रों या ग्रुप में यह ऑफर शेयर करें'}
            </span>
          </h4>
          <p className="text-[10px] sm:text-[11px] text-amber-200/90 mt-0.5 leading-relaxed font-medium">
            {hasShared
              ? 'आपका शेयर दर्ज हो गया है। अब नीचे दिए गए हरे बटन से कूपन को मनोज भैया को भेजें।'
              : '⚠️ जब तक आप नीचे दिए गए बटन पर क्लिक करके कम से कम 1 शेयर नहीं करेंगे, तब तक आगे का बटन लॉक रहेगा!'}
          </p>
        </div>

        {/* Primary Share CTA */}
        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleShareClick}
          className={`w-full py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 text-center ${
            hasShared
              ? 'bg-emerald-900/70 hover:bg-emerald-800/80 text-emerald-200 border border-emerald-500/50'
              : 'bg-gradient-to-r from-[#25D366] via-emerald-500 to-[#128C7E] hover:from-[#20bd5a] hover:to-emerald-600 text-white shadow-emerald-500/30 border-2 border-emerald-300 animate-pulse'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>{hasShared ? 'व्हाट्सएप पर और शेयर करें (Optional)' : '📲 1. WhatsApp पर शेयर करें (यहाँ दबाएं - अनिवार्य)'}</span>
        </a>
      </div>

      {/* Warning Notice if customer tapped locked Next button */}
      {lockedNotice && !hasShared && (
        <div className="p-2.5 rounded-xl bg-red-950/90 border border-red-500 text-red-200 text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-in fade-in duration-200">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{lockedNotice}</span>
        </div>
      )}

      {/* 3. THE NEXT BUTTON ("आगे का बटन") — Strictly locked until 1 share is completed */}
      {!hasShared ? (
        <button
          type="button"
          onClick={handleLockedNextClick}
          className={`w-full py-3.5 px-4 rounded-2xl bg-slate-900/90 hover:bg-slate-900 border-2 border-dashed border-slate-700 text-slate-400 font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-not-allowed select-none transition-all text-center ${
            isShaking ? 'border-red-500 text-red-400 bg-red-950/40' : ''
          }`}
        >
          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>🔒 2. अगला कदम: मनोज जी को कूपन भेजें (पहले शेयर करें)</span>
        </button>
      ) : (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#25D366] via-emerald-500 to-[#128C7E] hover:from-[#20bd5a] hover:to-emerald-600 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all text-center border-2 border-emerald-300 animate-in zoom-in-95"
        >
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
          <span>🔓 2. मनोज जी को कूपन भेजें & सेव करें (अनलॉक हुआ) ➔</span>
        </a>
      )}

      {/* 4. Verified Store Visit & Call Actions */}
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
