
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Globe, Mail, Lock, Loader2, ArrowRight, ChevronLeft } from 'lucide-react';

/**
 * Universal Login Page
 * تدعم العملاء عبر Google والشركاء عبر النظام الموحد
 */
const LoginPage = ({ onLogin, onBackToHome }: any) => {
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({ user: '', pass: '' });

  const handlePartnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      onLogin(credentials.user, credentials.pass);
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#002366]/10 rounded-full blur-[120px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-slate-100"
      >
        {/* Left Identity Section */}
        <div className="bg-[#002366] md:w-5/12 p-12 text-white flex flex-col justify-center relative">
          <div className="z-10">
            <div className="w-16 h-16 bg-[#C5A059] rounded-2xl flex items-center justify-center mb-8 shadow-xl">
              <ShieldCheck size={32} className="text-[#002366]" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter mb-4">STAMS <span className="text-amber-500">HUB</span></h1>
            <p className="text-sm font-medium text-indigo-200 leading-relaxed max-w-xs">
              منظومة الربط الرقمي الموحد لإصدار تذاكر الطيران وإدارة العمليات المالية الذكية.
            </p>
          </div>
          {/* Animated decorative circles */}
          <div className="absolute top-0 right-0 w-full h-full opacity-10">
            <div className="absolute top-10 right-10 w-24 h-24 border border-white rounded-full"></div>
            <div className="absolute top-20 right-20 w-40 h-40 border border-white rounded-full"></div>
          </div>
        </div>

        {/* Right Interaction Section */}
        <div className="flex-1 p-10 md:p-20 bg-white flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {step === 'role' ? (
              <motion.div 
                key="role-selection"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div>
                  <h2 className="text-3xl font-black text-[#002366] mb-2">تسجيل الدخول</h2>
                  <p className="text-slate-400 font-bold text-sm">مرحباً بك مجدداً، يرجى تحديد نوع حسابك للبدء.</p>
                </div>

                <div className="grid gap-4">
                  <button 
                    onClick={() => onLogin('customer@google.com', 'google')}
                    className="w-full flex items-center justify-between p-6 rounded-2xl border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50/50 transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <Globe size={24} className="text-blue-600" />
                      <span className="font-black text-slate-700">الدخول عبر حساب Google</span>
                    </div>
                    <ArrowRight size={20} className="text-slate-300 group-hover:text-blue-600" />
                  </button>

                  <div className="relative py-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                    <div className="relative flex justify-center text-[10px]"><span className="px-4 bg-white text-slate-300 font-black uppercase tracking-widest">أو عبر المنظومة</span></div>
                  </div>

                  <RoleOption 
                    label="لوحة إدارة النظام (Admin)" 
                    sub="التحكم الكامل والعمليات المحاسبية" 
                    onClick={() => { setRole('ADMIN'); setStep('form'); }} 
                  />
                  <RoleOption 
                    label="بوابة وكلاء المبيعات" 
                    sub="حجز التذاكر وإدارة المحفظة" 
                    onClick={() => { setRole('AGENT'); setStep('form'); }} 
                  />
                  <RoleOption 
                    label="لوحة مزودي الخدمة" 
                    sub="إدارة المخزون وتأكيد الطلبات" 
                    onClick={() => { setRole('PROVIDER'); setStep('form'); }} 
                  />
                </div>
              </motion.div>
            ) : (
              <motion.form 
                key="login-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handlePartnerLogin}
                className="space-y-8"
              >
                <button 
                  type="button" 
                  onClick={() => setStep('role')}
                  className="flex items-center gap-2 text-xs font-black text-blue-600 hover:underline"
                >
                  <ChevronLeft size={16} /> العودة لاختيار الحساب
                </button>

                <div>
                  <h2 className="text-3xl font-black text-[#002366]">دخول الشركاء</h2>
                  <p className="text-slate-400 font-bold text-sm mt-1">سجل الدخول بصفتك {role === 'ADMIN' ? 'مدير نظام' : 'شريك معتمد'}</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">اسم المستخدم / البريد</label>
                    <div className="relative">
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                      <input 
                        type="text" 
                        required
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-[#002366] p-5 pr-14 rounded-2xl font-bold outline-none transition-all"
                        placeholder="username"
                        onChange={e => setCredentials({...credentials, user: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">كلمة المرور</label>
                    <div className="relative">
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                      <input 
                        type="password" 
                        required
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-[#002366] p-5 pr-14 rounded-2xl font-bold outline-none transition-all"
                        placeholder="••••••••"
                        onChange={e => setCredentials({...credentials, pass: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <button 
                  disabled={isLoading}
                  className="w-full bg-[#002366] text-white py-6 rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : 'تسجيل الدخول الآن'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

const RoleOption = ({ label, sub, onClick }: any) => (
  <button 
    onClick={onClick}
    className="w-full text-right p-6 rounded-2xl bg-slate-50 border-2 border-transparent hover:border-[#002366] hover:bg-white transition-all group flex items-center justify-between"
  >
    <div>
      <p className="font-black text-[#002366] text-lg">{label}</p>
      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{sub}</p>
    </div>
    <ArrowRight size={20} className="text-slate-300 group-hover:text-[#002366] transition-transform group-hover:translate-x-1" />
  </button>
);

export default LoginPage;
