'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhoneCall,
  MessageCircle,
  MapPin,
  Building2,
  Award,
  Users,
  TrendingUp,
  ShieldCheck,
  Home,
  Car,
  GraduationCap,
  Gem,
  UserCheck,
  CheckCircle2,
  Sprout,
  Tractor,
  Sun,
  Smartphone,
  Trophy,
  Smile,
  HeartHandshake,
  Clock,
  ShieldAlert,
  BookOpen,
  Activity,
  Leaf,
  Target,
  ArrowRight,
  Download,
  Send,
  X,
  Sparkles,
  BadgeCheck,
} from 'lucide-react';

export default function PunitNahetaWhitePortfolioPage() {
  const [filter, setFilter] = useState<'all' | 'banking' | 'agri-digital' | 'impact' | 'connect'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('General Banking Inquiry');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formMsg, setFormMsg] = useState('');

  // Loan EMI Estimator State
  const [loanAmount, setLoanAmount] = useState(2500000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);

  const r = interestRate / 12 / 100;
  const n = tenureYears * 12;
  const emi = r > 0 ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loanAmount / n;
  const formattedEmi = Math.round(emi).toLocaleString('en-IN');

  const openModal = (service: string) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleWhatsAppInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Namaste Punit Sir,\nMy Name: ${formName}\nPhone: ${formPhone}\nInterested In: ${selectedService}\nRequirement: ${formMsg || 'Looking for details and consultation at Indore Branch.'}`;
    window.open(`https://wa.me/919926856542?text=${encodeURIComponent(text)}`, '_blank');
    setIsModalOpen(false);
  };

  const downloadVCard = () => {
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nN:Naheta;Punit;;;\nFN:Punit Naheta\nORG:Bank of Baroda\nTITLE:Branch Manager\nTEL;TYPE=CELL,VOICE:+919926856542\nADR;TYPE=WORK:;;Indore Branch;Indore;Madhya Pradesh;;India\nNOTE:Bank of Baroda Indore Branch Manager\nEND:VCARD`;
    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Punit_Naheta_BankOfBaroda.vcf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const fireBorderWrapperClass =
    'relative rounded-2xl p-[2.5px] bg-[linear-gradient(115deg,#FF1A00_0%,#FF5500_20%,#FFB700_40%,#FF2200_60%,#FFAE00_80%,#FF1A00_100%)] bg-[length:260%_260%] animate-[fireBorderRunning_3.2s_linear_infinite] hover:animate-[fireBorderRunning_1.8s_linear_infinite] transition-all hover:-translate-y-1.5 shadow-[0_10px_25px_-5px_rgba(255,68,0,0.35)] hover:shadow-[0_16px_35px_rgba(255,68,0,0.5)]';

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#F15A24] selection:text-white">
      <style jsx global>{`
        @keyframes fireBorderRunning {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>

      {/* Top Baroda Fire Ticker Strip */}
      <div className="bg-gradient-to-r from-[#D94814] via-[#F15A24] to-[#FF8C00] py-1.5 px-4 text-xs font-bold text-white text-center flex items-center justify-center gap-2 sm:gap-3 shadow-md">
        <span className="inline-flex items-center gap-1.5 font-bold">
          <ShieldCheck className="w-4 h-4" /> बैंक ऑफ़ बड़ौदा
        </span>
        <span className="text-white/70">•</span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" /> Indore Branch
        </span>
        <span className="text-white/70">•</span>
        <a href="tel:+919926856542" className="underline decoration-white/70 hover:decoration-white font-black inline-flex items-center gap-1 text-yellow-200">
          <PhoneCall className="w-3.5 h-3.5" /> 99268 56542
        </a>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-orange-100 px-4 sm:px-6 lg:px-8 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#D94814] via-[#F15A24] to-[#FFAE00] flex items-center justify-center shadow-lg text-white font-black text-lg border-2 border-white">
              BOB
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-black text-[#0A1C34] tracking-tight">बैंक ऑफ़ बड़ौदा</span>
                <span className="text-xs sm:text-sm font-bold text-[#F15A24]">Bank of Baroda</span>
              </div>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500">Indore Branch • Punit Naheta</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://wa.me/919926856542?text=Namaste%20Punit%20Sir,%20I%20would%20like%20to%20inquire%20about%20Bank%20of%20Baroda%20services%20at%20Indore%20Branch."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1faa4e] text-white px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-extrabold shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
            <a
              href="tel:+919926856542"
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#D94814] to-[#F15A24] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-black shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {/* Hero Section */}
        <div className={fireBorderWrapperClass + ' mb-8'}>
          <div className="bg-gradient-to-br from-white via-orange-50/30 to-amber-50/20 rounded-[calc(1rem-2.5px)] p-5 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              <div className="lg:col-span-7 space-y-3.5">
                <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-300 px-3 py-1 rounded-full text-[#C23605] text-xs font-black uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[#FF2A00] animate-ping" />
                  Official Executive Profile • Indore Branch
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A1C34] tracking-tight leading-tight">
                  Punit Naheta
                </h1>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-gradient-to-r from-[#D94814] to-[#F15A24] text-white text-xs sm:text-sm font-black px-3 py-1 rounded-lg">
                    Branch Manager
                  </span>
                  <span className="text-[#0A1C34] font-extrabold text-xs sm:text-sm bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                    Bank of Baroda • Indore Branch
                  </span>
                  <span className="text-amber-800 font-extrabold text-xs sm:text-sm bg-amber-100/70 px-3 py-1 rounded-lg border border-amber-300 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-600" /> Customer First
                  </span>
                </div>

                <p className="text-slate-800 text-xs sm:text-sm md:text-base leading-relaxed font-medium">
                  &ldquo;<strong className="text-[#C23605]">Committed to Empower People & Businesses through Trusted Banking Solutions.</strong>{' '}
                  Retail Loans, MSME Capital, Agricultural Credit & Seamless Digital Banking across Indore.&rdquo;
                </p>

                <div className="pt-2 flex flex-wrap gap-2 sm:gap-3">
                  <a
                    href="tel:+919926856542"
                    className="inline-flex items-center gap-1.5 bg-[#0A1C34] hover:bg-black text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-orange-400" />
                    +91 99268 56542
                  </a>
                  <div className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-300 text-slate-800 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold">
                    <MapPin className="w-3.5 h-3.5 text-[#F15A24]" />
                    Indore, MP
                  </div>
                  <button
                    onClick={downloadVCard}
                    className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Save Contact (.vcf)
                  </button>
                </div>
              </div>

              {/* Photo Box */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full max-w-sm rounded-2xl overflow-hidden bg-white border-2 border-orange-300 shadow-xl relative group">
                  <div className="h-56 sm:h-64 w-full relative overflow-hidden bg-slate-100">
                    <img
                      src="/punit-naheta-portfolio.jpg"
                      alt="Punit Naheta Bank of Baroda"
                      className="w-full h-full object-cover object-top filter brightness-105 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1C34] via-transparent to-transparent opacity-90" />
                    <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end text-white">
                      <div>
                        <p className="font-black text-lg">Punit Naheta</p>
                        <p className="text-xs font-bold text-orange-300">Branch Manager • Indore</p>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-[#F15A24] flex items-center justify-center text-white shadow-lg">
                        <Building2 className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-white font-semibold">
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-orange-400" /> 10,000+ Happy
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> ₹500+ Cr
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Trusted
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {(
            [
              { id: 'all', label: '🔥 All 12 Cards' },
              { id: 'banking', label: 'Retail & MSME Loans' },
              { id: 'agri-digital', label: 'Agri & bob World' },
              { id: 'impact', label: 'Achievements & CSR' },
              { id: 'connect', label: 'Direct Connect' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all ${
                filter === tab.id
                  ? 'bg-[#0A1C34] text-white shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 12 Cards Grid with Fitted Photos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* CARD 01 */}
          {(filter === 'all' || filter === 'impact') && (
            <div className={fireBorderWrapperClass}>
              <div className="bg-white rounded-[calc(1rem-2.5px)] p-5 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D94814] to-[#FF5500] text-white font-black text-sm flex items-center justify-center shadow-md">
                      01
                    </span>
                    <span className="text-xs font-black uppercase text-[#C23605] bg-orange-100 px-2.5 py-0.5 rounded-md border border-orange-300">
                      Executive Profile
                    </span>
                  </div>

                  <div className="w-full h-36 rounded-xl overflow-hidden mb-3 border border-orange-200 shadow-inner">
                    <img
                      src="https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=600&q=80"
                      alt="Manager Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h3 className="text-xl font-black text-[#0A1C34] mb-0.5">About Me</h3>
                  <p className="text-xs font-bold text-amber-700 mb-3">Punit Naheta • Branch Manager</p>

                  <ul className="space-y-2 text-xs sm:text-sm text-slate-800 mb-3 font-semibold">
                    <li className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-[#D94814] shrink-0" />
                      <span><strong>Name:</strong> Punit Naheta</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-[#D94814] shrink-0" />
                      <span><strong>Role:</strong> Branch Manager, Bank of Baroda</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#D94814] shrink-0" />
                      <span><strong>Branch:</strong> Indore Branch, MP</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <PhoneCall className="w-3.5 h-3.5 text-[#D94814] shrink-0" />
                      <span><strong>Direct:</strong> <span className="text-[#C23605] font-black">99268 56542</span></span>
                    </li>
                  </ul>

                  <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-xs italic text-slate-800 font-medium">
                    &ldquo;Committed to Empower People & Businesses through Trusted Banking Solutions.&rdquo;
                  </div>
                </div>

                <div className="pt-3 mt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-bold">
                  <span>Customer First Always</span>
                  <span className="text-[#C23605] font-black flex items-center gap-1">
                    Verified <BadgeCheck className="w-3.5 h-3.5 text-[#C23605]" />
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* CARD 02 */}
          {(filter === 'all' || filter === 'impact') && (
            <div className={fireBorderWrapperClass}>
              <div className="bg-white rounded-[calc(1rem-2.5px)] p-5 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D94814] to-[#FF5500] text-white font-black text-sm flex items-center justify-center shadow-md">
                      02
                    </span>
                    <span className="text-xs font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">
                      Career Path
                    </span>
                  </div>

                  <div className="w-full h-36 rounded-xl overflow-hidden mb-3 border border-emerald-200 shadow-inner">
                    <img
                      src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80"
                      alt="Career Milestones"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h3 className="text-xl font-black text-[#0A1C34] mb-0.5">My Journey</h3>
                  <p className="text-xs font-bold text-slate-600 mb-3">A Journey of Growth, Trust & Impact</p>

                  <div className="relative pl-5 space-y-2.5 border-l-2 border-[#F15A24] ml-2 my-2 text-xs">
                    <div className="relative">
                      <span className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-[#FF2A00] border-2 border-white shadow" />
                      <p className="font-black text-[#0A1C34]">Joined Bank of Baroda</p>
                      <p className="text-[11px] text-slate-600">Dedication to public banking ethics</p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-emerald-600 border-2 border-white shadow" />
                      <p className="font-black text-[#0A1C34]">Multiple Roles & Learning</p>
                      <p className="text-[11px] text-slate-600">Credit, Forex, Retail & Compliance</p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-amber-500 border-2 border-white shadow" />
                      <p className="font-black text-[#0A1C34]">Branch Manager Leadership</p>
                      <p className="text-[11px] text-slate-600">Serving Indore Branch with excellence</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-4 border-t border-slate-200 flex items-center justify-between text-xs text-[#C23605] font-black">
                  <span>Learning</span> ➔ <span>Leadership</span> ➔ <span>Impact</span>
                </div>
              </div>
            </div>
          )}

          {/* CARD 03 */}
          {(filter === 'all' || filter === 'impact') && (
            <div className={fireBorderWrapperClass}>
              <div className="bg-white rounded-[calc(1rem-2.5px)] p-5 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D94814] to-[#FF5500] text-white font-black text-sm flex items-center justify-center shadow-md">
                      03
                    </span>
                    <span className="text-xs font-black uppercase text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-md border border-blue-300">
                      Indore Hub
                    </span>
                  </div>

                  <div className="w-full h-36 rounded-xl overflow-hidden mb-3 border border-blue-200 shadow-inner">
                    <img
                      src="https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=600&q=80"
                      alt="Indore Branch Heritage"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h3 className="text-xl font-black text-[#0A1C34] mb-0.5">Branch Overview</h3>
                  <p className="text-xs font-bold text-slate-600 mb-3">Indore Branch — A City of Opportunities</p>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-orange-100 border border-orange-300 text-center">
                      <p className="text-lg font-black text-[#C23605]">10,000+</p>
                      <p className="text-[10px] font-bold text-slate-800">Happy Clients</p>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-100 border border-blue-300 text-center">
                      <p className="text-lg font-black text-blue-900">₹ 500+ Cr</p>
                      <p className="text-[10px] font-bold text-slate-800">Business Mix</p>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-100 border border-emerald-300 text-center">
                      <p className="text-lg font-black text-emerald-800">15%+</p>
                      <p className="text-[10px] font-bold text-slate-800">YoY Growth</p>
                    </div>
                    <div className="p-2 rounded-lg bg-purple-100 border border-purple-300 text-center">
                      <p className="text-sm font-black text-purple-900 mt-1">Strong CASA</p>
                      <p className="text-[10px] font-bold text-slate-800">Deposit Base</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-700 font-bold">
                  <span>Operational Excellence</span>
                  <span className="text-emerald-700 font-black">Expanding</span>
                </div>
              </div>
            </div>
          )}

          {/* CARD 04 */}
          {(filter === 'all' || filter === 'banking') && (
            <div className={fireBorderWrapperClass}>
              <div className="bg-white rounded-[calc(1rem-2.5px)] p-5 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D94814] to-[#FF5500] text-white font-black text-sm flex items-center justify-center shadow-md">
                      04
                    </span>
                    <span className="text-xs font-black uppercase text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-300">
                      Retail Loans
                    </span>
                  </div>

                  <div className="w-full h-36 rounded-xl overflow-hidden mb-3 border border-amber-200 shadow-inner">
                    <img
                      src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80"
                      alt="Retail Happy Family"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h3 className="text-xl font-black text-[#0A1C34] mb-0.5">Retail Banking</h3>
                  <p className="text-xs font-bold text-slate-600 mb-3">Turning Aspirations into Reality</p>

                  <div className="grid grid-cols-2 gap-1.5 text-xs font-bold text-slate-800 mb-3">
                    <div className="p-1.5 rounded bg-orange-50 border border-orange-200 flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5 text-[#C23605]" /> Home Loans
                    </div>
                    <div className="p-1.5 rounded bg-orange-50 border border-orange-200 flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-[#C23605]" /> Car Loans
                    </div>
                    <div className="p-1.5 rounded bg-orange-50 border border-orange-200 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-[#C23605]" /> Education
                    </div>
                    <div className="p-1.5 rounded bg-amber-50 border border-amber-200 flex items-center gap-1.5">
                      <Gem className="w-3.5 h-3.5 text-amber-600" /> Gold Loans
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between">
                  <button
                    onClick={() => openModal('Retail Loans (Home/Car/Personal)')}
                    className="text-xs font-black text-[#C23605] hover:text-[#FF2A00] flex items-center gap-1"
                  >
                    Apply Now <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-bold text-slate-500">Fast Approval</span>
                </div>
              </div>
            </div>
          )}

          {/* CARD 05 */}
          {(filter === 'all' || filter === 'banking') && (
            <div className={fireBorderWrapperClass}>
              <div className="bg-white rounded-[calc(1rem-2.5px)] p-5 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D94814] to-[#FF5500] text-white font-black text-sm flex items-center justify-center shadow-md">
                      05
                    </span>
                    <span className="text-xs font-black uppercase text-sky-900 bg-sky-100 px-2.5 py-0.5 rounded-md border border-sky-300">
                      Business Finance
                    </span>
                  </div>

                  <div className="w-full h-36 rounded-xl overflow-hidden mb-3 border border-sky-200 shadow-inner">
                    <img
                      src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80"
                      alt="Corporate MSME Finance"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h3 className="text-xl font-black text-[#0A1C34] mb-0.5">Corporate & MSME</h3>
                  <p className="text-xs font-bold text-slate-600 mb-3">Powering Businesses, Building Bharat</p>

                  <ul className="space-y-1.5 text-xs font-bold text-slate-800 mb-3">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Current Accounts & Overdraft (OD)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Working Capital & Term Loans</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>CGTMSE, MUDRA & Stand-Up India</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between">
                  <button
                    onClick={() => openModal('MSME & Corporate Loan')}
                    className="text-xs font-black text-[#C23605] hover:text-[#FF2A00] flex items-center gap-1"
                  >
                    Meet Manager <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-bold text-emerald-700">CGTMSE Covered</span>
                </div>
              </div>
            </div>
          )}

          {/* CARD 06 */}
          {(filter === 'all' || filter === 'agri-digital') && (
            <div className={fireBorderWrapperClass}>
              <div className="bg-white rounded-[calc(1rem-2.5px)] p-5 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D94814] to-[#FF5500] text-white font-black text-sm flex items-center justify-center shadow-md">
                      06
                    </span>
                    <span className="text-xs font-black uppercase text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">
                      Agri Priority
                    </span>
                  </div>

                  <div className="w-full h-36 rounded-xl overflow-hidden mb-3 border border-emerald-200 shadow-inner">
                    <img
                      src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80"
                      alt="Agriculture & Farmers"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h3 className="text-xl font-black text-[#0A1C34] mb-0.5">Agriculture & Rural</h3>
                  <p className="text-xs font-bold text-slate-600 mb-3">Stronger Farmers, A Prosperous India</p>

                  <ul className="space-y-1.5 text-xs font-bold text-slate-800 mb-3">
                    <li className="flex items-center gap-1.5">
                      <Sprout className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Kisan Credit Card (KCC) Scheme</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Tractor className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Tractor & Mechanization Loans</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Solar Pump (PM-KUSUM Scheme)</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between">
                  <button
                    onClick={() => openModal('Agriculture / KCC Scheme')}
                    className="text-xs font-black text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                  >
                    Agri Advisory <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-bold text-slate-500">PM-KISAN Ready</span>
                </div>
              </div>
            </div>
          )}

          {/* CARD 07 */}
          {(filter === 'all' || filter === 'agri-digital') && (
            <div className={fireBorderWrapperClass}>
              <div className="bg-white rounded-[calc(1rem-2.5px)] p-5 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D94814] to-[#FF5500] text-white font-black text-sm flex items-center justify-center shadow-md">
                      07
                    </span>
                    <span className="text-xs font-black uppercase text-cyan-900 bg-cyan-100 px-2.5 py-0.5 rounded-md border border-cyan-300">
                      bob World
                    </span>
                  </div>

                  <div className="w-full h-36 rounded-xl overflow-hidden mb-3 border border-cyan-200 shadow-inner">
                    <img
                      src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80"
                      alt="bob World Digital App"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h3 className="text-xl font-black text-[#0A1C34] mb-0.5">Digital Banking</h3>
                  <p className="text-xs font-black text-[#C23605] mb-3">bob World • Banking in Your Hands</p>

                  <div className="grid grid-cols-2 gap-1.5 text-xs font-bold text-slate-800 mb-3">
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                      <p className="font-black text-[#0A1C34]">bob World</p>
                      <p className="text-[10px] text-slate-500">250+ Services</p>
                    </div>
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                      <p className="font-black text-[#0A1C34]">UPI & BHIM</p>
                      <p className="text-[10px] text-slate-500">Zero Fee</p>
                    </div>
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                      <p className="font-black text-[#0A1C34]">POS Soundbox</p>
                      <p className="text-[10px] text-slate-500">For Merchants</p>
                    </div>
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                      <p className="font-black text-[#0A1C34]">Digital Loans</p>
                      <p className="text-[10px] text-slate-500">Paperless</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600">24x7 Digital Hub</span>
                  <span className="text-cyan-700 font-black">100% Secure</span>
                </div>
              </div>
            </div>
          )}

          {/* CARD 08 */}
          {(filter === 'all' || filter === 'impact') && (
            <div className={fireBorderWrapperClass}>
              <div className="bg-white rounded-[calc(1rem-2.5px)] p-5 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D94814] to-[#FF5500] text-white font-black text-sm flex items-center justify-center shadow-md">
                      08
                    </span>
                    <span className="text-xs font-black uppercase text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-300">
                      Awards
                    </span>
                  </div>

                  <div className="w-full h-36 rounded-xl overflow-hidden mb-3 border border-amber-200 shadow-inner">
                    <img
                      src="https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&w=600&q=80"
                      alt="Achievements Trophy"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h3 className="text-xl font-black text-[#0A1C34] mb-0.5">Key Achievements</h3>
                  <p className="text-xs font-bold text-slate-600 mb-3">Teamwork | Trust | Transformation</p>

                  <div className="space-y-2 text-xs font-bold text-slate-800 mb-3">
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
                      <span><strong>15%+ Business Growth</strong> YoY</span>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                      <Smile className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>10,000+ Satisfied</strong> Clients</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between text-xs text-amber-700 font-black">
                  <span>Service Excellence</span>
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}

          {/* CARD 09 */}
          {(filter === 'all' || filter === 'impact') && (
            <div className={fireBorderWrapperClass}>
              <div className="bg-white rounded-[calc(1rem-2.5px)] p-5 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D94814] to-[#FF5500] text-white font-black text-sm flex items-center justify-center shadow-md">
                      09
                    </span>
                    <span className="text-xs font-black uppercase text-rose-900 bg-rose-100 px-2.5 py-0.5 rounded-md border border-rose-300">
                      Client First
                    </span>
                  </div>

                  <div className="w-full h-36 rounded-xl overflow-hidden mb-3 border border-rose-200 shadow-inner">
                    <img
                      src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=80"
                      alt="Customer Trust Handshake"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h3 className="text-xl font-black text-[#0A1C34] mb-0.5">Customer Focus</h3>
                  <p className="text-xs font-bold text-slate-600 mb-3">Your Trust, Our Priority</p>

                  <ul className="space-y-1.5 text-xs font-bold text-slate-800 mb-3">
                    <li className="flex items-center gap-1.5">
                      <HeartHandshake className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>Personalized Financial Solutions</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#D94814] shrink-0" />
                      <span>Fast & Transparent Service</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Active Cyber Fraud Protection</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-700 font-bold">
                  <span>Lifetime Bonds</span>
                  <span className="text-rose-700 font-black">100% Dedicated</span>
                </div>
              </div>
            </div>
          )}

          {/* CARD 10 */}
          {(filter === 'all' || filter === 'impact') && (
            <div className={fireBorderWrapperClass}>
              <div className="bg-white rounded-[calc(1rem-2.5px)] p-5 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D94814] to-[#FF5500] text-white font-black text-sm flex items-center justify-center shadow-md">
                      10
                    </span>
                    <span className="text-xs font-black uppercase text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">
                      CSR Impact
                    </span>
                  </div>

                  <div className="w-full h-36 rounded-xl overflow-hidden mb-3 border border-emerald-200 shadow-inner">
                    <img
                      src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80"
                      alt="CSR Green Sprout"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h3 className="text-xl font-black text-[#0A1C34] mb-0.5">Community & CSR</h3>
                  <p className="text-xs font-bold text-slate-600 mb-3">Banking for a Better Tomorrow</p>

                  <ul className="space-y-1.5 text-xs font-bold text-slate-800 mb-3">
                    <li className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Financial Literacy Camps in Schools</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>Health & Wellness Awareness</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Tree Plantation Green Drives</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between text-xs text-emerald-700 font-black">
                  <span>Sustainable Future</span>
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}

          {/* CARD 11 */}
          {(filter === 'all' || filter === 'impact') && (
            <div className={fireBorderWrapperClass}>
              <div className="bg-white rounded-[calc(1rem-2.5px)] p-5 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D94814] to-[#FF5500] text-white font-black text-sm flex items-center justify-center shadow-md">
                      11
                    </span>
                    <span className="text-xs font-black uppercase text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-300">
                      Roadmap
                    </span>
                  </div>

                  <div className="w-full h-36 rounded-xl overflow-hidden mb-3 border border-amber-200 shadow-inner">
                    <img
                      src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80"
                      alt="Vision Summit Peak"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h3 className="text-xl font-black text-[#0A1C34] mb-0.5">Vision & Goals</h3>
                  <p className="text-xs font-bold text-slate-600 mb-3">Higher | Stronger | Together</p>

                  <ul className="space-y-1.5 text-xs font-bold text-slate-800 mb-3">
                    <li className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-[#D94814] shrink-0" />
                      <span>Expand Customer Base in Indore</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                      <span>100% Digital bob World Adoption</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Empower Indore MSMEs & Traders</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-700 font-bold">
                  <span>Mission Driven</span>
                  <span className="text-amber-700 font-black">Vision 2026+</span>
                </div>
              </div>
            </div>
          )}

          {/* CARD 12 */}
          {(filter === 'all' || filter === 'connect') && (
            <div className={fireBorderWrapperClass}>
              <div className="bg-white rounded-[calc(1rem-2.5px)] p-5 h-full flex flex-col justify-between bg-gradient-to-br from-white to-orange-50/50">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D94814] to-[#FF5500] text-white font-black text-sm flex items-center justify-center shadow-md">
                      12
                    </span>
                    <span className="text-xs font-black uppercase text-[#C23605] bg-orange-100 px-2.5 py-0.5 rounded-md border border-orange-300">
                      Connect Direct
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-[#0A1C34] mb-0.5">Let&apos;s Connect</h3>
                  <p className="text-xs font-bold text-slate-700 mb-3">Bank of Baroda • Indore Branch</p>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 border border-orange-200 mb-3">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm shrink-0 border border-orange-200">
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https%3A%2F%2Fwa.me%2F919926856542&margin=2"
                        alt="QR Code"
                        className="w-16 h-16"
                      />
                    </div>
                    <div className="text-xs space-y-0.5">
                      <p className="font-black text-[#0A1C34]">Scan to Save Contact</p>
                      <p className="text-[11px] text-slate-600">Punit Naheta, Manager</p>
                      <p className="text-[11px] font-black text-[#C23605]">+91 99268 56542</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <a
                      href="tel:+919926856542"
                      className="flex items-center justify-center gap-1 bg-[#0A1C34] hover:bg-black text-white py-2 rounded-xl font-black shadow-md"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-orange-400" /> Call Now
                    </a>
                    <a
                      href="https://wa.me/919926856542?text=Namaste%20Punit%20Sir,%20I%20saw%20your%20Bank%20of%20Baroda%20portfolio."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 bg-[#25D366] hover:bg-[#1faa4e] text-white py-2 rounded-xl font-black shadow-md"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200 text-center text-xs text-slate-700 italic font-bold">
                  &ldquo;Looking forward to a stronger future together!&rdquo;
                </div>
              </div>
            </div>
          )}
        </div>

        {/* EMI Estimator Section */}
        <div className={fireBorderWrapperClass + ' mt-10'}>
          <div className="bg-gradient-to-br from-white via-orange-50/20 to-white rounded-[calc(1rem-2.5px)] p-5 sm:p-8">
            <div className="max-w-2xl mx-auto text-center mb-6">
              <span className="text-xs font-black uppercase tracking-wider text-[#C23605] bg-orange-100 px-3 py-1 rounded-full border border-orange-300">
                Quick Customer Utility
              </span>
              <h2 className="text-2xl font-black text-[#0A1C34] mt-2">
                Bank of Baroda Loan EMI Estimator
              </h2>
              <p className="text-xs text-slate-600 font-semibold mt-1">
                Calculate approximate monthly installment for Home, Car, Personal or MSME Loans.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center max-w-3xl mx-auto">
              <div className="md:col-span-2 space-y-3.5">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Loan Amount (₹)</span>
                    <span className="font-black text-[#C23605]">₹ {loanAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="50000"
                    max="10000000"
                    step="50000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#D94814]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Interest Rate (% p.a.)</span>
                    <span className="font-black text-[#C23605]">{interestRate.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="7"
                    max="16"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#D94814]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Tenure (Years)</span>
                    <span className="font-black text-[#C23605]">{tenureYears} Years</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={tenureYears}
                    onChange={(e) => setTenureYears(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#D94814]"
                  />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0A1C34] text-white text-center shadow-xl border-2 border-orange-500">
                <p className="text-xs text-orange-200 font-bold uppercase tracking-wider">Estimated Monthly EMI</p>
                <p className="text-2xl font-black text-amber-300 my-1.5">₹ {formattedEmi}</p>
                <p className="text-[10px] text-slate-300 mb-3">Approx calculation</p>

                <a
                  href={`https://wa.me/919926856542?text=Namaste%20Punit%20Sir,%20I%20am%20interested%20in%20a%20Bank%20of%20Baroda%20Loan%20at%20Indore%20Branch.%0AAmount:%20₹${loanAmount.toLocaleString('en-IN')}%0AApprox%20EMI:%20₹${formattedEmi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 w-full bg-gradient-to-r from-[#D94814] to-[#FF5500] text-white py-2 px-3 rounded-xl text-xs font-black shadow-md"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Consult on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Inquiry Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-2 border-[#F15A24] rounded-2xl max-w-md w-full p-5 shadow-2xl relative"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-[#F15A24] text-white flex items-center justify-center shadow-md">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#0A1C34]">Branch Banking Inquiry</h4>
                  <p className="text-xs font-bold text-slate-600">Punit Naheta (Branch Manager)</p>
                </div>
              </div>

              <form onSubmit={handleWhatsAppInquiry} className="space-y-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-medium focus:outline-none focus:border-[#F15A24]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-medium focus:outline-none focus:border-[#F15A24]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Service / Loan</label>
                  <input
                    type="text"
                    readOnly
                    value={selectedService}
                    className="w-full px-3 py-2 rounded-xl bg-orange-50 border border-orange-200 text-[#C23605] font-black text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Requirements</label>
                  <textarea
                    rows={2}
                    value={formMsg}
                    onChange={(e) => setFormMsg(e.target.value)}
                    placeholder="Brief details..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-medium focus:outline-none focus:border-[#F15A24]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D94814] to-[#F15A24] text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send WhatsApp to Manager Directly
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-600 font-semibold">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#F15A24] text-white font-black text-xs flex items-center justify-center">
              BOB
            </span>
            <span className="text-[#0A1C34] font-black">बैंक ऑफ़ बड़ौदा</span>
            <span>• Indore Branch</span>
          </div>

          <p>
            Executive Portfolio of <strong className="text-[#0A1C34]">Punit Naheta</strong>, Branch Manager •{' '}
            <a href="tel:+919926856542" className="text-[#C23605] font-black">
              99268 56542
            </a>
          </p>

          <div className="flex items-center gap-3 font-bold">
            <a
              href="https://wa.me/919926856542"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#25D366] flex items-center gap-1 font-black"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
            <a href="tel:+919926856542" className="text-[#C23605] flex items-center gap-1 font-black">
              <PhoneCall className="w-3.5 h-3.5" /> Call
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
