'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Gift,
  CheckCircle2,
  TrendingUp,
  Download,
  Search,
  Settings,
  ArrowLeft,
  Store,
  Phone,
  MessageSquare,
  ShieldCheck,
  Percent,
  Plus,
  Trash2,
  RefreshCw,
  Clock,
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
  redeemCoupon,
} from '@/lib/store';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'crm' | 'redemption' | 'settings'>('crm');
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Coupon Redemption Form state
  const [redeemCodeInput, setRedeemCodeInput] = useState('');
  const [billNumberInput, setBillNumberInput] = useState('');
  const [billAmountInput, setBillAmountInput] = useState('');
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

  useEffect(() => {
    reloadAllData();
  }, []);

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

  // Handle Coupon Redemption Verification
  const handleRedeemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCodeInput.trim()) return;

    const res = redeemCoupon(
      redeemCodeInput,
      billNumberInput,
      parseFloat(billAmountInput) || 0,
      'मनोज नाहटा (काउंटर)'
    );

    setRedemptionResult(res);
    reloadAllData();
    if (res.success) {
      setRedeemCodeInput('');
      setBillNumberInput('');
      setBillAmountInput('');
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

  if (!campaign) return <div className="p-8 text-center text-slate-800">लोड हो रहा है...</div>;

  // KPI Calculations
  const totalLeads = customers.length;
  const totalCoupons = coupons.length;
  const redeemedCoupons = coupons.filter((c) => c.status === 'redeemed').length;
  const totalBillValue = coupons
    .filter((c) => c.status === 'redeemed')
    .reduce((sum, c) => sum + (c.bill_amount || 0), 0);

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

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              कैंपेन लाइव है
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
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
                              {cust.full_name}
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
                  className="w-full py-2.5 rounded-xl bg-red-900 hover:bg-red-950 text-white font-bold text-sm shadow-md transition-colors"
                >
                  कूपन रिडीम करें
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
                  <label className="block font-bold text-slate-700 mb-1">कैंपेन मुख्य शीर्षक (Headline)</label>
                  <input
                    type="text"
                    value={campaign.headline}
                    onChange={(e) => setCampaign({ ...campaign, headline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
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
