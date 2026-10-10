'use client';

import React from 'react';
import {
  Truck,
  Building2,
  Users,
  FileSpreadsheet,
  PlusCircle,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useDemoTMS } from '../../lib/demo-context';
import { UserRole } from '../../types/tms';

interface NavbarProps {
  onOpenBookingModal: () => void;
  onOpenRoleSwitcher: () => void;
}

const ROLE_LABELS: Record<UserRole, { label: string; color: string }> = {
  superadmin: { label: 'Super Admin', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  owner: { label: 'Fleet Owner', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  manager: { label: 'Dispatch Manager', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  accountant: { label: 'Accountant', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  driver: { label: 'Driver (Mobile)', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  vendor: { label: 'Vendor / Broker', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
};

export const Navbar: React.FC<NavbarProps> = ({ onOpenBookingModal, onOpenRoleSwitcher }) => {
  const { organization, activeRole } = useDemoTMS();
  const currentRoleInfo = ROLE_LABELS[activeRole] || { label: activeRole, color: 'bg-slate-700 text-slate-200' };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center shadow-lg shadow-red-600/20 text-white">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                TMS PRO
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                v2.0
              </span>
            </div>
            <div className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-[280px]">
              {organization.name}
            </div>
          </div>
        </div>

        {/* Center Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Create LR */}
          {(activeRole === 'manager' || activeRole === 'owner' || activeRole === 'superadmin') && (
            <button
              onClick={onOpenBookingModal}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-md shadow-red-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">New LR / Bilty</span>
              <span className="sm:hidden">+ LR</span>
            </button>
          )}

          {/* Role Switcher Trigger Button */}
          <button
            onClick={onOpenRoleSwitcher}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all hover:bg-slate-800 ${currentRoleInfo.color}`}
            title="Click to switch simulated role persona"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Role:</span>
            <span>{currentRoleInfo.label}</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>
        </div>
      </div>
    </header>
  );
};
