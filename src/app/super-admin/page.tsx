'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Store,
  Users,
  Ticket,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ExternalLink,
  PlusCircle,
  Lock,
  LogOut,
  RefreshCw,
  Search,
  Check,
  X,
  Sliders,
  Layers,
} from 'lucide-react';
import { Merchant } from '@/types';
import {
  getStoredMerchants,
  saveStoredMerchants,
  getStoredCoupons,
  getStoredCustomers,
} from '@/lib/store';
import {
  adminLoginAction,
  adminLogoutAction,
  checkAdminAuthAction,
  getSuperAdminMerchantsAction,
  updateMerchantStatusAction,
  updateMerchantQuotaAction,
  updateMerchantPlanAction,
} from '@/app/actions/admin';

export default function SuperAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isMutatingId, setIsMutatingId] = useState<string | null>(null);

  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
  const [activeTab, setActiveTab] = useState<'merchants' | 'metrics' | 'security'>('merchants');

  // Stats
  const [totalCouponsCount, setTotalCouponsCount] = useState(0);
  const [redeemedCount, setRedeemedCount] = useState(0);
  const [totalCustomersCount, setTotalCustomersCount] = useState(0);

  const loadData = async () => {
    // 1. Fetch Merchants securely from Server Action (backed by Supabase)
    const merchantsRes = await getSuperAdminMerchantsAction();
    if (merchantsRes.success && merchantsRes.merchants) {
      setMerchants(merchantsRes.merchants);
    } else {
      const storedMerchants = getStoredMerchants();
      setMerchants(storedMerchants);
      if (merchantsRes.message) {
        setActionMessage({ text: merchantsRes.message, type: 'error' });
      }
    }

    const storedCoupons = getStoredCoupons();
    const storedCustomers = getStoredCustomers();
    setTotalCouponsCount(storedCoupons.length);
    setRedeemedCount(storedCoupons.filter((c) => c.status === 'redeemed').length);
    setTotalCustomersCount(storedCustomers.length);
  };

  // Check auth on mount
  useEffect(() => {
    checkAdminAuthAction().then((res) => {
      setIsAuthenticated(res.isAuthenticated);
      if (res.isAuthenticated) {
        loadData();
      }
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setPinError(null);

    try {
      const res = await adminLoginAction(pinInput);
      setIsLoggingIn(false);

      if (res.success) {
        setIsAuthenticated(true);
        loadData();
      } else {
        setPinError(res.message);
      }
    } catch {
      setIsLoggingIn(false);
      setPinError('प्रमाणीकरण में त्रुटि। कृपया पुनः प्रयास करें।');
    }
  };

  const handleLogout = async () => {
    await adminLogoutAction();
    setIsAuthenticated(false);
    setPinInput('');
  };

  const handleStatusChange = async (merchantId: string, newStatus: 'active' | 'pending' | 'suspended') => {
    setIsMutatingId(merchantId);
    setActionMessage(null);
    try {
      const res = await updateMerchantStatusAction(merchantId, newStatus);
      if (res.success && res.merchant) {
        setMerchants((prev) =>
          prev.map((m) => (m.id === merchantId ? res.merchant! : m))
        );
        setActionMessage({ text: res.message, type: 'success' });
      } else {
        setActionMessage({ text: res.message, type: 'error' });
      }
    } catch (err: unknown) {
      setActionMessage({
        text: err instanceof Error ? err.message : 'स्टेटस बदलने में सर्वर त्रुटि',
        type: 'error',
      });
    } finally {
      setIsMutatingId(null);
    }
  };

  const handleQuotaIncrease = async (merchantId: string, additionalQuota: number) => {
    setIsMutatingId(merchantId);
    setActionMessage(null);
    try {
      const res = await updateMerchantQuotaAction(merchantId, additionalQuota);
      if (res.success && res.merchant) {
        setMerchants((prev) =>
          prev.map((m) => (m.id === merchantId ? res.merchant! : m))
        );
        setActionMessage({ text: res.message, type: 'success' });
      } else {
        setActionMessage({ text: res.message, type: 'error' });
      }
    } catch (err: unknown) {
      setActionMessage({
        text: err instanceof Error ? err.message : 'कोटा बढ़ाने में सर्वर त्रुटि',
        type: 'error',
      });
    } finally {
      setIsMutatingId(null);
    }
  };

  const handlePlanChange = async (merchantId: string, newPlan: 'starter' | 'growth' | 'enterprise') => {
    setIsMutatingId(merchantId);
    setActionMessage(null);
    try {
      const res = await updateMerchantPlanAction(merchantId, newPlan);
      if (res.success && res.merchant) {
        setMerchants((prev) =>
          prev.map((m) => (m.id === merchantId ? res.merchant! : m))
        );
        setActionMessage({ text: res.message, type: 'success' });
      } else {
        setActionMessage({ text: res.message, type: 'error' });
      }
    } catch (err: unknown) {
      setActionMessage({
        text: err instanceof Error ? err.message : 'प्लान बदलने में सर्वर त्रुटि',
        type: 'error',
      });
    } finally {
      setIsMutatingId(null);
    }
  };

  // Filtered merchants
  const filteredMerchants = merchants.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.slug.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Login Barrier View
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-indigo-600" />

          <div className="flex flex-col items-center text-center space-y-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">
                सुपर एडमिन कंट्रोल टॉवर
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                मल्टी-टेनेंट रिटेल ऑफर प्लेटफॉर्म नियंत्रण
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {pinError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl text-center">
                ⚠️ {pinError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                मास्टर सिक्योरिटी पिन दर्ज करें
              </label>
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-center text-xl tracking-widest font-mono text-white focus:outline-none focus:border-indigo-500"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn || !pinInput}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              {isLoggingIn ? 'सत्यापित हो रहा है...' : 'सुरक्षित लॉगिन करें'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              ← वापस मुख्य प्लेटफॉर्म पर जाएं
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const activeCount = merchants.filter((m) => m.status === 'active').length;
  const pendingCount = merchants.filter((m) => m.status === 'pending').length;
  const suspendedCount = merchants.filter((m) => m.status === 'suspended').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white shadow-md">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-white">
                  सुपर एडमिन कंट्रोल टॉवर
                </span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                  SaaS Master
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                मल्टी-टेनेंट रिटेल नेटवर्क • प्लेटफॉर्म मैनेजमेंट
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/store/nahata"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 bg-amber-950/60 border border-amber-600/40 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
              <span>फ्लैगशिप नाहाटा स्टोर</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-slate-700"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>लॉगआउट</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">कुल पंजीकृत दुकानें</span>
              <Store className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white mt-2">
              {merchants.length}
            </p>
            <div className="flex items-center gap-2 mt-2 text-[11px]">
              <span className="text-emerald-400 font-bold">{activeCount} सक्रिय</span>
              <span>•</span>
              <span className="text-amber-400 font-bold">{pendingCount} नए आवेदन</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">जनरेटेड कूपन</span>
              <Ticket className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white mt-2">
              {totalCouponsCount}
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              ग्राहकों द्वारा अनलॉक किए गए वाउचर्स
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">काउंटर रिडेम्पशन</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white mt-2">
              {redeemedCount}
            </p>
            <p className="text-[11px] text-emerald-400 mt-2 font-medium">
              सत्यापित वास्तविक बिक्री कन्वर्शन
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">कुल ग्राहक लीड्स</span>
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white mt-2">
              {totalCustomersCount}
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              100% WhatsApp वेरिफाइड फोन नंबर
            </p>
          </div>
        </div>

        {/* Tab Controls & Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('merchants')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'merchants'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              दुकानदार प्रबंधन ({merchants.length})
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'security'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              सुरक्षा & RLS सेटिंग्स
            </button>
          </div>

          {activeTab === 'merchants' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="दुकान, मालिक या शहर खोजें..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'pending' | 'suspended')}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="all">सभी स्थिति</option>
                <option value="active">सक्रिय (Active)</option>
                <option value="pending">प्रतीक्षा (Pending)</option>
                <option value="suspended">निलंबित (Suspended)</option>
              </select>
            </div>
          )}
        </div>

        {/* Action Feedback Banner */}
        {actionMessage && (
          <div
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${
              actionMessage.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{actionMessage.type === 'success' ? '✅' : '⚠️'}</span>
              <span>{actionMessage.text}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="text-slate-400 hover:text-white text-xs font-bold px-2 py-0.5 rounded"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab 1: Merchants Management */}
        {activeTab === 'merchants' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMerchants.map((merchant) => (
                <div
                  key={merchant.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-base">
                            {merchant.name}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {merchant.category}
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          merchant.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : merchant.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {merchant.status === 'active'
                          ? 'सक्रिय'
                          : merchant.status === 'pending'
                          ? 'समीक्षा में'
                          : 'निलंबित'}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <div className="flex justify-between">
                        <span className="text-slate-500">संचालक:</span>
                        <span className="font-semibold text-slate-200">{merchant.owner_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">स्थान:</span>
                        <span className="truncate max-w-[180px]">{merchant.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">फोन:</span>
                        <span className="font-mono">{merchant.phone}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                        <span className="text-slate-500">प्लान:</span>
                        <select
                          disabled={isMutatingId === merchant.id}
                          value={merchant.plan}
                          onChange={(e) => handlePlanChange(merchant.id, e.target.value as 'starter' | 'growth' | 'enterprise')}
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-[11px] text-amber-300 font-bold focus:outline-none disabled:opacity-50"
                        >
                          <option value="starter">Starter (1K)</option>
                          <option value="growth">Growth (5K)</option>
                          <option value="enterprise">Enterprise (Unlimited)</option>
                        </select>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-slate-500">कूपन कोटा:</span>
                        <div className="flex items-center gap-1.5 font-bold text-slate-200">
                          <span>{merchant.quota_coupons_total.toLocaleString('hi-IN')}</span>
                          <button
                            disabled={isMutatingId === merchant.id}
                            onClick={() => handleQuotaIncrease(merchant.id, 500)}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 underline disabled:opacity-50"
                          >
                            {isMutatingId === merchant.id ? 'अपडेट...' : '+500 जोड़ें'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <Link
                        href={`/store/${merchant.slug}`}
                        target="_blank"
                        className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-center font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 text-indigo-400" />
                        <span>ग्राहक पेज</span>
                      </Link>

                      <Link
                        href={`/admin?store=${merchant.slug}`}
                        className="py-1.5 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-center font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Store className="w-3 h-3" />
                        <span>एडमिन पैनल</span>
                      </Link>
                    </div>

                    {/* Status Toggle Buttons */}
                    <div className="flex items-center gap-1 pt-1">
                      {merchant.status !== 'active' && (
                        <button
                          disabled={isMutatingId === merchant.id}
                          onClick={() => handleStatusChange(merchant.id, 'active')}
                          className="flex-1 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          <Check className="w-3 h-3" />
                          <span>{isMutatingId === merchant.id ? 'प्रक्रिया में...' : 'मंजूर / सक्रिय करें'}</span>
                        </button>
                      )}

                      {merchant.status === 'active' && (
                        <button
                          disabled={isMutatingId === merchant.id}
                          onClick={() => handleStatusChange(merchant.id, 'suspended')}
                          className="flex-1 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-bold border border-rose-500/30 flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          <X className="w-3 h-3" />
                          <span>{isMutatingId === merchant.id ? 'प्रक्रिया में...' : 'स्थगित (Pause) करें'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredMerchants.length === 0 && (
              <div className="p-12 text-center text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800">
                कोई दुकानदार नहीं मिला।
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Security & RLS Settings */}
        {activeTab === 'security' && (
          <div className="space-y-6 max-w-3xl">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    सर्वर-साइड सुरक्षा और एंटी-चीट स्टेटस
                  </h3>
                  <p className="text-xs text-slate-400">
                    ग्राहक फ्रॉड रोकथाम और डेटा गोपनीयता
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <p className="font-bold text-white">HttpOnly Session Cookies</p>
                    <p className="text-slate-400 text-[11px]">एडमिन पिन कभी भी ब्राउज़र कंसोल या क्लाइंट बंडल में नहीं जाता।</p>
                  </div>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    सक्रिय (Active)
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <p className="font-bold text-white">Sliding-Window Rate Limiting</p>
                    <p className="text-slate-400 text-[11px]">अधिकतम 5 क्लेम प्रति मिनट प्रति आईपी/फोन नंबर।</p>
                  </div>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    5 req / 60s
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <p className="font-bold text-white">डुप्लीकेट क्लेम रोकथाम (One Phone = One Coupon)</p>
                    <p className="text-slate-400 text-[11px]">एक मोबाइल नंबर से एक ही दुकान में दोबारा लकी ड्रॉ नहीं खेला जा सकता।</p>
                  </div>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    लागू (Enforced)
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <p className="font-bold text-white">डेटाबेस माइग्रेशन & RLS Policies</p>
                    <p className="text-slate-400 text-[11px]">Supabase SQL माइग्रेशन `supabase/migrations/20260408000000_secure_campaign_schema.sql` में तैयार है।</p>
                  </div>
                  <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/30">
                    तैयार (Ready)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
