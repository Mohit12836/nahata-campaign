'use client';

import React from 'react';
import { Campaign, Coupon } from '@/types';
import {
  MessageSquare,
  ArrowRight,
  Sparkles,
  Calendar,
  Gift,
  Clock,
  ShieldAlert,
} from 'lucide-react';

interface WeeklySaleClubStepProps {
  campaign: Campaign;
  coupon: Coupon;
  onContinue: () => void;
}

export const WeeklySaleClubStep: React.FC<WeeklySaleClubStepProps> = ({
  campaign,
  coupon,
  onContinue,
}) => {
  const [hasClickedGroup, setHasClickedGroup] = React.useState(false);

  const handleGroupClick = () => {
    setHasClickedGroup(true);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4 animate-in fade-in zoom-in-95 duration-300 select-none pb-4">
      {/* Top Welcome Notification */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-red-950/90 via-slate-900 to-amber-950/90 border border-amber-500/40 text-center space-y-1.5 shadow-xl">
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
          चरण 2: क्लब आमंत्रण • STEP 2
        </span>
        <h3 className="text-base sm:text-lg font-black text-white">
          बधाई {coupon.customer?.full_name || 'ग्राहक'} जी! 🎉
        </h3>
        <p className="text-xs text-amber-200/90 leading-relaxed font-medium">
          आपका इनाम सुरक्षित कर लिया गया है। अब साप्ताहिक महा-बचत सेल क्लब में शामिल हों।
        </p>
      </div>

      {/* Main Club Showcase Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-b from-[#26030A] via-[#3d0612] to-black border-2 border-amber-400/80 shadow-2xl space-y-4 text-white relative overflow-hidden">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/30">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛍️</span>
            <div>
              <h4 className="font-black text-sm sm:text-base text-amber-100">
                साप्ताहिक सेल & रिडेम्पशन क्लब
              </h4>
              <p className="text-[10px] text-amber-300/80">
                {campaign.store_name} • कुशलगढ़
              </p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/40">
            सक्रिय क्लब
          </span>
        </div>

        {/* Club Privileges List */}
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10">
            <Calendar className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-200 block text-[11px]">वीकली सेल शेड्यूल:</strong>
              <span className="text-[10.5px] text-slate-300">
                हर सप्ताह महा-बचत के दिन और समय की पहली सूचना इसी ग्रुप में मिलेगी।
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10">
            <Gift className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-300 block text-[11px]">नए डिस्काउंट कूपन:</strong>
              <span className="text-[10.5px] text-slate-300">
                हर खरीद के बाद अगला विशेष कूपन केवल ग्रुप सदस्यों को जारी होता है।
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10">
            <Clock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-rose-300 block text-[11px]">हैम्पर लकी ड्रॉ अलर्ट:</strong>
              <span className="text-[10.5px] text-slate-300">
                त्योहारी बम्पर ड्रॉ के विजेता और स्पेशल गिफ्ट्स की लाइव घोषणा।
              </span>
            </div>
          </div>
        </div>

        {/* Action Button: WhatsApp Join */}
        <a
          href={campaign.whatsapp_community_link || 'https://chat.whatsapp.com/invite/nahatageneralstores'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleGroupClick}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#25D366] via-emerald-500 to-[#128C7E] hover:from-[#20bd5a] hover:to-emerald-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 active:scale-98 transition-all border border-emerald-300/60 text-center"
        >
          <MessageSquare className="w-4 h-4 fill-current" />
          <span>Weekly Sale WhatsApp ग्रुप से जुड़ें ➔</span>
        </a>

        {/* Honest Status Disclaimer */}
        <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/20 text-[10px] text-slate-300 flex items-start gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {hasClickedGroup ? (
              <span className="text-emerald-300 font-medium">
                ✓ ग्रुप आमंत्रण खोला गया। (ध्यान दें: WhatsApp सदस्यता का अंतिम सत्यापन काउंटर पर होगा)
              </span>
            ) : (
              <span>
                स्थिति: <strong>पेंडिंग</strong> (लिंक खोलकर ग्रुप जॉइन करें। बिना सत्यापन किसी सदस्यता का झूठा दावा नहीं किया जाता।)
              </span>
            )}
          </p>
        </div>

        {/* Continue Button to Next Step */}
        <button
          type="button"
          onClick={onContinue}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>आगे बढ़ें: अपना रिवॉर्ड कूपन देखें</span>
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </button>
      </div>
    </div>
  );
};
