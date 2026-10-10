// TypeScript Domain Models for NextGen TMS (Milestone 3 Enhanced)
// Strict typing matching PostgreSQL schema (docs/DATABASE_SCHEMA.md)

export type UserRole = 'superadmin' | 'owner' | 'manager' | 'accountant' | 'driver' | 'vendor';

export type VehicleOwnership = 'owned' | 'attached' | 'market';
export type VehicleStatus = 'available' | 'in_transit' | 'maintenance' | 'out_of_service';
export type LRPaymentType = 'to_pay' | 'paid' | 'tbb';
export type LRStatus = 'draft' | 'generated' | 'dispatched' | 'delivered' | 'billed' | 'cancelled';
export type TripStatus = 'draft' | 'scheduled' | 'in_transit' | 'delivered' | 'closed' | 'cancelled';
export type ComplianceDocType = 'RC' | 'Insurance' | 'Fitness' | 'National_Permit' | 'PUC' | 'Road_Tax';
export type ComplianceStatus = 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  gstin?: string;
  pan?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  logoUrl?: string;
  subscriptionPlan: 'starter' | 'pro' | 'enterprise';
  isActive: boolean;
  createdAt: string;
}

export interface Branch {
  id: string;
  organizationId: string;
  name: string;
  branchCode: string;
  city: string;
  state: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  isHeadOffice: boolean;
}

export interface UserProfile {
  id: string;
  organizationId: string;
  branchId?: string;
  role: UserRole;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  isActive: boolean;
}

export interface ComplianceRecord {
  id: string;
  docType: ComplianceDocType;
  docNumber: string;
  validFrom: string;
  validUntil: string;
  daysRemaining: number;
  status: ComplianceStatus;
}

export interface VehicleMaintenanceLog {
  id: string;
  vehicleId: string;
  serviceDate: string;
  serviceType: string; // e.g. Engine Oil, Brake Overhaul, Tyre Replacement
  workshopName: string;
  cost: number;
  odometerKm: number;
  remarks?: string;
}

export interface Vehicle {
  id: string;
  organizationId: string;
  branchId?: string;
  vehicleNumber: string;
  vehicleType: string;
  ownershipType: VehicleOwnership;
  chassisNumber?: string;
  engineNumber?: string;
  carryingCapacityTon: number;
  status: VehicleStatus;
  odometerKm: number;
  assignedDriverId?: string;
  assignedDriverName?: string;
  complianceRecords: ComplianceRecord[];
  maintenanceLogs: VehicleMaintenanceLog[];
  rcExpiry?: string;
  fitnessExpiry?: string;
  insuranceExpiry?: string;
  permitExpiry?: string;
  pucExpiry?: string;
  createdAt: string;
}

export interface Driver {
  id: string;
  organizationId: string;
  fullName: string;
  phone: string;
  alternatePhone?: string;
  licenseNumber: string;
  licenseCategory: string; // e.g. HGMV, LMV, Trans
  licenseExpiryDate: string;
  licenseDaysRemaining: number;
  licenseStatus: ComplianceStatus;
  aadhaarMasked?: string; // e.g. 'XXXX-XXXX-8921'
  assignedVehicleId?: string;
  assignedVehicleNumber?: string;
  currentAdvanceBalance: number;
  monthlySalary: number;
  isActive: boolean;
  emergencyContact?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  organizationId: string;
  companyName: string;
  contactName?: string;
  email?: string;
  phone: string;
  gstin?: string;
  billingAddress: string;
  outstandingBalance: number;
}

export interface Vendor {
  id: string;
  organizationId: string;
  vendorName: string;
  vendorType: 'Fuel_Station' | 'Truck_Broker' | 'Maintenance_Workshop' | 'Tyre_Vendor';
  contactPerson?: string;
  phone: string;
  gstin?: string;
  tdsRatePercent: number;
  outstandingPayable: number;
}

export interface LRConsignmentNote {
  id: string;
  organizationId: string;
  branchId: string;
  lrNumber: string;
  lrDate: string;
  consignorName: string;
  consignorAddress: string;
  consignorGstin?: string;
  consigneeName: string;
  consigneeAddress: string;
  consigneeGstin?: string;
  originCity: string;
  destinationCity: string;
  ewayBillNumber?: string;
  ewayBillValidUntil?: string;
  goodsDescription: string;
  packagesCount: number;
  packageType: string;
  actualWeightTon: number;
  chargedWeightTon: number;
  freightRatePerTon: number;
  totalFreightAmount: number;
  loadingCharges: number;
  unloadingCharges: number;
  insuranceCharges: number;
  netTotalAmount: number;
  paymentType: LRPaymentType;
  status: LRStatus;
  vehicleId?: string;
  vehicleNumber?: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  createdAt: string;
}

export interface TripTimelineEvent {
  id: string;
  tripId: string;
  status: TripStatus;
  eventTitle: string;
  description: string;
  timestamp: string;
  location?: string;
  recordedBy: string;
}

export interface ProofOfDelivery {
  id: string;
  lrId: string;
  tripId: string;
  deliveredAt: string;
  podImageUrl: string;
  receivedByName: string;
  receivedByPhone?: string;
  shortageQuantity: number;
  damageRemarks?: string;
  status: 'pending_verification' | 'verified' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface Trip {
  id: string;
  organizationId: string;
  branchId?: string;
  tripNumber: string;
  vehicleId: string;
  vehicleNumber: string;
  driverId: string;
  driverName: string;
  driverPhone?: string;
  originCity: string;
  destinationCity: string;
  status: TripStatus;
  plannedDepartureDate?: string;
  expectedArrivalDate?: string;
  totalFreightRevenue: number;
  totalTripExpenses: number;
  netProfitLoss: number;
  assignedLRs: LRConsignmentNote[];
  startOdometerKm?: number;
  endOdometerKm?: number;
  timelineEvents: TripTimelineEvent[];
  podRecord?: ProofOfDelivery;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  createdAt: string;
}

export interface TripExpense {
  id: string;
  tripId: string;
  expenseCategory: 'Fuel' | 'Toll_FASTag' | 'Loading' | 'Repair' | 'Driver_Allowance';
  amount: number;
  paidBy: 'Driver_Advance' | 'Company_Bank' | 'Fuel_Card';
  slipNumber?: string;
  receiptImageUrl?: string;
  isApproved: boolean;
}

export interface DriverAdvance {
  id: string;
  driverId: string;
  tripId?: string;
  amount: number;
  paymentMode: 'Cash' | 'Bank_Transfer' | 'UPI' | 'Fuel_Card';
  transactionRef?: string;
  disbursedAt: string;
  isSettled: boolean;
}

export interface CustomerInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  customerId: string;
  customerName: string;
  subtotalAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  grandTotal: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: 'unpaid' | 'partially_paid' | 'paid';
  dueDate: string;
  includedLRs: string[];
}
