import React from 'react';
import { ShieldCheck, Gift, Clock, PhoneCall, MapPin, Store } from 'lucide-react';
import { Campaign } from '@/types';

interface TrustBadgesProps {
  campaign: Campaign;
}

export const TrustBadges: React.FC<TrustBadgesProps> = ({ campaign }) => {
  return (
    <div className="w-full max-w-md mx-auto space-y-4 pt-4 select-none">
      {/* 3 Guarantee Pillars */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/20 backdrop-blur-sm">
          <div className="w-7 h-7 mx-auto mb-1 rounded-full bg-amber-500/20 text-yellow-300 flex items-center justify-center">
            <Gift className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-amber-200 block">100% पक्का इनाम</span>
          <span className="text-[9px] text-amber-300/70">हर स्क्रैच पर</span>
        </div>

        <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/20 backdrop-blur-sm">
          <div className="w-7 h-7 mx-auto mb-1 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-amber-200 block">असली स्टोर</span>
          <span className="text-[9px] text-amber-300/70">प्रमाणित डिस्काउंट</span>
        </div>

        <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/20 backdrop-blur-sm">
          <div className="w-7 h-7 mx-auto mb-1 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-amber-200 block">7 दिन वैधता</span>
          <span className="text-[9px] text-amber-300/70">काउंटर पर रिडीम</span>
        </div>
      </div>

      {/* Store Location Card */}
      <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/30 backdrop-blur-md text-amber-100 flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-amber-500/20 text-yellow-300 shrink-0">
          <Store className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <h4 className="font-extrabold text-amber-200 text-sm">
            {campaign.store_name}
          </h4>
          <p className="text-amber-300/80 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>{campaign.location}</span>
          </p>
          <div className="pt-1 flex items-center gap-3">
            <a
              href={`tel:+${campaign.whatsapp_number}`}
              className="inline-flex items-center gap-1 font-bold text-emerald-400 hover:text-emerald-300"
            >
              <PhoneCall className="w-3 h-3" /> संपर्क: +{campaign.whatsapp_number}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
