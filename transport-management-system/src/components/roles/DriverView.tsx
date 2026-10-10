'use client';

import React, { useState } from 'react';
import {
  Smartphone,
  Truck,
  MapPin,
  Camera,
  UploadCloud,
  CheckCircle,
  PlusCircle,
  Fuel,
  Receipt,
  FileCheck2,
} from 'lucide-react';
import { useDemoTMS } from '../../lib/demo-context';

export const DriverView: React.FC = () => {
  const { trips, openLRPrint } = useDemoTMS();
  const currentTrip = trips[0];

  const [tripStatus, setTripStatus] = useState<'IN_TRANSIT' | 'DELIVERED'>('IN_TRANSIT');
  const [podUploaded, setPodUploaded] = useState(false);
  const [dieselAmount, setDieselAmount] = useState('');
  const [dieselLiters, setDieselLiters] = useState('');
  const [expenseSaved, setExpenseSaved] = useState(false);

  const handleUploadPOD = () => {
    setPodUploaded(true);
    setTripStatus('DELIVERED');
  };

  const handleAddDiesel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dieselAmount) return;
    setExpenseSaved(true);
    setTimeout(() => {
      setExpenseSaved(false);
      setDieselAmount('');
      setDieselLiters('');
    }, 2000);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Mobile Driver Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 text-white text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 mb-2">
          <Smartphone className="w-3.5 h-3.5" />
          Mobile Driver Field App (Active Trip)
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight">
          Driver Task Sheet: Mukesh Yadav
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Vehicle: <strong className="text-white font-mono">{currentTrip?.vehicleNumber}</strong> | Advance Balance: <strong className="text-emerald-400">₹12,500</strong>
        </p>
      </div>

      {/* Active Trip Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">
            {currentTrip?.tripNumber}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              tripStatus === 'DELIVERED'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse'
            }`}
          >
            {tripStatus.replace('_', ' ')}
          </span>
        </div>

        {/* Route Points */}
        <div className="p-4 rounded-2xl bg-slate-850/60 border border-slate-800 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Origin Pickup</span>
              <span className="font-bold text-sm text-white">{currentTrip?.originCity} Hub</span>
              <p className="text-[11px] text-slate-400">Gupta Steel & Structural Pipes, VKIA Area</p>
            </div>
          </div>

          <div className="w-0.5 h-4 bg-slate-700 ml-4"></div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Destination Delivery</span>
              <span className="font-bold text-sm text-white">{currentTrip?.destinationCity}</span>
              <p className="text-[11px] text-slate-400">Reliance Retail Hub, Bhiwandi</p>
            </div>
          </div>
        </div>

        {/* Action 1: En-Route Diesel Slip Submission */}
        <div className="p-4 rounded-2xl bg-slate-850/40 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Fuel className="w-4 h-4" />
            <span>Submit En-Route Diesel Slip</span>
          </h4>

          <form onSubmit={handleAddDiesel} className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Diesel Amount (₹)</label>
              <input
                type="number"
                value={dieselAmount}
                onChange={(e) => setDieselAmount(e.target.value)}
                placeholder="e.g. 8500"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Volume (Liters)</label>
              <input
                type="number"
                value={dieselLiters}
                onChange={(e) => setDieselLiters(e.target.value)}
                placeholder="e.g. 95 L"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div className="col-span-2">
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-colors"
              >
                {expenseSaved ? '✓ Fuel Expense Logged!' : '+ Add Fuel Entry'}
              </button>
            </div>
          </form>
        </div>

        {/* Action 2: Camera POD Upload */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-850 to-slate-900 border border-cyan-500/30 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Digital Proof of Delivery (POD)</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Take photo of physical signed and stamped LR copy upon delivery handover.
            </p>
          </div>

          {podUploaded ? (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>POD Photo Uploaded & Verified by Destination!</span>
            </div>
          ) : (
            <button
              onClick={handleUploadPOD}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-900/30 transition-all hover:scale-[1.02]"
            >
              📷 Capture & Upload Signed POD
            </button>
          )}
        </div>

        {/* View Document */}
        {currentTrip?.assignedLRs[0] && (
          <div className="text-center">
            <button
              onClick={() => openLRPrint(currentTrip.assignedLRs[0])}
              className="text-xs text-slate-400 hover:text-white underline decoration-dotted"
            >
              View My Assigned Lorry Receipt (LR)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
