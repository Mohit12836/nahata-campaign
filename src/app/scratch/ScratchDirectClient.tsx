'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Gift,
  Trophy,
  PartyPopper,
  ShoppingBag,
  Share2,
  CheckCircle2,
  MapPin,
  PhoneCall,
  Volume2,
  VolumeX,
  Wand2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { soundEngine } from '@/lib/audio';
import { claimCampaignPrizeAction } from '@/app/actions/campaign';
import { INITIAL_CAMPAIGN } from '@/lib/mock-data';
import { Coupon, Prize } from '@/types';
import { ScratchCard } from '@/components/ScratchCard';

// Structured coupon probabilities requested by user:
// 85% -> ₹50 Coupon
// 13% -> ₹100 Coupon
// 2%  -> ₹500 Coupon
interface DirectPrizeTier {
  id: string;
  amount: number;
  probability: number;
  label: string;
  badge: string;
  tagline: string;
  color: string;
}

const PRIZE_TIERS: DirectPrizeTier[] = [
  {
    id: 'prz-scratch-50',
    amount: 50,
    probability: 85,
    label: '₹50 कूपन',
    badge: '85% ग्राहकों के लिए',
    tagline: 'खरीदारी पर ₹50 की सीधी छूट + लकी गिफ्ट हैम्पर',
    color: 'from-amber-500 via-amber-400 to-yellow-500',
  },
  {
    id: 'prz-scratch-100',
    amount: 100,
    probability: 13,
    label: '₹100 कूपन',
    badge: '13% ग्राहकों के लिए',
    tagline: 'खरीदारी पर ₹100 की विशेष छूट + लकी गिफ्ट हैम्पर',
    color: 'from-emerald-500 via-green-500 to-teal-600',
  },
  {
    id: 'prz-scratch-500',
    amount: 500,
    probability: 2,
    label: '₹500 बम्पर कूपन',
    badge: '🏆 2% लकी ग्राहकों के लिए',
    tagline: 'महा-धमाका! ₹500 का भव्य वाउचर + रॉयल गिफ्ट हैम्पर',
    color: 'from-purple-600 via-pink-500 to-rose-500',
  },
];

// Weighted selection matching exactly 85% / 13% / 2%
function pickScratchPrize(): DirectPrizeTier {
  const rand = Math.random() * 100;
  if (rand < 85) return PRIZE_TIERS[0]; // 85%
  if (rand < 98) return PRIZE_TIERS[1]; // 13% (85 to 98)
  return PRIZE_TIERS[2]; // 2% (98 to 100)
}

