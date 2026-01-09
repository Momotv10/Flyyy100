
/**
 * Global Type Definitions for STAMS Enterprise
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
  AGENT = 'AGENT',
  SUPPLIER = 'SUPPLIER',
  STAFF = 'STAFF',
  PROVIDER = 'PROVIDER'
}

export enum BookingStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  ISSUED = 'ISSUED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum AccountType {
  ASSET = 'asset',
  LIABILITY = 'liability',
  REVENUE = 'revenue',
  EXPENSE = 'expense',
  EQUITY = 'equity'
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  phone?: string;
  email?: string;
  balance: number;
  createdAt: string;
}

export interface Airline {
  id: string;
  name: string;
  iata: string;
  logo: string;
  country: string;
  isActive: boolean;
  systemCommission: number;
  issueStaff: AirlineStaff[];
}

export interface AirlineStaff {
  id: string;
  name: string;
  phone: string;
}

export interface Flight {
  id: string;
  flightNumber: string;
  airlineId: string;
  providerId: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTerminal: string;
  arrivalTerminal: string;
  aircraftType: string;
  departureTime: string;
  arrivalTime: string;
  departureTimeFormatted: string;
  arrivalTimeFormatted: string;
  durationMinutes: number;
  timeZoneOffset: number;
  departureDate: string;
  arrivalDate: string;
  prices: {
    cost: number;
    selling: number;
    agentCommission: number;
    systemTax: number;
    systemNetProfit: number;
  };
  seats: {
    economy: number;
    business: number;
    first: number;
  };
  isRoundTrip: boolean;
  returnDateOptions?: ReturnDateOption[];
  visaLabel?: string;
  visaPrice?: number;
  visaRequiredNationalities?: string[];
  status: 'active' | 'inactive';
  createdAt: string;
  additionalConditions?: string;
  // For UI form management
  classes?: {
    economy: FlightClassInfo;
    business: FlightClassInfo;
    first: FlightClassInfo;
  };
  validFrom?: string;
  validTo?: string;
}

export interface FlightClassInfo {
  seats: number;
  costPrice: number;
  agentCommission: number;
  systemCommission: number;
  sellingPrice: number;
}

export interface ReturnDateOption {
  id: string;
  date: string;
  priceModifier: number;
}

export interface Booking {
  id: string;
  bookingRef: string;
  flightId: string;
  customerId: string;
  passengerName: string;
  passportNumber: string;
  passportNationality: string;
  passportExpiry: string;
  passportBirthDate?: string;
  passportImage?: string;
  customerPhone: string;
  status: 'pending' | 'awaiting_issue' | 'ready' | 'rejected' | 'cancelled';
  totalAmount: number;
  paymentConfirmed: boolean;
  paymentMethod: string;
  createdAt: string;
  issuedAt?: string;
  pnr?: string;
  ticketNumber?: string;
  ticketFileUrl?: string;
  flightSnapshot: {
    flightNumber: string;
    departure: string;
    arrival: string;
    departureTime: string;
    airlineName?: string;
    airlineLogo?: string;
    departureTimeFormatted?: string;
    arrivalTimeFormatted?: string;
  };
  financialsSnapshot: {
    costPrice: number;
    agentCommission: number;
    systemNetProfit: number;
    totalAmount: number;
  };
}

export interface Account {
  id: string;
  name: string;
  type: 'asset' | 'liability' | 'revenue' | 'expense' | 'equity';
  category: 'current' | 'fixed' | 'operating';
  balance: number;
  parentId?: string;
  isSystem: boolean;
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  reference?: string;
  lines: JournalLine[];
  createdBy: string;
}

export interface JournalLine {
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface AgentProfile {
  userId: string;
  companyName: string;
  agentType: 'company' | 'individual';
  idNumber: string;
  address: string;
  responsiblePerson: string;
  documents: AgentDocument[];
  apiEnabled: boolean;
  apiKey?: string;
  commissionRate: number;
}

export interface AgentDocument {
  id: string;
  type: 'id_card' | 'contract' | string;
  title: string;
  fileUrl: string;
  uploadedAt: string;
}

export type ProviderType = 'airline_company' | 'travel_agency' | 'group_agent';
export type SettlementPeriod = 'weekly' | 'bi_weekly' | 'monthly';

export interface Provider {
  id: string;
  userId: string;
  name: string;
  type: ProviderType;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  country: string;
  authorizedAirlines: AuthorizedAirline[];
  financials: ProviderFinancials;
  isActive: boolean;
  createdAt: string;
}

export interface AuthorizedAirline {
  airlineId: string;
  airlineName: string;
  systemCommission: number;
  validFrom: string;
  validTo: string;
}

export interface ProviderFinancials {
  paymentMethod: 'bank_transfer' | 'digital_wallet';
  settlementPeriod: SettlementPeriod;
  minPaymentAmount: number;
  accountNumber?: string;
  walletNumber?: string;
}

export interface UserProfile {
  userId: string;
  savedPassports: SavedPassenger[];
  birthDate?: string;
  nationality?: string;
}

export interface SavedPassenger {
  id: string;
  fullName: string;
  relationship: string;
  passportNumber: string;
  expiryDate: string;
}

export interface PaymentGatewayConfig {
  id: string;
  name: string;
  logo: string;
  isActive: boolean;
}

export interface SubCustomer {
  id: string;
  agentId: string;
  name: string;
  phone: string;
}

// Reports
export interface DailyReport {
  date: string;
  totalSales: number;
  bookingsCount: number;
  avgBookingValue: number;
  accountsReceivable: number;
  accountsPayable: number;
  netDailyProfit: number;
}

export interface MonthlyReport {
  month: string;
  totalRevenue: number;
  previousMonthRevenue: number;
  growthRate: number;
  topAirlines: { name: string, total: number, count: number }[];
  topAgents: { name: string, total: number, commission: number }[];
  costAnalysis: { label: string, amount: number, percentage: number }[];
  netMonthlyProfit: number;
}

export interface BalanceSheetReport {
  timestamp: string;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  currentAssets: number;
  currentLiabilities: number;
  ratios: {
    liquidityRatio: number;
    debtRatio: number;
    returnOnInvestment: number;
  };
  assetBreakdown: { label: string, amount: number }[];
  liabilityBreakdown: { label: string, amount: number }[];
}

// Financial Types (Legacy/Partial)
export interface JournalEntryPayload {
  description: string;
  amount: number;
  debitAccountCode: string;
  creditAccountCode: string;
  bookingId?: string;
}

// AI Extraction Result
export interface PassportOCRResult {
  firstName: string;
  lastName: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string; // ISO String
  expiryDate: string;  // ISO String
  mrzRaw?: string;
  confidence: number;
}
