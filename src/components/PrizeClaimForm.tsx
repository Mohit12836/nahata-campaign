'use client';

import React, { useState } from 'react';
import { User, ShieldCheck, Sparkles, CheckCircle2, Phone, MapPin, ArrowRight } from 'lucide-react';
import { Prize } from '@/types';

interface PrizeClaimFormProps {
  prize: Prize;
  onSubmit: (formData: {
    fullName: string;
    phone: string;
    city: string;
    businessCategory: string;
  }) => Promise<void> | void;
  isLoading?: boolean;
  errorMessage?: string | null;
  onBackToPlay?: () => void;
}

const CITIES = [
  'कुशलगढ़',
  'बांसवाड़ा',
  'सज्जनगढ़',
  'कालिंजरा',
  'गांगड़तलाई',
  'छोटी सरवन',
  'रतलाम',
  'दाहोद',
  'डूंगरपुर',
  'अन्य गांव / कस्बा',
];

export const PrizeClaimForm: React.FC<PrizeClaimFormProps> = ({
  prize,
  onSubmit,
  isLoading = false,
  errorMessage = null,
  onBackToPlay,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('कुशलगढ़');
  const [consent, setConsent] = useState(true);
  const [localError, setLocalError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    const cleanName = fullName.trim();
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    if (!cleanName || cleanName.length < 2) {
      setLocalError('कृपया अपना पूरा नाम (कम से कम 2 अक्षर) दर्ज करें।');
      return;
    }

    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setLocalError('कृपया 10-अंकों का वैध भारतीय मोबाइल नंबर (6, 7, 8 या 9 से शुरू) दर्ज करें।');
      return;
    }

    if (!consent) {
      setLocalError('कूपन कोड प्राप्त करने हेतु कृपया सहमति बॉक्स टिक करें।');
      return;
    }

    onSubmit({
      fullName: cleanName,
      phone: cleanPhone,
      city,
      businessCategory: 'घरेलू उपभोक्ता (Family / Home)',
    });
  };

  const activeError = localError || errorMessage;

  return (
    <div className="w-full max-w-sm mx-auto bg-gradient-to-b from-[#FFF4D8] via-[#FFF9EC] to-[#FFF4D8] text-[#26030A] rounded-2xl shadow-2xl border-2 border-[#FFC857] p-4 sm:p-5 select-none animate-in fade-in zoom-in-95 duration-300">
      {/* Header Badge */}
      <div className="text-center space-y-1 mb-3">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FFC857]/30 text-[#5B0716] border border-[#FFC857]">
          <Sparkles className="w-3 h-3 text-[#FFB020]" />
          <span>बधाई हो! आपका ऑफर तैयार है</span>
        </span>
        <h3 className="text-base sm:text-lg font-black text-[#5B0716] tracking-tight">
          अपना डिजिटल कूपन प्राप्त करें
        </h3>
        <p className="text-[10px] text-[#26030A]/70 font-medium">
          कूपन कोड स्क्रीन व आपके WhatsApp पर तुरंत दिखाई देगा
        </p>
      </div>

      {/* Confirmed Prize Card */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-[#5B0716] via-[#86152B] to-[#5B0716] text-[#FFF4D8] shadow-md flex items-center justify-between mb-3 border border-[#FFC857]/40">
        <div className="min-w-0 pr-2">
          <span className="text-[9px] font-black text-[#FFC857] uppercase tracking-wider block">
            🎉 आपका पक्का इनाम
          </span>
          <h4 className="text-sm sm:text-base font-black truncate leading-tight mt-0.5 text-white">
            {prize.title}
          </h4>
          <p className="text-[10px] text-[#E8D9D0] truncate mt-0.5">
            {prize.terms_and_conditions}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#FFC857]/20 border border-[#FFC857]/40 flex items-center justify-center text-xl shrink-0">
          🎁
        </div>
      </div>

      {/* Error Message */}
      {activeError && (
        <div className="p-2 mb-2.5 rounded-xl bg-red-100 border border-red-300 text-red-900 text-[11px] font-bold animate-in fade-in">
          ⚠️ {activeError}
        </div>
      )}

      {/* Claim Form */}
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div>
          <label className="block text-[11px] font-bold text-[#26030A] mb-0.5">
            आपका नाम *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#86152B]">
              <User className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="उदा. राहुल जैन"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#FFC857] bg-white text-xs text-[#26030A] focus:ring-2 focus:ring-[#FFC857] outline-none font-medium placeholder:text-stone-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#26030A] mb-0.5">
            WhatsApp मोबाइल नंबर *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#17864B] font-black text-xs">
              +91
            </span>
            <input
              type="tel"
              required
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="10 अंकों का मोबाइल नंबर"
              className="w-full pl-11 pr-3 py-2 rounded-xl border border-[#FFC857] bg-white text-xs text-[#26030A] focus:ring-2 focus:ring-[#FFC857] outline-none font-bold placeholder:text-stone-400"
            />
          </div>
          <p className="text-[9px] text-[#26030A]/60 mt-0.5">
            🔒 नंबर केवल कूपन सत्यापन और सुरक्षा हेतु उपयोग होगा।
          </p>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#26030A] mb-0.5">
            शहर / कस्बा
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#86152B] pointer-events-none">
              <MapPin className="w-3.5 h-3.5" />
            </span>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#FFC857] bg-white text-xs text-[#26030A] focus:ring-2 focus:ring-[#FFC857] outline-none font-medium"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* WhatsApp Consent Checkbox */}
        <label className="flex items-start gap-2 cursor-pointer bg-[#FFC857]/15 p-2 rounded-xl border border-[#FFC857]/40">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 w-3.5 h-3.5 text-[#17864B] rounded border-[#FFC857] focus:ring-[#17864B] shrink-0"
          />
          <span className="text-[10px] text-[#26030A] font-medium leading-tight">
            मुझे नाहाटा जनरल स्टोर्स से यह कूपन व ऑफर WhatsApp पर पाने की सहमति है।
          </span>
        </label>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#17864B] via-[#1ea35c] to-[#17864B] hover:from-[#136f3e] text-white font-black text-xs shadow-lg shadow-[#17864B]/30 active:scale-98 transition-all flex items-center justify-center gap-1.5"
        >
          {isLoading ? (
            <span>कूपन जनरेट हो रहा है...</span>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>मेरा कूपन प्राप्त करें</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Back to play option */}
      {onBackToPlay && (
        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={onBackToPlay}
            className="text-[10px] text-[#5B0716] hover:underline font-bold"
          >
            ← वापस गेम देखें
          </button>
        </div>
      )}
    </div>
  );
};
