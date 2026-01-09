
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Add ChevronRight to the lucide-react imports to fix the error on line 148
import { Globe, ShieldCheck, Loader2, Mail, Lock, ChevronLeft, ChevronRight, ArrowRight, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginView = ({ onClose }: any) => {
  const { login } = useAuth();
  const [view, setView] = useState<'options' | 'email'>('options');
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', pass: '' });

  // منطق تسجيل الدخول بـ Google
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // محاكاة الاتصال بخدمات Google Auth
      await new Promise(r => setTimeout(r, 1500));
      await login({ username: 'user@gmail.com', pass: 'google_oauth_token' });
      
      checkPendingAndRedirect();
    } catch (e) {
      alert("فشل المصادقة عبر Google");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ username: credentials.email, pass: credentials.pass });
      checkPendingAndRedirect();
    } catch (e) {
      alert("بيانات الدخول غير صحيحة");
    } finally {
      setIsLoading(false);
    }
  };

  const checkPendingAndRedirect = () => {
    const pending = localStorage.getItem('pending_booking_data');
    if (pending) {
      // إشعار المستخدم بأنه سيتم توجيهه للدفع
      window.location.reload(); // سيقوم App.tsx بالتعرف على الجلسة وتوجيهه لصفحة الدفع فوراً
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-[#002366]/95 backdrop-blur-2xl p-6">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-[4rem] w-full max-w-2xl shadow-massive overflow-hidden border-8 border-white/10"
      >
        {/* Header - Enterprise Navy */}
        <div className="bg-[#002366] p-16 text-center relative overflow-hidden border-b-8 border-[#C5A059]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px]"></div>
          <motion.div 
            initial={{ rotate: -10 }} animate={{ rotate: 0 }}
            className="w-24 h-24 bg-gradient-to-br from-amber-400 to-[#C5A059] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl relative z-10"
          >
             <ShieldCheck size={48} className="text-[#002366]" />
          </motion.div>
          <h2 className="text-4xl font-black text-white relative z-10 tracking-tight">هوية STAMS الموحدة</h2>
          <p className="text-indigo-200 font-bold text-sm mt-3 opacity-80 uppercase tracking-widest">Aero Intelligence Secure Access</p>
        </div>

        <div className="p-16">
          <AnimatePresence mode="wait">
            {view === 'options' ? (
              <motion.div 
                key="options" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }}
                className="space-y-8"
              >
                <button 
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between p-8 rounded-3xl border-4 border-slate-50 hover:border-blue-600 transition-all group bg-white shadow-xl hover:shadow-blue-500/10"
                >
                  <div className="flex items-center gap-6">
                    {isLoading ? <Loader2 className="animate-spin text-blue-600" size={28} /> : <Globe size={32} className="text-blue-600" />}
                    <div className="text-right">
                       <p className="font-black text-slate-700 text-xl">المتابعة عبر حساب Google</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase">دخول آمن وسريع للعملاء</p>
                    </div>
                  </div>
                  <ArrowRight className="text-slate-200 group-hover:text-blue-600 group-hover:translate-x-[-10px] transition-all" size={24} />
                </button>

                <div className="relative py-4 flex items-center gap-6">
                  <div className="flex-1 border-t-2 border-slate-100"></div>
                  <span className="text-[10px] text-slate-300 font-black uppercase tracking-[0.3em]">أو دخول الشركاء</span>
                  <div className="flex-1 border-t-2 border-slate-100"></div>
                </div>

                <button 
                  onClick={() => setView('email')}
                  className="w-full p-8 rounded-3xl bg-slate-50 flex items-center justify-between group hover:bg-[#002366] transition-all shadow-md"
                >
                   <div className="text-right flex items-center gap-6">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#002366] shadow-sm group-hover:scale-110 transition-transform">
                         <UserCheck size={24} />
                      </div>
                      <div>
                        <p className="font-black text-[#002366] text-xl group-hover:text-white transition-colors">بوابة الموظفين والوكلاء</p>
                        <p className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-200 transition-colors uppercase">Enterprise Partner Login</p>
                      </div>
                   </div>
                   <ArrowRight className="text-slate-300 group-hover:text-white group-hover:translate-x-[-10px] transition-all" size={24} />
                </button>
                
                <div className="text-center pt-8">
                  <button onClick={onClose} className="text-slate-300 font-black text-xs hover:text-rose-500 transition-colors flex items-center gap-2 mx-auto">
                    <ChevronLeft size={14} /> العودة والبحث عن رحلة أخرى
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form 
                key="email" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }}
                onSubmit={handleEmailLogin} className="space-y-8"
              >
                <button type="button" onClick={() => setView('options')} className="flex items-center gap-3 text-sm font-black text-indigo-600 mb-6 hover:gap-5 transition-all">
                   <ChevronLeft size={20} /> العودة لخيارات الدخول
                </button>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-4">البريد الإلكتروني المعتمد</label>
                    <div className="relative">
                      <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                      <input type="email" required className="w-full bg-slate-50 p-6 pr-16 rounded-[2rem] font-bold outline-none border-4 border-transparent focus:border-[#002366] focus:bg-white transition-all text-lg shadow-inner" placeholder="name@agency.com" onChange={e=>setCredentials({...credentials, email: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-4">كلمة المرور</label>
                    <div className="relative">
                      <Lock className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                      <input type="password" required className="w-full bg-slate-50 p-6 pr-16 rounded-[2rem] font-bold outline-none border-4 border-transparent focus:border-[#002366] focus:bg-white transition-all text-lg shadow-inner" placeholder="••••••••" onChange={e=>setCredentials({...credentials, pass: e.target.value})} />
                    </div>
                  </div>
                </div>

                <button disabled={isLoading} className="w-full bg-[#002366] text-[#C5A059] py-7 rounded-[2.5rem] font-black text-2xl shadow-massive hover:bg-black transition-all flex items-center justify-center gap-4 group">
                  {isLoading ? <Loader2 className="animate-spin" /> : <>دخول النظام والتحقق <ChevronRight className="group-hover:translate-x-[-5px] transition-transform" /></>}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginView;
