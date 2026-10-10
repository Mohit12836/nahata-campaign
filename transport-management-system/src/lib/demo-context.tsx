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
  ProofOfDelivery,
  TripStatus,
  TripTimelineEvent,
  VehicleMaintenanceLog,
} from '../types/tms';
import {
  DEMO_ORGANIZATION,
  DEMO_VEHICLES,
  DEMO_DRIVERS,
  DEMO_LRS,
  DEMO_TRIPS,
  DEMO_INVOICES,
  DEMO_PODS,
} from './mock-tms-data';
import {
  validateVehicleInput,
  validateDriverInput,
  isVehicleAvailableForTrip,
  isDriverAvailableForTrip,
  validateTripTransition,
  validatePODSubmissionInput,
  validatePODDecision,
  calculateComplianceStatus,
} from './dispatch-engine';

interface DemoContextType {
  isDemoMode: boolean;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  organization: Organization;
  vehicles: Vehicle[];
  drivers: Driver[];
  lrs: LRConsignmentNote[];
  trips: Trip[];
  pods: ProofOfDelivery[];
  invoices: CustomerInvoice[];

  // Modal target selections
  activeLRForPrint: LRConsignmentNote | null;
  selectedVehicleForModal: Vehicle | null;
  selectedDriverForModal: Driver | null;
  selectedTripForModal: Trip | null;

  // Modals & Navigation triggers
  openLRPrint: (lr: LRConsignmentNote) => void;
  closeLRPrint: () => void;
  openVehicleDetails: (v: Vehicle) => void;
  closeVehicleDetails: () => void;
  openDriverDetails: (d: Driver) => void;
  closeDriverDetails: () => void;
  openTripDetails: (t: Trip) => void;
  closeTripDetails: () => void;

  // Core Actions & State Mutators
  createNewLR: (newLR: Omit<LRConsignmentNote, 'id' | 'createdAt'>) => LRConsignmentNote;
  registerVehicle: (v: Omit<Vehicle, 'id' | 'complianceRecords' | 'maintenanceLogs' | 'createdAt'>) => { success: boolean; vehicle?: Vehicle; error?: string };
  registerDriver: (d: Omit<Driver, 'id' | 'licenseDaysRemaining' | 'licenseStatus' | 'createdAt'>) => { success: boolean; driver?: Driver; error?: string };
  createAndScheduleTrip: (input: {
    vehicleId: string;
    driverId: string;
    originCity: string;
    destinationCity: string;
    assignedLRIds: string[];
    plannedDepartureDate?: string;
    expectedArrivalDate?: string;
    startOdometerKm?: number;
  }) => { success: boolean; trip?: Trip; error?: string };
  advanceTripStatus: (tripId: string, targetStatus: TripStatus, options?: { odometerKm?: number; location?: string; note?: string }) => { success: boolean; error?: string };
  cancelTrip: (tripId: string, reason: string) => { success: boolean; error?: string };
  submitPOD: (tripId: string, lrId: string, input: { receiverName: string; receiverPhone?: string; shortageQuantity: number; damageRemarks?: string; podImageUrl: string }) => { success: boolean; pod?: ProofOfDelivery; error?: string };
  reviewPODDecision: (podId: string, decision: 'verify' | 'reject', rejectionReason?: string) => { success: boolean; error?: string };
  resetToDefaultDemo: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);
const LOCAL_STORAGE_KEY = 'nextgen_tms_demo_state_v2';

