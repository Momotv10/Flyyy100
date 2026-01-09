
import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserRole, Flight } from './types';
import Navigation from './components/Navigation';
import HomeView from './components/HomeView';
import ResultsView from './components/ResultsView';
import TravelerEntryView from './components/TravelerEntryView';
import PaymentPage from './app/checkout/payment/page';
import LoginPage from './app/auth/login/page';
import CustomerBookingsPage from './app/customer/bookings/page';
import BookingStatusView from './components/BookingStatusView';
import AdminDashboard from './components/AdminDashboard';
import ProviderDashboard from './components/ProviderDashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const [view, setView] = useState<'login' | 'search' | 'results' | 'booking' | 'payment' | 'bookings_list' | 'admin' | 'supplier' | 'success'>('login');
  const [searchResults, setSearchResults] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [finalBookingId, setFinalBookingId] = useState<string>('');

  // 🛡️ توجيه الأدوار الذكي
  useEffect(() => {
    if (!isAuthLoading && user) {
      if (user.role === UserRole.ADMIN) setView('admin');
      else if (user.role === UserRole.PROVIDER || user.role === UserRole.SUPPLIER) setView('supplier');
      else if (view === 'login') setView('search');
    } else if (!isAuthLoading && !user) {
      setView('login');
    }
  }, [user, isAuthLoading]);

  if (isAuthLoading) return (
    <div className="h-screen bg-[#001a4d] flex flex-col items-center justify-center text-white font-tajawal">
       <Loader2 className="animate-spin mb-6 text-amber-500" size={64} />
       <p className="text-xl font-black tracking-widest animate-pulse">جاري تأمين الاتصال...</p>
    </div>
  );

  if (view === 'admin') return <AdminDashboard onBack={logout} />;
  if (view === 'supplier') return <ProviderDashboard user={user!} onBack={logout} />;

  return (
    <div className="min-h-screen bg-[#F4F7FA] font-tajawal text-[#002366]" dir="rtl">
      {view !== 'login' && (
        <Navigation 
          user={user} 
          onLogout={logout} 
          onLoginClick={() => setView('login')} 
          currency="USD"
          setCurrency={() => {}}
          onMyBookings={() => setView('bookings_list')}
          onMyProfile={() => {}}
        />
      )}
      
      <main className={`${view !== 'login' ? 'pt-24 pb-20' : ''}`}>
        {view === 'login' && <LoginPage onLoginSuccess={() => {}} />}

        {view === 'search' && (
          <HomeView 
            onSearch={(res) => { setSearchResults(res); setView('results'); }} 
            onBookingStart={(f) => { setSelectedFlight(f); setView('booking'); }} 
            currency="USD" 
          />
        )}

        {view === 'results' && (
          <ResultsView 
            flights={searchResults} 
            onBook={(f) => { setSelectedFlight(f); setView('booking'); }} 
            onModifySearch={() => setView('search')} 
          />
        )}

        {view === 'booking' && selectedFlight && (
          <TravelerEntryView 
            flight={selectedFlight} 
            onConfirm={() => setView('payment')} 
            onBack={() => setView('results')} 
          />
        )}

        {view === 'payment' && (
          <PaymentPage 
            onCancel={() => setView('search')}
            onSuccess={(bid: string) => { 
              setFinalBookingId(bid); 
              setView('success'); 
            }}
          />
        )}

        {view === 'success' && finalBookingId && (
          <BookingStatusView bookingId={finalBookingId} onFinish={() => setView('bookings_list')} />
        )}

        {view === 'bookings_list' && user && (
          <CustomerBookingsPage user={user} onNewBooking={() => setView('search')} />
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
