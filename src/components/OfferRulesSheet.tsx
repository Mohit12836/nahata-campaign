'use client';

import React from 'react';
import Image from 'next/image';
import {
  X,
  MapPin,
  PhoneCall,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Campaign } from '@/types';

interface OfferRulesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
}

export const OfferRulesSheet: React.FC<OfferRulesSheetProps> = ({
  isOpen,
  onClose,
  campaign,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end justify-center p-0 sm:p-4">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            className="w-full max-w-md bg-gradient-to-b from-[#26030A] via-[#3B0711] to-[#140105] border-t sm:border border-[#FFC857]/40 rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 max-h-[85vh] overflow-y-auto space-y-4 text-xs text-[#FFF4D8] shadow-2xl"
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1 bg-[#FFC857]/40 rounded-full mx-auto -mt-1 mb-2" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#FFC857]/20 pb-2.5">
              <div>
                <h3 className="text-base font-black text-[#FFC857] flex items-center gap-1.5">
                  <span>🏪</span> {campaign.store_name}
                </h3>
                <p className="text-[11px] text-[#E8D9D0]">दुकान विवरण, नियम व सत्यापन</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full bg-[#5B0716] hover:bg-[#86152B] text-[#FFF4D8] border border-[#FFC857]/30 transition-transform active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Proprietor Trust Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#5B0716]/60 to-[#26030A]/80 border border-[#FFC857]/30 flex items-center gap-3.5 shadow-md">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#FFC857] shrink-0 relative shadow-md bg-black">
                <Image
                  src={campaign.owner_photo_url || '/manoj-nahata.jpg'}
                  alt="श्री मनोज नाहाटा"
                  fill
                  unoptimized
                  className="object-cover object-top"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-[#FFC857] text-[#26030A] px-1.5 py-0.2 rounded font-mono">
                    संचालक
                  </span>
                  <span className="text-[10px] text-[#FFC857] font-bold">30+ वर्षों का विश्वास</span>
                </div>
                <h4 className="font-black text-white text-sm mt-0.5">
                  {campaign.contact_person || 'श्री मनोज नाहाटा'}
                </h4>
                <p className="text-[10px] text-[#FFF4D8]/80 italic mt-0.5 leading-tight">
                  &ldquo;{campaign.owner_quote || 'कुशलगढ़ का अपना परिवार • अटूट विश्वास और शुद्धता की गारंटी!'}&rdquo;
                </p>
              </div>
            </div>

            {/* Store Address & Contact */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-[#FFC857]/20 space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block text-[11px]">दुकान का वास्तविक पता:</span>
                  <span className="text-[11px] text-[#E8D9D0]">
                    बस स्टैंड रोड, कुशलगढ़, जिला बांसवाड़ा (राजस्थान) — 327801
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-white/10 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-[#FFC857] shrink-0" />
                <span className="text-[#E8D9D0]">दुकान का समय: सुबह 9:00 बजे से रात 9:00 बजे तक</span>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-white/10 text-[11px]">
                <PhoneCall className="w-3.5 h-3.5 text-[#17864B] shrink-0" />
                <a
                  href={`tel:${campaign.whatsapp_number || '9829012345'}`}
                  className="text-[#FFC857] hover:underline font-bold"
                >
                  सीधा संपर्क: +{campaign.whatsapp_number || '9829012345'}
                </a>
              </div>
            </div>

            {/* Campaign Rules & Conditions */}
            <div className="p-3.5 rounded-2xl bg-[#FFF4D8] text-[#26030A] space-y-2 shadow-inner">
              <h4 className="font-black text-xs text-[#5B0716] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#17864B]" />
                <span>लकी ड्रॉ ऑफर के आधिकारिक नियम:</span>
              </h4>
              <ul className="space-y-1.5 text-[11px] leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#17864B] shrink-0 mt-0.5" />
                  <span><strong>100% नि:शुल्क:</strong> यह लकी ड्रॉ पूर्णतया मुफ़्त है, कोई भी प्रवेश शुल्क नहीं है।</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#17864B] shrink-0 mt-0.5" />
                  <span><strong>प्रति ग्राहक 1 कूपन:</strong> एक मोबाइल नंबर पर 1 ही डिस्काउंट कूपन मान्य होगा।</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#17864B] shrink-0 mt-0.5" />
                  <span><strong>काउंटर रिडेम्पशन:</strong> बिलिंग कराने से पहले अपना यूनिक कूपन कोड दुकान के गल्ले/काउंटर पर दिखाएं।</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#17864B] shrink-0 mt-0.5" />
                  <span><strong>वैधता:</strong> कूपन जारी होने के 7 दिनों तक मान्य रहेगा।</span>
                </li>
              </ul>
            </div>

            {/* Direct Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Nahata+General+Stores+Bus+Stand+Road+Kushalgarh+Rajasthan"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-[#5B0716] to-[#86152B] hover:from-[#86152B] text-[#FFF4D8] font-bold text-[11px] flex items-center justify-center gap-1 border border-[#FFC857]/40 shadow-md active:scale-95 transition-all text-center"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Google Maps दिशा 📍</span>
              </a>

              <a
                href={`tel:${campaign.whatsapp_number || '9829012345'}`}
                className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-[#17864B] to-emerald-700 hover:from-emerald-600 text-white font-bold text-[11px] flex items-center justify-center gap-1 border border-emerald-400/40 shadow-md active:scale-95 transition-all text-center"
              >
                <PhoneCall className="w-3.5 h-3.5 text-white shrink-0" />
                <span>मनोज जी से बात 📞</span>
              </a>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#FFC857] hover:bg-[#FFB020] text-[#26030A] font-black text-xs transition-colors shadow-md active:scale-98"
            >
              वापस ऑफर पर जाएं
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
