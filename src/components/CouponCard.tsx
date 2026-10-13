'use client';

import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  MessageSquare,
  Store,
  Sparkles,
  MapPin,
  PhoneCall,
  Navigation,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '@/lib/audio';
import { Coupon, Campaign } from '@/types';
import { getNahataWhatsAppClaimUrl } from '@/lib/whatsapp';

interface CouponCardProps {
  coupon: Coupon;
  campaign: Campaign;
  onOpenDashboard?: () => void;
}

export const CouponCard: React.FC<CouponCardProps> = ({ coupon, campaign, onOpenDashboard }) => {
  const [copied, setCopied] = useState(false);
  const [sentToManoj, setSentToManoj] = useState(false);

  // WhatsApp message URL for Manoj Bhaiya
  const whatsappUrl = getNahataWhatsAppClaimUrl({
    whatsappNumber: campaign.whatsapp_number || '918290447144',
    customerName: coupon.customer?.full_name || 'ग्राहक',
    customerPhone: coupon.customer?.phone || '',
    couponCode: coupon.code,
    prizeTitle: coupon.prize?.title || 'विशेष ऑफर',
    terms: coupon.prize?.terms_and_conditions,
    storeName: campaign.store_name,
  });

  // Auto-open WhatsApp to Manoj on first render (coupon reveal moment)
  useEffect(() => {
    const alreadySent = localStorage.getItem(`nahata_sent_manoj_${coupon.code}`) === 'true';
    if (!alreadySent) {
      // Small delay so the screen renders first
      const timer = setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        localStorage.setItem(`nahata_sent_manoj_${coupon.code}`, 'true');
        setSentToManoj(true);
        try {
          soundEngine.playCelebrationChime();
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 }, colors: ['#FFC857', '#17864B', '#86152B', '#fff'] });
        } catch {}
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setSentToManoj(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendManoj = () => {
    window.open(whatsappUrl, '_blank');
    setSentToManoj(true);
    localStorage.setItem(`nahata_sent_manoj_${coupon.code}`, 'true');
  };

  const formattedExpiry = new Date(coupon.expires_at).toLocaleDateString('hi-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="w-full max-w-md mx-auto flex flex-col h-[100dvh] overflow-hidden bg-gradient-to-b from-[#26030A] via-[#35050D] to-[#120104] px-4 py-4 gap-3">

      {/* ── TOP: SUCCESS HEADER ── */}
      <div className="shrink-0 text-center space-y-0.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[11px] font-black uppercase tracking-wider">
          <Sparkles className="w-3 h-3" />
          कूपन सक्रिय — इनाम आपका!
        </div>
        <h2 className="text-base font-black text-[#FFF4D8] leading-tight mt-1">
          🎉 {coupon.prize?.title}
        </h2>
      </div>

      {/* ── COUPON TICKET (compact) ── */}
      <div className="shrink-0 relative rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-[2px] shadow-2xl shadow-amber-500/30">
        <div className="bg-[#FFFDF7] rounded-[14px] px-4 py-3 relative overflow-hidden">
          {/* Notch cutouts */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-amber-500" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-amber-500" />

          {/* Store name */}
          <div className="flex items-center justify-center gap-1 mb-1">
            <Store className="w-3 h-3 text-amber-700" />
            <span className="text-[10px] font-black text-amber-800">{campaign.store_name}</span>
          </div>

          {/* Coupon code */}
          <div className="text-center py-1.5 border-y border-dashed border-amber-300/80">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">कूपन कोड</span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-mono font-black text-[#86152B] tracking-wider">
                {coupon.code}
              </span>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 transition-colors flex items-center gap-1 text-[10px] font-bold"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                {copied ? 'कॉपी!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center justify-between text-[9px] text-slate-600 mt-1.5">
            <div>
              <span className="text-slate-400 block font-bold uppercase">ग्राहक</span>
              <span className="font-bold text-slate-800 truncate block max-w-[100px]">
                {coupon.customer?.full_name || 'मान्य ग्राहक'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block font-bold uppercase">वैधता</span>
              <span className="font-bold text-[#86152B]">{formattedExpiry}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block font-bold uppercase">स्थिति</span>
              <span className="font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full text-[9px]">
                ● VALID
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SEND TO MANOJ (primary CTA) ── */}
      <div className="shrink-0 space-y-2">
        {sentToManoj ? (
          <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <p className="text-[11px] text-emerald-300 font-bold leading-tight">
              कूपन मनोज भैया को WhatsApp पर भेज दिया गया ✅<br/>
              <span className="text-emerald-400/70 font-medium">दोबारा भेजना हो तो नीचे बटन दबाएँ</span>
            </p>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-400/50 text-[11px] text-amber-300 font-bold text-center animate-pulse">
            📲 WhatsApp खुल रहा है... मनोज भैया को कूपन भेजा जा रहा है
          </div>
        )}

        <button
          onClick={handleSendManoj}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#25D366] via-emerald-500 to-[#128C7E] text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 active:scale-95 transition-all border-2 border-emerald-300/60"
        >
          <MessageSquare className="w-5 h-5 fill-current" />
          मनोज भैया को कूपन भेजें (WhatsApp)
        </button>
      </div>

      {/* ── STORE VISIT + CALL ── */}
      <div className="shrink-0 grid grid-cols-2 gap-2">
        <a
          href="https://www.google.com/maps/search/?api=1&query=Nahata+General+Stores+Bus+Stand+Road+Kushalgarh+Banswara+Rajasthan"
          target="_blank"
          rel="noopener noreferrer"
          className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 font-black text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition-all"
        >
          <Navigation className="w-3.5 h-3.5" />
          दुकान का रास्ता
        </a>
        <a
          href={`tel:${campaign.whatsapp_number?.replace(/\D/g, '').slice(-10) || '8290447144'}`}
          className="py-2.5 px-3 rounded-xl bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 font-black text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition-all"
        >
          <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
          मनोज जी से बात
        </a>
      </div>

      {/* ── TERMS ── */}
      <div className="shrink-0 px-3 py-2 rounded-xl bg-[#FFFDF7] border border-amber-300 text-[10px] text-amber-900 leading-relaxed">
        🏪 <strong>नियम:</strong> बिल बनने से पहले काउंटर पर यह कूपन कोड दिखाएं।&nbsp;
        {coupon.prize?.terms_and_conditions || 'न्यूनतम खरीद शर्त लागू।'} यह कूपन 1 ग्राहक व 1 खरीदारी पर मान्य।
      </div>

      {/* ── DASHBOARD CTA ── */}
      {onOpenDashboard && (
        <div className="shrink-0 mt-auto">
          <button
            onClick={onOpenDashboard}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
          >
            <span>🎟️ अपना कस्टमर डैशबोर्ड खोलें ➔</span>
          </button>
        </div>
      )}

      {/* Store address strip */}
      <div className="shrink-0 flex items-center justify-center gap-1.5 text-[10px] text-[#FFF4D8]/40 font-medium pb-1">
        <MapPin className="w-3 h-3" />
        <span>बस स्टैंड रोड, कुशलगढ़ (राजस्थान)</span>
      </div>
    </div>
  );
};
