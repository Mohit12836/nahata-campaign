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
      <div className="relative rounded-2xl bg-gradient-to-br from-[#FFC857] via-[#FFB020] to-[#FFC857] p-0.5 shadow-2xl">
        <div className="bg-[#FFF4D8] text-[#26030A] rounded-[14px] p-3.5 relative overflow-hidden">
          {/* Ticket Perforation Notches on Left & Right */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#5B0716] border border-[#FFC857]/40 shadow-inner" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#5B0716] border border-[#FFC857]/40 shadow-inner" />

          {/* Top Brand Banner */}
          <div className="text-center pb-2.5 border-b border-dashed border-[#5B0716]/30">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#5B0716] text-[#FFF4D8] mb-1">
              <Store className="w-3 h-3 text-[#FFC857]" /> {campaign.store_name}
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#5B0716] leading-tight">
              {coupon.prize?.title || 'विशेष डिस्काउंट वाउचर'}
            </h3>
            <p className="text-[10px] text-[#26030A]/80 mt-0.5 font-medium">
              {coupon.prize?.terms_and_conditions || 'काउंटर बिलिंग पर तुरंत मान्य'}
            </p>
          </div>

          {/* Unique Coupon Code Display */}
          <div className="my-3 p-2.5 rounded-xl bg-white border-2 border-dashed border-[#86152B] text-center shadow-xs">
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
                className="p-1.5 rounded-lg bg-[#FFC857] hover:bg-[#FFB020] text-[#26030A] transition-transform active:scale-90"
                title="कोड कॉपी करें"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-[#17864B]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
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
          <div className="flex justify-between items-center text-[10px] text-[#26030A]/70 px-1 pb-1">
            <span className="flex items-center gap-1 font-medium">
              <User className="w-3 h-3 text-[#86152B]" />
              <strong>{coupon.customer?.full_name || 'मान्य ग्राहक'}</strong>
            </span>
            <span className="flex items-center gap-1 font-bold text-[#86152B]">
              <Calendar className="w-3 h-3" />
              <span>वैधता: {formattedExpiry} तक</span>
            </span>
          </div>

          {/* Counter Redemption Instructions */}
          <div className="mt-2 pt-2 border-t border-dashed border-[#5B0716]/20 text-[10px] text-[#26030A]/80 space-y-0.5">
            <div className="flex items-center gap-1 font-bold text-[#5B0716]">
              <ShieldCheck className="w-3 h-3 text-[#17864B]" />
              <span>दुकान पर कैसे रिडीम करें:</span>
            </div>
            <p>1. बिलिंग कराने से पहले मनोज जी या काउंटर पर यह कोड दिखाएं।</p>
            <p>2. यह कूपन 1 ग्राहक व 1 खरीदारी के लिए ही मान्य है।</p>
          </div>
        </div>
      </div>
    </div>
  );
};
