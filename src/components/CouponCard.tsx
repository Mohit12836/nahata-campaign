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
  onOpenDashboard?: () => void;
}

export const CouponCard: React.FC<CouponCardProps> = ({ coupon, campaign, onOpenDashboard }) => {
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

  const [refCopied, setRefCopied] = useState(false);

  const whatsappUrl = getNahataWhatsAppClaimUrl({
    whatsappNumber: campaign.whatsapp_number || '918290447144',
    customerName: coupon.customer?.full_name || 'ग्राहक',
    customerPhone: coupon.customer?.phone || '',
    couponCode: coupon.code,
    prizeTitle: coupon.prize?.title || 'विशेष ऑफर',
    terms: coupon.prize?.terms_and_conditions,
    storeName: campaign.store_name,
  });

  // Unique Customer Referral Link (Format: domain/store/[slug]?ref=[COUPON_CODE])
  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nahata-campaign.vercel.app';
  const referralLink = `${originUrl}/store/${campaign.slug || 'nahata'}?ref=${coupon.code}`;

  const shareUrl = getNahataShareUrl(
    coupon.customer?.full_name || campaign.title,
    coupon.prize?.title,
    referralLink
  );

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setRefCopied(true);
    try {
      soundEngine.playFestiveBell();
    } catch {}
    setTimeout(() => setRefCopied(false), 2500);
  };

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
    <div className="w-full max-w-sm mx-auto flex flex-col justify-between select-none animate-in fade-in zoom-in-95 duration-300 py-1 space-y-3">
      {/* 1. Verified Digital Coupon Ticket - Compact & Elegant */}
      <div className="relative rounded-3xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-1 shadow-2xl">
        <div className="bg-[#FFFDF7] rounded-[22px] p-4 overflow-hidden relative border border-amber-300/40 text-center space-y-2">
          
          {/* Ticket Notch Cutouts */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-amber-500 shadow-inner" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-amber-500 shadow-inner" />

          {/* Store Brand Header */}
          <div className="pb-2 border-b border-dashed border-amber-300/80">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-950 mb-1 border border-amber-300">
              <Store className="w-3 h-3 text-amber-700" />
              <span>{campaign.store_name}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              {coupon.prize?.title}
            </h3>
            <p className="text-[10.5px] text-slate-600 mt-0.5 font-medium line-clamp-1">
              {coupon.prize?.terms_and_conditions}
            </p>
          </div>

          {/* Unique Coupon Code Display */}
          <div className="my-2 p-2.5 rounded-2xl bg-emerald-50/90 border-2 border-dashed border-emerald-500 text-center relative animate-in zoom-in-95">
            <span className="text-[9.5px] font-black text-emerald-900 uppercase tracking-widest block mb-0.5">
              प्रमाणित कूपन कोड (COUPON CODE) — <span className="text-emerald-700 font-bold">🔓 सक्रिय</span>
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl sm:text-2xl font-mono font-black text-[#86152B] tracking-wider selection:bg-amber-300">
                {coupon.code}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 px-2 rounded-lg bg-emerald-200 hover:bg-emerald-300 text-emerald-950 transition-colors flex items-center gap-1 text-[10px] font-bold"
                title="कूपन कॉपी करें"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'कॉपी हुआ' : 'कॉपी'}</span>
              </button>
            </div>
          </div>

          {/* Meta Details: Holder, Status, Expiry */}
          <div className="grid grid-cols-2 gap-1.5 text-[10.5px] text-slate-700 bg-amber-100/50 p-2 rounded-xl border border-amber-200 text-left">
            <div>
              <span className="text-slate-500 block text-[8.5px] uppercase font-bold">कूपन धारक</span>
              <span className="font-bold text-slate-900 truncate block">
                {coupon.customer?.full_name || 'मान्य ग्राहक'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[8.5px] uppercase font-bold">कूपन स्थिति</span>
              <span className="font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full inline-block text-[9.5px]">
                ● सक्रिय (VALID)
              </span>
            </div>
            <div className="pt-0.5 border-t border-amber-200/60">
              <span className="text-slate-500 block text-[8.5px] uppercase font-bold">जारी तिथि</span>
              <span className="font-semibold text-slate-800">{formattedClaimDate}</span>
            </div>
            <div className="text-right pt-0.5 border-t border-amber-200/60">
              <span className="text-slate-500 block text-[8.5px] uppercase font-bold">वैधता</span>
              <span className="font-bold text-[#86152B]">{formattedExpiry}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DIRECT SEND TO MANOJ BHAIYA (MAIN ACTION) */}
      <div className="space-y-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#25D366] via-emerald-500 to-[#128C7E] hover:from-[#20bd5a] hover:to-emerald-600 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all text-center border-2 border-emerald-300 animate-pulse"
        >
          <MessageSquare className="w-5 h-5 fill-current" />
          <span>📲 सीधे मनोज भैया को भेजें (WhatsApp पर) ➔</span>
        </a>

        {/* 3. OPEN CUSTOMER DASHBOARD */}
        {onOpenDashboard && (
          <button
            type="button"
            onClick={onOpenDashboard}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all text-center border border-amber-300"
          >
            <span>🎟️ अपना कस्टमर डैशबोर्ड व वॉलेट खोलें ➔</span>
          </button>
        )}
      </div>

      {/* 4. Quick Location & Call Strip */}
      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
        <a
          href="https://www.google.com/maps/search/?api=1&query=Nahata+General+Stores+Bus+Stand+Road+Kushalgarh+Banswara+Rajasthan"
          target="_blank"
          rel="noopener noreferrer"
          className="py-2 px-2.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 font-bold flex items-center justify-center gap-1.5 text-center hover:bg-amber-500/25 transition-all"
        >
          <Navigation className="w-3.5 h-3.5 text-amber-400" />
          <span>दुकान का नक्शा</span>
        </a>

        <a
          href={`tel:${campaign.whatsapp_number?.replace(/\D/g, '').slice(-10) || '8290447144'}`}
          className="py-2 px-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 font-bold flex items-center justify-center gap-1.5 text-center hover:bg-emerald-900/60 transition-all"
        >
          <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
          <span>कॉल: 82904 47144</span>
        </a>
      </div>
    </div>
  );
};
