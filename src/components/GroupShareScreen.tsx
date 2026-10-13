'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Share2, Users, Radio, ExternalLink, Lock, Unlock, ChevronRight } from 'lucide-react';
import { soundEngine } from '@/lib/audio';
import { Coupon, Campaign } from '@/types';

interface GroupShareScreenProps {
  coupon: Coupon;
  campaign: Campaign;
  onUnlocked: () => void; // called when all 5 shares done
}

const REQUIRED_SHARES = 5;
const WHATSAPP_CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbDurpqA89MoAcdMYw3T';

// 5 WhatsApp groups - first 2 are real, remaining 3 if group link not working → channel follow
const GROUPS = [
  { id: 1, name: 'नाहाटा ग्राहक ग्रुप 1', type: 'group' as const },
  { id: 2, name: 'नाहाटा ग्राहक ग्रुप 2', type: 'group' as const },
  { id: 3, name: 'नाहाटा ग्राहक ग्रुप 3', type: 'group' as const },
  { id: 4, name: 'नाहाटा ग्राहक ग्रुप 4', type: 'group' as const },
  { id: 5, name: 'नाहाटा ग्राहक ग्रुप 5', type: 'group' as const },
];

export const GroupShareScreen: React.FC<GroupShareScreenProps> = ({ coupon, campaign, onUnlocked }) => {
  const [sharedGroups, setSharedGroups] = useState<number[]>([]);
  const [channelFollowed, setChannelFollowed] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showChannelHint, setShowChannelHint] = useState(false);

  // Restore from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`nahata_shares_${coupon.code}`);
      if (stored) setSharedGroups(JSON.parse(stored));
      const ch = localStorage.getItem(`nahata_channel_${coupon.code}`);
      if (ch === 'true') setChannelFollowed(true);
    } catch {}
  }, [coupon.code]);

  const totalDone = sharedGroups.length + (channelFollowed ? 1 : 0);
  const allDone = totalDone >= REQUIRED_SHARES;

  const shareText = encodeURIComponent(
    `🎉 नाहाटा जनरल स्टोर्स से मुझे मिला *${coupon.prize?.title || 'विशेष ऑफर'}*!\n\n` +
    `🏪 *${campaign.store_name}*\n` +
    `📍 बस स्टैंड रोड, कुशलगढ़\n\n` +
    `आप भी खरीदारी करें और पाएँ शानदार इनाम! 🎁\n` +
    `👉 ${typeof window !== 'undefined' ? window.location.origin : 'https://nahata-general-stores.vercel.app'}`
  );

  const handleGroupShare = (groupId: number) => {
    if (sharedGroups.includes(groupId)) return;

    // Open WhatsApp share
    window.open(`https://wa.me/?text=${shareText}`, '_blank');

    setTimeout(() => {
      const newShared = [...sharedGroups, groupId];
      setSharedGroups(newShared);
      try {
        localStorage.setItem(`nahata_shares_${coupon.code}`, JSON.stringify(newShared));
      } catch {}
      try {
        soundEngine.playFestiveBell();
      } catch {}

      if (newShared.length === REQUIRED_SHARES) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 }, colors: ['#FFC857', '#17864B', '#86152B', '#fff'] });
      }

      // After 2 shares, show channel hint
      if (newShared.length >= 2) setShowChannelHint(true);
    }, 500);
  };

  const handleChannelFollow = () => {
    window.open(WHATSAPP_CHANNEL_LINK, '_blank');
    setTimeout(() => {
      setChannelFollowed(true);
      try {
        localStorage.setItem(`nahata_channel_${coupon.code}`, 'true');
        soundEngine.playFestiveBell();
      } catch {}
    }, 500);
  };

  const handleUnlockCoupon = () => {
    if (!allDone) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
      return;
    }
    onUnlocked();
  };

  const effectiveDone = Math.min(sharedGroups.length + (channelFollowed ? 1 : 0), REQUIRED_SHARES);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col h-[100dvh] overflow-hidden bg-gradient-to-b from-[#26030A] via-[#35050D] to-[#120104]">

      {/* ── TOP HEADER ── */}
      <div className="shrink-0 px-4 pt-4 pb-2 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/40 text-amber-300 text-[11px] font-black uppercase tracking-wider mb-2">
          <Share2 className="w-3.5 h-3.5" />
          अनिवार्य शेयर (REQUIRED)
        </div>
        <h2 className="text-base font-black text-[#FFF4D8] leading-tight">
          🎉 बधाई! आपका इनाम तैयार है
        </h2>
        <p className="text-[11px] text-amber-200/80 mt-1 leading-snug">
          कूपन खोलने के लिए नीचे दिए&nbsp;
          <strong className="text-amber-300">5 ग्रुप में शेयर करें</strong>
        </p>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div className="shrink-0 px-4 pb-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-amber-300">प्रगति</span>
          <span className="text-[11px] font-black text-amber-400">{effectiveDone}/{REQUIRED_SHARES} शेयर</span>
        </div>
        <div className="w-full h-3 rounded-full bg-black/50 border border-amber-500/30 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 transition-all duration-500"
            style={{ width: `${(effectiveDone / REQUIRED_SHARES) * 100}%` }}
          />
        </div>
        {allDone && (
          <p className="text-center text-[11px] font-black text-emerald-400 mt-1 animate-pulse">
            ✅ सभी शेयर पूरे! नीचे &quot;कूपन खोलें&quot; दबाएँ
          </p>
        )}
      </div>

      {/* ── SCROLLABLE GROUP LIST ── */}
      <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-2">

        {GROUPS.map((group, idx) => {
          const done = sharedGroups.includes(group.id);
          const isNext = !done && sharedGroups.length === idx;
          return (
            <div
              key={group.id}
              className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                done
                  ? 'bg-emerald-950/60 border-emerald-500/60'
                  : isNext
                  ? 'bg-amber-950/60 border-amber-400/80 shadow-lg shadow-amber-500/10'
                  : 'bg-black/40 border-white/10 opacity-60'
              }`}
            >
              {/* Icon */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                done ? 'bg-emerald-500' : isNext ? 'bg-amber-400' : 'bg-white/10'
              }`}>
                {done
                  ? <CheckCircle2 className="w-5 h-5 text-white" />
                  : <Users className="w-4.5 h-4.5 text-slate-900" />
                }
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-black leading-tight ${done ? 'text-emerald-300' : 'text-[#FFF4D8]'}`}>
                  ग्रुप {group.id} में शेयर
                </p>
                <p className="text-[10px] text-white/50 leading-tight">
                  {done ? '✓ शेयर हो गया' : isNext ? 'अभी शेयर करें' : 'प्रतीक्षा में'}
                </p>
              </div>

              {/* Button */}
              {!done && (
                <button
                  onClick={() => handleGroupShare(group.id)}
                  disabled={!isNext}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all ${
                    isNext
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 shadow active:scale-95'
                      : 'bg-white/10 text-white/30 cursor-not-allowed'
                  }`}
                >
                  <Share2 className="w-3 h-3" />
                  शेयर
                </button>
              )}
            </div>
          );
        })}

        {/* ── CHANNEL FOLLOW (alternative if group link not working) ── */}
        <div className={`transition-all duration-500 ${showChannelHint ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="p-3 rounded-2xl border border-[#FFC857]/40 bg-[#FFC857]/5 space-y-2">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-[11px] font-black text-amber-300">
                ग्रुप लिंक काम नहीं कर रही?
              </p>
            </div>
            <p className="text-[10px] text-white/60 leading-snug pl-6">
              नीचे WhatsApp <strong className="text-amber-300">Channel Follow</strong> करें — यह भी एक शेयर गिना जाएगा
            </p>
            {!channelFollowed ? (
              <button
                onClick={handleChannelFollow}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white text-[12px] font-black shadow active:scale-95 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                नाहाटा WhatsApp Channel Follow करें
              </button>
            ) : (
              <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-emerald-900/60 border border-emerald-500/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px] font-black text-emerald-300">Channel Follow हो गया ✅</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BOTTOM CTA ── */}
      <div className={`shrink-0 px-4 pb-5 pt-3 border-t border-white/10 ${isShaking ? 'animate-bounce' : ''}`}>
        {allDone ? (
          <button
            onClick={handleUnlockCoupon}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-900 font-black text-base flex items-center justify-center gap-2 shadow-2xl shadow-amber-500/40 active:scale-95 transition-all"
          >
            <Unlock className="w-5 h-5" />
            🎁 कूपन खोलें!
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleUnlockCoupon}
            className="w-full py-4 rounded-2xl bg-slate-800/80 border border-white/10 text-white/40 font-black text-sm flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            {REQUIRED_SHARES - effectiveDone} और शेयर बाकी — कूपन लॉक है
          </button>
        )}
        <p className="text-center text-[10px] text-white/30 mt-2">
          शेयर करने के बाद कूपन अपने आप अनलॉक होगा
        </p>
      </div>
    </div>
  );
};
