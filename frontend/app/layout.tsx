
import React, { ReactNode } from 'react';
import Navigation from '../components/Navigation';
import { User, UserRole } from '../types';

interface Props {
  children: ReactNode;
  user: User | null;
  onLogout: () => void;
  onLoginClick: () => void;
  currency: string;
  setCurrency: (c: string) => void;
}

/**
 * Global Enterprise Layout
 * يضمن الهوية البصرية الموحدة (Navy/Gold) لجميع الصفحات
 */
const RootLayout: React.FC<Props> = ({ 
  children, 
  user, 
  onLogout, 
  onLoginClick, 
  currency, 
  setCurrency 
}) => {
  const isDashboard = user && [UserRole.ADMIN, UserRole.AGENT, UserRole.PROVIDER].includes(user.role);

  return (
    <div className="min-h-screen bg-[#F4F7FA] font-tajawal text-[#002366] antialiased">
      {/* التنقل العالمي - يختفي في لوحات التحكم لتوفير مساحة العمل */}
      {!isDashboard && (
        <Navigation 
          user={user} 
          onLogout={onLogout} 
          onLoginClick={onLoginClick} 
          onMyBookings={() => {}} 
          onMyProfile={() => {}} 
          currency={currency} 
          setCurrency={setCurrency} 
        />
      )}
      
      <main className={`${!isDashboard ? 'pt-24' : ''}`}>
        {children}
      </main>

      {/* Enterprise Footer for Public Pages */}
      {!isDashboard && (
        <footer className="bg-[#001a4d] text-white py-16 mt-20">
          <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-4">
              <h3 className="text-2xl font-black tracking-tight">STAMS</h3>
              <p className="text-xs text-indigo-200/60 leading-relaxed">
                منظومة الربط التشغيلي الموحد لقطاع الطيران في الشرق الأوسط. حلول متكاملة للوكالات وشركات الطيران.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-amber-500 mb-6">المنتجات</h4>
              <ul className="space-y-3 text-sm text-indigo-100/80">
                <li><a href="#" className="hover:text-amber-500">حجز الطيران</a></li>
                <li><a href="#" className="hover:text-amber-500">بوابة الوكلاء</a></li>
                <li><a href="#" className="hover:text-amber-500">حلول الربط API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-amber-500 mb-6">الدعم</h4>
              <ul className="space-y-3 text-sm text-indigo-100/80">
                <li><a href="#" className="hover:text-amber-500">مركز المساعدة</a></li>
                <li><a href="#" className="hover:text-amber-500">سياسات الإلغاء</a></li>
                <li><a href="#" className="hover:text-amber-500">اتصل بنا</a></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="font-bold text-amber-500 mb-2">النشرة الإخبارية</h4>
              <div className="flex gap-2">
                <input type="email" placeholder="بريدك الإلكتروني" className="bg-white/5 border border-white/10 p-3 rounded-lg flex-1 text-xs outline-none focus:border-amber-500" />
                <button className="bg-amber-500 text-[#002366] px-4 rounded-lg font-black text-xs">اشتراك</button>
              </div>
            </div>
          </div>
          <div className="container mx-auto px-6 border-t border-white/5 mt-16 pt-8 text-center text-[10px] text-white/20 font-bold uppercase tracking-widest">
            © 2024 STAMS AERO INTELLIGENCE. ALL RIGHTS RESERVED.
          </div>
        </footer>
      )}
    </div>
  );
};

export default RootLayout;
