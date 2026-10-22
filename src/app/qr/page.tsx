'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  QrCode,
  Printer,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Store,
  PhoneCall,
  MapPin,
  Download,
} from 'lucide-react';
import { INITIAL_CAMPAIGN } from '@/lib/mock-data';

export default function DirectQRStandeePage() {
  const [copied, setCopied] = useState(false);
  const [offerUrl, setOfferUrl] = useState('https://nahata-general-stores.vercel.app');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOfferUrl(window.location.origin);
    }
  }, []);

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
    offerUrl
  )}&margin=12&format=png`;

  const handleCopy = () => {
    navigator.clipboard.writeText(offerUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#26030A] via-[#3d0612] to-black text-[#FFF4D8] py-4 px-3 sm:px-6 flex flex-col items-center justify-between selection:bg-amber-400 selection:text-slate-950">
      {/* Printable Counter Standee Frame */}
      <div className="w-full max-w-sm mx-auto space-y-3.5 print:max-w-none print:w-full">
        {/* Action Controls (Hidden on Print) */}
        <div className="flex items-center justify-between gap-2 print:hidden bg-black/60 p-2.5 rounded-2xl border border-amber-500/40 backdrop-blur-md shadow-lg">
          <Link
            href="/"
            className="text-xs font-bold text-amber-300 hover:text-white flex items-center gap-1"
          >
            ← <span>ऑफर पेज</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow transition-all active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट / सेव PDF</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 🏪 COUNTER QR STANDEE CARD (STANDALONE ONE-PAGE DISPLAY) */}
        {/* ========================================================= */}
        <div className="relative rounded-[28px] bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-600 p-1.5 shadow-[0_0_40px_rgba(255,200,87,0.35)] print:shadow-none print:p-0 print:border-none">
          <div className="bg-[#FFFDF7] rounded-[22px] p-5 sm:p-6 text-slate-900 text-center space-y-3.5 relative overflow-hidden border border-amber-300/60 print:border-none print:p-8">
            
            {/* Top Festive Header */}
            <div className="space-y-1 pb-2 border-b-2 border-dashed border-amber-300">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-300">
                <span>🚩</span>
                <span>शुभ नवरात्रि महापर्व लकी ड्रॉ</span>
                <span>✨</span>
              </span>

              <div className="pt-1.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 leading-tight tracking-tight">
                  नाहाटा जनरल स्टोर्स
                </h1>
                <p className="text-[11px] text-amber-900 font-bold flex items-center justify-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-red-600" />
                  <span>बस स्टैंड रोड, कुशलगढ़ (राज.)</span>
                  <span>•</span>
                  <span>मो. 82904 47144</span>
                </p>
              </div>
            </div>

            {/* Hook Headline */}
            <div className="bg-gradient-to-r from-red-950 via-[#86152B] to-red-950 text-white p-2.5 rounded-xl shadow-md border border-amber-400/60 space-y-0.5">
              <h2 className="text-xs sm:text-sm font-black text-amber-200">
                🎁 कैमरा से QR कोड स्कैन करें और कूपन जीतें!
              </h2>
              <p className="text-[10px] text-amber-100/90 font-medium">
                हर खरीदारी पर निश्चित स्पेशल गिफ्ट हैम्पर व महा-बचत ऑफर
              </p>
            </div>

            {/* Big High-Resolution Scannable QR Code */}
            <div className="p-3 bg-white rounded-2xl border-2 border-red-600/30 shadow-inner inline-block my-1">
              <div className="relative w-52 h-52 sm:w-56 sm:h-56 mx-auto flex items-center justify-center">
                {/* QR Image via QRServer */}
                <img
                  src={qrImageUrl}
                  alt="नाहाटा स्टोर्स लकी ऑफर QR कोड"
                  className="w-full h-full object-contain rounded-xl"
                  loading="eager"
                />
              </div>

              <div className="mt-2 text-[10.5px] font-black text-slate-800 flex items-center justify-center gap-1.5 bg-amber-50 py-1 px-2 rounded-lg border border-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                <span>Google Pay, Paytm या Phone Camera से स्कैन करें</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-1.5 text-[9.5px] font-bold text-slate-700 bg-amber-100/50 p-2 rounded-xl border border-amber-200">
              <div className="text-center">
                <span className="block text-base">🎁</span>
                <span>लकी स्क्रैच</span>
              </div>
              <div className="text-center border-x border-amber-300">
                <span className="block text-base">⚡</span>
                <span>तुरंत कूपन</span>
              </div>
              <div className="text-center">
                <span className="block text-base">🏪</span>
                <span>काउंटर रिडीम</span>
              </div>
            </div>

            {/* Direct URL Footnote */}
            <div className="pt-1 text-[10px] text-slate-500 font-mono tracking-tight truncate border-t border-slate-200">
              👉 {offerUrl}
            </div>
          </div>
        </div>

        {/* Copy Link & Direct Open Actions (Hidden on Print) */}
        <div className="space-y-2 print:hidden">
          <div className="flex items-center gap-2 bg-black/60 p-2 rounded-xl border border-amber-500/30">
            <input
              type="text"
              readOnly
              value={offerUrl}
              className="bg-transparent text-xs font-mono text-amber-200 truncate flex-1 outline-none select-all px-1"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1 shrink-0 transition-colors shadow"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-800" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'कॉपी हुआ!' : 'लिंक कॉपी'}</span>
            </button>
          </div>

          <a
            href={offerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all text-center"
          >
            <span>📱 सीधा ऑफर पेज खोलकर खेलें ➔</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </main>
  );
}
