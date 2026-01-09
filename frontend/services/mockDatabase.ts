
import { 
  User, UserRole, Airline, Flight, Booking,
  JournalEntry, AgentProfile, Account, Provider, 
  UserProfile, SavedPassenger, AirlineStaff, PaymentGatewayConfig,
  SubCustomer
} from '../types';
import { accountingService } from './accountingService';

const DB_KEY = 'stams_enterprise_v18';

class MockDB {
  private users: User[] = [];
  private airlines: Airline[] = [];
  private flights: Flight[] = [];
  private bookings: Booking[] = [];
  private journalEntries: JournalEntry[] = [];
  private accounts: Account[] = [];
  private agentProfiles: AgentProfile[] = [];
  private providers: Provider[] = [];
  private userProfiles: UserProfile[] = [];
  private subCustomers: SubCustomer[] = []; 

  private paymentGateways: PaymentGatewayConfig[] = [
    { id: 'gw-1', name: 'جوالي - Jawaly', logo: '📱', isActive: true },
    { id: 'gw-2', name: 'ون كاش - OneCash', logo: '💸', isActive: true },
    { id: 'gw-3', name: 'كريمي كاش', logo: '🏦', isActive: true }
  ];

  constructor() {
    (window as any).db = this;
    this.load();
    if (this.users.length === 0 || this.flights.length === 0) {
       this.seed();
    }
    accountingService.initializeChartOfAccounts();
  }

  private load() {
    const data = localStorage.getItem(DB_KEY);
    if (data) {
      const p = JSON.parse(data);
      this.users = p.users || [];
      this.airlines = p.airlines || [];
      this.flights = p.flights || [];
      this.bookings = p.bookings || [];
      this.journalEntries = p.journalEntries || [];
      this.accounts = p.accounts || [];
      this.agentProfiles = p.agentProfiles || [];
      this.providers = p.providers || [];
      this.userProfiles = p.userProfiles || [];
      this.subCustomers = p.subCustomers || [];
    }
  }

  private save() {
    localStorage.setItem(DB_KEY, JSON.stringify({
      users: this.users,
      airlines: this.airlines,
      flights: this.flights,
      bookings: this.bookings,
      journalEntries: this.journalEntries,
      accounts: this.accounts,
      agentProfiles: this.agentProfiles,
      providers: this.providers,
      userProfiles: this.userProfiles,
      subCustomers: this.subCustomers
    }));
  }

  private seed() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const tomorrowDate = new Date(now);
    tomorrowDate.setDate(now.getDate() + 1);
    const tomorrow = tomorrowDate.toISOString().split('T')[0];

    this.users = [
      { id: 'u-admin', username: 'admin', name: 'مدير النظام', role: UserRole.ADMIN, balance: 0, createdAt: new Date().toISOString() },
      { id: 'u-agent', username: 'agent', name: 'وكالة الأفق', role: UserRole.AGENT, balance: 50000, createdAt: new Date().toISOString() },
      { id: 'u-pro', username: 'pro', name: 'طيران بلقيس (مزود)', role: UserRole.PROVIDER, balance: 0, createdAt: new Date().toISOString() }
    ];

    this.airlines = [
      { id: 'air-1', name: 'طيران بلقيس', iata: 'BQ', country: 'اليمن', isActive: true, systemCommission: 10, issueStaff: [], logo: 'https://stams.ai/assets/logos/bilqis.png' },
      { id: 'air-2', name: 'الخطوط الجوية اليمنية', iata: 'IY', country: 'اليمن', isActive: true, systemCommission: 8, issueStaff: [], logo: 'https://stams.ai/assets/logos/yemenia.png' }
    ];