export default function ScratchDirectClient() {
  const [selectedPrize, setSelectedPrize] = useState<DirectPrizeTier>(PRIZE_TIERS[0]);
  const [isScratched, setIsScratched] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);

  // Claim State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: 'कुशलगढ़',
  });

  // Final Won Coupon
  const [claimedCoupon, setClaimedCoupon] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Pick random prize on mount & ensure fresh scratchable card
  useEffect(() => {
    const picked = pickScratchPrize();
    setSelectedPrize(picked);
  }, []);

  const triggerCelebration = useCallback(() => {
    try {
      soundEngine.playCelebrationChime();
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#FFC857', '#FFB020', '#10B981', '#E11D48', '#FFFFFF'],
      });
    } catch {}
  }, []);

  const toggleSound = () => {
    const nextMuted = soundEngine.toggleMute();
    setIsMuted(nextMuted);
  };

  // Claim Form Submit
  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.fullName || formData.fullName.trim().length < 2) {
      setFormError('कृपया अपना पूरा नाम दर्ज करें।');
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setFormError('कृपया 10 अंकों का वैध मोबाइल नंबर (6, 7, 8 या 9 से शुरू) दर्ज करें।');
      return;
    }

    setIsSubmitting(true);
    try {
      // Map directly to server action
      const prizeTitleFormatted = `🎉 ${selectedPrize.label} (${selectedPrize.tagline}) + 🎁 निश्चित गिफ्ट हैम्पर`;

      const res = await claimCampaignPrizeAction({
        campaignId: INITIAL_CAMPAIGN.id,
        fullName: formData.fullName.trim(),
        phone: cleanPhone,
        city: formData.city.trim() || 'कुशलगढ़',
        businessCategory: 'घरेलू उपभोक्ता (Family / Home)',
        gameType: 'scratch',
        consent: true,
        targetPrizeId: selectedPrize.id,
      });

      if (res.status === 'ERROR') {
        setFormError(res.message || 'कूपन जारी करने में असमर्थ। कृपया पुनः प्रयास करें।');
        setIsSubmitting(false);
        return;
      }

      const couponObj: Coupon = res.coupon || {
        id: `coup-${Date.now()}`,
        campaign_id: INITIAL_CAMPAIGN.id,
        customer_id: res.customer?.id || `cust-${Date.now()}`,
        prize_id: selectedPrize.id,
        code: `NAHATA-${selectedPrize.amount}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'valid',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        prize: {
          id: selectedPrize.id,
          campaign_id: INITIAL_CAMPAIGN.id,
          title: prizeTitleFormatted,
          discount_type: 'percentage',
          discount_value: selectedPrize.amount,
          min_order_value: 1000,
          probability_weight: selectedPrize.probability,
          total_quantity: 1000,
          claimed_quantity: 1,
          is_active: true,
          terms_and_conditions: '₹1,000 की खरीदारी पर ₹50 Extra व कूपन लागू + निश्चित गिफ्ट हैम्पर',
          badge_color: selectedPrize.color,
        },
      };

      setClaimedCoupon(couponObj);
      try {
        localStorage.setItem('nahata_direct_scratch_coupon', JSON.stringify(couponObj));
      } catch {}

      triggerCelebration();
    } catch {
      setFormError('सर्वर से संपर्क करने में समस्या हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (!claimedCoupon) return;
    navigator.clipboard.writeText(claimedCoupon.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // WhatsApp share link for this coupon
  const getWhatsAppShareUrl = () => {
    const text = `🎁 *हर खरीदारी पर गिफ्ट हैम्पर!*

🛍️ ₹1,000 की खरीदारी पर ₹50 EXTRA

🎟️ *Scratch & Win — हर कूपन में इनाम!*
- 🎉 ₹50 कूपन — 85% ग्राहकों के लिए
- 🎁 ₹100 कूपन — 13% ग्राहकों के लिए
- 🏆 ₹500 कूपन — 2% ग्राहकों के लिए

🎁 *गिफ्ट हैम्पर भी मिलेगा!*

**Nahata General Stores**
खरीदारी करें, स्क्रैच करें और इनाम जीतें!

👇 अपना लकी कार्ड अभी स्क्रैच करें:
👉 ${typeof window !== 'undefined' ? window.location.href : 'https://nahata-campaign.vercel.app/scratch'}`;

    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  const getWhatsAppClaimUrl = () => {
    if (!claimedCoupon) return '#';
    const text = `🚩 *जय जिनेन्द्र / जय माता दी!* 🚩

नमस्ते मनोज भैया,
मैंने *नाहाटा जनरल स्टोर्स (बस स्टैंड रोड, कुशलगढ़)* का Scratch & Win कूपन अनलॉक कर लिया है!

🎟️ *कूपन कोड:* *${claimedCoupon.code}*
👤 *ग्राहक:* ${formData.fullName || 'ग्राहक'}
📞 *मोबाइल:* ${formData.phone || ''}
🎁 *जीता गया इनाम:* ${selectedPrize.label} (${selectedPrize.tagline})
🛍️ *ऑफर:* ₹1,000 की खरीदारी पर ₹50 EXTRA + निश्चित गिफ्ट हैम्पर!

📍 मैं जल्द ही दुकान पर आकर खरीदारी करके अपने कूपन व गिफ्ट हैम्पर का लाभ उठाऊँगा। कृपया मेरा कूपन रिकॉर्ड में दर्ज कर लें। धन्यवाद!`;

    return `https://wa.me/918290447144?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-[100dvh] bg-[#120104] text-[#FFF4D8] flex flex-col justify-between selection:bg-[#FFC857] selection:text-[#26030A]">
      {/* Top Banner Header */}
      <header className="sticky top-0 z-30 bg-[#26030A]/95 backdrop-blur-md border-b border-[#FFC857]/30 px-3 py-2.5 shadow-md">
        <div className="w-full max-w-[520px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#FFC857]/60 shadow bg-[#3A060F] shrink-0">
              <Image
                src="/nahata-logo.jpg"
                alt="नाहाटा जनरल स्टोर्स"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-black text-[#FFE89B] tracking-tight truncate leading-tight group-hover:text-amber-300">
                नाहाटा जनरल स्टोर्स
              </h1>
              <p className="text-[10px] text-[#E8D9D0] truncate flex items-center gap-1 font-medium">
                <MapPin className="w-2.5 h-2.5 text-[#FFC857]" /> बस स्टैंड रोड, कुशलगढ़ (राज.)
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleSound}
              type="button"
              className="p-1.5 rounded-lg bg-[#3A060F] border border-[#FFC857]/40 text-[#FFC857] hover:bg-[#5B0716] transition-colors"
              title={isMuted ? 'ध्वनि चालू करें' : 'ध्वनि म्यूट करें'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 animate-pulse" />}
            </button>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#17864B] text-white border border-[#22c55e]/50 shadow-xs">
              LIVE
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[520px] mx-auto px-3.5 py-4 flex flex-col justify-center space-y-4">
        {/* Campaign Announcement Hero Card */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#FFC857]/20 via-[#FFB020]/30 to-[#FFC857]/20 border border-[#FFC857]/50 text-[#FFE89B] text-xs font-black shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-[#FFC857] animate-spin" />
            <span>हर खरीदारी पर गिफ्ट हैम्पर!</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-md">
            🛍️ ₹1,000 की खरीदारी पर <span className="text-[#FFC857]">₹50 EXTRA</span>
          </h2>

          <p className="text-xs text-[#E8D9D0] font-semibold flex items-center justify-center gap-1">
            <PartyPopper className="w-3.5 h-3.5 text-[#FFC857]" />
            <span>Scratch & Win — हर कूपन में पक्का इनाम!</span>
          </p>
        </div>

        {/* The 3 Probability Badges directly visible */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xl bg-gradient-to-b from-[#26030A] to-[#3A060F] border border-amber-500/40 shadow">
            <span className="text-base sm:text-lg font-black text-amber-300 block">₹50</span>
            <span className="text-[9.5px] font-bold text-amber-100 block">85% ग्राहकों को</span>
          </div>

          <div className="p-2 rounded-xl bg-gradient-to-b from-[#26030A] to-[#123821] border border-emerald-500/40 shadow">
            <span className="text-base sm:text-lg font-black text-emerald-300 block">₹100</span>
            <span className="text-[9.5px] font-bold text-emerald-100 block">13% ग्राहकों को</span>
          </div>

          <div className="p-2 rounded-xl bg-gradient-to-b from-[#26030A] to-[#3f123c] border border-pink-500/40 shadow">
            <span className="text-base sm:text-lg font-black text-pink-300 block">₹500</span>
            <span className="text-[9.5px] font-bold text-pink-100 block">🏆 2% बम्पर</span>
          </div>
        </div>

        {/* Scratch Card Section or Claimed Card */}
        {!claimedCoupon ? (
          <div className="w-full max-w-[360px] mx-auto">
            <ScratchCard
              prize={{
                id: selectedPrize.id,
                campaign_id: INITIAL_CAMPAIGN.id,
                title: selectedPrize.label,
                discount_type: 'percentage',
                discount_value: selectedPrize.amount,
                min_order_value: 1000,
                probability_weight: selectedPrize.probability,
                total_quantity: 1000,
                claimed_quantity: 1,
                is_active: true,
                terms_and_conditions: `${selectedPrize.tagline} • ₹1,000 की खरीदारी पर ₹50 EXTRA`,
                badge_color: selectedPrize.color,
              }}
              onScratchComplete={() => {
                setIsScratched(true);
                setScratchPercent(100);
                triggerCelebration();
              }}
            />
          </div>
        ) : null}

        {/* Claim Form (Only visible once scratched and not claimed) */}
        {isScratched && !claimedCoupon && (
          <div className="w-full max-w-[380px] mx-auto bg-gradient-to-b from-[#FFFDF7] to-[#FFF5E6] text-slate-900 rounded-3xl shadow-2xl border-2 border-[#FFC857] p-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center space-y-0.5 mb-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-900 border border-amber-400/50">
                <Sparkles className="w-3 h-3 text-amber-600" /> केवल 1 चरण शेष है!
              </span>
              <h3 className="text-base font-black text-amber-950 leading-tight">
                अपना कूपन कोड तुरंत प्राप्त करें
              </h3>
              <p className="text-[10.5px] text-amber-900/80 font-medium">
                यह कूपन नाहाटा जनरल स्टोर्स पर खरीदारी करते समय मान्य होगा।
              </p>
            </div>

            {formError && (
              <div className="mb-3 p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleClaimSubmit} className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  आपका शुभ नाम *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. राहुल जैन"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#86152B] text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  व्हाट्सएप मोबाइल नंबर *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10 अंकों का मोबाइल नंबर"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#86152B] text-slate-900"
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#86152B] via-[#A81837] to-[#86152B] hover:brightness-110 text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>कूपन तैयार हो रहा है...</span>
                  ) : (
                    <>
                      <Gift className="w-4 h-4 text-amber-300" />
                      <span>कूपन क्लेम करें & WhatsApp पर प्राप्त करें</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Claimed Coupon Success Card */}
        {claimedCoupon && (
          <div className="w-full max-w-[400px] mx-auto bg-gradient-to-b from-[#26030A] via-[#3A060F] to-[#1F0207] text-[#FFF4D8] rounded-3xl p-4 border-2 border-[#FFC857] shadow-2xl space-y-3.5 animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-1">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-black bg-[#17864B] text-white">
                <CheckCircle2 className="w-3 h-3" /> कूपन सफलतापूर्वक अनलॉक!
              </span>
              <h3 className="text-lg font-black text-[#FFE89B]">
                {selectedPrize.label} + गिफ्ट हैम्पर
              </h3>
              <p className="text-[11px] text-[#E8D9D0]">
                नाहाटा जनरल स्टोर्स (बस स्टैंड रोड, कुशलगढ़) पर खरीदारी पर प्रस्तुत करें।
              </p>
            </div>

            {/* Coupon Code Pill */}
            <div className="bg-[#120104] p-3 rounded-2xl border border-dashed border-[#FFC857]/70 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[#FFC857] font-bold block">
                  कूपन कोड
                </span>
                <span className="text-base font-black tracking-wider text-white font-mono">
                  {claimedCoupon.code}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="py-1.5 px-3 rounded-xl bg-[#FFC857] text-[#26030A] text-xs font-black flex items-center gap-1 active:scale-95 transition-all"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'कॉपी हुआ' : 'कॉपी करें'}</span>
              </button>
            </div>

            {/* Key Benefits Recap */}
            <div className="bg-[#5B0716]/40 p-2.5 rounded-xl border border-[#FFC857]/30 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-amber-200 font-bold">
                <ShoppingBag className="w-3.5 h-3.5 text-[#FFC857]" />
                <span>₹1,000 की खरीदारी पर ₹50 EXTRA लाभ</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                <Gift className="w-3.5 h-3.5 text-emerald-400" />
                <span>हर खरीदारी पर पक्का गिफ्ट हैम्पर</span>
              </div>
            </div>

            {/* Primary Action: Send to Manoj Bhaiya WhatsApp */}
            <div className="space-y-2 pt-1">
              <a
                href={getWhatsAppClaimUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-[#17864B] hover:bg-[#157340] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
              >
                <PhoneCall className="w-4 h-4" />
                <span>मनोज भैया को WhatsApp पर कूपन भेजें</span>
              </a>

              <a
                href={getWhatsAppShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-[#26030A] hover:bg-[#3A060F] border border-[#FFC857]/50 text-[#FFE89B] font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <Share2 className="w-3.5 h-3.5 text-[#FFC857]" />
                <span>दोस्तों / परिवार को WhatsApp पर शेयर करें</span>
              </a>
            </div>
          </div>
        )}

        {/* Offer Terms & Rules Card */}
        <div className="w-full max-w-[420px] mx-auto bg-[#1C0207] p-3.5 rounded-2xl border border-[#FFC857]/20 space-y-2 text-left">
          <div className="flex items-center gap-1.5 text-[#FFE89B] text-xs font-black">
            <ShieldCheck className="w-4 h-4 text-[#FFC857]" />
            <span>ऑफर विवरण व नियम — Nahata General Stores</span>
          </div>

          <ul className="text-[11px] text-[#E8D9D0] space-y-1 list-disc list-inside font-medium">
            <li>🎁 **हर खरीदारी पर गिफ्ट हैम्पर!** दुकान पर आने वाले हर ग्राहक को सम्मानपूर्वक गिफ्ट दिया जाएगा।</li>
            <li>🛍️ **₹1,000 की खरीदारी पर ₹50 EXTRA** डिस्काउंट तुरंत लागू।</li>
            <li>🎟️ **Scratch & Win:** ₹50 (85%), ₹100 (13%), ₹500 (2% बम्पर इनाम)।</li>
            <li>📍 **स्थान:** नाहाटा जनरल स्टोर्स, बस स्टैंड रोड, कुशलगढ़ (राजस्थान)।</li>
            <li>📞 **संपर्क / WhatsApp:** 8290447144 (मनोज भैया)।</li>
          </ul>

          <div className="text-center pt-2 border-t border-[#FFC857]/10">
            <p className="text-[10px] text-amber-200/80 font-bold">
              खरीदारी करें, स्क्रैच करें और इनाम जीतें! • नाहाटा जनरल स्टोर्स
            </p>
          </div>
        </div>
      </main>

      {/* Footer Sticky Navigation */}
      <footer className="w-full max-w-[520px] mx-auto px-4 py-3 text-center border-t border-[#FFC857]/20 text-[10px] text-[#E8D9D0]/80">
        <div className="flex items-center justify-center gap-3 font-semibold mb-1">
          <Link href="/" className="text-[#FFC857] hover:underline">
            ← मुख्य महोत्सव पेज
          </Link>
          <span>•</span>
          <a
            href="https://wa.me/918290447144"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FFC857] hover:underline"
          >
            WhatsApp संपर्क
          </a>
        </div>
        <p>© 2026 नाहाटा जनरल स्टोर्स, कुशलगढ़ (राजस्थान) • सर्वाधिकार सुरक्षित</p>
      </footer>
    </div>
  );
}
