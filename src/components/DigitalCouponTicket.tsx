'use client';

import React, { useState } from 'react';
import { Store, Copy, Check, Calendar, User, ShieldCheck } from 'lucide-react';
import { Coupon, Campaign } from '@/types';

interface DigitalCouponTicketProps {
  coupon: Coupon;
  campaign: Campaign;
}

export const DigitalCouponTicket: React.FC<DigitalCouponTicketProps> = ({
  coupon,
  campaign,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const formattedExpiry = new Date(coupon.expires_at).toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="w-full max-w-sm mx-auto select-none animate-in fade-in zoom-in-95 duration-300">
      {/* Outer Golden Border Envelope */}
      <div className="relative rounded-2xl bg-gradient-to-br from-[#FFD700] via-[#FFB020] to-[#E5A800] p-1 shadow-2xl">
        <div className="bg-[#FFFDF7] text-[#26030A] rounded-[14px] p-3.5 relative overflow-hidden border border-[#FFD700]">
          {/* Ticket Perforation Notches on Left & Right */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#3B020B] border border-[#FFD700]/50 shadow-inner" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#3B020B] border border-[#FFD700]/50 shadow-inner" />

          {/* Top Brand Banner with Store Logo & Manoj Bhaiya */}
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-dashed border-[#5B0716]/30">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-sm shrink-0 bg-[#26030A]">
              <img
                src="/nahata-logo.jpg"
                alt="नाहाटा जनरल स्टोर्स"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-[#5B0716] text-[#FFD700]">
                🚩 नवरात्रि स्पेशल कूपन पास
              </span>
              <h3 className="text-sm font-black text-[#5B0716] truncate">
                {campaign.store_name}
              </h3>
              <p className="text-[10px] text-gray-700 font-semibold truncate">
                बस स्टैंड रोड, कुशलगढ़ (राजस्थान)
              </p>
            </div>

            <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-sm shrink-0 bg-[#26030A]" title="श्री मनोज भैया">
              <img
                src="/manoj-nahata.jpg"
                alt="मनोज भैया"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Offer Title & Highlight */}
          <div className="mt-2.5 p-2 rounded-xl bg-gradient-to-r from-[#5B0716] via-[#86152B] to-[#5B0716] text-[#FFF4D8] text-center shadow-xs">
            <span className="text-[9px] font-black text-[#FFD700] uppercase tracking-wider block">
              ✨ आपका पक्का लकी ड्रॉ उपहार
            </span>
            <h4 className="text-sm sm:text-base font-black text-white mt-0.5 leading-tight">
              {coupon.prize?.title || '🎁 निश्चित स्पेशल गिफ्ट हैम्पर (खरीदारी पर)'}
            </h4>
            <p className="text-[10px] text-amber-200 mt-1 font-medium leading-tight">
              (दुकान जाकर खरीदारी करने पर गिफ्ट हैम्पर खुलेगा!)
            </p>
          </div>

          {/* Unique Coupon Code Display */}
          <div className="my-2.5 p-2 rounded-xl bg-amber-50 border-2 border-dashed border-[#86152B] text-center shadow-xs">
            <span className="text-[9px] font-black text-[#86152B] uppercase tracking-widest block">
              आपका आधिकारिक कूपन कोड
            </span>
            <div className="flex items-center justify-center gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-mono font-black text-[#5B0716] tracking-wider select-all">
                {coupon.code}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg bg-[#FFD700] hover:bg-[#FFB020] text-[#26030A] transition-transform active:scale-90 font-bold"
                title="कोड कॉपी करें"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-[#17864B]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            {copied && (
              <span className="text-[10px] text-[#17864B] font-bold block mt-0.5 animate-in fade-in">
                ✓ कूपन कोड क्लिपबोर्ड पर कॉपी हो गया!
              </span>
            )}
          </div>

          {/* Customer & Expiry Meta */}
          <div className="flex justify-between items-center text-[11px] text-gray-800 px-1 py-1 bg-amber-100/60 rounded-lg">
            <span className="flex items-center gap-1 font-bold text-[#5B0716]">
              <User className="w-3.5 h-3.5 text-[#86152B]" />
              <span>{coupon.customer?.full_name || 'मान्य ग्राहक'}</span>
            </span>
            <span className="flex items-center gap-1 font-black text-[#86152B]">
              <Calendar className="w-3.5 h-3.5" />
              <span>वैधता: {formattedExpiry} तक</span>
            </span>
          </div>

          {/* Counter Redemption Instructions */}
          <div className="mt-2 pt-2 border-t border-dashed border-[#5B0716]/30 text-[10px] text-[#26030A] space-y-0.5 bg-yellow-50/50 p-1.5 rounded-lg">
            <div className="flex items-center gap-1 font-bold text-[#5B0716]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#17864B]" />
              <span>रिडीम करने का आसान तरीका:</span>
            </div>
            <p>1. नीचे दिए बटन से मनोज भैया को WhatsApp करें या दुकान पर यह स्क्रीन दिखाएं।</p>
            <p>2. खरीदारी करने पर अपना गिफ्ट हैम्पर और महा-बचत डिस्काउंट प्राप्त करें।</p>
          </div>
        </div>
      </div>
    </div>
  );
};
