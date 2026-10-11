'use client';

import React, { useState } from 'react';
import { User, ShieldCheck, Sparkles, CheckCircle2, Phone, AlertCircle } from 'lucide-react';
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
  'कुशलगढ़ (स्थानीय)',
  'बांसवाड़ा',
  'सज्जनगढ़',
  'कालिंजरा',
  'गांगड़तलाई',
  'छोटी सरवन',
  'रतलाम',
  'दाहोद',
  'अन्य गांव / कस्बा',
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
  const [city, setCity] = useState('कुशलगढ़ (स्थानीय)');
  const [businessCategory, setBusinessCategory] = useState('घरेलू उपभोक्ता (Family / Home)');
  const [consent, setConsent] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('कृपया अपना पूरा नाम (न्यूनतम 2 अक्षर) दर्ज करें।');
      return;
    }
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर (6, 7, 8 या 9 से शुरू) दर्ज करें।');
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
    <div className="w-full max-w-md mx-auto bg-gradient-to-b from-[#FFFDF7] to-[#FFF5E6] text-slate-900 rounded-3xl shadow-2xl border-2 border-amber-400 p-4 sm:p-5 animate-in fade-in zoom-in-95 duration-300 max-h-[85vh] overflow-y-auto">
      {/* Header Badge */}
      <div className="text-center space-y-1 mb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-black bg-amber-500/15 text-amber-900 border border-amber-400/50">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" /> केवल 1 चरण शेष है!
        </span>
        <h3 className="text-lg sm:text-xl font-black text-amber-950 leading-tight">
          बधाई हो! आपका ऑफर तैयार है
        </h3>
        <p className="text-xs text-amber-900/80 font-medium">
          अपना नाम व मोबाइल नंबर दर्ज कर तुरंत डिजिटल कूपन प्राप्त करें
        </p>
      </div>

      {/* Won Prize Highlight Card */}
      <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-[#86152B] via-[#A81837] to-[#86152B] text-white shadow-md border border-amber-300 flex items-center justify-between">
        <div className="space-y-0.5 pr-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-200 block">
            🎉 आपका अनलॉक हुआ लकी इनाम
          </span>
          <h4 className="text-sm sm:text-base font-black text-white leading-tight">
            {prize.title}
          </h4>
          <p className="text-[10px] text-amber-100/90 font-medium">
            {prize.terms_and_conditions}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-amber-400/20 text-yellow-300 flex items-center justify-center shrink-0 border border-amber-400/40 text-lg">
          🎁
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-3 p-2.5 rounded-xl bg-red-100 border border-red-300 text-red-900 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-amber-950 mb-1">
            आपका पूरा नाम *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-700">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="उदा. राहुल शर्मा"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-amber-300 bg-white text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none shadow-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-amber-950 mb-1">
            व्हाट्सएप मोबाइल नंबर *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-700 font-bold text-xs">
              +91
            </div>
            <input
              type="tel"
              required
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="10 अंकों का नंबर (उदा. 9829012345)"
              className="w-full pl-12 pr-3 py-2.5 rounded-xl border border-amber-300 bg-white text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-medium shadow-sm"
            />
          </div>
          <p className="text-[10px] text-amber-900/80 font-medium mt-1">
            🔒 आपका नंबर केवल आपके कूपन को सुरक्षित रखने और दुकान पर सत्यापन के लिए है।
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold text-amber-950 mb-1">
              शहर / कस्बा
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-amber-300 bg-white text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none shadow-sm"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-950 mb-1">
              ग्राहक प्रकार
            </label>
            <select
              value={businessCategory}
              onChange={(e) => setBusinessCategory(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-amber-300 bg-white text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none shadow-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* WhatsApp Consent Checkbox */}
        <label className="flex items-start gap-2 pt-1 cursor-pointer select-none bg-amber-500/10 p-2.5 rounded-xl border border-amber-300/70">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-amber-400 focus:ring-emerald-500 shrink-0"
          />
          <span className="text-[11px] text-amber-950 font-medium leading-tight">
            मुझे नाहाटा जनरल स्टोर्स से इस कूपन की जानकारी एवं विशेष ऑफर पाने की सहमति है। <span className="text-emerald-800 font-bold">(कोई स्पैम नहीं)</span>
          </span>
        </label>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm shadow-lg shadow-emerald-700/30 active:scale-98 transition-all flex items-center justify-center gap-2 mt-1"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>सत्यापित कूपन जनरेट हो रहा है...</span>
            </span>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>मेरा कूपन प्राप्त करें</span>
            </>
          )}
        </button>
      </form>

      {/* Trust Guarantee */}
      <div className="mt-3 pt-2.5 border-t border-amber-200/80 flex items-center justify-center gap-1.5 text-[10px] text-amber-900 font-bold">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>स्थानीय दुकान • स्पष्ट ऑफर नियम • दुकान पर कूपन दिखाएँ</span>
      </div>
    </div>
  );
};
