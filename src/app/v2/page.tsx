'use client';

import React, { useState, useEffect } from 'react';
import { Campaign, Prize } from '@/types';
import { INITIAL_PRIZES, INITIAL_CAMPAIGN } from '@/lib/mock-data';
import { getOrAssignSessionPrizeAction } from '@/app/actions/campaign';
import FestivalOfferFunnelV2 from '@/components/v2/FestivalOfferFunnelV2';

export default function V2CampaignPage() {
  const [targetPrize, setTargetPrize] = useState<Prize>(INITIAL_PRIZES[0]);

  useEffect(() => {
    let sessId = '';
    try {
      sessId = localStorage.getItem('nahata_client_sess_v2') || '';
      if (!sessId) {
        sessId = `client_v2_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        localStorage.setItem('nahata_client_sess_v2', sessId);
      }
    } catch {}

    getOrAssignSessionPrizeAction(sessId, 'nahata')
      .then((res) => {
        if (res.prize) {
          setTargetPrize(res.prize);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-[#120104] text-[#FFF4D8]">
      <FestivalOfferFunnelV2
        campaign={INITIAL_CAMPAIGN}
        prizes={INITIAL_PRIZES}
        targetPrize={targetPrize}
      />
    </main>
  );
}
