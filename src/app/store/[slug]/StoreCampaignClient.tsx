'use client';

import React, { use, useState, useEffect } from 'react';
import { Campaign, Prize } from '@/types';
import {
  getStoredPrizes,
  getMerchantBySlug,
} from '@/lib/store';
import { INITIAL_PRIZES, INITIAL_CAMPAIGN, INITIAL_MERCHANTS } from '@/lib/mock-data';
import { getOrAssignSessionPrizeAction } from '@/app/actions/campaign';
import FestivalOfferFunnel from '@/components/FestivalOfferFunnel';
import { OfferRulesSheet } from '@/components/OfferRulesSheet';

export default function StoreCampaignClient({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams?.slug || 'nahata';

  const [targetPrize, setTargetPrize] = useState<Prize>(INITIAL_PRIZES[0]);

  useEffect(() => {
    // Get persistent client session token from sessionStorage/localStorage
    let sessId = '';
    try {
      sessId = localStorage.getItem(`nahata_client_sess_${slug}`) || '';
      if (!sessId) {
        sessId = `client_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        localStorage.setItem(`nahata_client_sess_${slug}`, sessId);
      }
    } catch {}

    getOrAssignSessionPrizeAction(sessId, slug)
      .then((res) => {
        if (res.prize) {
          setTargetPrize(res.prize);
        }
      })
      .catch(() => {});
  }, [slug]);

  const merchant = getMerchantBySlug(slug) || INITIAL_MERCHANTS[0];

  const currentCampaign: Campaign = {
    ...INITIAL_CAMPAIGN,
    id: merchant.id,
    merchant_id: merchant.id,
    store_name: 'नाहाटा जनरल स्टोर्स',
    title: 'नाहाटा जनरल स्टोर्स — शुभ नवरात्रि महोत्सव',
    headline: '🚩 शुभ नवरात्रि महापर्व विशेष ऑफर — नाहाटा जनरल स्टोर्स',
    subheadline: 'मनोज भैया की ओर से सभी कुशलगढ़ वासियों को नवरात्रि की हार्दिक शुभकामनाएं! खरीदारी पर निश्चित स्पेशल गिफ्ट हैम्पर!',
    location: 'बस स्टैंड रोड, कुशलगढ़ (राजस्थान)',
    shop_number: 'बस स्टैंड रोड, कुशलगढ़',
    contact_person: 'श्री मनोज भैया',
    owner_photo_url: '/manoj-nahata.jpg',
    owner_quote: 'कुशलगढ़ का अपना परिवार • 30+ वर्षों का अटूट विश्वास और गारंटी!',
    whatsapp_number: merchant.whatsapp_number || '918290447144',
    whatsapp_community_link: merchant.whatsapp_community_link,
  };

  const [prizes] = useState<Prize[]>(getStoredPrizes);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-[#120104] text-[#FFF4D8] flex flex-col justify-between selection:bg-[#FFC857] selection:text-[#26030A]">
      {/* Main Campaign Funnel Experience */}

      {/* Main Campaign Funnel Experience */}
      <FestivalOfferFunnel
        campaign={currentCampaign}
        prizes={prizes}
        targetPrize={targetPrize}
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
