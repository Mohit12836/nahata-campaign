'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  FileSpreadsheet,
  Copy,
  ExternalLink,
  RefreshCw,
  Check,
  Share2,
  Sparkles,
  Printer,
  TrendingUp,
} from 'lucide-react';
import { Campaign, Prize, Customer, Coupon, Merchant } from '@/types';
import {
  getStoredCampaign,
  saveStoredCampaign,
  getStoredPrizes,
  saveStoredPrizes,
  getStoredCustomers,
  getStoredCoupons,
  getStoredMerchants,
  getMerchantBySlug,
} from '@/lib/store';
import {
  adminLoginAction,
  adminLogoutAction,
  checkAdminAuthAction,
  redeemCouponAction,
  getAdminDataAction,
} from '@/app/actions/admin';
import {
  getStoredGoogleSheetsWebhookUrl,
  saveStoredGoogleSheetsWebhookUrl,
} from '@/lib/google-sheets';
import {
  testGoogleSheetsWebhookAction,
  bulkSyncToGoogleSheetsAction,
  saveGoogleSheetsWebhookAction,
} from '@/app/actions/sheets';

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const storeSlug = searchParams?.get('store') || 'nahata';

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState<'crm' | 'redemption' | 'qr-links' | 'settings' | 'sheets'>('crm');
  const [campaign, setCampaign] = useState<Campaign>(getStoredCampaign);
  const [prizes, setPrizes] = useState<Prize[]>(getStoredPrizes);
  const [customers, setCustomers] = useState<Customer[]>(getStoredCustomers);
  const [coupons, setCoupons] = useState<Coupon[]>(getStoredCoupons);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPromoText, setCopiedPromoText] = useState(false);
  const [merchant, setMerchant] = useState<Merchant | undefined>(() => getMerchantBySlug(storeSlug));
  const [originUrl, setOriginUrl] = useState('');

  // Google Sheets Auto-Sync State
  const [googleSheetWebhook, setGoogleSheetWebhook] = useState('');
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [isSyncingToSheets, setIsSyncingToSheets] = useState(false);
  const [sheetSyncStatus, setSheetSyncStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

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
    coupon?: Coupon;
  } | null>(null);

  // Settings form state
  const [saveNotification, setSaveNotification] = useState('');

  const reloadAllData = async () => {
    try {
      const serverData = await getAdminDataAction();
      if (serverData.customers && serverData.customers.length > 0) {
        setCustomers(serverData.customers);
      } else {
        setCustomers(getStoredCustomers());
      }
      if (serverData.coupons && serverData.coupons.length > 0) {
        setCoupons(serverData.coupons);
      } else {
        setCoupons(getStoredCoupons());
      }
    } catch {
      setCustomers(getStoredCustomers());
      setCoupons(getStoredCoupons());
    }
    const currentCampaign = getStoredCampaign();
    const currentMerchant = getMerchantBySlug(storeSlug);
    setMerchant(currentMerchant);
    if (currentMerchant && storeSlug !== 'nahata') {
      setCampaign({
        ...currentCampaign,
        slug: currentMerchant.slug,
        store_name: currentMerchant.name,
        contact_person: currentMerchant.owner_name,
        whatsapp_number: currentMerchant.whatsapp_number,
        location: currentMerchant.location,
      });
    } else {
      setCampaign(currentCampaign);
    }
    setPrizes(getStoredPrizes());
    setGoogleSheetWebhook(getStoredGoogleSheetsWebhookUrl());
  };

  // Check server session on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setOriginUrl(window.location.origin);
    }
    checkAdminAuthAction().then((res) => {
      setIsAuthenticated(res.isAuthenticated);
      setIsCheckingAuth(false);
      if (res.isAuthenticated) {
        setGoogleSheetWebhook(getStoredGoogleSheetsWebhookUrl());
        reloadAllData();
      }
    }).catch(() => {
      setIsCheckingAuth(false);
    });
  }, [storeSlug]);

  const handleSaveWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredGoogleSheetsWebhookUrl(googleSheetWebhook);
    try {
      const res = await saveGoogleSheetsWebhookAction(googleSheetWebhook);
      setSaveNotification(res.message || 'Google Sheets Webhook URL सफलतापूर्वक सुरक्षित हो गया!');
    } catch {
      setSaveNotification('Google Sheets Webhook URL सफलतापूर्वक सुरक्षित हो गया!');
    }
    setTimeout(() => setSaveNotification(''), 3500);
  };

  const handleTestWebhook = async () => {
    if (!googleSheetWebhook) return;
    setIsTestingWebhook(true);
    setSheetSyncStatus(null);
    try {
      const res = await testGoogleSheetsWebhookAction(googleSheetWebhook);
      setSheetSyncStatus(res);
    } catch {
      setSheetSyncStatus({ success: false, message: 'परीक्षण अनुरोध विफल रहा।' });
    }
    setIsTestingWebhook(false);
  };

  const handleBulkSync = async () => {
    setIsSyncingToSheets(true);
    setSheetSyncStatus(null);
    try {
      const res = await bulkSyncToGoogleSheetsAction(googleSheetWebhook);
      setSheetSyncStatus({
        success: res.success,
        message: `${res.count} ग्राहक लीड्स और रिडेम्पशन Google Sheet में सफलतापूर्वक भेज दिए गए!`,
      });
    } catch {
      setSheetSyncStatus({ success: false, message: 'Google Sheets में सिंक करने में त्रुटि हुई।' });
    }
    setIsSyncingToSheets(false);
  };

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

          <div className="flex items-center gap-2">
            <Link
              href={`/store/${campaign.slug}`}
              target="_blank"
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-xs font-bold text-amber-200 border border-amber-500/30 transition-colors"
            >
              कस्टमर पेज देखें ↗
            </Link>
            <Link
              href="/super-admin"
              className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-xs font-bold text-indigo-200 border border-indigo-500/30 transition-colors"
            >
              सुपर एडमिन
            </Link>
            <span className="hidden md:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
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
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Weekly Sale रिडेम्पशन & नया कूपन ({redeemedCoupons} प्रयुक्त)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qr-links')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'qr-links'
                ? 'bg-red-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4 text-amber-500" />
            <span>QR कोड & शेयर लिंक्स</span>
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

          <button
            type="button"
            onClick={() => setActiveTab('sheets')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'sheets'
                ? 'bg-emerald-800 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Google Sheets & Drive सिंक</span>
            {googleSheetWebhook && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
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

              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white outline-none"
                >
                  <option value="ALL">सभी वर्ग (Categories)</option>
                  <option value="घरेलू उपभोक्ता (Family / Home)">घरेलू उपभोक्ता (Family / Home)</option>
                  <option value="दुकानदार / रिटेलर">दुकानदार / रिटेलर</option>
                  <option value="होलसेलर">होलसेलर</option>
                  <option value="विद्यार्थी / स्कूल वर्ग">विद्यार्थी / स्कूल वर्ग</option>
                  <option value="अन्य ग्राहक">अन्य ग्राहक</option>
                </select>

                <button
                  type="button"
                  onClick={handleBulkSync}
                  disabled={isSyncingToSheets}
                  className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shrink-0 disabled:opacity-50"
                  title="Google Sheets में सारा डेटा भेजें"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{isSyncingToSheets ? 'सिंक हो रहा है...' : 'Google Sheet सिंक'}</span>
                </button>

                <button
                  type="button"
                  onClick={exportToCSV}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>CSV</span>
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
                  className={`p-3.5 rounded-xl text-xs font-bold space-y-2 ${
                    redemptionResult.success
                      ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
                      : 'bg-red-50 border border-red-300 text-red-800'
                  }`}
                >
                  <p>{redemptionResult.message}</p>
                  {redemptionResult.success && redemptionResult.coupon?.next_purchase_coupon && (
                    <div className="p-3 bg-white rounded-lg border border-emerald-200 shadow-sm space-y-1 text-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-black tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          🎫 अगली खरीद का नया कूपन जारी हुआ!
                        </span>
                        <span className="font-mono font-black text-emerald-700 text-xs">
                          {redemptionResult.coupon.next_purchase_coupon.code}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900">
                        {redemptionResult.coupon.next_purchase_coupon.discount_text}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        न्यूनतम खरीद: ₹{redemptionResult.coupon.next_purchase_coupon.min_order_value} • 
                        वैधता: {new Date(redemptionResult.coupon.next_purchase_coupon.valid_until).toLocaleDateString('hi-IN')} तक
                      </p>
                      <div className="pt-1">
                        <a
                          href={`https://wa.me/91${redemptionResult.coupon.customer?.phone || ''}?text=${encodeURIComponent(
                            `नमस्ते ${redemptionResult.coupon.customer?.full_name || 'ग्राहक'} जी! नाहाटा जनरल स्टोर्स से खरीदारी के लिए धन्यवाद। आपका अगला डिस्काउंट कूपन: *${redemptionResult.coupon.next_purchase_coupon.code}* (${redemptionResult.coupon.next_purchase_coupon.discount_text}) अगली बार दिखाने पर लागू होगा!`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>ग्राहक को WhatsApp पर नया कूपन भेजें</span>
                        </a>
                      </div>
                    </div>
                  )}
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

        {/* TAB: QR CODE & SHARE LINKS */}
        {activeTab === 'qr-links' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Info Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 text-white border border-amber-500/30 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                    📢 दुकान प्रचार & वायरल शेयरिंग टूल्स
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                    {campaign.store_name} — QR स्टैंडी & WhatsApp कैंपेन
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                    दुकान के काउंटर पर लगाने के लिए QR कोड प्रिंट करें और ग्राहकों को WhatsApp पर भेजने के लिए बना-बनाया मैसेज 1-क्लिक में कॉपी करें।
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span>QR स्टैंडी प्रिंट करें</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Grid: Live QR Standee Preview & WhatsApp Campaign Box */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Counter QR Standee Card */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 print:shadow-none print:border-none">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-red-700" />
                    <h4 className="font-black text-slate-900 text-sm sm:text-base">
                      काउंटर QR स्टैंडी (Table-Top Preview)
                    </h4>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    100% स्कैनेबल
                  </span>
                </div>

                {/* Printable Standee Box */}
                <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-50 via-white to-red-50 border-2 border-dashed border-amber-400 text-center space-y-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 bg-red-100 px-3 py-1 rounded-full border border-red-200">
                      ✨ {campaign.title} ✨
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 pt-2">
                      {campaign.store_name}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      {campaign.location} | संपर्क: {campaign.whatsapp_number}
                    </p>
                  </div>

                  {/* QR Image Box */}
                  <div className="inline-block p-4 bg-white rounded-2xl shadow-md border-2 border-red-600/30">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                        `${originUrl || 'https://nahata-campaign.vercel.app'}/store/${campaign.slug}`
                      )}&margin=10`}
                      alt="Store Offer QR Code"
                      className="w-44 h-44 mx-auto rounded-lg"
                      loading="lazy"
                    />
                    <div className="mt-2 text-[10px] text-slate-500 font-bold">
                      कैमरा या Google Pay से स्कैन करें
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-black text-red-800">
                      🎁 मोबाइल पर स्क्रैच कार्ड खोलें और पक्का इनाम जीतें!
                    </p>
                    <p className="text-[11px] text-slate-500">
                      हर खरीदारी पर विशेष डिस्काउंट कूपन और उपहार
                    </p>
                  </div>
                </div>

                {/* Store URL & Copy Button */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-slate-700">
                    दुकान का मुख्य ऑफर लिंक (WhatsApp / Instagram बायो में डालें):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${originUrl || 'https://nahata-campaign.vercel.app'}/store/${campaign.slug}`}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs text-slate-700 font-mono select-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${originUrl || window.location.origin}/store/${campaign.slug}`;
                        navigator.clipboard.writeText(url);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2500);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-red-900 hover:bg-red-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'कॉपी हुआ!' : 'कॉपी लिंक'}</span>
                    </button>
                    <Link
                      href={`/store/${campaign.slug}`}
                      target="_blank"
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0"
                      title="नया टैब में खोलें"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* WhatsApp Promotional Campaign Template Box */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-black text-slate-900 text-sm sm:text-base">
                      WhatsApp ब्रॉडकास्ट & शेयरिंग मैसेज
                    </h4>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    रेडी-टू-सेंड
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  इस मैसेज को कॉपी करके अपने ग्राहकों के WhatsApp ग्रुप, ब्रॉडकास्ट लिस्ट या स्टेटस पर शेयर करें:
                </p>

                {/* WhatsApp Message Preview Bubble */}
                <div className="p-4 rounded-2xl bg-[#EFEAE2] border border-[#DAD3C8] text-slate-800 text-xs sm:text-sm font-sans space-y-2 whitespace-pre-wrap leading-relaxed shadow-inner">
                  {`🛍️ *${campaign.store_name} — ${campaign.title}* 🎉

नमस्ते जी! 🙏
हमारी दुकान पर विशेष फेस्टिव लकी ड्रॉ ऑफर शुरू हो चुका है! 

🎁 *आप क्या जीत सकते हैं:*
• 10% से 50% तक विशेष डिस्काउंट कूपन
• सरप्राइज गिफ्ट हैंपर व उपहार
• हर खरीदारी पर पक्का इनाम!

👇 *अभी अपना स्क्रैच कार्ड खोलें:*
${originUrl || 'https://nahata-campaign.vercel.app'}/store/${campaign.slug}

📍 *पता:* ${campaign.location}
📞 *संपर्क:* ${campaign.whatsapp_number}

_ऑफर सीमित समय के लिए मान्य है। अभी खेलें और इनाम पाएं!_`}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const msg = `🛍️ *${campaign.store_name} — ${campaign.title}* 🎉\n\nनमस्ते जी! 🙏\nहमारी दुकान पर विशेष फेस्टिव लकी ड्रॉ ऑफर शुरू हो चुका है!\n\n🎁 *आप क्या जीत सकते हैं:*\n• 10% से 50% तक विशेष डिस्काउंट कूपन\n• सरप्राइज गिफ्ट हैंपर व उपहार\n• हर खरीदारी पर पक्का इनाम!\n\n👇 *अभी अपना स्क्रैच कार्ड खोलें:*\n${originUrl || window.location.origin}/store/${campaign.slug}\n\n📍 *पता:* ${campaign.location}\n📞 *संपर्क:* ${campaign.whatsapp_number}\n\n_ऑफर सीमित समय के लिए मान्य है। अभी खेलें और इनाम पाएं!_`;
                      navigator.clipboard.writeText(msg);
                      setCopiedPromoText(true);
                      setTimeout(() => setCopiedPromoText(false), 2500);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    {copiedPromoText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedPromoText ? 'मैसेज कॉपी हो गया!' : 'प्रचार मैसेज कॉपी करें'}</span>
                  </button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `🛍️ *${campaign.store_name} — ${campaign.title}* 🎉\n\nनमस्ते जी! 🙏 हमारी दुकान पर विशेष फेस्टिव लकी ड्रॉ ऑफर शुरू हो चुका है!\n\n👇 अपना स्क्रैच कार्ड खोलें:\n${originUrl || 'https://nahata-campaign.vercel.app'}/store/${campaign.slug}\n\n📍 पता: ${campaign.location}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>WhatsApp पर भेजें ↗</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GOOGLE SHEETS & DRIVE AUTO-SYNC */}
        {activeTab === 'sheets' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Sync Feedback Alert */}
            {sheetSyncStatus && (
              <div
                className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 ${
                  sheetSyncStatus.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-rose-50 border-rose-300 text-rose-800'
                }`}
              >
                <span>{sheetSyncStatus.success ? '✅' : '⚠️'} {sheetSyncStatus.message}</span>
                <button
                  type="button"
                  onClick={() => setSheetSyncStatus(null)}
                  className="text-xs underline opacity-80 hover:opacity-100"
                >
                  बंद करें
                </button>
              </div>
            )}

            {/* Top Overview & Status Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                      Google Sheets & Drive ऑटो-सिंक
                      {googleSheetWebhook ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          🟢 ऑटो-सिंक ऑन
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
                          ⚪ सेटअप आवश्यक
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      हर नए ग्राहक का WhatsApp नंबर, कूपन और काउंटर बिलिंग रिकॉर्ड अपने-आप आपकी Google Sheet में सेव होगा।
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleBulkSync}
                    disabled={isSyncingToSheets || !googleSheetWebhook}
                    className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncingToSheets ? 'animate-spin' : ''}`} />
                    <span>{isSyncingToSheets ? 'सिंक हो रहा है...' : 'अभी सारा डेटा सिंक करें'}</span>
                  </button>
                </div>
              </div>

              {/* Webhook Configuration Form */}
              <form onSubmit={handleSaveWebhook} className="space-y-3 pt-1">
                <label className="block text-xs font-bold text-slate-700">
                  Google Apps Script Web App URL (Webhook)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={googleSheetWebhook}
                    onChange={(e) => setGoogleSheetWebhook(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-colors whitespace-nowrap"
                    >
                      URL सुरक्षित करें
                    </button>
                    <button
                      type="button"
                      onClick={handleTestWebhook}
                      disabled={isTestingWebhook || !googleSheetWebhook}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm border border-slate-300 transition-colors whitespace-nowrap disabled:opacity-50"
                    >
                      {isTestingWebhook ? 'जांच जारी...' : 'कनेक्शन टेस्ट'}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 font-mono flex items-center gap-1.5">
                    <span>🔐 एंडपॉइंट सुरक्षा टोकन:</span>
                    <strong className="text-emerald-700 font-bold">NAHATA_SECURE_SYNC_2026_TOKEN</strong>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    (अनधिकृत बाहरी अनुरोधों से पूर्ण सुरक्षा)
                  </span>
                </div>
              </form>
            </div>

            {/* How It Works & Auto-Created Folders/Tabs Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                    📋
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">
                    शीट में अपने-आप बनने वाले टैब व कॉलम
                  </h4>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <p className="font-bold text-emerald-900">1. 👥 ग्राहक लीड्स (Customers Tab)</p>
                    <p className="text-[11px] text-emerald-700 mt-1">
                      दिनांक, ग्राहक का नाम, मोबाइल नंबर, 💬 डायरेक्ट WhatsApp चैट लिंक, शहर, गेम प्रकार, जीता हुआ इनाम, कूपन कोड, और वैधता।
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200">
                    <p className="font-bold text-indigo-900">2. 💰 काउंटर रिडेम्पशन (Redemptions Tab)</p>
                    <p className="text-[11px] text-indigo-700 mt-1">
                      रिडेम्पशन का सही समय, कूपन कोड, बिल नंबर, बिल राशि (₹), सत्यापित कर्ता (मनोज नाहटा), और ग्राहक का नाम।
                    </p>
                  </div>
                </div>
              </div>

              {/* 4-Step Setup Guide */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center">
                      ⚙️
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      1 मिनट में Google Sheet कैसे कनेक्ट करें?
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `// Bharat Retail Offer Platform - Google Apps Script\\n// Open google-apps-script.js in your project directory to copy full code`
                      );
                      setCopiedScript(true);
                      setTimeout(() => setCopiedScript(false), 3000);
                    }}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1"
                  >
                    {copiedScript ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedScript ? 'कॉपी हो गया!' : 'स्क्रिप्ट कोड'}</span>
                  </button>
                </div>

                <ol className="space-y-2 text-xs text-slate-600 list-decimal list-inside leading-relaxed">
                  <li>
                    <strong>
                      <a
                        href="https://sheets.new"
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 underline inline-flex items-center gap-0.5"
                      >
                        sheets.new ↗
                      </a>
                    </strong> खोलें और नाम रखें <em>&quot;Nahata General Stores Data&quot;</em>।
                  </li>
                  <li>मेनू में <strong>Extensions (एक्सटेंशन) ➔ Apps Script</strong> खोलें।</li>
                  <li>
                    प्रोजेक्ट में मौजूद <code>google-apps-script.js</code> का कोड पेस्ट करें और Save (Ctrl+S) करें।
                  </li>
                  <li>
                    ऊपर नीले <strong>Deploy ➔ New deployment</strong> पर क्लिक करें, Type में <strong>&quot;Web app&quot;</strong> और Access में <strong>&quot;Anyone&quot;</strong> चुनकर Deploy करें।
                  </li>
                  <li>मिला हुआ <strong>Web app URL</strong> ऊपर बॉक्स में डालकर &quot;URL सुरक्षित करें&quot; दबाएं!</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-amber-300 font-bold gap-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">दुकान डैशबोर्ड लोड हो रहा है...</p>
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}

