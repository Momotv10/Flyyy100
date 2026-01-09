
import React, { useState, useEffect } from 'react';
// Fix: Import Ticket icon from lucide-react and move User type import to types.ts
import { User } from '../types';
import { Plane, User as UserIcon, LogOut, Briefcase, Ticket } from 'lucide-react';

interface Props {
  user: User | null;
  onLogout: () => void;
  onLoginClick: () => void;
  onMyBookings: () => void;
  onMyProfile: () => void;
  currency: string;
  setCurrency: (c: string) => void;
}

const Navigation: React.FC<Props> = ({ user, onLogout, onLoginClick, onMyBookings, onMyProfile, currency, setCurrency }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-[150] transition-all duration-300 ${isScrolled ? 'bg-[#002366] shadow-lg' : 'bg-transparent'}`}>
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = '/'}>
          <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
            <Plane size={18} className="text-[#002366]" />
          </div>
          <div className="flex flex-col">
            <span className="text-white text-lg font-black tracking-tight leading-none">STAMS</span>
            <span className="text-amber-500 text-[8px] font-bold uppercase tracking-widest">Enterprise Pro</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-white/10 text-white text-[10px] font-bold px-3 py-1 rounded border border-white/20 outline-none cursor-pointer"
          >
            <option value="USD">USD</option>
            <option value="YER">YER</option>
          </select>

          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 bg-white text-[#002366] px-4 py-2 rounded text-xs font-bold shadow-sm"
              >
                <UserIcon size={14} />
                {user.name}
              </button>
              
              {showDropdown && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded shadow-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 bg-slate-50 border-b">
                     <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">الحساب النشط</p>
                     <p className="font-bold text-[#002366] text-xs">{user.name}</p>
                  </div>
                  <div className="p-2">
                     <NavItem onClick={() => {onMyProfile(); setShowDropdown(false);}} label="الملف الشخصي" icon={<Briefcase size={14} />} />
                     <NavItem onClick={() => {onMyBookings(); setShowDropdown(false);}} label="حجوزاتي" icon={<Ticket size={14} />} />
                     <hr className="my-1 border-slate-100" />
                     <NavItem onClick={() => {onLogout(); setShowDropdown(false);}} label="خروج آمن" icon={<LogOut size={14} />} color="text-rose-600" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className="bg-amber-500 text-[#002366] px-6 py-2 rounded text-xs font-bold transition-all hover:bg-amber-400 shadow-md"
            >
              دخول النظام
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

const NavItem = ({ label, icon, onClick, color }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 p-2 rounded hover:bg-slate-50 transition-all font-bold text-xs ${color || 'text-slate-600'}`}>
     {icon}
     <span>{label}</span>
  </button>
);

export default Navigation;
