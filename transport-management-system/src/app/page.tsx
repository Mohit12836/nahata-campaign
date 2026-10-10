'use client';

import React, { useState } from 'react';
import { useDemoTMS } from '../lib/demo-context';
import { DemoModeBanner } from '../components/layout/DemoModeBanner';
import { Navbar } from '../components/layout/Navbar';
import { RoleSwitcher } from '../components/roles/RoleSwitcher';
import { SuperAdminView } from '../components/roles/SuperAdminView';
import { OwnerView } from '../components/roles/OwnerView';
import { ManagerView } from '../components/roles/ManagerView';
import { AccountantView } from '../components/roles/AccountantView';
import { DriverView } from '../components/roles/DriverView';
import { VendorView } from '../components/roles/VendorView';
import { LRBookingForm } from '../components/lr/LRBookingForm';
import { ThreeCopyLRPrint } from '../components/lr/ThreeCopyLRPrint';

export default function TMSDashboardPage() {
  const { activeRole, activeLRForPrint, closeLRPrint } = useDemoTMS();
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Demo Banner */}
      <DemoModeBanner />

      {/* Navbar */}
      <Navbar
        onOpenBookingModal={() => setIsBookingModalOpen(true)}
        onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeRole === 'superadmin' && <SuperAdminView />}
        {activeRole === 'owner' && <OwnerView onOpenLR={() => setIsBookingModalOpen(true)} />}
        {activeRole === 'manager' && <ManagerView onOpenLR={() => setIsBookingModalOpen(true)} />}
        {activeRole === 'accountant' && <AccountantView />}
        {activeRole === 'driver' && <DriverView />}
        {activeRole === 'vendor' && <VendorView />}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 NextGen Transport Management System (TMS Pro). All rights reserved.</p>
          <p className="text-slate-400">
            Inspired by verified Indian logistics workflows • Multi-tenant RLS Architecture
          </p>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <RoleSwitcher
        isOpen={isRoleSwitcherOpen}
        onClose={() => setIsRoleSwitcherOpen(false)}
      />

      <LRBookingForm
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />

      <ThreeCopyLRPrint
        lr={activeLRForPrint}
        onClose={closeLRPrint}
      />
    </div>
  );
}