    this.flights = [
      {
        id: 'fl-dxb-ade-today-1',
        flightNumber: 'BQ-502',
        airlineId: 'air-1',
        providerId: 'u-pro',
        departureAirport: 'DXB',
        arrivalAirport: 'ADE',
        departureTerminal: '2',
        arrivalTerminal: '1',
        aircraftType: 'Airbus A320',
        departureTime: `${today}T14:30:00Z`,
        arrivalTime: `${today}T17:00:00Z`,
        departureTimeFormatted: '14:30',
        arrivalTimeFormatted: '17:00',
        durationMinutes: 150,
        timeZoneOffset: 0,
        departureDate: today,
        arrivalDate: today,
        prices: { cost: 300, selling: 380, agentCommission: 20, systemTax: 10, systemNetProfit: 50 },
        seats: { economy: 45, business: 8, first: 0 },
        isRoundTrip: false,
        status: 'active',
        createdAt: new Date().toISOString(),
        classes: {
          economy: { seats: 45, costPrice: 300, agentCommission: 20, systemCommission: 10, sellingPrice: 380 },
          business: { seats: 8, costPrice: 550, agentCommission: 50, systemCommission: 30, sellingPrice: 750 },
          first: { seats: 0, costPrice: 0, agentCommission: 0, systemCommission: 0, sellingPrice: 0 }
        }
      }
    ];
    this.save();
  }

  getFlights() { return this.flights; }
  getAirlines() { return this.airlines; }
  getAgents() { return this.users.filter(u => u.role === UserRole.AGENT); }
  getAgentProfile(userId: string) { return this.agentProfiles.find(p => p.userId === userId); }
  getProviders() { return this.providers; }
  getProviderById(uid: string) { return this.providers.find(p => p.userId === uid); }
  getProviderFlights(uid: string) { return this.flights.filter(f => f.providerId === uid); }
  getSubCustomers(agentId: string) { return this.subCustomers.filter(c => c.agentId === agentId); }
  addSubCustomer(customer: SubCustomer) { this.subCustomers.push(customer); this.save(); }
  getSavedPassengers(uid: string) { return this.getUserProfile(uid).savedPassports; }

  // Fix: Added getAdminStats to resolve error in AdminDashboard component
  getAdminStats() {
    const today = new Date().toISOString().split('T')[0];
    return {
      bookingsToday: this.bookings.filter(b => b.createdAt.startsWith(today)).length,
      activeAgents: this.users.filter(u => u.role === UserRole.AGENT).length
    };
  }

  // Fix: Added getAgentDashboardStats to resolve error in AgentDashboard component
  getAgentDashboardStats(agentId: string) {
    const agentBookings = this.bookings.filter(b => b.customerId === agentId);
    return {
      monthlySales: agentBookings.reduce((sum, b) => sum + b.totalAmount, 0),
      totalBookings: agentBookings.length,
      monthlyCommission: agentBookings.reduce((sum, b) => sum + (b.financialsSnapshot?.agentCommission || 0), 0),
      activeCustomers: this.subCustomers.filter(c => c.agentId === agentId).length
    };
  }

  getProviderStats(uid: string) {
    const flightIds = this.getProviderFlights(uid).map(f => f.id);
    const providerBookings = this.bookings.filter(b => flightIds.includes(b.flightId));
    return {
      totalSales: providerBookings.reduce((s, b) => s + (b.financialsSnapshot?.costPrice || 0), 0),
      activeOrders: providerBookings.filter(b => b.status === 'awaiting_issue').length,
      totalFlights: flightIds.length,
      balance: this.getAccount(`2103-${uid.slice(-4)}`)?.balance || 0
    };
  }

  addFlight(flight: Flight) { this.flights.push(flight); this.save(); }
  deleteFlight(id: string) { this.flights = this.flights.filter(f => f.id !== id); this.save(); }
  addAirline(airline: Airline) { this.airlines.push(airline); accountingService.createSubAccount('2100', `ذمم شركة: ${airline.name}`, airline.id); this.save(); }

  addAgent(userData: any, profileData: any) {
    const userId = `u-agent-${Date.now()}`;
    this.users.push({ id: userId, username: userData.username, name: profileData.responsiblePerson, role: UserRole.AGENT, phone: userData.phone, balance: 0, createdAt: new Date().toISOString() });
    this.agentProfiles.push({ ...profileData, userId, apiEnabled: false, commissionRate: 5 });
    accountingService.registerAgentAccount(profileData.companyName, userId);
    this.save();
  }

  addProvider(providerData: any, username: string) {
    const userId = `u-pro-${Date.now()}`;
    this.users.push({ id: userId, username, name: providerData.name, role: UserRole.PROVIDER, phone: providerData.phone, email: providerData.email, balance: 0, createdAt: new Date().toISOString() });
    this.providers.push({ ...providerData, id: `pro-${Date.now()}`, userId, isActive: true, createdAt: new Date().toISOString() });
    this.addAccount({ id: `2103-${userId.slice(-4)}`, name: `حساب مزود: ${providerData.name}`, type: 'liability', category: 'current', balance: 0, parentId: '2100', isSystem: false });
    this.save();
  }

  // تم إصلاح: إزالة الإرسال التلقائي للواتساب من هنا لمنع "الشاشة السوداء" في المسودات
  addBooking(booking: Booking) {
    this.bookings.push(booking);
    this.save();
  }

  updateBookingStatus(bid: string, updates: Partial<Booking>) {
    const idx = this.bookings.findIndex(b => b.id === bid);
    if (idx !== -1) {
      this.bookings[idx] = { ...this.bookings[idx], ...updates };
      this.save();
    }
  }

  issueTicket(bid: string, pnr: string, tkt: string, url: string) {
    const b = this.bookings.find(x => x.id === bid);
    if (b) {
      b.status = 'ready'; b.pnr = pnr; b.ticketNumber = tkt; b.ticketFileUrl = url; b.issuedAt = new Date().toISOString();
      this.save();
    }
  }

  getAccounts() { return this.accounts; }
  getAccount(id: string) { return this.accounts.find(a => a.id === id); }
  addAccount(acc: Account) { this.accounts.push(acc); this.save(); }
  
  updateAccountBalance(id: string, dr: number, cr: number) {
    const acc = this.getAccount(id);
    if (acc) {
      if (acc.type === 'asset' || acc.type === 'expense') acc.balance += (dr - cr);
      else acc.balance += (cr - dr);
      if (id.startsWith('2200-')) {
         const user = this.users.find(u => u.id.slice(-4) === id.slice(-4));
         if (user) user.balance = acc.balance;
      }
      this.save();
    }
  }
  
  getJournalEntries() { return this.journalEntries; }
  addJournalEntry(e: JournalEntry) { this.journalEntries.unshift(e); this.save(); }
  getBookings() { return this.bookings; }
  getUserBookings(uid: string) { return this.bookings.filter(b => b.customerId === uid); }
  
  getUserProfile(uid: string): UserProfile {
    let p = this.userProfiles.find(x => x.userId === uid);
    if (!p) { p = { userId: uid, savedPassports: [] }; this.userProfiles.push(p); this.save(); }
    return p;
  }

  // Fix: Added updateUserProfile to resolve error in MyProfileView component
  updateUserProfile(uid: string, data: Partial<UserProfile>) {
    const profile = this.getUserProfile(uid);
    Object.assign(profile, data);
    this.save();
  }

  login(u: string, p: string, name?: string) {
    let user = this.users.find(x => x.username === u);
    if (!user && name) {
      user = { id: `u-${Date.now()}`, username: u, name, role: UserRole.CUSTOMER, balance: 0, createdAt: new Date().toISOString() };
      this.users.push(user); this.save();
    }
    return user || null;
  }
}

export const db = new MockDB();
