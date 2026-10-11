'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import {
  Gift,
  Sparkles,
  Share2,
  Users,
  CheckCircle2,
  Copy,
  Check,
  MapPin,
  PhoneCall,
  MessageSquare,
  Flame,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Trophy,
  ShieldCheck,
  Volume2,
  VolumeX,
  Store,
  Calendar,
  User,
  ExternalLink,
  Award,
  PartyPopper,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundEngine } from '@/lib/audio';
import { claimCampaignPrizeAction } from '@/app/actions/campaign';
import { INITIAL_PRIZES, INITIAL_CAMPAIGN } from '@/lib/mock-data';
import { Campaign, Prize, Coupon } from '@/types';
import { getNahataWhatsAppClaimUrl, getNahataShareUrl } from '@/lib/whatsapp';
import { ScratchCard } from './ScratchCard';
import { DigitalCouponTicket } from './DigitalCouponTicket';
import { OfferRulesSheet } from './OfferRulesSheet';

export enum FunnelStage {
  WELCOME = 'WELCOME', // Screen 1: Grand Navratri Shubhkamnayein + Zoom In-Out + Sound + Special Offer Intro
  SCRATCH = 'SCRATCH', // Screen 2: Interactive Scratch Card -> Assured Gift Hamper reveal
  CLAIM = 'CLAIM',     // Screen 3: Customer Name & Number -> Coupon Generation
  SHARE = 'SHARE',     // Screen 4: 5 WhatsApp Groups Share to Unlock + Join Official Group
  TICKET = 'TICKET',   // Screen 5: Final Golden Coupon Pass + WhatsApp Manoj Bhaiya + Store Visit
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
  // Screen Stage State
  const [stage, setStage] = useState<FunnelStage>(FunnelStage.WELCOME);
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.isMuted);

  // Prize & Game State
  const [selectedPrize, setSelectedPrize] = useState<Prize>(
    targetPrize || prizes[0] || INITIAL_PRIZES[0]
  );
  const [hasScratched, setHasScratched] = useState(false);

  // Customer & Coupon State
  const [wonCoupon, setWonCoupon] = useState<Coupon | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCity, setCustomerCity] = useState('कुशलगढ़');
  const [consent, setConsent] = useState(true);

  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Viral Share State (Screen 4)
  const [shareCount, setShareCount] = useState<number>(0);
  const [isShareUnlocked, setIsShareUnlocked] = useState<boolean>(false);

  // Rules Bottom Sheet
  const [showRulesSheet, setShowRulesSheet] = useState(false);

  // Update selected prize when target changes
  useEffect(() => {
    if (targetPrize) {
      setSelectedPrize(targetPrize);
    }
  }, [targetPrize]);

  // Sound Toggle Handler
  const toggleSound = () => {
    const nextMuted = soundEngine.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      soundEngine.playFestiveBell();
    }
  };

  // Celebration Fireworks Helper
  const triggerCelebration = useCallback(() => {
    try {
      soundEngine.playCelebrationChime();
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FF9F1C', '#FF4D6D', '#2EC4B6', '#FFFDF0'],
      });
    } catch {}
  }, []);

  // Screen 1 -> Screen 2
  const handleProceedToScratch = () => {
    if (!isMuted) {
      soundEngine.playBounceWhoosh();
    }
    setStage(FunnelStage.SCRATCH);
  };

  // Screen 2 Scratch Completed -> Show celebration
  const handleScratchComplete = () => {
    setHasScratched(true);
    triggerCelebration();
  };

  // Screen 2 -> Screen 3
  const handleProceedToForm = () => {
    if (!isMuted) {
      soundEngine.playTick();
    }
    setStage(FunnelStage.CLAIM);
  };

  // Screen 3: Submit Customer Form -> Generate Coupon -> Go to Screen 4
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = customerName.trim();
    const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10);

    if (!cleanName || cleanName.length < 2) {
      setFormError('कृपया अपना पूरा नाम दर्ज करें (कम से कम 2 अक्षर)');
      return;
    }

    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setFormError('कृपया 10-अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें (6, 7, 8 या 9 से शुरू)');
      return;
    }

    if (!consent) {
      setFormError('ऑफर कूपन प्राप्त करने हेतु कृपया सहमति बॉक्स पर टिक करें।');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await claimCampaignPrizeAction({
        campaignId: campaign.id,
        fullName: cleanName,
        phone: cleanPhone,
        city: customerCity,
        businessCategory: 'घरेलू उपभोक्ता (Family / Home)',
        gameType: 'scratch',
        consent: true,
        targetPrizeId: selectedPrize.id,
      });

      setIsSubmitting(false);

      if (response.status === 'ERROR') {
        setFormError(response.message || 'त्रुटि हुई। कृपया पुनः प्रयास करें।');
        return;
      }

      if (response.coupon) {
        setWonCoupon(response.coupon);
        if (response.prize) {
          setSelectedPrize(response.prize);
        }
        triggerCelebration();
        setStage(FunnelStage.SHARE);
      } else {
        // Fallback local coupon generation if offline/unconfigured
        const fallbackCoupon: Coupon = {
          id: `coup-${Date.now()}`,
          code: `NGS-NAV-${Math.floor(1000 + Math.random() * 9000)}`,
          campaign_id: campaign.id,
          customer_id: `cust-${Date.now()}`,
          prize_id: selectedPrize.id,
          prize: selectedPrize,
          customer: {
            id: `cust-${Date.now()}`,
            full_name: cleanName,
            phone: cleanPhone,
            city: customerCity,
            business_category: 'घरेलू उपभोक्ता (Family / Home)',
            lead_source: 'navratri-offer',
            whatsapp_consent: true,
            consent_timestamp: new Date().toISOString(),
            created_at: new Date().toISOString(),
          },
          status: 'valid',
          expires_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
        };
        setWonCoupon(fallbackCoupon);
        triggerCelebration();
        setStage(FunnelStage.SHARE);
      }
    } catch (err: unknown) {
      setIsSubmitting(false);
      setFormError(
        err instanceof Error ? err.message : 'सर्वर से संपर्क नहीं हो पाया। कृपया पुनः प्रयास करें।'
      );
    }
  };

  // Screen 4: Handle WhatsApp Share Click
  const handleShareClick = () => {
    soundEngine.playTick();
    const nextCount = shareCount + 1;
    setShareCount(nextCount);
    if (nextCount >= 5) {
      setIsShareUnlocked(true);
      triggerCelebration();
    }
  };

  // Screen 4 -> Screen 5
  const handleProceedToTicket = () => {
    if (!isMuted) {
      soundEngine.playCelebrationChime();
    }
    setStage(FunnelStage.TICKET);
  };

  // Viral WhatsApp share link for Screen 4
  const viralShareUrl = getNahataShareUrl(
    customerName || 'आपके मित्र',
    typeof window !== 'undefined' ? window.location.origin : undefined
  );

  // Direct WhatsApp Claim message to Manoj Bhaiya for Screen 5
  const whatsappClaimUrl = wonCoupon
    ? getNahataWhatsAppClaimUrl({
        whatsappNumber: campaign.whatsapp_number || '919829012345',
        customerName: wonCoupon.customer?.full_name || customerName || 'ग्राहक',
        customerPhone: wonCoupon.customer?.phone || customerPhone || '',
        couponCode: wonCoupon.code,
        prizeTitle: wonCoupon.prize?.title || 'निश्चित स्पेशल गिफ्ट हैम्पर (खरीदारी पर)',
        terms: wonCoupon.prize?.terms_and_conditions,
        storeName: 'नाहाटा जनरल स्टोर्स',
      })
    : '#';

  // Helper step indices for progress dots
  const stageIndexMap: Record<FunnelStage, number> = {
    [FunnelStage.WELCOME]: 1,
    [FunnelStage.SCRATCH]: 2,
    [FunnelStage.CLAIM]: 3,
    [FunnelStage.SHARE]: 4,
    [FunnelStage.TICKET]: 5,
  };
  const currentStep = stageIndexMap[stage];

  return (
    <div className="w-full min-h-[100dvh] max-w-md mx-auto bg-gradient-to-b from-[#200207] via-[#35030C] to-[#140105] text-[#FFFDF7] relative flex flex-col justify-between overflow-x-hidden selection:bg-[#FFD700] selection:text-[#200207] shadow-2xl">
      {/* Radiant Festive Background Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-72 bg-[#FFD700]/20 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-1/3 -right-20 w-64 h-64 bg-[#E63946]/25 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 -left-20 w-64 h-64 bg-[#FF9F1C]/20 blur-3xl pointer-events-none rounded-full" />

      {/* Persistent Top Navigation Bar */}
      <header className="w-full px-3 pt-2.5 pb-1 z-30 shrink-0">
        <div className="flex items-center justify-between gap-2">
          {/* Spiritual Navratri Tag */}
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#5B0716] text-[#FFD700] border border-[#FFD700]/50 shadow-sm">
            <span className="animate-pulse">🚩</span>
            <span>॥ जय माता दी ॥ नवरात्रि महोत्सव</span>
          </div>

          {/* Interactive Sound ON/OFF Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            title={isMuted ? 'साउंड चालू करें' : 'साउंड म्यूट करें'}
            className="px-2 py-0.5 rounded-full bg-black/60 hover:bg-black/80 border border-[#FFD700]/50 text-[#FFD700] shadow-sm backdrop-blur-xs transition-all active:scale-95 flex items-center gap-1 text-[10px] font-bold"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-[#FFD700] animate-bounce" />
            )}
            <span>{isMuted ? 'साउंड बंद' : 'साउंड चालू'}</span>
          </button>
        </div>

        {/* 5-Step Process Progress Bar */}
        <div className="mt-2 px-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-amber-200/90 mb-1">
            <span className="flex items-center gap-1 text-white">
              <span className="w-4 h-4 rounded-full bg-[#FFD700] text-[#200207] inline-flex items-center justify-center font-black text-[9px]">
                {currentStep}
              </span>
              <span>
                {stage === FunnelStage.WELCOME && '1. नवरात्रि शुभकामनाएं'}
                {stage === FunnelStage.SCRATCH && '2. लकी स्क्रैच कार्ड'}
                {stage === FunnelStage.CLAIM && '3. कूपन जानकारी'}
                {stage === FunnelStage.SHARE && '4. 5 ग्रुप शेयर'}
                {stage === FunnelStage.TICKET && '5. कूपन पास & रिडीम'}
              </span>
            </span>
            <span className="text-amber-300 font-extrabold">{currentStep} / 5 चरण</span>
          </div>
          <div className="w-full bg-black/60 rounded-full h-1.5 overflow-hidden border border-[#FFD700]/30">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#FF9F1C] via-[#FFD700] to-[#FFE89B]"
              initial={{ width: '20%' }}
              animate={{ width: `${(currentStep / 5) * 100}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
        </div>
      </header>

      {/* Main Viewport Screen Content */}
      <main className="flex-1 flex flex-col justify-between px-3 py-1.5 z-10 w-full max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {/* ========================================================================= */}
          {/* SCREEN 1: WELCOME & NAVRATRI SHUBHKAMNAYEIN (Zoom In-Out + Sound + Offer) */}
          {/* ========================================================================= */}
          {stage === FunnelStage.WELCOME && (
            <motion.div
              key="screen-1-welcome"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex-1 flex flex-col justify-between py-1 text-center"
            >
              {/* Animated Zoom In-Out Festive Headline */}
              <div className="py-2 space-y-1.5">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 1, -1, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="inline-block"
                >
                  <span className="text-2xl sm:text-3xl drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]">
                    🪔 🚩 🪔
                  </span>
                </motion.div>

                <motion.h1
                  animate={{
                    scale: [1, 1.04, 1],
                  }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D6] via-[#FFD700] to-[#FFF5D6] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-tight"
                >
                  शुभ नवरात्रि महापर्व की हार्दिक शुभकामनाएं!
                </motion.h1>

                <p className="text-xs sm:text-sm font-semibold text-amber-200/90 max-w-xs mx-auto leading-relaxed">
                  माँ दुर्गा की कृपा आप और आपके परिवार पर सदा बनी रहे।
                </p>
              </div>

              {/* Store & Manoj Bhaiya Grand Visual Showcase Card */}
              <div className="my-2 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-[#40050F]/90 via-[#2A0208]/95 to-[#40050F]/90 border-2 border-[#FFD700]/60 shadow-[0_8px_25px_rgba(0,0,0,0.8)] relative overflow-hidden backdrop-blur-sm">
                {/* Golden corner shines */}
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-[#FFD700]/20 rounded-full blur-md" />
                <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-[#FFD700]/20 rounded-full blur-md" />

                {/* Profile and Store Images Duo */}
                <div className="flex items-center justify-center gap-3 mb-2.5">
                  {/* Real Nahata Store Logo */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-[#FFD700] via-[#FFAE00] to-[#FFE89B] shadow-xl border-2 border-white"
                  >
                    <div className="w-full h-full rounded-full overflow-hidden bg-[#200207] relative">
                      <Image
                        src="/nahata-logo.jpg"
                        alt="नाहाटा जनरल स्टोर्स कुशलगढ़"
                        fill
                        priority
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  </motion.div>

                  {/* Manoj Bhaiya Photo */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-[#FFD700] via-[#FFAE00] to-[#FFE89B] shadow-xl border-2 border-white"
                  >
                    <div className="w-full h-full rounded-full overflow-hidden bg-[#200207] relative">
                      <Image
                        src="/manoj-nahata.jpg"
                        alt="श्री मनोज भैया नाहाटा जनरल स्टोर्स"
                        fill
                        priority
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full border border-white shadow-xs">
                      ✓
                    </span>
                  </motion.div>
                </div>

                {/* Store Name & Verified Badges */}
                <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                  नाहाटा जनरल स्टोर्स
                </h2>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>बस स्टैंड रोड, कुशलगढ़ (राजस्थान)</span>
                </div>

                <div className="mt-2 pt-2 border-t border-dashed border-[#FFD700]/30 flex items-center justify-center gap-2 text-[10px] text-amber-100/90 font-medium">
                  <span className="bg-[#5B0716] px-2 py-0.5 rounded-full border border-[#FFD700]/40 text-[#FFD700] font-bold">
                    श्री मनोज भैया
                  </span>
                  <span>•</span>
                  <span>30+ वर्षों का अटूट विश्वास</span>
                </div>
              </div>

              {/* Special Offer Highlight Banner */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-[#FFD700] via-[#FFAE00] to-[#FFD700] text-[#200207] shadow-lg border-2 border-[#FFFDF0]">
                <div className="flex items-center justify-center gap-1.5 font-black text-xs uppercase tracking-wider text-[#5B0716]">
                  <Sparkles className="w-4 h-4 fill-current animate-spin" />
                  <span>नवरात्रि महापर्व महा-धमाका ऑफर</span>
                </div>
                <h3 className="text-base sm:text-lg font-black mt-0.5 leading-tight text-[#200207]">
                  🎁 खरीदारी पर निश्चित स्पेशल गिफ्ट हैम्पर + महा-बचत वाउचर!
                </h3>
                <p className="text-[11px] font-bold text-[#5B0716] mt-1 leading-tight">
                  (गिफ्ट हैम्पर में क्या खास निकला... दुकान जाकर खरीदारी करने पर खुलेगा!)
                </p>
              </div>

              {/* Primary Glowing Action CTA Button */}
              <div className="pt-3 pb-1">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={handleProceedToScratch}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FFD700] via-[#FFB703] to-[#FFD700] hover:brightness-110 text-[#200207] font-black text-sm sm:text-base shadow-[0_0_20px_rgba(255,215,0,0.5)] border-2 border-white flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Gift className="w-5 h-5 shrink-0 text-[#5B0716]" />
                  <span>स्पेशल ऑफर लेने के लिए आगे बढ़ें (Next Screen)</span>
                  <ArrowRight className="w-5 h-5 shrink-0 text-[#5B0716]" />
                </motion.button>

                <p className="text-[10px] text-amber-200/80 mt-1.5 font-medium">
                  🔒 कुशलगढ़ की स्थानीय दुकान • 100% निशुल्क लकी ड्रॉ कूपन
                </p>
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* SCREEN 2: INTERACTIVE SCRATCH CARD (Scratch -> Gift Hamper Surprise)      */}
          {/* ========================================================================= */}
          {stage === FunnelStage.SCRATCH && (
            <motion.div
              key="screen-2-scratch"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col justify-between py-1 text-center"
            >
              {/* Screen Top Header */}
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#5B0716] text-[#FFD700] border border-[#FFD700]/50">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>चरण 2: लकी स्क्रैच कार्ड</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D6] via-[#FFD700] to-[#FFF5D6]">
                  कार्ड को स्क्रैच करें & इनाम निकालें!
                </h2>
                <p className="text-[11px] text-amber-200/90 font-medium">
                  उंगली से नीचे दिए गए कार्ड को रगड़ें (स्क्रैच करें)
                </p>
              </div>

              {/* Interactive Scratch Card Component */}
              <div className="my-auto py-2">
                <ScratchCard
                  prize={selectedPrize}
                  onScratchComplete={handleScratchComplete}
                />
              </div>

              {/* Post-Scratch Reveal Box & Action */}
              <div className="space-y-2 pt-1 pb-1">
                {hasScratched ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-gradient-to-r from-[#14532D] via-[#166534] to-[#14532D] border-2 border-emerald-400 text-white shadow-lg space-y-1"
                  >
                    <div className="flex items-center justify-center gap-1 text-xs font-black text-[#FFD700]">
                      <Trophy className="w-4 h-4 fill-current" />
                      <span>बधाई हो! आपका लकी सरप्राइज खुल गया!</span>
                    </div>
                    <p className="text-sm font-black text-white">
                      🎁 1 निश्चित स्पेशल गिफ्ट हैम्पर (खरीदारी पर) + महा-बचत वाउचर!
                    </p>
                    <p className="text-[10px] text-emerald-100 font-semibold leading-tight">
                      📌 गिफ्ट हैम्पर में क्या खास निकला... यह नाहाटा जनरल स्टोर्स की दुकान पर जाकर खरीदारी करने पर खुलेगा!
                    </p>
                  </motion.div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-black/50 border border-[#FFD700]/40 text-[11px] text-amber-200 font-medium">
                    💡 पूरे कार्ड को स्क्रैच करें या &apos;Auto Reveal&apos; बटन दबाकर तुरंत देखें।
                  </div>
                )}

                {/* Button to Next Screen */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleProceedToForm}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FFD700] via-[#FFB703] to-[#FFD700] text-[#200207] font-black text-sm shadow-lg border-2 border-white flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Gift className="w-4 h-4 text-[#5B0716]" />
                  <span>कूपन रिडीम करने के लिए आगे बढ़ें (Next Screen)</span>
                  <ArrowRight className="w-4 h-4 text-[#5B0716]" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* SCREEN 3: CUSTOMER FORM (Name & WhatsApp Mobile Number Entry)             */}
          {/* ========================================================================= */}
          {stage === FunnelStage.CLAIM && (
            <motion.div
              key="screen-3-claim"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col justify-between py-1"
            >
              {/* Header */}
              <div className="text-center space-y-1 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#5B0716] text-[#FFD700] border border-[#FFD700]/50">
                  <User className="w-3.5 h-3.5" />
                  <span>चरण 3: ग्राहक विवरण</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D6] via-[#FFD700] to-[#FFF5D6]">
                  अपना नाम व मोबाइल नंबर दर्ज करें
                </h2>
                <p className="text-[11px] text-amber-200/90 font-medium">
                  आपके नाम से आधिकारिक डिजिटल कूपन कोड तैयार किया जाएगा
                </p>
              </div>

              {/* Form Card (Warm Light Ivory with High Contrast Text) */}
              <div className="my-auto p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#FFFDF7] via-[#FFF8E7] to-[#FFFDF7] text-[#200207] shadow-2xl border-2 border-[#FFD700]">
                {/* Won Prize Badge Preview */}
                <div className="mb-3 p-2.5 rounded-xl bg-gradient-to-r from-[#5B0716] via-[#7F0D23] to-[#5B0716] text-white flex items-center gap-2.5 border border-[#FFD700]/50 shadow-xs">
                  <div className="w-9 h-9 rounded-full bg-[#FFD700] text-[#200207] flex items-center justify-center shrink-0 font-black">
                    🎁
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-black text-[#FFD700] uppercase tracking-wider block">
                      आपका लकी ड्रॉ ऑफर:
                    </span>
                    <h4 className="text-xs sm:text-sm font-black text-white truncate">
                      खरीदारी पर निश्चित स्पेशल गिफ्ट हैम्पर + डिस्काउंट
                    </h4>
                  </div>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-3">
                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-black text-[#3B020B] mb-1">
                      आपका पूरा नाम *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="जैसे: नीतीश जी / राहुल जैन"
                        className="w-full py-2.5 px-3 rounded-xl bg-white border-2 border-[#D4AF37] focus:border-[#5B0716] focus:outline-none text-sm font-bold text-gray-900 placeholder:text-gray-400 shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Phone Input */}
                  <div>
                    <label className="block text-xs font-black text-[#3B020B] mb-1">
                      व्हाट्सएप मोबाइल नंबर *
                    </label>
                    <div className="relative flex">
                      <span className="inline-flex items-center px-3 rounded-l-xl border-2 border-r-0 border-[#D4AF37] bg-amber-100 text-gray-800 text-xs font-black">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="10 अंकों का नंबर (जैसे: 98290XXXXX)"
                        className="w-full py-2.5 px-3 rounded-r-xl bg-white border-2 border-[#D4AF37] focus:border-[#5B0716] focus:outline-none text-sm font-bold text-gray-900 placeholder:text-gray-400 shadow-inner tracking-wider font-mono"
                      />
                    </div>
                  </div>

                  {/* City Selection */}
                  <div>
                    <label className="block text-xs font-black text-[#3B020B] mb-1">
                      शहर / कस्बा / गाँव *
                    </label>
                    <input
                      type="text"
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      placeholder="कुशलगढ़ / बांसवाड़ा / नजदीकी गाँव"
                      className="w-full py-2.5 px-3 rounded-xl bg-white border-2 border-[#D4AF37] focus:border-[#5B0716] focus:outline-none text-sm font-bold text-gray-900 placeholder:text-gray-400 shadow-inner"
                    />
                  </div>

                  {/* Consent checkbox */}
                  <label className="flex items-start gap-2 text-[10px] text-gray-700 font-semibold cursor-pointer select-none pt-1">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="w-3.5 h-3.5 mt-0.5 rounded text-[#5B0716] border-[#D4AF37] focus:ring-0"
                    />
                    <span>
                      मैं नाहाटा जनरल स्टोर्स से नवरात्रि ऑफर व कूपन कोड WhatsApp पर पाने की सहमति देता हूँ।
                    </span>
                  </label>

                  {/* Error Notification */}
                  {formError && (
                    <div className="p-2 rounded-lg bg-red-100 border border-red-300 text-red-700 text-xs font-bold text-center">
                      ⚠️ {formError}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#5B0716] via-[#86152B] to-[#5B0716] hover:brightness-110 text-[#FFD700] font-black text-sm shadow-lg border border-[#FFD700] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 transition-all active:scale-98"
                  >
                    {isSubmitting ? (
                      <span>कूपन कोड जनरेट हो रहा है... ⏳</span>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-current text-[#FFD700]" />
                        <span>कूपन कोड जनरेट करें (Generate Coupon) ➔</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Back Link */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setStage(FunnelStage.SCRATCH)}
                  className="text-xs text-amber-200/80 hover:text-white underline font-semibold"
                >
                  ← वापस स्क्रैच कार्ड पर जाएं
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* SCREEN 4: VIRAL 5-GROUP SHARE TO UNLOCK & OFFICIAL GROUP LINK             */}
          {/* ========================================================================= */}
          {stage === FunnelStage.SHARE && (
            <motion.div
              key="screen-4-share"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col justify-between py-1 text-center"
            >
              {/* Header */}
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#5B0716] text-[#FFD700] border border-[#FFD700]/50">
                  <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>चरण 4: व्हाट्सएप शेयर मिशन</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D6] via-[#FFD700] to-[#FFF5D6]">
                  कूपन पाने के लिए 5 WhatsApp ग्रुप में शेयर करें!
                </h2>
                <p className="text-[11px] text-amber-200/90 font-medium">
                  {customerName ? (
                    <span>
                      <strong>{customerName} जी</strong> के नाम से ग्रुप में सीधा इनविटेशन मैसेज जाएगा
                    </span>
                  ) : (
                    'मित्रों और परिवार के ग्रुप में यह ऑफर शेयर करें'
                  )}
                </p>
              </div>

              {/* Viral Share Counter & Box */}
              <div className="my-2 p-4 rounded-2xl bg-gradient-to-b from-[#35030C] via-[#480512] to-[#200207] border-2 border-[#FFD700]/60 shadow-xl space-y-3">
                {/* Counter & Progress */}
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-[#FFD700] flex items-center gap-1">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>शेयर प्रगति (Progress):</span>
                  </span>
                  <span className="text-white text-sm bg-black/60 px-2 py-0.5 rounded-lg border border-[#FFD700]/30">
                    {shareCount} / 5 शेयर पूरे
                  </span>
                </div>

                {/* Animated Progress Bar */}
                <div className="w-full bg-black/80 rounded-full h-3 overflow-hidden border border-[#FFD700]/40 p-0.5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#FF9F1C] via-[#FFD700] to-[#FFE89B]"
                    initial={{ width: '0%' }}
                    animate={{ width: `${Math.min(100, (shareCount / 5) * 100)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {/* Dynamic Status Text */}
                <p className="text-[11px] font-bold text-amber-100/90">
                  {shareCount === 0 && '👉 नीचे बटन दबाकर पहले ग्रुप में शेयर करें।'}
                  {shareCount === 1 && '🎉 1 शेयर हो गया! 4 ग्रुप में और शेयर करें...'}
                  {shareCount === 2 && '🔥 बहुत बढ़िया! केवल 3 ग्रुप बाकी हैं...'}
                  {shareCount === 3 && '⚡ लगभग पूरा हो गया! सिर्फ 2 ग्रुप बाकी...'}
                  {shareCount === 4 && '🎯 अंतिम 1 शेयर बाकी है! तुरंत शेयर करें...'}
                  {shareCount >= 5 && '🏆 बधाई हो! आपके 5 शेयर पूरे हो गए, कूपन अनलॉक!'}
                </p>

                {/* Primary WhatsApp Share Button */}
                <a
                  href={viralShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleShareClick}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-black text-sm shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 fill-current shrink-0" />
                  <span>
                    {shareCount < 5
                      ? `WhatsApp ग्रुप में शेयर करें (${5 - shareCount} बाकी)`
                      : 'फिर से WhatsApp पर शेयर करें'}
                  </span>
                </a>

                {/* Preview of the Personalized Message */}
                <div className="p-2 rounded-lg bg-black/50 border border-[#FFD700]/20 text-left text-[9px] text-amber-100/80 leading-relaxed">
                  <span className="font-bold text-[#FFD700] block mb-0.5">
                    📲 ग्रुप में यह मैसेज जाएगा:
                  </span>
                  <span>
                    &quot;🚩 जय माता दी! {customerName || 'हमारे ग्राहक'} जी ने आपको मनोज भैया (नाहाटा जनरल स्टोर्स, बस स्टैंड रोड, कुशलगढ़, राजस्थान) का स्पेशल नवरात्रि गिफ्ट हैम्पर ऑफर भेजा है! 🎁...&quot;
                  </span>
                </div>
              </div>

              {/* Official Store WhatsApp Group Join Box */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-[#5B0716] to-[#7F0D23] border border-[#FFD700]/40 text-left flex items-center justify-between gap-2 shadow-md">
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-[11px] font-black text-[#FFD700]">
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    <span>नाहाटा स्टोर्स ऑफिशियल ग्रुप</span>
                  </div>
                  <p className="text-[10px] text-amber-100 font-medium leading-tight mt-0.5">
                    दुकान के आने वाले सभी ऑफर्स व अपडेट्स के लिए जुड़ें।
                  </p>
                </div>
                <a
                  href={campaign.whatsapp_community_link || 'https://chat.whatsapp.com/invite/nahatageneralstores'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20BD5A] text-white text-[10px] font-black shrink-0 flex items-center gap-1 active:scale-95 shadow-sm"
                >
                  <span>जॉइन करें</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Unlock / Next Screen Action */}
              <div className="pt-2 pb-1 space-y-1.5">
                {shareCount >= 5 || isShareUnlocked ? (
                  <motion.button
                    initial={{ scale: 0.95 }}
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    type="button"
                    onClick={handleProceedToTicket}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FFD700] via-[#FFAE00] to-[#FFD700] text-[#200207] font-black text-sm shadow-xl border-2 border-white flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Trophy className="w-4 h-4 text-[#5B0716]" />
                    <span>🎉 अपना ऑफिशियल कूपन देखें और रिडीम करें ➔</span>
                  </motion.button>
                ) : (
                  <button
                    type="button"
                    onClick={handleProceedToTicket}
                    className="text-xs text-amber-200/80 hover:text-white underline font-semibold transition-colors"
                  >
                    यदि आपने शेयर कर दिया है तो कूपन देखें ➔
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* SCREEN 5: FINAL COUPON PASS, WHATSAPP MANOJ BHAIYA & STORE VISIT          */}
          {/* ========================================================================= */}
          {stage === FunnelStage.TICKET && wonCoupon && (
            <motion.div
              key="screen-5-ticket"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col justify-between py-1 space-y-2.5 overflow-y-auto no-scrollbar"
            >
              {/* Top Success Badge */}
              <div className="text-center space-y-0.5">
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-black bg-[#14532D] text-emerald-300 border border-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>सफलतापूर्वक जनरेट हुआ</span>
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  आपका आधिकारिक नवरात्रि कूपन पास
                </h2>
              </div>

              {/* Master Digital Ticket */}
              <DigitalCouponTicket coupon={wonCoupon} campaign={campaign} />

              {/* Gift Hamper Shopping Notice Box */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-[#40050F] via-[#5B0716] to-[#40050F] border border-[#FFD700]/50 text-center shadow-lg space-y-1">
                <p className="text-xs font-black text-[#FFD700] flex items-center justify-center gap-1">
                  <span>🎁</span>
                  <span>गिफ्ट हैम्पर खरीदारी पर दुकान जाकर खुलेगा!</span>
                </p>
                <p className="text-[10px] text-amber-100/90 leading-tight">
                  नाहाटा जनरल स्टोर्स पर अपनी रोजमर्रा, किराना या गिफ्ट खरीदारी पर यह कूपन दिखाएं और अपना स्पेशल गिफ्ट हैम्पर व महा-बचत छूट प्राप्त करें!
                </p>
              </div>

              {/* Action 1: Send Coupon to Manoj Bhaiya via WhatsApp */}
              <a
                href={whatsappClaimUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-950/40 flex items-center justify-center gap-2 text-center transition-all active:scale-98 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-current shrink-0" />
                <span>मनोज भैया को WhatsApp करें & ऑफर का लाभ उठाएं</span>
              </a>

              {/* Action 2: Store Visit & Directions Button */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    'Nahata General Stores, Bus Stand Road, Kushalgarh, Rajasthan'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#FFAE00] text-[#200207] font-black text-xs flex items-center justify-center gap-1 shadow-md active:scale-95 transition-all text-center"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#5B0716] shrink-0" />
                  <span>दुकान का पता (नक्शा)</span>
                </a>

                <a
                  href={`tel:${campaign.whatsapp_number || '9829012345'}`}
                  className="py-2.5 px-2 rounded-xl bg-black/60 border border-[#FFD700]/40 text-amber-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all text-center"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>मनोज भैया को कॉल</span>
                </a>
              </div>

              {/* Bottom Navigation & Reset option */}
              <div className="pt-1 pb-1 text-center flex items-center justify-center gap-3 text-[10px] text-amber-200/70">
                <button
                  type="button"
                  onClick={() => setShowRulesSheet(true)}
                  className="hover:underline hover:text-white"
                >
                  📋 नियम व शर्तें
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setStage(FunnelStage.WELCOME)}
                  className="hover:underline hover:text-white"
                >
                  🔄 मुख्य पृष्ठ पर जाएं
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Persistent Bottom Micro-Footer */}
      <footer className="w-full text-center py-1.5 px-2 border-t border-[#FFD700]/20 bg-black/40 z-20 shrink-0 text-[10px] text-amber-200/70">
        <span>नाहाटा जनरल स्टोर्स • बस स्टैंड रोड, कुशलगढ़ (राजस्थान) • प्रो. मनोज भैया</span>
      </footer>

      {/* Expandable Bottom Sheet for Rules & Store Details */}
      <OfferRulesSheet
        isOpen={showRulesSheet}
        onClose={() => setShowRulesSheet(false)}
        campaign={campaign}
      />
    </div>
  );
}
