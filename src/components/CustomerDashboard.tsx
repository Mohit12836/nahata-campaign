'use client';

import React from 'react';
import { Campaign, Coupon, Customer } from '@/types';
import {
  Sparkles,
  Gift,
  QrCode,
  MapPin,
  Calendar,
  LogOut,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { soundEngine } from '@/lib/audio';
import { logoutCustomerAction } from '@/app/actions/campaign';

interface CustomerDashboardProps {
  campaign: Campaign;
  coupon: Coupon;
  customer?: Customer;
  onLogout?: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  campaign,
  coupon,
  customer = coupon.customer,
  onLogout,
}) => {
  const isRedeemed = coupon.status === 'redeemed';
  const nextCoupon = coupon.next_purchase_coupon;

  const handleLogoutClick = async () => {
    try {
      soundEngine.playTick();
      await logoutCustomerAction();
    } catch {}
    if (onLogout) {
      onLogout();
    } else {
      window.location.reload();
    }
  };

  const formattedExpiry = new Date(coupon.expires_at).toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="w-full max-w-md mx-auto space-y-4 animate-in fade-in duration-300 select-none pb-6">
      {/* Top Header Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 border border-amber-500/40 text-white shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">👤</span>
            <div>
              <h3 className="text-sm sm:text-base font-black text-amber-100">
                {customer?.full_name || 'ग्राहक'} का रिवॉर्ड वॉलेट
              </h3>
              <p className="text-[10px] text-amber-300/80">
                {customer?.phone ? `+91 ${customer.phone}` : 'सत्यापित प्रोफ़ाइल'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogoutClick}
            className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] font-bold border border-white/10 flex items-center gap-1 transition-colors"
          >
            <LogOut className="w-3 h-3" />
            <span>लॉगआउट</span>
          </button>
        </div>

        {/* Demo Notice Banner */}
        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-200/90 leading-tight">
          ℹ️ <strong>डेमो मोड:</strong> आपका खाता व कूपन सुरक्षित कुकी सत्र में सक्रिय है। (Supabase क्लाउड DB कनेक्ट होने पर यह ऑटो-सिंक होगा)।
        </div>
      </div>

      {/* Active Reward Pass Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-b from-[#26030A] via-[#3d0612] to-black border-2 border-amber-400/80 shadow-2xl space-y-4 text-white relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/30">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-amber-400" />
            <h4 className="font-black text-xs sm:text-sm text-amber-200 uppercase tracking-wide">
              सक्रिय रिवॉर्ड पास (Active Reward Pass)
            </h4>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
              isRedeemed
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {isRedeemed ? '✓ रिडीम हो चुका' : '● वैध (Active)'}
          </span>
        </div>

        {/* Reward Details */}
        <div className="space-y-1">
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
            जीता हुआ इनाम
          </span>
          <h3 className="text-lg font-black text-white leading-tight">
            {coupon.prize?.title}
          </h3>
          <p className="text-[11px] text-slate-300">
            {coupon.prize?.terms_and_conditions}
          </p>
        </div>

        {/* Coupon Code Block */}
        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-center space-y-1">
          <span className="text-[9.5px] uppercase font-bold text-amber-300/80 block">
            काउंटर कूपन कोड
          </span>
          <span className="text-xl sm:text-2xl font-mono font-black text-amber-300 tracking-wider block">
            {coupon.code}
          </span>
          <span className="text-[10px] text-slate-400 block">
            वैधता: {formattedExpiry} तक • {campaign.location}
          </span>
        </div>

        {/* Store Verification Note */}
        <div className="flex items-center justify-between text-[11px] text-amber-200/90 pt-1 border-t border-white/10">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>दुकान समय: सुबह 9 से रात 9</span>
          </span>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Nahata+General+Stores+Bus+Stand+Road+Kushalgarh+Banswara+Rajasthan"
            target="_blank"
            rel="noreferrer"
            className="text-amber-400 underline font-bold hover:text-white transition-colors"
          >
            नक्शा ↗
          </a>
        </div>
      </div>

      {/* Next Purchase Coupon (Only after redemption) */}
      {nextCoupon && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-400 shadow-2xl space-y-2.5 animate-in zoom-in-95 text-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>अगली खरीद का नया कूपन (Next Coupon)</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-400">
              अगले Weekly Sale पर मान्य
            </span>
          </div>

          <div className="bg-white/10 p-3 rounded-2xl border border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-base font-black text-emerald-200 font-mono">
                {nextCoupon.code}
              </span>
              <span className="text-[10px] text-emerald-300 font-bold">
                ₹{nextCoupon.min_order_value} की खरीद पर
              </span>
            </div>
            <p className="text-xs font-bold text-white">
              {nextCoupon.discount_text}
            </p>
            <p className="text-[10px] text-emerald-200/80">
              वैधता: {new Date(nextCoupon.valid_until).toLocaleDateString('hi-IN')} तक
            </p>
          </div>
        </div>
      )}

      {/* Weekly Sale Community Banner */}
      <div className="p-4 rounded-3xl bg-black/60 border border-amber-500/30 space-y-2.5 text-white">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>साप्ताहिक महा-बचत सेल क्लब</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-bold">
            ● कुशलगढ़ लाइव
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          हर हफ्ते नाहाटा जनरल स्टोर्स पर विशेष डिस्काउंट और लकी ड्रॉ आयोजित होते हैं। नए ऑफर्स की सूचना सीधे व्हाट्सएप पर पाएं।
        </p>
        <a
          href={campaign.whatsapp_community_link || 'https://chat.whatsapp.com/invite/nahatageneralstores'}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors text-center"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Weekly Sale ग्रुप में जुड़े रहें</span>
        </a>
      </div>
    </div>
  );
};
