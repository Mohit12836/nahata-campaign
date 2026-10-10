'use client';

import React, { useState } from 'react';
import { User, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { Campaign, Prize } from '@/types';

interface OfferClaimModalProps {
  campaign?: Campaign;
  prize: Prize;
  onSubmit: (formData: {
    fullName: string;
    phone: string;
    city: string;
    businessCategory: string;
  }) => void;
  isLoading?: boolean;
}

const CITIES = [
  'बीकानेर',
  'नोखा',
  'देशनोक',
  'लूणकरणसर',
  'श्रीडूंगरगढ़',
  'कोलायत',
  'खाजूवाला',
  'नापासर',
  'जयपुर',
  'जोधपुर',
  'अन्य कस्बा / गांव',
];
const CATEGORIES = [
  'घरेलू उपभोक्ता (Family / Home)',
  'दुकानदार / रिटेलर',
  'होलसेलर',
  'विद्यार्थी / स्कूल वर्ग',
  'अन्य ग्राहक',
];

export const OfferClaimModal: React.FC<OfferClaimModalProps> = ({
  prize,
  onSubmit,
  isLoading = false,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('बीकानेर');
  const [businessCategory, setBusinessCategory] = useState('घरेलू उपभोक्ता (Family / Home)');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (!fullName.trim()) {
      setError('कृपया अपना नाम दर्ज करें');
      return;
    }
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर (6, 7, 8 या 9 से शुरू) दर्ज करें');
      return;
    }
    if (!consent) {
      setError('ऑफर प्राप्त करने और व्हाट्सएप पर कूपन कोड पाने के लिए कृपया नीचे सहमति बॉक्स पर टिक करें।');
      return;
    }

    onSubmit({
      fullName: fullName.trim(),
      phone: cleanPhone,
      city,
      businessCategory,
    });
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gradient-to-b from-amber-50 to-orange-50/80 rounded-2xl shadow-xl border-2 border-amber-300 p-5 sm:p-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Header Badge */}
      <div className="text-center space-y-1 mb-5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-900 border border-amber-400/40">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" /> केवल 1 चरण शेष है!
        </span>
        <h3 className="text-xl sm:text-2xl font-black text-amber-950">
          ऑफर क्लेम करने हेतु जानकारी भरें
        </h3>
        <p className="text-xs text-amber-800/80 font-medium">
          कूपन कोड तुरंत स्क्रीन और आपके व्हाट्सएप पर प्राप्त होगा
        </p>
      </div>

      {/* Won Prize Highlight */}
      <div className="mb-5 p-3.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-md flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-200">
            जीता हुआ इनाम
          </span>
          <h4 className="text-base sm:text-lg font-black">{prize.title}</h4>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-yellow-200">
          🎁
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-2.5 rounded-lg bg-red-100 border border-red-300 text-red-800 text-xs font-semibold">
          ⚠️ {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-bold text-amber-950 mb-1">
            आपका पूरा नाम *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-600">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="उदा. मनोज जी नाहटा"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-amber-300 bg-white text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-amber-950 mb-1">
            व्हाट्सएप मोबाइल नंबर *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-600 font-bold text-xs">
              +91
            </div>
            <input
              type="tel"
              required
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="10 अंकों का नंबर (उदा. 9829012345)"
              className="w-full pl-12 pr-3 py-2.5 rounded-xl border border-amber-300 bg-white text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-medium"
            />
          </div>
          <p className="text-[10px] text-amber-900/80 font-medium mt-1">
            🔒 आपका नंबर केवल आपके कूपन को सुरक्षित रखने और दुकान पर सत्यापन के लिए है।
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-amber-950 mb-1">
              शहर / कस्बा
            </label>
            <div className="relative">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-amber-300 bg-white text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-950 mb-1">
              ग्राहक प्रकार (Category)
            </label>
            <div className="relative">
              <select
                value={businessCategory}
                onChange={(e) => setBusinessCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-amber-300 bg-white text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* WhatsApp Consent Checkbox */}
        <label className="flex items-start gap-2 pt-1 cursor-pointer select-none bg-amber-500/10 p-2.5 rounded-xl border border-amber-300/60">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-amber-300 focus:ring-emerald-500 shrink-0"
          />
          <span className="text-[11px] text-amber-950 font-medium leading-tight">
            मुझे नाहाटा जनरल स्टोर्स से इस कूपन की जानकारी एवं विशेष ऑफर पाने की सहमति है। <span className="text-emerald-800 font-bold">(कोई स्पैम नहीं)</span>
          </span>
        </label>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm shadow-lg shadow-emerald-700/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
        >
          {isLoading ? (
            <span>कूपन जनरेट हो रहा है...</span>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>कूपन प्राप्त करें & WhatsApp खोलें</span>
            </>
          )}
        </button>
      </form>

      {/* Trust Guarantee */}
      <div className="mt-4 pt-3 border-t border-amber-200 flex items-center justify-center gap-1.5 text-[11px] text-amber-800 font-semibold">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>100% सुरक्षित • केवल Nahata General Stores पर मान्य</span>
      </div>
    </div>
  );
};
