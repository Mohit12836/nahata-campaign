'use client';

import React, { useState, useEffect } from 'react';
import { Campaign, Coupon } from '@/types';
import {
  MessageSquare,
  ArrowRight,
  Sparkles,
  Share2,
  Lock,
  Unlock,
  AlertTriangle,
  Users,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '@/lib/audio';
import { getNahataShareUrl } from '@/lib/whatsapp';

interface WeeklySaleClubStepProps {
  campaign: Campaign;
  coupon: Coupon;
  onContinue: () => void;
}

const REQUIRED_SHARES = 5;

export const WeeklySaleClubStep: React.FC<WeeklySaleClubStepProps> = ({
  campaign,
  coupon,
  onContinue,
}) => {
  const [shareCount, setShareCount] = useState<number>(0);
  const [hasFollowedChannel, setHasFollowedChannel] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Restore share state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedShares = parseInt(localStorage.getItem(`nahata_shares_${coupon.code}`) || '0', 10);
        const savedFollow = localStorage.getItem(`nahata_channel_followed_${coupon.code}`) === 'true';
        if (!isNaN(savedShares) && savedShares > 0) setShareCount(savedShares);
        if (savedFollow) setHasFollowedChannel(true);
      } catch {}
    }
  }, [coupon.code]);

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nahata-campaign.vercel.app';
  const referralLink = `${originUrl}/store/${campaign.slug || 'nahata'}?ref=${coupon.code}`;
  const shareTextUrl = getNahataShareUrl(
    coupon.customer?.full_name || campaign.title,
    coupon.prize?.title,
    referralLink
  );

  const triggerShake = () => {
    setIsShaking(true);
    try {
      soundEngine.playTick();
    } catch {}
    setTimeout(() => setIsShaking(false), 600);
  };

  const handleShareClick = () => {
    const nextCount = Math.min(REQUIRED_SHARES, shareCount + 1);
    setShareCount(nextCount);
    setNotice(null);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`nahata_shares_${coupon.code}`, nextCount.toString());
      } catch {}
    }

    try {
      soundEngine.playCelebrationChime();
      if (nextCount >= REQUIRED_SHARES) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFC857', '#17864B', '#FFB020', '#FFFFFF', '#86152B'],
        });
      }
    } catch {}
  };

  const handleFollowChannelClick = () => {
    setHasFollowedChannel(true);
    setNotice(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`nahata_channel_followed_${coupon.code}`, 'true');
      } catch {}
    }
    try {
      soundEngine.playCelebrationChime();
    } catch {}
  };

  const isShareComplete = shareCount >= REQUIRED_SHARES;
  const isAllComplete = isShareComplete && hasFollowedChannel;

  const handleNextClick = () => {
    if (!isShareComplete) {
      triggerShake();
      setNotice(`⚠️ कूपन अनलॉक करने के लिए कम से कम 5 WhatsApp ग्रुप/मित्रों में शेयर करना अनिवार्य है! (अभी ${shareCount}/${REQUIRED_SHARES} पूर्ण)`);
      return;
    }
    if (!hasFollowedChannel) {
      triggerShake();
      setNotice('⚠️ कृपया नाहाटा जनरल स्टोर्स के WhatsApp चैनल लिंक पर क्लिक करके फॉलो करें!');
      return;
    }
    try {
      soundEngine.playCelebrationChime();
    } catch {}
    onContinue();
  };

  // Official WhatsApp Channel Link
  const channelLink = campaign.whatsapp_community_link || 'https://whatsapp.com/channel/0029VbDurpqA89MoAcdMYw3T';

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col justify-between select-none animate-in fade-in zoom-in-95 duration-300 py-1 space-y-2.5">
      {/* Top Greeting Badge */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-red-950/90 via-[#3d0612] to-amber-950/90 border border-amber-400/50 text-center space-y-1 shadow-lg">
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/15 px-2.5 py-0.5 rounded-full border border-amber-400/30">
          चरण 2: 5 ग्रुप शेयर & चैनल जॉइन
        </span>
        <h3 className="text-sm sm:text-base font-black text-white leading-tight">
          बधाई {coupon.customer?.full_name || 'ग्राहक'} जी! 🎉
        </h3>
        <p className="text-[11px] text-amber-200/90 leading-tight font-medium">
          आपका लकी इनाम: <strong className="text-yellow-300 underline">{coupon.prize?.title}</strong>
        </p>
      </div>

      {/* Requirement 1: 5 Groups Share (COMPULSORY) */}
      <div className="p-3 rounded-2xl bg-gradient-to-b from-[#26030A] via-[#35050D] to-black border-2 border-amber-400 shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">
            <Share2 className="w-3 h-3 text-amber-950" />
            <span>शर्त 1: 5 ग्रुप शेयर अनिवार्य</span>
          </span>
          <span className={`text-[11px] font-black ${isShareComplete ? 'text-emerald-400' : 'text-amber-300'}`}>
            {shareCount} / {REQUIRED_SHARES} शेयर {isShareComplete ? '✅' : '🔒'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-black/70 rounded-full h-2.5 p-0.5 border border-amber-500/40 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isShareComplete
                ? 'bg-gradient-to-r from-emerald-400 to-teal-300'
                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-400'
            }`}
            style={{ width: `${Math.max(6, (shareCount / REQUIRED_SHARES) * 100)}%` }}
          />
        </div>

        <p className="text-[10.5px] text-amber-100/90 leading-tight font-medium">
          कूपन सक्रिय करने के लिए <strong className="text-amber-300">5 WhatsApp ग्रुप या मित्रों</strong> को यह ऑफर शेयर करना <strong>अनिवार्य</strong> है।
        </p>

        <a
          href={shareTextUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleShareClick}
          className={`w-full py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 text-center ${
            isShareComplete
              ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-500/50'
              : 'bg-gradient-to-r from-[#25D366] via-emerald-500 to-[#128C7E] hover:from-[#20bd5a] hover:to-emerald-600 text-white border border-emerald-300 animate-pulse'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>
            {isShareComplete
              ? '5 ग्रुप शेयर पूर्ण हो चुके हैं ✓'
              : `व्हाट्सएप ग्रुप पर शेयर करें (${shareCount}/${REQUIRED_SHARES}) ➔`}
          </span>
        </a>
      </div>

      {/* Requirement 2: Follow Official WhatsApp Channel */}
      <div className="p-3 rounded-2xl bg-gradient-to-b from-[#1a0509] via-[#2d050f] to-black border-2 border-emerald-400/80 shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950">
            <Users className="w-3 h-3 text-emerald-950" />
            <span>शर्त 2: व्हाट्सएप चैनल फॉलो करें</span>
          </span>
          <span className={`text-[10px] font-black ${hasFollowedChannel ? 'text-emerald-400' : 'text-amber-300'}`}>
            {hasFollowedChannel ? 'फॉलो किया ✅' : 'बाकी है 🔒'}
          </span>
        </div>

        <p className="text-[10.5px] text-emerald-100/90 leading-tight font-medium">
          मनोज भैया के <strong className="text-emerald-300">नाहाटा जनरल स्टोर्स आधिकारिक WhatsApp चैनल</strong> को फॉलो करें ताकि साप्ताहिक ऑफर्स व ड्रॉ का रिजल्ट मिले।
        </p>

        <a
          href={channelLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleFollowChannelClick}
          className={`w-full py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 text-center ${
            hasFollowedChannel
              ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-500/50'
              : 'bg-gradient-to-r from-[#25D366] via-emerald-500 to-[#128C7E] hover:from-[#20bd5a] hover:to-emerald-600 text-white border-2 border-emerald-300 shadow-emerald-500/20'
          }`}
        >
          <MessageSquare className="w-4 h-4 fill-current" />
          <span>
            {hasFollowedChannel
              ? 'चैनल फॉलो लिंक खोला गया ✓'
              : '📢 WhatsApp चैनल लिंक खोलें & फॉलो करें ➔'}
          </span>
        </a>
      </div>

      {/* Notice display if user clicks locked button */}
      {notice && (
        <div className="p-2 rounded-xl bg-red-950/90 border border-red-500 text-red-200 text-[11px] font-bold text-center flex items-center justify-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Unlock / Proceed CTA */}
      <button
        type="button"
        onClick={handleNextClick}
        className={`w-full py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl active:scale-98 transition-all text-center ${
          isAllComplete
            ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 border-2 border-yellow-200 animate-bounce'
            : `bg-slate-900/90 border-2 border-dashed border-slate-700 text-slate-400 cursor-not-allowed ${
                isShaking ? 'border-red-500 text-red-300 bg-red-950/40' : ''
              }`
        }`}
      >
        {isAllComplete ? (
          <>
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>शर्तें पूरी! कूपन देखें व मनोज भैया को भेजें ➔</span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 text-amber-400" />
            <span>🔒 कूपन अनलॉक करने हेतु दोनों शर्तें पूरी करें</span>
          </>
        )}
      </button>
    </div>
  );
};
