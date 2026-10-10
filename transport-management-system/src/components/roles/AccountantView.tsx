'use client';

import React from 'react';
import {
  ReceiptText,
  DollarSign,
  FileCheck,
  CreditCard,
  Building,
  CheckCircle,
  AlertCircle,
  TrendingDown,
  Layers,
} from 'lucide-react';
import { useDemoTMS } from '../../lib/demo-context';

export const AccountantView: React.FC = () => {
  const { invoices, drivers, lrs } = useDemoTMS();

  // Simulated settlement ledger
  const mockSettlements = [
    {
      driverName: 'Mukesh Yadav',
      tripNumber: 'TRIP-2026-041',
      grossAdvance: 15000,
      dieselApproved: 9200,
      tollFastag: 1800,
      loadingExpenses: 500,
      netRecoverable: 3500,
      status: 'Ready for Settlement',
    },
    {
      driverName: 'Rajesh Sharma',
      tripNumber: 'TRIP-2026-038',
      grossAdvance: 8000,
      dieselApproved: 6400,
      tollFastag: 1200,
      loadingExpenses: 800,
      netRecoverable: -400, // Payable to driver
      status: 'Payable ₹400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <ReceiptText className="w-3.5 h-3.5" />
              Accounting & Financial Settlements Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              GST Invoicing & Trip Expense Ledgers
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Audit driver advance balances against fuel slips, reconcile customer billings, and apply statutory TDS.
            </p>
          </div>
        </div>
      </div>

      {/* Driver Settlement Reconciliation Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-400" />
              <span>Driver Trip Advance Reconciliation</span>
            </h3>
            <p className="text-xs text-slate-400">
              Advance (-) vs Approved In-Trip Diesel & Toll Expenses (+) = Net Settlement.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-850 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Driver Name</th>
                <th className="p-3">Trip Ref</th>
                <th className="p-3">Gross Advance</th>
                <th className="p-3">Approved Diesel</th>
                <th className="p-3">Toll / Fastag</th>
                <th className="p-3">Loading</th>
                <th className="p-3">Settlement Balance</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {mockSettlements.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-850/50 transition-colors">
                  <td className="p-3 font-semibold text-white">{s.driverName}</td>
                  <td className="p-3 font-mono text-slate-400">{s.tripNumber}</td>
                  <td className="p-3 font-mono text-rose-400">₹{s.grossAdvance.toLocaleString('en-IN')}</td>
                  <td className="p-3 font-mono">₹{s.dieselApproved.toLocaleString('en-IN')}</td>
                  <td className="p-3 font-mono">₹{s.tollFastag.toLocaleString('en-IN')}</td>
                  <td className="p-3 font-mono">₹{s.loadingExpenses.toLocaleString('en-IN')}</td>
                  <td className="p-3 font-mono font-bold">
                    {s.netRecoverable >= 0 ? (
                      <span className="text-emerald-400">Recover ₹{s.netRecoverable.toLocaleString('en-IN')}</span>
                    ) : (
                      <span className="text-amber-400">Pay ₹{Math.abs(s.netRecoverable).toLocaleString('en-IN')}</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <button className="px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-[11px] font-semibold transition-all">
                      Approve Voucher
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer GST Invoices */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-400" />
              <span>Customer GST Invoices</span>
            </h3>
            <p className="text-xs text-slate-400">Automated invoices generated from delivered LR consignments.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-850 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Invoice Number</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Taxable Value</th>
                <th className="p-3">CGST + SGST (5%)</th>
                <th className="p-3">Grand Total</th>
                <th className="p-3">Paid Amount</th>
                <th className="p-3">Outstanding Balance</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="p-3 font-mono font-bold text-white">{inv.invoiceNumber}</td>
                  <td className="p-3 font-medium text-white">{inv.customerName}</td>
                  <td className="p-3 font-mono">₹{inv.subtotalAmount.toLocaleString('en-IN')}</td>
                  <td className="p-3 font-mono text-slate-400">₹{(inv.cgstAmount + inv.sgstAmount).toLocaleString('en-IN')}</td>
                  <td className="p-3 font-mono font-bold text-white">₹{inv.grandTotal.toLocaleString('en-IN')}</td>
                  <td className="p-3 font-mono text-emerald-400">₹{inv.paidAmount.toLocaleString('en-IN')}</td>
                  <td className="p-3 font-mono font-bold text-rose-400">₹{inv.balanceAmount.toLocaleString('en-IN')}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                      {inv.paymentStatus.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
