'use client';

import React from 'react';
import Image from 'next/image';
import { ShieldCheck, PhoneCall, MapPin, Award, Sparkles, MessageSquare, ArrowRight, Store } from 'lucide-react';
import { Campaign } from '@/types';

interface ManojTrustCardProps {
  campaign: Campaign;
}

export const ManojTrustCard: React.FC<ManojTrustCardProps> = ({ campaign }) => {
  return (
    <section className="w-full max-w-md mx-auto my-6 select-none animate-in fade-in zoom-in-95 duration-500">
      {/* Outer Luxury Gold Border Card */}
      <div className="relative rounded-3xl p-1 bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-600 shadow-2xl">
        <div className="relative rounded-[22px] overflow-hidden bg-gradient-to-b from-[#0a1428] via-[#0d1d3d] to-[#060b17] text-white p-5 sm:p-6 border border-yellow-400/30">
          
          {/* Subtle Golden Geometric Flourish in Background */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-amber-400/15 via-transparent to-transparent rounded-bl-full pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-yellow-500/15 via-transparent to-transparent rounded-tr-full pointer-events-none" />

          {/* Special Offer Ribbon Badge */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-amber-500/30">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" /> SPECIAL OFFER
            </span>
            <span className="text-[11px] font-bold text-amber-300/90 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-yellow-400" />
              <span>30+ वर्षों का अटूट विश्वास</span>
            </span>
          </div>

          {/* Manoj Nahata Title & Photo Showcase */}
          <div className="mt-4 flex flex-col items-center text-center space-y-3">
            {/* Portrait Container */}
            <div className="relative group">
              {/* Golden Rotating Aura Halo */}
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 rounded-2xl blur-md opacity-75 group-hover:opacity-100 transition-opacity animate-pulse" />
              
              <div className="relative w-36 h-48 sm:w-40 sm:h-52 rounded-2xl overflow-hidden border-2 border-yellow-300 shadow-2xl bg-slate-900">
                <Image
                  src={campaign.owner_photo_url || '/manoj-nahata.jpg'}
                  alt="श्री मनोज नाहटा - नाहाटा जनरल स्टोर्स कुशलगढ़"
                  fill
                  priority
                  unoptimized
                  className="object-cover object-top hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Verified Owner Seal */}
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-lg border border-white/60 flex items-center gap-1 whitespace-nowrap">
                <ShieldCheck className="w-3 h-3 text-emerald-800" />
                <span>संस्थापक • मनोज नाहटा</span>
              </div>
            </div>

            {/* Typography */}
            <div className="pt-1 space-y-0.5">
              <h3 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-300 to-yellow-200 drop-shadow-md tracking-tight">
                MANOJ NAHATA
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-amber-200/90 italic">
                — आपके भरोसे का नाम —
              </p>
              <div className="pt-1 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-lg bg-amber-400/15 border border-amber-400/40 text-[11px] font-bold text-amber-300">
                <span>EXCLUSIVE DEALS</span>
                <span>•</span>
                <span>BEST VALUE</span>
              </div>
            </div>
          </div>

          {/* Personal Message Quote from Manoj Ji */}
          <div className="mt-4 p-3.5 rounded-2xl bg-slate-900/80 border border-amber-500/30 text-center space-y-1.5 backdrop-blur-sm">
            <p className="text-xs text-amber-100/95 leading-relaxed font-medium">
              &quot;कुशलगढ़ और आसपास के परिवारों की सेवा करना ही हमारी प्राथमिकता है। इस फेस्टिवल पर हर ग्राहक के लिए पक्का उपहार और बाजार से कम होलसेल दाम की गारंटी!&quot;
            </p>
            <span className="text-[10px] font-bold text-amber-400 block">
              — श्री मनोज नाहटा (नाहाटा जनरल स्टोर्स)
            </span>
          </div>

          {/* Store & Shop Address Pillars */}
          <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-slate-200 bg-black/40 p-3 rounded-2xl border border-white/5">
            <div className="flex items-start gap-2">
              <Store className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-200 block">
                  {campaign.store_name} ({campaign.shop_number || 'दुकान नं. 14, नाहटा कॉम्प्लेक्स'})
                </span>
                <span className="text-[11px] text-slate-300">
                  {campaign.location}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-white/5">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="text-[11px] text-amber-300 font-semibold">
                कुशलगढ़, सज्जनगढ़, कालिंजरा व नजदीकी गांवों के लिए होम डिलीवरी उपलब्ध
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-4 space-y-2">
            <a
              href={`https://wa.me/${campaign.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent('नमस्ते मनोज जी, मैं नाहाटा जनरल स्टोर्स के फेस्टिवल ऑफर के संबंध में संपर्क कर रहा हूँ।')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all text-center"
            >
              <MessageSquare className="w-4 h-4 fill-slate-950" />
              <span>मनोज जी से सीधे WhatsApp पर बात करें</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <div className="flex items-center justify-center gap-3 text-xs text-amber-300/90 pt-1">
              <a
                href={`tel:+${campaign.whatsapp_number}`}
                className="inline-flex items-center gap-1 font-bold text-emerald-400 hover:text-emerald-300"
              >
                <PhoneCall className="w-3.5 h-3.5" /> फोन: +{campaign.whatsapp_number}
              </a>
              <span>•</span>
              <span className="font-medium text-amber-200/80">सुबह 9:00 से रात 9:00</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