export const DemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRoleState] = useState<UserRole>('owner');
  const [vehicles, setVehicles] = useState<Vehicle[]>(DEMO_VEHICLES);
  const [drivers, setDrivers] = useState<Driver[]>(DEMO_DRIVERS);
  const [lrs, setLrs] = useState<LRConsignmentNote[]>(DEMO_LRS);
  const [trips, setTrips] = useState<Trip[]>(DEMO_TRIPS);
  const [pods, setPods] = useState<ProofOfDelivery[]>(DEMO_PODS);
  const [invoices] = useState<CustomerInvoice[]>(DEMO_INVOICES);

  // Modal active states
  const [activeLRForPrint, setActiveLRForPrint] = useState<LRConsignmentNote | null>(null);
  const [selectedVehicleForModal, setSelectedVehicleForModal] = useState<Vehicle | null>(null);
  const [selectedDriverForModal, setSelectedDriverForModal] = useState<Driver | null>(null);
  const [selectedTripForModal, setSelectedTripForModal] = useState<Trip | null>(null);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.vehicles) setVehicles(parsed.vehicles);
        if (parsed.drivers) setDrivers(parsed.drivers);
        if (parsed.lrs) setLrs(parsed.lrs);
        if (parsed.trips) setTrips(parsed.trips);
        if (parsed.pods) setPods(parsed.pods);
        if (parsed.activeRole) setActiveRoleState(parsed.activeRole);
      }
    } catch {}
  }, []);

  // Save helper
  const persistState = (newVehicles = vehicles, newDrivers = drivers, newLrs = lrs, newTrips = trips, newPods = pods, newRole = activeRole) => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          vehicles: newVehicles,
          drivers: newDrivers,
          lrs: newLrs,
          trips: newTrips,
          pods: newPods,
          activeRole: newRole,
        })
      );
    } catch {}
  };

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    persistState(vehicles, drivers, lrs, trips, pods, role);
  };

  // 1. LR Creation
  const createNewLR = (newLRData: Omit<LRConsignmentNote, 'id' | 'createdAt'>): LRConsignmentNote => {
    const created: LRConsignmentNote = {
      ...newLRData,
      id: `lr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [created, ...lrs];
    setLrs(updated);
    persistState(vehicles, drivers, updated, trips, pods);
    return created;
  };

  // 2. Register Vehicle
  const registerVehicle = (input: Omit<Vehicle, 'id' | 'complianceRecords' | 'maintenanceLogs' | 'createdAt'>) => {
    const validation = validateVehicleInput(input, vehicles);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      return { success: false, error: firstError };
    }

    const newVehicle: Vehicle = {
      ...input,
      id: `veh-${Date.now()}`,
      complianceRecords: [
        {
          id: `comp-${Date.now()}-1`,
          docType: 'Insurance',
          docNumber: `POL-${Math.floor(100000 + Math.random() * 900000)}`,
          validFrom: new Date().toISOString().split('T')[0],
          validUntil: input.insuranceExpiry || '2027-10-10',
          daysRemaining: calculateComplianceStatus(input.insuranceExpiry || '2027-10-10').daysRemaining,
          status: calculateComplianceStatus(input.insuranceExpiry || '2027-10-10').status,
        },
      ],
      maintenanceLogs: [],
      createdAt: new Date().toISOString(),
    };

    const updated = [newVehicle, ...vehicles];
    setVehicles(updated);
    persistState(updated, drivers, lrs, trips, pods);
    return { success: true, vehicle: newVehicle };
  };

  // 3. Register Driver
  const registerDriver = (input: Omit<Driver, 'id' | 'licenseDaysRemaining' | 'licenseStatus' | 'createdAt'>) => {
    const validation = validateDriverInput(input, drivers);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      return { success: false, error: firstError };
    }

    const { daysRemaining, status } = calculateComplianceStatus(input.licenseExpiryDate);
    const newDriver: Driver = {
      ...input,
      id: `drv-${Date.now()}`,
      licenseDaysRemaining: daysRemaining,
      licenseStatus: status,
      createdAt: new Date().toISOString(),
    };

    const updated = [newDriver, ...drivers];
    setDrivers(updated);
    persistState(vehicles, updated, lrs, trips, pods);
    return { success: true, driver: newDriver };
  };

  // 4. Create and Schedule Trip with Conflict Validation
  const createAndScheduleTrip = (input: {
    vehicleId: string;
    driverId: string;
    originCity: string;
    destinationCity: string;
    assignedLRIds: string[];
    plannedDepartureDate?: string;
    expectedArrivalDate?: string;
    startOdometerKm?: number;
  }) => {
    const vehicle = vehicles.find((v) => v.id === input.vehicleId);
    if (!vehicle) return { success: false, error: 'Selected vehicle not found.' };

    const driver = drivers.find((d) => d.id === input.driverId);
    if (!driver) return { success: false, error: 'Selected driver not found.' };

    // Run Conflict Checks
    const vehCheck = isVehicleAvailableForTrip(vehicle, trips);
    if (!vehCheck.isAvailable) return { success: false, error: vehCheck.conflictReason };

    const drvCheck = isDriverAvailableForTrip(driver, trips);
    if (!drvCheck.isAvailable) return { success: false, error: drvCheck.conflictReason };

    const assignedLRRecords = lrs.filter((l) => input.assignedLRIds.includes(l.id));
    if (assignedLRRecords.length === 0) {
      return { success: false, error: 'At least one consignment note (LR) must be linked to schedule a trip.' };
    }

    const totalRevenue = assignedLRRecords.reduce((acc, curr) => acc + curr.netTotalAmount, 0);

    const tripId = `trip-${Date.now()}`;
    const newTrip: Trip = {
      id: tripId,
      organizationId: 'org-demo-001',
      tripNumber: `TRIP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      vehicleId: vehicle.id,
      vehicleNumber: vehicle.vehicleNumber,
      driverId: driver.id,
      driverName: driver.fullName,
      driverPhone: driver.phone,
      originCity: input.originCity,
      destinationCity: input.destinationCity,
      status: 'scheduled',
      plannedDepartureDate: input.plannedDepartureDate || new Date().toISOString().split('T')[0],
      expectedArrivalDate: input.expectedArrivalDate,
      totalFreightRevenue: totalRevenue,
      totalTripExpenses: 0,
      netProfitLoss: totalRevenue,
      assignedLRs: assignedLRRecords,
      startOdometerKm: input.startOdometerKm || vehicle.odometerKm,
      timelineEvents: [
        {
          id: `evt-${Date.now()}`,
          tripId,
          status: 'scheduled',
          eventTitle: 'Trip Scheduled & Truck Assigned',
          description: `Allocated vehicle ${vehicle.vehicleNumber} and driver ${driver.fullName}.`,
          timestamp: new Date().toISOString(),
          location: input.originCity,
          recordedBy: 'Dispatch Manager',
        },
      ],
      createdAt: new Date().toISOString(),
    };

    // Update vehicle & driver status
    const updatedVehicles = vehicles.map((v) =>
      v.id === vehicle.id ? { ...v, status: 'in_transit' as const, assignedDriverName: driver.fullName } : v
    );
    const updatedTrips = [newTrip, ...trips];

    setVehicles(updatedVehicles);
    setTrips(updatedTrips);
    persistState(updatedVehicles, drivers, lrs, updatedTrips, pods);
    return { success: true, trip: newTrip };
  };

  // 5. Advance Trip Status State Machine
  const advanceTripStatus = (
    tripId: string,
    targetStatus: TripStatus,
    options?: { odometerKm?: number; location?: string; note?: string }
  ) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return { success: false, error: 'Trip not found.' };

    const transition = validateTripTransition(trip.status, targetStatus, {
      hasAssignedVehicle: Boolean(trip.vehicleId),
      hasAssignedDriver: Boolean(trip.driverId),
      hasAssignedLRs: trip.assignedLRs.length > 0,
      hasStartOdometer: Boolean(trip.startOdometerKm),
      hasEndOdometer: Boolean(options?.odometerKm || trip.endOdometerKm),
      hasVerifiedPOD: trip.podRecord?.status === 'verified',
    });

    if (!transition.allowed) {
      const msg = transition.errors[0]?.message || 'Invalid state transition';
      return { success: false, error: msg };
    }

    const newEvent: TripTimelineEvent = {
      id: `evt-${Date.now()}`,
      tripId,
      status: targetStatus,
      eventTitle: `Trip status advanced to ${targetStatus.toUpperCase()}`,
      description: options?.note || `Milestone reached at ${options?.location || trip.destinationCity}.`,
      timestamp: new Date().toISOString(),
      location: options?.location,
      recordedBy: activeRole.toUpperCase(),
    };

    const updatedTrips = trips.map((t) => {
      if (t.id !== tripId) return t;
      return {
        ...t,
        status: targetStatus,
        endOdometerKm: options?.odometerKm || t.endOdometerKm,
        timelineEvents: [newEvent, ...t.timelineEvents],
      };
    });

    // If trip completed or closed, release vehicle back to 'available'
    let updatedVehicles = vehicles;
    if (targetStatus === 'closed' || targetStatus === 'delivered') {
      updatedVehicles = vehicles.map((v) =>
        v.id === trip.vehicleId ? { ...v, status: 'available' as const } : v
      );
      setVehicles(updatedVehicles);
    }

    setTrips(updatedTrips);
    persistState(updatedVehicles, drivers, lrs, updatedTrips, pods);
    return { success: true };
  };

  // 6. Cancel Trip Workflow
  const cancelTrip = (tripId: string, reason: string) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return { success: false, error: 'Trip not found.' };

    const transition = validateTripTransition(trip.status, 'cancelled', { cancellationReason: reason });
    if (!transition.allowed) {
      return { success: false, error: transition.errors[0]?.message || 'Cannot cancel trip.' };
    }

    const cancelEvent: TripTimelineEvent = {
      id: `evt-${Date.now()}`,
      tripId,
      status: 'cancelled',
      eventTitle: 'Trip Cancelled',
      description: `Audit Reason: ${reason}`,
      timestamp: new Date().toISOString(),
      recordedBy: activeRole.toUpperCase(),
    };

    const updatedTrips = trips.map((t) => {
      if (t.id !== tripId) return t;
      return {
        ...t,
        status: 'cancelled' as const,
        cancellationReason: reason,
        cancelledBy: activeRole,
        cancelledAt: new Date().toISOString(),
        timelineEvents: [cancelEvent, ...t.timelineEvents],
      };
    });

    // Release vehicle
    const updatedVehicles = vehicles.map((v) =>
      v.id === trip.vehicleId ? { ...v, status: 'available' as const } : v
    );

    setVehicles(updatedVehicles);
    setTrips(updatedTrips);
    persistState(updatedVehicles, drivers, lrs, updatedTrips, pods);
    return { success: true };
  };

  // 7. Submit Proof of Delivery (POD)
  const submitPOD = (
    tripId: string,
    lrId: string,
    input: {
      receiverName: string;
      receiverPhone?: string;
      shortageQuantity: number;
      damageRemarks?: string;
      podImageUrl: string;
    }
  ) => {
    const validation = validatePODSubmissionInput({
      receiverName: input.receiverName,
      deliveredAt: new Date().toISOString(),
      podImageUrl: input.podImageUrl,
      shortageQuantity: input.shortageQuantity,
    });

    if (!validation.isValid) {
      return { success: false, error: Object.values(validation.errors)[0] };
    }

    const podId = `pod-${Date.now()}`;
    const newPOD: ProofOfDelivery = {
      id: podId,
      tripId,
      lrId,
      deliveredAt: new Date().toISOString(),
      podImageUrl: input.podImageUrl,
      receivedByName: input.receiverName,
      receivedByPhone: input.receiverPhone,
      shortageQuantity: input.shortageQuantity,
      damageRemarks: input.damageRemarks,
      status: 'pending_verification',
      createdAt: new Date().toISOString(),
    };

    const updatedPods = [newPOD, ...pods];
    setPods(updatedPods);

    // Update trip with POD and advance to 'delivered'
    const updatedTrips = trips.map((t) => {
      if (t.id !== tripId) return t;
      return {
        ...t,
        status: 'delivered' as const,
        podRecord: newPOD,
        timelineEvents: [
          {
            id: `evt-${Date.now()}`,
            tripId,
            status: 'delivered' as const,
            eventTitle: 'Proof of Delivery (POD) Uploaded',
            description: `Delivered to ${input.receiverName}. Shortage: ${input.shortageQuantity} pkgs.`,
            timestamp: new Date().toISOString(),
            recordedBy: 'Driver',
          },
          ...t.timelineEvents,
        ],
      };
    });

    setTrips(updatedTrips);
    persistState(vehicles, drivers, lrs, updatedTrips, updatedPods);
    return { success: true, pod: newPOD };
  };

  // 8. Review POD Decision (Approve / Reject)
  const reviewPODDecision = (podId: string, decision: 'verify' | 'reject', rejectionReason?: string) => {
    const pod = pods.find((p) => p.id === podId);
    if (!pod) return { success: false, error: 'POD record not found.' };

    const check = validatePODDecision(decision, rejectionReason);
    if (!check.isValid) {
      return { success: false, error: check.error };
    }

    const newStatus = decision === 'verify' ? ('verified' as const) : ('rejected' as const);

    const updatedPods = pods.map((p) => {
      if (p.id !== podId) return p;
      return {
        ...p,
        status: newStatus,
        verifiedBy: `${activeRole.toUpperCase()} (Manager/Accountant)`,
        verifiedAt: new Date().toISOString(),
        rejectionReason: decision === 'reject' ? rejectionReason : undefined,
      };
    });

    // Sync trip POD record
    const updatedTrips = trips.map((t) => {
      if (t.id !== pod.tripId) return t;
      const updatedPodRecord = updatedPods.find((p) => p.id === podId);
      return {
        ...t,
        podRecord: updatedPodRecord,
      };
    });

    setPods(updatedPods);
    setTrips(updatedTrips);
    persistState(vehicles, drivers, lrs, updatedTrips, updatedPods);
    return { success: true };
  };

  // Modal helpers
  const openLRPrint = (lr: LRConsignmentNote) => setActiveLRForPrint(lr);
  const closeLRPrint = () => setActiveLRForPrint(null);
  const openVehicleDetails = (v: Vehicle) => setSelectedVehicleForModal(v);
  const closeVehicleDetails = () => setSelectedVehicleForModal(null);
  const openDriverDetails = (d: Driver) => setSelectedDriverForModal(d);
  const closeDriverDetails = () => setSelectedDriverForModal(null);
  const openTripDetails = (t: Trip) => setSelectedTripForModal(t);
  const closeTripDetails = () => setSelectedTripForModal(null);

  const resetToDefaultDemo = () => {
    setVehicles(DEMO_VEHICLES);
    setDrivers(DEMO_DRIVERS);
    setLrs(DEMO_LRS);
    setTrips(DEMO_TRIPS);
    setPods(DEMO_PODS);
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
        pods,
        invoices,
        activeLRForPrint,
        selectedVehicleForModal,
        selectedDriverForModal,
        selectedTripForModal,
        openLRPrint,
        closeLRPrint,
        openVehicleDetails,
        closeVehicleDetails,
        openDriverDetails,
        closeDriverDetails,
        openTripDetails,
        closeTripDetails,
        createNewLR,
        registerVehicle,
        registerDriver,
        createAndScheduleTrip,
        advanceTripStatus,
        cancelTrip,
        submitPOD,
        reviewPODDecision,
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
