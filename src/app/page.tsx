'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  Store,
  QrCode,
  Gift,
  Disc,
  Users,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Lock,
  PhoneCall,
  Share2,
  BadgeCheck,
  ChevronRight,
  X,
  Send,
  ShoppingBag,
} from 'lucide-react';
import { INITIAL_MERCHANTS } from '@/lib/mock-data';
import { registerMerchantApplication } from '@/lib/store';
import { Merchant } from '@/types';

export default function PlatformLandingPage() {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registeredMerchant, setRegisteredMerchant] = useState<Merchant | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    category: 'किराना, जनरल स्टोर व दैनिक उपयोग',
    phone: '',
    city: '',
    shopNumber: '',
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Interactive Live Demo Sandbox
  const [demoTab, setDemoTab] = useState<'scratch' | 'spin'>('scratch');
  const [demoRevealed, setDemoRevealed] = useState(false);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.shopName || formData.shopName.trim().length < 3) {
      setFormError('कृपया दुकान का पूरा नाम दर्ज करें।');
      return;
    }
    const cleanPhone = formData.phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setFormError('कृपया वैध 10-अंकों का भारतीय मोबाइल नंबर दर्ज करें।');
      return;
    }
    if (!formData.city || formData.city.trim().length < 2) {
      setFormError('कृपया अपना शहर या कस्बा दर्ज करें।');
      return;
    }

    const newMerchant = registerMerchantApplication({
      name: formData.shopName,
      owner_name: formData.ownerName || 'व्यापारी बंधु',
      category: formData.category,
      phone: cleanPhone,
      location: `${formData.city} (राजस्थान)`,
      shop_number: formData.shopNumber || 'दुकान नं. 01',
    });

    setRegisteredMerchant(newMerchant);
    setFormSuccess(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-amber-950 overflow-x-hidden">
      {/* Top Banner Alert */}
      <div className="bg-gradient-to-r from-red-950 via-amber-950 to-red-950 border-b border-amber-500/30 px-4 py-2 text-center text-xs text-amber-200 flex items-center justify-center gap-2">
        <span className="bg-amber-500 text-amber-950 font-black px-2 py-0.5 rounded text-[10px] tracking-wide uppercase">
          लाइव पायलट
        </span>
        <span>
          कुशलगढ़ के <strong>नाहाटा जनरल स्टोर्स</strong> पर सफलतापूर्वक लाइव • 104+ कूपन रिडीम
        </span>
        <Link
          href="/store/nahata"
          className="underline font-bold text-amber-300 hover:text-white ml-1 inline-flex items-center gap-0.5"
        >
          डेमो देखें <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Main Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center font-black text-slate-950 shadow-lg shadow-amber-500/20">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                भारत रिटेल ऑफर
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                  SaaS Platform
                </span>
              </span>
              <p className="text-[11px] text-slate-400">
                दुकानों के लिए स्मार्ट ग्राहक लॉयल्टी & ऑफर इंजन
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/store/nahata"
              className="text-xs font-bold text-amber-300 hover:text-white bg-amber-950/60 border border-amber-500/30 px-3 py-1.5 rounded-xl transition-all"
            >
              ग्राहक अनुभव देखें
            </Link>

            <Link
              href="/admin"
              className="text-xs font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">व्यापारी लॉगिन</span>
              <span className="sm:hidden">एडमिन</span>
            </Link>

            <Link
              href="/super-admin"
              className="text-xs font-bold text-indigo-300 hover:text-white bg-indigo-950/60 border border-indigo-500/30 px-3 py-1.5 rounded-xl transition-all hidden md:flex items-center gap-1"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>सुपर एडमिन</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Ambient Gradient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-amber-500/15 via-rose-500/10 to-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-amber-300 shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>₹0 ऐप डाउनलोड • सिर्फ 1 QR कोड स्टैंडी काउंटर पर</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.15]">
            दुकान पर ग्राहकों की भीड़{' '}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
              3 गुना बढ़ाएं
            </span>
            , बिना मुनाफे से समझौता किए!
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            हर ग्राहक को दें डिजिटल स्क्रैच कार्ड व लकी स्पिन व्हील का रोमांच। कूपन रिडीम करवाते हुए पाएं
            100% वेरिफाइड WhatsApp कस्टमर लीड्स और पक्की वापसी बिक्री!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <Store className="w-4 h-4" />
              <span>अपनी दुकान के लिए शुरू करें (फ्री रजिस्ट्रेशन)</span>
            </button>

            <Link
              href="/store/nahata"
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700 hover:border-slate-600 transition-all flex items-center gap-2"
            >
              <span>नाहाटा स्टोर्स का लाइव डेमो चलाएं</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </Link>
          </div>

          {/* Social Proof Stats */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-2xl font-black text-amber-400">104+</p>
              <p className="text-xs text-slate-400 mt-0.5">सफल कूपन रिडेम्पशन</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-2xl font-black text-emerald-400">₹85,000+</p>
              <p className="text-xs text-slate-400 mt-0.5">अतिरिक्त पायलट बिलिंग</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-2xl font-black text-indigo-400">92%</p>
              <p className="text-xs text-slate-400 mt-0.5">WhatsApp ग्रुप ऑप्ट-इन</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-2xl font-black text-rose-400">10 सेकंड</p>
              <p className="text-xs text-slate-400 mt-0.5">काउंटर वेरिफिकेशन समय</p>
            </div>
          </div>
        </div>
      </section>

      {/* Flagship Store Spotlight Section */}
      <section className="py-12 px-4 sm:px-6 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              फ्लैगशिप केस स्टडी • पायलट मर्चेंट #1
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              नाहाटा जनरल स्टोर्स — कुशलगढ़ (राजस्थान)
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              30+ वर्षों की पुरानी दुकान को कैसे आधुनिक बनाया गया और ग्राहकों का अटूट भरोसा जीता गया।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Store Profile Card */}
            <div className="md:col-span-5 p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-400 relative shadow-md">
                  <Image
                    src="/manoj-nahata.jpg"
                    alt="श्री मनोज नाहटा"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">श्री मनोज नाहटा</h3>
                  <p className="text-xs text-amber-300 font-medium">संचालक, नाहाटा जनरल स्टोर्स</p>
                  <p className="text-[11px] text-slate-400">दुकान नं. 14, नाहटा कॉम्प्लेक्स, कुशलगढ़</p>
                </div>
              </div>

              <blockquote className="text-xs text-slate-300 italic bg-black/40 p-3 rounded-xl border border-slate-800">
                &ldquo;पहले ग्राहक छूट मांगते थे तो हमारा मार्जिन कटता था। अब वे ₹1500 का सामान खुद खुशी-खुशी
                खरीदते हैं ताकि उनका जीता हुआ ₹150 का कूपन काम आ सके!&rdquo;
              </blockquote>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>घरेलू सामान, प्लास्टिक व उपहारों पर बम्पर ऑफर</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>5 WhatsApp ग्रुप्स में ग्राहक खुद शेयर करते हैं</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>दुकानदार के काउंटर पर 1-क्लिक रिडेम्पशन सिस्टम</span>
                </div>
              </div>

              <Link
                href="/store/nahata"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs text-center flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <span>नाहाटा स्टोर्स का लाइव पेज खोलें</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Interactive Sandbox Simulator */}
            <div className="md:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">लाइव टेस्ट सैंडबॉक्स</span>
                  <h4 className="text-base font-bold text-white">ग्राहक कैसा अनुभव करता है?</h4>
                </div>
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => {
                      setDemoTab('scratch');
                      setDemoRevealed(false);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      demoTab === 'scratch'
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    स्क्रैच कार्ड
                  </button>
                  <button
                    onClick={() => {
                      setDemoTab('spin');
                      setDemoRevealed(false);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      demoTab === 'spin'
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    स्पिन व्हील
                  </button>
                </div>
              </div>

              {/* Mini Simulator Box */}
              <div className="aspect-[16/9] sm:aspect-[2/1] rounded-2xl bg-gradient-to-br from-amber-950/40 via-red-950/30 to-black border border-amber-500/30 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                {!demoRevealed ? (
                  <div className="space-y-3 z-10">
                    <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                      {demoTab === 'scratch' ? <Gift className="w-6 h-6" /> : <Disc className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {demoTab === 'scratch' ? 'कार्ड स्क्रैच करने के लिए टैप करें' : 'व्हील घुमाने के लिए टैप करें'}
                      </p>
                      <p className="text-xs text-amber-300/80">देखें ग्राहक को कैसा इनाम मिलता है</p>
                    </div>
                    <button
                      onClick={() => setDemoRevealed(true)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-md active:scale-95 transition-all"
                    >
                      {demoTab === 'scratch' ? '🎁 तुरंत स्क्रैच करें' : '🎡 अभी व्हील घुमाएं'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 z-10 animate-in zoom-in-95 duration-300">
                    <div className="inline-block px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                      🎉 बधाई हो! इनाम खुला
                    </div>
                    <p className="text-lg font-black text-white">₹150 का स्पेशल डिस्काउंट कूपन</p>
                    <p className="text-xs text-slate-300">
                      न्यूनतम ₹1500 की खरीद पर तुरंत काउंटर पर डिस्काउंट!
                    </p>
                    <div className="pt-2 flex items-center justify-center gap-2">
                      <Link
                        href="/store/nahata"
                        className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-amber-400 transition-colors"
                      >
                        पूरा अनुभव देखें →
                      </Link>
                      <button
                        onClick={() => setDemoRevealed(false)}
                        className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg hover:text-white"
                      >
                        पुनः टेस्ट करें
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Process Section */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              बेहद सरल प्रक्रिया
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              यह आपके व्यवसाय में कैसे काम करता है?
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              ना किसी भारी सॉफ्टवेयर की जरूरत, ना कर्मचारियों के लिए किसी ट्रेनिंग की।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative">
              <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-black text-sm flex items-center justify-center border border-amber-500/30">
                1
              </span>
              <h3 className="font-bold text-white text-base">QR कोड स्टैंडी</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                दुकान के गल्ले या काउंटर पर आकर्षक QR स्टैंडी लगाया जाता है। ग्राहक अपना फोन निकालकर स्कैन करता है।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative">
              <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-black text-sm flex items-center justify-center border border-amber-500/30">
                2
              </span>
              <h3 className="font-bold text-white text-base">स्क्रैच या स्पिन गेम</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                ब्राउज़र में तुरंत गेम खुलता है। रोमांचक एनीमेशन और साउंड के साथ ग्राहक का पक्का डिस्काउंट निकलता है।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative">
              <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-black text-sm flex items-center justify-center border border-amber-500/30">
                3
              </span>
              <h3 className="font-bold text-white text-base">WhatsApp लीड कलेक्शन</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                कूपन प्राप्त करने के लिए ग्राहक अपना नाम व WhatsApp नंबर डालता है। आपका कस्टमर डेटाबेस ऑटोमेटिक बनता है।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative">
              <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-black text-sm flex items-center justify-center border border-amber-500/30">
                4
              </span>
              <h3 className="font-bold text-white text-base">10 सेकंड काउंटर रिडेम्पशन</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                बिल बनाते समय आप एडमिन पोर्टल में कूपन कोड डालते हैं। कूपन तुरंत सत्यापित हो जाता है और बिल में डिस्काउंट लग जाता है।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Other Onboarded Stores Showcase */}
      <section className="py-12 px-4 sm:px-6 bg-slate-900/30 border-t border-slate-800">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                प्लेटफॉर्म पर लाइव अन्य खुदरा दुकानें
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                विभिन्न श्रेणियों के खुदरा व्यापारी अपने-अपने ऑफर चला रहे हैं
              </p>
            </div>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="text-xs font-bold text-amber-300 hover:text-white bg-amber-950/60 border border-amber-500/30 px-3.5 py-2 rounded-xl transition-all self-start sm:self-auto flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5" />
              <span>अपनी दुकान जोड़ें</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {INITIAL_MERCHANTS.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                      {m.category}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">● एक्टिव</span>
                  </div>
                  <h3 className="font-bold text-white text-base mt-2">{m.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">📍 {m.location}</p>
                  <p className="text-xs text-slate-500">संचालक: {m.owner_name}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <Link
                    href={`/store/${m.slug}`}
                    className="text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1"
                  >
                    <span>ऑफर पेज देखें</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>

                  <Link
                    href={`/admin?store=${m.slug}`}
                    className="text-slate-400 hover:text-white"
                  >
                    एडमिन
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Modal Form */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsRegisterModalOpen(false);
                setFormSuccess(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {!formSuccess ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white">
                    अपनी दुकान के लिए ऑफर सिस्टम शुरू करें
                  </h3>
                  <p className="text-xs text-slate-400">
                    विवरण भरें। आपकी दुकान का डिजिटल अभियान तुरंत तैयार किया जाएगा।
                  </p>
                </div>

                {formError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl">
                    ⚠️ {formError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    दुकान / फर्म का नाम *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. श्री कृष्णा किराना & जनरल स्टोर्स"
                    value={formData.shopName}
                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      संचालक / मालिक का नाम *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. रमेश कुमार"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      मोबाइल / WhatsApp नंबर *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="9829012345"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      दुकान की श्रेणी *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="किराना, जनरल स्टोर व दैनिक उपयोग">किराना & जनरल स्टोर</option>
                      <option value="कपड़ा, साड़ी, रेडीमेड व गारमेंट्स">कपड़ा & गारमेंट्स</option>
                      <option value="इलेक्ट्रॉनिक्स, मोबाइल व एसेसरीज">इलेक्ट्रॉनिक्स & मोबाइल</option>
                      <option value="हार्डवेयर, पेंट व सैनिटरी">हार्डवेयर & सैनिटरी</option>
                      <option value="मिठाई, बेकरी व रेस्टोरेंट">मिठाई & रेस्टोरेंट</option>
                      <option value="फुटवियर व बैग्स">फुटवियर & बैग्स</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      शहर / कस्बा *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. कुशलगढ़ / बांसवाड़ा / जयपुर"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    दुकान नंबर / कॉम्प्लेक्स (वैकल्पिक)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. शॉप 14, मेन मार्केट"
                    value={formData.shopNumber}
                    onChange={(e) => setFormData({ ...formData, shopNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all"
                >
                  🚀 अपनी दुकान पंजीकृत करें
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white">बधाई हो! पंजीकरण सफल</h3>
                  <p className="text-xs text-slate-300">
                    <strong>{registeredMerchant?.name}</strong> का ऑफर कैंपेन सफलतापूर्वक बना दिया गया है।
                  </p>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">दुकान का लिंक:</span>
                    <span className="font-mono text-amber-300 font-bold">
                      /store/{registeredMerchant?.slug}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">स्थिति:</span>
                    <span className="text-amber-400 font-bold">समीक्षा में (Pending Approval)</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href={`/store/${registeredMerchant?.slug}`}
                    className="w-full py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-colors text-center"
                  >
                    दुकान का लाइव ऑफर पेज देखें
                  </Link>

                  <button
                    onClick={() => {
                      setIsRegisterModalOpen(false);
                      setFormSuccess(false);
                    }}
                    className="w-full py-2 bg-slate-800 text-slate-300 text-xs rounded-xl hover:text-white"
                  >
                    बंद करें
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-10 px-4 sm:px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black">
              ⚡
            </div>
            <div>
              <p className="font-bold text-white">भारत रिटेल ऑफर & लॉयल्टी SaaS प्लेटफॉर्म</p>
              <p className="text-[11px] text-slate-500">
                फ्लैगशिप पायलट: नाहाटा जनरल स्टोर्स, कुशलगढ़ (राजस्थान)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <Link href="/store/nahata" className="hover:text-amber-300 transition-colors">
              नाहाटा स्टोर्स
            </Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-amber-300 transition-colors">
              दुकानदार एडमिन
            </Link>
            <span>•</span>
            <Link href="/super-admin" className="hover:text-amber-300 transition-colors">
              सुपर एडमिन कंट्रोल
            </Link>
          </div>

          <p className="text-[11px] text-slate-500">
            © 2026 Bharat Retail Offer Tech • सर्वाधिकार सुरक्षित
          </p>
        </div>
      </footer>
    </div>
  );
}
