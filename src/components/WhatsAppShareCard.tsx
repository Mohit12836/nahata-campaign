'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Share2,
  Users,
  Flame,
  Trophy,
  ArrowRight,
} from 'lucide-react';
import { getNahataWhatsAppClaimUrl, getNahataShareUrl } from '@/lib/whatsapp';
import { Coupon, Campaign } from '@/types';

interface WhatsAppShareCardProps {
  coupon: Coupon;
  campaign: Campaign;
  onMilestoneReached?: () => void;
}

export const WhatsAppShareCard: React.FC<WhatsAppShareCardProps> = ({
  coupon,
  campaign,
  onMilestoneReached,
}) => {
  const [shareCount, setShareCount] = useState<number>(0);

  const handleShareClick = () => {
    const nextCount = Math.min(shareCount + 1, 5);
    setShareCount(nextCount);
    if (nextCount === 5 && onMilestoneReached) {
      onMilestoneReached();
    }
  };

  const whatsappClaimUrl = getNahataWhatsAppClaimUrl({
    whatsappNumber: campaign.whatsapp_number,
    customerName: coupon.customer?.full_name || 'ग्राहक',
    customerPhone: coupon.customer?.phone || '',
    couponCode: coupon.code,
    prizeTitle: coupon.prize?.title || 'विशेष ऑफर',
    terms: coupon.prize?.terms_and_conditions,
    storeName: campaign.store_name,
  });

  const viralShareUrl = getNahataShareUrl(
    campaign.title,
    coupon.prize?.title,
    typeof window !== 'undefined' ? window.location.origin : undefined
  );

  return (
    <div className="w-full max-w-sm mx-auto space-y-2.5 select-none animate-in fade-in zoom-in-95 duration-300">
      {/* 1. Direct WhatsApp Confirmation to Manoj Ji */}
      <a
        href={whatsappClaimUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3 px-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2 active:scale-98 transition-all text-center"
      >
        <MessageSquare className="w-4 h-4 fill-current shrink-0" />
        <span>मनोज जी को WhatsApp पर भेजें & कन्फर्म करें</span>
      </a>

      {/* 2. Viral Share Mission Engine */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#26030A] via-[#35050D] to-[#170104] border border-[#FFC857]/40 space-y-2 shadow-xl">
        <div className="flex items-center justify-between text-[11px] font-black">
          <span className="text-[#FFC857] flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>5-WhatsApp शेयर मिशन</span>
          </span>
          <span className="text-[#FFF4D8]">{shareCount} / 5 शेयर</span>
        </div>

        <p className="text-[10px] text-[#FFF4D8]/90 leading-tight">
          5 दोस्तों या पारिवारिक ग्रुप में शेयर करें & पाएं <strong>₹50 अतिरिक्त VIP बोनस</strong>!
        </p>

        {/* Share Progress Bar */}
        <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-[#FFC857]/30">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#FFB020] via-[#FFC857] to-[#FFB020] transition-all duration-300"
            style={{ width: `${(shareCount / 5) * 100}%` }}
          />
        </div>

        {shareCount < 5 ? (
          <a
            href={viralShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleShareClick}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#FFC857] to-[#FFB020] hover:from-[#FFB020] text-[#26030A] font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
          >
            <Share2 className="w-3.5 h-3.5 shrink-0" />
            <span>WhatsApp पर शेयर करें ({5 - shareCount} बाकी)</span>
          </a>
        ) : (
          <div className="p-2.5 rounded-xl bg-[#17864B]/30 border border-[#17864B] text-emerald-300 text-[11px] font-black flex items-center gap-2 animate-in zoom-in-95">
            <Trophy className="w-5 h-5 text-[#FFC857] shrink-0" />
            <div>
              <p className="text-white font-black">🏆 ₹50 VIP बोनस अनलॉक!</p>
              <p className="text-[10px] text-emerald-200 font-normal">
                बिलिंग के समय दुकान काउंटर पर यह स्क्रीन दिखाएं।
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. VIP WhatsApp Community Link (when configured) */}
      {campaign.whatsapp_community_link && (
        <a
          href={campaign.whatsapp_community_link}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#5B0716] to-[#86152B] hover:from-[#86152B] text-[#FFF4D8] font-bold text-xs flex items-center justify-center gap-2 border border-[#FFC857]/30 shadow-md active:scale-98 transition-all text-center"
        >
          <Users className="w-3.5 h-3.5 text-[#FFC857] shrink-0" />
          <span>VIP WhatsApp कम्युनिटी से जुड़ें (दैनिक नए ऑफर)</span>
          <ArrowRight className="w-3 h-3 text-[#FFC857]" />
        </a>
      )}
    </div>
  );
};
