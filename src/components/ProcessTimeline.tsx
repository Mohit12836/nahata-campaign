'use client';

import React from 'react';
import { Gift, Ticket, Store, Sparkles, CheckCircle2 } from 'lucide-react';

export const ProcessTimeline: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'लकी कार्ड स्क्रैच या स्पिन करें',
      desc: '1 सेकंड में अपनी पसंद का गेम खेलें और 100% पक्का फेस्टिव गिफ्ट या डिस्काउंट निकालें।',
      icon: <Gift className="w-5 h-5 text-yellow-300" />,
      color: 'from-amber-500/20 to-yellow-500/10',
      border: 'border-amber-500/40',
    },
    {
      num: '02',
      title: 'यूनिक कूपन कोड पाएं',
      desc: 'अपना नाम व नंबर डालकर कूपन सुरक्षित करें। यह कोड आपके व्हाट्सएप पर भी प्राप्त होगा।',
      icon: <Ticket className="w-5 h-5 text-emerald-300" />,
      color: 'from-emerald-500/20 to-teal-500/10',
      border: 'border-emerald-500/40',
    },
    {
      num: '03',
      title: 'काउंटर पर दिखाएं या होम डिलीवरी लें',
      desc: 'दुकान पर बिलिंग के समय कूपन कोड दिखाएं अथवा दूर रहने पर सीधे WhatsApp पर होम डिलीवरी मंगाएं।',
      icon: <Store className="w-5 h-5 text-blue-300" />,
      color: 'from-blue-500/20 to-indigo-500/10',
      border: 'border-blue-500/40',
    },
  ];

  return (
    <section className="w-full max-w-md mx-auto my-6 space-y-3 select-none">
      <div className="text-center space-y-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> केवल 3 आसान चरण
        </span>
        <h3 className="text-lg sm:text-xl font-black text-white">
          ऑफर प्राप्त करने और भुनाने की प्रक्रिया
        </h3>
        <p className="text-xs text-amber-200/80">
          बिना किसी झंझट के तुरंत लाभ पाएं
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 pt-2">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-2xl bg-gradient-to-r ${step.color} border ${step.border} backdrop-blur-sm flex items-start gap-3.5 shadow-md`}
          >
            <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
              {step.icon}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black font-mono text-amber-400 bg-black/50 px-1.5 py-0.2 rounded border border-amber-500/40">
                  STEP {step.num}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  {step.title}
                </h4>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/30 text-[11px] text-amber-300/90 text-center flex items-center justify-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>100% निशुल्क • कोई छुपा हुआ शुल्क नहीं</span>
      </div>
    </section>
  );
};
