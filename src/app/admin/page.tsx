'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Gift,
  CheckCircle2,
  Download,
  Search,
  Settings,
  ArrowLeft,
  Store,
  MessageSquare,
  ShieldCheck,
  QrCode,
  IndianRupee,
} from 'lucide-react';
import { Campaign, Prize, Customer, Coupon } from '@/types';
import {
  getStoredCampaign,
  saveStoredCampaign,
  getStoredPrizes,
  saveStoredPrizes,
  getStoredCustomers,
  getStoredCoupons,
} from '@/lib/store';
import {
  adminLoginAction,
  adminLogoutAction,
  checkAdminAuthAction,
  redeemCouponAction,
} from '@/app/actions/admin';

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState<'crm' | 'redemption' | 'settings'>('crm');
  const [campaign, setCampaign] = useState<Campaign>(getStoredCampaign);
  const [prizes, setPrizes] = useState<Prize[]>(getStoredPrizes);
  const [customers, setCustomers] = useState<Customer[]>(getStoredCustomers);
  const [coupons, setCoupons] = useState<Coupon[]>(getStoredCoupons);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Coupon Redemption Form state
  const [redeemCodeInput, setRedeemCodeInput] = useState('');
  const [billNumberInput, setBillNumberInput] = useState('');
  const [billAmountInput, setBillAmountInput] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redemptionResult, setRedemptionResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Settings form state
  const [saveNotification, setSaveNotification] = useState('');

  const reloadAllData = () => {
    setCampaign(getStoredCampaign());
    setPrizes(getStoredPrizes());
    setCustomers(getStoredCustomers());
    setCoupons(getStoredCoupons());
  };

  // Check server session on mount
  React.useEffect(() => {
    checkAdminAuthAction().then((res) => {
      setIsAuthenticated(res.isAuthenticated);
      setIsCheckingAuth(false);
    }).catch(() => {
      setIsCheckingAuth(false);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    try {
      const res = await adminLoginAction(pinInput);
      if (res.success) {
        setIsAuthenticated(true);
        setPinInput('');
        reloadAllData();
      } else {
        setPinError(res.message);
      }
    } catch {
      setPinError('प्रमाणीकरण सर्वर से संपर्क विफल रहा।');
    }
  };

  const handleLogout = async () => {
    await adminLogoutAction();
    setIsAuthenticated(false);
  };

  // Filtered CRM Customers
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'ALL' || c.business_category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Export CSV Action
  const exportToCSV = () => {
    if (customers.length === 0) return;
    const headers = ['Name', 'Phone', 'City', 'Business Category', 'Lead Source', 'Created At'];
    const rows = customers.map((c) => [
      `"${c.full_name}"`,
      `"${c.phone}"`,
      `"${c.city}"`,
      `"${c.business_category}"`,
      `"${c.lead_source}"`,
      `"${new Date(c.created_at).toLocaleString('en-IN')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nahata_crm_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Coupon Redemption Verification via Server Action
  const handleRedeemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCodeInput.trim() || isRedeeming) return;

    setIsRedeeming(true);
    setRedemptionResult(null);

    try {
      const res = await redeemCouponAction({
        code: redeemCodeInput,
        billNumber: billNumberInput,
        billAmount: parseFloat(billAmountInput) || 0,
        redeemedBy: 'मनोज नाहटा (काउंटर)',
      });

      setIsRedeeming(false);
      setRedemptionResult(res);
      reloadAllData();

      if (res.success) {
        setRedeemCodeInput('');
        setBillNumberInput('');
        setBillAmountInput('');
      }
    } catch {
      setIsRedeeming(false);
      setRedemptionResult({
        success: false,
        message: 'रिडेम्पशन प्रक्रिया में सर्वर त्रुटि हुई।',
      });
    }
  };

  // Handle Campaign Settings Update
  const handleCampaignSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;
    saveStoredCampaign(campaign);
    saveStoredPrizes(prizes);
    setSaveNotification('✓ सेटिंग्स और ऑफर सफलतापूर्वक सुरक्षित कर लिए गए!');
    setTimeout(() => setSaveNotification(''), 3000);
  };

  if (!campaign || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-300 font-bold text-sm">
        लोड हो रहा है...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-red-950 to-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-slate-900/90 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-amber-200">{campaign.store_name}</h2>
            <p className="text-xs text-slate-400 mt-1">सुरक्षित एडमिन एवं CRM पोर्टल</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-amber-300/80 mb-1.5 text-left">
                सिक्योरिटी पिन दर्ज करें
              </label>
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="पिन दर्ज करें (उदा. 9829)"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-amber-500/30 text-center text-lg font-mono tracking-widest text-amber-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                autoFocus
              />
              {pinError && (
                <p className="text-xs text-rose-400 font-medium mt-2 text-left">⚠️ {pinError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all"
            >
              लॉगिन करें
            </button>

            <Link
              href="/"
              className="inline-block text-xs text-slate-400 hover:text-amber-300 transition-colors pt-2"
            >
              ← कस्टमर वेबसाइट पर वापस जाएं
            </Link>
          </form>
        </div>
      </div>
    );
  }

  // KPI Calculations
  const totalLeads = customers.length;
  const totalCoupons = coupons.length;
  const redeemedCoupons = coupons.filter((c) => c.status === 'redeemed').length;
  const totalBillValue = coupons
    .filter((c) => c.status === 'redeemed')
    .reduce((sum, c) => sum + (c.bill_amount || 0), 0);

  // Repeat Customer Calculation
  const phoneCounts = customers.reduce<Record<string, number>>((acc, c) => {
    acc[c.phone] = (acc[c.phone] || 0) + 1;
    return acc;
  }, {});
  const repeatCustomerCount = Object.values(phoneCounts).filter((count) => count > 1).length;
  const averageOrderValue = redeemedCoupons > 0 ? Math.round(totalBillValue / redeemedCoupons) : 0;
  const estimatedGrossMargin = Math.round(totalBillValue * 0.22); // Estimated ~22% gross margin on general store items

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Navbar */}
      <header className="bg-gradient-to-r from-red-900 via-rose-950 to-amber-950 text-white px-4 sm:px-8 py-4 shadow-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 transition-colors"
              title="कस्टमर वेबसाइट देखें"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-amber-300" />
                <h1 className="text-base sm:text-lg font-black text-amber-100">
                  {campaign.store_name} — Admin & CRM
                </h1>
              </div>
              <p className="text-[11px] text-amber-300/80 font-medium">
                प्रबंधक: {campaign.contact_person}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              कैंपेन लाइव है
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-amber-200 border border-white/10 transition-colors"
            >
              लॉगआउट
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* PILOT IMPACT & ROI SUMMARY BANNER */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-red-950 text-white border border-amber-500/30 shadow-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                📊 पायलट बिजनेस रिपोर्ट (Nahata Pilot ROI)
              </span>
              <h3 className="text-base sm:text-lg font-black text-white mt-1">
                दुकान की अतिरिक्त बिक्री और ग्राहक वापसी का हिसाब
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-semibold">
              <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[10px]">औसत बिल (AOV)</span>
                <span className="text-amber-200 font-bold">₹{averageOrderValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[10px]">दोबारा ग्राहक (Repeat)</span>
                <span className="text-emerald-300 font-bold">{repeatCustomerCount} ग्राहक</span>
              </div>
              <div className="bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/40">
                <span className="text-emerald-300 block text-[10px]">अनुमानित सकल मुनाफा (~22%)</span>
                <span className="text-emerald-400 font-black">₹{estimatedGrossMargin.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI METRIC CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold">कुल ग्राहक लीड्स</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalLeads}</div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">
              ↑ 100% WhatsApp वेरिफाइड
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold">जारी कूपन</span>
              <Gift className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalCoupons}</div>
            <p className="text-[10px] text-slate-500 font-semibold mt-1">
              {totalCoupons - redeemedCoupons} एक्टिव कूपन शेष
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold">रिडीम कूपन</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">{redeemedCoupons}</div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">
              {totalCoupons > 0 ? Math.round((redeemedCoupons / totalCoupons) * 100) : 0}% कन्वर्शन दर
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold">रिडेम्पशन सेल</span>
              <IndianRupee className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              ₹{totalBillValue.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-500 font-semibold mt-1">
              काउंटर बिलिंग रिकॉर्ड
            </p>
          </div>
        </div>

        {/* TAB BUTTONS */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('crm')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'crm'
                ? 'bg-red-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>ग्राहक CRM लीड्स ({filteredCustomers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('redemption')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'redemption'
                ? 'bg-red-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>कूपन सत्यापन & रिडेम्पशन</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'settings'
                ? 'bg-red-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>कैंपेन व ऑफर सेटिंग्स</span>
          </button>
        </div>

        {/* TAB 1: CRM LEADS & DIRECTORY */}
        {activeTab === 'crm' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Search & Filter Bar */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="नाम, मोबाइल या शहर से खोजें..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-red-900"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white outline-none"
                >
                  <option value="ALL">सभी वर्ग (Categories)</option>
                  <option value="किराना / जनरल स्टोर">किराना / जनरल स्टोर</option>
                  <option value="होलसेलर">होलसेलर</option>
                  <option value="रिटेलर">रिटेलर</option>
                  <option value="घरेलू उपभोक्ता (Consumer)">उपभोक्ता</option>
                </select>

                <button
                  type="button"
                  onClick={exportToCSV}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>CSV एक्सपोर्ट</span>
                </button>
              </div>
            </div>

            {/* Customers Table */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase">
                    <tr>
                      <th className="px-4 py-3">ग्राहक का नाम</th>
                      <th className="px-4 py-3">मोबाइल नंबर</th>
                      <th className="px-4 py-3">शहर</th>
                      <th className="px-4 py-3">व्यापार वर्ग</th>
                      <th className="px-4 py-3">जीता हुआ कूपन</th>
                      <th className="px-4 py-3 text-right">कार्रवाई</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                          कोई रिकॉर्ड नहीं मिला।
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((cust) => {
                        const userCoupon = coupons.find((c) => c.customer_id === cust.id);
                        return (
                          <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3.5 font-bold text-slate-900">
                              <span>{cust.full_name}</span>
                              {(phoneCounts[cust.phone] || 0) > 1 && (
                                <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 inline-block">
                                  🔁 Repeat
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 font-mono text-slate-700">
                              +91 {cust.phone}
                            </td>
                            <td className="px-4 py-3.5 text-slate-600">{cust.city}</td>
                            <td className="px-4 py-3.5">
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                {cust.business_category}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              {userCoupon ? (
                                <div className="space-y-0.5">
                                  <span className="font-mono text-xs font-bold text-red-900 block">
                                    {userCoupon.code}
                                  </span>
                                  <span className="text-[10px] text-slate-500">
                                    {userCoupon.prize?.title}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-400 text-xs">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <a
                                href={`https://wa.me/91${cust.phone}?text=${encodeURIComponent(
                                  `नमस्ते ${cust.full_name} जी, नाहाटा जनरल स्टोर्स में पधारने हेतु धन्यवाद!`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 font-bold text-xs"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </a>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COUPON REDEMPTION SCANNER */}
        {activeTab === 'redemption' && (
          <div className="grid md:grid-cols-3 gap-6 animate-in fade-in duration-200">
            {/* Left Box: Validation Portal */}
            <div className="md:col-span-1 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>कूपन सत्यापन व रिडीम</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ग्राहक द्वारा काउंटर पर प्रस्तुत कोड दर्ज करें
                </p>
              </div>

              {redemptionResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold ${
                    redemptionResult.success
                      ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
                      : 'bg-red-50 border border-red-300 text-red-800'
                  }`}
                >
                  {redemptionResult.message}
                </div>
              )}

              <form onSubmit={handleRedeemSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    कूपन कोड *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. NAHATA-FEST-4490"
                    value={redeemCodeInput}
                    onChange={(e) => setRedeemCodeInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm uppercase focus:ring-2 focus:ring-red-900 outline-none"
                  />
                </div>

                {/* Instant Counter Preview Card */}
                {redeemCodeInput.trim().length > 3 && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 animate-in fade-in">
                    {(() => {
                      const match = coupons.find(
                        (c) => c.code.toUpperCase() === redeemCodeInput.trim().toUpperCase()
                      );
                      if (!match) {
                        return (
                          <div className="text-amber-700 font-medium flex items-center gap-1">
                            <span>🔍</span> <span>कूपन कोड खोजा जा रहा है... (कोड सही दर्ज करें)</span>
                          </div>
                        );
                      }
                      const isValid = match.status === 'valid' && new Date(match.expires_at) >= new Date();
                      return (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{match.customer?.full_name || 'ग्राहक'} ({match.customer?.phone})</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isValid
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : match.status === 'redeemed'
                                  ? 'bg-red-100 text-red-800 border border-red-300'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {isValid
                                ? '✓ मान्य (Valid)'
                                : match.status === 'redeemed'
                                ? '✗ रिडीम हो चुका'
                                : 'समाप्त'}
                            </span>
                          </div>
                          <div className="font-bold text-amber-900 text-xs">
                            🎁 {match.prize?.title}
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {match.prize?.terms_and_conditions || 'न्यूनतम बिलिंग शर्त लागू'}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    बिल नंबर (वैकल्पिक)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. INV-8921"
                    value={billNumberInput}
                    onChange={(e) => setBillNumberInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    बिल राशि (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="उदा. 2500"
                    value={billAmountInput}
                    onChange={(e) => setBillAmountInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isRedeeming}
                  className="w-full py-2.5 rounded-xl bg-red-900 hover:bg-red-950 text-white font-bold text-sm shadow-md transition-colors disabled:opacity-50"
                >
                  {isRedeeming ? 'सत्यापित हो रहा...' : 'कूपन रिडीम करें'}
                </button>
              </form>
            </div>

            {/* Right Box: All Issued Coupons Table */}
            <div className="md:col-span-2 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden p-5">
              <h3 className="font-black text-slate-900 text-base mb-3">
                जारी किए गए सभी कूपन ({coupons.length})
              </h3>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase sticky top-0">
                    <tr>
                      <th className="px-3 py-2.5">कूपन कोड</th>
                      <th className="px-3 py-2.5">ग्राहक</th>
                      <th className="px-3 py-2.5">ऑफर</th>
                      <th className="px-3 py-2.5">स्थिति</th>
                      <th className="px-3 py-2.5">तारीख</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {coupons.map((c) => (
                      <tr key={c.id}>
                        <td className="px-3 py-2.5 font-mono font-bold text-red-900">
                          {c.code}
                        </td>
                        <td className="px-3 py-2.5 font-semibold text-slate-800">
                          {c.customer?.full_name} ({c.customer?.phone})
                        </td>
                        <td className="px-3 py-2.5 text-slate-600">{c.prize?.title}</td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.status === 'redeemed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {c.status === 'redeemed' ? '✓ Redeemed' : 'Active'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-slate-400">
                          {new Date(c.created_at).toLocaleDateString('hi-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CAMPAIGN & PRIZE SETTINGS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleCampaignSave} className="space-y-6 animate-in fade-in duration-200">
            {saveNotification && (
              <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold">
                {saveNotification}
              </div>
            )}

            {/* Campaign Basic Info */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-black text-slate-900 text-base border-b border-slate-100 pb-2">
                दुकान व कैंपेन सेटिंग्स
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">दुकान का नाम</label>
                  <input
                    type="text"
                    value={campaign.store_name}
                    onChange={(e) => setCampaign({ ...campaign, store_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">प्रबंधक का नाम</label>
                  <input
                    type="text"
                    value={campaign.contact_person}
                    onChange={(e) => setCampaign({ ...campaign, contact_person: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">WhatsApp नंबर (Claim Recipient)</label>
                  <input
                    type="text"
                    value={campaign.whatsapp_number}
                    onChange={(e) => setCampaign({ ...campaign, whatsapp_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">WhatsApp कम्युनिटी लिंक</label>
                  <input
                    type="text"
                    value={campaign.whatsapp_community_link || ''}
                    onChange={(e) => setCampaign({ ...campaign, whatsapp_community_link: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">दुकान का पता (Location)</label>
                  <input
                    type="text"
                    value={campaign.location}
                    onChange={(e) => setCampaign({ ...campaign, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">दुकान नंबर (Shop Number)</label>
                  <input
                    type="text"
                    value={campaign.shop_number || ''}
                    onChange={(e) => setCampaign({ ...campaign, shop_number: e.target.value })}
                    placeholder="उदा. दुकान नं. 14, नाहटा कॉम्प्लेक्स"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">मनोज जी का संदेश (Personal Quote)</label>
                  <input
                    type="text"
                    value={campaign.owner_quote || ''}
                    onChange={(e) => setCampaign({ ...campaign, owner_quote: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">कैंपेन मुख्य शीर्षक (Headline)</label>
                  <input
                    type="text"
                    value={campaign.headline}
                    onChange={(e) => setCampaign({ ...campaign, headline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
              </div>

              {/* Interactive Features & Visual Controls */}
              <div className="pt-3 border-t border-slate-100 grid sm:grid-cols-2 gap-3 text-xs">
                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={campaign.show_owner_card !== false}
                    onChange={(e) => setCampaign({ ...campaign, show_owner_card: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">मनोज नाहटा ट्रस्ट कार्ड दिखाएं</span>
                    <span className="text-[10px] text-slate-500">होमपेज पर फोटो और अधिकार संदेश प्रदर्शित करें</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={campaign.is_sound_enabled !== false}
                    onChange={(e) => setCampaign({ ...campaign, is_sound_enabled: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">साउंड इफेक्ट्स चालू रखें</span>
                    <span className="text-[10px] text-slate-500">उछलता लोगो, जीत का चाइम और व्हील टिक साउंड</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={campaign.is_scratch_enabled}
                    onChange={(e) => setCampaign({ ...campaign, is_scratch_enabled: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">लकी स्क्रैच कार्ड चालू</span>
                    <span className="text-[10px] text-slate-500">ग्राहकों को स्क्रैच कार्ड गेम खेलने दें</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={campaign.is_spin_enabled}
                    onChange={(e) => setCampaign({ ...campaign, is_spin_enabled: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">लकी स्पिन व्हील चालू</span>
                    <span className="text-[10px] text-slate-500">ग्राहकों को स्पिन व्हील गेम खेलने दें</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Prize Probability Manager */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-black text-slate-900 text-base border-b border-slate-100 pb-2">
                ऑफर व संभावना (Probability Weighting)
              </h3>
              <div className="space-y-3">
                {prizes.map((p, idx) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 grid sm:grid-cols-4 gap-3 items-center text-xs"
                  >
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={p.title}
                        onChange={(e) => {
                          const updated = [...prizes];
                          updated[idx].title = e.target.value;
                          setPrizes(updated);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                        संभावना भार (Weight)
                      </label>
                      <input
                        type="number"
                        value={p.probability_weight}
                        onChange={(e) => {
                          const updated = [...prizes];
                          updated[idx].probability_weight = parseInt(e.target.value) || 1;
                          setPrizes(updated);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                        दावा किया गया / कुल
                      </label>
                      <span className="font-bold text-slate-700">
                        {p.claimed_quantity} / {p.total_quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors"
            >
              सेटिंग्स सुरक्षित करें (Save Changes)
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
