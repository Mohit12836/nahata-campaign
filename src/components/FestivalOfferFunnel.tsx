'use client';

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Gift, Disc, ShieldCheck, ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundEngine } from '@/lib/audio';
import { claimCampaignPrizeAction } from '@/app/actions/campaign';
import { INITIAL_PRIZES, INITIAL_CAMPAIGN } from '@/lib/mock-data';
import { Campaign, Prize, Coupon } from '@/types';
import { FestivalHeader } from './FestivalHeader';
import { OfferPrizePreview } from './OfferPrizePreview';
import { ScratchCard } from './ScratchCard';
import { SpinWheel } from './SpinWheel';
import { PrizeClaimForm } from './PrizeClaimForm';
import { DigitalCouponTicket } from './DigitalCouponTicket';
import { StoreVisitActions } from './StoreVisitActions';
import { WhatsAppShareCard } from './WhatsAppShareCard';
import { OfferRulesSheet } from './OfferRulesSheet';

export enum FunnelStage {
  PLAY = 'PLAY',
  CLAIM = 'CLAIM',
  TICKET = 'TICKET',
}

interface FestivalOfferFunnelProps {
  campaign?: Campaign;
  prizes?: Prize[];
  targetPrize?: Prize;
}

export default function FestivalOfferFunnel({
  campaign = INITIAL_CAMPAIGN,
  prizes = INITIAL_PRIZES,
  targetPrize,
}: FestivalOfferFunnelProps) {
  // Funnel Stage Machine
  const [stage, setStage] = useState<FunnelStage>(FunnelStage.PLAY);
  const [gameMode, setGameMode] = useState<'scratch' | 'spin'>('scratch');
  const [selectedPrize, setSelectedPrize] = useState<Prize>(targetPrize || prizes[0] || INITIAL_PRIZES[0]);
  const [wonCoupon, setWonCoupon] = useState<Coupon | null>(null);

  // Bottom Sheet Drawer for Info & Rules
  const [showRulesSheet, setShowRulesSheet] = useState(false);

  // Form Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync selected prize when targetPrize changes
  useEffect(() => {
    if (targetPrize) {
      setSelectedPrize(targetPrize);
    }
  }, [targetPrize]);

  // Confetti Blast Helper
  const triggerCelebration = useCallback(() => {
    try {
      soundEngine.playCelebrationChime();
      confetti({
        particleCount: 85,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#FFC857', '#FFB020', '#5B0716', '#17864B', '#FFF4D8'],
      });
    } catch {}
  }, []);

  // Stage 1 -> Stage 2: Triggered when user scratches/spins
  const handleGameFinished = useCallback(() => {
    triggerCelebration();
    setStage(FunnelStage.CLAIM);
  }, [triggerCelebration]);

  // Stage 2: Form Submission to Server Action
  const handleFormSubmit = async (formData: {
    fullName: string;
    phone: string;
    city: string;
    businessCategory: string;
  }) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await claimCampaignPrizeAction({
        campaignId: campaign.id,
        fullName: formData.fullName,
        phone: formData.phone,
        city: formData.city,
        businessCategory: formData.businessCategory,
        gameType: gameMode,
        consent: true,
        targetPrizeId: selectedPrize.id,
      });

      setIsSubmitting(false);

      if (response.status === 'ERROR') {
        setErrorMessage(response.message || 'त्रुटि हुई। कृपया पुनः प्रयास करें।');
        return;
      }

      if (response.coupon) {
        setWonCoupon(response.coupon);
        if (response.prize) {
          setSelectedPrize(response.prize);
        }
        triggerCelebration();
        setStage(FunnelStage.TICKET);
      }
    } catch (err: unknown) {
      setIsSubmitting(false);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'सर्वर से संपर्क करने में समस्या हुई। कृपया इंटरनेट कनेक्शन जांचें।'
      );
    }
  };

  return (
    <div className="w-full min-h-[100dvh] max-w-md mx-auto bg-gradient-to-b from-[#26030A] via-[#35050D] to-[#120104] text-[#FFF4D8] relative flex flex-col justify-between overflow-x-hidden selection:bg-[#FFC857] selection:text-[#26030A] shadow-2xl">
      {/* Ambient Festive Lighting Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-64 bg-[#FFC857]/15 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 -right-20 w-60 h-60 bg-[#86152B]/20 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-1/2 -left-20 w-60 h-60 bg-[#FFB020]/10 blur-3xl pointer-events-none rounded-full" />

      {/* Main Viewport Content */}
      <div className="flex-1 flex flex-col justify-between px-3 py-1.5 z-10 w-full max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {/* ========================================================= */}
          {/* STAGE 1: FESTIVAL ATTRACTION + OFFER + PLAY (Strict 100dvh) */}
          {/* ========================================================= */}
          {stage === FunnelStage.PLAY && (
            <motion.div
              key="stage-play"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col justify-between h-full min-h-[580px] max-h-[100dvh] py-0.5"
            >
              {/* Top Compact Brand Header */}
              <FestivalHeader
                campaign={campaign}
                onInfoClick={() => setShowRulesSheet(true)}
              />

              {/* Prize Preview Strip */}
              <OfferPrizePreview prizes={prizes} />

              {/* Game Selector Tabs */}
              <div className="w-full my-1 p-1 rounded-xl bg-black/60 border border-[#FFC857]/40 backdrop-blur-sm grid grid-cols-2 gap-1 shadow-sm shrink-0">
                <button
                  type="button"
                  onClick={() => setGameMode('scratch')}
                  className={`py-1.5 px-2.5 rounded-lg font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
                    gameMode === 'scratch'
                      ? 'bg-gradient-to-r from-[#FFC857] via-[#FFB020] to-[#FFC857] text-[#26030A] shadow-md scale-[1.02]'
                      : 'text-[#FFF4D8]/80 hover:text-white'
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>लकी स्क्रैच कार्ड</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGameMode('spin')}
                  className={`py-1.5 px-2.5 rounded-lg font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
                    gameMode === 'spin'
                      ? 'bg-gradient-to-r from-[#FFC857] via-[#FFB020] to-[#FFC857] text-[#26030A] shadow-md scale-[1.02]'
                      : 'text-[#FFF4D8]/80 hover:text-white'
                  }`}
                >
                  <Disc className="w-3.5 h-3.5" />
                  <span>लकी स्पिन व्हील</span>
                </button>
              </div>

              {/* Center Game Arena */}
              <div className="w-full flex-1 flex flex-col items-center justify-center py-0.5">
                {gameMode === 'scratch' ? (
                  <ScratchCard
                    prize={selectedPrize}
                    onScratchComplete={handleGameFinished}
                  />
                ) : (
                  <SpinWheel
                    prizes={prizes}
                    targetPrize={selectedPrize}
                    onSpinComplete={handleGameFinished}
                  />
                )}
              </div>

              {/* Compact Trust Strip & Rules Drawer Trigger */}
              <div className="w-full text-center space-y-1 shrink-0 pt-0.5 pb-1">
                <div className="flex items-center justify-center gap-2 text-[10px] text-[#FFF4D8]/90 font-bold bg-black/60 py-1 px-3 rounded-full border border-[#FFC857]/30">
                  <span>🔒 स्थानीय दुकान</span>
                  <span>•</span>
                  <span>स्पष्ट ऑफर नियम</span>
                  <span>•</span>
                  <span>दुकान पर कूपन दिखाएँ</span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRulesSheet(true)}
                  className="inline-flex items-center gap-1 text-[11px] text-[#FFC857] hover:text-white underline font-semibold transition-colors"
                >
                  <span>📋 दुकान का पता, समय व नियम (विस्तार से देखें)</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* STAGE 2: INSTANT PRIZE CLAIM (Warm Ivory Card Form)        */}
          {/* ========================================================= */}
          {stage === FunnelStage.CLAIM && (
            <motion.div
              key="stage-claim"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="flex-1 flex flex-col justify-center py-2"
            >
              <PrizeClaimForm
                prize={selectedPrize}
                onSubmit={handleFormSubmit}
                isLoading={isSubmitting}
                errorMessage={errorMessage}
                onBackToPlay={() => setStage(FunnelStage.PLAY)}
              />
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* STAGE 3: DIGITAL COUPON + STORE VISIT + SHARING            */}
          {/* ========================================================= */}
          {stage === FunnelStage.TICKET && wonCoupon && (
            <motion.div
              key="stage-ticket"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col justify-start space-y-3 py-2 overflow-y-auto no-scrollbar"
            >
              {/* Confirmed Digital Ticket */}
              <DigitalCouponTicket coupon={wonCoupon} campaign={campaign} />

              {/* WhatsApp Sharing & Viral Milestone Mission */}
              <WhatsAppShareCard
                coupon={wonCoupon}
                campaign={campaign}
                onMilestoneReached={triggerCelebration}
              />

              {/* Store Visit CTAs (Google Maps + Direct Phone) */}
              <StoreVisitActions
                whatsappNumber={campaign.whatsapp_number}
                storeAddress={campaign.location}
              />

              {/* Footer Links */}
              <div className="pt-2 pb-1 text-center text-[10px] text-[#FFF4D8]/60 space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRulesSheet(true)}
                  className="hover:underline text-[#FFC857]"
                >
                  दुकान विवरण व नियम
                </button>
                <span>•</span>
                <span>नाहाटा जनरल स्टोर्स कुशलगढ़</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expandable Bottom Sheet for Rules & Store Info */}
      <OfferRulesSheet
        isOpen={showRulesSheet}
        onClose={() => setShowRulesSheet(false)}
        campaign={campaign}
      />
    </div>
  );
}
