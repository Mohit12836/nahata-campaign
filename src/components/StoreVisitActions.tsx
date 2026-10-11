'use client';

import React from 'react';
import { MapPin, PhoneCall, Store } from 'lucide-react';

interface StoreVisitActionsProps {
  whatsappNumber?: string;
  storeAddress?: string;
}

export const StoreVisitActions: React.FC<StoreVisitActionsProps> = ({
  whatsappNumber = '9829012345',
  storeAddress = 'बस स्टैंड रोड, कुशलगढ़, राजस्थान',
}) => {
  const googleMapsUrl =
    'https://www.google.com/maps/search/?api=1&query=Nahata+General+Stores+Bus+Stand+Road+Kushalgarh+Rajasthan';

  return (
    <div className="w-full max-w-sm mx-auto space-y-2 select-none">
      <div className="grid grid-cols-2 gap-2">
        {/* Google Maps Store Route */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-[#26030A] to-[#5B0716] hover:from-[#5B0716] text-[#FFC857] font-bold text-xs flex items-center justify-center gap-1.5 border border-[#FFC857]/40 shadow-md active:scale-95 transition-all text-center"
        >
          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>दुकान का रास्ता 📍</span>
        </a>

        {/* Direct Call to Manoj Ji */}
        <a
          href={`tel:${whatsappNumber}`}
          className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-[#17864B] to-emerald-700 hover:from-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-400/40 shadow-md active:scale-95 transition-all text-center"
        >
          <PhoneCall className="w-3.5 h-3.5 text-white shrink-0" />
          <span>मनोज जी से बात 📞</span>
        </a>
      </div>

      <p className="text-[10px] text-center text-[#FFF4D8]/70">
        📍 {storeAddress} • सुबह 9:00 से रात 9:00 तक खुला
      </p>
    </div>
  );
};
