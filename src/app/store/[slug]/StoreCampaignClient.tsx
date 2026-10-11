'use client';

import React, { use, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Lock, MapPin, Info } from 'lucide-react';
import { Campaign, Prize } from '@/types';
import {
  getStoredPrizes,
  getSessionTargetPrize,
  getMerchantBySlug,
} from '@/lib/store';
import { INITIAL_PRIZES, INITIAL_CAMPAIGN, INITIAL_MERCHANTS } from '@/lib/mock-data';
import FestivalOfferFunnel from '@/components/FestivalOfferFunnel';
import { OfferRulesSheet } from '@/components/OfferRulesSheet';

const subscribe = () => () => {};

export default function StoreCampaignClient({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams?.slug || 'nahata';

  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  const targetPrize = useSyncExternalStore(
    subscribe,
    getSessionTargetPrize,
    () => INITIAL_PRIZES[0]
  );

  const merchant = getMerchantBySlug(slug) || INITIAL_MERCHANTS[0];

  const currentCampaign: Campaign = {
    ...INITIAL_CAMPAIGN,
    id: merchant.id,
    merchant_id: merchant.id,
    store_name: 'नाहाटा जनरल स्टोर्स',
    title: 'नाहाटा जनरल स्टोर्स — शुभ नवरात्रि महोत्सव',
    headline: 'शुभ नवरात्रि महोत्सव — मेगा लकी ड्रॉ ऑफर',
    subheadline: 'नाहाटा जनरल स्टोर्स की ओर से आपके लिए खास उत्सवी ऑफर',
    location: 'बस स्टैंड रोड, कुशलगढ़, जिला बांसवाड़ा (राजस्थान)',
    shop_number: 'दुकान नं. 14, मेन बस स्टैंड रोड',
    contact_person: 'श्री मनोज नाहाटा',
    owner_photo_url: '/manoj-nahata.jpg',
    owner_quote: 'कुशलगढ़ का अपना परिवार • 30+ वर्षों का अटूट विश्वास और गारंटी!',
    whatsapp_number: merchant.whatsapp_number || '919829012345',
    whatsapp_community_link: merchant.whatsapp_community_link,
  };

  const [prizes] = useState<Prize[]>(getStoredPrizes);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-[#120104] text-[#FFF4D8] flex flex-col justify-between selection:bg-[#FFC857] selection:text-[#26030A]">
      {/* Top Floating Admin & Rules Bar */}
      <div className="w-full max-w-md mx-auto px-3 pt-1.5 pb-0.5 flex items-center justify-between z-20 shrink-0 text-xs">
        <span className="text-[10px] font-bold text-[#FFC857] bg-black/60 px-2.5 py-0.5 rounded-full border border-[#FFC857]/30 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-rose-400" />
          <span>बस स्टैंड रोड, कुशलगढ़</span>
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsRulesOpen(true)}
            className="text-[10px] font-bold text-[#FFC857] hover:text-white bg-black/50 px-2 py-0.5 rounded-full border border-[#FFC857]/30 transition-colors flex items-center gap-0.5"
          >
            <Info className="w-2.5 h-2.5 text-[#FFC857]" />
            <span>नियम</span>
          </button>
          <Link
            href={`/admin?store=${merchant.slug}`}
            className="text-[10px] font-bold text-[#FFC857] hover:text-white bg-black/50 px-2 py-0.5 rounded-full border border-[#FFC857]/30 transition-colors flex items-center gap-0.5"
          >
            <Lock className="w-2.5 h-2.5" />
            <span>एडमिन</span>
          </Link>
        </div>
      </div>

      {/* Main Campaign Funnel Experience */}
      <FestivalOfferFunnel
        campaign={currentCampaign}
        prizes={prizes}
        targetPrize={isClient ? targetPrize : INITIAL_PRIZES[0]}
      />

      {/* Direct Global Rules Sheet */}
      <OfferRulesSheet
        campaign={currentCampaign}
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />
    </div>
  );
}
