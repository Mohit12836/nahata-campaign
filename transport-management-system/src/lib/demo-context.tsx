'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserRole,
  LRConsignmentNote,
  Vehicle,
  Driver,
  Trip,
  CustomerInvoice,
  Organization,
} from '../types/tms';
import {
  DEMO_ORGANIZATION,
  DEMO_VEHICLES,
  DEMO_DRIVERS,
  DEMO_LRS,
  DEMO_TRIPS,
  DEMO_INVOICES,
} from './mock-tms-data';

interface DemoContextType {
  isDemoMode: boolean;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  organization: Organization;
  vehicles: Vehicle[];
  drivers: Driver[];
  lrs: LRConsignmentNote[];
  trips: Trip[];
  invoices: CustomerInvoice[];
  activeLRForPrint: LRConsignmentNote | null;
  openLRPrint: (lr: LRConsignmentNote) => void;
  closeLRPrint: () => void;
  createNewLR: (newLR: Omit<LRConsignmentNote, 'id' | 'createdAt'>) => LRConsignmentNote;
  resetToDefaultDemo: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'nextgen_tms_demo_state_v1';

export const DemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRoleState] = useState<UserRole>('owner');
  const [lrs, setLrs] = useState<LRConsignmentNote[]>(DEMO_LRS);
  const [vehicles] = useState<Vehicle[]>(DEMO_VEHICLES);
  const [drivers] = useState<Driver[]>(DEMO_DRIVERS);
  const [trips] = useState<Trip[]>(DEMO_TRIPS);
  const [invoices] = useState<CustomerInvoice[]>(DEMO_INVOICES);
  const [activeLRForPrint, setActiveLRForPrint] = useState<LRConsignmentNote | null>(null);

  // Load persisted demo LR state if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lrs && Array.isArray(parsed.lrs)) {
          setLrs(parsed.lrs);
        }
        if (parsed.activeRole) {
          setActiveRoleState(parsed.activeRole);
        }
      }
    } catch {
      // LocalStorage fallback for private modes
    }
  }, []);

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ ...existing, activeRole: role }));
    } catch {}
  };

  const createNewLR = (newLRData: Omit<LRConsignmentNote, 'id' | 'createdAt'>): LRConsignmentNote => {
    const created: LRConsignmentNote = {
      ...newLRData,
      id: `lr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [created, ...lrs];
    setLrs(updated);
    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ ...existing, lrs: updated }));
    } catch {}

    return created;
  };

  const openLRPrint = (lr: LRConsignmentNote) => {
    setActiveLRForPrint(lr);
  };

  const closeLRPrint = () => {
    setActiveLRForPrint(null);
  };

  const resetToDefaultDemo = () => {
    setLrs(DEMO_LRS);
    setActiveRoleState('owner');
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {}
  };

  return (
    <DemoContext.Provider
      value={{
        isDemoMode: true,
        activeRole,
        setActiveRole,
        organization: DEMO_ORGANIZATION,
        vehicles,
        drivers,
        lrs,
        trips,
        invoices,
        activeLRForPrint,
        openLRPrint,
        closeLRPrint,
        createNewLR,
        resetToDefaultDemo,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemoTMS = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoTMS must be used within a DemoProvider');
  }
  return context;
};
